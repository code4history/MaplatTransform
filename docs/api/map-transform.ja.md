# MapTransform クラス

サブマップ選択、ビューポート変換、地図間ビューポート同期（処理2〜4）を担うクラスです。

## コンストラクタ

```javascript
import { MapTransform } from '@maplat/transform';

const mt = new MapTransform();
```

## メソッド

### `setMapData(mapData: MapData): void`

メインTINとオプションのサブマップTINをロードします。

- **パラメータ:**
  - `mapData`: `{ compiled, maxZoom?, sub_maps? }` — メインのコンパイル済みTINデータ、オプションの明示的なmaxZoom、オプションのサブマップ定義配列

### `xy2Merc(xy: number[]): number[] | false`

メインTINを使ってピクセル座標をEPSG:3857に変換します。

- **パラメータ:** `xy` — ピクセル座標 `[x, y]`
- **戻り値:** EPSG:3857座標、または範囲外の場合は `false`

### `merc2Xy(merc: number[]): number[] | false`

メインTINを使ってEPSG:3857座標をピクセル座標に逆変換します。

- **パラメータ:** `merc` — EPSG:3857座標 `[x, y]`
- **戻り値:** ピクセル座標、または範囲外の場合は `false`

### `xy2MercWithLayer(xy: number[]): [number, number[]] | false`

優先度と領域に基づいてサブマップから適切なTINを自動選択し、ピクセル座標をEPSG:3857に変換します（処理2）。

- **パラメータ:** `xy` — ピクセル座標 `[x, y]`
- **戻り値:** `[レイヤーインデックス, Merc座標]`、または範囲外の場合は `false`

### `merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[]`

該当する全TINレイヤーでEPSG:3857座標をピクセル座標に逆変換し、重要度順に最大2件を返します（処理2）。

> 3件以上返したい場合は、実装内の `.slice(0, 2)` / `.filter(i < 2)` の上限値を変更してください。

- **パラメータ:** `merc` — EPSG:3857座標 `[x, y]`
- **戻り値:** 最大2要素の配列。各要素は `[レイヤーインデックス, XY座標]` または `undefined`

このメソッドは視点換算・一般座標変換用です（本図を常に候補に含めます）。GPS マーカーや POI ピンをどの層に描くかの判定には `merc2XyVisibleLayers` を使ってください。

### `merc2XyVisibleLayers(merc: number[]): [number, number[]][]`

EPSG:3857座標に対応し、他の層に覆われていない層の一覧を返します。GPS マーカー・POI ピンを描く層の選択に使います。

1. 各層の TIN で逆変換し、sub_map は結果が自身の `xyBounds` 内に入る場合だけ対応層とします。本図（層 0）は常に候補とし、本図の紙の内外は**ここでは判定しません**（呼び出し側で除外します）。
2. 対応層の座標が、より priority の高い sub_map の `xyBounds` 内にあれば「覆われている」とします。その sub_map 自身が当該座標に対応するかは関係しません。本図は priority 0 の sub_map にも覆われます。
3. 同じ priority の sub_map どうしは互いを覆いません。
4. 覆われていない対応層を importance 降順 → priority 降順 → 層番号昇順で並べ、上限を設けず**全件**返します。
5. 覆われていない対応層が無ければ空配列（表現範囲外）を返します。`undefined` の要素は返しません。

- **パラメータ:** `merc` — EPSG:3857座標 `[x, y]`
- **戻り値:** `[レイヤーインデックス, XY座標]` の配列（0 件以上）
- **例外:** `setMapData()` を呼ぶ前に実行した場合

### `viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number]): number[][]`

ピクセル空間のビューポートをEPSG:3857の5点に変換します（処理3）。

- **パラメータ:**
  - `viewpoint`: `{ center, zoom, rotation }` — ピクセル空間のビューポート（centerは `xy2SysCoord` 変換後のEPSG:3857相当値）
  - `size`: キャンバスサイズ `[幅, 高さ]`
- **戻り値:** EPSG:3857の5点配列 `[中心, 北, 東, 南, 西]`
- **例外:** 中心点がTIN範囲外の場合にエラー

### `mercs2Viewpoint(mercs: number[][], size: [number, number]): Viewpoint`

EPSG:3857の5点からピクセル空間のビューポートに逆変換します（処理3の逆変換）。

- **パラメータ:**
  - `mercs`: EPSG:3857の5点配列（`viewpoint2Mercs` の戻り値と同形式）
  - `size`: キャンバスサイズ `[幅, 高さ]`
- **戻り値:** ピクセル空間の `Viewpoint` — `{ center, zoom, rotation }`
- **例外:** 中心点が逆変換できない場合にエラー

## アクセサ

- `maxxy: number` — `2^maxZoom × 256`。ピクセル座標とEPSG:3857座標の変換スケール係数

## エクスポートされる型

- `Viewpoint` — `{ center: number[], zoom: number, rotation: number }`
- `MapData` — `{ compiled: Compiled, maxZoom?: number, sub_maps?: SubMapData[] }`
- `SubMapData` — `{ compiled: Compiled, priority: number, importance: number, bounds?: number[][] }`

## See also

- [Transform クラス](transform.ja.md) — 座標変換（処理1）
- [メイン README](../README.ja.md) — インストール / クイックスタート / エコシステム
