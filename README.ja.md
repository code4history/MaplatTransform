<!-- SECTION 1: Header (badges, title) -->
<h1 align="center">MaplatTransform</h1>

<p align="center">
  [![CI](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml/badge.svg)](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml)
  [![npm version](https://img.shields.io/npm/v/@maplat/transform)](https://www.npmjs.com/package/@maplat/transform)
  [![License](https://img.shields.io/npm/l/@maplat/transform)](LICENSE)
</p>

<!-- SECTION 2: Elevator Pitch -->
## MaplatTransform について

MaplatTransform は Maplat で生成された座標変換定義を使用して、2つの平面座標系間で
座標変換を実行する JavaScript ライブラリです。Maplat エコシステムの実行時変換エンジン
であり、姉妹パッケージの [@maplat/tin](https://github.com/code4history/MaplatTin/) が
TIN 定義を生成し、MaplatTransform がそれを実行時に適用します。

MaplatTransform は Apache License 2.0（バージョン 0.5.3 以降）のオープンソースソフトウェアです。

<!-- SECTION 3: Language switch link -->
**[英語版はこちら / Read this document in English](README.md)**

<!-- SECTION 4: Key Features -->
## 主な特徴

- Maplat 生成の TIN 定義を用いた2平面座標系間の座標変換（双方向・トポロジー維持）
- V2/V3 コンパイル済みフォーマット対応（V3 は N 境界頂点で高精度）
- 標準直交座標系・Y軸反転座標系・鳥瞰図歪座標系など複数座標系サポート
- サブマップ選択・ビューポート変換・地図間ビューポート同期（処理2〜4）
- 変換状態の保存・復元

<!-- SECTION 5: Quick Start -->
## クイックスタート

> 特定リリースに紐づく情報（ADR-0012）。下記のバージョン `0.5.3` は現在の
> リリース値です。リリースごとに更新してください。

### インストール

```bash
# pnpm（推奨）
pnpm add @maplat/transform

# npm
npm install @maplat/transform
```

### 最小利用例

```typescript
import { Transform } from '@maplat/transform';

// Maplat で生成されたコンパイル済み変換定義を適用
const transform = new Transform();
transform.setCompiled(compiledData);

// 順方向の変換（ソース座標系 → ターゲット座標系）
const transformed = transform.transform([100, 100], false);

// 逆方向の変換（ターゲット座標系 → ソース座標系）
const restored = transform.transform(transformed, true);
```

> 厳密モードでの変換エラー時、逆変換が許可されていない状態での逆変換実行時、
> 不正なデータ構造での変換実行時にエラーをスローする場合があります。
> エラーが発生した場合は変換定義自体の修正が必要です。変換定義の修正は
> [@maplat/tin](https://github.com/code4history/MaplatTin/) を使って行ってください。

### CDN（jsDelivr）

```html
<script src="https://cdn.jsdelivr.net/npm/@maplat/transform@0.5.3/dist/maplat_transform.umd.js"></script>
```

### MapTransform の使用方法（処理2〜4）

サブマップ選択・ビューポート変換・地図間ビューポート同期については
[Wiki Tutorials](https://github.com/code4history/MaplatTransform/wiki/Tutorials) を参照してください。

### API リファレンス

- **API シグネチャ**（リリース依存）: [`docs/api/`](docs/api/) を参照
- **概念解説**（リリース非依存）:
  [Wiki API-Reference](https://github.com/code4history/MaplatTransform/wiki/API-Reference) を参照
- **Transform Internals**（実行時ノート）:
  [docs/transform-internals.ja.md](docs/transform-internals.ja.md) を参照

### 開発

```bash
pnpm test
```

<!-- SECTION 6: Prerequisites -->
## 動作環境

> `package.json` の `engines` フィールドから自動抽出（ADR-0012: 特定リリースに紐づく）。

- Node.js: `>=20` 以上
- pnpm: `>=9` 以上（推奨・npm も可）

<!-- SECTION 7: Peer Dependencies -->
<!-- 省略: MaplatTransform は OpenLayers の peer dependency を持ちません。 -->

<!-- SECTION 8: Ecosystem / Related Repositories -->
## エコシステム

MaplatTransform は [Code for History](https://github.com/code4history) が運営する
Maplat エコシステムの一部です。全容は下記エコシステム図を参照してください。

📖 **エコシステム図** — *（図は現在外部非公開の計画リポジトリにあります。
公開ビューアからは下記の姉妹リポジトリ表で代替します）*

### 姉妹リポジトリ

| リポジトリ | ライセンス | npm | 役割 |
|---|---|---|---|
| [Maplat](https://github.com/code4history/Maplat) | Apache 2.0 | `@maplat/ui` | メインビューア |
| [MaplatCore](https://github.com/code4history/MaplatCore) | Apache 2.0 | `@maplat/core` | コアライブラリ |
| [MaplatTin](https://github.com/code4history/MaplatTin) | Apache 2.0 | `@maplat/tin` | TIN 変換 |
| [MaplatTransform](https://github.com/code4history/MaplatTransform) | Apache 2.0 | `@maplat/transform` | 座標変換 |
| [MaplatEditor](https://github.com/code4history/MaplatEditor) | Apache 2.0 | — | データ作成ツール（デスクトップ） |

> MaplatEditor は上記ビューアライブラリが描画する地図・POI を作成する
> データ作成ツールです。Maplat エコシステムはエンドツーエンド:
> MaplatEditor で作成し、いずれかのビューアライブラリで公開、という流れになります。

> **注記**: MaplatTransform は座標変換の実行のみを行います。変換定義の作成・編集は
> [@maplat/tin](https://github.com/code4history/MaplatTin/) を使って行ってください。

<!-- SECTION 9: Nayuta links -->
## リンク

| 対象 | リンク | 用途 |
|---|---|---|
| プロジェクト情報・機能紹介・事例 | <https://www.maplat.jp/> | 製品サイト |
| 支援企業・案件問い合わせ | <https://www.nayuta-inc.co.jp/> | コーポレートサイト（那由多社） |

> ADR-0013: Apache ライセンスのリポジトリ（本リポジトリ）は両サイトへリンクします。
> MIT ライセンスの姉妹リポジトリ（Weiwudi / Quyuan / Chuci）へは那由多社リンクを置きません。

<!-- SECTION 10: License -->
## License

Apache License 2.0 — 詳細は [LICENSE](LICENSE) を参照。

```
Copyright 2019-2026 Kohei Otsuka, Code for History / Nayuta, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

> **特許注記**: Maplat の座標変換技術は日本国内で特許登録されています
> （Patent No. 6684776）。

> **過去のバージョン**: 0.5.3 より前のバージョンは Maplat Limited License 1.1 の
> もとで配布されていました。Apache 2.0 へのライセンス復帰はバージョン 0.5.3 以降に
> 適用されます。npmjs.com で公開されている過去のバージョンは、それぞれ元の
> 制限ライセンスの条件が維持されます。

<!-- SECTION 11: Contributors / Sponsors -->
## Contributors

- Kohei Otsuka
- Code for History

あなたの貢献をお待ちしています。
[イシューやプルリクエスト](https://github.com/code4history/MaplatTransform/issues)は大歓迎です。
