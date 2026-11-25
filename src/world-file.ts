import type { WorldFile } from "./types.ts";

/** world file の係数が有限で、通常の地図の向きで可逆であることを確かめる */
export function validateWorldFile(worldFile: WorldFile): void {
  const values = [
    worldFile.xScale,
    worldFile.xSkew,
    worldFile.xOrigin,
    worldFile.ySkew,
    worldFile.yScale,
    worldFile.yOrigin
  ];
  if (!values.every(Number.isFinite)) {
    throw new Error("worldFile の係数はすべて有限の数でなければなりません");
  }
  const determinant = worldFile.xScale * worldFile.yScale - worldFile.xSkew * worldFile.ySkew;
  if (!Number.isFinite(determinant) || determinant === 0) {
    throw new Error("worldFile は非正則です（行列式が 0）");
  }
  if (determinant > 0) {
    throw new Error("worldFile は鏡像です。yScale の符号を確かめてください");
  }
}

/** 角原点の画素座標を、半画素規約を使って CRS 座標へ変換する */
export function worldFileToCrs(worldFile: WorldFile, xy: number[]): number[] {
  const px = xy[0] - 0.5;
  const py = xy[1] - 0.5;
  return [
    worldFile.xScale * px + worldFile.xSkew * py + worldFile.xOrigin,
    worldFile.ySkew * px + worldFile.yScale * py + worldFile.yOrigin
  ];
}

/** CRS 座標を world file の角原点画素座標へ逆変換する */
export function crsToWorldFilePixel(worldFile: WorldFile, crs: number[]): number[] {
  const determinant = worldFile.xScale * worldFile.yScale - worldFile.xSkew * worldFile.ySkew;
  const dx = crs[0] - worldFile.xOrigin;
  const dy = crs[1] - worldFile.yOrigin;
  return [
    (worldFile.yScale * dx - worldFile.xSkew * dy) / determinant + 0.5,
    (-worldFile.ySkew * dx + worldFile.xScale * dy) / determinant + 0.5
  ];
}
