# MaplatTransform 機能拡張・移行計画書

## 概要

本ドキュメントは、MaplatCore (`@maplat/core`) に含まれている座標変換ロジック（submaps処理、表示範囲変換、地図間変換）を MaplatTransform (`@maplat/transform`) に移管するための計画書です。実作業担当者が作業を開始できるよう、調査結果・移管対象・クラス設計・実施手順を詳細に記述します。

---

## 1. 現状の問題認識

Maplat における「座標変換」の概念は、以下の4階層からなります。

| 処理番号 | 概要 | 現状の担当 |
|----------|------|-----------|
| **処理1** | 単独 TIN データを用いたピクセル座標系↔地図座標系（EPSG:3857）の1点変換 | ✅ `@maplat/tin` (生成) + `@maplat/transform` (変換) |
| **処理2** | submaps 属性を持つ地図で、複数 TIN のうちどれを適用するか判定・選択し座標変換する処理 | ❌ `@maplat/core` の `histmap_tin.ts` に実装 |
| **処理3** | 中心点・縮尺・方角で定義されるビューポートを、地図座標上の5点（中心＋上下左右）に変換する処理（およびその逆変換） | ❌ `@maplat/core` の `mixin.ts` に実装 |
| **処理4** | あるピクセル地図の表示範囲を、別のピクセル地図の表示範囲に直接変換する処理（2+3の組み合わせ） | ❌ `@maplat/core` の `histmap_tin.ts` + `mixin.ts` に実装 |

また、`@maplat/core` は `@maplat/transform@^0.2.3`（v2フォーマット対応のみ）に依存しており、`@maplat/transform` 現行版（0.5.0）および `@maplat/tin`（0.14.0）が対応する v3 フォーマットに未対応です。

---

## 2. 各リポジトリの現状

### 2.1 `@maplat/transform`（MaplatTransform v0.5.0）

**役割**: MaplatTin が生成したコンパイル済み TIN データを受け取り、1点の座標変換を行うクラスライブラリ。

**主要クラス**: `Transform`
- `setCompiled(compiled: Compiled | CompiledLegacy)` — コンパイル済みデータをロード
- `transform(apoint: number[], backward?, ignoreBounds?)` — 座標変換（順/逆）
- フォーマット: Legacy / v2 (2.00703) / v3 (3) すべてに対応

**依存**: `@turf/turf` のみ（OpenLayers 等不要）

**重要**: `@maplat/transform` は **ブラウザ・Node.js 両対応** の純粋な座標変換ライブラリ。OpenLayers への依存を持たず、最小限の依存関係で設計されている。この設計方針は移管後も維持すること。

### 2.2 `@maplat/tin`（MaplatTin v0.14.0）

**役割**: GCP（地上制御点）から TIN を生成し、コンパイル済みデータを出力するクラスライブラリ。

**主要クラス**: `Tin`（`Transform` を継承）
- GCP・エッジ・境界を受け取り `updateTin()` で TIN を計算
- `getCompiled()` でシリアライズ、`setCompiled()` で復元
- v2/v3 両フォーマット対応

**v2/v3 の違い（重要）**:

| 項目 | v2 (FORMAT_VERSION = 2.00703) | v3 (FORMAT_VERSION_V3 = 3) |
|------|-------------------------------|---------------------------|
| 境界頂点数 | 固定4頂点 | 最大36頂点（八角形/円形） |
| 重心計算 | Turf.js centroid | GCP座標から最適化 |
| 境界ポリゴン | `wh` の矩形 | GCP由来の bbox または明示的 bounds |
| Strict モード | 限定的な重複検出 | `strict-overlap.ts` による修復 |
| 使用フラグ | `useV2Algorithm: true` | デフォルト |

### 2.3 `@maplat/core`（MaplatCore v0.10.7）

**役割**: OpenLayers をベースとした地図 SDK。歴史地図と現代地図を重ね合わせ表示。

**依存**: `@maplat/transform@^0.2.3`（古い v2 のみ対応版）

**移管対象コードの所在**:

| ファイル | 主要クラス/関数 | 役割 |
|---------|----------------|------|
| `src/source/histmap_tin.ts` | `HistMap_tin` クラス | submaps の TIN 選択・座標変換（処理2）、ビューポート変換（処理3・4） |
| `src/source/mixin.ts` | `setCustomFunction` / `setCustomFunctionMaplat` | ビューポート↔メルカトル5点変換（処理3）、座標系変換ヘルパー |
| `src/const_ex.ts` | `MERC_MAX`, `MERC_CROSSMATRIX` | 変換に使用される定数 |

---

## 3. 移管対象コードの詳細特定

### 3.1 処理2: submaps TIN 選択ロジック

**対象ファイル**: `MaplatCore/src/source/histmap_tin.ts`

#### 移管対象メソッド・ロジック

**① submap のバウンズポリゴン設定** (`createAsync()` 内 L.42–73):
```typescript
// submaps のピクセル座標ポリゴンとメルカトルポリゴンを Transform に付加
options.sub_maps.map((sub_map, i) => {
  const xyBounds = [...sub_map.bounds, sub_map.bounds[0]];
  const mercBounds = xyBounds.map(xy => tin.transform(xy, false));
  tin.xyBounds = polygon([xyBounds]);
  tin.mercBounds = polygon([mercBounds]);
});
```

**② ピクセル→メルカトル：レイヤー判定付き変換** (`xy2MercAsync_returnLayer()` L.91–112):
- `priority` 順にソートした TIN 配列を走査
- ピクセル座標が各 `xyBounds` ポリゴン内かを `booleanPointInPolygon` で確認
- 最初にマッチした TIN を使って変換し `[layerId, mercCoord]` を返す

