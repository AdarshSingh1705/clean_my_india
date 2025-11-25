# 📮 Postman Testing Guide

## 🚀 Quick Start

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Clean-My-India-API.postman_collection.json`
5. Click **Import**

### Step 2: Set Base URL (Optional)

The collection uses `http://localhost:5000` by default.

To change it:

1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` value:
   - Local: `http://localhost:5000`
   - Render: `https://your-backend.onrender.com`
4. Click **Save**

### Step 3: Start Testing!

Follow the order below for best results.

---

## 📋 Testing Order

### 1️⃣ Health Check

- **Purpose:** Verify server is running
- **Auth:** Not required
- **Expected:** `200 OK` with `{"status":"OK"}`

### 2️⃣ Register User

- **Purpose:** Create a new user account
- **Auth:** Not required
- **Note:** Token is automatically saved!
- **Expected:** `201 Created` with user details and token

**Body:**

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123",
  "role": "citizen"
}
```

### 3️⃣ Login User

- **Purpose:** Login with existing credentials
- **Auth:** Not required
- **Note:** Token is automatically saved!
- **Expected:** `200 OK` with user details and token

**Body:**

```json
{
  "email": "test@example.com",
  "password": "Test@123"
}
```

### 4️⃣ Get Current User

- **Purpose:** Get logged-in user details
- **Auth:** Required (automatically uses saved token)
- **Expected:** `200 OK` with user details

### 5️⃣ Report Issue (No Image)

- **Purpose:** Report a new issue without image
- **Auth:** Required
- **Note:** Issue ID is automatically saved!
- **Expected:** `201 Created` with issue details

**Body:**

```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "category": "pothole",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "priority": "medium"
}
```

**Categories:** `pothole`, `garbage`, `water_leakage`, `street_light`, `drainage`, `other`
**Priorities:** `low`, `medium`, `high`, `critical`

### 6️⃣ Report Issue (With Image)

- **Purpose:** Report a new issue with image
- **Auth:** Required
- **Body Type:** Form-data
- **Image:** Click on "image" field → Select File → Choose an image (jpg, png, gif, max 5MB)
- **Expected:** `201 Created` with issue details

### 7️⃣ Get All Issues

- **Purpose:** Retrieve all issues with pagination
- **Auth:** Not required
- **Query Params:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status (optional)
  - `category`: Filter by category (optional)
  - `priority`: Filter by priority (optional)
- **Expected:** `200 OK` with issues array

### 8️⃣ Get Single Issue

- **Purpose:** Get details of a specific issue
- **Auth:** Not required
- **Note:** Uses automatically saved issue ID
- **Expected:** `200 OK` with issue details, comments, and likes

### 9️⃣ Like Issue

- **Purpose:** Like an issue
- **Auth:** Required
- **Expected:** `200 OK` with updated like count

### 🔟 Add Comment

- **Purpose:** Add a comment to an issue
- **Auth:** Required
- **Expected:** `201 Created` with comment details

**Body:**

```json
{
  "text": "This issue needs immediate attention!"
}
```

---

## 🔐 Authentication

### Automatic Token Management

The collection automatically saves and uses tokens!

When you **Register** or **Login**, the token is saved to the collection variable `{{token}}` and automatically used in all authenticated requests.

### Manual Token (if needed)

1. Copy token from Register/Login response
2. Click collection name → Variables tab
3. Paste token in `token` variable
4. Save

### Check Current Token

1. Click collection name
2. Go to Variables tab
3. See `token` current value

---

## 🎯 Testing Scenarios

### Scenario 1: New User Flow

1. Health Check
2. Register User
3. Get Current User
4. Report Issue
5. Get All Issues
6. Like Issue
7. Add Comment

### Scenario 2: Existing User Flow

1. Health Check
2. Login User
3. Get Current User
4. Report Issue
5. Get Single Issue

### Scenario 3: Public User (No Login)

1. Health Check
2. Get All Issues
3. Get Single Issue

---

## 📊 Expected Responses

### ✅ Success Responses

**Register/Login:**

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "citizen"
  }
}
```

