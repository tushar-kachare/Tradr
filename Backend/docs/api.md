# API Documentation

> **Base URL:** `http://localhost:3000/api/`
> **Content-Type:** `application/json`
> **Auth:** HttpOnly Cookie (`token`, JWT, 1 day) — use `credentials: 'include'` in all requests

---

## Authentication

| Method | Endpoint         | Auth | Description |
| ------ | ---------------- | ---- | ----------- |
| POST   | `/auth/register` | ❌   | Register    |
| POST   | `/auth/login`    | ❌   | Login       |
| POST   | `/auth/logout`   | ✅   | Logout      |

---

### POST `/auth/register`

**Body:** `username`, `email`, `password` (all required)

**Success** `201`

```json
{ "success": true, "message": "User registered successfully", "user": { "id", "username", "email" } }
```

**Errors**

| Status | Message                                       |
| ------ | --------------------------------------------- |
| `400`  | `"All fields are required"`                   |
| `400`  | `"Username already exists"`                   |
| `409`  | `"An account with this email already exists"` |
| `500`  | `"Internal server error"`                     |

---

### POST `/auth/login`

**Body:** `email`, `password` (all required)

**Success** `200`

```json
{ "success": true, "message": "Login successful", "user": { "id", "username", "email" } }
```

**Errors**

| Status | Message                             |
| ------ | ----------------------------------- |
| `400`  | `"Email and password are required"` |
| `401`  | `"Invalid email or password"`       |
| `500`  | `"Internal server error"`           |

---

### POST `/auth/logout`

No body required.

**Success** `200`

```json
{ "success": true, "message": "Logged out successfully" }
```

**Errors** — `500` `"Logout failed"`

---

## Authentication Middleware

All protected routes require a valid JWT cookie. The middleware decodes it and attaches the user to the request.

**Cookie:** `token` (set automatically on login/register)

**Decoded payload attached to `req.user`**

| Field    | Type     | Description                 |
| -------- | -------- | --------------------------- |
| `userId` | `string` | UUID of the logged-in user  |
| `iat`    | `number` | Issued at (Unix timestamp)  |
| `exp`    | `number` | Expires at (Unix timestamp) |

**Error** — returned if token is missing or invalid

| Status | Message                               |
| ------ | ------------------------------------- |
| `401`  | `"Access denied. No token provided."` |
| `401`  | `"Invalid or expired token."`         |

---

## Users

| Method | Endpoint           | Auth | Description          |
| ------ | ------------------ | ---- | -------------------- |
| GET    | `/users/me`        | ✅   | Get own profile      |
| GET    | `/users/:username` | ❌   | Get user by username |
| DELETE | `/users/me`        | ✅   | Delete own account   |

---

### GET `/users/me`

No body required.

**Success** `200`

```json
{
  "success": true,
  "user": {
    "id", "username", "email", "avatarUrl", "website", "location",
    "role", "isVerified", "followersCount", "followingCount",
    "postsCount", "tradesCount", "isActive", "createdAt", "updatedAt"
  }
}
```

**Errors** — `500` `"Failed to fetch profile"`

---

### GET `/users/:username`

**Params:** `username` (string)

**Success** `200`

```json
{
  "success": true,
  "user": {
    "username", "avatarUrl", "website", "location", "role",
    "isVerified", "followersCount", "followingCount",
    "postsCount", "tradesCount", "createdAt"
  }
}
```

**Errors**

| Status | Message                  |
| ------ | ------------------------ |
| `404`  | `"User not found"`       |
| `500`  | `"Failed to fetch user"` |

---

### DELETE `/users/me`

No body required.

**Success** `200`

```json
{ "success": true, "message": "User deleted successfully" }
```

## **Errors** — `500` `"Failed to delete user"`

### POST `/users/:username/follow`

Logged-in user follows `:username`. Requires auth.

**Params:** `username` (string)

**Success** `200`

```json
{ "success": true, "message": "You are now following johndoe" }
```