**③ メルカトル→ピクセル：レイヤー判定付き変換** (`merc2XyAsync_returnLayer()` L.114–193):
- 全 TIN に並行して逆変換を実行
- 各変換結果のピクセル座標が `xyBounds` 内かを確認
- `priority` と `importance` で重み付けし、最適なレイヤーを選択
- 最大2レイヤーの結果を返す（表示最前面＋1つ後ろ）

**④ 特定レイヤー指定変換** (L.77–89):
- `xy2MercAsync_specifyLayer()` / `merc2XyAsync_specifyLayer()`
- OpenLayers の `addCoordinateTransforms()` に登録した変換を呼び出す

> **注意**: ④については、OpenLayers の `addCoordinateTransforms` 機構を使っているため、新しいクラスでは `transform()` を直接呼ぶ形に変更する必要がある。

**⑤ 複数レイヤーへのメルカトル→システム座標変換** (`mercs2SysCoordsAsync_multiLayer()` L.253–286):
- `merc2XyAsync_returnLayer()` でセンター点の最適レイヤーを決定
- そのレイヤーを使って5点すべてを変換
- `xy2SysCoord()` でシステム座標に変換

#### 移管時の留意点

- `booleanPointInPolygon` (@turf) は `@maplat/transform` 既存の依存 `@turf/turf` で利用可能
- `Transform` のインスタンスに `xyBounds`, `mercBounds`, `priority`, `importance` を付加しているが、これらは新クラスのプロパティとして正式に持たせること（`@ts-ignore` を廃止）
- v3 では `Transform` の `bounds` プロパティ（コンパイル済みデータの一部）が `xyBounds` と重複する可能性があるため、整合性の確認が必要

### 3.2 処理3: ビューポート↔メルカトル5点変換

**対象ファイル**: `MaplatCore/src/source/mixin.ts`

#### 移管対象メソッド・定数

**① 定数** (`MaplatCore/src/const_ex.ts`):
```typescript
export const MERC_MAX = 20037508.342789244;
export const MERC_CROSSMATRIX = [
  [0.0, 0.0],  // 中心
  [0.0, 1.0],  // 北
  [1.0, 0.0],  // 東
  [0.0, -1.0], // 南
  [-1.0, 0.0]  // 西
];
```

**② ズーム→メルカトル半径変換** (`zoom2Radius()` L.551–557):
```typescript
zoom2Radius(size: Size, zoom?: number) {
  const radius = Math.floor(Math.min(size[0], size[1]) / 4);
  return (radius * MERC_MAX) / 128 / Math.pow(2, zoom);
}
```

**③ ビューポート→メルカトル5点** (`mercViewpoint2Mercs()` L.567–587):
```typescript
// center（メルカトル座標）、zoom、rotation から5点を生成
// MERC_CROSSMATRIX × radius を rotation で回転させたデルタを center に加算
mercViewpoint2Mercs(viewpoint?: ViewpointArray, size?: Size): CrossCoordinatesArray
```

**④ メルカトル5点→ビューポート** (`mercs2MercViewpoint()` L.595–633):
```typescript
// 5点から center, zoom, rotation を逆算
// 各方向ベクトルと法線ベクトルのなす角から omega（回転角）を計算
// スケールからズームレベルを計算: zoom = log((radius * MERC_MAX) / 128 / scale) / log(2)
mercs2MercViewpoint(mercs: CrossCoordinatesArray): ViewpointArray
```

**⑤ ピクセル↔システム座標変換** (`setCustomFunctionMaplat` 内 L.797–807):
```typescript
// システム座標（EPSG:3857相当） = ピクセル座標の線形変換
// 変換式: sysX = (x * 2 * MERC_MAX) / _maxxy - MERC_MAX
//         sysY = -1 * ((y * 2 * MERC_MAX) / _maxxy - MERC_MAX)
// _maxxy = 2^maxZoom * tileSize（256）
xy2SysCoord(xy: Coordinate): Coordinate
sysCoord2Xy(sysCoord: Coordinate): Coordinate
```

**⑥ 回転行列** (mixin.ts 内で使われているが実装は view_ex.ts 等を確認すること):
```typescript
// rotateMatrix(MERC_CROSSMATRIX, rotate) で5点を回転
// rotate が undefined の場合は OpenLayers の View から取得
```

> **注意**: `mixin.ts` 内には OpenLayers への依存（`getMap().getView()`, `getMap().getSize()` 等）が散在している。移管するのはビューポート数値変換の「純粋な計算ロジック」のみであり、OpenLayers の View から値を取得する部分は Core に残す。

#### 移管する「純粋な計算関数」の切り出し方針

移管対象は以下のステートレスな変換関数群：

| 関数 | 入力 | 出力 | OpenLayers依存 |
|------|------|------|---------------|
| `mercViewpoint2Mercs` | center(Coord), zoom(number), rotate(number), size([w,h]) | 5点 Coordinate[] | 依存なし（引数として渡す） |
| `mercs2MercViewpoint` | 5点 Coordinate[], size([w,h]) | center, zoom, rotate | 依存なし（size を引数で渡す） |
| `zoom2Radius` | size([w,h]), zoom(number) | radius(number) | 依存なし |
| `xy2SysCoord` | xy(Coord), maxxy(number) | sysCoord(Coord) | 依存なし |
| `sysCoord2Xy` | sysCoord(Coord), maxxy(number) | xy(Coord) | 依存なし |
| `MERC_MAX` | — | — | 定数 |
| `MERC_CROSSMATRIX` | — | — | 定数 |
| `rotateMatrix` | matrix, angle | 回転後matrix | 依存なし |

