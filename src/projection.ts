import { MERC_MAX } from './constants.ts';
import type { CrsObject, ProjectionEngine } from './types.ts';

const EARTH_RADIUS = 6378137;
const MAX_MERCATOR_LATITUDE = (180 / Math.PI) * Math.atan(Math.sinh(Math.PI));
export function finitePair(coord: number[]): boolean {
  return coord.length >= 2 && Number.isFinite(coord[0]) && Number.isFinite(coord[1]);
}

function validateBuiltinDefinition(epsg: number, proj4: string): void {
  const tokens = proj4
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [rawKey, ...rawValue] = token.replace(/^\+/, '').split('=');
      const key = rawKey.toLowerCase();
      const value = rawValue.join('=');
      const hasValue = rawValue.length > 0;
      if (key === 'axis' && (!hasValue || value !== 'enu')) {
        throw new Error('worldFile は東・北の順で書き、+axis を外してください');
      }
      if ((key === 'no_defs' || key === 'wktext') && !hasValue) return '';
      if (hasValue && value === '') throw new Error(`+${key}= は許可されていません`);
      if (key === 'wktext') throw new Error('+wktext は許可されていません');
      if (key === 'type' && !hasValue) throw new Error('+type は値が必要です');
      if (key === 'type' && value.toLowerCase() === 'crs') return '';
      if (key === 'axis') return '';
      if (key === 'towgs84') {
        const parts = value.split(',');
        if (!hasValue || parts.some((part) => part.trim() === ''))
          throw new Error('+towgs84 は数値の値が必要です');
        const allZero =
          [3, 7].includes(parts.length) &&
          parts.every((part) => {
            const mantissa = part
              .trim()
              .split(/[eE]/, 1)[0]
              .replace(/[+\-.]/g, '');
            return Number.isFinite(Number(part)) && !/[1-9]/.test(mantissa);
          });
        if (allZero) return '';
      }
      const normalized = value
        ? value
            .split(',')
            .map((part) => {
              const number = Number(part);
              return part.trim() !== '' && Number.isFinite(number)
                ? Object.is(number, -0)
                  ? '0'
                  : String(number)
                : part.toLowerCase();
            })
            .join(',')
        : '';
      return `+${key}${value ? `=${normalized}` : ''}`;
    })
    .filter(Boolean);
  const actual = [...new Set(tokens)].sort().join(' ');
  const accepted =
    epsg === 4326
      ? ['+datum=wgs84 +proj=longlat', '+ellps=wgs84 +proj=longlat']
      : [
          '+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0'
        ];
  if (!accepted.includes(actual)) {
    throw new Error(
      `epsg と proj4 が一致しないか、proj4js なしでは判定できない CRS です（EPSG:${epsg}）`
    );
  }
}

