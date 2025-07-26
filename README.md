# CIMB取引明細分析アプリケーション

## プロジェクト概要
CIMBの取引明細CSVデータをアップロードし、支出内容を分析・グループ化して視覚的に表示するWebアプリケーションです。

### 主な機能
- CSVアップロード：CIMBの取引CSVをアップロードして解析
- データ解析・グルーピング：日付別・支出グループ別に取引を分類
- グラフ可視化：解析結果を折れ線・円グラフで見やすく表示
- 直感的なUI/UX：スマホ/PCで操作しやすいインターフェース

### 技術スタック
- フロントエンド: TypeScript, Next.js
- グラフ表示: Chart.js
- データ処理: クライアントサイド処理（DBなし）
- デプロイ: Vercel / GitHub Pages

## 開発方針
このプロジェクトは個人向けアジャイル開発手法を採用し、GitHub Projectsによるカンバン方式でタスク管理を行います。
Windsurf AIをペアプログラマーとして活用し、1週間単位のスプリントで機能を段階的にリリースしていきます。

## セットアップ方法
```bash
# リポジトリのクローン
git clone [リポジトリURL]

# 依存関係のインストール
cd cimb-transaction-analyzer
npm install

# 開発サーバーの起動
npm run dev
```

## プロジェクト管理
- GitHub Projects: [@utanutan's kanban sample project](https://github.com/users/utanutan/projects/2)
- 開発プロセスの詳細は [docs/project-plan.md](./docs/project-plan.md) を参照してください
