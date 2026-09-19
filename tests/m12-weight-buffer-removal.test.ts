// oct26-m12-t1a（DES-M12-WEIGHTBUFFER-0919）の性質テスト。
// weight_buffer を読み込まない Transform が、三角形内・扇形外挿とも純アフィンであることの機械判定。
//
// データセット ALL（t1 設計 §5）:
//   - tests/compiled/*.json のうち compiled（oct26_m2_t4_synthetic.json を除く 31 件。
//     legacy 形式 { compiled: … } は .compiled を取る）
//   - tests/mapdata/*.json の compiled と sub_maps[].compiled（6 ファイル）
// 件数はディレクトリから動的に取り、増減したら失敗させる（31・mapdata 6）。
// 除外表（RT_EXCLUDE / EDGE_BACK_EXCLUDE）は compiled の同一性 cid
//   = sha256(JSON.stringify([points, tins_points, version ?? null])) の先頭 16 桁で引く。
import { describe, expect, it } from "vitest";
import { Transform, format_version } from "../src";
import type { Compiled, Tri } from "../src";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

// ─── データセット読込 ────────────────────────────────────────────────────────

const COMPILED_DIR = path.join(__dirname, "compiled");
const MAPDATA_DIR = path.join(__dirname, "mapdata");

interface Entry {
  name: string;
  compiled: Compiled;
}

const compiledEntries: Entry[] = [];
for (const f of fs.readdirSync(COMPILED_DIR).sort()) {
  if (!f.endsWith(".json") || f === "oct26_m2_t4_synthetic.json") continue;
  const raw = JSON.parse(
    fs.readFileSync(path.join(COMPILED_DIR, f), "utf-8"),
  ) as Record<string, unknown>;
  compiledEntries.push({ name: `compiled/${f}`, compiled: (raw.compiled ?? raw) as Compiled });
}

const mapdataFiles = fs.readdirSync(MAPDATA_DIR).sort();
const mapdataEntries: Entry[] = [];
for (const f of mapdataFiles) {
  if (!f.endsWith(".json")) continue;
  const m = JSON.parse(fs.readFileSync(path.join(MAPDATA_DIR, f), "utf-8")) as {
    compiled: Compiled;
    sub_maps?: { compiled: Compiled }[];
  };
  mapdataEntries.push({ name: `mapdata/${f}#main`, compiled: m.compiled });
  (m.sub_maps ?? []).forEach((s, i) =>
    mapdataEntries.push({ name: `mapdata/${f}#sub_maps[${i}]`, compiled: s.compiled }),
  );
}

const ALL: Entry[] = [...compiledEntries, ...mapdataEntries];

// ─── 除外表（t1 設計 §5。実装者が書き換えない。食い違えば失敗させる） ────

// [cid, 格子, 1e-5超の上限点数, 最大誤差(px)の上限]
const RT_EXCLUDE: [string, "P" | "I", number, number][] = [
  ["5171103d6bb47f71", "P", 9, 31.17193],
  ["5171103d6bb47f71", "I", 21, 48.719157],
  ["32d35aab06e0dd16", "I", 1, 1.3385231],
];

// cid → [1e-12超の上限点数, 最大相対誤差の上限]
const EDGE_BACK_EXCLUDE: Record<string, [number, number]> = {
  "5171103d6bb47f71": [13, 4.8309273e-6],
  "32d35aab06e0dd16": [361, 3.3436872e-6],
  "2545c2802d462624": [281, 3.3437723e-6],
};

// ─── ヘルパー ────────────────────────────────────────────────────────────────

function cidOf(c: Compiled): string {
  return createHash("sha256")
    .update(JSON.stringify([c.points, c.tins_points, c.version ?? null]))
    .digest("hex")
    .slice(0, 16);
}

/** 「相対 X 以内」の分母: 対応点の両座標系を通じた座標絶対値の最大 */
function scaleOf(c: Compiled): number {
  let m = 0;
  for (const p of c.points) {
    for (const v of [p[0][0], p[0][1], p[1][0], p[1][1]]) {
      const a = Math.abs(v);
      if (a > m) m = a;
    }
  }
  return m;
}

function relErr(r: number[], e: number[], scale: number): number {
  return Math.max(Math.abs(r[0] - e[0]), Math.abs(r[1] - e[1])) / scale;
}

