const fs = require('fs-extra');
const path = require('path');
const puppeteer = require('puppeteer');
const glob = require('glob');
const matter = require('gray-matter');

async function convertMarkdownToPdf() {
  let browser;
  
  try {
    console.log('Starting PDF conversion process...');
    console.log('Current working directory:', process.cwd());
    console.log('Environment variables:');
    console.log('- PUPPETEER_EXECUTABLE_PATH:', process.env.PUPPETEER_EXECUTABLE_PATH);
    console.log('- DISPLAY:', process.env.DISPLAY);
    
    // output/pdf ディレクトリを確実に作成
    await fs.ensureDir('output/pdf');
    console.log('Created output/pdf directory');
    
    // Puppeteerを起動（日本語フォント対応）
    const puppeteerOptions = {
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    };
    
    // GitHub Actions環境でのChromiumパス設定
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      console.log('Using custom Chromium path:', process.env.PUPPETEER_EXECUTABLE_PATH);
    }
    
    console.log('Launching Puppeteer with options:', JSON.stringify(puppeteerOptions, null, 2));
    browser = await puppeteer.launch(puppeteerOptions);
    console.log('Puppeteer launched successfully');
    
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const markdownFiles = glob.sync('skill-sheets/*.md');
    
    console.log(`Found ${markdownFiles.length} markdown files to convert to PDF`);
    console.log('Markdown files:', markdownFiles);
    
    for (const markdownFile of markdownFiles) {
      const filename = path.basename(markdownFile, '.md');
      const content = await fs.readFile(markdownFile, 'utf8');
      
      // Front matterを解析
      const { data, content: markdownContent } = matter(content);
      
      console.log(`Processing file: ${markdownFile}`);
      console.log(`Front matter:`, data);
      console.log(`Content length: ${markdownContent.length} characters`);
      
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
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Noto Sans JP', '游ゴシック', 'Yu Gothic', sans-serif;
            line-height: 1.7;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            font-size: 11pt;
            background: white;
        }
        
        /* 見出しスタイル */
        h1 { 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 8px; 
            margin: 20px 0 15px 0;
            font-size: 18pt;
            font-weight: 700;
        }
        h2 { 
            color: #34495e; 
            border-left: 4px solid #3498db; 
            padding-left: 12px; 
            margin: 25px 0 12px 0;
            font-size: 14pt;
            font-weight: 600;
            page-break-after: avoid;
        }
        h3 { 
            color: #555; 
            margin: 20px 0 8px 0;
            font-size: 12pt;
            font-weight: 600;
            page-break-after: avoid;
        }
        h4 {
            color: #666;
            margin: 15px 0 8px 0;
            font-size: 11pt;
            font-weight: 500;
            page-break-after: avoid;
        }
        
        /* 段落・テキスト */
        p {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        /* テーブルスタイル */
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            font-size: 10pt;
            page-break-inside: avoid;
        }
        th, td { 
            padding: 8px 10px; 
            border: 1px solid #ddd; 
            text-align: left; 
            vertical-align: top;
        }
        th { 
            background-color: #3498db; 
            color: white; 
            font-weight: 600;
            font-size: 10pt;
        }
        tr:nth-child(even) { 
            background-color: #f8f9fa; 
        }
        
        /* リストスタイル */
        ul, ol { 
            padding-left: 18px; 
            margin: 10px 0;
        }
        li { 
            margin: 4px 0; 
            line-height: 1.5;
        }
        
        /* 強調・装飾 */
        strong { 
            color: #2c3e50; 
            font-weight: 600;
        }
        em {
            font-style: italic;
            color: #555;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
        }
        pre {
            background-color: #f8f8f8;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
            font-size: 9pt;
        }
        
        /* 引用スタイル */
        blockquote { 
            background: #fff3cd; 
            border-left: 4px solid #ffc107; 
            padding: 12px 15px; 
            margin: 15px 0;
            font-style: italic;
        }
        
        /* 区切り線 */
        hr {
            border: none;
            border-top: 2px solid #e9ecef;
            margin: 25px 0;
            page-break-after: avoid;
        }
        
        /* リンク */
        a {
            color: #333;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        
        /* PDF用：印刷時はリンクの色を通常のテキストと同じにする */
        @media print {
            a {
                color: #333 !important;
                text-decoration: none !important;
            }
        }
        
        /* ページ分割制御 */
        .section {
            page-break-inside: avoid;
        }
        
        /* 印刷時の調整 */
        @media print {
            body {
                padding: 15mm;
                font-size: 10pt;
            }
            h1 { font-size: 16pt; }
            h2 { font-size: 13pt; }
            h3 { font-size: 11pt; }
            table { font-size: 9pt; }
            th, td { padding: 6px 8px; }
        }
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
      console.log(`Generating PDF: ${pdfPath}`);
      
      const pdfOptions = {
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
      };
      
      console.log('PDF options:', JSON.stringify(pdfOptions, null, 2));
      await page.pdf(pdfOptions);
      
      // ファイルが実際に作成されたか確認
      const fileExists = await fs.pathExists(pdfPath);
      console.log(`PDF file exists: ${fileExists}`);
      
      if (fileExists) {
        const stats = await fs.stat(pdfPath);
        console.log(`PDF file size: ${stats.size} bytes`);
      }
      
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

// 改良されたMarkdown→HTML変換
function convertMarkdownToHTML(markdown) {
  let html = markdown;
  
  // 改行を統一
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Front matterを除去
  html = html.replace(/^---[\s\S]*?---\n/, '');
  
  const lines = html.split('\n');
  let result = [];
  let inTable = false;
  let inUl = false;
  let inOl = false;
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // コードブロックの処理
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        result.push('</pre></code>');
        inCodeBlock = false;
      } else {
        result.push('<code><pre>');
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      result.push(line);
      continue;
    }
    
    // テーブルの処理
    if (line.includes('|') && line.trim() !== '') {
      if (line.includes('---')) {
        continue; // テーブル区切り行はスキップ
      }
      
      // 他のリストを閉じる
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      
      if (!inTable) {
        result.push('<table>');
        inTable = true;
      }
      
      // ヘッダー行の判定
      // 完全一致でヘッダーを判定する（部分一致を避ける）
      const headerPatterns = [
        '資格名', '取得年月', 'スキルレベル', '業務領域',
        '言語', 'サービス', 'ツール', '技術', 'OS/DB', 'OS'
      ];
      
      const isHeader = cells.some(cell => {
        const trimmedCell = cell.trim();
        // 完全一致、または「技術」の場合は単独の列タイトルとして判定
        return headerPatterns.includes(trimmedCell) || 
               (trimmedCell === '技術' && cells.length === 2) ||
               (trimmedCell === 'OS' && cells.length === 2);
      });
      
      const tag = isHeader ? 'th' : 'td';
      const processedCells = cells.map(cell => processInlineMarkdown(cell));
      const row = `<tr>${processedCells.map(cell => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
      result.push(row);
      continue;
    }
    
    // テーブル終了
    if (inTable && (!line.includes('|') || line.trim() === '')) {
      result.push('</table>');
      inTable = false;
    }
    
    // 見出しの処理
    if (line.match(/^#{1,6} /)) {
      // 他のリストを閉じる
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s/, '');
      result.push(`<h${level}>${processInlineMarkdown(text)}</h${level}>`);
      continue;
    }
    
    // 区切り線
    if (line.match(/^---+$/)) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push('<hr>');
      continue;
    }
    
    // 引用
    if (line.match(/^> /)) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<blockquote>${processInlineMarkdown(line.substring(2))}</blockquote>`);
      continue;
    }
    
    // 番号付きリスト
    if (line.match(/^\d+\.\s/)) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) {
        result.push('<ol>');
        inOl = true;
      }
      const content = line.replace(/^\d+\.\s/, '');
      result.push(`<li>${processInlineMarkdown(content)}</li>`);
      
      // 次の行が番号付きリストでない場合は閉じる
      if (i + 1 >= lines.length || !lines[i + 1].match(/^\d+\.\s/)) {
        result.push('</ol>');
        inOl = false;
      }
      continue;
    }
    
    // 箇条書きリスト
    if (line.match(/^- /)) {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) {
        result.push('<ul>');
        inUl = true;
      }
      const content = line.substring(2);
      result.push(`<li>${processInlineMarkdown(content)}</li>`);
      
      // 次の行が箇条書きでない場合は閉じる
      if (i + 1 >= lines.length || !lines[i + 1].match(/^- /)) {
        result.push('</ul>');
        inUl = false;
      }
      continue;
    }
    
    // 通常の段落
    if (line.trim() !== '') {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<p>${processInlineMarkdown(line)}</p>`);
    } else {
      // 空行はそのまま
      result.push('');
    }
  }
  
  // 最後にテーブルやリストが開いていれば閉じる
  if (inTable) result.push('</table>');
  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');
  if (inCodeBlock) result.push('</pre></code>');
  
  return result.join('\n').replace(/\n\s*\n/g, '\n');
}

// インライン要素の処理
function processInlineMarkdown(text) {
  let processed = text;
  
  // 太字・斜体
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // インラインコード
  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // リンク（PDFでは通常のテキストとして扱う）
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  
  return processed;
}

// 実行
convertMarkdownToPdf();