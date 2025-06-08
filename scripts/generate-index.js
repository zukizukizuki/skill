const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// GitHub Pages用のindex.htmlを生成
async function generateIndex() {
  console.log('Generating index.html for GitHub Pages...');
  
  // 出力ディレクトリ内のファイルを検索
  const pdfFiles = glob.sync('output/pdf/*.pdf').map(f => path.basename(f));
  const excelFiles = glob.sync('output/excel/*.xlsx').map(f => path.basename(f));
  const htmlFiles = glob.sync('output/html/*.html').map(f => path.basename(f));
  
  console.log('Found files:');
  console.log('PDFs:', pdfFiles);
  console.log('Excel:', excelFiles);
  console.log('HTML:', htmlFiles);
  
  // 現在の日時を取得
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  
  const indexHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>スキルシート ダウンロード</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .file-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #dee2e6; }
        .file-card h3 { margin-top: 0; color: #007acc; }
        .file-link { display: inline-block; background: #007acc; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 5px 5px 5px 0; transition: background 0.3s; }
        .file-link:hover { background: #005a9e; }
        .file-link.disabled { background: #ccc; cursor: not-allowed; }
        .info { background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #007acc; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .timestamp { color: #666; font-size: 0.9em; margin-top: 20px; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; margin-left: 8px; }
        .status.available { background: #d4edda; color: #155724; }
        .status.unavailable { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 スキルシート ダウンロード</h1>
        
        <div class="info">
            <strong>💡 自動生成されたスキルシートファイル</strong><br>
            <a href="https://github.com/zukizukizuki/skill/blob/main/skill-sheets/zukizukizuki.md" target="_blank">Markdownファイル</a>から自動的に変換されたスキルシートをダウンロードできます。
        </div>
        
        ${pdfFiles.length === 0 ? `
        <div class="warning">
            <strong>⚠️ PDF生成について</strong><br>
            PDFファイルは技術的な制約により自動生成が不安定な場合があります。<br>
            <strong>推奨方法:</strong> 下記のHTML版を開いて、ブラウザの印刷機能（Ctrl+P）で「PDFとして保存」してください。
        </div>
        ` : ''}
        
        <h2>📊 ファイル形式別ダウンロード</h2>
        
        <div class="file-grid">
            <div class="file-card">
                <h3>📄 PDF版 ${pdfFiles.length > 0 ? '<span class="status available">利用可能</span>' : '<span class="status unavailable">生成中</span>'}</h3>
                <p>印刷に最適化されたPDFファイル</p>
                <div id="pdf-links">
                    ${pdfFiles.length > 0 
                        ? pdfFiles.map(f => `<a href="pdf/${f}" class="file-link" download="${f}">${f}</a>`).join('\n')
                        : '<span style="color: #666;">HTMLファイルから手動でPDFを生成してください</span>'
                    }
                </div>
            </div>
            
            <div class="file-card">
                <h3>📊 Excel版 ${excelFiles.length > 0 ? '<span class="status available">利用可能</span>' : '<span class="status unavailable">未生成</span>'}</h3>
                <p>編集可能なExcelファイル</p>
                <div id="excel-links">
                    ${excelFiles.map(f => `<a href="excel/${f}" class="file-link" download="${f}">${f}</a>`).join('\n') || '<span style="color: #666;">ファイルがありません</span>'}
                </div>
            </div>
            
            <div class="file-card">
                <h3>🌐 HTML版 ${htmlFiles.length > 0 ? '<span class="status available">利用可能</span>' : '<span class="status unavailable">未生成</span>'}</h3>
                <p>Webブラウザで表示可能</p>
                <div id="html-links">
                    ${htmlFiles.map(f => `<a href="html/${f}" class="file-link" target="_blank">${f}</a>`).join('\n') || '<span style="color: #666;">ファイルがありません</span>'}
                </div>
            </div>
        </div>
        
        <div class="info">
            <strong>📖 使用方法:</strong><br>
            • PDF版: そのまま印刷や閲覧に使用${pdfFiles.length === 0 ? '（HTMLから手動生成を推奨）' : ''}<br>
            • Excel版: 内容の編集や加工に使用<br>
            • HTML版: ブラウザで表示、PDFとして保存も可能（印刷機能を使用）
        </div>
        
        <div class="timestamp">
            最終更新: ${now}
        </div>
    </div>
</body>
</html>`;
  
  // index.htmlを出力ディレクトリに保存
  await fs.writeFile('output/index.html', indexHtml);
  console.log('✓ Generated index.html');
}

// 実行
if (require.main === module) {
  generateIndex().catch(console.error);
}

module.exports = { generateIndex };