**Errors**

| Status | Message                                 |
| ------ | --------------------------------------- |
| `400`  | `"You cannot follow yourself"`          |
| `404`  | `"User not found"`                      |
| `409`  | `"You are already following this user"` |
| `500`  | `"Failed to follow user"`               |

---

### DELETE `/users/:username/follow`

Logged-in user unfollows `:username`. Requires auth.

**Params:** `username` (string)

**Success** `200`

```json
{ "success": true, "message": "You have unfollowed johndoe" }
```

**Errors**

| Status | Message                             |
| ------ | ----------------------------------- |
| `400`  | `"You cannot unfollow yourself"`    |
| `404`  | `"User not found"`                  |
| `409`  | `"You are not following this user"` |
| `500`  | `"Failed to unfollow user"`         |

---

### GET `/users/:username/followers`

Returns list of users who follow `:username`.

**Params:** `username` (string)

**Success** `200`

```json
{
  "success": true,
  "count": 3,
  "followers": [
    { "username": "alice", "avatarUrl": "...", "isVerified": false }
  ]
}
```

**Errors**

| Status | Message                       |
| ------ | ----------------------------- |
| `404`  | `"User not found"`            |
| `500`  | `"Failed to fetch followers"` |

---

### GET `/users/:username/following`

Returns list of users that `:username` follows.

**Params:** `username` (string)

**Success** `200`

```json
{
  "success": true,
  "count": 3,
  "following": [{ "username": "bob", "avatarUrl": "...", "isVerified": true }]
}
```

**Errors**

| Status | Message                       |
| ------ | ----------------------------- |
| `404`  | `"User not found"`            |
| `500`  | `"Failed to fetch following"` |

---
### Search Users
---

**GET** `/users/search?q=username`

Requires Authentication: `Yes`

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | - | Search term (min 2, max 30 chars) |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 50) |

**Success Response `200`**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "tushar",
        "avatarUrl": null,
        "role": "user",
        "isVerified": false,
        "followersCount": 120,
        "followingCount": 80,
        "isFollowing": false
      }
    ],
    "pagination": { "total": 5, "page": 1, "limit": 10, "totalPages": 1, "hasNextPage": false, "hasPrevPage": false }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Search query is required |
| `400` | Search query must be at least 2 characters |
| `400` | Search query cannot exceed 30 characters |
| `400` | Invalid page number |
| `400` | Limit must be between 1 and 50 |
| `401` | Unauthorized |
| `500` | Internal server error |
---

## Fetch Posts by User

**GET** `/api/users/:userId/posts`
🔒 Requires authentication

**Params**

| Field    | Type          | Description                         |
| -------- | ------------- | ----------------------------------- |
| `userId` | string (UUID) | ID of the user whose posts to fetch |

**Query Params**

| Field   | Type   | Default | Description    |
| ------- | ------ | ------- | -------------- |
| `page`  | number | `1`     | Page number    |
| `limit` | number | `10`    | Posts per page |

**Responses**

| Status | Description                |
| ------ | -------------------------- |
| `200`  | Posts fetched successfully |
| `404`  | User not found or inactive |
| `500`  | Internal server error      |

> Returns paginated posts by a specific user ordered by newest first. Response includes the user's profile data and `isFollowing` flag alongside the posts. Each post includes trade data (if trade share) and original post data (if repost).

---

### Get User Portfolio

---

**GET** `/users/:username/portfolio`

Requires Authentication: `Yes`

**URL Params**
| Param | Type | Description |
|---|---|---|
| `username` | string | Username of the user |

**Success Response `200`**

```json
{
  "username": "safsaf",
  "avatarUrl": null,
  "name": "only Eth trades",
  "currency": "USDT",
  "initialValue": 10000,
  "balance": 9000,
  "allocatedValue": 0,
  "availableValue": 10000,
  "portfolioPnL": -4,
  "tradesCount": 0,
  "openTradesCount": 0,
  "closedTradesCount": 0,
  "createdAt": "2026-03-18T13:58:32.236Z",
  "updatedAt": "2026-03-18T15:06:14.584Z"
}
```

