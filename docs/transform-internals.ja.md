# MaplatTransform 実行時メモ

ここでは `Transform` クラスがコンパイル済みデータをどのように復元し、実行時に座標検索をどう処理するかをまとめます。

## コンパイル済みデータの復元（`src/compiled-state.ts`）

`restoreModernState()` は MaplatTin が出力したペイロードを以下のように正規化します。

1. **ウエイトバッファ** — 古いフォーマットでは `cent0` や `edgeNode1` といったキーが含まれるため、`normalizeNodeKey()` で現在の命名規則に揃えます。
2. **頂点用TIN** — `b0`〜`b3` から構成される四角形を `indexesToTri()` で前後方向それぞれ再生成し、シリアライズ済みインデックスだけでも同じ境界が再現されるようにします。
3. **strict status 推定** — `strict_status` が無い場合は `kinks_points` の有無（→ `strict_error`）や TIN セット数（2セットなら `loose`）から自動判定し、それ以外は `strict` とします。
4. **境界・メタ情報** — 境界、多角形、セントロイド、エッジノード、`kinks_points` などを `ModernStatePayload` に一括で詰め、境界が無いケースは旧実装同様 `[0, 0]` を既定とします。

`Transform.setCompiled()` は `restoreModernState()` / `restoreLegacyState()` の結果を `applyModernState()` / `applyLegacyState()` に渡すだけになり、重い復元処理をクラス外へ切り出しました。

## レガシーペイロード（`restoreLegacyState`）

互換モードでは `cent`→`c`、`bbox0`→`b0` へ文字列置換してから既存TINをそのまま利用します。`rebuildLegacyPoints()` が正方向TINを走査し、各頂点の元座標／変換後座標ペアを再構築します。これにより旧実装と同じ挙動を守りつつ互換コードを分離できます。

## グリッドインデックス構築（`Transform.addIndexedTin`）

TINの三角形が十分ある場合（`gridNum >= 3`）、前後それぞれ均等グリッドを生成します。各三角形のバウンディングボックスを `unitCalc()` でグリッドに正規化し、該当セルに三角形インデックスを蓄積します。三角形が少なければインデックス化をスキップし、従来通り全探索します。

## 変換フロー（`src/geometry.ts` の `transformArr`）

`Transform.transform()` は点のFeature生成や境界チェックを行った後、実際の判定を `transformArr()` へ委譲します。

1. **キャッシュ三角形** — 状態キャッシュが有効なら直前の三角形を最初にテストします。
2. **グリッド検索** — インデックスがある場合は点をグリッドに正規化し、対応セルの三角形だけを走査します。
3. **三角形補間** — ヒットした三角形は `transformTinArr()` でバリセントリック補間を行い、ウエイトバッファがある場合はその場で補正します。
4. **頂点フォールバック** — どの三角形にも入らなかった場合は `useVerticesArr()` を利用して境界四角形上で補間します。

逆変換でも同じ流れを辿りますが、補間後に境界外チェックを行い、必要に応じて `false` を返します。

## モードと軸処理

`applyModernState()` は `strictMode`、`vertexMode`、`yaxisMode` をまとめて復元します。`yaxisMode` が無い場合は既定で `YAXIS_INVERT` を適用し、歴史的なY軸反転付きの逆変換を維持します。境界は正方向でのみ事前チェックし、逆方向では補間後の結果を検証します。
