import { describe, expect, it, vi } from 'vitest';
import proj4 from 'proj4';
import {
  builtinProjectionEngine,
  createProj4ProjectionEngine,
  MapTransform,
  Transform,
  WorldFileSurface,
  worldFileToCrs
} from '../src/index.ts';
import type { Compiled, CrsObject, WorldFile } from '../src/index.ts';
import { validateCrsIdentity } from '../src/projection.ts';
import compiledFixture from './compiled/fushimijo_maplat_v2.json';

const projectionEngine = createProj4ProjectionEngine(proj4);
const mercator = { epsg: 3857 };
const wgs84 = '+proj=longlat +datum=WGS84';
const sphericalMercator = '+proj=merc +a=6378137 +b=6378137 +units=m';
const wh = [1526, 2048];
const worldFile: WorldFile = {
  xScale: 2,
  xSkew: 0.25,
  xOrigin: 1000,
  yScale: -2,
  ySkew: -0.1,
  yOrigin: -1000
};

function requireCoord(coord: number[] | false): number[] {
  if (coord === false) throw new Error('座標を変換できません');
  return coord;
}

function distance(a: number[], b: number[]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function affineTin(wf: WorldFile): Compiled {
  const compiled = structuredClone(compiledFixture) as unknown as Compiled;
  compiled.points = compiled.points.map(([xy]) => [xy, worldFileToCrs(wf, xy)]);
  compiled.vertices_points = compiled.vertices_points.map(([xy]) => [xy, worldFileToCrs(wf, xy)]);
  compiled.centroid_point[1] = worldFileToCrs(wf, compiled.centroid_point[0]);
  return compiled;
}

describe('proj4 の CRS', () => {
  // 参照値は PROJ の projinfo の定義を使い、cs2cs で東・北から経度・緯度に変換して得た。
  // Tokyo datum は Tokyo to WGS 84 (108) と同じ 3 係数を +towgs84 で与えた。
  const cases: { name: string; crs: CrsObject; origin: number[]; lonLat: number[] }[] = [
    {
      name: '平面直角 IX 系',
      crs: {
        epsg: 6677,
        proj4:
          '+proj=tmerc +lat_0=36 +lon_0=139.833333333333 +k=0.9999 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +axis=enu'
      },
      origin: [1000, -1000],
      lonLat: [139.844424119975, 35.99098624141]
    },
    {
      name: 'UTM 54N',
      crs: { epsg: 32654, proj4: '+proj=utm +zone=54 +datum=WGS84 +units=m' },
      origin: [500000, 3985000],
      lonLat: [141, 36.009480678555]
    },
    {
      name: '旧日本測地系 IX 系',
      crs: {
        proj4:
          '+proj=tmerc +lat_0=36 +lon_0=139.833333333333 +k=0.9999 +ellps=bessel +towgs84=-146.414,507.337,680.507 +units=m'
      },
      origin: [1000, -1000],
      lonLat: [139.841172303703, 35.994191373313]
    },
    {
      name: 'ESRI:102012',
      crs: {
        authority: 'ESRI',
        code: '102012',
        proj4: '+proj=lcc +lat_0=0 +lon_0=105 +lat_1=30 +lat_2=62 +datum=WGS84 +units=m'
      },
      origin: [300000, 4500000],
      lonLat: [108.470050012511, 37.187587373676]
    }
  ];

  it.each(cases)(
    '$name の world file、外挿 TIN、world file 外周 TIN を往復する',
    ({ crs, origin, lonLat }) => {
      const wf = { ...worldFile, xOrigin: origin[0], yOrigin: origin[1] };
      const worldSurface = new WorldFileSurface({ crs, worldFile: wf, wh, projectionEngine });
      const compiled = affineTin(wf);
      const maps = [new MapTransform(), new MapTransform()];
      maps[0].setLayeredMapData({ main: { kind: 'tin', compiled, crs, projectionEngine } });
      maps[1].setLayeredMapData({
        main: {
          kind: 'tin',
          compiled: { ...compiled, outerTransform: 'worldFile', worldFile: wf },
          crs,
          projectionEngine
        }
      });

      expect(
        distance(requireCoord(projectionEngine.toLonLat(origin, crs)), lonLat)
      ).toBeLessThanOrEqual(1e-8);
      for (const surface of [worldSurface, ...maps.map((map) => map.getSurfaceTransform(0)!)]) {
        const reference = requireCoord(surface.transform([0.5, 0.5]));
        expect(
          distance(requireCoord(builtinProjectionEngine.toLonLat(reference, mercator)), lonLat)
        ).toBeLessThanOrEqual(1e-8);
        let maxError = 0;
        for (let x = -4; x <= 8; x++) {
          for (let y = -4; y <= 8; y++) {
            const xy = [(x * wh[0]) / 4, (y * wh[1]) / 4];
            const projected = requireCoord(surface.transform(xy, false, true));
            const restored = requireCoord(surface.transform(projected, true, true));
            maxError = Math.max(maxError, distance(restored, xy));
          }
        }
        expect(maxError).toBeLessThanOrEqual(1e-3);
      }
      for (const map of maps) {
        const xy = [wh[0] / 2, wh[1] / 2];
        const merc = requireCoord(map.xy2Merc(xy));
        expect(map.getLayerTransform(0)).toBeInstanceOf(Transform);
        expect(
          distance(requireCoord(map.getLayerTransform(0)!.transform(merc, true)), xy)
        ).toBeLessThanOrEqual(1e-3);
      }
    }
  );

  it('EPSG を持たない識別子を受け、実行に定義が必要な場合は理由を示す', () => {
    const identity = { authority: 'ESRI', code: '102012' };
    expect(() => validateCrsIdentity(identity)).not.toThrow();
    expect(() => validateCrsIdentity({ proj4: wgs84 })).not.toThrow();
    for (const crs of [{}, { authority: 'ESRI' }, { code: '102012' }, { wkt: 'GEOGCS[]' }]) {
      expect(() => validateCrsIdentity(crs)).toThrow(/CRS/);
    }
    expect(() => new WorldFileSurface({ crs: identity, worldFile, wh, projectionEngine })).toThrow(
      /proj4/
    );
    expect(() => new WorldFileSurface({ crs: { proj4: wgs84 }, worldFile, wh })).toThrow(
      /投影エンジン/
    );
    expect(
      () =>
        new WorldFileSurface({ crs: { proj4: '+proj=unknown' }, worldFile, wh, projectionEngine })
    ).toThrow(/proj4/);
  });

  it.each([
    '+nadgrids=shift.gsb',
    '+nadgrids=@null,shift.gsb',
    '+geoidgrids=@null',
    '+proj=pipeline',
    '+proj=hgridshift',
    '+proj=vgridshift',
    '+axis=neu',
    '+axis=ENU',
    '+title=grid+nadgrids=shift.gsb'
  ])('proj4js が読む定義で禁止された指定 %s を読み込み時に拒否する', (parameter) => {
    const crs = { proj4: `${wgs84} ${parameter}` };
    expect(() => new WorldFileSurface({ crs, worldFile, wh, projectionEngine })).toThrow(
      /nadgrids|geoidgrids|pipeline|gridshift|axis/
    );
    expect(() =>
      new MapTransform().setLayeredMapData({
        main: { kind: 'tin', crs, projectionEngine, compiled: affineTin(worldFile) }
      })
    ).toThrow(/nadgrids|geoidgrids|pipeline|gridshift|axis/);
  });

  it('3857・4326 に併記した定義は数値で照合し、変換では内蔵式を使う', () => {
    const wf = {
      ...worldFile,
      xScale: 0.001,
      xSkew: 0,
      xOrigin: 139,
      yScale: -0.001,
      ySkew: 0,
      yOrigin: 36
    };
    for (const [epsg, definition, affine, parameter, within] of [
      [3857, sphericalMercator + ' +nadgrids=@null', worldFile, '+x_0=0.0011', '+x_0=0.0009'],
      [4326, '+proj=lonlat +ellps=WGS84', wf, '+pm=0.000000011', '+pm=0.000000009']
    ] as const) {
      const base = new WorldFileSurface({ crs: { epsg }, worldFile: affine, wh });
      const given = new WorldFileSurface({
        crs: { epsg, proj4: `${definition} ${within}` },
        worldFile: affine,
        wh,
        projectionEngine
      });
      expect(given.transform([32, 88])).toEqual(base.transform([32, 88]));
      const crs = { epsg, proj4: `${definition} ${parameter}` };
      expect(() => new WorldFileSurface({ crs, worldFile: affine, wh, projectionEngine })).toThrow(
        /一致しない/
      );
      expect(() =>
        new MapTransform().setLayeredMapData({
          main: { kind: 'tin', compiled: affineTin(affine), crs, projectionEngine }
        })
      ).toThrow(/一致しない/);
    }
  });

  it('四隅と中心を照合し、中心以外だけにある矛盾も読み込み時に拒否する', () => {
    const inverse = vi.fn((coord: number[]) => coord);
    const engine = createProj4ProjectionEngine(() => ({ forward: (coord) => coord, inverse }));
    const wf = {
      ...worldFile,
      xScale: 0.001,
      xSkew: 0,
      xOrigin: 139,
      yScale: -0.001,
      ySkew: 0,
      yOrigin: 36
    };
    const [width, height] = wh;
    const locations = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
      [width / 2, height / 2]
    ];
    new WorldFileSurface({
      crs: { epsg: 4326, proj4: wgs84 },
      worldFile: wf,
      wh,
      projectionEngine: engine
    });
    expect(inverse.mock.calls.map(([coord]) => coord)).toEqual(
      locations.map((xy) => worldFileToCrs(wf, xy))
    );

    const centered = {
      epsg: 3857,
      proj4: sphericalMercator + ' +k=1.001 +x_0=-2.780875 +y_0=3.12325'
    };
    expect(() =>
      projectionEngine.validateDefinition?.(centered, [worldFileToCrs(worldFile, locations[4])])
    ).not.toThrow();
    expect(() => new WorldFileSurface({ crs: centered, worldFile, wh, projectionEngine })).toThrow(
      /一致しない/
    );
  });

  it('4326 の TIN は内蔵式だけで変換し、3857 の TIN は従来の値を返す', () => {
    const wf = {
      ...worldFile,
      xScale: 0.001,
      xSkew: 0,
      xOrigin: 139,
      yScale: -0.001,
      ySkew: 0,
      yOrigin: 36
    };
    const compiled = affineTin(wf);
    const raw = new Transform();
    raw.setCompiled(compiled);
    const map = new MapTransform();
    const xy = [710, 620];
    const native = requireCoord(raw.transform(xy));
    map.setLayeredMapData({ main: { kind: 'tin', compiled, crs: mercator } });
    expect(map.xy2Merc(xy)).toEqual(native);
    map.setLayeredMapData({ main: { kind: 'tin', compiled, crs: { epsg: 4326 } } });
    const merc = requireCoord(map.xy2Merc(xy));
    expect(merc).toEqual(builtinProjectionEngine.fromLonLat(native, mercator));
    expect(distance(requireCoord(map.merc2Xy(merc)), xy)).toBeLessThanOrEqual(1e-6);
  });

  it('非 3857 の TIN 副層を選択し、読み込みが失敗したら既存の地図を保つ', () => {
    const map = new MapTransform();
    const { crs } = cases[0];
    const bounds = [
      [1, 1],
      [100, 1],
      [100, 100],
      [1, 100]
    ];
    map.setLayeredMapData({
      main: { kind: 'worldFile', crs, worldFile, wh, projectionEngine },
      sub_maps: [
        { kind: 'tin', compiled: affineTin(worldFile), crs, projectionEngine, bounds, priority: 2 }
      ]
    });
    const selected = map.xy2MercWithLayer([50, 50]);
    if (selected === false) throw new Error('副層の選択に失敗しました');
    expect(selected[0]).toBe(1);
    expect(map.merc2XyVisibleLayers(selected[1]).some(([index]) => index === 1)).toBe(true);
    expect(() =>
      map.setLayeredMapData({
        main: { kind: 'worldFile', crs, worldFile, wh, projectionEngine },
        sub_maps: [{ kind: 'tin', compiled: affineTin(worldFile), crs: { epsg: 6677 }, bounds }]
      })
    ).toThrow(/proj4/);
    expect(map.xy2MercWithLayer([50, 50])).toEqual(selected);
  });
});
