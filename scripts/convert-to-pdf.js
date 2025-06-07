const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const glob = require('glob');
const matter = require('gray-matter');

async function convertMarkdownToPdf() {
  let browser;
  
  try {
    // Puppeteerを起動（日本語フォント対応）
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning'
      ]
    });
    
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const markdownFiles = glob.sync('skill-sheets/*.md');
    
    console.log(`Found ${markdownFiles.length} markdown files to convert to PDF`);
    
    for (const markdownFile of markdownFiles) {
      const filename = path.basename(markdownFile, '.md');
      const content = await fs.readFile(markdownFile, 'utf8');
      
      // Front matterを解析
      const { data, content: markdownContent } = matter(content);
      
      const page = await browser.newPage();
      
      // HTMLを直接生成
      const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${data.name || filename} - スキルシート</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Noto Sans JP', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-left: 4px solid #3498db; padding-left: 10px; margin-top: 30px; }
        h3 { color: #555; margin-top: 25px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #3498db; color: white; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        blockquote { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        ul, ol { padding-left: 20px; }
        li { margin: 5px 0; }
        strong { color: #2c3e50; }
    </style>
</head>
<body>
    ${convertMarkdownToHTML(markdownContent)}
</body>
</html>`;
      
      // HTMLをページに設定
      await page.setContent(htmlContent, { waitUntil: 'networkidle2' });
      
      // 日本語フォントの読み込みを待つ
      await page.evaluateHandle('document.fonts.ready');
      
      // 現在の日付を取得（YYYY-MM-DD形式）
      const today = new Date();
      const dateString = today.getFullYear() + 
        '-' + String(today.getMonth() + 1).padStart(2, '0') + 
        '-' + String(today.getDate()).padStart(2, '0');
      
      // PDFに変換（ファイル名に日付を追加）
      const pdfPath = path.join('output/pdf', `${filename}_${dateString}.pdf`);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        },
        preferCSSPageSize: false
      });
      
      await page.close();
      console.log(`✓ Converted: ${markdownFile} → ${pdfPath}`);
    }
    
    console.log('\n✅ All PDFs generated successfully!');
    
  } catch (error) {
    console.error('Error converting Markdown to PDF:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// シンプルなMarkdown→HTML変換
function convertMarkdownToHTML(markdown) {
  let html = markdown;
  
  // 改行を統一
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // 見出しの変換
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 区切り線
  html = html.replace(/^---$/gm, '<hr>');
  
  // 引用
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // 太字・斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // リンク
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // テーブルの処理
  const lines = html.split('\n');
  let result = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('|') && line.trim() !== '') {
      if (line.includes('---')) {
        // テーブル区切り行はスキップ
        continue;
      }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      
      if (!inTable) {
        result.push('<table>');
        inTable = true;
      }
      
      // ヘッダー行の判定
      const isHeader = cells.some(cell => 
        cell.includes('資格名') || 
        cell.includes('スキルレベル') || 
        cell.includes('業務領域') ||
        cell.includes('言語') ||
        cell.includes('サービス') ||
        cell.includes('ツール') ||
        cell.includes('技術')
      );
      
      const tag = isHeader ? 'th' : 'td';
      const row = `<tr>${cells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
      result.push(row);
    } else {
      if (inTable) {
        result.push('</table>');
        inTable = false;
      }
      
      // リスト項目
      if (line.match(/^- /)) {
        const prevLine = result[result.length - 1];
        if (!prevLine || !prevLine.includes('<ul>')) {
          result.push('<ul>');
        }
        result.push(`<li>${line.substring(2)}</li>`);
        // 次の行がリストでない場合は</ul>を追加
        if (i + 1 >= lines.length || !lines[i + 1].match(/^- /)) {
          result.push('</ul>');
        }
      } else if (line.trim() !== '') {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  
  if (inTable) {
    result.push('</table>');
  }
  
  return result.join('\n').replace(/<p><\/p>/g, '');
}

// 実行
convertMarkdownToPdf();