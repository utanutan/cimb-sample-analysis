# GitHub Wikiの設定と使用方法

このドキュメントでは、作成したWikiコンテンツをGitHub Wikiにアップロードして活用する方法を説明します。

## GitHubでのWiki有効化

GitHub Wikiは通常、リポジトリ作成時にデフォルトで有効になっていますが、無効になっている場合は以下の手順で有効化できます：

1. リポジトリのトップページに移動
2. 「Settings」タブをクリック
3. 「Features」セクションで「Wikis」にチェックを入れる

## Wikiページのアップロード方法

### 方法1：GitHub Web UI経由

1. リポジトリページで「Wiki」タブをクリック
2. 「Create the first page」または「New page」ボタンをクリック
3. タイトルと内容を入力し、「Save page」をクリック
4. 必要に応じて他のページも同様に作成

### 方法2：ローカルからのクローンとプッシュ

1. Wikiリポジトリをローカルにクローンする：
   ```
   git clone https://github.com/utanutan/cimb-sample-analysis.wiki.git
   ```

2. 作成したマークダウンファイルをWikiリポジトリにコピー：
   ```
   # 例：ホームページのコピー（Home.mdという名前に変更）
   cp wiki-home.md /path/to/cimb-sample-analysis.wiki/Home.md
   
   # CSVアップロードエピックページのコピー
   cp wiki-epic-csv-upload.md /path/to/cimb-sample-analysis.wiki/Epic-CSV-Upload.md
   
   # アジャイルプロセスページのコピー
   cp wiki-agile-process.md /path/to/cimb-sample-analysis.wiki/Agile-Process.md
   ```

3. 変更をコミットしてプッシュ：
   ```
   cd /path/to/cimb-sample-analysis.wiki
   git add .
   git commit -m "Add initial wiki pages"
   git push origin master
   ```

## Wiki間のリンク作成

Wikiページ間でリンクを作成するには、以下の書式を使用します：

```markdown
[リンクテキスト](./ページ名)
```

例えば：
```markdown
[CSVアップロード機能の詳細](./Epic-CSV-Upload)
```

## サイドバーの作成

Wiki内に`_Sidebar.md`という名前のファイルを作成すると、すべてのWikiページに表示されるナビゲーションサイドバーを設定できます：

```markdown
### プロジェクト概要
* [ホーム](./Home)
* [技術スタック](./Tech-Stack)

### エピック
* [CSVアップロード機能](./Epic-CSV-Upload)
* [データ解析・グルーピング機能](./Epic-Data-Analysis)
* [グラフ可視化機能](./Epic-Graph-Visualization)
* [UI/UX改善](./Epic-UI-UX)
* [運用・テスト](./Epic-Operation)

### プロセス
* [アジャイル開発プロセス](./Agile-Process)
* [GitHub運用ルール](./GitHub-Rules)
```

## 次のステップ

1. 上記の手順でWikiリポジトリをクローン
2. 作成したマークダウンファイルをWikiリポジトリにコピー（適切なファイル名に変更）
3. サイドバーファイル（_Sidebar.md）を作成
4. 変更をコミットしてプッシュ
5. GitHub Web UI上でWikiを確認・編集
