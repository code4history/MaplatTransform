# Changelog

このプロジェクトの主な変更を記録します。版数は [Semantic Versioning](https://semver.org/) に従います。

## [Unreleased]

### Added
- Added `WorldFileSurface`, `ProjectionEngine`, `SurfaceLike`, and layered map loading through `MapTransform.setLayeredMapData()` / `getSurfaceTransform()`. The built-in projection engine supports EPSG:3857 and EPSG:4326.
- Added the public world-file helpers `worldFileToCrs()`, `crsToWorldFilePixel()`, and `validateWorldFile()`, using the half-pixel convention and rejecting singular or mirrored transforms.
- Added compiled `outerTransform: "extrapolate" | "worldFile"` and `worldFile` keys. The default remains `"extrapolate"`; the world-file mode requires `worldFile` and allows omission of `vertices_params` and `centroid_point`.
- `WorldFileSurface`・`ProjectionEngine`・`SurfaceLike` と、`MapTransform.setLayeredMapData()`／`getSurfaceTransform()` による層データの読み込みを追加。内蔵投影エンジンは EPSG:3857・4326 に対応。
- 半画素規約による公開関数 `worldFileToCrs()`・`crsToWorldFilePixel()`・`validateWorldFile()` を追加。非正則行列と鏡像を拒否。
- compiled の鍵 `outerTransform: "extrapolate" | "worldFile"` と `worldFile` を追加。既定は `"extrapolate"`。world file モードでは `worldFile` が必須で、`vertices_params`・`centroid_point` は省略可能。

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
