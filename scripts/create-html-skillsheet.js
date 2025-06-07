const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

async function createHTMLSkillsheet() {
  try {
    // skill-sheetsディレクトリのMarkdownファイルを取得
    const files = glob.sync('skill-sheets/*.md');
    
    console.log(`Found ${files.length} markdown files to convert to HTML`);
    
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
      
      // HTMLを生成
      const htmlContent = generateSkillsheetHTML(data, markdownContent);
      
      // ファイル保存
      const htmlPath = path.join('output/html', `${filename}_${dateString}.html`);
      await fs.writeFile(htmlPath, htmlContent, 'utf8');
      
      console.log(`✓ Converted: ${file} → ${htmlPath}`);
    }
    
    console.log('\n✅ All HTML files generated successfully!');
    
  } catch (error) {
    console.error('Error converting to HTML:', error);
    process.exit(1);
  }
}

function generateSkillsheetHTML(data, content) {
  // 資格情報を抽出
  const qualifications = extractQualifications(content);
  
  // 職歴情報を抽出
  const careers = extractCareers(content);
  
  // スキル情報を抽出
  const skills = extractSkills(content);
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>スキルシート - ${data.name || 'zukizukizuki'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .container {
            width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
        }
        
        h1 {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #333;
        }
        
        h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0 8px 0;
            padding: 3px 8px;
            background: #e7e7e7;
            border-left: 4px solid #666;
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 10px;
        }
        
        table.main-table {
            font-size: 9px;
        }
        
        th, td {
            border: 1px solid #333;
            padding: 4px;
            text-align: left;
            vertical-align: top;
        }
        
        th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        
        .center {
            text-align: center;
        }
        
        .qualifications-table th,
        .qualifications-table td {
            padding: 6px;
        }
        
        .skills-table {
            font-size: 10px;
        }
        
        .phase-check {
            text-align: center;
            font-weight: bold;
        }
        
        .summary-box {
            border: 1px solid #333;
            padding: 8px;
            margin: 8px 0;
            background: #fafafa;
            font-size: 11px;
            line-height: 1.5;
        }
        
        .github-link {
            text-align: center;
            margin: 10px 0;
            font-weight: bold;
        }
        
        .career-description {
            max-width: 280px;
            line-height: 1.3;
        }
        
        @media print {
            body { margin: 0; }
            .container { 
                width: 100%; 
                margin: 0; 
                padding: 5mm;
            }
            table { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>スキルシート</h1>
        
        <!-- 保有資格セクション -->
        <div class="section">
            <h2>保有資格</h2>
            <table class="qualifications-table">
                <thead>
                    <tr>
                        <th style="width: 60%">資格名</th>
                        <th style="width: 40%">取得年月</th>
                    </tr>
                </thead>
                <tbody>
                    ${qualifications.map(qual => `
                    <tr>
                        <td>${qual.name}</td>
                        <td class="center">${qual.date}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- スキル要約セクション -->
        <div class="section">
            <h2>スキル要約</h2>
            <div class="summary-box">
                <strong>業界歴 12年以上</strong><br><br>
                <strong>【得意分野】</strong><br>
                ・AIを活用した機能改善<br>
                ・terraformを用いたAWS、GCPのインフラリソースの構築・運用・コスト最適化<br>
                ・CodeBuild、github actionsを用いたterraformの自動化<br>
                ・EC2のuserdata(bash)を用いたインスタンスの自動作成<br>
                ・クラウド、オンプレミス問わずネットワーク障害対応<br>
                ・datadog、zabbix、nagiosを用いた監視設計<br>
                ・主にPythonを用いて自動化を実現するlambda関数の開発<br>
                ・VisualBasic、bash、PowerShellを用いて業務効率化を実現するscriptの作成<br>
                ・チームリーダーとしてメンバーを統括した経験
            </div>
            
            <div class="github-link">
                <strong>【Github】</strong><br>
                https://github.com/zukizukizuki?tab=repositories
            </div>
        </div>
        
        <!-- 職歴・プロジェクト経歴セクション -->
        <div class="section">
            <h2>職歴・プロジェクト経歴</h2>
            <table class="main-table">
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 3%">No</th>
                        <th rowspan="2" style="width: 12%">期間</th>
                        <th rowspan="2" style="width: 28%">業務内容</th>
                        <th rowspan="2" style="width: 12%">使用言語<br>ライブラリ</th>
                        <th rowspan="2" style="width: 12%">サーバー<br>OS・DB</th>
                        <th rowspan="2" style="width: 12%">FW・MW<br>ツールなど</th>
                        <th rowspan="2" style="width: 12%">役割<br>規模</th>
                        <th colspan="6" style="width: 9%">担当工程</th>
                    </tr>
                    <tr>
                        <th style="width: 1.5%">要件<br>定義</th>
                        <th style="width: 1.5%">基本<br>設計</th>
                        <th style="width: 1.5%">詳細<br>設計</th>
                        <th style="width: 1.5%">製造<br>構築</th>
                        <th style="width: 1.5%">テスト</th>
                        <th style="width: 1.5%">保守<br>運用</th>
                    </tr>
                </thead>
                <tbody>
                    ${careers.map((career, index) => `
                    <tr>
                        <td class="center">${index + 1}</td>
                        <td class="center">${career.period}</td>
                        <td class="career-description">${career.description}</td>
                        <td>${career.languages}</td>
                        <td>${career.servers}</td>
                        <td>${career.tools}</td>
                        <td>${career.role}</td>
                        <td class="phase-check">${career.phases[0] ? '●' : ''}</td>
                        <td class="phase-check">${career.phases[1] ? '●' : ''}</td>
                        <td class="phase-check">${career.phases[2] ? '●' : ''}</td>
                        <td class="phase-check">${career.phases[3] ? '●' : ''}</td>
                        <td class="phase-check">${career.phases[4] ? '●' : ''}</td>
                        <td class="phase-check">${career.phases[5] ? '●' : ''}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <!-- スキル評価セクション -->
        <div class="section">
            <h2>■スキル(評価レベル)</h2>
            <p style="margin: 5px 0; font-size: 10px;">
                【A】業務の独力遂行。業務課題発見・解決。後進教育 
                【B】業務の独力遂行 
                【C】業務を上位者指導のもと遂行 
                【D】実務を通じた学習経験あり 
                【E】学習経験あり
            </p>
            
            <table class="skills-table" style="width: 100%; margin-top: 10px;">
                <tr>
                    <td style="width: 33%; vertical-align: top; padding: 5px;">
                        <strong>業務範囲</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>技術</th><th>レベル</th></tr>
                            <tr><td>要件定義</td><td class="center">C</td></tr>
                            <tr><td>基本設計</td><td class="center">B</td></tr>
                            <tr><td>詳細設計</td><td class="center">A</td></tr>
                            <tr><td>製造・構築</td><td class="center">A</td></tr>
                            <tr><td>単体テスト</td><td class="center">A</td></tr>
                            <tr><td>結合・総合テスト</td><td class="center">A</td></tr>
                            <tr><td>保守・運用</td><td class="center">A</td></tr>
                            <tr><td>アジャイル開発</td><td class="center">A</td></tr>
                        </table>
                        
                        <strong style="margin-top: 10px; display: block;">クラウドサービス</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>サービス</th><th>レベル</th></tr>
                            <tr><td>AWS</td><td class="center">A</td></tr>
                            <tr><td>Google Cloud Platform</td><td class="center">B</td></tr>
                            <tr><td>Azure</td><td class="center">C</td></tr>
                        </table>
                    </td>
                    
                    <td style="width: 34%; vertical-align: top; padding: 5px;">
                        <strong>プログラミング言語・スクリプト</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>言語</th><th>レベル</th></tr>
                            <tr><td>Bash</td><td class="center">A</td></tr>
                            <tr><td>Python</td><td class="center">B</td></tr>
                            <tr><td>PowerShell</td><td class="center">B</td></tr>
                            <tr><td>terraform</td><td class="center">A</td></tr>
                            <tr><td>ansible</td><td class="center">B</td></tr>
                            <tr><td>VBA/ExcelVBA</td><td class="center">B</td></tr>
                            <tr><td>SQL</td><td class="center">B</td></tr>
                            <tr><td>Batch</td><td class="center">C</td></tr>
                            <tr><td>JavaScript</td><td class="center">E</td></tr>
                            <tr><td>HTML/CSS</td><td class="center">E</td></tr>
                            <tr><td>C#</td><td class="center">E</td></tr>
                        </table>
                    </td>
                    
                    <td style="width: 33%; vertical-align: top; padding: 5px;">
                        <strong>OS・データベース</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>技術</th><th>レベル</th></tr>
                            <tr><td>Windows</td><td class="center">A</td></tr>
                            <tr><td>Linux</td><td class="center">A</td></tr>
                            <tr><td>Unix</td><td class="center">B</td></tr>
                            <tr><td>MySQL</td><td class="center">B</td></tr>
                            <tr><td>PostgreSQL</td><td class="center">B</td></tr>
                            <tr><td>SQL Server</td><td class="center">B</td></tr>
                            <tr><td>Oracle</td><td class="center">B</td></tr>
                            <tr><td>MongoDB</td><td class="center">B</td></tr>
                            <tr><td>BigQuery</td><td class="center">B</td></tr>
                            <tr><td>DynamoDB</td><td class="center">B</td></tr>
                        </table>
                        
                        <strong style="margin-top: 10px; display: block;">監視・運用ツール</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>ツール</th><th>レベル</th></tr>
                            <tr><td>Datadog</td><td class="center">B</td></tr>
                            <tr><td>Zabbix</td><td class="center">B</td></tr>
                            <tr><td>Nagios</td><td class="center">B</td></tr>
                            <tr><td>Cacti</td><td class="center">B</td></tr>
                        </table>
                        
                        <strong style="margin-top: 10px; display: block;">その他ツール</strong>
                        <table style="width: 100%; margin-top: 5px;">
                            <tr><th>ツール</th><th>レベル</th></tr>
                            <tr><td>GitHub</td><td class="center">B</td></tr>
                            <tr><td>Docker</td><td class="center">B</td></tr>
                            <tr><td>Backlog</td><td class="center">B</td></tr>
                            <tr><td>Redmine</td><td class="center">C</td></tr>
                            <tr><td>JIRA</td><td class="center">B</td></tr>
                            <tr><td>Confluence</td><td class="center">B</td></tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
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
    if (inQualTable && !line.includes('|')) {
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
      
      // チーム規模を抽出
      if (section.includes('**チーム規模**:')) {
        const teamMatch = section.match(/\*\*チーム規模\*\*: (.*?)$/m);
        if (teamMatch) {
          role += `\\n規模: ${teamMatch[1]}`;
        }
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
      
      lines.forEach(line => {
        if (line.includes('#### 業務内容')) {
          inContent = true;
          return;
        }
        if (line.includes('#### 使用技術') || line.includes('#### 成果・自己PR')) {
          inContent = false;
          return;
        }
        if (inContent && line.startsWith('- ')) {
          contentLines.push('・' + line.substring(2));
        }
      });
      
      if (contentLines.length > 0) {
        description = `■${description}\\n${contentLines.join('\\n')}`;
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

// スキル情報を抽出（今回は使用しないが将来の拡張用）
function extractSkills(content) {
  return {};
}

// 実行
createHTMLSkillsheet();