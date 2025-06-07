# CLAUDE.md

このファイルはClaude Codeでの作業時の指針を記載しています。

## プロジェクト概要

Skill Sheet Generator - Markdownで記述したスキルシートを人事・採用担当者向けにPDF・Excelファイルとして出力するツール

**目的**: 人事・採用担当者への効率的なスキルシート共有

## 開発・運用方針

### ブランチ戦略

- **mainブランチには直接プッシュせず**、Pull Requestを推奨
- フォーク&プルリクエストで貢献
- 各ユーザーは自分用にフォークして使用

### GitHub Actions ワークフロー

#### 現在のワークフロー
1. **convert.yml**: スキルシート変換とArtifacts生成
2. **deploy.yml**: GitHub Pagesへの自動デプロイ

#### 権限設定
- リポジトリ設定で "Read and write permissions" を有効化
- GitHub Pages は "GitHub Actions" ソースを使用

### ファイル管理

- **skill-sheets/**: Markdownのスキルシートファイル
- **output/**: 自動生成されるPDF/Excelファイル
  - GitHub Actions で生成
  - Artifacts からダウンロード可能
  - ファイル名に日付自動付与

### 依存関係

- Node.js 20+
- ExcelJS (Excel出力用)
- Puppeteer (PDF生成用)
- gray-matter (Front matter解析用)

### 実行コマンド

```bash
# PDF・Excel生成
npm run convert:all

# 個別変換
npm run convert:pdf    # ローカルではChrome必要
npm run convert:excel
```

### セキュリティとプライバシー

- **公開リポジトリ**: 誰でも閲覧可能なため、個人情報は一切記載しない
- **採用時の詳細情報**: 必要に応じて個別のチャネルで提供
- **フォーク推奨**: 各エンジニアが自分用にフォークして使用

## TODO

- [x] GitHub Actions の権限エラーを解決
- [x] 個人情報を除いた公開版に移行
- [x] GitHub Pages デプロイ機能の実装
- [ ] テンプレートの改善とサンプル追加
- [ ] 各種フォーマットの出力品質向上

## 使用上の注意

### プライバシー保護
- スキルシートには個人特定可能な情報を記載しない
- 年齢、住所、詳細な連絡先は含めない
- 技術スキル、経歴、資格のみを記載する