### 3.3 処理4: 地図間変換（ピクセル表示範囲↔ピクセル表示範囲）

**対象ファイル**: `MaplatCore/src/source/histmap_tin.ts`

#### 移管対象メソッド

**① ビューポート→メルカトル5点（TIN適用）** (`viewpoint2MercsAsync()` L.316–333):
```typescript
// 処理3の viewpoint2SysCoords → sysCoords2Xys → xy2MercAsync_returnLayer で TIN 変換
viewpoint2MercsAsync(viewpoint?: ViewpointArray, size?: Size): Promise<CrossCoordinatesArray>
```

**② メルカトル5点→ビューポート（TIN逆変換）** (`mercs2ViewpointAsync()` L.335–353):
```typescript
// merc2XyAsync_returnLayer → xys2SysCoords → sysCoords2Viewpoint
mercs2ViewpointAsync(mercs: CrossCoordinatesArray): Promise<ViewpointArray>
```

これらは処理2（submap TIN選択）と処理3（ビューポート↔5点変換）と処理1（TIN座標変換）を組み合わせた複合処理であり、新クラスのメソッドとして統合実装する。

---

## 4. v3 対応のために行うべきこと

`@maplat/core` は `@maplat/transform@^0.2.3` を使用しており、v3 フォーマットに未対応。新しいクラスを v3 対応にするため、以下を確認・対応する。

### 4.1 フォーマットバージョンの違いによる影響

| 項目 | v2 | v3 | 移行時の対応 |
|------|----|----|-------------|
| `bounds` プロパティ | なし（`wh` のみ） | コンパイル済みに含まれる | v3 では `compiled.bounds` をそのまま `xyBounds` として使える可能性あり |
| 境界頂点数 | 4 | 最大36 | submaps の `xyBounds` ポリゴン作成は変わらず動作するはず |
| `FORMAT_VERSION` | `2.00703` | `3` | `Transform.getFormatVersion()` で判定可能 |
| `strict_status` | `"strict"` / `"loose"` | `"strict"` / `"loose"` / `"error"` | エラー時の扱いを新クラスで考慮 |
| `xy` プロパティ | submap の座標オフセット | 同様 | `histmap_tin.ts` L.49 参照、継続使用 |

### 4.2 v3 対応時に特に確認が必要な点

1. **`bounds` と `xyBounds` の関係**: v3 の `compiled.bounds` はピクセル座標空間のポリゴン。これが submap の `xyBounds` として直接使えるか確認（現在は `sub_map.bounds` から手動で作成）
2. **`Transform.wh` プロパティ**: v3 でもメルカトル↔ピクセル変換の `_maxxy` 計算に使う `width`/`height` が正しく取得できるか確認
3. **`xy2SysCoord` の `_maxxy` 計算**: `_maxxy = 2^maxZoom * 256` の `maxZoom` は `Transform` のコンパイル済みデータから自動計算できないため、外部から渡す仕組みが必要か検討
4. **後方互換性**: v2 形式のコンパイル済みデータも新クラスで正常動作すること

---

## 5. 新クラスの構成案

### 5.1 設計方針

- `@maplat/transform` に新クラス `MapTransform` を追加する（クラス名は仮称、要検討）
- 既存の `Transform` クラスは変更しない（後方互換性を維持）
- `MapTransform` は `Transform` のインスタンス配列（メイン TIN + submap TIN群）を内包する
- OpenLayers への依存はゼロ（純粋な座標変換ロジックのみ）
- 将来的に `Transform` を継承・統合するか、別クラスとして並立するかは次フェーズで検討

### 5.2 `MapTransform` クラス の責務

```typescript
// @maplat/transform に追加する新クラス（仮称 MapTransform）

class MapTransform {
  // 内部状態
  private mainTin: Transform;           // メイン TIN
  private subTins: SubTinEntry[];       // submap TIN 群

  // --- 初期化 ---
  setMapData(mapData: MapData): void;
  // MapData = { compiled: Compiled, sub_maps?: SubMapData[] }
  // SubMapData = { compiled: Compiled, priority: number, importance: number, bounds?: number[][] }

  // --- 処理2: submap TIN 選択付き変換 ---
  xy2Merc(xy: number[]): number[] | false;       // ピクセル→メルカトル（最適レイヤー選択）
  merc2Xy(merc: number[]): number[] | false;     // メルカトル→ピクセル（最適レイヤー選択）
  xy2MercWithLayer(xy: number[]): [number, number[]] | false;    // レイヤーID付き変換
  merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[];  // 複数レイヤー結果

  // --- 処理3: ビューポート変換 ---
  viewpointToMercs(viewpoint: Viewpoint, size: [number, number]): number[][];
  // Viewpoint = { center: number[], zoom: number, rotation: number }
  mercsToViewpoint(mercs: number[][], size: [number, number]): Viewpoint;

  // --- 処理4: 地図間変換 ---
  // Core 側でのみ必要なため、MapTransform に含めるかは要検討
  // （viewpointToMercs + mercsToViewpoint を Core 側で組み合わせることも可）

  // --- ユーティリティ（静的メソッドまたは独立関数）---
  static zoom2Radius(size: [number, number], zoom: number): number;
  static mercViewpoint2Mercs(center: number[], zoom: number, rotation: number, size: [number, number]): number[][];
  static mercs2MercViewpoint(mercs: number[][], size: [number, number]): Viewpoint;
  static xy2SysCoord(xy: number[], maxxy: number): number[];
  static sysCoord2Xy(sysCoord: number[], maxxy: number): number[];
}

// 定数エクスポート
export const MERC_MAX = 20037508.342789244;
export const MERC_CROSSMATRIX = [[0,0],[0,1],[1,0],[0,-1],[-1,0]];
```