/** 3857 と 4326 の間を変換する内蔵投影エンジン */
export const builtinProjectionEngine: ProjectionEngine = {
  toLonLat(coord, crs) {
    if (!finitePair(coord)) return false;
    if (crs.epsg === 4326)
      return Math.abs(coord[0]) <= 180 && Math.abs(coord[1]) <= 90 ? [coord[0], coord[1]] : false;
    if (crs.epsg !== 3857 || Math.abs(coord[0]) > MERC_MAX || Math.abs(coord[1]) > MERC_MAX)
      return false;
    const x = coord[0];
    const y = coord[1];
    return [
      Math.abs(x) === MERC_MAX ? Math.sign(x) * 180 : (x / EARTH_RADIUS) * (180 / Math.PI),
      Math.abs(y) === MERC_MAX
        ? Math.sign(y) * MAX_MERCATOR_LATITUDE
        : (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(coord, crs) {
    if (!finitePair(coord) || Math.abs(coord[0]) > 180) return false;
    const [lon, lat] = coord;
    if (crs.epsg === 4326) return Math.abs(lat) <= 90 ? [lon, lat] : false;
    if (crs.epsg !== 3857 || Math.abs(lat) > MAX_MERCATOR_LATITUDE) return false;
    const longitude = (lon * Math.PI) / 180;
    const latitude = (lat * Math.PI) / 180;
    const result = [
      Math.abs(lon) === 180 ? Math.sign(lon) * MERC_MAX : EARTH_RADIUS * longitude,
      Math.abs(lat) === MAX_MERCATOR_LATITUDE
        ? Math.sign(lat) * MERC_MAX
        : EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + latitude / 2))
    ];
    return result.every(Number.isFinite) ? result : false;
  }
};

const WEB_MERCATOR = { epsg: 3857 };
const LONGITUDE_LATITUDE = { epsg: 4326 };
const WGS84 = '+proj=longlat +datum=WGS84';

function isBuiltin(crs: CrsObject): boolean {
  return crs.epsg === 3857 || crs.epsg === 4326;
}

export function validateCrsIdentity(crs: CrsObject): void {
  if (crs === null || typeof crs !== 'object' || Array.isArray(crs)) {
    throw new Error('CRS はオブジェクトで指定してください');
  }
  if (crs.epsg !== undefined && (!Number.isSafeInteger(crs.epsg) || crs.epsg <= 0)) {
    throw new Error('CRS の epsg は正の整数で指定してください');
  }
  if (crs.proj4 !== undefined && (typeof crs.proj4 !== 'string' || !crs.proj4.trim())) {
    throw new Error('CRS の proj4 は空でない文字列で指定してください');
  }
  const hasAuthority = typeof crs.authority === 'string' && !!crs.authority.trim();
  const hasCode = typeof crs.code === 'string' ? !!crs.code.trim() : Number.isFinite(crs.code);
  if (crs.epsg === undefined && !(hasAuthority && hasCode) && crs.proj4 === undefined) {
    throw new Error(
      'CRS には epsg、authority と code の組、または proj4 が必要です。WKT のみの定義には対応していません'
    );
  }
}

function validateProj4Syntax(definition: string): void {
  // proj4js と同じく「+」で分け、空白なしで連結した指定も検査する。
  let hasProjection = false;
  for (const token of definition.split('+')) {
    const [rawKey, value] = token.trim().split('=');
    const key = rawKey.toLowerCase();
    if (key === 'axis' && value !== 'enu') {
      throw new Error('CRS の座標は東・北の順で書き、+axis を外すか +axis=enu を指定してください');
    }
    if (
      (key === 'nadgrids' && value !== '@null') ||
      key === 'geoidgrids' ||
      key === 'hgridshift' ||
      key === 'vgridshift' ||
      (key === 'proj' && ['pipeline', 'hgridshift', 'vgridshift'].includes(value?.toLowerCase()))
    ) {
      throw new Error(`proj4 の +${token.trim()} は読み込めません`);
    }
    if (key === 'proj' && value) hasProjection = true;
  }
  if (!definition.startsWith('+') || !hasProjection) {
    throw new Error('CRS の proj4 は +proj= を含む定義で指定してください');
  }
}

export function validateLayerCrs(
  crs: CrsObject,
  engine: ProjectionEngine,
  samples: () => number[][]
): void {
  validateCrsIdentity(crs);
  const builtin = isBuiltin(crs);
  if (crs.proj4 === undefined) {
    if (crs.wkt) throw new Error('WKT だけの CRS 定義に対応していません');
    if (!builtin) throw new Error('EPSG:3857・4326 以外の CRS には proj4 定義が必要です');
    return;
  }
  const definition = crs.proj4.trim();
  validateProj4Syntax(definition);
  if (engine.validateDefinition) {
    engine.validateDefinition(crs, builtin ? samples() : undefined);
  } else if (builtin) {
    // proj4js を読み込まない利用者のため、従来の既知の定義も受け付ける。
    validateBuiltinDefinition(crs.epsg!, definition);
  } else if (engine === builtinProjectionEngine) {
    throw new Error('この CRS には proj4 に対応する投影エンジンが必要です');
  }
}

/** proj4js と互換性のある投影コンバーターの生成関数 */
export type Proj4Factory = (
  from: string,
  to: string
) => {
  forward(coordinate: number[], enforceAxis?: boolean): number[];
  inverse(coordinate: number[], enforceAxis?: boolean): number[];
};

/** 呼び出し側から受け取った proj4js を使い、東・北の順で変換する */
export function createProj4ProjectionEngine(proj4: Proj4Factory): ProjectionEngine {
  const converters = new Map<string, ReturnType<Proj4Factory>>();
  function getConverter(definition: string) {
    const saved = converters.get(definition);
    if (saved) return saved;
    validateProj4Syntax(definition);
    try {
      const converter = proj4(definition, WGS84);
      converters.set(definition, converter);
      return converter;
    } catch (error) {
      throw new Error(`proj4 定義を読み込めません（${String(error)}）`, { cause: error });
    }
  }

  function inverseAtZeroHeight(
    converter: ReturnType<Proj4Factory>,
    [lon, lat]: number[]
  ): number[] {
    // 順変換で元 CRS の高さを 0 とするため、逆変換でも元 CRS の高さが 0 になるよう補正する。
    // 第2引数を true にすると proj4js は変換した高さを返す。軸は両方とも enu に限っている。
    const initial = converter.inverse([lon, lat, 0], true);
    const height = initial[2];
    if (Number.isFinite(height) && Math.abs(height) > 1e-6) {
      return converter.inverse([lon, lat, -height], true);
    }
    return initial;
  }

  function project(
    coord: number[],
    definition: string,
    convert: (converter: ReturnType<Proj4Factory>, input: number[]) => number[]
  ): number[] | false {
    if (!finitePair(coord)) return false;
    try {
      const result = convert(getConverter(definition), [coord[0], coord[1]]);
      return finitePair(result) ? [result[0], result[1]] : false;
    } catch {
      return false;
    }
  }

  return {
    toLonLat(coord, crs) {
      if (isBuiltin(crs)) return builtinProjectionEngine.toLonLat(coord, crs);
      if (!crs.proj4) return false;
      const lonLat = project(coord, crs.proj4.trim(), (converter, input) =>
        converter.forward(input)
      );
      return lonLat === false
        ? false
        : builtinProjectionEngine.toLonLat(lonLat, LONGITUDE_LATITUDE);
    },
    fromLonLat(coord, crs) {
      if (isBuiltin(crs)) return builtinProjectionEngine.fromLonLat(coord, crs);
      if (!crs.proj4 || builtinProjectionEngine.fromLonLat(coord, LONGITUDE_LATITUDE) === false)
        return false;
      return project(coord, crs.proj4.trim(), inverseAtZeroHeight);
    },
    validateDefinition(crs, samplePoints) {
      if (crs.proj4 === undefined) return;
      const definition = crs.proj4.trim();
      getConverter(definition);
      if (!samplePoints) return;
      const tolerance = crs.epsg === 3857 ? 1e-3 : 1e-8;
      for (const native of samplePoints) {
        const lonLat = builtinProjectionEngine.toLonLat(native, crs);
        const result =
          lonLat === false
            ? false
            : project(lonLat, definition, (converter, input) => converter.inverse(input));
        if (
          result === false ||
          Math.hypot(result[0] - native[0], result[1] - native[1]) > tolerance
        ) {
          throw new Error(
            `epsg と proj4 が地図の四隅または中心で一致しないか、比較できません（EPSG:${crs.epsg}）`
          );
        }
      }
    }
  };
}

export function crsToMercator(
  coord: number[],
  crs: CrsObject,
  engine: ProjectionEngine
): number[] | false {
  if (!finitePair(coord)) return false;
  const lonLat = engine.toLonLat(coord, crs);
  return lonLat === false ? false : builtinProjectionEngine.fromLonLat(lonLat, WEB_MERCATOR);
}

export function mercatorToCrs(
  coord: number[],
  crs: CrsObject,
  engine: ProjectionEngine
): number[] | false {
  const lonLat = builtinProjectionEngine.toLonLat(coord, WEB_MERCATOR);
  if (lonLat === false) return false;
  const native = engine.fromLonLat(lonLat, crs);
  return native !== false && finitePair(native) ? native : false;
}

export function layerCheckPoints(wh?: number[], xy?: number[], bounds?: number[][]): number[][] {
  let minX: number, minY: number, maxX: number, maxY: number;
  if (bounds?.length) {
    minX = minY = Infinity;
    maxX = maxY = -Infinity;
    for (const [x, y] of bounds) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  } else if (wh) {
    [minX, minY] = xy ?? [0, 0];
    maxX = minX + wh[0];
    maxY = minY + wh[1];
  } else {
    throw new Error('epsg と proj4 の照合には地図の範囲が必要です');
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) {
    throw new Error('epsg と proj4 の照合には有限な地図の範囲が必要です');
  }
  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
    [minX / 2 + maxX / 2, minY / 2 + maxY / 2]
  ];
}
