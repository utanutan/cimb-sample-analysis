# Windsurf × GitHub Agile プロジェクト管理テンプレート

以下のプロンプトをWindsurfに対して使うことで、任意のプロジェクトに対してアジャイルプロジェクト管理を設定できます。プロジェクト名、エピック、ユーザーストーリーなどを変更して利用してください。

```
@utanutan's kanban sample project (または任意のGitHub Project名)で以下のプロジェクトを管理して進めます。本フォルダ内に必要なドキュメントの作成と、タスク、優先順位、スケジュールをgithubプロジェクトで管理して進捗を管理してください。

⸻

0. 前提・ゴール定義
	•	ツール：Windsurf（AI コーディングアシスタント）、GitHub（ソース管理・Issue/Projects）
	•	プロジェクト概要：
	•	[プロジェクトの主要機能をここに記載]
	•	[プロジェクトの技術的制約をここに記載]
	•	おもな課題：
	1.	スケジュール管理
	2.	タスク管理
	3.	複数プロジェクトの並行
	4.	運用（バグ対応など）
	5.	次フェーズへの継続性確保

⸻

1. アジャイル導入の準備
	1.	GitHub リポジトリの初期設定
	•	main ブランチ保護ルール設定
	•	issues → Projects（Beta）で Kanban ボードを準備
	2.	役割の明確化（自分＋AI）
	•	あなた：プロダクトオーナー ＆ スクラムマスター
	•	Windsurf：ペアプログラマー（コード生成・リファクタリング・ユニットテスト作成など）

⸻

2. バックログ（プロダクトバックログ）作成

以下のように「大きな機能（エピック）」→「ユーザーストーリー」→「GitHub Issue」という階層で整理します。

エピック（機能大項目）	ユーザーストーリー	GitHub Issue 例
[エピック1]	[ユーザーストーリー1]	#1：[タスク名]
[エピック2]	[ユーザーストーリー2]	#2：[タスク名]
[エピック3]	[ユーザーストーリー3]	#3：[タスク名]
[エピック4]	[ユーザーストーリー4]	#4：[タスク名]
[エピック5]	[ユーザーストーリー5]	#5：[タスク名]

⸻

3. スプリント運用
	•	スプリント長：1週間（忙しければ 2 週間でも可）
	•	プランニング（開始日＝毎週月曜）
	1.	次スプリントで着手する Issue を優先度順にピックアップ
	2.	Windsurf に実装サポートを依頼
	•	デイリースタンドアップ（非公式）
	•	毎朝、自分で 5 分だけ振り返り→GitHub Projects の進捗を確認
	•	スプリントレビュー（週末）
	•	完了した Issue をマージ → ブラウザで動作確認
	•	レトロスペクティブ（週末）
	•	良かった点／改善点を Issue 化し、次スプリントに持ち越す

⸻

4. タスク管理・並行プロジェクト対策
	1.	ラベル運用
	•	project/[プロジェクト名]などで並行プロジェクトを同一ボード上で管理
	2.	Milestone
	•	各スプリントを Milestone に紐づけ → ガントチャート風に日程把握
	3.	Windsurf Flows
	•	例えば「[処理1]→[処理2]→[処理3]」の Flow を定義、一連のタスクを自動的にガイド

⸻

5. v0画面設計プロセス
	•	ユーザーストーリーから設計情報を抽出・整理
	•	画面設計プロンプトの作成（要件・カラースキーム・コンポーネント等）
	•	デザインツールでのモックアップ作成

6. 関係性の可視化（GitHub Wiki活用）
	•	Wikiによる全体構造の明確化
	•	エピックとユーザーストーリーの関係性をWikiに整理
	•	階層的なナビゲーションでプロジェクト全体像を把握

7. スプリントタスク管理
	•	スプリント専用フォルダ構造の整備（Wiki/Sprints/など）
	•	ユーザーストーリーから具体タスクへの分解（ID・タスク名・担当者・見積時間・ステータス）
	•	受け入れ条件のチェックリスト化
	•	技術的準備タスクの整理
	•	スプリント全体見積もりの算出

8. 運用・次フェーズ継続の仕組み
	•	Pull Request での AI レビュー活用
	•	Windsurf の「Problems タブ」やテスト生成機能で品質担保
	•	ホットフィックス運用
	•	hotfix ラベルの Issue を常備 → 緊急バグ対応専用スプリント枠を確保
	•	定期 Backlog Grooming
	•	2 週間に 1 度、次の要件や改善点を洗い出して Issue 化
	•	自動リマインド（オプション）
	•	毎週月曜朝に「スプリントプランニングしよう」と通知してくれるリマインダー設定（Todoist などで）

⸻

この進め方のポイント
	•	小さなスプリントで必ず「動くもの」を残す
	•	AI（Windsurf）を"コンテキスト・スイッチングなし"のペアとして活用
	•	GitHub Projects + Milestone + Labelでスケジュール・タスク・並行プロジェクトを一元管理
	•	レトロスペクティブ→Backlog Groomingの繰り返しで"次フェーズ"の断絶を防ぐ
```