### 5.3 型定義

```typescript
interface Viewpoint {
  center: number[];   // メルカトル座標 [x, y]
  zoom: number;       // メルカトルズームレベル
  rotation: number;   // 回転角（ラジアン）
}

interface SubTinEntry {
  tin: Transform;
  priority: number;
  importance: number;
  xyBounds: Feature<Polygon>;    // ピクセル座標空間のバウンズポリゴン
  mercBounds: Feature<Polygon>;  // メルカトル座標空間のバウンズポリゴン
}

interface SubMapData {
  compiled: Compiled;
  priority: number;
  importance: number;
  bounds?: number[][];    // xyBounds の生データ（省略可能：compiled.bounds を使用）
}

interface MapData {
  compiled: Compiled;
  sub_maps?: SubMapData[];
}
```

### 5.4 非同期処理について

現在の Core のメソッドは全て `Promise` ベース（`Async` サフィックス）だが、TIN の `transform()` 自体は同期処理。新クラスでは：

- 基本メソッドは**同期**で実装（`transform()` が同期のため）
- `MaplatCore` 側で必要な場合は `Promise.resolve()` でラップ
- ただし将来的に WebWorker 対応等が必要になる可能性を考慮し、Async 版も提供することを検討

---

## 6. MaplatCore 側の変更点

処理2〜4が `MaplatTransform` に移管された後、`MaplatCore` で変更が必要な箇所。

### 6.1 依存関係の更新

**`package.json`**:
```json
// 変更前
"@maplat/transform": "^0.2.3"
// 変更後
"@maplat/transform": "^0.6.0"  // 新クラスを含むバージョン
```

### 6.2 `store_handler.ts` の変更

現在 `Transform[]` の配列を返しているが、`MapTransform` を返すように変更（または `MapTransform` を組み立てる処理を追加）。

```typescript
// 変更前
export async function store2HistMap4Core(store): Promise<[HistMapStore, Transform[]]>

// 変更後（案1: MapTransform を返す）
export async function store2HistMap4Core(store): Promise<[HistMapStore, MapTransform]>

// 変更後（案2: 既存シグネチャを維持し MapTransform を別途構築）
// HistMap_tin.createAsync() 内で MapTransform を組み立てる
```

### 6.3 `histmap_tin.ts` の変更

**削除できるコード**:
- `xy2MercAsync_returnLayer()` → `MapTransform.xy2MercWithLayer()` に委譲
- `merc2XyAsync_returnLayer()` → `MapTransform.merc2XyWithLayer()` に委譲
- `mercs2SysCoordsAsync_multiLayer()` → `MapTransform` の新メソッドに委譲
- `viewpoint2MercsAsync()` → `MapTransform` + mixin ヘルパーで処理
- `mercs2ViewpointAsync()` → `MapTransform` + mixin ヘルパーで処理
- submap の `xyBounds`/`mercBounds` セットアップコード → `MapTransform.setMapData()` 内に移動

**残すコード**:
- OpenLayers の `addProjection` / `addCoordinateTransforms` の設定（OL 依存のため Core に残す）
- `setupMapParameter()` などの UI 初期化処理
- `merc2XyAsync()` / `xy2MercAsync()` などの公開 API（`MapTransform` に委譲する薄いラッパーとして残す）

### 6.4 `mixin.ts` の変更

**削除できるコード**:
- `mercViewpoint2Mercs()` → `MapTransform.mercViewpoint2Mercs()` に委譲
- `mercs2MercViewpoint()` → `MapTransform.mercs2MercViewpoint()` に委譲
- `zoom2Radius()` → `MapTransform.zoom2Radius()` に委譲
- `xy2SysCoord()` / `sysCoord2Xy()` （`setCustomFunctionMaplat` 内）→ `MapTransform` のユーティリティ関数に委譲

**残すコード**:
- OpenLayers の `getMap()`, `getView()`, `getSize()` からパラメータを取得する部分
- `setViewpoint()` などの UI メソッド（OpenLayers 操作を含む）
- `setCustomFunctionBase` 等のベースマップ用ミックスイン（座標変換ロジックなし）

### 6.5 `const_ex.ts` の変更

`MERC_MAX`, `MERC_CROSSMATRIX` を `@maplat/transform` からインポートするよう変更（または `@maplat/transform` からの再エクスポートに変更）。

---

## 7. テスト・デモの変更点

### 7.1 `@maplat/transform` に追加するテスト

**新規テストファイル: `tests/map-transform.test.ts`**

テストすべき内容:
- `MapTransform.setMapData()` で v2/v3 コンパイル済みデータをロード
- submap なしの単純ケース: `xy2Merc()` / `merc2Xy()` の動作
- submap ありのケース: 各領域で正しい TIN が選択されるか
- ビューポート変換: `viewpointToMercs()` / `mercsToViewpoint()` のラウンドトリップ精度
- `mercViewpoint2Mercs()` / `mercs2MercViewpoint()` の純粋関数テスト

**テストデータ**:
- `MaplatCore/maps/` の既存 JSON ファイル（`morioka.json` 等）を参照
- submap テストデータは `MaplatCore` の既存テストケースから移植

### 7.2 `@maplat/transform` デモの更新

`demo/demo.ts` に `MapTransform` のデモを追加（submap 選択可視化など）。

### 7.3 `@maplat/core` のテスト変更

**`spec/` 配下の既存テスト**: `MapTransform` への委譲後も同じ動作が保証されるよう回帰テストとして維持。

