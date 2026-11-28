/**
 * 視点変換 ViewpointField 実測（段 1 ②）の測定対象と fixture 一覧。
 * 実測専用。vitest の通常実行には入らない。
 */
import fs from "node:fs";
import path from "node:path";
import type { Feature, Polygon } from "geojson";
import { Tin } from "@maplat/tin";
import { createLayerSurface } from "../../src/map-transform.ts";
import { classifyStrictness, paperRectOf } from "../../src/viewpoint-field.ts";
import type { LayerStrictness, PaperRect } from "../../src/viewpoint-field.ts";
import { deriveStrictStatus } from "../../src/compiled-state.ts";
import { worldFileToCrs } from "../../src/world-file.ts";
import type {
  LayerSurfaceData,
  PointSet,
  SurfaceLike,
  TinSurfaceData,
  WorldFile,
  WorldFileSurfaceData
} from "../../src/types.ts";
import { boxOf, hullOfGcps, samplePointsIn, mulberry32, SEED } from "./lib.ts";
import type { SampleBox } from "./lib.ts";

export interface Target {
  id: string;
  label: string;
  source: string;
  strictness: LayerStrictness;
  gcpCount: number;
  whText: string;
  maxxy: number;
  maxZoom: number;
  surface: SurfaceLike;
  layerData: LayerSurfaceData;
  gcps: PointSet[] | undefined;
  /** recommendViewpointMode に明示渡しする GCP（AT 合成歪み TIN のみ中央 5×5） */
  recommendGcps: PointSet[] | undefined;
  paperRect: PaperRect;
  hull: Feature<Polygon> | null;
  sampleBox: SampleBox;
  /** 計測メモ（例: 往復は strict_error のため対象外） */
  note: string;
}

function compiledDir(root: string): string {
  return path.join(root, "tests", "compiled");
}

