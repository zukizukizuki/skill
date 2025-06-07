# GitHub Pages Setup Instructions

## ⚠️ Important: Repository Settings Required

To fix the GitHub Pages deployment error, you need to enable GitHub Pages in your repository settings:

### Step 1: Enable GitHub Pages
1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### Step 2: Push Changes
```bash
git push origin main
```

### Step 3: Monitor Deployment
1. Go to **Actions** tab in your repository
2. Watch the "Convert Skill Sheets and Deploy" workflow
3. Once successful, your site will be available at: `https://[username].github.io/[repository-name]/`

## What Was Fixed

✅ **Removed duplicate workflows** - Deleted conflicting files from `/workflows/` directory  
✅ **Added missing npm script** - Added `convert:html` to package.json  
✅ **Improved workflow configuration** - Added concurrency control and proper permissions  
✅ **Consolidated deployment** - Single workflow now handles both conversion and deployment  

## Troubleshooting

If you still get errors:

1. **404 Error**: Make sure GitHub Pages is enabled in repository settings
2. **Permission Error**: Ensure the repository has Actions permissions enabled
3. **Build Error**: Check the Actions tab for detailed error logs

## Expected Result

After successful deployment, you'll have:
- 📄 **PDF files** available for download
- 📊 **Excel files** for editing
- 🌐 **HTML pages** for web viewing
- 🏠 **Landing page** with download links for all formats

The landing page will be automatically generated with download links for all your skill sheet formats.