# 📋 Skill Sheet Generator

Markdownで記述したスキルシートを人事・採用担当者向けにPDF・Excelファイルとして出力するツールです。

## 🎯 目的

- 人事・採用担当者へのスキルシート共有
- Markdownで記述して、PDF・Excelで出力
- GitHub Actionsで自動変換

## 🌟 特徴

- 📝 **Markdownで記述**: 技術者に馴染みのあるMarkdown形式
- 📄 **PDF出力**: 印刷・メール添付に最適
- 📊 **Excel出力**: 人事システムでの管理・分析に対応
- 🔄 **自動変換**: GitHub Actionsで自動生成
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

### 3. GitHubで自動変換

```bash
# ファイルをコミット・プッシュ
git add skill-sheets/your-name.md
git commit -m "Add skill sheet"
git push origin main
```

**GitHub Actionsが自動的に以下を実行**:
- PDF生成（印刷・メール添付用）
- Excel生成（人事システム用）
- ファイル名に日付を自動付与

### 4. 生成されたファイルの取得

1. **Actionsタブ** → 最新のワークフロー → **Artifacts**
2. `pdf-output` と `excel-output` をダウンロード
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

- **PDF**: `YourName_2025-06-07.pdf` - 印刷・メール添付用
- **Excel**: `YourName_2025-06-07.xlsx` - 人事システム・データ分析用

### ローカルで生成

```bash
# PDF生成（Chrome/Chromiumが必要）
npm run convert:pdf

# Excel生成
npm run convert:excel

# 両方を生成
npm run convert:all
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

## ⚠️ 注意事項

- **PDF生成**: ローカル実行にはChrome/Chromiumが必要
- **ファイル名**: 自動的に日付が付与されます（例: `YS_2025-06-07.pdf`）
- **GitHub Actions**: 初回は権限設定が必要な場合があります

## ライセンス

MIT License