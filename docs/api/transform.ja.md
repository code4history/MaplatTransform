# Transform クラス

座標変換を行うメインクラス（処理1）。

## コンストラクタ

```javascript
import { Transform } from '@maplat/transform';

const transform = new Transform();
```

## メソッド

### `setCompiled(compiled: Compiled | CompiledLegacy): void`

Maplatで生成されたコンパイル済み変換定義をインポートして適用します。レガシー形式、V2（4境界頂点）、V3（N境界頂点）を自動的に判別して処理します。

- **パラメータ:**
  - `compiled`: コンパイル済み変換定義オブジェクト（V2、V3、またはレガシー形式）

### `transform(apoint: number[], backward?: boolean, ignoreBounds?: boolean): number[] | false`

座標変換を実行します。

- **パラメータ:**
  - `apoint`: 変換する座標 `[x, y]`
  - `backward`: 逆方向の変換を行うか（デフォルト: `false`）
  - `ignoreBounds`: 境界チェックを無視するか（デフォルト: `false`）
- **戻り値:** 変換後の座標、または境界外の場合は `false`
- **例外:** `strict_status == "strict_error"` の状態で逆変換を試みた場合にエラーをスロー

## 静的定数

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

## エクスポートされる型

- `PointSet`, `BiDirectionKey`, `WeightBufferBD`, `VertexMode`, `StrictMode`, `StrictStatus`, `YaxisMode`
- `CentroidBD`, `TinsBD`, `KinksBD`, `VerticesParamsBD`, `IndexedTinsBD`
- `Compiled`, `CompiledLegacy`
- `Tins`, `Tri`, `PropertyTriKey`
- `Edge`, `EdgeSet`, `EdgeSetLegacy`

## エクスポートされるユーティリティ関数

- `transformArr`: 低レベルの座標変換関数
- `rotateVerticesTriangle`: 三角形の頂点を回転
- `counterTri`: カウンター三角形ユーティリティ
- `normalizeEdges`: エッジ定義の正規化

## フォーマットバージョン

```javascript
import { format_version } from '@maplat/transform';
console.log(format_version); // 現在のフォーマットバージョン
```

コンパイル済みデータのフォーマットには2つのモダンバージョンがあります:

- **V2:** マップのバウンディングボックスから算出した固定4点の境界頂点を使用
- **V3:** N個（4以上）の境界頂点を使用し、特にマップ端付近の変換精度を向上

どちらのフォーマットも `setCompiled()` が自動的に判別して処理します。V3フォーマットのコンパイル済みデータはバージョン3以降の[@maplat/tin](https://github.com/code4history/MaplatTin/)で生成されます。

## See also

- [MapTransform クラス](map-transform.ja.md) — サブマップ選択・ビューポート変換・地図間同期（処理2〜4）
- [Transform Internals](../transform-internals.ja.md) — Transformクラスの状態復元と座標検索処理に関する実行時メモ
- [メイン README](../README.ja.md) — インストール / クイックスタート / エコシステム
