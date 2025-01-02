# Maplat Transform

Maplatで生成された座標変換定義を使用して、2つの平面座標系間で座標変換を実現するJavaScriptライブラリです。
[Maplat](https://github.com/code4history/Maplat/)プロジェクトの一部として開発されています。

English README is [here](./README.md).

## 主な機能

- **座標変換定義のインポート:** Maplatで生成された座標変換定義をインポートし、変換のための内部構造を構築
- **双方向座標変換:** 2つの平面間で双方向の座標変換が可能
- **位相保存:** 変換時の同相性（トポロジー）を維持
- **複数の座標系サポート:** 通常の直交座標系、Y軸反転座標系、鳥瞰図のような歪んだ座標系など、様々な座標系間の変換に対応
- **状態管理:** 変換状態の保存と復元をサポート

## インストール方法

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

## 注意事項

このライブラリは座標変換の実行に特化しており、変換定義自体の生成や編集機能は含まれていません。変換定義の作成や編集が必要な場合は、[@maplat/tin](https://github.com/code4history/MaplatTin/)パッケージをご利用ください。

## ライセンス

Maplat Limited License 1.1

Copyright (c) 2024 Code for History

### 開発者

- Kohei Otsuka
- Code for History

あなたの貢献をお待ちしています！[イシューやプルリクエスト](https://github.com/code4history/MaplatTransform/issues)は大歓迎です。