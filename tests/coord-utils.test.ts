import { describe, expect, it } from "vitest";
import { xy2SysCoord, sysCoord2Xy, MERC_MAX } from "../src/index.ts";

const TILE_SIZE = 256;

describe("xy2SysCoord / sysCoord2Xy", () => {
  const maxZoom = 14;
  const maxxy = Math.pow(2, maxZoom) * TILE_SIZE;

  describe("xy2SysCoord", () => {
    it("中心ピクセル座標 → EPSG:3857 原点付近になる", () => {
      const center = [maxxy / 2, maxxy / 2];
      const sys = xy2SysCoord(center, maxxy);
      expect(sys[0]).toBeCloseTo(0, 3);
      expect(sys[1]).toBeCloseTo(0, 3);
    });

    it("ピクセル座標 (0, 0) → (-MERC_MAX, MERC_MAX)", () => {
      const sys = xy2SysCoord([0, 0], maxxy);
      expect(sys[0]).toBeCloseTo(-MERC_MAX, 3);
      expect(sys[1]).toBeCloseTo(MERC_MAX, 3);
    });

    it("最大ピクセル座標 → (MERC_MAX, -MERC_MAX)", () => {
      const sys = xy2SysCoord([maxxy, maxxy], maxxy);
      expect(sys[0]).toBeCloseTo(MERC_MAX, 3);
      expect(sys[1]).toBeCloseTo(-MERC_MAX, 3);
    });
  });

  describe("sysCoord2Xy", () => {
    it("EPSG:3857 原点 → 中心ピクセル", () => {
      const xy = sysCoord2Xy([0, 0], maxxy);
      expect(xy[0]).toBeCloseTo(maxxy / 2, 3);
      expect(xy[1]).toBeCloseTo(maxxy / 2, 3);
    });

    it("(-MERC_MAX, MERC_MAX) → (0, 0)", () => {
      const xy = sysCoord2Xy([-MERC_MAX, MERC_MAX], maxxy);
      expect(xy[0]).toBeCloseTo(0, 3);
      expect(xy[1]).toBeCloseTo(0, 3);
    });
  });

  describe("ラウンドトリップ", () => {
    it("任意のピクセル座標で xy2SysCoord→sysCoord2Xy がラウンドトリップする", () => {
      const testPoints = [
        [1000, 2000],
        [maxxy / 3, maxxy / 4],
        [0.5, 0.5]
      ];
      for (const xy of testPoints) {
        const sys = xy2SysCoord(xy, maxxy);
        const back = sysCoord2Xy(sys, maxxy);
        expect(back[0]).toBeCloseTo(xy[0], 8);
        expect(back[1]).toBeCloseTo(xy[1], 8);
      }
    });
  });
});
