# Maplat Transform

[![CI](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml/badge.svg)](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml)

Maplatで生成された座標変換定義を使用して、2つの平面座標系間で座標変換を実現するJavaScriptライブラリです。
[Maplat](https://github.com/code4history/Maplat/)プロジェクトの一部として開発されています。

English README is [here](./README.md).

## 主な機能

- **座標変換定義のインポート:** Maplatで生成された座標変換定義をインポートし、変換のための内部構造を構築
- **V2/V3フォーマット対応:** レガシーV2フォーマット（固定4境界頂点）と新しいV3フォーマット（N境界頂点、より高精度）の両方に対応
- **双方向座標変換:** 2つの平面間で双方向の座標変換が可能
- **位相保存:** 変換時の同相性（トポロジー）を維持
- **複数の座標系サポート:** 通常の直交座標系、Y軸反転座標系、鳥瞰図のような歪んだ座標系など、様々な座標系間の変換に対応
- **状態管理:** 変換状態の保存と復元をサポート
- **サブマップ選択（処理2）:** 同一画像上に複数のTIN領域（`sub_maps`）が存在する地図で、領域判定・優先度・重要度に基づいて適用するTINを自動選択し座標変換する
- **ビューポート変換（処理3）:** ピクセル座標系上の表示ビューポート（中心位置・ズームレベル・回転角）を地図座標系（EPSG:3857）上のビューポートに相互変換する
- **地図間ビューポート同期（処理4）:** ある絵地図の表示ビューポートを、共通の地図座標系（EPSG:3857）を中継して別の絵地図の表示ビューポートに直接変換する

## 動作要件

- **Node.js:** >= 20
- **pnpm:** >= 9（開発時）

## インストール方法

### pnpm（推奨）

```sh
pnpm add @maplat/transform
```

### npm

```sh
npm install @maplat/transform
```

### ブラウザ

```html
<script src="https://unpkg.com/@maplat/transform/dist/maplat_transform.umd.js"></script>
```

## 基本的な使用方法

```javascript
import { Transform } from '@maplat/transform';

// 変換定義データのインポート
const transform = new Transform();
transform.setCompiled(compiledData);  // Maplatで生成された変換定義を適用

// 順方向の変換（ソース座標系 → ターゲット座標系）
const transformed = transform.transform([100, 100], false);

// 逆方向の変換（ターゲット座標系 → ソース座標系）
const restored = transform.transform(transformed, true);
```

### エラーハンドリング

このライブラリは以下の場合にエラーをスローする可能性があります：

- 厳密モードでの変換エラー時
- 逆変換が許可されていない状態での逆変換実行時
- 不正なデータ構造での変換実行時

エラーが発生した場合は、変換定義データの修正が必要です。変換定義の修正は[@maplat/tin](https://github.com/code4history/MaplatTin/)を使用したエディタツールで行ってください。

## MapTransform の使用方法

### 処理2 — サブマップ選択つき座標変換

1枚の地図画像上に複数のTIN定義（`sub_maps`）が重なって存在する場合、`MapTransform` を使うと適切なTINを自動選択して座標変換できます。

```javascript
import { MapTransform } from '@maplat/transform';

const mt = new MapTransform();
mt.setMapData({
  compiled: mainCompiledData,   // メインTINのコンパイル済みデータ
  sub_maps: [
    { compiled: sub0Data, priority: 1, importance: 1 },
    { compiled: sub1Data, priority: 2, importance: 2 },
  ],
});

// 順方向: ピクセルXY → EPSG:3857（[レイヤーインデックス, Merc座標] または false を返す）
const result = mt.xy2MercWithLayer([320, 240]);
if (result) {
  const [layerIndex, merc] = result;
  console.log('レイヤー:', layerIndex, 'Merc座標:', merc);
}

// 逆方向: EPSG:3857 → ピクセルXY（重要度順に最大2レイヤー返す）
const results = mt.merc2XyWithLayer([15000000, 4000000]);
results.forEach((r, i) => {
  if (r) console.log(`結果${i}: レイヤー${r[0]}, XY座標`, r[1]);
});
```

### 処理3 — ビューポート変換

ピクセル地図の表示ビューポート（中心位置・ズームレベル・回転角）を、EPSG:3857空間上の5点（中心＋東西南北）として相互変換します。

```javascript
import { MapTransform } from '@maplat/transform';

const mt = new MapTransform();
mt.setMapData({ compiled: compiledData });

const canvasSize = [800, 600];  // キャンバスサイズ [幅, 高さ]

// ピクセルビューポート → EPSG:3857 5点
const viewpoint = {
  center: [15000000, 4000000],  // ピクセル空間の中心に対応するEPSG:3857相当座標
  zoom: 14,
  rotation: 0,
};
const mercs = mt.viewpoint2Mercs(viewpoint, canvasSize);
// mercs: [[中心], [北], [東], [南], [西]]  (EPSG:3857)

// EPSG:3857 5点 → ピクセルビューポート
const vp = mt.mercs2Viewpoint(mercs, canvasSize);
console.log(vp.center, vp.zoom, vp.rotation);
```

### 処理4 — 地図間ビューポート同期

ある絵地図の表示ビューポートをEPSG:3857空間を中継して別の絵地図のビューポートへ直接変換します。

```javascript
import { MapTransform } from '@maplat/transform';

const mtA = new MapTransform();
mtA.setMapData({ compiled: compiledDataA });

const mtB = new MapTransform();
mtB.setMapData({ compiled: compiledDataB });

const canvasSize = [800, 600];

// 地図Aのビューポート（ピクセル空間A）
const vpA = { center: [15000000, 4000000], zoom: 14, rotation: 0 };

// ピクセル空間A → EPSG:3857 5点（処理3の順変換）
const mercs = mtA.viewpoint2Mercs(vpA, canvasSize);

// EPSG:3857 5点 → 地図Bのビューポート（処理3の逆変換）
const vpB = mtB.mercs2Viewpoint(mercs, canvasSize);
console.log('地図Bのビューポート:', vpB);
```

## API リファレンス

### Transform クラス

座標変換を行うメインクラスです。

#### コンストラクタ

```javascript
const transform = new Transform();
```

#### メソッド

##### `setCompiled(compiled: Compiled | CompiledLegacy): void`

Maplatで生成されたコンパイル済み変換定義をインポートして適用します。レガシー形式、V2（4境界頂点）、V3（N境界頂点）を自動的に判別して処理します。

- **パラメータ:**
  - `compiled`: コンパイル済み変換定義オブジェクト（V2、V3、またはレガシー形式）

##### `transform(apoint: number[], backward?: boolean, ignoreBounds?: boolean): number[] | false`

座標変換を実行します。

- **パラメータ:**
  - `apoint`: 変換する座標 `[x, y]`
  - `backward`: 逆方向の変換を行うか（デフォルト: `false`）
  - `ignoreBounds`: 境界チェックを無視するか（デフォルト: `false`）
- **戻り値:** 変換後の座標、または境界外の場合は `false`
- **例外:** `strict_status == "strict_error"` の状態で逆変換を試みた場合にエラーをスロー

#### 静的定数

**頂点モード:**
- `Transform.VERTEX_PLAIN`: 標準平面座標系
- `Transform.VERTEX_BIRDEYE`: 鳥瞰図座標系

**厳密モード:**
- `Transform.MODE_STRICT`: 厳密な変換モード
- `Transform.MODE_AUTO`: 自動モード選択
- `Transform.MODE_LOOSE`: 緩い変換モード

**厳密ステータス:**
- `Transform.STATUS_STRICT`: 厳密ステータス
- `Transform.STATUS_ERROR`: エラーステータス（逆変換不可）
- `Transform.STATUS_LOOSE`: 緩いステータス

**Y軸モード:**
- `Transform.YAXIS_FOLLOW`: Y軸方向に従う
- `Transform.YAXIS_INVERT`: Y軸方向を反転

### MapTransform クラス

サブマップ選択、ビューポート変換、地図間ビューポート同期（処理2〜4）を担うクラスです。

#### コンストラクタ

```javascript
const mt = new MapTransform();
```

#### メソッド

##### `setMapData(mapData: MapData): void`

メインTINとオプションのサブマップTINをロードします。

- **パラメータ:**
  - `mapData`: `{ compiled, maxZoom?, sub_maps? }` — メインのコンパイル済みTINデータ、オプションの明示的なmaxZoom、オプションのサブマップ定義配列

##### `xy2Merc(xy: number[]): number[] | false`

メインTINを使ってピクセル座標をEPSG:3857に変換します。

- **パラメータ:** `xy` — ピクセル座標 `[x, y]`
- **戻り値:** EPSG:3857座標、または範囲外の場合は `false`

##### `merc2Xy(merc: number[]): number[] | false`

メインTINを使ってEPSG:3857座標をピクセル座標に逆変換します。

- **パラメータ:** `merc` — EPSG:3857座標 `[x, y]`
- **戻り値:** ピクセル座標、または範囲外の場合は `false`

##### `xy2MercWithLayer(xy: number[]): [number, number[]] | false`

優先度と領域に基づいてサブマップから適切なTINを自動選択し、ピクセル座標をEPSG:3857に変換します（処理2）。

- **パラメータ:** `xy` — ピクセル座標 `[x, y]`
- **戻り値:** `[レイヤーインデックス, Merc座標]`、または範囲外の場合は `false`

##### `merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[]`

該当する全TINレイヤーでEPSG:3857座標をピクセル座標に逆変換し、重要度順に最大2件を返します（処理2）。
> 3件以上返したい場合は、実装内の `.slice(0, 2)` / `.filter(i < 2)` の上限値を変更してください。

- **パラメータ:** `merc` — EPSG:3857座標 `[x, y]`
- **戻り値:** 最大2要素の配列。各要素は `[レイヤーインデックス, XY座標]` または `undefined`

##### `viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number]): number[][]`

ピクセル空間のビューポートをEPSG:3857の5点に変換します（処理3）。

- **パラメータ:**
  - `viewpoint`: `{ center, zoom, rotation }` — ピクセル空間のビューポート（centerは `xy2SysCoord` 変換後のEPSG:3857相当値）
  - `size`: キャンバスサイズ `[幅, 高さ]`
- **戻り値:** EPSG:3857の5点配列 `[中心, 北, 東, 南, 西]`
- **例外:** 中心点がTIN範囲外の場合にエラー

##### `mercs2Viewpoint(mercs: number[][], size: [number, number]): Viewpoint`

EPSG:3857の5点からピクセル空間のビューポートに逆変換します（処理3の逆変換）。

- **パラメータ:**
  - `mercs`: EPSG:3857の5点配列（`viewpoint2Mercs` の戻り値と同形式）
  - `size`: キャンバスサイズ `[幅, 高さ]`
- **戻り値:** ピクセル空間の `Viewpoint` — `{ center, zoom, rotation }`
- **例外:** 中心点が逆変換できない場合にエラー

#### アクセサ

- `maxxy: number` — `2^maxZoom × 256`。ピクセル座標とEPSG:3857座標の変換スケール係数

### エクスポートされる型

- `PointSet`, `BiDirectionKey`, `WeightBufferBD`, `VertexMode`, `StrictMode`, `StrictStatus`, `YaxisMode`
- `CentroidBD`, `TinsBD`, `KinksBD`, `VerticesParamsBD`, `IndexedTinsBD`
- `Compiled`, `CompiledLegacy`
- `Tins`, `Tri`, `PropertyTriKey`
- `Edge`, `EdgeSet`, `EdgeSetLegacy`
- `Viewpoint` — `{ center: number[], zoom: number, rotation: number }`
- `MapData` — `{ compiled: Compiled, maxZoom?: number, sub_maps?: SubMapData[] }`
- `SubMapData` — `{ compiled: Compiled, priority: number, importance: number, bounds?: number[][] }`

### エクスポートされるユーティリティ関数

- `transformArr`: 低レベルの座標変換関数
- `rotateVerticesTriangle`: 三角形の頂点を回転
- `counterTri`: カウンター三角形ユーティリティ
- `normalizeEdges`: エッジ定義の正規化

### フォーマットバージョン

```javascript
import { format_version } from '@maplat/transform';
console.log(format_version); // 現在のフォーマットバージョン
```

コンパイル済みデータのフォーマットには2つのモダンバージョンがあります:

- **V2:** マップのバウンディングボックスから算出した固定4点の境界頂点を使用
- **V3:** N個（4以上）の境界頂点を使用し、特にマップ端付近の変換精度を向上

どちらのフォーマットも `setCompiled()` が自動的に判別して処理します。V3フォーマットのコンパイル済みデータはバージョン3以降の[@maplat/tin](https://github.com/code4history/MaplatTin/)で生成されます。

## ドキュメント

変換処理の内部実装に関する技術的な詳細については、以下を参照してください:
- [Transform Internals](./docs/transform-internals.ja.md) - Transformクラスの状態復元と座標検索処理に関する実行時メモ

## 開発

### テストの実行

```sh
pnpm test
```

## 注意事項

このライブラリは座標変換の実行に特化しており、変換定義自体の生成や編集機能は含まれていません。変換定義の作成や編集が必要な場合は、[@maplat/tin](https://github.com/code4history/MaplatTin/)パッケージをご利用ください。

## ライセンス

Maplat Limited License 1.1

Copyright (c) 2025 Code for History

### 開発者

- Kohei Otsuka
- Code for History

あなたの貢献をお待ちしています！[イシューやプルリクエスト](https://github.com/code4history/MaplatTransform/issues)は大歓迎です。