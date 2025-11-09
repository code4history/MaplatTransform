# MaplatTransform Runtime Notes

This note explains how the `Transform` class reconstructs its state from compiled payloads and how coordinate lookups are resolved at runtime.

## Compiled Payload Loading (`src/compiled-state.ts`)

`restoreModernState()` normalizes every payload emitted by MaplatTin:

1. **Weight buffers.** Older payloads may store vertex ids such as `cent0` or `edgeNode1`. Each key is normalized via `normalizeNodeKey()` so runtime lookups only see canonical ids.
2. **Vertex tins.** The quadrilateral built from vertices `b0`–`b3` is regenerated twice (forward/backward) through `indexesToTri()`, ensuring consistent padding even when only serialized indices exist.
3. **Strict status.** If `strict_status` is absent, the helper infers it from `kinks_points` (=> `strict_error`) or whether two tin sets were emitted (=> `loose`). Otherwise it assumes `strict`.
4. **Bounds and metadata.** Bounds, centroid features, edge nodes, and optional `kinks_points` are packaged into a single `ModernStatePayload`. Missing bounds fall back to `[0, 0]` just like the legacy workflow.

`Transform.setCompiled()` now simply delegates to `restoreModernState()` or `restoreLegacyState()`, then assigns everything via `applyModernState()` / `applyLegacyState()`. The heavy parsing no longer lives inside the class.

## Legacy Payload Handling (`restoreLegacyState`)

Legacy payloads rename `cent` → `c` and `bbox0` → `b0` before being reused. Tins are taken as-is, then `rebuildLegacyPoints()` walks every forward triangle to repopulate `points`. This mirrors the previous inline logic but keeps the compatibility shim isolated.

## Grid Index Construction (`Transform.addIndexedTin`)

When a compiled tin holds enough triangles (`gridNum >= 3`), the method builds two uniform grids (forward/backward). For each triangle, its bounding box is snapped into grid buckets via `unitCalc()`. Every cell stores the indexes of candidate triangles that overlap the cell. If there are too few triangles, the index is skipped so lookups simply scan the feature collection.

## Lookup Flow (`transformArr` in `src/geometry.ts`)

`Transform.transform()` prepares the feature, resolves bounds, and forwards the heavy lifting to `transformArr()`:

1. **Hit cache.** If state caching is enabled, the previously hit triangle is tested first.
2. **Grid-assisted search.** When an index is available, the point is normalized to a grid cell and only the referenced triangles are tested.
3. **Triangle interpolation.** Successful hits go through `transformTinArr()`, which computes barycentric weights and applies the weight buffer if present.
4. **Vertex fallback.** Points outside every triangle switch to `useVerticesArr()`, projecting the point onto the padded quadrilateral defined by `vertices_params`.

Backward transforms mirror the same flow, but use the backward tins/vertices/weights and optionally apply the bounds check after interpolation.

## Mode & Axis Handling

`applyModernState()` restores `strictMode`, `vertexMode`, and `yaxisMode`. When no axes mode is provided it defaults to `YAXIS_INVERT` so calling `transform([...], true)` keeps the historical inversion semantics. Bounds are enforced for forward transforms; backward transforms verify the polygon after interpolation.
