const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const ExcelJS = require('exceljs');

async function convertMarkdownToExcel() {
  try {
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const files = glob.sync('skill-sheets/*.md');
    
    console.log(`Found ${files.length} markdown files to convert to Excel`);
    
    // 各Markdownファイルを変換
    for (const file of files) {
      const filename = path.basename(file, '.md');
      const content = await fs.readFile(file, 'utf8');
      
      // Front matterを解析
      const { data, content: markdownContent } = matter(content);
      
      // 現在の日付を取得（YYYY-MM-DD形式）
      const today = new Date();
      const dateString = today.getFullYear() + 
        '-' + String(today.getMonth() + 1).padStart(2, '0') + 
        '-' + String(today.getDate()).padStart(2, '0');
      
      // Excelワークブックを作成
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('スキルシート');
      
      // ヘッダー行のスタイル
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
      
      // データ行のスタイル
      const dataStyle = {
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
      
      let currentRow = 1;
      
      // タイトル
      worksheet.mergeCells('A1:B1');
      worksheet.getCell('A1').value = 'スキルシート';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      currentRow += 2;
      
      // Markdownを解析してExcelに変換
      const lines = markdownContent.split('\n');
      let inTable = false;
      let tableHeaders = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('# ')) {
          // H1 - メインタイトル（スキップ）
          continue;
        } else if (line.startsWith('## ')) {
          // H2 - セクションタイトル
          if (currentRow > 3) currentRow++; // セクション間のスペース
          worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
          worksheet.getCell(`A${currentRow}`).value = line.replace('## ', '');
          worksheet.getCell(`A${currentRow}`).font = { size: 14, bold: true };
          worksheet.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
          currentRow++;
          inTable = false;
        } else if (line.startsWith('### ')) {
          // H3 - サブセクション
          worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
          worksheet.getCell(`A${currentRow}`).value = line.replace('### ', '');
          worksheet.getCell(`A${currentRow}`).font = { size: 12, bold: true };
          currentRow++;
          inTable = false;
        } else if (line.includes('|') && line.includes('---')) {
          // テーブルの区切り行
          continue;
        } else if (line.includes('|')) {
          // テーブル行
          const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
          
          if (!inTable) {
            // テーブル開始 - ヘッダー行
            tableHeaders = cells;
            for (let j = 0; j < cells.length; j++) {
              const cell = worksheet.getCell(currentRow, j + 1);
              cell.value = cells[j];
              cell.style = headerStyle;
            }
            inTable = true;
            currentRow++;
          } else {
            // データ行
            for (let j = 0; j < cells.length; j++) {
              const cell = worksheet.getCell(currentRow, j + 1);
              cell.value = cells[j];
              cell.style = dataStyle;
            }
            currentRow++;
          }
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // リスト項目
          worksheet.getCell(`A${currentRow}`).value = '•';
          worksheet.getCell(`B${currentRow}`).value = line.replace(/^[*-]\s/, '');
          worksheet.getCell(`B${currentRow}`).style = dataStyle;
          currentRow++;
          inTable = false;
        } else if (line && !line.startsWith('>')) {
          // 通常のテキスト
          worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
          worksheet.getCell(`A${currentRow}`).value = line;
          worksheet.getCell(`A${currentRow}`).style = dataStyle;
          currentRow++;
          inTable = false;
        }
      }
      
      // 列幅を調整
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 50;
      
      // ファイル保存（ファイル名に日付を追加）
      const excelPath = path.join('output/excel', `${filename}_${dateString}.xlsx`);
      await workbook.xlsx.writeFile(excelPath);
      
      console.log(`✓ Converted: ${file} → ${excelPath}`);
    }
    
    console.log('\n✅ All Excel files generated successfully!');
    
  } catch (error) {
    console.error('Error converting to Excel:', error);
    process.exit(1);
  }
}

// 実行
convertMarkdownToExcel();