## テンプレートの使い方

1. **プロジェクト初期化手順**:
   - 新規フォルダを作成（または既存プロジェクト内で）
   - `git init`でGitリポジトリ初期化
   - `git branch -m master main`でデフォルトブランチ名を変更
   - GitHubでリポジトリを作成: `gh repo create [リポジトリ名] --public/--private --description "説明文"`
   - リモート接続: `git remote add origin https://github.com/[ユーザー名]/[リポジトリ名].git`
   - 初期コミット後のプッシュ: `git push -u origin main`

2. **ドキュメント作成**:
   - README.md - プロジェクト概要、技術スタック、セットアップ方法
   - docs/project-plan.md - 詳細なプロジェクト計画書
   - .github/ISSUE_TEMPLATE/ - Issueテンプレート（ユーザーストーリー、バグ報告）
   - docs/windsurf_github_agile_template.md - アジャイル運用テンプレート（再利用可能）

3. **ラベル設定**:
   - **タイプラベル**: 
     - `epic` - 大きな機能セット（例: `gh label create "epic" --color 6E49CB --description "大きな機能セット"`)
     - `user-story` - ユーザーの要求（例: `gh label create "user-story" --color 1D76DB --description "ユーザーの要求"`)
   - **優先度ラベル**:
     - `priority/high` - 高優先度（例: `gh label create "priority/high" --color D93F0B --description "高優先度タスク"`)
     - `priority/medium` - 中優先度（例: `gh label create "priority/medium" --color FBCA04 --description "中優先度タスク"`)
     - `priority/low` - 低優先度（例: `gh label create "priority/low" --color 0E8A16 --description "低優先度タスク"`)
   - **サイズラベル**:
     - `size/small` - 小規模タスク（例: `gh label create "size/small" --color C5DEF5 --description "小規模タスク（1-2日）"`)
     - `size/medium` - 中規模タスク（例: `gh label create "size/medium" --color 7CAED5 --description "中規模タスク（3-5日）"`)
     - `size/large` - 大規模タスク（例: `gh label create "size/large" --color 4078C0 --description "大規模タスク（1週間以上）"`)
   - **その他**:
     - `hotfix` - 緊急バグ修正用（例: `gh label create "hotfix" --color FF0000 --description "緊急バグ修正用"`)
     - `project/[名前]` - プロジェクト識別（例: `gh label create "project/xyz" --color 0075CA --description "XYZプロジェクトに関連するタスク"`)

4. **Issue作成**:
   - **エピックIssue例**:
     ```
     gh issue create --title "エピック: [機能名]" --body "## 概要\n[説明]\n\n## 含まれるユーザーストーリー\n- [ユーザーストーリー]" --label "epic,project/xyz,priority/high"
     ```
   - **ユーザーストーリーIssue例**:
     ```
     gh issue create --title "ユーザーストーリー: [内容]" --body "## ユーザーストーリー\n[ペルソナ]として、[したいこと]。なぜなら[理由]からだ。\n\n## 受け入れ基準\n- [ ] [基準1]\n- [ ] [基準2]\n\n## 技術的メモ\n[メモ]\n\n## エピック / 関連Issue\n- #[エピック番号]" --label "user-story,project/xyz,priority/medium,size/small"
     ```

5. **マイルストーン設定**:
   - GitHub API経由でマイルストーン作成（スプリント用）:
     ```
     gh api repos/[ユーザー名]/[リポジトリ名]/milestones -f title="スプリント1（開始日〜終了日）" -f description="[説明]" -f due_on="[終了日]T23:59:59Z"
     ```
   - Issueをマイルストーンに割り当て:
     ```
     gh issue edit [Issue番号] --milestone "[マイルストーン名]"
     ```

6. **GitHub Projects設定**:
   - プロジェクトボード設定にはGH CLI認証スコープ更新が必要:
     ```
     gh auth refresh -s project
     ```
   - Issueをプロジェクトボードに追加:
     ```
     gh project item-add [プロジェクト番号] --owner [ユーザー名] --url [Issue URL]
     ```

7. **進捗管理**:
   - スプリントごとのIssue選定
   - ステータス管理（Todo → In Progress → Done）
   - レビュー・レトロスペクティブ

## 設定済みテンプレートファイル

このプロジェクトには以下のテンプレートファイルが含まれており、他のプロジェクトでもそのまま利用できます：

1. README.md - 基本的なプロジェクト説明テンプレート
2. docs/project-plan.md - アジャイル開発計画テンプレート
3. .github/ISSUE_TEMPLATE/user_story.md - ユーザーストーリーテンプレート
4. .github/ISSUE_TEMPLATE/bug_report.md - バグ報告テンプレート

これらのファイルは、必要に応じて各プロジェクトの要件に合わせてカスタマイズしてください。