/** ビット一致（Object.is を成分ごとに） */
function coordObjectIs(a: number[], b: number[]): boolean {
  return Object.is(a[0], b[0]) && Object.is(a[1], b[1]);
}

/** GRID-P（t1 設計 §5）: 当該方向の対応点 bbox を各辺 20% 広げた 41×41 */
function gridP(c: Compiled, dir: "forw" | "bakw"): [number, number][] {
  const idx = dir === "forw" ? 0 : 1;
  const xs = c.points.map((p) => p[idx][0]);
  const ys = c.points.map((p) => p[idx][1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const w = Math.max(...xs) - x0;
  const h = Math.max(...ys) - y0;
  return makeGrid(x0, y0, w, h, 0.2, 40);
}

/** GRID-I（t1 設計 §5）: 順方向の画像範囲を各辺 30% 広げた 61×61 */
function gridI(c: Compiled): [number, number][] {
  let x0: number;
  let y0: number;
  let w: number;
  let h: number;
  if (c.bounds) {
    const xs = c.bounds.map((p) => p[0]);
    const ys = c.bounds.map((p) => p[1]);
    x0 = Math.min(...xs);
    y0 = Math.min(...ys);
    w = Math.max(...xs) - x0;
    h = Math.max(...ys) - y0;
  } else {
    const wh = c.wh ?? [
      Math.max(...c.points.map((p) => p[0][0])),
      Math.max(...c.points.map((p) => p[0][1])),
    ];
    x0 = 0;
    y0 = 0;
    w = wh[0];
    h = wh[1];
  }
  return makeGrid(x0, y0, w, h, 0.3, 60);
}

function makeGrid(
  x0: number,
  y0: number,
  w: number,
  h: number,
  m: number,
  n: number,
): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n; j++) {
      out.push([
        x0 - m * w + ((1 + 2 * m) * w * i) / n,
        y0 - m * h + ((1 + 2 * m) * h * j) / n,
      ]);
    }
  }
  return out;
}

/** 旧 geometry.ts:55-78 の重み付き式をテスト内に写した参照関数 */
function legacyWeighted(
  tri: Tri,
  p: [number, number],
  wb: Record<string, number> | undefined,
): [number, number] {
  const a = tri.geometry.coordinates[0][0];
  const b = tri.geometry.coordinates[0][1];
  const c = tri.geometry.coordinates[0][2];
  const o = p;
  const ad = tri.properties.a.geom;
  const bd = tri.properties.b.geom;
  const cd = tri.properties.c.geom;
  const ab = [b[0] - a[0], b[1] - a[1]];
  const ac = [c[0] - a[0], c[1] - a[1]];
  const ao = [o[0] - a[0], o[1] - a[1]];
  const abd = [bd[0] - ad[0], bd[1] - ad[1]];
  const acd = [cd[0] - ad[0], cd[1] - ad[1]];
  let abv = (ac[1] * ao[0] - ac[0] * ao[1]) / (ab[0] * ac[1] - ab[1] * ac[0]);
  let acv = (ab[0] * ao[1] - ab[1] * ao[0]) / (ab[0] * ac[1] - ab[1] * ac[0]);
  if (wb) {
    const aW = wb[String(tri.properties.a.index)];
    const bW = wb[String(tri.properties.b.index)];
    const cW = wb[String(tri.properties.c.index)];
    let nabv;
    if (abv < 0 || acv < 0 || 1 - abv - acv < 0) {
      const normB = abv / (abv + acv);
      const normC = acv / (abv + acv);
      nabv = abv / bW / (normB / bW + normC / cW);
      acv = acv / cW / (normB / bW + normC / cW);
    } else {
      nabv = abv / bW / (abv / bW + acv / cW + (1 - abv - acv) / aW);
      acv = acv / cW / (abv / bW + acv / cW + (1 - abv - acv) / aW);
    }
    abv = nabv;
  }
  return [abv * abd[0] + acv * acd[0] + ad[0], abv * abd[1] + acv * acd[1] + ad[1]];
}

