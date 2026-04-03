const prisma = require("../../config/db");

const { cloudinary, uploadAvatar } = require("../../config/cloudinary");

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        website: true,
        location: true,
        role: true,
        isVerified: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        tradesCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const getUserByUsername = async function (req, res) {
  try {
    const { username } = req.params;
    const loggedInUser = req.user?.userId;
    // 1. Get user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        website: true,
        location: true,
        role: true,
        isVerified: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        tradesCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log(user);

    const isOwnProfile = loggedInUser === user.id;
    console.log(loggedInUser, user.id);

    let isFollowing = false;

    if (!isOwnProfile && loggedInUser) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: loggedInUser,
            followingId: user.id,
          },
        },
      });

      isFollowing = !!follow;
    }

    // Get Portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        balance: true,
        initialValue: true,
        currency: true,
      },
    });
    return res.json({
      success: true,
      user,
      isOwnProfile,
      isFollowing,
      portfolio,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const deleteMe = async function (req, res) {
  try {
    await prisma.user.delete({
      where: {
        id: req.user.userId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "failed to delete User",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // fetch user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // prevent reusing same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.userId;

    // find targeted user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // prevent self follow
    if (targetUser.id === followerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // check if already followed
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      return res.status(409).json({
        success: false,
        message: "You are already following this User",
      });
    }

    // create follow + update counts in a transaction
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId,
          followingId: targetUser.id,
        },
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: targetUser.id },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `You are now following ${username}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
};

const unFollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.userId;

    // find targeted user
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // prevent self un-follow
    if (targetUser.id === followerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    // check if actually followed
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      // delete follow + update counts in a transaction
      await prisma.$transaction([
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId: targetUser.id,
            },
          },
        }),
        prisma.user.update({
          where: { id: followerId },
          data: { followingCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: targetUser.id },
          data: { followersCount: { decrement: 1 } },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message: `You have unfollowed ${username}`,
      });
    } else {
      return res.status(409).json({
        success: false,
        message: "you are not following this user",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: targetUser.id },
      select: {
        follower: {
          select: {
            id: true, // 🔥 needed
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    const followersList = followers.map((f) => f.follower);

    const followerIds = followersList.map((f) => f.id);

    // 🔥 check which of these are followed by logged-in user
    const following = await prisma.follow.findMany({
      where: {
        followerId: loggedInUserId,
        followingId: { in: followerIds },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(following.map((f) => f.followingId));

    // 🔥 final shaped response
    const finalFollowers = followersList.map((user) => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }));

    return res.status(200).json({
      success: true,
      count: finalFollowers.length,
      followers: finalFollowers,
    });
  } catch (err) {
    console.error("getFollowers error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch followers",
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: targetUser.id },
      select: {
        following: {
          select: {
            id: true, // 🔥 needed
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    const followingList = following.map((f) => f.following);

    const followingIds = followingList.map((f) => f.id);

    // 🔥 check which of these are followed by logged-in user
    const myFollowing = await prisma.follow.findMany({
      where: {
        followerId: loggedInUserId,
        followingId: { in: followingIds },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(myFollowing.map((f) => f.followingId));

    const finalFollowing = followingList.map((user) => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }));

    return res.status(200).json({
      success: true,
      count: finalFollowing.length,
      following: finalFollowing, // 🔥 fixed key name
    });
  } catch (err) {
    console.error("getFollowing error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch following",
    });
  }
};

const getUserPosts = async (req, res) => {
  const { userId } = req.params;
  const loggedInUserId = req.user.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  console.log(userId);

  try {
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        tradesCount: true,
        website: true,
        location: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: userId,
        },
      },
    });

    const [posts, total, likes, bookmarks] = await Promise.all([
      prisma.post.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          trade: {
            where: { isDeleted: false },
            select: {
              id: true,
              coinSymbol: true,
              coinName: true,
              tradeType: true,
              status: true,
              entryPrice: true,
              leverage: true,
              targetPrice: true,
              exitPrice: true,
              stopLoss: true,
              profitLoss: true,
              strategy: true,
              holdTime: true,
              closedAt: true,
              createdAt: true,
            },
          },
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
              trade: {
                where: { isDeleted: false },
                select: {
                  id: true,
                  coinSymbol: true,
                  coinName: true,
                  tradeType: true,
                  status: true,
                  entryPrice: true,
                  exitPrice: true,
                  leverage: true,
                  targetPrice: true,
                  stopLoss: true,
                  profitLoss: true,
                  strategy: true,
                  holdTime: true,
                  closedAt: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),

      prisma.post.count({
        where: { userId, isDeleted: false },
      }),

      // 🔥 Likes by logged-in user
      prisma.like.findMany({
        where: {
          userId: loggedInUserId,
          post: { userId },
        },
        select: { postId: true },
      }),

      // 🔥 Bookmarks by logged-in user
      prisma.bookmark.findMany({
        where: {
          userId: loggedInUserId,
          post: { userId },
        },
        select: { postId: true },
      }),
    ]);

    const likedPostIds = new Set(likes.map((l) => l.postId));
    const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));

    const shapedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      postType: post.postType,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      repostsCount: post.repostsCount,
      bookmarksCount: post.bookmarksCount,
      createdAt: post.createdAt,
      trade: post.trade ?? null,
      originalPost: post.originalPost ?? null,
      isLiked: likedPostIds.has(post.id),
      isBookmarked: bookmarkedPostIds.has(post.id),
    }));

    return res.status(200).json({
      success: true,
      user: {
        ...targetUser,
        isFollowing: !!isFollowing,
      },
      posts: shapedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getPostsFromUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserPortfolio = async (req, res) => {
  try {
    const { username } = req.params;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    // Fetch open trades to compute allocated value
    const openTrades = await prisma.trade.findMany({
      where: {
        portfolioId: portfolio.id,
        status: "open",
        isDeleted: false,
      },
      select: { actualAmount: true },
    });

    const closedTradesCount = await prisma.trade.count({
      where: {
        portfolioId: portfolio.id,
        status: "closed",
        isDeleted: false,
      },
    });

    // Compute values
    const initialValue = parseFloat(portfolio.initialValue);
    const balance = parseFloat(portfolio.balance);

    const allocatedValue = openTrades.reduce((sum, t) => {
      return sum + (t.actualAmount ? parseFloat(t.actualAmount) : 0);
    }, 0);

    const availableValue = balance - allocatedValue;

    const portfolioPnL = parseFloat(
      (((balance - initialValue) / initialValue) * 100).toFixed(2),
    );

    return res.status(200).json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      name: portfolio.name,
      currency: portfolio.currency,
      initialValue,
      balance: parseFloat(balance.toFixed(2)),
      allocatedValue: parseFloat(allocatedValue.toFixed(2)),
      availableValue: parseFloat(availableValue.toFixed(2)),
      portfolioPnL,
      tradesCount: portfolio._count.trades,
      openTradesCount: openTrades.length,
      closedTradesCount,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    });
  } catch (err) {
    console.error("getUserPortfolio error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserTrades = async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate pagination params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page number" });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Limit must be between 1 and 50" });
    }

    // Validate status filter if provided
    const validStatuses = ["open", "closed"];
    if (status && !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Status must be 'open' or 'closed'" });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Build filter
    const where = {
      portfolio: { userId: targetUser.id },
      isDeleted: false,
      ...(status && { status }),
    };

    const skip = (pageNum - 1) * limitNum;

    // Fetch trades + total count in parallel
    const [trades, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          tradingPair: true,
          tradeType: true,
          status: true,
          entryPrice: true,
          exitPrice: true,
          positionSize: true,
          leverage: true,
          riskReward: true,
          holdTime: true,
          createdAt: true,
          closedAt: true,
          portfolio: {
            select: {
              currency: true,
              user: {
                select: { id: true, username: true, avatarUrl: true },
              },
            },
          },
        },
      }),
      prisma.trade.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user: { id: targetUser.id, username: targetUser.username },
        trades,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("getUserTrades error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getUserLikes = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination params",
      });
    }

    const skip = (page - 1) * limit;

    const [likes, total, bookmarks] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          post: {
            isDeleted: false, // ✅ filter here
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          post: {
            select: {
              id: true,
              content: true,
              mediaUrls: true,
              postType: true,
              likesCount: true,
              commentsCount: true,
              repostsCount: true,
              bookmarksCount: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  role: true,
                  isVerified: true,
                },
              },
              trade: {
                where: { isDeleted: false }, // ✅ allowed (list relation)
                select: {
                  id: true,
                  coinSymbol: true,
                  coinName: true,
                  tradeType: true,
                  status: true,
                  entryPrice: true,
                  leverage: true,
                  targetPrice: true,
                  exitPrice: true,
                  stopLoss: true,
                  profitLoss: true,
                  strategy: true,
                  holdTime: true,
                  closedAt: true,
                  createdAt: true,
                },
              },

              originalPost: {
                // ❌ NO where here
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
                  trade: {
                    where: { isDeleted: false }, // ✅ allowed
                    select: {
                      id: true,
                      coinSymbol: true,
                      coinName: true,
                      tradeType: true,
                      status: true,
                      entryPrice: true,
                      exitPrice: true,
                      leverage: true,
                      targetPrice: true,
                      stopLoss: true,
                      profitLoss: true,
                      strategy: true,
                      holdTime: true,
                      closedAt: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.like.count({
        where: {
          userId,
          post: { isDeleted: false }, // ✅ keep consistent
        },
      }),

      prisma.bookmark.findMany({
        where: { userId: loggedInUserId },
        select: { postId: true },
      }),
    ]);

    // remove null posts (deleted ones filtered by prisma)
    const validPosts = likes.map((l) => l.post).filter((p) => p !== null);

    const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));

    const shapedPosts = validPosts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      user: post.user,
      postType: post.postType,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      repostsCount: post.repostsCount,
      bookmarksCount: post.bookmarksCount,
      createdAt: post.createdAt,
      trade: post.trade ?? null,
      originalPost: post.originalPost ?? null,

      // since it's liked tab → always true
      isLiked: true,
      isBookmarked: bookmarkedPostIds.has(post.id),
    }));

    return res.status(200).json({
      success: true,
      posts: shapedPosts, // 🔥 SAME as getUserPosts
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getUserLikes error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination params",
      });
    }

    const skip = (page - 1) * limit;

    const [bookmarks, total, likes] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId,
          post: {
            isDeleted: false, // ✅ filter here (correct way)
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          post: {
            select: {
              id: true,
              content: true,
              mediaUrls: true,
              postType: true,
              likesCount: true,
              commentsCount: true,
              repostsCount: true,
              bookmarksCount: true,
              createdAt: true,
              trade: {
                where: { isDeleted: false },
                select: {
                  id: true,
                  coinSymbol: true,
                  coinName: true,
                  tradeType: true,
                  status: true,
                  entryPrice: true,
                  leverage: true,
                  targetPrice: true,
                  exitPrice: true,
                  stopLoss: true,
                  profitLoss: true,
                  strategy: true,
                  holdTime: true,
                  closedAt: true,
                  createdAt: true,
                },
              },
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                  role: true,
                  isVerified: true,
                },
              },
              originalPost: {
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
                  trade: {
                    where: { isDeleted: false },
                    select: {
                      id: true,
                      coinSymbol: true,
                      coinName: true,
                      tradeType: true,
                      status: true,
                      entryPrice: true,
                      exitPrice: true,
                      leverage: true,
                      targetPrice: true,
                      stopLoss: true,
                      profitLoss: true,
                      strategy: true,
                      holdTime: true,
                      closedAt: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.bookmark.count({
        where: {
          userId,
          post: { isDeleted: false },
        },
      }),

      // 🔥 get liked posts for current user
      prisma.like.findMany({
        where: {
          userId,
        },
        select: { postId: true },
      }),
    ]);

    const validPosts = bookmarks.map((b) => b.post).filter((p) => p !== null);

    const postIds = validPosts.map((p) => p.id);

    const likedPostIds = new Set(likes.map((l) => l.postId));

    const shapedPosts = validPosts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      postType: post.postType,
      likesCount: post.likesCount,
      user: post.user,
      commentsCount: post.commentsCount,
      repostsCount: post.repostsCount,
      bookmarksCount: post.bookmarksCount,
      createdAt: post.createdAt,

      trade: post.trade ?? null,
      originalPost: post.originalPost ?? null,

      isLiked: likedPostIds.has(post.id),
      isBookmarked: true, // 🔥 always true (this is bookmarks tab)
    }));

    return res.status(200).json({
      success: true,
      posts: shapedPosts, // 🔥 SAME SHAPE everywhere
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getUserBookmarks error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.userId;

    // validate search query
    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    if (q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    if (q.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot exceed 30 characters",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid page number" });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res
        .status(400)
        .json({ success: false, message: "Limit must be between 1 and 50" });
    }

    const skip = (pageNum - 1) * limitNum;

    const where = {
      username: {
        contains: q.trim(),
        mode: "insensitive",
      },
      isActive: true,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { followersCount: "desc" }, // most followed first
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          followersCount: true,
          followingCount: true,
          // check if current user follows each result
          followers: {
            where: { followerId: currentUserId },
            select: { id: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format isFollowing flag
    const formattedUsers = users.map((user) => ({
      ...user,
      isFollowing: user.followers.length > 0,
      followers: undefined,
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    console.error("searchUsers error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// PATCH /users/me/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary

    // If user already has an avatar, delete the old one from Cloudinary
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (user.avatarUrl) {
      const publicId = user.avatarUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`tradr/avatars/${publicId}`);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl },
      select: { id: true, username: true, avatarUrl: true },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  me,
  getUserByUsername,
  deleteMe,
  changePassword,
  followUser,
  unFollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserPortfolio,
  getUserTrades,
  getUserLikes,
  getUserBookmarks,
  searchUser,
  updateAvatar,
};
