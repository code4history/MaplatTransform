var at = Object.defineProperty;
var ct = (t, e, r) => e in t ? at(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var p = (t, e, r) => ct(t, typeof e != "symbol" ? e + "" : e, r);
function tt(t, e, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = e || {}, n.geometry = t, n;
}
function W(t, e, r = {}) {
  if (!t)
    throw new Error("coordinates is required");
  if (!Array.isArray(t))
    throw new Error("coordinates must be an Array");
  if (t.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!q(t[0]) || !q(t[1]))
    throw new Error("coordinates must contain numbers");
  return tt({
    type: "Point",
    coordinates: t
  }, e, r);
}
function et(t, e, r = {}) {
  for (const c of t) {
    if (c.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (c[c.length - 1].length !== c[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let i = 0; i < c[c.length - 1].length; i++)
      if (c[c.length - 1][i] !== c[0][i])
        throw new Error("First and last Position are not equivalent.");
  }
  return tt({
    type: "Polygon",
    coordinates: t
  }, e, r);
}
function F(t, e = {}) {
  const r = { type: "FeatureCollection" };
  return e.id && (r.id = e.id), e.bbox && (r.bbox = e.bbox), r.features = t, r;
}
function q(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function ut(t) {
  if (!t)
    throw new Error("coord is required");
  if (!Array.isArray(t)) {
    if (t.type === "Feature" && t.geometry !== null && t.geometry.type === "Point")
      return [...t.geometry.coordinates];
    if (t.type === "Point")
      return [...t.coordinates];
  }
  if (Array.isArray(t) && t.length >= 2 && !Array.isArray(t[0]) && !Array.isArray(t[1]))
    return [...t];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function z(t) {
  if (Array.isArray(t))
    return t;
  if (t.type === "Feature") {
    if (t.geometry !== null)
      return t.geometry.coordinates;
  } else if (t.coordinates)
    return t.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function ft(t) {
  return t.type === "Feature" ? t.geometry : t;
}
const R = 11102230246251565e-32, O = 134217729, dt = (3 + 8 * R) * R;
function V(t, e, r, n, c) {
  let i, f, g, h, l = e[0], y = n[0], o = 0, u = 0;
  y > l == y > -l ? (i = l, l = e[++o]) : (i = y, y = n[++u]);
  let b = 0;
  if (o < t && u < r)
    for (y > l == y > -l ? (f = l + i, g = i - (f - l), l = e[++o]) : (f = y + i, g = i - (f - y), y = n[++u]), i = f, g !== 0 && (c[b++] = g); o < t && u < r; )
      y > l == y > -l ? (f = i + l, h = f - i, g = i - (f - h) + (l - h), l = e[++o]) : (f = i + y, h = f - i, g = i - (f - h) + (y - h), y = n[++u]), i = f, g !== 0 && (c[b++] = g);
  for (; o < t; )
    f = i + l, h = f - i, g = i - (f - h) + (l - h), l = e[++o], i = f, g !== 0 && (c[b++] = g);
  for (; u < r; )
    f = i + y, h = f - i, g = i - (f - h) + (y - h), y = n[++u], i = f, g !== 0 && (c[b++] = g);
  return (i !== 0 || b === 0) && (c[b++] = i), b;
}
function ht(t, e) {
  let r = e[0];
  for (let n = 1; n < t; n++) r += e[n];
  return r;
}
function Y(t) {
  return new Float64Array(t);
}
const gt = (3 + 16 * R) * R, lt = (2 + 12 * R) * R, yt = (9 + 64 * R) * R * R, U = Y(4), G = Y(8), j = Y(12), J = Y(16), S = Y(4);
function bt(t, e, r, n, c, i, f) {
  let g, h, l, y, o, u, b, x, d, a, s, m, v, M, _, w, A, P;
  const k = t - c, I = r - c, T = e - i, N = n - i;
  M = k * N, u = O * k, b = u - (u - k), x = k - b, u = O * N, d = u - (u - N), a = N - d, _ = x * a - (M - b * d - x * d - b * a), w = T * I, u = O * T, b = u - (u - T), x = T - b, u = O * I, d = u - (u - I), a = I - d, A = x * a - (w - b * d - x * d - b * a), s = _ - A, o = _ - s, U[0] = _ - (s + o) + (o - A), m = M + s, o = m - M, v = M - (m - o) + (s - o), s = v - w, o = v - s, U[1] = v - (s + o) + (o - w), P = m + s, o = P - m, U[2] = m - (P - o) + (s - o), U[3] = P;
  let C = ht(4, U), X = lt * f;
  if (C >= X || -C >= X || (o = t - k, g = t - (k + o) + (o - c), o = r - I, l = r - (I + o) + (o - c), o = e - T, h = e - (T + o) + (o - i), o = n - N, y = n - (N + o) + (o - i), g === 0 && h === 0 && l === 0 && y === 0) || (X = yt * f + dt * Math.abs(C), C += k * y + N * g - (T * l + I * h), C >= X || -C >= X)) return C;
  M = g * N, u = O * g, b = u - (u - g), x = g - b, u = O * N, d = u - (u - N), a = N - d, _ = x * a - (M - b * d - x * d - b * a), w = h * I, u = O * h, b = u - (u - h), x = h - b, u = O * I, d = u - (u - I), a = I - d, A = x * a - (w - b * d - x * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = M + s, o = m - M, v = M - (m - o) + (s - o), s = v - w, o = v - s, S[1] = v - (s + o) + (o - w), P = m + s, o = P - m, S[2] = m - (P - o) + (s - o), S[3] = P;
  const it = V(4, U, 4, S, G);
  M = k * y, u = O * k, b = u - (u - k), x = k - b, u = O * y, d = u - (u - y), a = y - d, _ = x * a - (M - b * d - x * d - b * a), w = T * l, u = O * T, b = u - (u - T), x = T - b, u = O * l, d = u - (u - l), a = l - d, A = x * a - (w - b * d - x * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = M + s, o = m - M, v = M - (m - o) + (s - o), s = v - w, o = v - s, S[1] = v - (s + o) + (o - w), P = m + s, o = P - m, S[2] = m - (P - o) + (s - o), S[3] = P;
  const st = V(it, G, 4, S, j);
  M = g * y, u = O * g, b = u - (u - g), x = g - b, u = O * y, d = u - (u - y), a = y - d, _ = x * a - (M - b * d - x * d - b * a), w = h * l, u = O * h, b = u - (u - h), x = h - b, u = O * l, d = u - (u - l), a = l - d, A = x * a - (w - b * d - x * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = M + s, o = m - M, v = M - (m - o) + (s - o), s = v - w, o = v - s, S[1] = v - (s + o) + (o - w), P = m + s, o = P - m, S[2] = m - (P - o) + (s - o), S[3] = P;
  const ot = V(st, j, 4, S, J);
  return J[ot - 1];
}
function mt(t, e, r, n, c, i) {
  const f = (e - i) * (r - c), g = (t - c) * (n - i), h = f - g, l = Math.abs(f + g);
  return Math.abs(h) >= gt * l ? h : -bt(t, e, r, n, c, i, l);
}
function wt(t, e) {
  var r, n, c = 0, i, f, g, h, l, y, o, u = t[0], b = t[1], x = e.length;
  for (r = 0; r < x; r++) {
    n = 0;
    var d = e[r], a = d.length - 1;
    if (y = d[0], y[0] !== d[a][0] && y[1] !== d[a][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (f = y[0] - u, g = y[1] - b, n; n < a; n++) {
      if (o = d[n + 1], h = o[0] - u, l = o[1] - b, g === 0 && l === 0) {
        if (h <= 0 && f >= 0 || f <= 0 && h >= 0)
          return 0;
      } else if (l >= 0 && g <= 0 || l <= 0 && g >= 0) {
        if (i = mt(f, h, g, l, 0, 0), i === 0)
          return 0;
        (i > 0 && l > 0 && g <= 0 || i < 0 && l <= 0 && g > 0) && c++;
      }
      y = o, g = l, f = h;
    }
  }
  return c % 2 !== 0;
}
function L(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = ut(t), c = ft(e), i = c.type, f = e.bbox;
  let g = c.coordinates;
  if (f && xt(n, f) === !1)
    return !1;
  i === "Polygon" && (g = [g]);
  let h = !1;
  for (var l = 0; l < g.length; ++l) {
    const y = wt(n, g[l]);
    if (y === 0) return !r.ignoreBoundary;
    y && (h = !0);
  }
  return h;
}
function xt(t, e) {
  return e[0] <= t[0] && e[1] <= t[1] && e[2] >= t[0] && e[3] >= t[1];
}
function K(t, e) {
  for (let r = 0; r < e.features.length; r++)
    if (L(t, e.features[r]))
      return e.features[r];
}
function rt(t, e, r) {
  const n = e.geometry.coordinates[0][0], c = e.geometry.coordinates[0][1], i = e.geometry.coordinates[0][2], f = t.geometry.coordinates, g = e.properties.a.geom, h = e.properties.b.geom, l = e.properties.c.geom, y = [c[0] - n[0], c[1] - n[1]], o = [i[0] - n[0], i[1] - n[1]], u = [f[0] - n[0], f[1] - n[1]], b = [h[0] - g[0], h[1] - g[1]], x = [l[0] - g[0], l[1] - g[1]];
  let d = (o[1] * u[0] - o[0] * u[1]) / (y[0] * o[1] - y[1] * o[0]), a = (y[0] * u[1] - y[1] * u[0]) / (y[0] * o[1] - y[1] * o[0]);
  if (r) {
    const s = r[e.properties.a.index], m = r[e.properties.b.index], v = r[e.properties.c.index];
    let M;
    if (d < 0 || a < 0 || 1 - d - a < 0) {
      const _ = d / (d + a), w = a / (d + a);
      M = d / m / (_ / m + w / v), a = a / v / (_ / m + w / v);
    } else
      M = d / m / (d / m + a / v + (1 - d - a) / s), a = a / v / (d / m + a / v + (1 - d - a) / s);
    d = M;
  }
  return [
    d * b[0] + a * x[0] + g[0],
    d * b[1] + a * x[1] + g[1]
  ];
}
function pt(t, e, r, n) {
  const c = t.geometry.coordinates, i = r.geometry.coordinates, f = Math.atan2(c[0] - i[0], c[1] - i[1]), g = Mt(f, e[0]);
  if (g === void 0)
    throw new Error("Unable to determine vertex index");
  const h = e[1][g];
  return rt(t, h.features[0], n);
}
function vt(t, e, r, n, c, i, f, g) {
  let h;
  if (f && (h = K(t, F([f]))), !h) {
    if (r) {
      const l = t.geometry.coordinates, y = r.gridNum, o = r.xOrigin, u = r.yOrigin, b = r.xUnit, x = r.yUnit, d = r.gridCache, a = B(l[0], o, b, y), s = B(l[1], u, x, y), m = d[a] ? d[a][s] ? d[a][s] : [] : [];
      e = F(m.map((v) => e.features[v]));
    }
    h = K(t, e);
  }
  return g && g(h), h ? rt(t, h, i) : pt(t, n, c, i);
}
function B(t, e, r, n) {
  let c = Math.floor((t - e) / r);
  return c >= n && (c = n - 1), c;
}
function Mt(t, e) {
  let r = Q(t - e[0]), n = Math.PI * 2, c;
  for (let i = 0; i < e.length; i++) {
    const f = (i + 1) % e.length, g = Q(t - e[f]), h = Math.min(Math.abs(r), Math.abs(g));
    r * g <= 0 && h < n && (n = h, c = i), r = g;
  }
  return c;
}
function Q(t, e = !1) {
  const r = e ? function(n) {
    return !(n >= 0 && n < Math.PI * 2);
  } : function(n) {
    return !(n > -1 * Math.PI && n <= Math.PI);
  };
  for (; r(t); )
    t = t + 2 * Math.PI * (t > 0 ? -1 : 1);
  return t;
}
function At(t, e) {
  return e && e >= 2.00703 || Array.isArray(t[0]) ? t : t.map((r) => [
    r.illstNodes,
    r.mercNodes,
    r.startEnd
  ]);
}
function Ft(t) {
  const e = t.features;
  for (let r = 0; r < e.length; r++) {
    const n = e[r];
    `${n.properties.a.index}`.substring(0, 1) === "b" && `${n.properties.b.index}`.substring(0, 1) === "b" ? e[r] = {
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
    } : `${n.properties.c.index}`.substring(0, 1) === "b" && `${n.properties.a.index}`.substring(0, 1) === "b" && (e[r] = {
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
  return t;
}
function Xt(t) {
  const e = ["a", "b", "c", "a"].map(
    (i) => t.properties[i].geom
  ), r = t.geometry.coordinates[0], n = t.properties, c = {
    a: { geom: r[0], index: n.a.index },
    b: { geom: r[1], index: n.b.index },
    c: { geom: r[2], index: n.c.index }
  };
  return et([e], c);
}
function _t(t) {
  const e = [0, 1, 2, 0].map((n) => t[n][0][0]), r = {
    a: { geom: t[0][0][1], index: t[0][1] },
    b: { geom: t[1][0][1], index: t[1][1] },
    c: { geom: t[2][0][1], index: t[2][1] }
  };
  return et([e], r);
}
function $(t, e, r, n, c, i = !1, f) {
  const g = t.map(
    (h) => {
      (!f || f < 2.00703) && (h = nt(h));
      const l = isFinite(h) ? e[h] : h === "c" ? n : h === "b0" ? c[0] : h === "b1" ? c[1] : h === "b2" ? c[2] : h === "b3" ? c[3] : function() {
        const y = h.match(/e(\d+)/);
        if (y) {
          const o = parseInt(y[1]);
          return r[o];
        }
        throw "Bad index value for indexesToTri";
      }();
      return i ? [[l[1], l[0]], h] : [[l[0], l[1]], h];
    }
  );
  return _t(g);
}
function nt(t) {
  return typeof t == "number" ? t : t.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
const D = 2.00703;
function Et(t) {
  return !!(t.version || !t.tins && t.points && t.tins_points);
}
function Pt(t) {
  return {
    points: t.points,
    pointsWeightBuffer: St(t),
    strictStatus: kt(t),
    verticesParams: It(t),
    centroid: Tt(t),
    edges: At(t.edges || []),
    edgeNodes: t.edgeNodes || [],
    tins: Nt(t),
    kinks: Bt(t.kinks_points),
    yaxisMode: t.yaxisMode ?? "invert",
    strictMode: t.strictMode ?? "auto",
    vertexMode: t.vertexMode,
    bounds: t.bounds,
    boundsPolygon: t.boundsPolygon,
    wh: t.wh,
    xy: t.bounds ? t.xy : [0, 0]
  };
}
function Ot(t) {
  const e = Ct(t), r = e.tins;
  return {
    compiled: e,
    tins: r,
    points: Rt(r),
    strictStatus: e.strict_status,
    pointsWeightBuffer: e.weight_buffer,
    verticesParams: e.vertices_params,
    centroid: e.centroid,
    kinks: e.kinks
  };
}
function St(t) {
  return !t.version || t.version < D ? ["forw", "bakw"].reduce((e, r) => {
    const n = t.weight_buffer[r];
    return n && (e[r] = Object.keys(n).reduce((c, i) => {
      const f = nt(i);
      return c[f] = n[i], c;
    }, {})), e;
  }, {}) : t.weight_buffer;
}
function kt(t) {
  return t.strict_status ? t.strict_status : t.kinks_points ? "strict_error" : t.tins_points.length === 2 ? "loose" : "strict";
}
function It(t) {
  const e = {
    forw: [t.vertices_params[0]],
    bakw: [t.vertices_params[1]]
  };
  return e.forw[1] = H(t, !1), e.bakw[1] = H(t, !0), e;
}
function H(t, e) {
  return [0, 1, 2, 3].map((r) => {
    const n = (r + 1) % 4, c = $(
      ["c", `b${r}`, `b${n}`],
      t.points,
      t.edgeNodes || [],
      t.centroid_point,
      t.vertices_points,
      e,
      D
    );
    return F([c]);
  });
}
function Tt(t) {
  return {
    forw: W(t.centroid_point[0], {
      target: {
        geom: t.centroid_point[1],
        index: "c"
      }
    }),
    bakw: W(t.centroid_point[1], {
      target: {
        geom: t.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Nt(t) {
  const e = t.tins_points.length === 1 ? 0 : 1;
  return {
    forw: F(
      t.tins_points[0].map(
        (r) => $(
          r,
          t.points,
          t.edgeNodes || [],
          t.centroid_point,
          t.vertices_points,
          !1,
          t.version
        )
      )
    ),
    bakw: F(
      t.tins_points[e].map(
        (r) => $(
          r,
          t.points,
          t.edgeNodes || [],
          t.centroid_point,
          t.vertices_points,
          !0,
          t.version
        )
      )
    )
  };
}
function Bt(t) {
  if (t)
    return {
      bakw: F(
        t.map((e) => W(e))
      )
    };
}
function Ct(t) {
  return JSON.parse(
    JSON.stringify(t).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Rt(t) {
  const e = [], r = t.forw.features;
  for (let n = 0; n < r.length; n++) {
    const c = r[n];
    ["a", "b", "c"].map((i, f) => {
      const g = c.geometry.coordinates[0][f], h = c.properties[i].geom, l = c.properties[i].index;
      typeof l == "number" && (e[l] = [g, h]);
    });
  }
  return e;
}
const Wt = D, E = class E {
  constructor() {
    p(this, "points", []);
    p(this, "pointsWeightBuffer");
    p(this, "strict_status");
    p(this, "vertices_params");
    p(this, "centroid");
    p(this, "edgeNodes");
    p(this, "edges");
    p(this, "tins");
    p(this, "kinks");
    p(this, "yaxisMode", E.YAXIS_INVERT);
    p(this, "strictMode", E.MODE_AUTO);
    p(this, "vertexMode", E.VERTEX_PLAIN);
    p(this, "bounds");
    p(this, "boundsPolygon");
    p(this, "wh");
    p(this, "xy");
    p(this, "indexedTins");
    p(this, "stateFull", !1);
    p(this, "stateTriangle");
    p(this, "stateBackward");
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
  setCompiled(e) {
    if (Et(e)) {
      this.applyModernState(Pt(e));
      return;
    }
    this.applyLegacyState(Ot(e));
  }
  applyModernState(e) {
    this.points = e.points, this.pointsWeightBuffer = e.pointsWeightBuffer, this.strict_status = e.strictStatus, this.vertices_params = e.verticesParams, this.centroid = e.centroid, this.edges = e.edges, this.edgeNodes = e.edgeNodes || [], this.tins = e.tins, this.addIndexedTin(), this.kinks = e.kinks, this.yaxisMode = e.yaxisMode ?? E.YAXIS_INVERT, this.vertexMode = e.vertexMode ?? E.VERTEX_PLAIN, this.strictMode = e.strictMode ?? E.MODE_AUTO, e.bounds ? (this.bounds = e.bounds, this.boundsPolygon = e.boundsPolygon, this.xy = e.xy, this.wh = e.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = e.xy ?? [0, 0], e.wh && (this.wh = e.wh));
  }
  applyLegacyState(e) {
    this.tins = e.tins, this.addIndexedTin(), this.strict_status = e.strictStatus, this.pointsWeightBuffer = e.pointsWeightBuffer, this.vertices_params = e.verticesParams, this.centroid = e.centroid, this.kinks = e.kinks, this.points = e.points;
  }
  /**
   * TINネットワークのインデックスを作成します
   * 
   * インデックスは変換処理を高速化するために使用されます。
   * グリッド形式のインデックスを作成し、各グリッドに
   * 含まれる三角形を記録します。
   */
  addIndexedTin() {
    const e = this.tins, r = e.forw, n = e.bakw, c = Math.ceil(Math.sqrt(r.features.length));
    if (c < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], f = [];
    const g = r.features.map((d) => {
      let a = [];
      return z(d)[0].map((s) => {
        i.length === 0 ? i = [Array.from(s), Array.from(s)] : (s[0] < i[0][0] && (i[0][0] = s[0]), s[0] > i[1][0] && (i[1][0] = s[0]), s[1] < i[0][1] && (i[0][1] = s[1]), s[1] > i[1][1] && (i[1][1] = s[1])), a.length === 0 ? a = [Array.from(s), Array.from(s)] : (s[0] < a[0][0] && (a[0][0] = s[0]), s[0] > a[1][0] && (a[1][0] = s[0]), s[1] < a[0][1] && (a[0][1] = s[1]), s[1] > a[1][1] && (a[1][1] = s[1]));
      }), a;
    }), h = (i[1][0] - i[0][0]) / c, l = (i[1][1] - i[0][1]) / c, y = g.reduce(
      (d, a, s) => {
        const m = B(
          a[0][0],
          i[0][0],
          h,
          c
        ), v = B(
          a[1][0],
          i[0][0],
          h,
          c
        ), M = B(
          a[0][1],
          i[0][1],
          l,
          c
        ), _ = B(
          a[1][1],
          i[0][1],
          l,
          c
        );
        for (let w = m; w <= v; w++) {
          d[w] || (d[w] = []);
          for (let A = M; A <= _; A++)
            d[w][A] || (d[w][A] = []), d[w][A].push(s);
        }
        return d;
      },
      []
    ), o = n.features.map((d) => {
      let a = [];
      return z(d)[0].map((s) => {
        f.length === 0 ? f = [Array.from(s), Array.from(s)] : (s[0] < f[0][0] && (f[0][0] = s[0]), s[0] > f[1][0] && (f[1][0] = s[0]), s[1] < f[0][1] && (f[0][1] = s[1]), s[1] > f[1][1] && (f[1][1] = s[1])), a.length === 0 ? a = [Array.from(s), Array.from(s)] : (s[0] < a[0][0] && (a[0][0] = s[0]), s[0] > a[1][0] && (a[1][0] = s[0]), s[1] < a[0][1] && (a[0][1] = s[1]), s[1] > a[1][1] && (a[1][1] = s[1]));
      }), a;
    }), u = (f[1][0] - f[0][0]) / c, b = (f[1][1] - f[0][1]) / c, x = o.reduce(
      (d, a, s) => {
        const m = B(
          a[0][0],
          f[0][0],
          u,
          c
        ), v = B(
          a[1][0],
          f[0][0],
          u,
          c
        ), M = B(
          a[0][1],
          f[0][1],
          b,
          c
        ), _ = B(
          a[1][1],
          f[0][1],
          b,
          c
        );
        for (let w = m; w <= v; w++) {
          d[w] || (d[w] = []);
          for (let A = M; A <= _; A++)
            d[w][A] || (d[w][A] = []), d[w][A].push(s);
        }
        return d;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: c,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: h,
        yUnit: l,
        gridCache: y
      },
      bakw: {
        gridNum: c,
        xOrigin: f[0][0],
        yOrigin: f[0][1],
        xUnit: u,
        yUnit: b,
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
  transform(e, r, n) {
    if (r && this.strict_status == E.STATUS_ERROR)
      throw 'Backward transform is not allowed if strict_status == "strict_error"';
    this.yaxisMode == E.YAXIS_FOLLOW && r && (e = [e[0], -1 * e[1]]);
    const c = W(e);
    if (this.bounds && !r && !n && !L(c, this.boundsPolygon))
      return !1;
    const i = r ? this.tins.bakw : this.tins.forw, f = r ? this.indexedTins.bakw : this.indexedTins.forw, g = r ? this.vertices_params.bakw : this.vertices_params.forw, h = r ? this.centroid.bakw : this.centroid.forw, l = r ? this.pointsWeightBuffer.bakw : this.pointsWeightBuffer.forw;
    let y, o;
    this.stateFull && (this.stateBackward == r ? y = this.stateTriangle : (this.stateBackward = r, this.stateTriangle = void 0), o = (b) => {
      this.stateTriangle = b;
    });
    let u = vt(
      c,
      i,
      f,
      g,
      h,
      l,
      y,
      o
    );
    if (this.bounds && r && !n) {
      const b = W(u);
      if (!L(b, this.boundsPolygon)) return !1;
    } else this.yaxisMode == E.YAXIS_FOLLOW && !r && (u = [u[0], -1 * u[1]]);
    return u;
  }
};
/**
 * 各種モードの定数定義
 * すべてreadonlyで、型安全性を確保
 */
p(E, "VERTEX_PLAIN", "plain"), p(E, "VERTEX_BIRDEYE", "birdeye"), p(E, "MODE_STRICT", "strict"), p(E, "MODE_AUTO", "auto"), p(E, "MODE_LOOSE", "loose"), p(E, "STATUS_STRICT", "strict"), p(E, "STATUS_ERROR", "strict_error"), p(E, "STATUS_LOOSE", "loose"), p(E, "YAXIS_FOLLOW", "follow"), p(E, "YAXIS_INVERT", "invert");
let Z = E;
export {
  Z as Transform,
  Xt as counterTri,
  Wt as format_version,
  At as normalizeEdges,
  Ft as rotateVerticesTriangle,
  vt as transformArr
};