**Error Responses**
| Status | Message |
|---|---|
| `401` | Unauthorized |
| `404` | User not found |
| `404` | Portfolio not found |
| `500` | Internal server error |

### \*\*\* Update Profile is remained

---
### Get User Trades

**GET** `/users/:username/trades`

Requires Authentication: `Yes`

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 50) |
| `status` | string | - | Filter by `open` or `closed` |

**Success Response `200`**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "username": "tushar" },
    "trades": [
      {
        "id": "uuid",
        "tradingPair": "BTC/USDT",
        "tradeType": "long",
        "status": "open",
        "entryPrice": 65000,
        "exitPrice": null,
        "positionSize": 20,
        "leverage": 1,
        "riskReward": "2.50",
        "holdTime": null,
        "createdAt": "2026-03-18T10:00:00.000Z",
        "closedAt": null,
        "portfolio": {
          "currency": "USDT",
          "user": { "id": "uuid", "username": "tushar", "profilePicture": null }
        }
      }
    ],
    "pagination": {
      "total": 47,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Invalid page number |
| `400` | Limit must be between 1 and 50 |
| `400` | Status must be 'open' or 'closed' |
| `401` | Unauthorized |
| `404` | User not found |
| `500` | Internal server error |
---

## Posts

## Create Post

**POST** `/api/posts/`
🔒 Requires authentication

**Request Body**

| Field            | Type          | Required | Description                      |
| ---------------- | ------------- | -------- | -------------------------------- |
| `content`        | string        | ❌       | Post text / caption              |
| `mediaUrls`      | string[]      | ❌       | Array of media URLs              |
| `tradeId`        | string (uuid) | ❌       | Share a trade (trade share post) |
| `originalPostId` | string (uuid) | ❌       | Repost or quote repost           |

> At least one of `content`, `mediaUrls`, `tradeId`, or `originalPostId` must be provided.

**Post Types**

| Scenario     | Fields to send                 |
| ------------ | ------------------------------ |
| Regular post | `content` and/or `mediaUrls`   |
| Trade share  | `tradeId` + optional `content` |
| Repost       | `originalPostId`               |
| Quote repost | `originalPostId` + `content`   |

**Responses**

| Status | Description                                                                    |
| ------ | ------------------------------------------------------------------------------ |
| `201`  | Post created successfully                                                      |
| `400`  | Empty post / `tradeId` and `originalPostId` sent together / reposting a repost |
| `404`  | Trade or original post not found                                               |
| `409`  | User already reposted this post                                                |
| `500`  | Internal server error                                                          |

## Delete Post

**DELETE** `/api/posts/:postId`
🔒 Requires authentication

**Params**

| Field    | Type          | Description              |
| -------- | ------------- | ------------------------ |
| `postId` | string (uuid) | ID of the post to delete |

**Responses**

| Status | Description                        |
| ------ | ---------------------------------- |
| `200`  | Post deleted successfully          |
| `403`  | You can only delete your own posts |
| `404`  | Post not found                     |
| `500`  | Internal server error              |

> Soft deletes the post (`isDeleted = true`). If the post is an original post, all its reposts are also soft deleted. If the post is a repost, `repostsCount` on the original post is decremented.

## Get Feed from following

**GET** `/api/posts/feed`
🔒 Requires authentication

**Query Params**

| Field   | Type   | Default | Description    |
| ------- | ------ | ------- | -------------- |
| `page`  | number | `1`     | Page number    |
| `limit` | number | `10`    | Posts per page |

**Responses**

| Status | Description               |
| ------ | ------------------------- |
| `200`  | Feed fetched successfully |
| `500`  | Internal server error     |

> Returns paginated posts from followed users and the authenticated user themselves, ordered by newest first. Each post includes author info, trade data (if trade share), and original post data (if repost).

## Get Explore Feed

**GET** `/api/posts/feed`
🔒 Requires authentication

**Query Params**

| Field   | Type   | Default | Description    |
| ------- | ------ | ------- | -------------- |
| `page`  | number | `1`     | Page number    |
| `limit` | number | `10`    | Posts per page |

**Responses**

| Status | Description                       |
| ------ | --------------------------------- |
| `200`  | Explore Feed fetched successfully |
| `500`  | Internal server error             |

> Returns paginated posts ordered by newest first. Each post includes author info, trade data (if trade share), and original post data (if repost).

## Fetch Single Post

**GET** `/api/posts/:postId`
🔒 Requires authentication

**Params**

| Field    | Type          | Description             |
| -------- | ------------- | ----------------------- |
| `postId` | string (UUID) | ID of the post to fetch |

**Responses**

| Status | Description               |
| ------ | ------------------------- |
| `200`  | Post fetched successfully |
| `404`  | Post not found or deleted |
| `500`  | Internal server error     |

> Fetches a single post with full nested data. If the post is a trade share, full trade data is attached. If it is a repost, the original post is attached along with its author and trade data (if the original was a trade share).

## Update Post

**PATCH** `/api/posts/:postId`
🔒 Requires authentication

**Params**

| Field    | Type          | Description              |
| -------- | ------------- | ------------------------ |
| `postId` | string (UUID) | ID of the post to update |

**Body**

| Field       | Type     | Required | Description          |
| ----------- | -------- | -------- | -------------------- |
| `content`   | string   | No       | Updated text content |
| `mediaUrls` | string[] | No       | Updated media URLs   |

> At least one field must be provided.

**Responses**

| Status | Description                                                             |
| ------ | ----------------------------------------------------------------------- |
| `200`  | Post updated successfully                                               |
| `400`  | Nothing to update / post would be empty / plain repost cannot be edited |
| `403`  | Not the post owner                                                      |
| `404`  | Post not found or deleted                                               |
| `500`  | Internal server error                                                   |

> Only `content` and `mediaUrls` are editable. `postType`, `tradeId`, and `originalPostId` cannot be changed after creation. Plain reposts (reposts with no content) cannot be edited.

---
### Like a Post

**POST** `/posts/:postId/like`

Requires Authentication: `Yes`

**Success Response `201`**
```json
{ "success": true, "message": "Post liked" }
```

**Error Responses**
| Status | Message |
|---|---|
| `404` | Post not found |
| `409` | Post already liked |
| `500` | Internal server error |

---

### Unlike a Post

**DELETE** `/posts/:postId/like`

Requires Authentication: `Yes`

**Success Response `200`**
```json
{ "success": true, "message": "Post unliked" }
```

**Error Responses**
| Status | Message |
|---|---|
| `404` | Post not found |
| `409` | Post not liked yet |
| `500` | Internal server error |

---

### Bookmark a Post

**POST** `/posts/:postId/bookmark`

Requires Authentication: `Yes`

**Success Response `201`**
```json
{ "success": true, "message": "Post bookmarked" }
```

**Error Responses**
| Status | Message |
|---|---|
| `404` | Post not found |
| `409` | Post already bookmarked |
| `500` | Internal server error |

---

### Unbookmark a Post

**DELETE** `/posts/:postId/bookmark`

Requires Authentication: `Yes`

**Success Response `200`**
```json
{ "success": true, "message": "Post unbookmarked" }
```

**Error Responses**
| Status | Message |
|---|---|
| `404` | Post not found |
| `409` | Post not bookmarked yet |
| `500` | Internal server error |
---
### Get My Likes

**GET** `/users/me/likes`

Requires Authentication: `Yes`

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 50) |

