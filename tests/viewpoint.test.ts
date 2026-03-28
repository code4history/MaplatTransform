import { describe, expect, it } from "vitest";
import {
  zoom2Radius,
  rotateMatrix,
  mercViewpoint2Mercs,
  mercs2MercViewpoint,
  MERC_MAX,
  MERC_CROSSMATRIX
} from "../src/index.ts";

describe("zoom2Radius", () => {
  it("サイズ [256, 256]、ズーム 10 で正しい半径を返す", () => {
    const radius = zoom2Radius([256, 256], 10);
    const expected = Math.floor(Math.min(256, 256) / 4);
    expect(radius).toBeCloseTo((expected * MERC_MAX) / 128 / Math.pow(2, 10), 5);
  });

  it("size が [400, 300] の場合、min(400, 300) = 300 を使用する", () => {
    const radius = zoom2Radius([400, 300], 5);
    const expectedBase = Math.floor(300 / 4); // 75
    expect(radius).toBeCloseTo((expectedBase * MERC_MAX) / 128 / Math.pow(2, 5), 5);
  });
});

describe("rotateMatrix", () => {
  it("theta = 0 の場合、行列が変化しない", () => {
    const result = rotateMatrix(MERC_CROSSMATRIX, 0);
    for (let i = 0; i < MERC_CROSSMATRIX.length; i++) {
      expect(result[i][0]).toBeCloseTo(MERC_CROSSMATRIX[i][0], 10);
      expect(result[i][1]).toBeCloseTo(MERC_CROSSMATRIX[i][1], 10);
    }
  });

  it("theta = Math.PI の場合、各ベクトルが反転する", () => {
    const result = rotateMatrix([[1, 0], [0, 1]], Math.PI);
    expect(result[0][0]).toBeCloseTo(-1, 10);
    expect(result[0][1]).toBeCloseTo(0, 10);
    expect(result[1][0]).toBeCloseTo(0, 10);
    expect(result[1][1]).toBeCloseTo(-1, 10);
  });

  it("theta = Math.PI / 2 の場合、90度回転する", () => {
    const result = rotateMatrix([[1, 0]], Math.PI / 2);
    expect(result[0][0]).toBeCloseTo(0, 10);
    expect(result[0][1]).toBeCloseTo(1, 10);
  });
});

describe("mercViewpoint2Mercs / mercs2MercViewpoint ラウンドトリップ", () => {
  const center = [15000000, 4000000];
  const zoom = 14;
  const rotation = 0.3;
  const size: [number, number] = [800, 600];

  it("mercViewpoint2Mercs が5点を返す", () => {
    const mercs = mercViewpoint2Mercs(center, zoom, rotation, size);
    expect(mercs).toHaveLength(5);
    mercs.forEach(m => {
      expect(m).toHaveLength(2);
    });
  });

  it("mercs2MercViewpoint(mercViewpoint2Mercs(…)) がラウンドトリップする", () => {
    const mercs = mercViewpoint2Mercs(center, zoom, rotation, size);
    const viewpoint = mercs2MercViewpoint(mercs, size);

    expect(viewpoint.center[0]).toBeCloseTo(center[0], 0);
    expect(viewpoint.center[1]).toBeCloseTo(center[1], 0);
    expect(viewpoint.zoom).toBeCloseTo(zoom, 3);
    expect(viewpoint.rotation).toBeCloseTo(rotation, 5);
  });

  it("rotation = 0 の場合もラウンドトリップする", () => {
    const mercs = mercViewpoint2Mercs(center, zoom, 0, size);
    const viewpoint = mercs2MercViewpoint(mercs, size);

    expect(viewpoint.center[0]).toBeCloseTo(center[0], 0);
    expect(viewpoint.center[1]).toBeCloseTo(center[1], 0);
    expect(viewpoint.zoom).toBeCloseTo(zoom, 3);
    expect(Math.abs(viewpoint.rotation)).toBeCloseTo(0, 5);
  });
});
