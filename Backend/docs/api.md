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

### \*\*\* Update Profile is remained

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
> _Last updated: March 2026_
