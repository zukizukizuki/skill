const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// PDF生成が失敗した場合の手順書を生成
async function generatePdfInstructions() {
  console.log('Generating PDF instructions...');
  
  // HTMLファイルを検索
  const htmlFiles = glob.sync('output/html/*.html');
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found to create PDF instructions');
    return;
  }
  
  const instructions = `# PDFファイルの生成方法

## 自動生成が失敗した場合の手動変換手順

### HTMLファイルからPDFを生成する方法

1. 以下のHTMLファイルをダウンロードしてください：
${htmlFiles.map(f => `   - ${path.basename(f)}`).join('\n')}

2. ダウンロードしたHTMLファイルをWebブラウザ（Chrome、Edge、Firefox等）で開きます

3. ブラウザの印刷機能を使用します：
   - Windows: Ctrl + P
   - Mac: Command + P

4. 印刷設定で以下を確認：
   - 送信先: "PDFとして保存" または "Microsoft Print to PDF"
   - 用紙サイズ: A4
   - 余白: なし または 最小
   - 背景のグラフィック: 有効にする ✓

5. 「保存」または「印刷」をクリックしてPDFを生成

### 生成されたPDFの確認

- 日本語が正しく表示されているか確認
- レイアウトが崩れていないか確認
- 表が正しく表示されているか確認

### トラブルシューティング

- **文字化けする場合**: 別のブラウザで試してください
- **レイアウトが崩れる場合**: 印刷プレビューで余白を調整してください
- **表が切れる場合**: 用紙の向きを横向きに変更してください
`;
  
  // 手順書をPDFディレクトリに保存
  await fs.ensureDir('output/pdf');
  await fs.writeFile('output/pdf/PDF生成手順.txt', instructions, 'utf8');
  console.log('✓ Generated PDF instructions');
}

// 実行
if (require.main === module) {
  generatePdfInstructions().catch(console.error);
}

module.exports = { generatePdfInstructions };