**`e2e/` 配下の E2E テスト**: OpenLayers との統合部分（表示範囲の取得・設定）は Core の E2E テストとして維持。

---

## 8. 実装タスクリスト

以下のタスクを順番に実施してください。各タスク完了後に動作確認を行うこと。

### フェーズ 0: 調査・準備

- [ ] **T0-1**: `MaplatCore` の `histmap_tin.ts` 全体を再読し、移管対象以外のコード（OpenLayers 操作、UI 処理等）を明確にリスト化する
- [ ] **T0-2**: `mixin.ts` の `rotateMatrix()` の実装箇所を特定する（`view_ex.ts` 等にある可能性）
- [ ] **T0-3**: `@maplat/transform` の `Transform` クラスに `wh`, `bounds`, `xy`, `priority`, `importance` プロパティが存在するか確認（`@ts-ignore` を使っている箇所から逆引き）
- [ ] **T0-4**: v3 の `compiled.bounds` が submap の `xyBounds` として直接使えるか、フォーマット仕様を `@maplat/tin` と `@maplat/transform` のソースで確認
- [ ] **T0-5**: `@maplat/core` の既存テスト（`spec/`）が現状で通っているか確認。通っていない場合は理由を記録

### フェーズ 1: `@maplat/transform` への純粋関数・定数の追加

- [ ] **T1-1**: `@maplat/transform` の `src/` に `constants.ts` を新規作成し、`MERC_MAX` と `MERC_CROSSMATRIX` を定義・エクスポート
  - `MERC_MAX` の値は `MaplatCore/src/const_ex.ts` から**そのままコピー**する（`20037508.342789244`）
  - `MERC_CROSSMATRIX` の値も同ファイルから**そのままコピー**する（5点の配列定義）
- [ ] **T1-2**: `src/` に `viewpoint.ts` を新規作成し、以下の純粋関数を実装：
  - `zoom2Radius(size: [number, number], zoom: number): number`
  - `rotateMatrix(matrix: number[][], theta: number): number[][]`（`theta` を必須引数にする。OL依存の `undefined` 時フォールバックは Core 側の責務）
  - `mercViewpoint2Mercs(center: number[], zoom: number, rotation: number, size: [number, number]): number[][]`
  - `mercs2MercViewpoint(mercs: number[][], size: [number, number]): Viewpoint`
  - **注意**: 各関数の実装は `MaplatCore/src/source/mixin.ts` の対応メソッドから**ロジックをそのまま移植**する（アルゴリズムの変更禁止、12節参照）
  - OL 依存部分（`getMap().getView()`, `getMap().getSize()` 等）は引数として受け取る形に変えるのみ
- [ ] **T1-3**: `src/` に `coord-utils.ts` を新規作成し、以下の純粋関数を実装：
  - `xy2SysCoord(xy: number[], maxxy: number): number[]`
  - `sysCoord2Xy(sysCoord: number[], maxxy: number): number[]`
  - **注意**: 実装は `mixin.ts` の `setCustomFunctionMaplat` 内の同名メソッドから**そのまま移植**。`this._maxxy` → 引数 `maxxy` に変えるのみ
- [ ] **T1-4**: `src/index.ts` からこれらをエクスポート
- [ ] **T1-5**: 上記関数のユニットテストを `tests/viewpoint.test.ts` と `tests/coord-utils.test.ts` に記述
- [ ] **T1-6**: ビルド確認・テスト通過確認

### フェーズ 2: `MapTransform` クラスの実装

- [ ] **T2-1**: `src/types.ts`（または新規 `src/map-transform-types.ts`）に型定義を追加：
  - `Viewpoint`, `SubTinEntry`, `SubMapData`, `MapData`
- [ ] **T2-2**: `src/map-transform.ts` に `MapTransform` クラスを新規作成：
  - `setMapData(mapData: MapData): void`
  - `xy2Merc(xy: number[]): number[] | false`（`xy2MercAsync` を同期化）
  - `merc2Xy(merc: number[]): number[] | false`（`merc2XyAsync` を同期化）
  - `xy2MercWithLayer(xy: number[]): [number, number[]] | false`（`xy2MercAsync_returnLayer` を同期化）
  - `merc2XyWithLayer(merc: number[]): ([number, number[]] | undefined)[]`（`merc2XyAsync_returnLayer` を同期化）
  - `mercs2SysCoords(mercs: number[][]): (number[][] | undefined)[]`（`mercs2SysCoordsAsync_multiLayer` を同期化）
  - `viewpoint2Mercs(viewpoint: Viewpoint, size: [number, number]): number[][]`（`viewpoint2MercsAsync` を同期化）
  - `mercs2Viewpoint(mercs: number[][], size: [number, number]): Viewpoint`（`mercs2ViewpointAsync` を同期化）
  - **注意**: 各メソッドの内部ロジックは `MaplatCore/src/source/histmap_tin.ts` の対応メソッドから**ロジックをそのまま移植**する
  - Promise ラッパーの除去、OpenLayers 呼び出しの直接 `transform()` 呼び出しへの置換、`@ts-ignore` の廃止のみ変更（12節参照）
  - `transformDirect(key, "EPSG:3857", xy)` → `this.mainTin.transform(xy, false)` / `this.subTins[i].tin.transform(xy, false, true)` への置換方法は T0-3 の調査結果で確認すること
- [ ] **T2-3**: `src/index.ts` から `MapTransform` と関連型をエクスポート
- [ ] **T2-4**: `tests/map-transform.test.ts` にテストを記述（T0-1〜T0-4 で特定した既存データを活用）
- [ ] **T2-5**: v2 コンパイル済みデータでテスト通過確認
- [ ] **T2-6**: v3 コンパイル済みデータでテスト通過確認（T0-4 の調査結果を踏まえた追加対応を含む）
- [ ] **T2-7**: ビルド確認・型チェック確認

