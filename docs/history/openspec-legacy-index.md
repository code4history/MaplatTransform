# MaplatTransform openspec 時代の開発履歴索引

> 本ファイルは openspec ワークフロー（〜2026年）時代に作成された開発提案・記録を、那由多開発サイクル形式の履歴として集約した索引です。
> 原文は `docs/history/openspec-legacy/<change-id>/` 配下にそのまま保存されています（内容は変更していません）。
> 那由多開発サイクルについては `docs/superpowers/`（存在する場合）を参照してください。
>
> 「推定時期」は、各 change の `proposal.md` に対して `git log --follow --diff-filter=A -1` を実行して得た**作成日**（そのファイルが最初にリポジトリへ追加されたコミットの日付）を記載しています。archive 化の際にディレクトリ名へ日付プレフィックスが付与される・リネームされるケースがあるため、ディレクトリ単位ではなくファイル単位で `--follow` を適用し、archive 日ではなく作成日を実測しています。

## 開発提案一覧（openspec/changes、archive済み + 未archive、計5件）

| change-id | 由来 | 推定時期 | 目的 | 実装状況 | 現在の扱い | 原文 |
|---|---|---|---|---|---|---|
| 2025-12-18-package-json-maplattin | archive済み | 2025-12-18（496fe75） | Issue #2「package.json内にpackage.jsonがある」報告を調査し、全成果物のパッケージ名記載を検証・是正する。 | 完了 | 完了・削除対象 | [原文](openspec-legacy/2025-12-18-package-json-maplattin/) |
| 2025-12-18-unify-libs-turf-vite | archive済み | 2025-12-18（2655813） | Issue #3「Vite/ESLint設定の統一」対応。散在するビルド設定を統一し、粒度の細かいTurf依存を集約する。 | 完了 | 完了・削除対象 | [原文](openspec-legacy/2025-12-18-unify-libs-turf-vite/) |
| 2025-12-19-issue-4 | archive済み | 2025-12-20（8e98b7e） | Issue #4「package.jsonへのTypeScript型定義追加」対応。`vite-plugin-dts` で生成される `.d.ts` を各モジュールシステムから正しく参照できるようexportsを整備する。 | 完了 | 完了・削除対象 | [原文](openspec-legacy/2025-12-19-issue-4/) |
| reopen-issue3 | archive済み | 2025-12-20（9fe8a6e） | Issue #3再オープン。Vite ^7.2.2/Vitest ^4.0.8が当初目標（Vite ^6.x/Vitest ^3.x）を上回っている状況の妥当性・Maplat Harmony Phase 2標準との整合を確認する。 | 完了 | 完了・削除対象 | [原文](openspec-legacy/reopen-issue3/) |
| weiwudi-vite-pnpm | archive済み | 2025-12-18（6a62ca2） | Issue #1「パッケージマネージャー統一」対応。npmからpnpm+Viteへ移行し、CI/CDによるビルド品質保証を整備する。 | 完了 | 完了・削除対象 | [原文](openspec-legacy/weiwudi-vite-pnpm/) |

## 当時のプロジェクト概要（参考・陳腐化済み）

| 項目 | 推定時期 | 目的 | 現状との乖離 | 原文 |
|---|---|---|---|---|
| project.md | 2025-12-18（6a62ca2） | openspecワークフロー導入時点でのMaplatTransformプロジェクト概要・規約を記述したもの。 | 那由多開発サイクル移行（本索引作成）により、開発プロセス・ドキュメント体系は本ファイル群へ置き換わっている。参考情報として保存。 | [原文](openspec-legacy/_project-snapshot/project.md) |
| specs/tooling/spec.md | 2025-12-18（2655813） | Vite/ESLint統一に関する仕様（unify-libs-turf-vite由来）。 | 完了済み変更の仕様記録として保存。 | [原文](openspec-legacy/_project-snapshot/specs/tooling/spec.md) |
| specs/package-metadata/spec.md | 2025-12-18（496fe75） | package.jsonメタデータに関する仕様（package-json-maplattin由来）。 | 完了済み変更の仕様記録として保存。 | [原文](openspec-legacy/_project-snapshot/specs/package-metadata/spec.md) |
| specs/dependencies/spec.md | 2025-12-18（2655813） | Turf.js依存統合に関する仕様（unify-libs-turf-vite由来）。 | 完了済み変更の仕様記録として保存。 | [原文](openspec-legacy/_project-snapshot/specs/dependencies/spec.md) |
| specs/typescript-definitions/spec.md | 2025-12-20（8e98b7e） | TypeScript型定義exportsに関する仕様（issue-4由来）。 | 完了済み変更の仕様記録として保存。 | [原文](openspec-legacy/_project-snapshot/specs/typescript-definitions/spec.md) |