**Success Response `200`**
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "id": "uuid",
        "createdAt": "2026-03-18T10:00:00.000Z",
        "post": {
          "id": "uuid",
          "content": "BTC looks bullish",
          "mediaUrls": [],
          "postType": "post",
          "likesCount": 12,
          "commentsCount": 3,
          "repostsCount": 1,
          "bookmarksCount": 5,
          "createdAt": "2026-03-18T10:00:00.000Z",
          "originalPostId": null,
          "originalPost": null,
          "trade": null,
          "user": { "id": "uuid", "username": "tushar", "avatarUrl": null, "isVerified": false }
        }
      }
    ],
    "pagination": { "total": 20, "page": 1, "limit": 10, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Invalid page number |
| `400` | Limit must be between 1 and 50 |
| `401` | Unauthorized |
| `500` | Internal server error |

---

### Get My Bookmarks

**GET** `/users/me/bookmarks`

Requires Authentication: `Yes`

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 50) |

**Success Response `200`**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": "uuid",
        "createdAt": "2026-03-18T10:00:00.000Z",
        "post": {
          "id": "uuid",
          "content": "ETH breakout incoming",
          "mediaUrls": [],
          "postType": "repost",
          "likesCount": 8,
          "commentsCount": 1,
          "repostsCount": 2,
          "bookmarksCount": 3,
          "createdAt": "2026-03-18T10:00:00.000Z",
          "originalPostId": "uuid",
          "originalPost": {
            "id": "uuid",
            "content": "original post content",
            "mediaUrls": [],
            "createdAt": "2026-03-17T10:00:00.000Z",
            "user": { "id": "uuid", "username": "satoshi", "avatarUrl": null, "isVerified": true }
          },
          "trade": null,
          "user": { "id": "uuid", "username": "tushar", "avatarUrl": null, "isVerified": false }
        }
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 10, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Invalid page number |
| `400` | Limit must be between 1 and 50 |
| `401` | Unauthorized |
| `500` | Internal server error |
---
### Create Comment

