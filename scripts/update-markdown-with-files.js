const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

async function updateMarkdownWithFiles() {
  try {
    console.log('🔄 Updating markdown files with generated file links...');
    
    // sample.mdファイルを削除
    const sampleFile = 'skill-sheets/sample.md';
    if (await fs.pathExists(sampleFile)) {
      await fs.remove(sampleFile);
      console.log('✓ Deleted sample.md file');
    }
    
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const markdownFiles = glob.sync('skill-sheets/*.md');
    
    for (const markdownFile of markdownFiles) {
      const filename = path.basename(markdownFile, '.md');
      const content = await fs.readFile(markdownFile, 'utf8');
      
      // Front matterを解析
      const { data, content: markdownContent } = matter(content);
      
      // 現在の日付を取得（YYYY-MM-DD形式）
      const today = new Date();
      const dateString = today.getFullYear() + 
        '-' + String(today.getMonth() + 1).padStart(2, '0') + 
        '-' + String(today.getDate()).padStart(2, '0');
      
      // 生成されるファイルのパス
      const pdfPath = `output/pdf/${filename}_${dateString}.pdf`;
      const excelPath = `output/excel/${filename}_${dateString}.xlsx`;
      
      // 既存の添付ファイルセクションを削除
      let newContent = markdownContent.replace(/\n## 📎 添付ファイル[\s\S]*$/m, '');
      
      // 新しい添付ファイルセクションを追加
      const attachmentSection = `

## 📎 添付ファイル

### 📄 PDF版
- [${filename}_${dateString}.pdf](${pdfPath})

### 📊 Excel版
- [${filename}_${dateString}.xlsx](${excelPath})

---

*💡 このスキルシートは [Skill Sheet Generator](https://github.com/zukizukizuki/skill) で自動生成されています*

**生成日時**: ${new Date().toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}`;

      newContent += attachmentSection;
      
      // Front matterと結合
      const updatedContent = matter.stringify(newContent, data);
      
      // ファイルを更新
      await fs.writeFile(markdownFile, updatedContent);
      
      console.log(`✓ Updated: ${markdownFile} with file attachments`);
    }
    
    console.log('✅ All markdown files updated with file links!');
    
  } catch (error) {
    console.error('Error updating markdown files:', error);
    process.exit(1);
  }
}

// 実行
updateMarkdownWithFiles();