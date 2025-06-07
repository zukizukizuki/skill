#!/bin/bash
set -e

echo "Starting PR creation process..."

# Navigate to the skill directory
cd /mnt/c/Users/asaka/Documents/git/skill

# Initialize git if not already initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add remote if not already added
if ! git remote | grep -q origin; then
    echo "Adding remote origin..."
    git remote add origin https://github.com/zukizukizuki/skill.git
fi

# Fetch from remote
echo "Fetching from remote..."
git fetch origin || true

# Create and checkout new branch
echo "Creating new branch feature/add-file-attachments..."
git checkout -b feature/add-file-attachments || git checkout feature/add-file-attachments

# Check for changes
echo "Checking git status..."
git status

# Add all changes
echo "Adding all changes..."
git add -A

# Commit changes
echo "Committing changes..."
git commit -m "$(cat <<'EOF'
Add file attachments feature and update scripts

- Updated update-markdown-with-files.js to automatically delete sample.md
- Added attachment section to zukizukizuki.md with PDF/Excel links
- Simplified attachment labels to "PDF版" and "Excel版"
- Verified no personal information is included in the changes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to remote
echo "Pushing to remote..."
git push -u origin feature/add-file-attachments

# Create pull request
echo "Creating pull request..."
gh pr create --title "Add file attachments feature" --body "$(cat <<'EOF'
## Summary
- Updated `update-markdown-with-files.js` script to automatically delete `sample.md`
- Added attachment section to skill sheets with PDF/Excel download links
- Simplified attachment labels for better readability

## Changes Made
1. **Script Enhancement**: Modified `update-markdown-with-files.js` to automatically remove sample.md file
2. **Attachment Section**: Added a new section to markdown files with links to generated PDF and Excel files
3. **Label Simplification**: Changed verbose labels to concise versions:
   - "PDF版（印刷・面接資料用）" → "PDF版"
   - "Excel版（人事システム・データ管理用）" → "Excel版"

## Verification
✅ Verified that no personal information is included in the changes
✅ All file paths are relative and working correctly
✅ Generated files follow the naming convention: `filename_YYYY-MM-DD.ext`

## Test plan
- [ ] Run `npm run generate` to test the complete generation process
- [ ] Verify sample.md is deleted automatically
- [ ] Check that attachment links are correctly added to remaining markdown files
- [ ] Confirm PDF and Excel files are generated with correct naming

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"

echo "PR creation process completed!"