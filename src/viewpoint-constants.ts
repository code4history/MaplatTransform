/**
 * 視点変換（ViewpointField）の仮定数。
 *
 * 設計書「Maplat 視点変換（ラウンドトリップ対応モード 1 / 2）設計書」§11.1 段 1 ① の
 * 仮の定数を 1 か所にまとめる。段 2 の実測（§2.3・§2.2 4.・§5.2）の結果、
 * orchestrator が確定値へ差し替える。
 */

/** 内側本体（基準矩形）の長辺分割数（§2.2） */
export const N_LONG = 16;

/** 短辺分割数の下限（§2.2。縦横比 2:1 を超える長尺図での頭打ち） */
export const N_SHORT_MIN = 8;

/** 短辺分割数の上限（§2.2） */
export const N_SHORT_MAX = 16;

/** 外周余白のセル数（§2.1・§2.2） */
export const N_MARGIN = 2;

/**
 * 4 点プローブの半径（セル数）（§1.2）。
 * 初期方針は r = min(Δx, Δy) なので 1 セル。実測（§2.2 4.）で 1/2・1/4 セルと比較する。
 */
export const PROBE_RADIUS_CELLS = 1;

/** モード 1 / 2 判定に使う統計量（§5.2。実測で "max" と "p95" を選ぶ） */
export const JUDGE_STATISTIC: "max" | "p95" = "max";

/** 回転偏差の仮閾値（度）（§5.2）。これ以内かつ縮尺偏差以内なら "constant" を推奨 */
export const ROTATION_THRESHOLD_DEG = 1.0;

/** 相対縮尺偏差の仮閾値（比率）（§5.2）。2.0% */
export const SCALE_RATIO_THRESHOLD = 0.02;

/** 180° 対向による単位ベクトル補間の零ベクトル退化を判定する二乗しきい値（§1.3） */
export const UNIT_VECTOR_DEGENERATE_EPS2 = 1e-24;