### フェーズ 3: `@maplat/transform` のバージョンアップ・公開

- [ ] **T3-1**: `package.json` のバージョンを `0.6.0` にバンプ（`MapTransform` 追加に伴うマイナーバージョンアップ）
- [ ] **T3-2**: `CHANGELOG.md`（なければ新規作成）に変更内容を記録
- [ ] **T3-3**: npm に公開

### フェーズ 4: `@maplat/core` の `@maplat/transform` バージョン更新と移行

- [ ] **T4-1**: `package.json` の `@maplat/transform` 依存を `^0.6.0` に更新
- [ ] **T4-2**: `store_handler.ts` を修正：`Transform[]` ではなく `MapTransform` を構築して返すよう変更
- [ ] **T4-3**: `histmap_tin.ts` を修正：
  - `this.tins: Transform[]` → `this.mapTransform: MapTransform`
  - `xy2MercAsync_returnLayer()` 等を `MapTransform` メソッドに委譲
  - submap 設定コードを削除（`MapTransform.setMapData()` に委譲）
  - **同期化対応**: `MapTransform` メソッドは同期のため、呼び出し元の `.then()` チェーン・`await` をすべて同期呼び出しに変える。例:
    ```typescript
    // 変更前（旧来の不要 async）
    this.xy2MercAsync_returnLayer(xy).then(result => { ... })
    // 変更後（MapTransform 同期メソッドへの委譲）
    const result = this.mapTransform.xy2MercWithLayer(xy);
    ```
  - `setupMapParameter(callback)` などで Promise チェーンを使っている箇所も同期化する
- [ ] **T4-4**: `mixin.ts` を修正：
  - `mercViewpoint2Mercs()` / `mercs2MercViewpoint()` 等を `@maplat/transform` からインポートした関数に委譲
  - `xy2SysCoord()` / `sysCoord2Xy()` を `@maplat/transform` からインポートした関数に委譲（`this._maxxy` を引数として渡す）
  - `rotateMatrix()` を `@maplat/transform` からインポートした関数に委譲（`theta === undefined` の場合は `this.getMap().getView().getRotation()` で取得してから渡す）
  - **同期化対応（参考）**: 11節の分析表に挙げた `mixin.ts` 内の不要 async メソッド群も、`MapTransform` への委譲に合わせて同期化を検討する。ただし、基底 mixin の抽象メソッドシグネチャ変更は影響範囲が広いため、変更前に `HistMap_tin` 以外の派生クラス（`NowMap` 等）への影響を確認すること
- [ ] **T4-5**: `const_ex.ts` を修正：`MERC_MAX`, `MERC_CROSSMATRIX` を `@maplat/transform` からインポート（または再エクスポート）
- [ ] **T4-6**: TypeScript の型エラーを解消（特に `@ts-ignore` を使っていた箇所）
- [ ] **T4-7**: 既存テスト（`spec/`）の通過確認
- [ ] **T4-8**: E2E テスト（`e2e/`）の通過確認
- [ ] **T4-9**: ブラウザでの動作確認（`examples/` のデモを使用）

### フェーズ 5: 後処理・クリーンアップ

- [ ] **T5-1**: `MaplatCore` 側で不要になった移管済みコードを削除
- [ ] **T5-2**: 各リポジトリの `README.md` / `README.ja.md` を更新
- [ ] **T5-3**: `@maplat/core` のバージョンをバンプ（`0.11.0` 等）して公開

---

## 9. 依存関係グラフ（移管後）

```
@maplat/transform (v0.6.0)
  ├── Transform クラス（既存: 処理1）
  ├── MapTransform クラス（新規: 処理2+3+4）
  ├── 座標変換ユーティリティ関数群（新規: 処理3の純粋関数）
  └── MERC_MAX, MERC_CROSSMATRIX 定数（新規）

@maplat/tin (v0.14.0)
  └── Tin クラス（処理1のデータ生成、@maplat/transform を継承・依存）

@maplat/core (v0.11.0)
  ├── MapTransform に委譲（処理2+3+4）
  ├── Transform に委譲（処理1）
  └── OpenLayers 統合・UI・POI 等の Core 固有機能
```

---

## 10. 注意事項・リスク

1. **OpenLayers 依存の混入リスク**: `@maplat/transform` はブラウザ・Node.js 両対応ライブラリ。`MapTransform` の実装に OpenLayers の型や関数が混入しないよう注意（`ol/` からのインポートは禁止）

2. **非同期処理の方針変更**: Core の既存コードは全て Async（Promise）だが、TIN 変換は同期。移行後は同期メソッドを基本とし、Core 側で必要に応じて `Promise.resolve()` でラップする

3. **`@ts-ignore` の廃止**: Core で `tin.xyBounds = ...` 等を `@ts-ignore` で黙認していた箇所を、正式な型定義に変える。`SubTinEntry` 型に適切なプロパティを定義すること

4. **後方互換性**: `@maplat/transform` の既存 API（`Transform` クラス）は変更しない。`MapTransform` は完全に新しいクラスとして追加する

5. **v2 の継続サポート**: 新クラスは v2 コンパイル済みデータも正常に処理できること。既存の地図データ（`MaplatCore/maps/*.json`）は v2 形式のため、デグレードが発生しないこと

6. **`rotateMatrix` の実装位置**: Core の `mixin.ts` では `this.rotateMatrix(MERC_CROSSMATRIX, rotate)` として呼び出しているが、実装が `view_ex.ts` 等にある可能性がある。T0-2 で確認すること

---

