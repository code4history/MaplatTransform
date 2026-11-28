import { MERC_MAX, MERC_CROSSMATRIX } from "./constants.ts";
import type { Viewpoint } from "./types.ts";

/**
 * size（画面サイズ）とズームから、地図面座標上での半径を得る
 *
 * @param size - 画面サイズ [width, height]
 * @param zoom - メルカトルズームレベル
 * @returns メルカトル座標上での半径
 */
export function zoom2Radius(size: [number, number], zoom: number): number {
  const radius = Math.floor(Math.min(size[0], size[1]) / 4);
  return (radius * MERC_MAX) / 128 / Math.pow(2, zoom);
}

/**
 * 与えられた差分行列を回転する
 *
 * @param xys - 回転する座標の配列
 * @param theta - 回転角（ラジアン）
 * @returns 回転後の座標の配列
 */
export function rotateMatrix(xys: number[][], theta: number): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < xys.length; i++) {
    const xy = xys[i];
    const x = xy[0] * Math.cos(theta) - xy[1] * Math.sin(theta);
    const y = xy[0] * Math.sin(theta) + xy[1] * Math.cos(theta);
    result.push([x, y]);
  }
  return result;
}

/**
 * 画面サイズと地図ズームから、メルカトル座標上での5座標を取得する
 *
 * @param center - 中心のメルカトル座標 [x, y]
 * @param zoom - メルカトルズームレベル
 * @param rotation - 回転角（ラジアン）
 * @param size - 画面サイズ [width, height]
 * @returns 中心＋上下左右の5点のメルカトル座標配列
 */
export function mercViewpoint2Mercs(
  center: number[],
  zoom: number,
  rotation: number,
  size: [number, number]
): number[][] {
  const radius = zoom2Radius(size, zoom);
  const crossDelta = rotateMatrix(MERC_CROSSMATRIX, rotation);
  const cross = crossDelta.map(xy => [
    xy[0] * radius + center[0],
    xy[1] * radius + center[1]
  ]);
  return cross;
}

/**
 * メルカトル5地点情報からメルカトル地図でのサイズ情報（中心座標、ズーム、回転）を得る
 *
 * @param mercs - 中心＋上下左右の5点のメルカトル座標配列
 * @param size - 画面サイズ [width, height]
 * @returns Viewpoint オブジェクト（center, zoom, rotation）
 */
export function mercs2MercViewpoint(
  mercs: number[][],
  size: [number, number]
): Viewpoint {
  const center = mercs[0];
  const nesw = mercs.slice(1, 5);
  const neswDelta = nesw.map(val => [
    val[0] - center[0],
    val[1] - center[1]
  ]);
  const normal = [
    [0.0, 1.0],
    [1.0, 0.0],
    [0.0, -1.0],
    [-1.0, 0.0]
  ];
  let abss = 0;
  let cosx = 0;
  let sinx = 0;
  for (let i = 0; i < 4; i++) {
    const delta = neswDelta[i];
    const norm = normal[i];
    const abs = Math.sqrt(Math.pow(delta[0], 2) + Math.pow(delta[1], 2));
    abss += abs;
    const outer = delta[0] * norm[1] - delta[1] * norm[0];
    const inner = delta[0] * norm[0] + delta[1] * norm[1];
    // acos は 0 および ±π 近傍で約 1.5e-8 rad の段差を出すため、外積・内積から atan2 で求める
    const theta = -Math.atan2(outer, inner);
    cosx += Math.cos(theta);
    sinx += Math.sin(theta);
  }
  const scale = abss / 4.0;
  const omega = Math.atan2(sinx, cosx);

  const radius = Math.floor(Math.min(size[0], size[1]) / 4);
  const zoom = Math.log((radius * MERC_MAX) / 128 / scale) / Math.log(2);

  return { center, zoom, rotation: omega };
}

/**
 * 角度を (-π, π] に丸める
 *
 * @param radian - 角度（ラジアン）
 * @returns (-π, π] に丸めた角度
 */
export function wrapAngle(radian: number): number {
  const wrapped = radian - 2 * Math.PI * Math.round(radian / (2 * Math.PI));
  return wrapped === -Math.PI ? Math.PI : wrapped;
}