/** 純アフィン参照（T-BIT 陽性対照用。geometry.ts の非重み部分と同型） */
function pureAffine(tri: Tri, p: [number, number]): [number, number] {
  const a = tri.geometry.coordinates[0][0];
  const b = tri.geometry.coordinates[0][1];
  const c = tri.geometry.coordinates[0][2];
  const o = p;
  const ad = tri.properties.a.geom;
  const bd = tri.properties.b.geom;
  const cd = tri.properties.c.geom;
  const ab = [b[0] - a[0], b[1] - a[1]];
  const ac = [c[0] - a[0], c[1] - a[1]];
  const ao = [o[0] - a[0], o[1] - a[1]];
  const abd = [bd[0] - ad[0], bd[1] - ad[1]];
  const acd = [cd[0] - ad[0], cd[1] - ad[1]];
  const abv = (ac[1] * ao[0] - ac[0] * ao[1]) / (ab[0] * ac[1] - ab[1] * ac[0]);
  const acv = (ab[0] * ao[1] - ab[1] * ao[0]) / (ab[0] * ac[1] - ab[1] * ac[0]);
  return [abv * abd[0] + acv * acd[0] + ad[0], abv * abd[1] + acv * acd[1] + ad[1]];
}

/** 重心座標アフィンの独立実装（T-AFF 用。Cramer 式で u,v を解く。geometry.ts の式を写さない） */
function independentAffine(tri: Tri, p: [number, number]): [number, number] {
  const s = tri.geometry.coordinates[0];
  const a = s[0];
  const b = s[1];
  const c = s[2];
  const ga = tri.properties.a.geom;
  const gb = tri.properties.b.geom;
  const gc = tri.properties.c.geom;
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const vx = c[0] - a[0];
  const vy = c[1] - a[1];
  const det = ux * vy - uy * vx;
  const px = p[0] - a[0];
  const py = p[1] - a[1];
  const u = (px * vy - py * vx) / det;
  const v = (ux * py - uy * px) / det;
  const w = 1 - u - v;
  return [w * ga[0] + u * gb[0] + v * gc[0], w * ga[1] + u * gb[1] + v * gc[1]];
}

// ─── 辺と内分点の共通定数 ────────────────────────────────────────────────────
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 0],
];
const TS = [0.25, 0.5, 0.8];

// ─── 件数と除外表の照合 ──────────────────────────────────────────────────────

