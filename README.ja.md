# Maplat Transform

[![CI](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml/badge.svg)](https://github.com/code4history/MaplatTransform/actions/workflows/test.yml)

Maplatで生成された座標変換定義を使用して、2つの平面座標系間で座標変換を実現するJavaScriptライブラリです。
[Maplat](https://github.com/code4history/Maplat/)プロジェクトの一部として開発されています。

English README is [here](./README.md).

## 主な機能

- **座標変換定義のインポート:** Maplatで生成された座標変換定義をインポートし、変換のための内部構造を構築
- **双方向座標変換:** 2つの平面間で双方向の座標変換が可能
- **位相保存:** 変換時の同相性（トポロジー）を維持
- **複数の座標系サポート:** 通常の直交座標系、Y軸反転座標系、鳥瞰図のような歪んだ座標系など、様々な座標系間の変換に対応
- **状態管理:** 変換状態の保存と復元をサポート

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

## API リファレンス

### Transform クラス

座標変換を行うメインクラスです。

#### コンストラクタ

```javascript
const transform = new Transform();
```

#### メソッド

##### `setCompiled(compiled: Compiled | CompiledLegacy): void`

Maplatで生成されたコンパイル済み変換定義をインポートして適用します。

- **パラメータ:**
  - `compiled`: コンパイル済み変換定義オブジェクト

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

### エクスポートされる型

- `PointSet`, `BiDirectionKey`, `WeightBufferBD`, `VertexMode`, `StrictMode`, `StrictStatus`, `YaxisMode`
- `CentroidBD`, `TinsBD`, `KinksBD`, `VerticesParamsBD`, `IndexedTinsBD`
- `Compiled`, `CompiledLegacy`
- `Tins`, `Tri`, `PropertyTriKey`
- `Edge`, `EdgeSet`, `EdgeSetLegacy`

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