**POST** `/posts/:postId/comments`

Requires Authentication: `Yes`

**Request Body**
```json
{ "content": "Great trade setup!" }
```

**Success Response `201`**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "content": "Great trade setup!",
      "postId": "uuid",
      "parentId": null,
      "createdAt": "2026-03-18T10:00:00.000Z",
      "user": { "id": "uuid", "username": "tushar", "avatarUrl": null, "isVerified": false }
    }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Content is required |
| `400` | Comment cannot exceed 500 characters |
| `401` | Unauthorized |
| `404` | Post not found |
| `500` | Internal server error |

---

### Get Post Comments

**GET** `/posts/:postId/comments`

Requires Authentication: `Yes`

**Query Parameters**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Records per page (max 50) |

**Success Response `200`**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Great trade setup!",
        "postId": "uuid",
        "createdAt": "2026-03-18T10:00:00.000Z",
        "repliesCount": 2,
        "user": { "id": "uuid", "username": "tushar", "avatarUrl": null, "isVerified": false, "role": "user" }
      }
    ],
    "pagination": { "total": 20, "page": 1, "limit": 10, "totalPages": 2, "hasNextPage": true, "hasPrevPage": false }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Invalid page number |
| `400` | Limit must be between 1 and 50 |
| `401` | Unauthorized |
| `404` | Post not found |
| `500` | Internal server error |

---

### Delete Comment

**DELETE** `/posts/:postId/comments/:commentId`

Requires Authentication: `Yes`

**Success Response `200`**
```json
{ "success": true, "message": "Comment deleted" }
```

**Error Responses**
| Status | Message |
|---|---|
| `401` | Unauthorized |
| `403` | You can only delete your own comments |
| `404` | Post not found |
| `404` | Comment not found |
| `500` | Internal server error |

---
## Portfolio

### Portfolio table store initialValue and Balance (initialValue is fixed and Balance is updated when trade is closed only)

### Create Portfolio

**POST** `/portfolio`

Requires Authentication: `Yes`

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `initialValue` | number | ✅ | Starting portfolio value — fixed benchmark, never changes |
| `name` | string | ❌ | Portfolio name (default: `"My Portfolio"`) |
| `currency` | string | ❌ | Currency (default: `"USDT"`) |