describe("m12 weight_buffer 廃止（oct26-m12-t1a）", () => {
  it("ALL の件数: compiled 31・mapdata 6", () => {
    expect(compiledEntries.length).toBe(31);
    expect(mapdataFiles.filter((f) => f.endsWith(".json")).length).toBe(6);
  });

  it("除外表の cid が ALL 内に存在し、表の行数が固定どおり", () => {
    expect(RT_EXCLUDE.length).toBe(3);
    expect(Object.keys(EDGE_BACK_EXCLUDE).length).toBe(3);
    const allCids = new Set(ALL.map((e) => cidOf(e.compiled)));
    for (const [cid] of RT_EXCLUDE) expect(allCids.has(cid)).toBe(true);
    for (const cid of Object.keys(EDGE_BACK_EXCLUDE)) expect(allCids.has(cid)).toBe(true);
  });

  // ── T-BIT（AC-1） ──────────────────────────────────────────────────────────
  describe("T-BIT (AC-1)", () => {
    for (const entry of ALL) {
      it(`${entry.name}`, () => {
        const c = entry.compiled;
        const original = JSON.parse(JSON.stringify(c)) as Compiled;
        const emptyWb = JSON.parse(JSON.stringify(c)) as Compiled;
        emptyWb.weight_buffer = {};
        const deleted = JSON.parse(JSON.stringify(c)) as Compiled;
        delete (deleted as Partial<Compiled>).weight_buffer;
        const bumped = JSON.parse(JSON.stringify(c)) as Compiled;
        bumped.weight_buffer = {};
        if (bumped.version === 2.00703) bumped.version = 2.00704;
        else if (bumped.version === 3) bumped.version = 3.00001;

        const transforms = [original, emptyWb, deleted, bumped].map((v) => {
          const t = new Transform();
          t.setCompiled(v);
          return t;
        });

        for (const p of gridP(c, "forw")) {
          const results = transforms.map((t) => t.transform(p, false, true) as number[]);
          for (let k = 1; k < results.length; k++) {
            expect(coordObjectIs(results[0], results[k])).toBe(true);
          }
        }
        if (transforms[0].strict_status !== "strict_error") {
          for (const p of gridP(c, "bakw")) {
            const results = transforms.map((t) => t.transform(p, true, true) as number[]);
            for (let k = 1; k < results.length; k++) {
              expect(coordObjectIs(results[0], results[k])).toBe(true);
            }
          }
        }
      }, 60_000);
    }

    it("陽性対照: legacyWeighted と pureAffine は先頭 3 件の三角形上の点で不一致", () => {
      let diff = false;
      const bary: [number, number][] = [
        [1 / 3, 1 / 3],
        [0.2, 0.3],
        [0.6, 0.1],
        [0.05, 0.05],
        [0.45, 0.45],
      ];
      outer: for (const entry of ALL.slice(0, 3)) {
        const t = new Transform();
        t.setCompiled(entry.compiled);
        const wb = entry.compiled.weight_buffer.forw;
        for (const tri of t.tins!.forw!.features) {
          const s = tri.geometry.coordinates[0].slice(0, 3);
          for (const [u, v] of bary) {
            const w = 1 - u - v;
            const p: [number, number] = [
              w * s[0][0] + u * s[1][0] + v * s[2][0],
              w * s[0][1] + u * s[1][1] + v * s[2][1],
            ];
            if (!coordObjectIs(legacyWeighted(tri, p, wb), pureAffine(tri, p))) {
              diff = true;
              break outer;
            }
          }
        }
      }
      expect(diff).toBe(true);
    });
  });

  // ── T-GCP（AC-2a） ─────────────────────────────────────────────────────────
  describe("T-GCP (AC-2a)", () => {
    for (const entry of ALL) {
      it(`${entry.name}`, () => {
        const c = entry.compiled;
        const t = new Transform();
        t.setCompiled(c);
        const scale = scaleOf(c);
        for (const [src, dst] of c.points) {
          const r = t.transform(src, false, true) as number[];
          expect(r[0] === dst[0]).toBe(true);
          expect(r[1] === dst[1]).toBe(true);
        }
        if (t.strict_status === "strict" || t.strict_status === "loose") {
          for (const [src, dst] of c.points) {
            const r = t.transform(dst, true, true) as number[];
            expect(relErr(r, src, scale)).toBeLessThanOrEqual(1e-12);
          }
        }
      }, 60_000);
    }

    it("陽性対照: 対応点を 1e-6 ずらすと === が偽になる", () => {
      const c = ALL[0].compiled;
      const t = new Transform();
      t.setCompiled(c);
      const r = t.transform(c.points[0][0], false, true) as number[];
      const shifted = [c.points[0][1][0] + 1e-6, c.points[0][1][1] + 1e-6];
      expect(Object.is(r[0], shifted[0]) && Object.is(r[1], shifted[1])).toBe(false);
    });
  });

  // ── T-EDGE（AC-2b） ────────────────────────────────────────────────────────
  describe("T-EDGE (AC-2b)", () => {
    for (const entry of ALL) {
      it(`${entry.name}（順）`, () => {
        const c = entry.compiled;
        const t = new Transform();
        t.setCompiled(c);
        const scale = scaleOf(c);
        for (const tri of t.tins!.forw!.features) {
          const s = tri.geometry.coordinates[0].slice(0, 3);
          const g = [tri.properties.a.geom, tri.properties.b.geom, tri.properties.c.geom];
          for (const [i, j] of EDGES) {
            for (const k of TS) {
              const p: [number, number] = [
                s[i][0] + (s[j][0] - s[i][0]) * k,
                s[i][1] + (s[j][1] - s[i][1]) * k,
              ];
              const e: [number, number] = [
                g[i][0] + (g[j][0] - g[i][0]) * k,
                g[i][1] + (g[j][1] - g[i][1]) * k,
              ];
              const r = t.transform(p, false, true) as number[];
              expect(relErr(r, e, scale)).toBeLessThanOrEqual(1e-12);
            }
          }
        }
      }, 60_000);
    }

    for (const entry of ALL) {
      it(`${entry.name}（逆: strict のみ）`, () => {
        const c = entry.compiled;
        const t = new Transform();
        t.setCompiled(c);
        if (t.strict_status !== "strict") return;
        const cid = cidOf(c);
        const scale = scaleOf(c);
        let count = 0;
        let mx = 0;
        for (const tri of t.tins!.bakw!.features) {
          const s = tri.geometry.coordinates[0].slice(0, 3);
          const g = [tri.properties.a.geom, tri.properties.b.geom, tri.properties.c.geom];
          for (const [i, j] of EDGES) {
            for (const k of TS) {
              const p: [number, number] = [
                s[i][0] + (s[j][0] - s[i][0]) * k,
                s[i][1] + (s[j][1] - s[i][1]) * k,
              ];
              const e: [number, number] = [
                g[i][0] + (g[j][0] - g[i][0]) * k,
                g[i][1] + (g[j][1] - g[i][1]) * k,
              ];
              const r = t.transform(p, true, true) as number[];
              const re = relErr(r, e, scale);
              mx = Math.max(mx, re);
              if (re > 1e-12) count++;
            }
          }
        }
        const excl = EDGE_BACK_EXCLUDE[cid];
        if (excl) {
          expect(count).toBeGreaterThan(0); // 陽性対照: 除外しなければ 1e-12 超がある
          expect(count).toBeLessThanOrEqual(excl[0]);
          expect(mx).toBeLessThanOrEqual(excl[1] * 1.01);
        } else {
          expect(count).toBe(0);
        }
      }, 60_000);
    }

    it("陽性対照: legacyWeighted で順方向の辺を判定すると相対 1e-8 超の外れがある", () => {
      let found = false;
      outer: for (const entry of ALL) {
        const t = new Transform();
        t.setCompiled(entry.compiled);
        const wb = entry.compiled.weight_buffer.forw;
        const scale = scaleOf(entry.compiled);
        for (const tri of t.tins!.forw!.features) {
          const s = tri.geometry.coordinates[0].slice(0, 3);
          const g = [tri.properties.a.geom, tri.properties.b.geom, tri.properties.c.geom];
          for (const [i, j] of EDGES) {
            for (const k of TS) {
              const p: [number, number] = [
                s[i][0] + (s[j][0] - s[i][0]) * k,
                s[i][1] + (s[j][1] - s[i][1]) * k,
              ];
              const e: [number, number] = [
                g[i][0] + (g[j][0] - g[i][0]) * k,
                g[i][1] + (g[j][1] - g[i][1]) * k,
              ];
              if (relErr(legacyWeighted(tri, p, wb), e, scale) > 1e-8) {
                found = true;
                break outer;
              }
            }
          }
        }
      }
      expect(found).toBe(true);
    });
  });

  // ── T-RT（AC-2c） ──────────────────────────────────────────────────────────
  describe("T-RT (AC-2c)", () => {
    for (const entry of ALL) {
      it(`${entry.name}`, () => {
        const c = entry.compiled;
        const t = new Transform();
        t.setCompiled(c);
        if (t.strict_status !== "strict") return;
        const cid = cidOf(c);
        for (const [kind, pts] of [
          ["P", gridP(c, "forw")],
          ["I", gridI(c)],
        ] as const) {
          let count = 0;
          let mx = 0;
          for (const p of pts) {
            const q = t.transform(p, false, true) as number[];
            const b = t.transform(q, true, true) as number[];
            const e = Math.hypot(b[0] - p[0], b[1] - p[1]);
            mx = Math.max(mx, e);
            if (e > 1e-5) count++;
          }
          const row = RT_EXCLUDE.find((r) => r[0] === cid && r[1] === kind);
          if (row) {
            expect(count).toBeGreaterThan(0); // 陽性対照: 除外しなければ 1e-5 超がある
            expect(count).toBeLessThanOrEqual(row[2]);
            expect(mx).toBeLessThanOrEqual(row[3] * 1.01);
          } else {
            expect(count).toBe(0);
          }
        }
      }, 60_000);
    }
  });

  // ── T-AFF（AC-3） ──────────────────────────────────────────────────────────
  describe("T-AFF (AC-3)", () => {
    for (const entry of ALL) {
      it(`${entry.name}`, () => {
        const c = entry.compiled;
        const t = new Transform();
        t.setCompiled(c);
        t.stateFull = true;
        const scale = scaleOf(c);
        const dirs: ("forw" | "bakw")[] =
          t.strict_status === "strict_error" ? ["forw"] : ["forw", "bakw"];
        for (const dir of dirs) {
          const fan = t.vertices_params![dir]![1]!;
          for (const p of gridP(c, dir)) {
            t.stateTriangle = undefined;
            t.stateBackward = undefined;
            const r = t.transform(p, dir === "bakw", true) as number[];
            const tri = t.stateTriangle;
            if (tri) {
              expect(relErr(r, independentAffine(tri, p), scale)).toBeLessThanOrEqual(1e-12);
            } else {
              let ok = false;
              for (const fanTin of fan) {
                if (relErr(r, independentAffine(fanTin.features[0], p), scale) <= 1e-12) {
                  ok = true;
                  break;
                }
              }
              expect(ok).toBe(true);
            }
          }
        }
      }, 60_000);
    }

    it("陽性対照: legacyWeighted を同じ判定にかけると相対 1e-8 超の外れがある", () => {
      let found = false;
      const bary: [number, number][] = [
        [1 / 3, 1 / 3],
        [0.2, 0.3],
        [0.6, 0.1],
        [0.05, 0.05],
        [0.45, 0.45],
      ];
      outer: for (const entry of ALL) {
        const t = new Transform();
        t.setCompiled(entry.compiled);
        const wb = entry.compiled.weight_buffer.forw;
        const scale = scaleOf(entry.compiled);
        for (const tri of t.tins!.forw!.features) {
          const s = tri.geometry.coordinates[0].slice(0, 3);
          for (const [u, v] of bary) {
            const w = 1 - u - v;
            const p: [number, number] = [
              w * s[0][0] + u * s[1][0] + v * s[2][0],
              w * s[0][1] + u * s[1][1] + v * s[2][1],
            ];
            if (relErr(legacyWeighted(tri, p, wb), independentAffine(tri, p), scale) > 1e-8) {
              found = true;
              break outer;
            }
          }
        }
      }
      expect(found).toBe(true);
    });
  });

  // ── T-LEGACY（AC-5・§5） ───────────────────────────────────────────────────
  describe("T-LEGACY (AC-5)", () => {
    for (const key of ["naramachi_yasui_bunko", "fushimijo_maplat", "burakita-2024"]) {
      it(`${key}`, () => {
        const raw = JSON.parse(
          fs.readFileSync(path.join(COMPILED_DIR, `${key}.json`), "utf-8"),
        ) as { compiled: Compiled };
        const c = raw.compiled;
        expect(() => new Transform().setCompiled(c)).not.toThrow();
        const t = new Transform();
        t.setCompiled(c);
        const scale = scaleOf(c);
        for (const [src, dst] of c.points) {
          const r = t.transform(src, false, true) as number[];
          expect(r[0] === dst[0]).toBe(true);
          expect(r[1] === dst[1]).toBe(true);
        }
        if (t.strict_status === "strict" || t.strict_status === "loose") {
          for (const [src, dst] of c.points) {
            const r = t.transform(dst, true, true) as number[];
            expect(relErr(r, src, scale)).toBeLessThanOrEqual(1e-12);
          }
        }
      }, 60_000);
    }

    it("陽性対照: 版なし legacy に version 2.00703/2.00704 を付すと setCompiled が失敗する", () => {
      for (const key of ["naramachi_yasui_bunko", "fushimijo_maplat"]) {
        const raw = JSON.parse(
          fs.readFileSync(path.join(COMPILED_DIR, `${key}.json`), "utf-8"),
        ) as { compiled: Compiled };
        const base = raw.compiled;
        for (const ver of [2.00703, 2.00704]) {
          const clone = JSON.parse(JSON.stringify(base)) as Compiled;
          clone.version = ver;
          expect(() => new Transform().setCompiled(clone)).toThrow(
            /Bad index value for indexesToTri/,
          );
        }
      }
    });
  });

  // ── T-VER（§4） ────────────────────────────────────────────────────────────
  describe("T-VER (§4)", () => {
    it("format_version === 2.00704", () => {
      expect(format_version).toBe(2.00704);
    });
  });
});