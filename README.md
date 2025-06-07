# 📋 Skill Sheet Generator

Markdownで記述したスキルシートを人事・採用担当者向けにPDF・Excel・HTMLファイルとして出力するツールです。

## 🎯 目的

- 人事・採用担当者へのスキルシート共有
- Markdownで記述して、PDF・Excel・HTMLで出力
- GitHub Actionsで自動変換・デプロイ

## 🌟 特徴

- 📝 **Markdownで記述**: 技術者に馴染みのあるMarkdown形式
- 📄 **PDF出力**: 印刷・メール添付に最適（HTMLから手動変換推奨）
- 📊 **Excel出力**: 人事システムでの管理・分析に対応（1シート形式）
- 🌐 **HTML出力**: Webブラウザでの表示・PDF変換用
- 🔄 **自動変換**: GitHub Actionsで自動生成
- 🚀 **GitHub Pages**: 自動デプロイでWebアクセス可能
- 📅 **日付付きファイル名**: ファイル名に生成日が自動付与

## 🚀 使い方

### 1. スキルシートを作成

```bash
# テンプレートを使って新しいスキルシートを作成
cp templates/skill-sheet-template.md skill-sheets/your-name.md

# ファイルを編集してあなたの経歴・スキルを記入
```

### 2. ローカルで変換（オプション）

```bash
# 依存関係をインストール
npm install

# PDF・Excelファイルを生成
npm run convert:all
```

### 3. GitHubで自動変換・デプロイ

```bash
# ファイルをコミット・プッシュ
git add skill-sheets/your-name.md
git commit -m "Add skill sheet"
git push origin main
```

**GitHub Actionsが自動的に以下を実行**:
- PDF生成（HTMLから手動変換推奨）
- Excel生成（1シート形式、人事システム用）
- HTML生成（印刷最適化済み）
- GitHub Pagesに自動デプロイ
- ファイル名に日付を自動付与

### 4. 生成されたファイルの取得

**方法1: GitHub Pages（推奨）**
- `https://your-username.github.io/skill/` にアクセス
- Webページから直接ダウンロード

**方法2: GitHub Artifacts**
1. **Actionsタブ** → 最新のワークフロー → **Artifacts**
2. `skill-sheets-all-formats` をダウンロード
3. 人事・採用担当者に共有

## 📁 ディレクトリ構造

```
skill/
├── .github/workflows/
│   └── convert.yml          # GitHub Actions設定
├── skill-sheets/            # スキルシート置き場
│   └── *.md
├── templates/               # テンプレート
│   └── skill-sheet-template.md
├── scripts/                 # 変換スクリプト
│   ├── convert-to-pdf.js
│   └── convert-to-excel.js
└── package.json
```

## 📄 生成されるファイル

スキルシート更新時に自動生成されるファイル：

- **PDF**: `YourName_2025-06-07.pdf` - PDF変換手順書（実際はHTMLから手動変換）
- **Excel**: `YourName_2025-06-07.xlsx` - 1シート形式、人事システム・データ分析用
- **HTML**: `YourName_2025-06-07.html` - 印刷最適化、PDF変換用

### ローカルで生成

```bash
# Excel生成
npm run convert:excel

# HTML生成
node scripts/create-html-skillsheet.js

# PDF生成（Chrome/Chromiumが必要、文字化けの可能性あり）
npm run convert:pdf

# 推奨: HTMLをブラウザで開いてPDFとして保存
# 1. HTMLファイルをブラウザで開く
# 2. Ctrl+P → PDFとして保存
```

## 🛠️ テンプレートのカスタマイズ

`templates/skill-sheet-template.md` を編集して、組織に合わせたフォーマットに変更できます。

### サンプル項目

- 基本情報（名前・概要）
- 保有資格
- 技術スキル評価
- プロジェクト経歴
- 実績・成果

## 📋 人事担当者向け情報

### PDFの特徴
- A4サイズで印刷最適化
- 日本語フォント対応
- 面接資料として最適

### Excelの特徴  
- データ分析・フィルタリング可能
- 人事システムでの一括管理
- スキル評価の定量化

## ⚙️ GitHub設定

### GitHub Pagesの有効化

1. **Settings** → **Pages** 
2. **Source**: Deploy from a branch → **GitHub Actions**
3. **Actions** → **General** → **Workflow permissions**: Read and write permissions

### 初回セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/skill.git
cd skill

# 依存関係をインストール
npm install

# スキルシートを作成
cp templates/skill-sheet-template.md skill-sheets/your-name.md

# 編集後、プッシュ
git add .
git commit -m "Initial skill sheet"
git push origin main
```

## ⚠️ 注意事項

- **PDF生成**: ローカル実行にはChrome/Chromiumが必要（文字化けあり）
- **推奨PDF作成**: HTMLファイルをブラウザで開き「PDFとして保存」
- **Excel形式**: 3シート構成（基本情報、職歴、技術スキル）で整理
- **ファイル名**: 自動的に日付が付与されます（例: `YS_2025-06-07.pdf`）
- **GitHub Actions**: 初回は権限設定が必要な場合があります

## 📊 出力形式の詳細

### Excel形式（3シート構成）
- **基本情報シート**: 資格、スキル要約、外部リンク
- **職歴・プロジェクト経歴シート**: 表形式（No、期間、業務内容、使用技術、担当工程）
- **技術スキルシート**: カテゴリ別スキル評価（業務範囲、言語、OS・DB、クラウド、監視ツール、その他ツール）

### HTML形式
- A4印刷に最適化
- 職歴を表形式で整理
- ブラウザの印刷機能でPDF変換可能

## ライセンス

MIT License