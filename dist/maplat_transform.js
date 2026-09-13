function ot(r, t, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = t || {}, n.geometry = r, n;
}
function X(r, t, e = {}) {
  if (!r)
    throw new Error("coordinates is required");
  if (!Array.isArray(r))
    throw new Error("coordinates must be an Array");
  if (r.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!j(r[0]) || !j(r[1]))
    throw new Error("coordinates must contain numbers");
  return ot({
    type: "Point",
    coordinates: r
  }, t, e);
}
function D(r, t, e = {}) {
  for (const s of r) {
    if (s.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (s[s.length - 1].length !== s[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let i = 0; i < s[s.length - 1].length; i++)
      if (s[s.length - 1][i] !== s[0][i])
        throw new Error("First and last Position are not equivalent.");
  }
  return ot({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function U(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function j(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function dt(r) {
  if (!r)
    throw new Error("coord is required");
  if (!Array.isArray(r)) {
    if (r.type === "Feature" && r.geometry !== null && r.geometry.type === "Point")
      return [...r.geometry.coordinates];
    if (r.type === "Point")
      return [...r.coordinates];
  }
  if (Array.isArray(r) && r.length >= 2 && !Array.isArray(r[0]) && !Array.isArray(r[1]))
    return [...r];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function J(r) {
  if (Array.isArray(r))
    return r;
  if (r.type === "Feature") {
    if (r.geometry !== null)
      return r.geometry.coordinates;
  } else if (r.coordinates)
    return r.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function lt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const N = 11102230246251565e-32, E = 134217729, yt = (3 + 8 * N) * N;
function Y(r, t, e, n, s) {
  let i, o, h, a, c = t[0], g = n[0], u = 0, l = 0;
  g > c == g > -c ? (i = c, c = t[++u]) : (i = g, g = n[++l]);
  let m = 0;
  if (u < r && l < e)
    for (g > c == g > -c ? (o = c + i, h = i - (o - c), c = t[++u]) : (o = g + i, h = i - (o - g), g = n[++l]), i = o, h !== 0 && (s[m++] = h); u < r && l < e; )
      g > c == g > -c ? (o = i + c, a = o - i, h = i - (o - a) + (c - a), c = t[++u]) : (o = i + g, a = o - i, h = i - (o - a) + (g - a), g = n[++l]), i = o, h !== 0 && (s[m++] = h);
  for (; u < r; )
    o = i + c, a = o - i, h = i - (o - a) + (c - a), c = t[++u], i = o, h !== 0 && (s[m++] = h);
  for (; l < e; )
    o = i + g, a = o - i, h = i - (o - a) + (g - a), g = n[++l], i = o, h !== 0 && (s[m++] = h);
  return (i !== 0 || m === 0) && (s[m++] = i), m;
}
function mt(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function F(r) {
  return new Float64Array(r);
}
const gt = (3 + 16 * N) * N, xt = (2 + 12 * N) * N, pt = (9 + 64 * N) * N * N, L = F(4), K = F(8), Q = F(12), H = F(16), A = F(4);
function bt(r, t, e, n, s, i, o) {
  let h, a, c, g, u, l, m, x, y, d, f, p, w, M, T, b, _, v;
  const B = r - s, S = e - s, C = t - i, P = n - i;
  M = B * P, l = E * B, m = l - (l - B), x = B - m, l = E * P, y = l - (l - P), d = P - y, T = x * d - (M - m * y - x * y - m * d), b = C * S, l = E * C, m = l - (l - C), x = C - m, l = E * S, y = l - (l - S), d = S - y, _ = x * d - (b - m * y - x * y - m * d), f = T - _, u = T - f, L[0] = T - (f + u) + (u - _), p = M + f, u = p - M, w = M - (p - u) + (f - u), f = w - b, u = w - f, L[1] = w - (f + u) + (u - b), v = p + f, u = v - p, L[2] = p - (v - u) + (f - u), L[3] = v;
  let k = mt(4, L), V = xt * o;
  if (k >= V || -k >= V || (u = r - B, h = r - (B + u) + (u - s), u = e - S, c = e - (S + u) + (u - s), u = t - C, a = t - (C + u) + (u - i), u = n - P, g = n - (P + u) + (u - i), h === 0 && a === 0 && c === 0 && g === 0) || (V = pt * o + yt * Math.abs(k), k += B * g + P * h - (C * c + S * a), k >= V || -k >= V)) return k;
  M = h * P, l = E * h, m = l - (l - h), x = h - m, l = E * P, y = l - (l - P), d = P - y, T = x * d - (M - m * y - x * y - m * d), b = a * S, l = E * a, m = l - (l - a), x = a - m, l = E * S, y = l - (l - S), d = S - y, _ = x * d - (b - m * y - x * y - m * d), f = T - _, u = T - f, A[0] = T - (f + u) + (u - _), p = M + f, u = p - M, w = M - (p - u) + (f - u), f = w - b, u = w - f, A[1] = w - (f + u) + (u - b), v = p + f, u = v - p, A[2] = p - (v - u) + (f - u), A[3] = v;
  const ut = Y(4, L, 4, A, K);
  M = B * g, l = E * B, m = l - (l - B), x = B - m, l = E * g, y = l - (l - g), d = g - y, T = x * d - (M - m * y - x * y - m * d), b = C * c, l = E * C, m = l - (l - C), x = C - m, l = E * c, y = l - (l - c), d = c - y, _ = x * d - (b - m * y - x * y - m * d), f = T - _, u = T - f, A[0] = T - (f + u) + (u - _), p = M + f, u = p - M, w = M - (p - u) + (f - u), f = w - b, u = w - f, A[1] = w - (f + u) + (u - b), v = p + f, u = v - p, A[2] = p - (v - u) + (f - u), A[3] = v;
  const ft = Y(ut, K, 4, A, Q);
  M = h * g, l = E * h, m = l - (l - h), x = h - m, l = E * g, y = l - (l - g), d = g - y, T = x * d - (M - m * y - x * y - m * d), b = a * c, l = E * a, m = l - (l - a), x = a - m, l = E * c, y = l - (l - c), d = c - y, _ = x * d - (b - m * y - x * y - m * d), f = T - _, u = T - f, A[0] = T - (f + u) + (u - _), p = M + f, u = p - M, w = M - (p - u) + (f - u), f = w - b, u = w - f, A[1] = w - (f + u) + (u - b), v = p + f, u = v - p, A[2] = p - (v - u) + (f - u), A[3] = v;
  const ht = Y(ft, Q, 4, A, H);
  return H[ht - 1];
}
function wt(r, t, e, n, s, i) {
  const o = (t - i) * (e - s), h = (r - s) * (n - i), a = o - h, c = Math.abs(o + h);
  return Math.abs(a) >= gt * c ? a : -bt(r, t, e, n, s, i, c);
}
function Mt(r, t) {
  var e, n, s = 0, i, o, h, a, c, g, u, l = r[0], m = r[1], x = t.length;
  for (e = 0; e < x; e++) {
    n = 0;
    var y = t[e], d = y.length - 1;
    if (g = y[0], g[0] !== y[d][0] && g[1] !== y[d][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (o = g[0] - l, h = g[1] - m, n; n < d; n++) {
      if (u = y[n + 1], a = u[0] - l, c = u[1] - m, h === 0 && c === 0) {
        if (a <= 0 && o >= 0 || o <= 0 && a >= 0)
          return 0;
      } else if (c >= 0 && h <= 0 || c <= 0 && h >= 0) {
        if (i = wt(o, a, h, c, 0, 0), i === 0)
          return 0;
        (i > 0 && c > 0 && h <= 0 || i < 0 && c <= 0 && h > 0) && s++;
      }
      g = u, h = c, o = a;
    }
  }
  return s % 2 !== 0;
}
function W(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = dt(r), s = lt(t), i = s.type, o = t.bbox;
  let h = s.coordinates;
  if (o && _t(n, o) === !1)
    return !1;
  i === "Polygon" && (h = [h]);
  for (var a = 0; a < h.length; ++a) {
    const c = Mt(n, h[a]);
    if (c === 0 && !e.ignoreBoundary) return !0;
    if (c) return !0;
  }
  return !1;
}
function _t(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function $(r, t) {
  for (let e = 0; e < t.features.length; e++)
    if (W(r, t.features[e]))
      return t.features[e];
}
function it(r, t, e) {
  const n = t.geometry.coordinates[0][0], s = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = r.geometry.coordinates, h = t.properties.a.geom, a = t.properties.b.geom, c = t.properties.c.geom, g = [s[0] - n[0], s[1] - n[1]], u = [i[0] - n[0], i[1] - n[1]], l = [o[0] - n[0], o[1] - n[1]], m = [a[0] - h[0], a[1] - h[1]], x = [c[0] - h[0], c[1] - h[1]];
  let y = (u[1] * l[0] - u[0] * l[1]) / (g[0] * u[1] - g[1] * u[0]), d = (g[0] * l[1] - g[1] * l[0]) / (g[0] * u[1] - g[1] * u[0]);
  if (e) {
    const f = e[t.properties.a.index], p = e[t.properties.b.index], w = e[t.properties.c.index];
    let M;
    if (y < 0 || d < 0 || 1 - y - d < 0) {
      const T = y / (y + d), b = d / (y + d);
      M = y / p / (T / p + b / w), d = d / w / (T / p + b / w);
    } else
      M = y / p / (y / p + d / w + (1 - y - d) / f), d = d / w / (y / p + d / w + (1 - y - d) / f);
    y = M;
  }
  return [
    y * m[0] + d * x[0] + h[0],
    y * m[1] + d * x[1] + h[1]
  ];
}
function Tt(r, t, e, n) {
  const s = r.geometry.coordinates, i = e.geometry.coordinates, o = Math.atan2(s[0] - i[0], s[1] - i[1]), h = Et(o, t[0]);
  if (h === void 0)
    throw new Error("Unable to determine vertex index");
  const a = t[1][h];
  return it(r, a.features[0], n);
}
function vt(r, t, e, n, s, i, o, h) {
  let a;
  if (o && (a = $(r, U([o]))), !a)
    if (e) {
      const c = r.geometry.coordinates, g = e.gridNum, u = e.xOrigin, l = e.yOrigin, m = e.xUnit, x = e.yUnit, y = e.gridCache, d = O(c[0], u, m, g), f = O(c[1], l, x, g), p = y[d] ? y[d][f] ? y[d][f] : [] : [], w = U(p.map((M) => t.features[M]));
      a = $(r, w);
    } else
      a = $(r, t);
  return h && h(a), a ? it(r, a, i) : Tt(r, n, s, i);
}
function O(r, t, e, n) {
  let s = Math.floor((r - t) / e);
  return s < 0 && (s = 0), s >= n && (s = n - 1), s;
}
function Et(r, t) {
  let e = tt(r - t[0]), n = Math.PI * 2, s;
  for (let i = 0; i < t.length; i++) {
    const o = (i + 1) % t.length, h = tt(r - t[o]), a = Math.min(Math.abs(e), Math.abs(h));
    e * h <= 0 && a < n && (n = a, s = i), e = h;
  }
  return s;
}
function tt(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function Ft(r) {
  const t = r.features;
  for (let e = 0; e < t.length; e++) {
    const n = t[e];
    `${n.properties.a.index}`.substring(0, 1) === "b" && `${n.properties.b.index}`.substring(0, 1) === "b" ? t[e] = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            n.geometry.coordinates[0][2],
            n.geometry.coordinates[0][0],
            n.geometry.coordinates[0][1],
            n.geometry.coordinates[0][2]
          ]
        ]
      },
      properties: {
        a: {
          geom: n.properties.c.geom,
          index: n.properties.c.index
        },
        b: {
          geom: n.properties.a.geom,
          index: n.properties.a.index
        },
        c: {
          geom: n.properties.b.geom,
          index: n.properties.b.index
        }
      },
      type: "Feature"
    } : `${n.properties.c.index}`.substring(0, 1) === "b" && `${n.properties.a.index}`.substring(0, 1) === "b" && (t[e] = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            n.geometry.coordinates[0][1],
            n.geometry.coordinates[0][2],
            n.geometry.coordinates[0][0],
            n.geometry.coordinates[0][1]
          ]
        ]
      },
      properties: {
        a: {
          geom: n.properties.b.geom,
          index: n.properties.b.index
        },
        b: {
          geom: n.properties.c.geom,
          index: n.properties.c.index
        },
        c: {
          geom: n.properties.a.geom,
          index: n.properties.a.index
        }
      },
      type: "Feature"
    });
  }
  return r;
}
function Dt(r) {
  const t = ["a", "b", "c", "a"].map(
    (i) => r.properties[i].geom
  ), e = r.geometry.coordinates[0], n = r.properties, s = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return D([t], s);
}
function At(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return D([t], e);
}
function G(r, t, e, n, s, i = !1, o) {
  const h = r.map(
    (a) => {
      (!o || o < 2.00703) && (a = at(a));
      const c = isFinite(a) ? t[a] : a === "c" ? n : (function() {
        const g = a.match(/^b(\d+)$/);
        if (g) return s[parseInt(g[1])];
        const u = a.match(/^e(\d+)$/);
        if (u) return e[parseInt(u[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[c[1], c[0]], a] : [[c[0], c[1]], a];
    }
  );
  return At(h);
}
function at(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function It(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const Z = 2.00703;
function Bt(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function St(r) {
  return {
    points: r.points,
    pointsWeightBuffer: Pt(r),
    strictStatus: Ot(r),
    verticesParams: Rt(r),
    centroid: kt(r),
    edges: It(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Xt(r),
    kinks: Nt(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function Ct(r) {
  const t = Wt(r), e = t.tins;
  return {
    compiled: t,
    tins: e,
    points: Lt(e),
    strictStatus: t.strict_status,
    pointsWeightBuffer: t.weight_buffer,
    verticesParams: t.vertices_params,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Pt(r) {
  return !r.version || r.version < Z ? ["forw", "bakw"].reduce((t, e) => {
    const n = r.weight_buffer[e];
    return n && (t[e] = Object.keys(n).reduce((s, i) => {
      const o = at(i);
      return s[o] = n[i], s;
    }, {})), t;
  }, {}) : r.weight_buffer;
}
function Ot(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function Rt(r) {
  const t = {
    forw: [r.vertices_params[0]],
    bakw: [r.vertices_params[1]]
  };
  return t.forw[1] = rt(r, !1), t.bakw[1] = rt(r, !0), t;
}
function rt(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, s) => {
    const i = (s + 1) % e, o = G(
      ["c", `b${s}`, `b${i}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      Z
    );
    return U([o]);
  });
}
function kt(r) {
  return {
    forw: X(r.centroid_point[0], {
      target: {
        geom: r.centroid_point[1],
        index: "c"
      }
    }),
    bakw: X(r.centroid_point[1], {
      target: {
        geom: r.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Xt(r) {
  const t = r.tins_points.length === 1 ? 0 : 1;
  return {
    forw: U(
      r.tins_points[0].map(
        (e) => G(
          e,
          r.points,
          r.edgeNodes || [],
          r.centroid_point,
          r.vertices_points,
          !1,
          r.version
        )
      )
    ),
    bakw: U(
      r.tins_points[t].map(
        (e) => G(
          e,
          r.points,
          r.edgeNodes || [],
          r.centroid_point,
          r.vertices_points,
          !0,
          r.version
        )
      )
    )
  };
}
function Nt(r) {
  if (r)
    return {
      bakw: U(
        r.map((t) => X(t))
      )
    };
}
function Wt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Lt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    ["a", "b", "c"].forEach((i, o) => {
      const h = s.geometry.coordinates[0][o], a = s.properties[i].geom, c = s.properties[i].index;
      typeof c == "number" && (t[c] = [h, a]);
    });
  }
  return t;
}
const Yt = Z;
class I {
  /**
   * 各種モードの定数定義
   * すべてreadonlyで、型安全性を確保
   */
  static VERTEX_PLAIN = "plain";
  static VERTEX_BIRDEYE = "birdeye";
  static MODE_STRICT = "strict";
  static MODE_AUTO = "auto";
  static MODE_LOOSE = "loose";
  static STATUS_STRICT = "strict";
  static STATUS_ERROR = "strict_error";
  static STATUS_LOOSE = "loose";
  static YAXIS_FOLLOW = "follow";
  static YAXIS_INVERT = "invert";
  points = [];
  pointsWeightBuffer;
  strict_status;
  vertices_params;
  centroid;
  edgeNodes;
  edges;
  tins;
  kinks;
  yaxisMode = I.YAXIS_INVERT;
  strictMode = I.MODE_AUTO;
  vertexMode = I.VERTEX_PLAIN;
  bounds;
  boundsPolygon;
  wh;
  xy;
  indexedTins;
  stateFull = !1;
  stateTriangle;
  stateBackward;
  /**
   * Optional properties for MaplatCore extension
   * These properties allow consuming applications to extend Transform instances
   * with additional metadata without requiring Module Augmentation
   */
  /** Layer priority for rendering order */
  priority;
  /** Layer importance for display decisions */
  importance;
  /** Bounds in XY (source) coordinate system */
  xyBounds;
  /** Bounds in Mercator (Web Mercator) coordinate system */
  mercBounds;
  constructor() {
  }
  /**
   * コンパイルされた設定を適用します
   *
   * @param compiled - コンパイルされた設定オブジェクト
   * @returns 変換に必要な主要なオブジェクトのセット
   *
   * 以下の処理を行います：
   * 1. バージョンに応じた設定の解釈
   * 2. 各種パラメータの復元
   * 3. TINネットワークの再構築
   * 4. インデックスの作成
   */
  setCompiled(t) {
    if (Bt(t)) {
      this.applyModernState(St(t));
      return;
    }
    this.applyLegacyState(Ct(t));
  }
  applyModernState(t) {
    this.points = t.points, this.pointsWeightBuffer = t.pointsWeightBuffer, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? I.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? I.VERTEX_PLAIN, this.strictMode = t.strictMode ?? I.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
  }
  applyLegacyState(t) {
    this.tins = t.tins, this.addIndexedTin(), this.strict_status = t.strictStatus, this.pointsWeightBuffer = t.pointsWeightBuffer, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.kinks = t.kinks, this.points = t.points;
  }
  /**
   * TINネットワークのインデックスを作成します
   *
   * インデックスは変換処理を高速化するために使用されます。
   * グリッド形式のインデックスを作成し、各グリッドに
   * 含まれる三角形を記録します。
   */
  addIndexedTin() {
    const t = this.tins, e = t.forw, n = t.bakw, s = Math.ceil(Math.sqrt(e.features.length));
    if (s < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], o = [];
    const h = e.features.map((y) => {
      let d = [];
      return J(y)[0].map((f) => {
        i.length === 0 ? i = [Array.from(f), Array.from(f)] : (f[0] < i[0][0] && (i[0][0] = f[0]), f[0] > i[1][0] && (i[1][0] = f[0]), f[1] < i[0][1] && (i[0][1] = f[1]), f[1] > i[1][1] && (i[1][1] = f[1])), d.length === 0 ? d = [Array.from(f), Array.from(f)] : (f[0] < d[0][0] && (d[0][0] = f[0]), f[0] > d[1][0] && (d[1][0] = f[0]), f[1] < d[0][1] && (d[0][1] = f[1]), f[1] > d[1][1] && (d[1][1] = f[1]));
      }), d;
    }), a = (i[1][0] - i[0][0]) / s, c = (i[1][1] - i[0][1]) / s, g = h.reduce(
      (y, d, f) => {
        const p = O(d[0][0], i[0][0], a, s), w = O(d[1][0], i[0][0], a, s), M = O(d[0][1], i[0][1], c, s), T = O(d[1][1], i[0][1], c, s);
        for (let b = p; b <= w; b++) {
          y[b] || (y[b] = []);
          for (let _ = M; _ <= T; _++)
            y[b][_] || (y[b][_] = []), y[b][_].push(f);
        }
        return y;
      },
      []
    ), u = n.features.map((y) => {
      let d = [];
      return J(y)[0].map((f) => {
        o.length === 0 ? o = [Array.from(f), Array.from(f)] : (f[0] < o[0][0] && (o[0][0] = f[0]), f[0] > o[1][0] && (o[1][0] = f[0]), f[1] < o[0][1] && (o[0][1] = f[1]), f[1] > o[1][1] && (o[1][1] = f[1])), d.length === 0 ? d = [Array.from(f), Array.from(f)] : (f[0] < d[0][0] && (d[0][0] = f[0]), f[0] > d[1][0] && (d[1][0] = f[0]), f[1] < d[0][1] && (d[0][1] = f[1]), f[1] > d[1][1] && (d[1][1] = f[1]));
      }), d;
    }), l = (o[1][0] - o[0][0]) / s, m = (o[1][1] - o[0][1]) / s, x = u.reduce(
      (y, d, f) => {
        const p = O(d[0][0], o[0][0], l, s), w = O(d[1][0], o[0][0], l, s), M = O(d[0][1], o[0][1], m, s), T = O(d[1][1], o[0][1], m, s);
        for (let b = p; b <= w; b++) {
          y[b] || (y[b] = []);
          for (let _ = M; _ <= T; _++)
            y[b][_] || (y[b][_] = []), y[b][_].push(f);
        }
        return y;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: s,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: a,
        yUnit: c,
        gridCache: g
      },
      bakw: {
        gridNum: s,
        xOrigin: o[0][0],
        yOrigin: o[0][1],
        xUnit: l,
        yUnit: m,
        gridCache: x
      }
    };
  }
  /**
   * 座標変換を実行します
   *
   * @param apoint - 変換する座標
   * @param backward - 逆方向の変換かどうか
   * @param ignoreBounds - 境界チェックを無視するかどうか
   * @returns 変換後の座標、または境界外の場合はfalse
   *
   * @throws {Error} 逆方向変換が許可されていない状態での逆変換時
   */
  transform(t, e, n) {
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (e && this.strict_status == I.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    this.yaxisMode == I.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const s = X(t);
    if (this.bounds && !e && !n && !W(s, this.boundsPolygon))
      return !1;
    const i = e ? this.tins.bakw : this.tins.forw, o = e ? this.indexedTins.bakw : this.indexedTins.forw, h = e ? this.vertices_params.bakw : this.vertices_params.forw, a = e ? this.centroid.bakw : this.centroid.forw, c = e ? this.pointsWeightBuffer.bakw : this.pointsWeightBuffer.forw;
    let g, u;
    this.stateFull && (this.stateBackward == e ? g = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), u = (m) => {
      this.stateTriangle = m;
    });
    let l = vt(
      s,
      i,
      o,
      h,
      a,
      c,
      g,
      u
    );
    if (this.bounds && e && !n) {
      const m = X(l);
      if (!W(m, this.boundsPolygon)) return !1;
    } else this.yaxisMode == I.YAXIS_FOLLOW && !e && (l = [l[0], -1 * l[1]]);
    return l;
  }
}
const R = 20037508342789244e-9, Ut = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
];
function ct(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * R / 128 / Math.pow(2, t);
}
function Vt(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const s = r[n], i = s[0] * Math.cos(t) - s[1] * Math.sin(t), o = s[0] * Math.sin(t) + s[1] * Math.cos(t);
    e.push([i, o]);
  }
  return e;
}
function et(r, t, e, n) {
  const s = ct(n, t);
  return Vt(Ut, e).map((h) => [
    h[0] * s + r[0],
    h[1] * s + r[1]
  ]);
}
function nt(r, t) {
  const e = r[0], s = r.slice(1, 5).map((m) => [
    m[0] - e[0],
    m[1] - e[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let o = 0, h = 0, a = 0;
  for (let m = 0; m < 4; m++) {
    const x = s[m], y = i[m], d = Math.sqrt(Math.pow(x[0], 2) + Math.pow(x[1], 2));
    o += d;
    const f = x[0] * y[1] - x[1] * y[0], p = Math.acos(
      (x[0] * y[0] + x[1] * y[1]) / d
    ), w = f > 0 ? -1 * p : p;
    h += Math.cos(w), a += Math.sin(w);
  }
  const c = o / 4, g = Math.atan2(a, h), u = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(u * R / 128 / c) / Math.log(2);
  return { center: e, zoom: l, rotation: g };
}
function q(r, t) {
  const e = r[0] * (2 * R) / t - R, n = -1 * (r[1] * (2 * R) / t - R);
  return [e, n];
}
function st(r, t) {
  const e = (r[0] + R) * t / (2 * R), n = (-r[1] + R) * t / (2 * R);
  return [e, n];
}
const z = 256;
class $t {
  mainTin = null;
  subTins = [];
  _maxxy = 0;
  // ─── 初期化 ────────────────────────────────────────────────────────────────
  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(t) {
    const e = new I();
    if (e.setCompiled(t.compiled), this.mainTin = e, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * z;
    else if (t.compiled.wh) {
      const n = Math.max(t.compiled.wh[0], t.compiled.wh[1]), s = Math.ceil(Math.log2(n / z));
      this._maxxy = Math.pow(2, s) * z;
    }
    if (this.subTins = [], t.sub_maps)
      for (const n of t.sub_maps) {
        const s = new I();
        s.setCompiled(n.compiled);
        const i = n.bounds ?? n.compiled.bounds;
        if (!i)
          throw new Error(
            "SubMapData must have bounds or compiled.bounds to create xyBounds polygon"
          );
        const o = [...i, i[0]], h = o.map((a) => {
          const c = s.transform(a, !1);
          if (!c) throw new Error("Failed to transform sub-map bounds to mercator");
          return c;
        });
        this.subTins.push({
          tin: s,
          priority: n.priority,
          importance: n.importance,
          xyBounds: D([o]),
          mercBounds: D([h])
        });
      }
  }
  // ─── 処理2: submap TIN 選択付き変換 ───────────────────────────────────────
  /**
   * ピクセル座標 → メルカトル座標（最適レイヤー選択）
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns メルカトル座標、または範囲外の場合は false
   */
  xy2Merc(t) {
    const e = this.xy2MercWithLayer(t);
    return e ? e[1] : !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（最適レイヤー選択）
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns ピクセル座標、または範囲外の場合は false
   */
  merc2Xy(t) {
    const e = this.merc2XyWithLayer(t), n = e[0] || e[1];
    return n ? n[1] : !1;
  }
  /**
   * ピクセル座標 → メルカトル座標（レイヤーID付き）
   * histmap_tin.ts xy2MercAsync_returnLayer() の同期版
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns [レイヤーインデックス, メルカトル座標] または false
   */
  xy2MercWithLayer(t) {
    this._assertMapData();
    const e = this._getTinsSortedByPriority();
    for (let n = 0; n < e.length; n++) {
      const { index: s, isMain: i } = e[n];
      if (i || W(X(t), this.subTins[s - 1].xyBounds)) {
        const o = this._transformByIndex(t, s, !1);
        if (o === !1) continue;
        return [s, o];
      }
    }
    return !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（複数レイヤー結果）
   * histmap_tin.ts merc2XyAsync_returnLayer() の同期版
   *
   * 現在は MaplatCore の仕様に合わせ、最大2レイヤーまで返す。
   * 3レイヤー以上返したい場合は、下記の .slice(0, 2) および .filter(i < 2) の
   * 上限値を増やすか、引数で上限を指定できるようにすること。
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns 最大2要素の配列。各要素は [レイヤーインデックス, ピクセル座標] または undefined
   */
  merc2XyWithLayer(t) {
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: o, tin: h, isMain: a }) => {
      const c = this._transformByIndex(t, o, !0);
      return c === !1 ? [h, o] : a || W(X(c), this.subTins[o - 1].xyBounds) ? [h, o, c] : [h, o];
    }).sort((o, h) => {
      const a = o[0].priority ?? 0, c = h[0].priority ?? 0;
      return a < c ? 1 : -1;
    }).reduce(
      (o, h, a, c) => {
        const g = h[0], u = h[1], l = h[2];
        if (!l) return o;
        for (let m = 0; m < a; m++) {
          const x = c[m][1], y = x === 0;
          if (c[m][2] && (y || W(X(l), this.subTins[x - 1].xyBounds)))
            if (o.length) {
              const d = !o[0], f = d ? o[1][2] : o[0][2], p = g.importance ?? 0, w = f.importance ?? 0;
              return d ? p < w ? o : [void 0, [u, l, g]] : [...o.filter(
                (b) => b !== void 0
              ), [u, l, g]].sort(
                (b, _) => (b[2].importance ?? 0) < (_[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[u, l, g]];
        }
        return !o.length || !o[0] ? [[u, l, g]] : (o.push([u, l, g]), o.sort((m, x) => {
          const y = m[2].importance ?? 0, d = x[2].importance ?? 0;
          return y < d ? 1 : -1;
        }).filter((m, x) => x < 2));
      },
      []
    ).map((o) => {
      if (o)
        return [o[0], o[1]];
    });
  }
  /**
   * メルカトル座標 → 覆われていない対応層の一覧（GPS / POI の表示候補用）
   *
   * `merc2XyWithLayer` は視点換算・一般座標変換用で、本図を常に候補に含める。
   * GPS マーカー・POI ピンをどの層に描くかの判定には本メソッドを使う（MaplatTransform#9）。
   *
   * 1. 各層の TIN で逆変換し、sub_map は自身の `xyBounds` 内に入るものだけを対応層とする。
   *    本図（層 0）は紙の内外を判定せず常に対応層の候補とする（紙外の除外は呼び出し側が行う）
   * 2. 対応層の座標が、より priority の高い sub_map の `xyBounds` 内なら覆われている。
   *    その高 priority 層自身が当該地点に対応するかは関係しない。
   *    本図は priority 0 の sub_map の `xyBounds` 内でも覆われている
   * 3. 同じ priority の sub_map どうしは互いを覆わない
   * 4. 覆われていない対応層を importance 降順 → priority 降順 → 層番号昇順で並べ、上限を切らずに全件返す
   * 5. 覆われていない対応層が無ければ空配列（表現範囲外）。`undefined`（旧 hide 表現）は返さない
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns [レイヤーインデックス, ピクセル座標] の配列（0 件以上・上限なし）
   */
  merc2XyVisibleLayers(t) {
    this._assertMapData();
    const e = this._getAllTinsWithIndex(), n = (a) => a === 0 ? 0 : this.subTins[a - 1].priority ?? 0, s = (a) => a === 0 ? 0 : this.subTins[a - 1].importance ?? 0, i = (a, c) => a === 0 || W(X(c), this.subTins[a - 1].xyBounds), o = [];
    for (const { index: a } of e) {
      const c = this._transformByIndex(t, a, !0);
      c !== !1 && i(a, c) && o.push({ index: a, xy: c });
    }
    const h = (a) => e.some(
      ({ index: c }) => c !== 0 && c !== a.index && (n(c) > n(a.index) || a.index === 0 && n(c) === 0) && i(c, a.xy)
    );
    return o.filter((a) => !h(a)).sort((a, c) => s(c.index) - s(a.index) || n(c.index) - n(a.index) || a.index - c.index).map((a) => [a.index, a.xy]);
  }
  /**
   * メルカトル5点 → システム座標（複数レイヤー）
   * histmap_tin.ts mercs2SysCoordsAsync_multiLayer() の同期版
   *
   * @param mercs - 5点のメルカトル座標配列（中心＋上下左右）
   * @returns 各レイヤーのシステム座標配列（または undefined）
   */
  mercs2SysCoords(t) {
    this._assertMapData();
    const e = this.merc2XyWithLayer(t[0]);
    let n = !1;
    return e.map((s, i) => {
      if (!s) {
        n = !0;
        return;
      }
      const o = s[0], h = s[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(h)] : t.map((c, g) => g === 0 ? h : this._transformByIndex(c, o, !0)).map((c) => this.xy2SysCoordInternal(c));
    });
  }
  // ─── 処理3: ビューポート変換 ───────────────────────────────────────────────
  /**
   * ビューポート → TIN 適用後メルカトル5点
   * histmap_tin.ts viewpoint2MercsAsync() の同期版
   *
   * @param viewpoint - ビューポート（center, zoom, rotation）
   * @param size - 画面サイズ [width, height]
   * @returns TIN 変換後のメルカトル5点
   */
  viewpoint2Mercs(t, e) {
    this._assertMapData(), this._assertMaxxy();
    const s = et(t.center, t.zoom, t.rotation, e).map((c) => st(c, this._maxxy)), i = this.xy2MercWithLayer(s[0]);
    if (!i) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const o = i[0], h = i[1];
    return s.map((c, g) => {
      if (g === 0) return h;
      const u = this._transformByIndex(c, o, !1);
      if (u === !1) throw new Error(`viewpoint2Mercs: point ${g} is out of bounds`);
      return u;
    });
  }
  /**
   * TIN 適用後メルカトル5点 → ビューポート
   * histmap_tin.ts mercs2ViewpointAsync() の同期版
   *
   * @param mercs - TIN 変換後のメルカトル5点
   * @param size - 画面サイズ [width, height]
   * @returns ビューポート（center, zoom, rotation）
   */
  mercs2Viewpoint(t, e) {
    this._assertMapData(), this._assertMaxxy();
    const n = this.merc2XyWithLayer(t[0]), s = n[0] || n[1];
    if (!s) throw new Error("mercs2Viewpoint: center point is out of bounds");
    const i = s[0], o = s[1], a = t.map((c, g) => {
      if (g === 0) return o;
      const u = this._transformByIndex(c, i, !0);
      if (u === !1) throw new Error(`mercs2Viewpoint: point ${g} is out of bounds`);
      return u;
    }).map((c) => q(c, this._maxxy));
    return nt(a, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return ct(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, s) {
    return et(t, e, n, s);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return nt(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return q(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return st(t, e);
  }
  // ─── 内部ヘルパー ──────────────────────────────────────────────────────────
  _assertMapData() {
    if (!this.mainTin)
      throw new Error("setMapData() must be called before transformation");
  }
  _assertMaxxy() {
    if (this._maxxy === 0)
      throw new Error(
        "MapData.maxZoom or compiled.wh must be set for viewpoint conversion (xy2SysCoord / sysCoord2Xy)"
      );
  }
  /**
   * レイヤーインデックスに対応する Transform インスタンスを返す（三角網描画などの用途）
   *
   * @param idx - 0 = メイン TIN、1以上 = sub_maps[idx-1]
   * @returns 対応する Transform、または範囲外の場合は null
   */
  getLayerTransform(t) {
    if (t === 0) return this.mainTin;
    const e = this.subTins[t - 1];
    return e ? e.tin : null;
  }
  /** レイヤー数を返す（メイン + sub 数） */
  get layerCount() {
    return 1 + this.subTins.length;
  }
  /**
   * viewpoint 変換に使用する最大ピクセル幅（2^maxZoom × 256）
   * stateToViewpoint / viewpointToState で zoom ↔ scale 変換に使用する
   * zoom = log2(scale × maxxy / 256) の関係
   */
  get maxxy() {
    return this._maxxy;
  }
  /** priority 降順でソートした [index, tin, isMain] の配列を返す */
  _getTinsSortedByPriority() {
    return this._getAllTinsWithIndex().sort((e, n) => {
      const s = e.tin.priority ?? 0, i = n.tin.priority ?? 0;
      return s < i ? 1 : -1;
    });
  }
  /** メイン TIN + 全 sub TIN を index 付きで返す */
  _getAllTinsWithIndex() {
    const t = [
      { index: 0, tin: this.mainTin, isMain: !0 }
    ];
    return this.subTins.forEach((e, n) => {
      e.tin.priority = e.priority, e.tin.importance = e.importance, t.push({ index: n + 1, tin: e.tin, isMain: !1 });
    }), t;
  }
  /**
   * 指定レイヤーインデックスで TIN 変換を実行する
   * index 0 → mainTin, index 1..n → subTins[index-1]
   */
  _transformByIndex(t, e, n) {
    if (e === 0)
      return this.mainTin.transform(t, n);
    const s = this.subTins[e - 1];
    return s ? s.tin.transform(t, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return q(t, this._maxxy);
  }
}
export {
  Ut as MERC_CROSSMATRIX,
  R as MERC_MAX,
  $t as MapTransform,
  I as Transform,
  Dt as counterTri,
  Yt as format_version,
  et as mercViewpoint2Mercs,
  nt as mercs2MercViewpoint,
  It as normalizeEdges,
  Vt as rotateMatrix,
  Ft as rotateVerticesTriangle,
  st as sysCoord2Xy,
  vt as transformArr,
  q as xy2SysCoord,
  ct as zoom2Radius
};
