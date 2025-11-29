# Data Sync Fix - Explanation

## Problem
The admin dashboard was saving changes only to **localStorage**, which is device/browser-specific storage. This meant:
- Changes made on one device (e.g., desktop) only appeared on that device
- Other devices (mobile, different browsers) still showed old data from `portfolio.json`
- No synchronization across devices

## Solution
The code has been updated to:

1. **Always use `portfolio.json` as the source of truth**
   - Removed localStorage override
   - All devices now load from the same JSON file
   - Changes must be saved to the JSON file to sync

2. **GitHub API Integration**
   - Admin can configure a GitHub Personal Access Token
   - Changes are automatically committed to GitHub
   - GitHub Actions rebuilds the site automatically
   - All users see updates after 1-2 minutes

3. **Manual Update Option**
   - If no GitHub token is configured
   - Admin can export JSON and manually upload to GitHub

## How to Set Up GitHub API Sync

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: `Portfolio Admin Dashboard`
3. Select scope: **`repo`** (full control of private repositories)
4. Click "Generate token"
5. Copy the token (starts with `ghp_`)

### Step 2: Configure in Admin Dashboard

1. Go to: `https://nayanapabasara.com/#/dashboard`
2. Click **"⚙️ GitHub Sync"** button in the sidebar
3. Paste your GitHub token
4. Click **"Save Token"**

### Step 3: Use Admin Dashboard

1. Make changes in the dashboard
2. Click **"💾 Save Changes"**
3. Changes will automatically:
   - Commit to GitHub
   - Trigger rebuild via GitHub Actions
   - Be live in 1-2 minutes for all users

## Manual Update Process (Alternative)

If you don't want to use GitHub API:

1. Make changes in admin dashboard
2. Click **"💾 Save Changes"**
3. JSON file will be automatically downloaded
4. Go to GitHub repository
5. Edit `src/data/portfolio.json`
6. Paste the new JSON content
7. Commit changes
8. Wait for GitHub Actions to rebuild

## What Changed in Code

### `src/utils/portfolioData.js`
- Removed localStorage as primary data source
- Always loads from `portfolio.json` file
- Added GitHub API integration function
- Auto-exports JSON if GitHub token not configured

### `src/components/AdminDashboard.jsx`
- Added GitHub token configuration UI
- Updated save function to use GitHub API
- Better status messages

### `src/App.jsx`
- Removed localStorage dependencies
- Always loads from JSON file on page load
- Keeps real-time updates for current session preview

## Benefits

✅ **Synchronized data** - All users see the same data  
✅ **Automatic deployment** - Changes trigger rebuild  
✅ **Source of truth** - Single JSON file in repository  
✅ **Version control** - All changes tracked in Git  
✅ **Rollback capability** - Can revert to previous versions  

## Important Notes

- GitHub token is stored in localStorage (device-specific)
- Token is only used for API calls, not stored on server
- If token expires, regenerate and update in dashboard
- Changes take 1-2 minutes to deploy after save