function readJson(file: string): any {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

/** map JSON（compiled 辞書入り）または compiled 単体のどちらでも読む */
function loadCompiledOf(file: string): any {
  const raw = readJson(file);
  return raw && typeof raw === "object" && !Array.isArray(raw) && raw.compiled && typeof raw.compiled === "object"
    ? raw.compiled
    : raw;
}

function maxZoomOf(paperRect: PaperRect): number {
  const maxDim = Math.max(paperRect.maxX - paperRect.minX, paperRect.maxY - paperRect.minY);
  return Math.ceil(Math.log2(maxDim / 256));
}

interface TargetSpec {
  id: string;
  label: string;
  source: string;
  load: (root: string) => {
    layerData: LayerSurfaceData;
    gcps?: PointSet[];
    note?: string;
  };
}

/** 5 点十字の半径（画素）から代表ズームを 3 つ決める基準（紙の長辺に対する比） */
export const LEGACY_RADIUS_RATIOS = [1 / 8, 1 / 64, 1 / 512];

export const TARGET_SPECS: TargetSpec[] = [
  // ── 実在地図（tests/compiled のコンパイル済み TIN、主層 v2 / v3） ──
  ...(
    [
      ["18th_mapcontest_ea_v2", "18th_mapcontest_ea（v2・主層）", "tests/compiled/18th_mapcontest_ea_v2.json"],
      ["18th_mapcontest_ea_v3", "18th_mapcontest_ea（v3・主層）", "tests/compiled/18th_mapcontest_ea_v3.json"],
      ["18th_mapcontest_gp_v2", "18th_mapcontest_gp（v2・主層）", "tests/compiled/18th_mapcontest_gp_v2.json"],
      ["18th_mapcontest_gp_v3", "18th_mapcontest_gp（v3・主層）", "tests/compiled/18th_mapcontest_gp_v3.json"],
      ["1932_nobeoka_v2", "1932 延岡（v2・主層）", "tests/compiled/1932_nobeoka_v2.json"],
      ["1932_nobeoka_v3", "1932 延岡（v3・主層）", "tests/compiled/1932_nobeoka_v3.json"],
      ["1932_nobeoka_sub0_v3", "1932 延岡 副層（v3・sub0）", "tests/compiled/1932_nobeoka_sub0_v3.json"],
      ["fushimijo_maplat_v2", "伏見城 丸の内圖（v2）", "tests/compiled/fushimijo_maplat_v2.json"],
      ["fushimijo_maplat_v3", "伏見城 丸の内圖（v3）", "tests/compiled/fushimijo_maplat_v3.json"],
      ["miesan_ginza_map_v2", "銀座編街歩きマップ（v2）", "tests/compiled/miesan_ginza_map_v2.json"],
      ["miesan_ginza_map_v3", "銀座編街歩きマップ（v3）", "tests/compiled/miesan_ginza_map_v3.json"],
      ["naramachi_yasui_bunko_v2", "奈良町絵図 保井文庫（v2）", "tests/compiled/naramachi_yasui_bunko_v2.json"],
      ["naramachi_yasui_bunko_v3", "奈良町絵図 保井文庫（v3）", "tests/compiled/naramachi_yasui_bunko_v3.json"],
      ["naramachi_yasui_revised_v2", "奈良町絵図 改訂（v2）", "tests/compiled/naramachi_yasui_revised_v2.json"],
      ["naramachi_yasui_revised_v3", "奈良町絵図 改訂（v3）", "tests/compiled/naramachi_yasui_revised_v3.json"],
      ["tatebayashi_castle_akimoto_v2", "館林城下 秋元領（v2）", "tests/compiled/tatebayashi_castle_akimoto_v2.json"],
      ["tatebayashi_castle_akimoto_v3", "館林城下 秋元領（v3）", "tests/compiled/tatebayashi_castle_akimoto_v3.json"],
      ["tatebayashi_kaei_jokamachi_v3", "館林 嘉永城下図（v3）", "tests/compiled/tatebayashi_kaei_jokamachi_v3.json"],
      ["tatebayashi_kaei_jokamachi_v2", "館林 嘉永城下図（v2）", "tests/compiled/tatebayashi_kaei_jokamachi_v2.json"]
    ] as [string, string, string][]
  ).map(([id, label, source]) => ({
    id,
    label,
    source,
    load: (root: string) => {
      const compiled = loadCompiledOf(path.join(root, source));
      return { layerData: { kind: "tin", compiled } as TinSurfaceData };
    }
  })),
  // ── 旧形式 map JSON（tests/compiled 直下・tests 直下） ──
  {
    id: "burakita-2024",
    label: "BURARI 奈良きたまち 2024（旧形式 map JSON）",
    source: "tests/compiled/burakita-2024.json",
    load: (root: string) => {
      const compiled = loadCompiledOf(path.join(root, "tests/compiled/burakita-2024.json"));
      return { layerData: { kind: "tin", compiled } as TinSurfaceData };
    }
  },
  {
    id: "fushimijo_maplat_legacy",
    label: "伏見城 丸の内圖（旧形式 map JSON）",
    source: "tests/compiled/fushimijo_maplat.json",
    load: (root: string) => {
      const compiled = loadCompiledOf(path.join(root, "tests/compiled/fushimijo_maplat.json"));
      return { layerData: { kind: "tin", compiled } as TinSurfaceData };
    }
  },
  {
    id: "naramachi_yasui_bunko_legacy",
    label: "奈良町絵図 保井文庫（旧形式 map JSON）",
    source: "tests/compiled/naramachi_yasui_bunko.json",
    load: (root: string) => {
      const compiled = loadCompiledOf(path.join(root, "tests/compiled/naramachi_yasui_bunko.json"));
      return { layerData: { kind: "tin", compiled } as TinSurfaceData };
    }
  },
  {
    id: "miesan_ginza_map_legacy",
    label: "銀座編街歩きマップ（旧形式 map JSON）",
    source: "tests/miesan_ginza_map.json",
    load: (root: string) => {
      const compiled = loadCompiledOf(path.join(root, "tests/miesan_ginza_map.json"));
      return { layerData: { kind: "tin", compiled } as TinSurfaceData };
    }
  },
  // ── AT 合成地図 ──
  {
    id: "AT_planA_45",
    label: "AT 合成: Plan A 45° 一様（WorldFileSurface）",
    source: "AT-7① 相当（合成）",
    load: () => ({
      layerData: planA45Data(),
      note: "GCP なし（層の範囲＝紙基準矩形で判定）"
    })
  },
  {
    id: "AT_distortedTin",
    label: "AT 合成: 左端歪み TIN",
    source: "AT-7② 相当（合成・@maplat/tin で生成）",
    load: () => {
      throw new Error("AT_distortedTin は async load で組み立てる");
    }
  },
  {
    id: "AT_synthetic_main",
    label: "AT 合成: 多層 fixture 主層",
    source: "tests/compiled/visible_layers_synthetic.json（main）",
    load: (root: string) => {
      const fx = readJson(path.join(compiledDir(root), "visible_layers_synthetic.json"));
      return { layerData: { kind: "tin", compiled: fx.main } as TinSurfaceData };
    }
  },
  {
    id: "AT_synthetic_wide_station",
    label: "AT 合成: 多層 fixture 副層（駅前拡大図）",
    source: "tests/compiled/visible_layers_synthetic.json（sub.wide_station）",
    load: (root: string) => {
      const fx = readJson(path.join(compiledDir(root), "visible_layers_synthetic.json"));
      return {
        layerData: { kind: "tin", compiled: fx.sub.wide_station } as TinSurfaceData
      };
    }
  },
  {
    id: "AT_B_fushimijo_wf",
    label: "AT 合成: B（伏見城＋worldFile 外周・strict）",
    source: "AT-6② 相当（合成）",
    load: (root: string) => ({
      layerData: buildBFixture(root),
      note: "GCP は worldFile へ写した点群"
    })
  }
];

// ── 合成 fixture の構築（tests/ の AT 相当） ─────────────────────────────────

/** s0 = 2・θ0 = 45° の一様相似（紙 y 下向き → 地理 y 上向き）。AT-7① と同じ */
const S0 = 2;
const PHI0 = Math.PI / 4;
function affineMerc([x, y]: number[]): number[] {
  const u = x;
  const v = -y;
  return [
    15000000 + S0 * (u * Math.cos(PHI0) - v * Math.sin(PHI0)),
    4000000 + S0 * (u * Math.sin(PHI0) + v * Math.cos(PHI0))
  ];
}

function planA45Data(): WorldFileSurfaceData {
  const worldFile: WorldFile = {
    xScale: S0 * Math.cos(PHI0),
    xSkew: S0 * Math.sin(PHI0),
    xOrigin: 15000000,
    ySkew: S0 * Math.sin(PHI0),
    yScale: -S0 * Math.cos(PHI0),
    yOrigin: 4000000
  };
  return { kind: "worldFile", crs: { epsg: 3857 }, worldFile, wh: [1526, 2048] };
}

/** 左余白（x < 50）の GCP だけを大きく歪ませた歪み TIN。AT-7② と同じ */
async function distortedTin(): Promise<TinSurfaceData> {
  const tin = new Tin({ wh: [1000, 1000] });
  tin.setWh([1000, 1000]);
  const points: PointSet[] = [];
  for (let i = 0; i <= 10; i++) {
    for (let j = 0; j <= 10; j++) {
      const xy = [i * 100, j * 100];
      const merc = affineMerc(xy);
      if (xy[0] < 50) {
        merc[0] += 400;
        merc[1] -= 300;
      }
      points.push([xy, merc]);
    }
  }
  tin.setPoints(points);
  await tin.updateTinAsync();
  return { kind: "tin", compiled: tin.getCompiled() };
}

/** AT-7② の coreGcps（300..700 の 5×5）。gcps 渡しの判定差を見る材料 */
export function distortedTinCoreGcps(): PointSet[] {
  const coreGcps: PointSet[] = [];
  for (let i = 3; i <= 7; i++) {
    for (let j = 3; j <= 7; j++) {
      coreGcps.push([[i * 100, j * 100], affineMerc([i * 100, j * 100])]);
    }
  }
  return coreGcps;
}

/** B（outerTransform: "worldFile"＋strict）。AT-6 の buildBFixture と同じ */
function buildBFixture(root: string): TinSurfaceData {
  const compiled = structuredClone(loadCompiledOf(path.join(root, "tests/compiled/fushimijo_maplat_v3.json")));
  const worldFile: WorldFile = {
    xScale: 2, xSkew: 0, xOrigin: 15000000.5,
    ySkew: 0, yScale: -2, yOrigin: 4000000.5
  };
  const toMerc = (xy: number[]) => worldFileToCrs(worldFile, xy);
  compiled.outerTransform = "worldFile";
  compiled.worldFile = worldFile;
  compiled.points = compiled.points.map(([xy]: PointSet) => [xy, toMerc(xy)]);
  compiled.vertices_points = compiled.vertices_points.map(([xy]: PointSet) => [xy, toMerc(xy)]);
  compiled.centroid_point = [compiled.centroid_point[0], toMerc(compiled.centroid_point[0])];
  return { kind: "tin", compiled };
}

// ── 組み立て ─────────────────────────────────────────────────────────────────

function buildTarget(
  spec: TargetSpec,
  layerData: LayerSurfaceData,
  extraGcps: PointSet[] | undefined,
  recommendGcps: PointSet[] | undefined,
  note: string
): Target {
  const surface = createLayerSurface(layerData);
  const compiled = layerData.kind === "tin" ? layerData.compiled : undefined;
  const strictness =
    layerData.kind === "tin"
      ? classifyStrictness(surface, deriveStrictStatus(compiled!))
      : classifyStrictness(surface);
  const gcps: PointSet[] | undefined =
    extraGcps ??
    (layerData.kind === "tin" ? compiled!.points : undefined);
  const paperRect = paperRectOf(surface);
  const paperPoints = (gcps ?? []).map(g => (g[0] as number[]).slice(0, 2));
  const hull = hullOfGcps(paperPoints);
  const sampleBox = hull ? boxOf(hull.geometry.coordinates[0]) : boxOf([
    [paperRect.minX, paperRect.minY],
    [paperRect.maxX, paperRect.maxY]
  ]);
  const maxZoom = maxZoomOf(paperRect);
  const whText = layerData.kind === "tin" && compiled!.wh
    ? `${Math.round(compiled!.wh[0])}×${Math.round(compiled!.wh[1])}`
    : surface.wh
      ? `${Math.round(surface.wh[0])}×${Math.round(surface.wh[1])}（bounds 由来）`
      : `${Math.round(paperRect.maxX - paperRect.minX)}×${Math.round(paperRect.maxY - paperRect.minY)}（GCP 外接）`;
  return {
    id: spec.id,
    label: spec.label,
    source: spec.source,
    strictness,
    gcpCount: paperPoints.length,
    whText,
    maxxy: Math.pow(2, maxZoom) * 256,
    maxZoom,
    surface,
    layerData,
    gcps,
    recommendGcps: recommendGcps ?? gcps,
    paperRect,
    hull,
    sampleBox,
    note
  };
}

/** 全測定対象を作る（AT_distortedTin だけは @maplat/tin で生成） */
export async function buildTargets(root: string): Promise<Target[]> {
  const targets: Target[] = [];
  for (const spec of TARGET_SPECS) {
    if (spec.id === "AT_distortedTin") {
      const layerData = await distortedTin();
      targets.push(
        buildTarget(
          spec,
          layerData,
          undefined,
          distortedTinCoreGcps(),
          "gcps 渡し＝中央 5×5（AT-7② と同じ）"
        )
      );
      continue;
    }
    const { layerData, gcps, note } = spec.load(root);
    targets.push(buildTarget(spec, layerData, gcps, undefined, note ?? ""));
  }
  return targets;
}

/** 標本点（種固定・凸包内 ~1000 点） */
export function samplesFor(target: Target, count = 1000, seedOffset = 0): number[][] {
  return samplePointsIn(target.hull, target.sampleBox, count, mulberry32(SEED + seedOffset));
}

// ── fixture 一覧（表 1 用。測定対象外の層も含む） ────────────────────────────

export interface InventoryRow {
  map: string;
  source: string;
  strictness: string;
  layers: number;
  gcps: string;
  wh: string;
  measured: string;
  note: string;
}

export function inventoryRows(root: string, targets: Target[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const byId = new Map(targets.map(t => [t.id, t]));
  const cd = compiledDir(root);

  // 主層＋副層を持つ地図（tests/compiled の sub ファイルから層数を数える）
  const groups: { map: string; base: string; subBases: string[] }[] = [
    { map: "18th_mapcontest_ea", base: "18th_mapcontest_ea", subBases: ["18th_mapcontest_ea_sub0", "18th_mapcontest_ea_sub1"] },
    { map: "18th_mapcontest_gp", base: "18th_mapcontest_gp", subBases: ["18th_mapcontest_gp_sub0", "18th_mapcontest_gp_sub1"] },
    { map: "1932_nobeoka", base: "1932_nobeoka", subBases: ["1932_nobeoka_sub0"] },
    { map: "fushimijo_maplat", base: "fushimijo_maplat", subBases: [] },
    { map: "miesan_ginza_map", base: "miesan_ginza_map", subBases: [] },
    { map: "naramachi_yasui_bunko", base: "naramachi_yasui_bunko", subBases: [] },
    { map: "naramachi_yasui_revised", base: "naramachi_yasui_revised", subBases: [] },
    { map: "tatebayashi_castle_akimoto", base: "tatebayashi_castle_akimoto", subBases: [] },
    { map: "tatebayashi_kaei_jokamachi", base: "tatebayashi_kaei_jokamachi", subBases: [] }
  ];
  for (const ver of ["v2", "v3"]) {
    for (const group of groups) {
      const mainFile = path.join(cd, `${group.base}_${ver}.json`);
      if (!fs.existsSync(mainFile)) continue;
      const main = loadCompiledOf(mainFile);
      const layerStatuses: string[] = [];
      const gcpsParts: string[] = [];
      const mainStatus = main.strict_status ?? "strict（既定）";
      layerStatuses.push(String(mainStatus));
      gcpsParts.push(String((main.points ?? []).length));
      for (const subBase of group.subBases) {
        const subFile = path.join(cd, `${subBase}_${ver}.json`);
        if (!fs.existsSync(subFile)) continue;
        const sub = loadCompiledOf(subFile);
        layerStatuses.push(`${sub.strict_status ?? "strict（既定）"}（副）`);
        gcpsParts.push(String((sub.points ?? []).length));
      }
      const targetId = `${group.base}_${ver}`;
      const target = byId.get(targetId);
      rows.push({
        map: `${group.map} ${ver}`,
        source: `tests/compiled/${group.base}_${ver}.json`,
        strictness: layerStatuses.join(" / "),
        layers: layerStatuses.length,
        gcps: gcpsParts.join(" / "),
        wh: target?.whText ?? (main.wh ? `${Math.round(main.wh[0])}×${Math.round(main.wh[1])}` : "—"),
        measured: target ? "主層" : "—",
        note: target ? "" : "主層のみ計測（副層は一覧のみ）"
      });
    }
  }

  // 副層そのものを単独計測した代表（loose 副層）
  {
    const t = byId.get("1932_nobeoka_sub0_v3");
    if (t) {
      rows.push({
        map: "1932_nobeoka 副層（v3 sub0）",
        source: "tests/compiled/1932_nobeoka_sub0_v3.json",
        strictness: "loose",
        layers: 1,
        gcps: String(t.gcpCount),
        wh: t.whText,
        measured: "計測",
        note: "loose 副層の代表として単独計測（1932_nobeoka v3 の副層）"
      });
    }
  }

  // 旧形式 map JSON
  const legacy: [string, string][] = [
    ["burakita-2024", "tests/compiled/burakita-2024.json"],
    ["fushimijo_maplat（旧形式）", "tests/compiled/fushimijo_maplat.json"],
    ["naramachi_yasui_bunko（旧形式）", "tests/compiled/naramachi_yasui_bunko.json"],
    ["miesan_ginza_map（旧形式）", "tests/miesan_ginza_map.json"]
  ];
  const legacyIds = ["burakita-2024", "fushimijo_maplat_legacy", "naramachi_yasui_bunko_legacy", "miesan_ginza_map_legacy"];
  legacy.forEach(([map, source], i) => {
    const compiled = loadCompiledOf(path.join(root, source));
    const target = byId.get(legacyIds[i]);
    rows.push({
      map,
      source,
      strictness: String(compiled.strict_status ?? "strict（既定）"),
      layers: 1,
      gcps: String((compiled.points ?? []).length),
      wh: target?.whText ?? (compiled.wh ? `${Math.round(compiled.wh[0])}×${Math.round(compiled.wh[1])}` : "—"),
      measured: target ? "計測" : "—",
      note: "旧形式（version 無しの compiled を含む map JSON）"
    });
  });

  // AT 合成
  const fx = readJson(path.join(cd, "visible_layers_synthetic.json"));
  const synSubNames = ["wide_station", "wide_area", "castle_a", "temple_b"];
  rows.push({
    map: "visible_layers_synthetic（AT 合成多層）",
    source: "tests/compiled/visible_layers_synthetic.json",
    strictness: "strict / strict（副×4）",
    layers: 5,
    gcps: `5 / ${synSubNames.map(n => (fx.sub[n].points ?? []).length).join(" / ")}`,
    wh: "2048×1536（主）",
    measured: "主層・副層 wide_station を計測",
    note: "AT-6 の合成多層（k=1/8〜40）。他に未使用 sub 2（castle_a_impTie / wide_area_c）"
  });
  rows.push({
    map: "AT 合成: Plan A 45°",
    source: "AT-7① 相当（合成）",
    strictness: "strict（WorldFileSurface）",
    layers: 1,
    gcps: "0",
    wh: "1526×2048",
    measured: "計測",
    note: "一様相似 s=2・θ=45°"
  });
  rows.push({
    map: "AT 合成: 左端歪み TIN",
    source: "AT-7② 相当（合成）",
    strictness: "strict",
    layers: 1,
    gcps: "121",
    wh: "1000×1000",
    measured: "計測",
    note: "x=0 列の GCP だけを大きくずらした歪み"
  });
  rows.push({
    map: "AT 合成: B（伏見城＋worldFile）",
    source: "AT-6② 相当（合成）",
    strictness: "strict",
    layers: 1,
    gcps: "506",
    wh: "1526×2048",
    measured: "計測",
    note: "outerTransform: worldFile"
  });
  return rows;
}
