const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const glob = require('glob');
const matter = require('gray-matter');

// Markedの設定
marked.setOptions({
  gfm: true,
  breaks: true,
  tables: true
});

// HTMLテンプレート
const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <main class="skill-sheet">
            {{content}}
        </main>
        <footer>
            <p>Generated on {{date}}</p>
        </footer>
    </div>
</body>
</html>`;

async function convertMarkdownToHtml() {
  try {
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const files = glob.sync('skill-sheets/*.md');
    
    console.log(`Found ${files.length} markdown files to convert`);
    
    // CSSファイルをコピー
    await fs.copy('styles/style.css', 'output/html/style.css');
    
    // 各Markdownファイルを変換
    for (const file of files) {
      const filename = path.basename(file, '.md');
      const content = await fs.readFile(file, 'utf8');
      
      // Front matterを解析
      const { data, content: markdownContent } = matter(content);
      
      // MarkdownをHTMLに変換
      const htmlContent = marked(markdownContent);
      
      // HTMLテンプレートに挿入
      const finalHtml = htmlTemplate
        .replace('{{title}}', data.name || filename)
        .replace('{{content}}', htmlContent)
        .replace('{{date}}', new Date().toLocaleDateString('ja-JP'));
      
      // HTMLファイルを出力
      const outputPath = path.join('output/html', `${filename}.html`);
      await fs.writeFile(outputPath, finalHtml);
      
      console.log(`✓ Converted: ${file} → ${outputPath}`);
    }
    
    // インデックスページを生成
    await generateIndexPage(files);
    
    console.log('✅ All files converted successfully!');
    
  } catch (error) {
    console.error('Error converting files:', error);
    process.exit(1);
  }
}

async function generateIndexPage(files) {
  const indexContent = files.map(file => {
    const filename = path.basename(file, '.md');
    const content = fs.readFileSync(file, 'utf8');
    const { data } = matter(content);
    
    return `
      <div class="portfolio-card">
        <h2><a href="${filename}.html">${data.name || filename}</a></h2>
        <p>${data.description || 'エンジニアポートフォリオ'}</p>
        <p><small>最終更新: ${data.last_updated || '不明'}</small></p>
      </div>
    `;
  }).join('');
  
  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Engineer Portfolio Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>💼 Engineer Portfolio Gallery</h1>
            <p>技術者のためのポートフォリオコレクション</p>
        </header>
        <main>
            ${indexContent}
        </main>
        <footer>
            <p>Generated on ${new Date().toLocaleDateString('ja-JP')}</p>
            <p><a href="https://github.com/zukizukizuki/skill" target="_blank">GitHub Repository</a></p>
        </footer>
    </div>
</body>
</html>`;
  
  await fs.writeFile('output/html/index.html', indexHtml);
  console.log('✓ Generated index.html');
}

// 実行
convertMarkdownToHtml().catch(console.error);