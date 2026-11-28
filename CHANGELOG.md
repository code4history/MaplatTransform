# Changelog

このプロジェクトの主な変更を記録します。版数は [Semantic Versioning](https://semver.org/) に従います。

## [Unreleased]

### Added
- Added round-trip viewpoint conversion: per-layer lazily built `ViewpointField` (mode 2 grid / mode 1 constant via `viewpointMode`), an optional `layerIndex` on `viewpoint2Mercs` / `mercs2Viewpoint`, `MapTransform.getViewpointCoefficients()`, and `recommendViewpointMode()` (judged on the p95 statistic: p95 rotation deviation ≤ 1.0° and p95 scale ratio deviation ≤ 3% recommend `"constant"`). ラウンドトリップ対応の視点変換（層ごとの `ViewpointField` 遅延構築・`viewpointMode`・省略可能な `layerIndex`・`getViewpointCoefficients`・`recommendViewpointMode`〔統計量は p95。p95 回転偏差 1.0° 以内かつ p95 縮尺比偏差 3% 以内で `"constant"` を推奨〕）を追加。
- Added `MapTransform.probeViewpointCoefficients(layerIndex, xy, radiusPx)`, the entry point for Core's default zoom (maps without `mercZoom`): in mode 2 it measures at the paper center without building a grid.
- Core の既定ズーム（mercZoom が無い地図）のための口 `MapTransform.probeViewpointCoefficients(layerIndex, xy, radiusPx)` を追加（モード 2 では格子を作らずに紙の中心で測る）。
- Added `createProj4ProjectionEngine(proj4)` for world-file and TIN layers, including TINs with world-file outer transforms. Proj4js is an optional peer dependency. `CrsObject.epsg` is optional; layers outside EPSG:3857 and EPSG:4326 require a proj4 definition.
- world file・三角網の層（外周に world file を使う三角網を含む）に `createProj4ProjectionEngine(proj4)` を追加。proj4js は任意の peer 依存。`CrsObject.epsg` を任意にし、EPSG:3857・4326 以外の層の変換には proj4 定義を必須にした。
- Added `WorldFileSurface`, `ProjectionEngine`, `SurfaceLike`, and layered map loading through `MapTransform.setLayeredMapData()` / `getSurfaceTransform()`. The built-in projection engine supports EPSG:3857 and EPSG:4326.
- Added the public world-file helpers `worldFileToCrs()`, `crsToWorldFilePixel()`, and `validateWorldFile()`, using the half-pixel convention and rejecting singular or mirrored transforms.
- Added compiled `outerTransform: "extrapolate" | "worldFile"` and `worldFile` keys. The default remains `"extrapolate"`; the world-file mode requires `worldFile` and allows omission of `vertices_params` and `centroid_point`.
- `WorldFileSurface`・`ProjectionEngine`・`SurfaceLike` と、`MapTransform.setLayeredMapData()`／`getSurfaceTransform()` による層データの読み込みを追加。内蔵投影エンジンは EPSG:3857・4326 に対応。
- 半画素規約による公開関数 `worldFileToCrs()`・`crsToWorldFilePixel()`・`validateWorldFile()` を追加。非正則行列と鏡像を拒否。
- compiled の鍵 `outerTransform: "extrapolate" | "worldFile"` と `worldFile` を追加。既定は `"extrapolate"`。world file モードでは `worldFile` が必須で、`vertices_params`・`centroid_point` は省略可能。
- Restored the original required fields on `Compiled` and added `CompiledWorldFileOuter` for world-file-backed TIN boundaries. Hardened CRS normalization, finite output checks, bounds handling, and indexed outer-boundary lookup.
- `Compiled` の従来の必須フィールドを復元し、world file 外周を使う三角網用に `CompiledWorldFileOuter` を追加。CRS 正規化、非有限出力、bounds 判定、外周探索を修正。

### Changed
- Changed what `viewpoint2Mercs` / `mercs2Viewpoint` return: on TIN maps the zoom and rotation change (up to 0.40 zoom and 5.6° rotation on the 1932 Nobeoka map), and the five points are now an ideal similarity.
- `viewpoint2Mercs` / `mercs2Viewpoint` の戻り値が変わる（三角網の地図で zoom・rotation が変わる。延岡で最大 zoom 0.40・回転 5.6°。5 点は理想の相似になる）。
- The surrounding four points no longer throw when they fall outside the map.
- 周りの 4 点が範囲の外に出ても例外にならない。
- Replaced the `acos` in `mercs2MercViewpoint` with `atan2`.
- `mercs2MercViewpoint` の acos を atan2 にした。

### Fixed
- 細工された変換データで索引づくりが 2 乗になるのを上限で止めた (#25)
- 索引が無いときに変換が例外になる不具合を直した (#25)
- 変換データの読み込みで `vertices_params` の形（配列であること・長さ・要素が有限の数であること）を確かめ、合わないデータは `setCompiled` が例外にするようにした
- dist の型定義が参照する `geojson` の型が `hoist: false` の利用者で解決できない不具合を直した（`@types/geojson` を dependencies へ移動）(#35)

## [1.1.0] - 2026-10-05

1.1.0-rc.1 と同じ内容の正式版です（版番号のみ変更）。変更点は 1.1.0-rc.1 までの各項を参照してください。

## [1.1.0-rc.1] - 2026-09-28

### Added
- `merc2XyVisibleLayers` を追加（MaplatTransform#9）

### Changed
- 三角形内の変換で `weight_buffer` を使わず、純アフィンで変換するようにした（重み付き補間が変換品質を下げていたため）
- 依存関係を更新
