# Performance Improvements Plan

## Current Issues
- TTFB: 14.9ms (good, but can be optimized)
- FCP: 252ms (acceptable)
- LCP: 544ms (needs improvement, target <2.5s)
- FID: 2.7ms (good)

## Information Gathered
- Frontend uses React with web-vitals reporting logged to console.
- Backend is Node.js/Express with complex queries in issues.js using subqueries for counts.
- No compression middleware in server.js, which can reduce TTFB.
- No lazy loading or code splitting in React app.
- HTML template is standard, no blocking resources.

## Plan

### Backend Optimizations
- Add compression middleware to server.js for gzip responses.
- Optimize issues.js GET / query: replace subqueries with JOINs for comment_count and like_count.
- Add database indexes if needed (check db.js for schema).

### Frontend Optimizations
- Implement lazy loading for route components in App.js using React.lazy and Suspense.
- Change reportWebVitals to send metrics to analytics endpoint instead of console.log.
- Add preloading for critical routes.

### Monitoring
- Enhance web-vitals to track metrics properly.

## Dependent Files to Edit
- backend/server.js: Add compression.
- backend/routes/issues.js: Optimize query.
- frontend/src/App.js: Add lazy loading.
- frontend/src/reportWebVitals.js: Change logging.

## Followup Steps
- Test backend response times after optimizations.
- Test frontend metrics after lazy loading.
- Monitor web-vitals improvements.
