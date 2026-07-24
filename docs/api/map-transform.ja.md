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
