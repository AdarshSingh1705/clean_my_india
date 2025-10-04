# TODO: Fix 401/400 Errors for Likes API

## Issue
- POST http://localhost:5000/api/likes/2 initially returning 401 (Unauthorized)
- After auth fix, now returning 400 (Bad Request) - "Issue already liked"

## Root Cause
- Backend route `/api/likes/:id` requires `auth` middleware (Bearer token)
- Frontend using plain axios without Authorization header
- Backend was returning 400 error when user tried to like an already liked issue
- No toggle functionality - clicking like on already liked issue failed

## Changes Made
- [x] Updated import in Issues.js: `import api from "../services/api"` instead of `import axios from "axios"`
- [x] Updated fetchIssues: `api.get("/issues")` instead of full URL
- [x] Updated handleLike: `api.post(\`/likes/${id}\`)` instead of full URL
- [x] Updated handleComment: `api.post(\`/issues/${id}/comments\`, { text })` instead of full URL
- [x] Modified backend likes route to toggle likes instead of returning 400 error
- [x] Updated frontend handleLike to use server response for accurate like count

## Verification
- [ ] Test like functionality after login (should now toggle like/unlike)
- [ ] Confirm Authorization header is sent with requests
- [ ] Verify no more 401/400 errors
- [ ] Test multiple clicks on like button work correctly