**Success Response `201`**

```json
{
  "success": true,
  "message": "Portfolio created successfully.",
  "portfolio": {
    "id": "uuid",
    "name": "My Portfolio",
    "currency": "USDT",
    "initialValue": 10000,
    "balance": 10000,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "updatedAt": "2026-03-18T10:00:00.000Z"
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | Portfolio already exists |
| `400` | initialValue must be greater than 0 |
| `401` | Unauthorized |
| `500` | Internal server error |

---

### Get My Portfolio

**GET** `/portfolio/me`

Requires Authentication: `Yes`

**Success Response `200`**

```json
{
  "id": "uuid",
  "name": "My Portfolio",
  "currency": "USDT",
  "initialValue": 10000,
  "balance": 9000,
  "allocatedValue": 3500,
  "availableValue": 6500,
  "portfolioPnL": 30,
  "tradesCount": 15,
  "openTradesCount": 3,
  "closedTradesCount": 12,
  "createdAt": "2026-03-18T10:00:00.000Z",
  "updatedAt": "2026-03-18T10:00:00.000Z"
}
```

**Error Responses**
| Status | Message |
|---|---|
| `401` | Unauthorized |
| `404` | Portfolio not found |
| `500` | Internal server error |

---

### Update Portfolio

**PATCH** `/portfolio`

Requires Authentication: `Yes`

**Request Body** _(all fields optional, at least one required)_
| Field | Type | Description |
|---|---|---|
| `name` | string | New portfolio name |
| `currency` | string | New currency |

**Success Response `200`**

```json
{
  "success":true
  "message": "Portfolio updated successfully",
  "portfolio": {
    "id": "uuid",
    "name": "BTC Heavy",
    "currency": "USDT",
    "initialValue": 15000,
    "balance":10000,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "updatedAt": "2026-03-18T10:00:00.000Z"
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | No fields provided to update |
| `400` | Name cannot be empty |
| `400` | Currency cannot be empty |
| `400` | Total value must be greater than 0 |
| `400` | Total value cannot be less than currently allocated amount ($X) |
| `401` | Unauthorized |
| `404` | Portfolio not found |
| `500` | Internal server error |

---

### Trade

---

### Create Trade

**POST** `/trades`

Requires Authentication: `Yes`

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `coin` | string | ✅ | Coin symbol e.g. `"BTC"` |
| `tradeType` | string | ✅ | `"long"` or `"short"` |
| `entryPrice` | number | ✅ | Price at entry |
| `positionSize` | number | ✅ | % of portfolio e.g. `20` |
| `targetPrice` | number | ❌ | Target exit price |
| `stopLoss` | number | ❌ | Stop loss price |
| `leverage` | number | ❌ | 1x to 10x (default: `1`) |
| `holdTime` | string | ❌ | Expected hold duration e.g. `"1-3 days"` |
| `strategy` | string | ❌ | Trade reasoning |
| `tradingPair` | string | ❌ | e.g. `"BTC/USDT"` (auto-built if not sent) |

**Success Response `201`**

```json
{
  "success": true,
  "message": "Trade created successfully.",
  "trade": {
    "id": "uuid",
    "coinSymbol": "BTC",
    "coinName": "Bitcoin",
    "tradingPair": "BTC/USDT",
    "tradeType": "long",
    "entryPrice": 65000,
    "targetPrice": 70000,
    "stopLoss": 63000,
    "positionSize": 20,
    "actualAmount": 2000,
    "leverage": 1,
    "riskReward": "2.50",
    "status": "open",
    "holdTime": "1-3 days",
    "strategy": "bullish breakout",
    "createdAt": "2026-03-18T10:00:00.000Z",
    "coin": { "symbol": "BTC", "name": "Bitcoin", "logoUrl": null },
    "user": { "username": "tushar", "avatarUrl": null }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | coin, tradeType, entryPrice and positionSize are required |
| `400` | tradeType must be long or short |
| `400` | leverage must be between 1 to 10 |
| `400` | positionSize must be between 1 and 100 |
| `400` | Invalid coin symbol |
| `400` | Insufficient portfolio allocation. Required: $X, Available: $Y |
| `400` | stopLoss cannot be equal to entryPrice |
| `404` | Portfolio not found. Please create a portfolio first |
| `401` | Unauthorized |
| `500` | Internal server error |

---

### Update Trade

**PATCH** `/trades/:id`

Requires Authentication: `Yes`

**Request Body** — at least one field required
| Field | Type | Required | Description |
|---|---|---|---|
| `targetPrice` | number | ❌ | Updated target price |
| `stopLoss` | number | ❌ | Updated stop loss |
| `holdTime` | string | ❌ | Updated hold duration |
| `strategy` | string | ❌ | Updated reasoning |

**Success Response `200`**

```json
{
  "success": true,
  "message": "Trade updated successfully.",
  "trade": {
    "id": "uuid",
    "targetPrice": 72000,
    "stopLoss": 62000,
    "riskReward": "3.00",
    "holdTime": "3-5 days",
    "strategy": "updated reasoning",
    "updatedAt": "2026-03-18T10:00:00.000Z",
    "coin": { "symbol": "BTC", "name": "Bitcoin", "logoUrl": null },
    "user": { "username": "tushar", "avatarUrl": null }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | At least one field is required to update |
| `400` | targetPrice must be above entryPrice for a long trade |
| `400` | targetPrice must be below entryPrice for a short trade |
| `400` | Cannot update a closed/cancelled trade |
| `403` | You are not authorized to update this trade |
| `404` | Trade not found |
| `401` | Unauthorized |
| `500` | Internal server error |

---

### Close Trade

**PATCH** `/trades/:id/close`

Requires Authentication: `Yes`

**Request Body**
| Field | Type | Required | Description |
|---|---|---|---|
| `exitPrice` | number | ✅ | Actual exit price |

**Success Response `200`**

```json
{
  "success": true,
  "message": "Trade closed successfully.",
  "trade": {
    "id": "uuid",
    "status": "closed",
    "exitPrice": 66000,
    "profitLoss": 10.0,
    "closedAt": "2026-03-18T10:00:00.000Z",
    "coin": { "symbol": "BTC", "name": "Bitcoin", "logoUrl": null },
    "user": { "username": "tushar", "avatarUrl": null }
  },
  "summary": {
    "entryPrice": 65000,
    "exitPrice": 66000,
    "profitLoss": "10%",
    "actualGain": 200.0,
    "newPortfolioBalance": 10200.0
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `400` | exitPrice is required |
| `400` | Trade is already closed/cancelled |
| `403` | You are not authorized to close this trade |
| `404` | Trade not found |
| `404` | Portfolio not found |
| `401` | Unauthorized |
| `500` | Internal server error |

---

### Get Trade By ID

**GET** `/trades/:id`

Requires Authentication: `No`

**Success Response `200`**

```json
{
  "success": true,
  "trade": {
    "id": "uuid",
    "coinSymbol": "BTC",
    "coinName": "Bitcoin",
    "tradingPair": "BTC/USDT",
    "tradeType": "long",
    "entryPrice": 65000,
    "targetPrice": 70000,
    "stopLoss": 63000,
    "positionSize": 20,
    "actualAmount": 2000,
    "leverage": 1,
    "riskReward": "2.50",
    "status": "open",
    "profitLoss": null,
    "exitPrice": null,
    "closedAt": null,
    "createdAt": "2026-03-18T10:00:00.000Z",
    "coin": { "symbol": "BTC", "name": "Bitcoin", "logoUrl": null },
    "user": { "username": "tushar", "avatarUrl": null }
  }
}
```

**Error Responses**
| Status | Message |
|---|---|
| `404` | Trade not found |
| `500` | Internal server error |

> _Last updated: March 2026_
