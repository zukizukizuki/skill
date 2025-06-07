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
      
      // 基本情報シート
      const infoSheet = workbook.addWorksheet('基本情報');
      await createBasicInfoSheet(infoSheet, data, markdownContent);
      
      // 職歴シート
      const careerSheet = workbook.addWorksheet('職歴・プロジェクト経歴');
      await createCareerSheet(careerSheet, markdownContent);
      
      // スキルシート
      const skillSheet = workbook.addWorksheet('技術スキル');
      await createSkillSheet(skillSheet, markdownContent);
      
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

// 基本情報シートを作成
async function createBasicInfoSheet(worksheet, data, content) {
  // スタイル定義
  const headerStyle = {
    font: { bold: true, size: 12 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const dataStyle = {
    alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  let row = 1;
  
  // タイトル
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = 'スキルシート';
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };
  row += 2;
  
  // 保有資格セクション
  worksheet.mergeCells(`A${row}:D${row}`);
  worksheet.getCell(`A${row}`).value = '保有資格';
  worksheet.getCell(`A${row}`).style = headerStyle;
  row++;
  
  // 資格テーブルヘッダー
  worksheet.getCell(`A${row}`).value = '資格名';
  worksheet.getCell(`B${row}`).value = '取得年月';
  worksheet.getCell(`A${row}`).style = headerStyle;
  worksheet.getCell(`B${row}`).style = headerStyle;
  row++;
  
  // 資格データを抽出
  const qualifications = extractQualifications(content);
  qualifications.forEach(qual => {
    worksheet.getCell(`A${row}`).value = qual.name;
    worksheet.getCell(`B${row}`).value = qual.date;
    worksheet.getCell(`A${row}`).style = dataStyle;
    worksheet.getCell(`B${row}`).style = dataStyle;
    row++;
  });
  
  row += 2;
  
  // スキル要約
  worksheet.mergeCells(`A${row}:D${row}`);
  worksheet.getCell(`A${row}`).value = 'スキル要約';
  worksheet.getCell(`A${row}`).style = headerStyle;
  row++;
  
  worksheet.mergeCells(`A${row}:D${row}`);
  worksheet.getCell(`A${row}`).value = `業界歴 12年以上

【得意分野】
・AIを活用した機能改善
・terraformを用いたAWS、GCPのインフラリソースの構築・運用・コスト最適化
・CodeBuild、github actionsを用いたterraformの自動化
・EC2のuserdata(bash)を用いたインスタンスの自動作成
・クラウド、オンプレミス問わずネットワーク障害対応
・datadog、zabbix、nagiosを用いた監視設計
・主にPythonを用いて自動化を実現するlambda関数の開発
・VisualBasic、bash、PowerShellを用いて業務効率化を実現するscriptの作成
・チームリーダーとしてメンバーを統括した経験`;
  worksheet.getCell(`A${row}`).style = dataStyle;
  worksheet.getRow(row).height = 200;
  
  // 列幅調整
  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(2).width = 20;
  worksheet.getColumn(3).width = 30;
  worksheet.getColumn(4).width = 20;
}

// 職歴シートを作成
async function createCareerSheet(worksheet, content) {
  const headerStyle = {
    font: { bold: true, size: 10 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const dataStyle = {
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    font: { size: 9 },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  let row = 1;
  
  // ヘッダー行
  const headers = [
    'No', '期間', '業務内容', '使用言語\nライブラリ', 'サーバー\nOS・DB', 
    'FW・MW\nツールなど', '役割\n規模', '担当工程'
  ];
  
  const subHeaders = ['', '', '', '', '', '', '', '要件定義', '基本設計', '詳細設計', '製造・構築', 'テスト', '保守・運用'];
  
  // メインヘッダー
  headers.forEach((header, index) => {
    if (index === 7) {
      // 担当工程は6列にまたがる
      worksheet.mergeCells(row, index + 1, row, index + 6);
    }
    worksheet.getCell(row, index + 1).value = header;
    worksheet.getCell(row, index + 1).style = headerStyle;
  });
  row++;
  
  // サブヘッダー（担当工程の詳細）
  subHeaders.forEach((subHeader, index) => {
    if (index >= 7) {
      worksheet.getCell(row, index + 1).value = subHeader;
      worksheet.getCell(row, index + 1).style = headerStyle;
    }
  });
  row++;
  
  // 職歴データを抽出して追加
  const careers = extractCareers(content);
  careers.forEach((career, index) => {
    worksheet.getCell(row, 1).value = index + 1;
    worksheet.getCell(row, 2).value = career.period;
    worksheet.getCell(row, 3).value = career.description;
    worksheet.getCell(row, 4).value = career.languages;
    worksheet.getCell(row, 5).value = career.servers;
    worksheet.getCell(row, 6).value = career.tools;
    worksheet.getCell(row, 7).value = career.role;
    
    // 担当工程のチェックマーク
    career.phases.forEach((phase, phaseIndex) => {
      worksheet.getCell(row, 8 + phaseIndex).value = phase ? '●' : '';
    });
    
    // スタイル適用
    for (let col = 1; col <= 13; col++) {
      worksheet.getCell(row, col).style = dataStyle;
    }
    
    worksheet.getRow(row).height = 100;
    row++;
  });
  
  // 列幅調整
  worksheet.getColumn(1).width = 5;   // No
  worksheet.getColumn(2).width = 15;  // 期間
  worksheet.getColumn(3).width = 40;  // 業務内容
  worksheet.getColumn(4).width = 15;  // 使用言語
  worksheet.getColumn(5).width = 15;  // サーバー
  worksheet.getColumn(6).width = 15;  // ツール
  worksheet.getColumn(7).width = 15;  // 役割
  // 担当工程列
  for (let i = 8; i <= 13; i++) {
    worksheet.getColumn(i).width = 8;
  }
}

// スキルシートを作成
async function createSkillSheet(worksheet, content) {
  const headerStyle = {
    font: { bold: true, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };
  
  const dataStyle = {
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  };

  let row = 1;
  
  // 評価レベル説明
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = '■スキル(評価レベル)';
  worksheet.getCell('A1').style = headerStyle;
  row++;
  
  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = '【A】業務の独力遂行。業務課題発見・解決。後進教育 【B】業務の独力遂行 【C】業務を上位者指導のもと遂行 【D】実務を通じた学習経験あり 【E】学習経験あり';
  worksheet.getCell('A2').style = dataStyle;
  worksheet.getCell('A2').alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  row += 2;
  
  // スキルテーブル作成
  const skillSections = [
    {
      title: '業務範囲',
      skills: [
        ['要件定義', 'C'],
        ['基本設計', 'B'],
        ['詳細設計', 'A'],
        ['製造・構築', 'A'],
        ['単体テスト', 'A'],
        ['結合・総合テスト', 'A'],
        ['保守・運用', 'A'],
        ['アジャイル開発', 'A']
      ]
    },
    {
      title: 'プログラミング言語・スクリプト',
      skills: [
        ['Bash', 'A'],
        ['Python', 'B'],
        ['PowerShell', 'B'],
        ['terraform', 'A'],
        ['ansible', 'B'],
        ['VBA/ExcelVBA', 'B'],
        ['SQL', 'B'],
        ['Batch', 'C'],
        ['JavaScript', 'E'],
        ['HTML/CSS', 'E'],
        ['C#', 'E']
      ]
    },
    {
      title: 'OS・データベース',
      skills: [
        ['Windows', 'A'],
        ['Linux', 'A'],
        ['Unix', 'B'],
        ['MySQL', 'B'],
        ['PostgreSQL', 'B'],
        ['SQL Server', 'B'],
        ['Oracle', 'B'],
        ['MongoDB', 'B'],
        ['BigQuery', 'B'],
        ['DynamoDB', 'B']
      ]
    },
    {
      title: 'クラウドサービス',
      skills: [
        ['AWS', 'A'],
        ['Google Cloud Platform', 'B'],
        ['Azure', 'C']
      ]
    },
    {
      title: '監視・運用ツール',
      skills: [
        ['Datadog', 'B'],
        ['Zabbix', 'B'],
        ['Nagios', 'B'],
        ['Cacti', 'B']
      ]
    },
    {
      title: 'その他ツール',
      skills: [
        ['GitHub', 'B'],
        ['Docker', 'B'],
        ['Backlog', 'B'],
        ['Redmine', 'C'],
        ['JIRA', 'B'],
        ['Confluence', 'B']
      ]
    }
  ];
  
  skillSections.forEach(section => {
    // セクションタイトル
    worksheet.mergeCells(`A${row}:C${row}`);
    worksheet.getCell(`A${row}`).value = section.title;
    worksheet.getCell(`A${row}`).style = headerStyle;
    row++;
    
    // ヘッダー
    worksheet.getCell(`A${row}`).value = '技術';
    worksheet.getCell(`B${row}`).value = 'スキルレベル';
    worksheet.getCell(`A${row}`).style = headerStyle;
    worksheet.getCell(`B${row}`).style = headerStyle;
    row++;
    
    // スキルデータ
    section.skills.forEach(skill => {
      worksheet.getCell(`A${row}`).value = skill[0];
      worksheet.getCell(`B${row}`).value = skill[1];
      worksheet.getCell(`A${row}`).style = dataStyle;
      worksheet.getCell(`B${row}`).style = dataStyle;
      row++;
    });
    
    row++; // セクション間のスペース
  });
  
  // 列幅調整
  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 30;
}

// 資格情報を抽出
function extractQualifications(content) {
  const qualifications = [];
  const lines = content.split('\n');
  let inQualTable = false;
  
  for (const line of lines) {
    if (line.includes('| 資格名 | 取得年月 |')) {
      inQualTable = true;
      continue;
    }
    if (inQualTable && line.includes('|') && !line.includes('---')) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length >= 2) {
        qualifications.push({
          name: cells[0],
          date: cells[1]
        });
      }
    }
    if (inQualTable && line.trim() === '') {
      inQualTable = false;
    }
  }
  
  return qualifications;
}

// 職歴情報を抽出
function extractCareers(content) {
  const careers = [];
  const sections = content.split('---');
  
  sections.forEach(section => {
    if (section.includes('### ') && section.includes('**期間**:')) {
      const lines = section.split('\n');
      let period = '';
      let description = '';
      let languages = '';
      let servers = '';
      let tools = '';
      let role = '';
      let phases = [false, false, false, false, false, false];
      
      // 期間とプロジェクト名を抽出
      const titleMatch = section.match(/### (\d+)\. (.*?)（(.*?)）/);
      if (titleMatch) {
        period = titleMatch[3];
        description = titleMatch[2];
      }
      
      // 使用技術を抽出
      if (section.includes('**言語**:')) {
        const langMatch = section.match(/\*\*言語\*\*: (.*?)$/m);
        if (langMatch) languages = langMatch[1];
      }
      
      if (section.includes('**OS')) {
        const serverMatch = section.match(/\*\*OS[^:]*\*\*: (.*?)$/m);
        if (serverMatch) servers = serverMatch[1];
      }
      
      if (section.includes('**ツール**:')) {
        const toolMatch = section.match(/\*\*ツール\*\*: (.*?)$/m);
        if (toolMatch) tools = toolMatch[1];
      }
      
      // 役割を抽出
      if (section.includes('**役割**:')) {
        const roleMatch = section.match(/\*\*役割\*\*: (.*?)$/m);
        if (roleMatch) role = roleMatch[1];
      }
      
      // 担当工程を抽出
      if (section.includes('**担当工程**:')) {
        const phaseMatch = section.match(/\*\*担当工程\*\*: (.*?)$/m);
        if (phaseMatch) {
          const phaseText = phaseMatch[1];
          phases[0] = phaseText.includes('要件定義');
          phases[1] = phaseText.includes('基本設計');
          phases[2] = phaseText.includes('詳細設計');
          phases[3] = phaseText.includes('製造・構築');
          phases[4] = phaseText.includes('テスト');
          phases[5] = phaseText.includes('保守・運用');
        }
      }
      
      // 業務内容を整理
      const contentLines = [];
      let inContent = false;
      let inTech = false;
      
      lines.forEach(line => {
        if (line.includes('#### 業務内容')) {
          inContent = true;
          return;
        }
        if (line.includes('#### 使用技術')) {
          inContent = false;
          inTech = true;
          return;
        }
        if (line.includes('#### 成果・自己PR')) {
          inContent = false;
          inTech = false;
          return;
        }
        if (inContent && line.startsWith('- ')) {
          contentLines.push(line.substring(2));
        }
      });
      
      if (contentLines.length > 0) {
        description = `■${description}\n${contentLines.join('\n')}`;
      }
      
      careers.push({
        period,
        description,
        languages,
        servers,
        tools,
        role,
        phases
      });
    }
  });
  
  return careers;
}

// 実行
convertMarkdownToExcel();