/**
 * 視点変換（ViewpointField）の定数。
 *
 * 2026-11-28 実測で確定。根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2。
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
 * 2026-11-28 実測で確定。根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2。
 * 0.5 は局所差がわずかに良いが、1 px パンの段差がおよそ 2 倍になるため 1 のまま据え置く。
 */
export const PROBE_RADIUS_CELLS = 1;

/**
 * モード 1 / 2 判定に使う統計量（§5.2）。
 * 2026-11-28 実測で確定。根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2。
 * 実在 24 図で max と p95 の推奨が分かれた図は無く、凸包の縁の外れ値で判定が倒れない p95 を採る。
 */
export const JUDGE_STATISTIC: "max" | "p95" = "p95";

/**
 * 回転偏差の閾値（度）（§5.2）。これ以内かつ縮尺偏差以内なら "constant" を推奨。
 * 2026-11-28 実測で確定。根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2。
 * 1° 未満の向きの差は画面でほぼ見分けられない。
 */
export const ROTATION_THRESHOLD_DEG = 1.0;

/**
 * 相対縮尺偏差の閾値（比率）（§5.2）。3%。
 * 2026-11-28 実測で確定。根拠 docs/measurements/2026-11-28-viewpoint-field.md・設計書 §10.2。
 * 3% は約 0.043 ズーム段で見分けられない。2% では測量の正確な fushimijo 系が grid になるため 3% とする。
 */
export const SCALE_RATIO_THRESHOLD = 0.03;

/** 180° 対向による単位ベクトル補間の零ベクトル退化を判定する二乗しきい値（§1.3） */
export const UNIT_VECTOR_DEGENERATE_EPS2 = 1e-24;