## 11. 不要な非同期処理の特定と対応方針

### 11.1 基本方針

`MaplatCore` の移管対象メソッドを調査した結果、**TIN の `transform()` メソッド自体が同期処理**であるため、それを呼び出す一連のメソッドチェーンは全て実質的に同期処理で実現できる。

にもかかわらず、現在の Core ではこれらが `Promise` でラップされており、不必要な非同期 API になっている。新しい `MapTransform` クラスでは、これらを**同期メソッドとして実装**する。

`MaplatCore` 側での呼び出し箇所は、`MapTransform` 移管後に Core 担当者が `.then()` / `await` を外す形で対応する。

### 11.2 移管対象メソッドの同期/非同期 分析

#### `histmap_tin.ts` — 全て不要な非同期

| メソッド | 現状 | 内部処理 | 判定 |
|---------|------|---------|------|
| `xy2MercAsync_specifyLayer(xy, layerId)` | `new Promise(resolve => resolve(transformDirect(...)))` | `transformDirect()` は OpenLayers の同期変換 | **不要な async → 同期化** |
| `merc2XyAsync_specifyLayer(merc, layerId)` | 同上パターン | 同上 | **不要な async → 同期化** |
| `xy2MercAsync_returnLayer(xy)` | `new Promise(...)` で包み内部で `xy2MercAsync_specifyLayer` を呼ぶ | 上記が同期なので全体同期 | **不要な async → 同期化** |
| `merc2XyAsync_returnLayer(merc)` | `Promise.all(tins.map(...))` | 内部は全て `merc2XyAsync_specifyLayer`（同期）のみ | **不要な async → 同期化** |
| `mercs2SysCoordsAsync_multiLayer(mercs)` | `merc2XyAsync_returnLayer` + `merc2XyAsync_specifyLayer` の Promise チェーン | 両方同期化されれば全体同期 | **不要な async → 同期化** |
| `viewpoint2MercsAsync(viewpoint, size)` | `xy2MercAsync_returnLayer` + `xy2MercAsync_specifyLayer` の Promise チェーン | 両方同期化されれば全体同期 | **不要な async → 同期化** |
| `mercs2ViewpointAsync(mercs)` | `merc2XyAsync_returnLayer` + `merc2XyAsync_specifyLayer` の Promise チェーン | 両方同期化されれば全体同期 | **不要な async → 同期化** |
| `merc2XyAsync_base(merc, ignoreBackground)` | `merc2XyAsync_returnLayer` を `.then()` | 上記同期化で全体同期 | **不要な async → 同期化** |
| `merc2XyAsync_ignoreBackground(merc)` | `merc2XyAsync_base` の薄いラッパー | 同上 | **不要な async → 同期化** |
| `merc2XyAsync(merc)` | `merc2XyAsync_base` の薄いラッパー | 同上 | **不要な async → 同期化** |
| `xy2MercAsync(xy)` | `xy2MercAsync_returnLayer` の薄いラッパー | 同上 | **不要な async → 同期化** |

#### `mixin.ts` — `setCustomFunctionMaplat` / `setCustomFunctionBase` 内の関連メソッド（参考）

これらは `MaplatCore` に残るメソッドだが、`MapTransform` の同期メソッドへの委譲に伴い Core 側でも同期化可能になる。Core 担当者の参考として記録する。

| メソッド | 所在 | 判定 |
|---------|------|------|
| `merc2XyAsync(merc)` | `setCustomFunctionBase` | `Promise.resolve(merc)` — 恒等関数を async にしているだけ。**不要な async** |
| `xy2MercAsync(xy)` | `setCustomFunctionBase` | `Promise.resolve(xy)` — 同上。**不要な async** |
| `merc2XyAsync_ignoreBackground(merc)` | `setCustomFunctionBase` | 上記 `merc2XyAsync` のラッパー。**不要な async** |
| `viewpoint2MercsAsync()` | `setCustomFunctionBase` | `xys2MercsAsync` 経由だが内部は全て同期可能。**不要な async** |
| `mercs2ViewpointAsync()` | `setCustomFunctionBase` | 同上。**不要な async** |
| `mercs2SysCoordsAsync_multiLayer()` | `setCustomFunctionBase` | `merc2SysCoordAsync` 経由だが内部同期。**不要な async** |
| `merc2SysCoordAsync()` | `setCustomFunction`（基底） | `merc2XyAsync`（同期化後）+ `xy2SysCoord`（同期）。**不要な async** |
| `merc2SysCoordAsync_ignoreBackground()` | `setCustomFunction`（基底） | 同上。**不要な async** |
| `sysCoord2MercAsync()` | `setCustomFunction`（基底） | `sysCoord2Xy`（同期）+ `xy2MercAsync`（同期化後）。**不要な async** |
| `mercs2XysAsync()` | `setCustomFunction`（基底） | `merc2XyAsync`（同期化後）の `map`。**不要な async** |
| `xys2MercsAsync()` | `setCustomFunction`（基底） | `xy2MercAsync`（同期化後）の `map`。**不要な async** |

### 11.3 `rotateMatrix` について

`mixin.ts` L.399–411 の `rotateMatrix(xys, theta?)`:

```typescript
rotateMatrix(xys: number[][], theta?: number): Coordinate[] {
  if (theta === undefined) {
    theta = this.getMap().getView().getRotation();  // OpenLayers依存
  }
  // ... 回転計算（純粋な数学処理）
}
```

数学計算部分は完全に同期かつ純粋関数だが、`theta === undefined` のとき OpenLayers の `View.getRotation()` を呼ぶ。