**Report Issue:**

```json
{
  "message": "Issue reported successfully",
  "issue": {
    "id": 1,
    "title": "Pothole on Main Street",
    "status": "pending",
    "priority": "high",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Get Issues:**

```json
{
  "issues": [...],
  "total": 10,
  "page": 1,
  "totalPages": 1
}
```

### ❌ Error Responses

**400 Bad Request:**

```json
{
  "message": "Missing required fields"
}
```

**401 Unauthorized:**

```json
{
  "message": "No token provided"
}
```

**500 Server Error:**

```json
{
  "message": "Server error"
}
```

---

## 🔧 Troubleshooting

### Issue: "Could not send request"

**Solution:**

- Check if server is running: `npm start`
- Verify baseUrl is correct
- Check network connection

### Issue: "User already exists"

**Solution:**

- Change email in Register request
- Or use Login instead

### Issue: "No token provided"

**Solution:**

- Run Register or Login first
- Check token is saved (Collection → Variables)
- Ensure Authorization header is enabled

### Issue: "Invalid token"

**Solution:**

- Token expired (7 days)
- Login again to get new token

### Issue: "Missing required fields"

**Solution:**

- Check all required fields are filled
- Verify JSON format is correct
- For Report Issue: title, description, category, latitude, longitude are required

### Issue: Image upload fails

**Solution:**

- Use "Report Issue (With Image)" request
- Body type must be "form-data"
- Click on "image" field → Select File
- File must be jpg, png, or gif
- File size must be under 5MB

---

## 🎨 Postman Tips

### View Response

- Click on **Body** tab after sending request
- Use **Pretty** view for formatted JSON
- Use **Raw** view for unformatted response

### Save Responses

- Click **Save Response** → **Save as Example**
- Useful for documentation

### Environment Variables

For testing multiple environments:

1. Create Environment (Local, Staging, Production)
2. Set `baseUrl` for each
3. Switch environments easily

### Console

- View → Show Postman Console
- See all request/response details
- Check saved variables

### Tests Tab

The collection has automatic scripts that:

- Save token after Register/Login
- Save issue ID after Report Issue
- Log values to console

---

## 📝 Quick Reference

### Base URL

- Local: `http://localhost:5000`
- Render: `https://your-backend.onrender.com`

### Categories

`pothole`, `garbage`, `water_leakage`, `street_light`, `drainage`, `other`

### Statuses

`pending`, `in_progress`, `resolved`, `closed`

### Priorities

`low`, `medium`, `high`, `critical`

### Roles

`citizen`, `official`, `admin`

---

## 🚀 Advanced Testing

### Test with Different Users

1. Register multiple users with different emails
2. Save tokens manually
3. Switch tokens to test different user actions

### Test Filters

In "Get All Issues" request, enable query params:

- `status=pending`
- `category=pothole`
- `priority=high`

### Test Pagination

- `page=1&limit=5`
- `page=2&limit=5`

### Test Official Actions

1. Register user with `"role": "official"`
2. Use "Update Issue Status" request
3. Use "Assign Issue" request

---

## ✅ Testing Checklist

- [ ] Health check passes
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token is automatically saved
- [ ] Can get current user details
- [ ] Can report issue without image
- [ ] Can report issue with image
- [ ] Can get all issues
- [ ] Can get single issue
- [ ] Can like an issue
- [ ] Can add comment
- [ ] Filters work (status, category, priority)
- [ ] Pagination works

---

## 🆘 Need Help?

1. Check server is running: `npm start`
2. Verify database connection: `node test-db-connection.js`
3. Check server logs for errors
4. Use Postman Console to debug requests

---

**Happy Testing! 🎉**

For automated testing, use: `npm test`
