# Changelog

このプロジェクトの主な変更を記録します。版数は [Semantic Versioning](https://semver.org/) に従います。

## [1.1.0-rc.1] - 2026-09-28

### Added
- `merc2XyVisibleLayers` を追加（MaplatTransform#9）

### Changed
- 三角形内の変換で `weight_buffer` を使わず、純アフィンで変換するようにした（重み付き補間が変換品質を下げていたため）
- 依存関係を更新