**新 `MapTransform` での扱い**:
- `theta` を **必須引数** として切り出す（`undefined` を許容しない）
- OpenLayers から `theta` を取得する処理は Core 側の責務とする
- 計算ロジック自体は現在の実装をそのまま移植する

### 11.4 新 `MapTransform` クラスのメソッド命名方針

同期化に伴い、メソッド名から `Async` サフィックスを除去する。対応表：

| Core 旧メソッド名 | MapTransform 新メソッド名 |
|-----------------|------------------------|
| `xy2MercAsync_returnLayer(xy)` | `xy2MercWithLayer(xy)` |
| `merc2XyAsync_returnLayer(merc)` | `merc2XyWithLayer(merc)` |
| `mercs2SysCoordsAsync_multiLayer(mercs)` | `mercs2SysCoords(mercs)` |
| `viewpoint2MercsAsync(viewpoint, size)` | `viewpoint2Mercs(viewpoint, size)` |
| `mercs2ViewpointAsync(mercs)` | `mercs2Viewpoint(mercs)` |

（`xy2Merc` / `merc2Xy` 等のシンプルな変換メソッドは既に非同期サフィックスなし）

---

## 12. 実装移植の忠実性方針

### 12.1 基本原則

**「移植」であって「再実装」ではない。**

移管対象コードは `MaplatCore` において動作が確認済みのロジックである。新 `MapTransform` クラスに移植する際は、以下の原則を厳守する：

> **内部のアルゴリズム・ロジックを変更しない。** 外形仕様から推測して処理を書き直す、より単純な実装に置き換える、等は行わない。

### 12.2 許可される変更

以下の変更は移植に際して必然的に発生するため、許可する：

| 変更の種別 | 具体例 | 理由 |
|-----------|-------|------|
| **Promise ラッパーの除去** | `new Promise(resolve => resolve(x))` → `return x` | 11節で特定した不要な async の解消 |
| **OpenLayers 依存の分離** | `this.getMap().getView().getRotation()` → 引数 `theta: number` として受け取る | OL 依存ゼロの設計方針 |
| **OpenLayers 依存の変換呼び出し変更** | `transformDirect(layerKey, "EPSG:3857", xy)` → `tin.transform(xy, false)` | OL の `addCoordinateTransforms` 機構を使わず `Transform.transform()` を直接呼ぶ |
| **インスタンスプロパティの正式化** | `tin.xyBounds = ...`（`@ts-ignore`）→ `SubTinEntry` の正式プロパティ | 型安全性の確保 |
| **クラス構造の変更** | `Transform[]` 配列 → `MapTransform` クラス内の `mainTin` + `subTins` | 移管先クラスの構造 |

### 12.3 禁止事項

以下は **実施してはならない**：

- `merc2XyAsync_returnLayer()` の reduce ロジックを「読みやすく」書き直す
- `mercs2MercViewpoint()` の角度計算・zoom計算を別の算式に置き換える
- `xy2SysCoord()` / `sysCoord2Xy()` の線形変換式を「整理」する
- `mercViewpoint2Mercs()` の5点生成ロジックを変更する
- submaps の priority / importance 選択ロジックを変更する
- エラーハンドリングの挙動を変える（存在しないケースを追加する、`false` 返却を例外に変える、等）

### 12.4 `transformDirect` について

`histmap_tin.ts` の `xy2MercAsync_specifyLayer()` / `merc2XyAsync_specifyLayer()` は、OpenLayers の `transformDirect()` を経由して変換を呼び出している。これは `addCoordinateTransforms()` で登録した変換ペア（内部では `tin.transform()` を呼ぶ）を OL のプロジェクション機構経由で実行している。

`MapTransform` では OL プロジェクション機構を使わず、**対応する `Transform` インスタンスの `transform()` を直接呼ぶ**形に変更する。これは同等の結果を返す。

```typescript
// Core 旧実装（OL経由）
transformDirect(`Illst:${mapID}#${layerId}`, "EPSG:3857", xy)

// MapTransform 新実装（直接呼び出し）
this.subTins[layerId - 1].tin.transform(xy, false, true)
// ※ ignoreBounds: true は submap の場合の既存挙動を維持（histmap_tin.ts L.56 参照）
```

---

## 付録A: 主要ファイルパス対照表

| リポジトリ | ファイルパス | 役割 |
|-----------|------------|------|
| MaplatTransform | `src/index.ts` | `Transform` クラスのエントリポイント |
| MaplatTransform | `src/types.ts` | 型定義 |
| MaplatTransform | `src/compiled-state.ts` | v2/v3/Legacy フォーマット処理 |
| MaplatTransform | `src/geometry.ts` | 座標変換の幾何計算 |
| MaplatTin | `src/tin.ts` | `Tin` クラス（Transform 継承） |
| MaplatTin | `src/index.ts` | エントリポイント |
| MaplatCore | `src/source/histmap_tin.ts` | TIN 変換クラス（処理2+4の移管元） |
| MaplatCore | `src/source/mixin.ts` | ミックスイン（処理3の移管元） |
| MaplatCore | `src/source/store_handler.ts` | TIN データのロード処理 |
| MaplatCore | `src/const_ex.ts` | `MERC_MAX` 等の定数（移管元） |

## 付録B: 関連 GitHub Issues / 参考

- MaplatCore CLAUDE.md: `@maplat/tin → @maplat/transform に置き換え予定` と記載あり（すでに完了）
- MaplatCore CLAUDE.md: `unifyTerm対応` コメントが `histmap_tin.ts` と `mixin.ts` 内にあり（Issue #19 参照）

---

*本ドキュメントは調査・計画フェーズで作成。実装が進むにつれ、各セクションに実際の実装判断・変更点を追記してください。*
