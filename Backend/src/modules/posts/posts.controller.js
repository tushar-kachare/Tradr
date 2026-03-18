const prisma = require("../../config/db");

const createPost = async (req, res) => {
  // frontend should send => {content? , tradeId? , originalPostId?, mediaUrls?}
  try {
    const userId = req.user.userId;
    const { content, tradeId, originalPostId, mediaUrls } = req.body;

    if (tradeId) {
      // it is repost on trade
      if (originalPostId) {
        return res.status(400).json({
          success: false,
          message: "Cannot share a trade and repost at same time",
        });
      }

      // check trade exist and not deleted
      const trade = await prisma.trade.findFirst({
        where: { id: tradeId, isDeleted: false },
      });

      if (!trade) {
        return res.status(404).json({
          success: false,
          message: "Trade not found.",
        });
      }
      // remember trade can be reposted by anyone

      const [post] = await prisma.$transaction([
        prisma.post.create({
          data: {
            userId,
            content: content || null,
            mediaUrls,
            tradeId,
            postType: "post",
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { postsCount: { increment: 1 } },
        }),
      ]);

      return res.status(201).json({
        success: true,
        message: "Trade shared successfully",
        post,
      });
    }

    // reposts
    if (originalPostId) {
      // check original post exists and is not deleted
      const originalPost = await prisma.post.findFirst({
        where: { id: originalPostId, isDeleted: false },
      });

      if (!originalPost) {
        return res.status(404).json({
          success: false,
          message: "Original post not found.",
        });
      }

      // prevent duplicate repost — user can only repost same post once
      const alreadyReposted = await prisma.post.findFirst({
        where: {
          userId,
          originalPostId,
          postType: "repost",
          isDeleted: false,
        },
      });

      if (alreadyReposted) {
        return res.status(409).json({
          success: false,
          message: "You have already reposted this post.",
        });
      }

      // ✅ atomic — create repost + increment repostsCount on original + increment postsCount on user
      const [post] = await prisma.$transaction([
        prisma.post.create({
          data: {
            userId,
            content: content || null,
            mediaUrls,
            originalPostId,
            postType: "repost",
          },
        }),
        prisma.post.update({
          where: { id: originalPostId },
          data: { repostsCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { postsCount: { increment: 1 } },
        }),
      ]);

      return res.status(201).json({
        success: true,
        message: "Post reposted successfully.",
        post,
      });
    }
    // regular post

    if (!content?.trim() && mediaUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post must have content or at least one media file",
      });
    }

    // ✅ atomic — create post + increment postsCount
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          userId,
          content: content?.trim() || null,
          mediaUrls,
          postType: "post",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { postsCount: { increment: 1 } },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Post created Successfully",
      post,
    });
  } catch (err) {
    console.error("createPost error: ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;

    const post = await prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }
    // only owner can delete
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts.",
      });
    }

    const operations = [
      // soft delete the post
      prisma.post.update({
        where: { id: postId },
        data: { isDeleted: true },
      }),
      // decrement postsCount on the author
      prisma.user.update({
        where: { id: userId },
        data: { postsCount: { decrement: 1 } },
      }),
    ];

    // if it was a repost, decrement repostsCount on original post
    if (post.postType === "repost" && post.originalPostId) {
      operations.push(
        prisma.post.update({
          where: { id: post.originalPostId },
          data: { repostsCount: { decrement: 1 } },
        }),
      );
    }

    await prisma.$transaction(operations);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // get all userIds that current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    const feedUserIds = [...followingIds, userId];

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: feedUserIds },
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        trade: true,
        originalPost: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            trade: true,
          },
        },
      },
    });

    const total = await prisma.post.count({
      where: {
        userId: { in: feedUserIds },
        isDeleted: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Feed fetched successfully.",
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getFeed error: ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getExplore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        trade: true,
        originalPost: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            trade: true,
          },
        },
      },
    });

    const total = await prisma.post.count({
      where: {
        isDeleted: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Explore feed fetched successfully.",
      data: posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getExplore error: ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const requestingUserId = req.user?.userId ?? null;

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
      },
      include: {
        // author of post
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
          },
        },
        // original post and it is trade share
        trade: {
          where: { isDeleted: false },
          select: {
            id: true,
            coinSymbol: true,
            coinName: true,
            tradeType: true,
            status: true,
            entryPrice: true,
            targetPrice: true,
            stopLoss: true,
            currentPrice: true,
            profitLoss: true,
            strategy: true,
            holdTime: true,
            closedAt: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
        },
        // If postType == 'repost' - atach original post
        originalPost: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                role: true,
                isVerified: true,
              },
            },
            // Trade attached to original post (if it was trade share)
            trade: {
              where: { isDeleted: false },
              select: {
                id: true,
                coinSymbol: true,
                coinName: true,
                tradeType: true,
                status: true,
                entryPrice: true,
                targetPrice: true,
                stopLoss: true,
                currentPrice: true,
                profitLoss: true,
                strategy: true,
                holdTime: true,
                closedAt: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    isVerified: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // // Check isLiked / isBookmarked if user is logged in
    // let isLiked = false;
    // let isBookmarked = false;

    // if (requestingUserId) {
    //   const [like, bookmark] = await Promise.all([
    //     prisma.like.findUnique({
    //       where: {
    //         userId_postId: {
    //           userId: requestingUserId,
    //           postId: post.id,
    //         },
    //       },
    //     }),
    //     prisma.bookmark.findUnique({
    //       where: {
    //         userId_postId: {
    //           userId: requestingUserId,
    //           postId: post.id,
    //         },
    //       },
    //     }),
    //   ]);

    //   isLiked = !!like;
    //   isBookmarked = !!bookmark;
    // }

    // Shape the original post if this is a repost
    const originalPost = post.originalPost
      ? {
          id: post.originalPost.id,
          content: post.originalPost.content,
          mediaUrls: post.originalPost.mediaUrls,
          postType: post.originalPost.postType,
          likesCount: post.originalPost.likesCount,
          commentsCount: post.originalPost.commentsCount,
          repostsCount: post.originalPost.repostsCount,
          bookmarksCount: post.originalPost.bookmarksCount,
          createdAt: post.originalPost.createdAt,
          user: post.originalPost.user,
          trade: post.originalPost.trade ?? null,
        }
      : null;

    return res.status(200).json({
      post: {
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        postType: post.postType,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        repostsCount: post.repostsCount,
        bookmarksCount: post.bookmarksCount,
        createdAt: post.createdAt,
        user: post.user,
        trade: post.trade ?? null,
        originalPost,
        // isLiked,
        // isBookmarked,
      },
    });
  } catch (err) {
    console.error("getPostById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { postId } = req.params;
    const { content, mediaUrls } = req.body;
    if (!content && !mediaUrls) {
      return res.status(400).json({
        success: false,
        message: "Provide content or mediaUrls.",
      });
    }

    const post = await prisma.post.findFirst({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // only owner can edit post
    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts.",
      });
    }

    // build update object
    const updateData = {};
    if (content !== undefined) updateData.content = content.trim() || null;
    if (mediaUrls !== undefined) updateData.mediaUrls == mediaUrls;

    // prevent emptying both fields at once
    const finalContent = updateData.content ?? post.content;
    const finalMediaUrls = updateData.mediaUrls ?? post.mediaUrls;

    if (!finalContent && finalMediaUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post must have content or at least one media file.",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost,
    });
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getFeed,
  getExplore,
  getPost,
  updatePost,
};
