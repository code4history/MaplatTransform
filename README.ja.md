<!-- SECTION 1: Header (badges, title) -->
<h1 align="center">MaplatTransform</h1>

<p align="center">
  <a href="https://github.com/code4history/MaplatTransform/actions/workflows/test.yml"><img src="https://github.com/code4history/MaplatTransform/actions/workflows/test.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/@maplat/transform" alt="License" /></a>
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
- TIN と world file の混在。EPSG:3857・4326 は内蔵式で変換し、別の CRS には proj4js を利用可能
- V2/V3 コンパイル済みフォーマット対応（V3 は N 境界頂点で高精度）
- 標準直交座標系・Y軸反転座標系・鳥瞰図歪座標系など複数座標系サポート
- サブマップ選択・ビューポート変換・地図間ビューポート同期（処理2〜4）
- 変換状態の保存・復元

<!-- SECTION 5: Quick Start -->
## クイックスタート

<!-- release-pinned:start -->
> **現在のリリース: `1.1.0`**。このブロックは本リポジトリで唯一
> リリース版数を持つ場所です。ブロックの外はすべて 1.0 正式版を前提に
> 書かれています。
> npm: [`@maplat/transform`](https://www.npmjs.com/package/@maplat/transform)
> [![npm](https://img.shields.io/npm/v/@maplat/transform)](https://www.npmjs.com/package/@maplat/transform)

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
<script src="https://cdn.jsdelivr.net/npm/@maplat/transform@1.1.0/dist/maplat_transform.umd.js"></script>
```

### MapTransform の使用方法（処理2〜4）

サブマップ選択・ビューポート変換・地図間ビューポート同期については
[Wiki Tutorials](https://github.com/code4history/MaplatTransform/wiki/Tutorials) を参照してください。

### 視点の変換モード（ラウンドトリップ対応の視点変換）

`viewpoint2Mercs(viewpoint, size, layerIndex?)` と `mercs2Viewpoint(mercs, size, layerIndex?)` は
5 点 `mercs` 中継の契約を保ったまま理想相似をエンコードします。周囲 4 点は層ごとの
`ViewpointField`（局所縮尺 `s`・回転 `theta`）からだけ決まるため、strict な地図では
任意のズーム・画面サイズで厳密に往復し、足の先端のはみ出しで例外になりません。

- `viewpointMode: "constant" | "grid"`（`MapData` / `LayeredMapData` 最上位。省略時は `"grid"`）で、
  層ごとの固定値 `(s0, theta0)` と、遅延構築される格子の滑らかな補間を切り替えます。
  格子は最初の視点変換のときに層単位で構築し、読み込み時には作りません。
- 省略可能な `layerIndex` で層を固定できます（0 = 本図、1 以上 = `sub_maps`）。
  省略時は従来の層選択のままで、係数は中心の層の格子からだけ引きます。
  範囲外の番号・非整数は例外になります。
- `getViewpointCoefficients(layerIndex, coord, direction?)` は層を 1 つ指定して
  中心 1 点の `{ s, theta }` を返します（`"xy2Merc"` は紙座標、`"merc2Xy"` はメルカトル座標）。
- `probeViewpointCoefficients(layerIndex, xy, radiusPx)` は Core の既定ズーム
  （mercZoom が無い地図）のための口です。モード 2 では格子を作らずに紙の中心で測ります:
  その層の面で紙の xy の十字 4 点（半径 radiusPx、ignoreBounds = true）を測り、
  格子を作らずに `{ s, theta }` を返します。
- `recommendViewpointMode(layerSurfaceData, { projectionEngine?, gcps? })` は
  `{ recommended, maxRotationDiffDeg, p95RotationDiffDeg, maxScaleRatioDiff,
  p95ScaleRatioDiff, sampleCount }` を返し、GCP 凸包の内側（GCP が無いときは層の範囲）の
  変動が判定基準（統計量は最大値でなく p95。p95 回転偏差 1.0° 以内かつ p95 縮尺比偏差 3% 以内）
  以内なら `"constant"` を推奨します。
- 副層が重なる地図で厳密に往復するには `layerIndex` の指定が要ります。
  省略すると従来の層選択で行きと帰りに別の層が選ばれ、係数を別の格子から引くことがあります。
- 厳密さは層ごとの別です。`strict`（既定）は地理側の格子 1 面で厳密に往復し、
  `loose` は紙側と地理側の 2 面を持ち厳密な往復の対象外、`strict_error` は
  従来どおり逆方向が例外になります。
- 格子の範囲の外では端の値に張り付くため、範囲外の中心でも例外にならず有限かつ連続に留まります。
- 格子は層の矩形の長辺を 16 分割し、各辺に 2 セルの余白を付けます
  （短辺はアスペクト比に比例し、8〜16 分割に収めます）。

```typescript
import { MapTransform, recommendViewpointMode } from '@maplat/transform';

const map = new MapTransform();
map.setLayeredMapData({ main: surfaceData, viewpointMode: 'grid' });
const mercs = map.viewpoint2Mercs(viewpoint, [800, 600], 0); // 層 0 を固定
const back = map.mercs2Viewpoint(mercs, [800, 600], 0);
const { recommended } = recommendViewpointMode(surfaceData, { gcps });
```

### World file 面

`MapTransform.setLayeredMapData()` は、メイン地図または副地図として world file 面を受け取ります。world file は名前付き6係数を使い、`xOrigin`・`yOrigin` は左上画素の中心を指します。画素座標の原点は画像の角なので、アフィン変換の前に各座標から半画素を引きます。

**world file の出力と三角網の地理側の座標は、CRS の公式な軸順によらず東・北の順です。**内蔵投影エンジンは `builtinProjectionEngine` という名前で export しています。world file 層では `getLayerTransform()` は `null` を返すため、変換面には `getSurfaceTransform()` を使ってください。

三角網の compiled に `outerTransform: "worldFile"` を持たせる場合は `CompiledWorldFileOuter` 型を使います。`worldFile` と `vertices_points` は必須で、`vertices_params` と `centroid_point` は省略可能です。既存の `Compiled`・`MapData`・`SubMapData` の必須フィールドは維持しています。

```typescript
import { MapTransform } from '@maplat/transform';

const map = new MapTransform();
map.setLayeredMapData({
  main: {
    kind: 'worldFile',
    crs: { epsg: 4326 },
    worldFile: {
      xScale: 0.01, xSkew: 0, xOrigin: 139,
      ySkew: 0, yScale: -0.01, yOrigin: 36
    },
    wh: [1000, 1000]
  }
});
const surface = map.getSurfaceTransform(0);
```

公開関数 `worldFileToCrs(worldFile, xy)` と `crsToWorldFilePixel(worldFile, crs)` は、順方向・逆方向のアフィン式を実装します。`validateWorldFile(worldFile)` は有限でない係数、非正則行列、鏡像を拒否します。

TIN の compiled データでは、camelCase の任意キー `outerTransform` を使えます。省略時は既存と同じ `"extrapolate"` です。`"worldFile"` は `vertices_points` が作る四辺形の輪の外を同じ compiled 内の `worldFile` 係数で変換します。このモードでは `worldFile` が必須で、`vertices_params` と `centroid_point` は省略できます。

### CRS の定義と proj4js

```typescript
type CrsObject = {
  epsg?: number;
  authority?: string;
  code?: string | number;
  proj4?: string;
  wkt?: string;
};
```

`epsg`、`authority` と `code` の組、`proj4` のいずれかを指定します。EPSG:3857・4326 は内蔵式を使います。三角網の層で `crs` を省略した場合は EPSG:3857 です。それ以外の CRS で変換するには `proj4` 定義と投影エンジンが必要です。EPSG 以外の識別子を持つときは、たとえば `{ authority: "ESRI", code: "102012", proj4: definition }` と指定します。ビューアは内蔵 CRS 以外の識別子をメタデータとして扱うため、定義との一致は地図データの作成時に確認してください。

`proj4` は任意の peer 依存です。利用するアプリケーションで `pnpm add "proj4@^2.22.0"` を実行して追加します。ES 版のアプリケーションでは、`proj4` 定義を持つ地図を読むときに動的に読み込めます。

```typescript
import { createProj4ProjectionEngine, MapTransform } from '@maplat/transform';

const { default: proj4 } = await import('proj4');
const projectionEngine = createProj4ProjectionEngine(proj4);
const map = new MapTransform();
map.setLayeredMapData({
  main: {
    kind: 'worldFile',
    crs: { epsg: 32654, proj4: '+proj=utm +zone=54 +datum=WGS84 +units=m' },
    worldFile: {
      xScale: 2, xSkew: 0, xOrigin: 500000,
      ySkew: 0, yScale: -2, yOrigin: 3985000
    },
    wh: [1000, 1000],
    projectionEngine
  }
});
```

同じエンジンを、必要な三角網または world file の層の `projectionEngine` に渡します。`WorldFileSurface` のコンストラクターにも渡せます。UMD 版を使う場合は、アプリケーションで読み込んだ proj4js の `proj4` 関数をファクトリーに渡します。どちらの層も外部との変換は EPSG:3857 を介します。三角網の補間・外挿・外周の world file は、投影の前に層の CRS で計算します。

EPSG:3857・4326 と `proj4` を併記した場合、proj4js エンジンは地図の四隅と中心を内蔵式と照合します。EPSG:3857 で 1 mm、EPSG:4326 で 1e-8 度を超える差があれば読み込みエラーになります。proj4js を読み込まない場合も、この 2 つの CRS では内蔵エンジンが扱える既知の定義を受け付けます。

`+axis` は省略するか、`+axis=enu` を指定します。WKT だけの定義と、グリッド指定（`@null` 以外の `+nadgrids` または `+geoidgrids`）、`+proj=pipeline`、`hgridshift`、`vgridshift` を含む proj4 定義は読み込みエラーになります。

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
<!-- release-pinned:end -->

<!-- SECTION 6: Prerequisites -->
## 動作環境

> `package.json` の `engines` フィールドから自動抽出（特定のリリースに紐づく値）。

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
| [Chuci](https://github.com/code4history/Chuci) | MIT | `@c4h/chuci` | マルチメディアスワイパー/ビューア Web Components |
| [Quyuan](https://github.com/code4history/Quyuan) | MIT | `@c4h/quyuan` | GeoJSON テンプレートエンジン＋マルチメディアビューア Web Components |
| [Weiwudi](https://github.com/code4history/Weiwudi) | MIT | `@c4h/weiwudi` | タイルキャッシュ用 Service Worker |

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

> Apache ライセンスのリポジトリ（本リポジトリ）は両サイトへリンクします。
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
