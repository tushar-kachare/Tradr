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

      const post = await prisma.post.create({
        data: {
          userId,
          content: content || null,
          mediaUrls,
          tradeId,
          postType: "post",
        },
      });

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

      // create repost + increment repostsCount atomically
      const [post] = await prisma.$transaction([
        prisma.post.create({
          data: {
            userId,
            content: content || null, // null = plain repost, text = quote repost
            mediaUrls,
            originalPostId,
            postType: "repost",
          },
        }),
        prisma.post.update({
          where: { id: originalPostId },
          data: { repostsCount: { increment: 1 } },
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

    const post = await prisma.post.create({
      data: {
        userId,
        content: content?.trim() || null,
        mediaUrls,
        postType: "post",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created Successfully",
      post,
    });
  } catch (err) {
    console.error("createPost error: ", error);
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
      return res.status(404).json({ message: "Post not found." });
    }
    // only owner can delete
    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts." });
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    // if it was a repost, decrement repostsCount on original post
    if (post.postType === "repost" && post.originalPostId) {
      await prisma.post.update({
        where: { id: post.originalPostId },
        data: { repostsCount: { decrement: 1 } },
      });
    }

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({ message: "Internal server error." });
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


module.exports = { createPost, deletePost, getFeed, getExplore };
