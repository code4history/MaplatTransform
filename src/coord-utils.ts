import { MERC_MAX } from "./constants.ts";

/**
 * ピクセル座標をシステム座標（EPSG:3857相当）に変換する
 *
 * @param xy - ピクセル座標 [x, y]
 * @param maxxy - 最大座標値（2^maxZoom * 256）
 * @returns システム座標 [x, y]
 */
export function xy2SysCoord(xy: number[], maxxy: number): number[] {
  const sysCoordX = (xy[0] * (2 * MERC_MAX)) / maxxy - MERC_MAX;
  const sysCoordY = -1 * ((xy[1] * (2 * MERC_MAX)) / maxxy - MERC_MAX);
  return [sysCoordX, sysCoordY];
}

/**
 * システム座標（EPSG:3857相当）をピクセル座標に変換する
 *
 * @param sysCoord - システム座標 [x, y]
 * @param maxxy - 最大座標値（2^maxZoom * 256）
 * @returns ピクセル座標 [x, y]
 */
export function sysCoord2Xy(sysCoord: number[], maxxy: number): number[] {
  const x = ((sysCoord[0] + MERC_MAX) * maxxy) / (2 * MERC_MAX);
  const y = ((-sysCoord[1] + MERC_MAX) * maxxy) / (2 * MERC_MAX);
  return [x, y];
}
