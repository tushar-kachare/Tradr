# API Documentation

> **Base URL:** `http://localhost:3000/api/v1`
> **Content-Type:** `application/json`
> **Auth:** HttpOnly Cookie (`token`, JWT, 1 day) — use `credentials: 'include'` in all requests

---

## Authentication

| Method | Endpoint          | Auth | Description  |
|--------|-------------------|------|--------------|
| POST   | `/auth/register`  | ❌   | Register     |
| POST   | `/auth/login`     | ❌   | Login        |
| POST   | `/auth/logout`    | ✅   | Logout       |

---

### POST `/auth/register`

**Body:** `username`, `email`, `password` (all required)

**Success** `201`
```json
{ "success": true, "message": "User registered successfully", "user": { "id", "username", "email" } }
```

**Errors**

| Status | Message |
|--------|---------|
| `400`  | `"All fields are required"` |
| `400`  | `"Username already exists"` |
| `409`  | `"An account with this email already exists"` |
| `500`  | `"Internal server error"` |

---

### POST `/auth/login`

**Body:** `email`, `password` (all required)

**Success** `200`
```json
{ "success": true, "message": "Login successful", "user": { "id", "username", "email" } }
```

**Errors**

| Status | Message |
|--------|---------|
| `400`  | `"Email and password are required"` |
| `401`  | `"Invalid email or password"` |
| `500`  | `"Internal server error"` |

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

| Field      | Type     | Description              |
|------------|----------|--------------------------|
| `userId`   | `string` | UUID of the logged-in user |
| `iat`      | `number` | Issued at (Unix timestamp) |
| `exp`      | `number` | Expires at (Unix timestamp) |

**Error** — returned if token is missing or invalid

| Status | Message |
|--------|---------|
| `401`  | `"Access denied. No token provided."` |
| `401`  | `"Invalid or expired token."` |

---
## Users

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | `/users/me`           | ✅   | Get own profile      |
| GET    | `/users/:username`    | ❌   | Get user by username |
| DELETE | `/users/me`           | ✅   | Delete own account   |

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

| Status | Message |
|--------|---------|
| `404`  | `"User not found"` |
| `500`  | `"Failed to fetch user"` |

---

### DELETE `/users/me`

No body required.

**Success** `200`
```json
{ "success": true, "message": "User deleted successfully" }
```

**Errors** — `500` `"Failed to delete user"`
---
### POST `/users/:username/follow`

Logged-in user follows `:username`. Requires auth.

**Params:** `username` (string)

**Success** `200`
```json
{ "success": true, "message": "You are now following johndoe" }
```

**Errors**

| Status | Message |
|--------|---------|
| `400`  | `"You cannot follow yourself"` |
| `404`  | `"User not found"` |
| `409`  | `"You are already following this user"` |
| `500`  | `"Failed to follow user"` |
---
### DELETE `/users/:username/follow`

Logged-in user unfollows `:username`. Requires auth.

**Params:** `username` (string)

**Success** `200`
```json
{ "success": true, "message": "You have unfollowed johndoe" }
```

**Errors**

| Status | Message |
|--------|---------|
| `400`  | `"You cannot unfollow yourself"` |
| `404`  | `"User not found"` |
| `409`  | `"You are not following this user"` |
| `500`  | `"Failed to unfollow user"` |
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

| Status | Message |
|--------|---------|
| `404`  | `"User not found"` |
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
  "following": [
    { "username": "bob", "avatarUrl": "...", "isVerified": true }
  ]
}
```

**Errors**

| Status | Message |
|--------|---------|
| `404`  | `"User not found"` |
| `500`  | `"Failed to fetch following"` |
---

### *** Update Profile is remained 
---

## Posts


*Last updated: March 2026*