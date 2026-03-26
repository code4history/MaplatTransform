var at = Object.defineProperty;
var ct = (t, e, r) => e in t ? at(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var x = (t, e, r) => ct(t, typeof e != "symbol" ? e + "" : e, r);
function tt(t, e, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = e || {}, n.geometry = t, n;
}
function X(t, e, r = {}) {
  if (!t)
    throw new Error("coordinates is required");
  if (!Array.isArray(t))
    throw new Error("coordinates must be an Array");
  if (t.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!z(t[0]) || !z(t[1]))
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
function z(t) {
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
function G(t) {
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
const R = 11102230246251565e-32, P = 134217729, dt = (3 + 8 * R) * R;
function V(t, e, r, n, c) {
  let i, u, g, h, l = e[0], y = n[0], o = 0, f = 0;
  y > l == y > -l ? (i = l, l = e[++o]) : (i = y, y = n[++f]);
  let b = 0;
  if (o < t && f < r)
    for (y > l == y > -l ? (u = l + i, g = i - (u - l), l = e[++o]) : (u = y + i, g = i - (u - y), y = n[++f]), i = u, g !== 0 && (c[b++] = g); o < t && f < r; )
      y > l == y > -l ? (u = i + l, h = u - i, g = i - (u - h) + (l - h), l = e[++o]) : (u = i + y, h = u - i, g = i - (u - h) + (y - h), y = n[++f]), i = u, g !== 0 && (c[b++] = g);
  for (; o < t; )
    u = i + l, h = u - i, g = i - (u - h) + (l - h), l = e[++o], i = u, g !== 0 && (c[b++] = g);
  for (; f < r; )
    u = i + y, h = u - i, g = i - (u - h) + (y - h), y = n[++f], i = u, g !== 0 && (c[b++] = g);
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
const gt = (3 + 16 * R) * R, lt = (2 + 12 * R) * R, yt = (9 + 64 * R) * R * R, U = Y(4), j = Y(8), J = Y(12), K = Y(16), S = Y(4);
function bt(t, e, r, n, c, i, u) {
  let g, h, l, y, o, f, b, p, d, a, s, m, M, v, _, w, A, O;
  const k = t - c, T = r - c, I = e - i, N = n - i;
  v = k * N, f = P * k, b = f - (f - k), p = k - b, f = P * N, d = f - (f - N), a = N - d, _ = p * a - (v - b * d - p * d - b * a), w = I * T, f = P * I, b = f - (f - I), p = I - b, f = P * T, d = f - (f - T), a = T - d, A = p * a - (w - b * d - p * d - b * a), s = _ - A, o = _ - s, U[0] = _ - (s + o) + (o - A), m = v + s, o = m - v, M = v - (m - o) + (s - o), s = M - w, o = M - s, U[1] = M - (s + o) + (o - w), O = m + s, o = O - m, U[2] = m - (O - o) + (s - o), U[3] = O;
  let C = ht(4, U), W = lt * u;
  if (C >= W || -C >= W || (o = t - k, g = t - (k + o) + (o - c), o = r - T, l = r - (T + o) + (o - c), o = e - I, h = e - (I + o) + (o - i), o = n - N, y = n - (N + o) + (o - i), g === 0 && h === 0 && l === 0 && y === 0) || (W = yt * u + dt * Math.abs(C), C += k * y + N * g - (I * l + T * h), C >= W || -C >= W)) return C;
  v = g * N, f = P * g, b = f - (f - g), p = g - b, f = P * N, d = f - (f - N), a = N - d, _ = p * a - (v - b * d - p * d - b * a), w = h * T, f = P * h, b = f - (f - h), p = h - b, f = P * T, d = f - (f - T), a = T - d, A = p * a - (w - b * d - p * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = v + s, o = m - v, M = v - (m - o) + (s - o), s = M - w, o = M - s, S[1] = M - (s + o) + (o - w), O = m + s, o = O - m, S[2] = m - (O - o) + (s - o), S[3] = O;
  const it = V(4, U, 4, S, j);
  v = k * y, f = P * k, b = f - (f - k), p = k - b, f = P * y, d = f - (f - y), a = y - d, _ = p * a - (v - b * d - p * d - b * a), w = I * l, f = P * I, b = f - (f - I), p = I - b, f = P * l, d = f - (f - l), a = l - d, A = p * a - (w - b * d - p * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = v + s, o = m - v, M = v - (m - o) + (s - o), s = M - w, o = M - s, S[1] = M - (s + o) + (o - w), O = m + s, o = O - m, S[2] = m - (O - o) + (s - o), S[3] = O;
  const st = V(it, j, 4, S, J);
  v = g * y, f = P * g, b = f - (f - g), p = g - b, f = P * y, d = f - (f - y), a = y - d, _ = p * a - (v - b * d - p * d - b * a), w = h * l, f = P * h, b = f - (f - h), p = h - b, f = P * l, d = f - (f - l), a = l - d, A = p * a - (w - b * d - p * d - b * a), s = _ - A, o = _ - s, S[0] = _ - (s + o) + (o - A), m = v + s, o = m - v, M = v - (m - o) + (s - o), s = M - w, o = M - s, S[1] = M - (s + o) + (o - w), O = m + s, o = O - m, S[2] = m - (O - o) + (s - o), S[3] = O;
  const ot = V(st, J, 4, S, K);
  return K[ot - 1];
}
function mt(t, e, r, n, c, i) {
  const u = (e - i) * (r - c), g = (t - c) * (n - i), h = u - g, l = Math.abs(u + g);
  return Math.abs(h) >= gt * l ? h : -bt(t, e, r, n, c, i, l);
}
function wt(t, e) {
  var r, n, c = 0, i, u, g, h, l, y, o, f = t[0], b = t[1], p = e.length;
  for (r = 0; r < p; r++) {
    n = 0;
    var d = e[r], a = d.length - 1;
    if (y = d[0], y[0] !== d[a][0] && y[1] !== d[a][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (u = y[0] - f, g = y[1] - b, n; n < a; n++) {
      if (o = d[n + 1], h = o[0] - f, l = o[1] - b, g === 0 && l === 0) {
        if (h <= 0 && u >= 0 || u <= 0 && h >= 0)
          return 0;
      } else if (l >= 0 && g <= 0 || l <= 0 && g >= 0) {
        if (i = mt(u, h, g, l, 0, 0), i === 0)
          return 0;
        (i > 0 && l > 0 && g <= 0 || i < 0 && l <= 0 && g > 0) && c++;
      }
      y = o, g = l, u = h;
    }
  }
  return c % 2 !== 0;
}
function $(t, e, r = {}) {
  if (!t)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const n = ut(t), c = ft(e), i = c.type, u = e.bbox;
  let g = c.coordinates;
  if (u && xt(n, u) === !1)
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
function L(t, e) {
  for (let r = 0; r < e.features.length; r++)
    if ($(t, e.features[r]))
      return e.features[r];
}
function rt(t, e, r) {
  const n = e.geometry.coordinates[0][0], c = e.geometry.coordinates[0][1], i = e.geometry.coordinates[0][2], u = t.geometry.coordinates, g = e.properties.a.geom, h = e.properties.b.geom, l = e.properties.c.geom, y = [c[0] - n[0], c[1] - n[1]], o = [i[0] - n[0], i[1] - n[1]], f = [u[0] - n[0], u[1] - n[1]], b = [h[0] - g[0], h[1] - g[1]], p = [l[0] - g[0], l[1] - g[1]];
  let d = (o[1] * f[0] - o[0] * f[1]) / (y[0] * o[1] - y[1] * o[0]), a = (y[0] * f[1] - y[1] * f[0]) / (y[0] * o[1] - y[1] * o[0]);
  if (r) {
    const s = r[e.properties.a.index], m = r[e.properties.b.index], M = r[e.properties.c.index];
    let v;
    if (d < 0 || a < 0 || 1 - d - a < 0) {
      const _ = d / (d + a), w = a / (d + a);
      v = d / m / (_ / m + w / M), a = a / M / (_ / m + w / M);
    } else
      v = d / m / (d / m + a / M + (1 - d - a) / s), a = a / M / (d / m + a / M + (1 - d - a) / s);
    d = v;
  }
  return [
    d * b[0] + a * p[0] + g[0],
    d * b[1] + a * p[1] + g[1]
  ];
}
function pt(t, e, r, n) {
  const c = t.geometry.coordinates, i = r.geometry.coordinates, u = Math.atan2(c[0] - i[0], c[1] - i[1]), g = Mt(u, e[0]);
  if (g === void 0)
    throw new Error("Unable to determine vertex index");
  const h = e[1][g];
  return rt(t, h.features[0], n);
}
function vt(t, e, r, n, c, i, u, g) {
  let h;
  if (u && (h = L(t, F([u]))), !h)
    if (r) {
      const l = t.geometry.coordinates, y = r.gridNum, o = r.xOrigin, f = r.yOrigin, b = r.xUnit, p = r.yUnit, d = r.gridCache, a = B(l[0], o, b, y), s = B(l[1], f, p, y), m = d[a] ? d[a][s] ? d[a][s] : [] : [], M = F(m.map((v) => e.features[v]));
      h = L(t, M);
    } else
      h = L(t, e);
  return g && g(h), h ? rt(t, h, i) : pt(t, n, c, i);
}
function B(t, e, r, n) {
  let c = Math.floor((t - e) / r);
  return c < 0 && (c = 0), c >= n && (c = n - 1), c;
}
function Mt(t, e) {
  let r = Q(t - e[0]), n = Math.PI * 2, c;
  for (let i = 0; i < e.length; i++) {
    const u = (i + 1) % e.length, g = Q(t - e[u]), h = Math.min(Math.abs(r), Math.abs(g));
    r * g <= 0 && h < n && (n = h, c = i), r = g;
  }
  return c;
}
function Q(t, e = !1) {
  const r = 2 * Math.PI, n = t - Math.floor(t / r) * r;
  return e ? n : n > Math.PI ? n - r : n;
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
function Wt(t) {
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
function D(t, e, r, n, c, i = !1, u) {
  const g = t.map(
    (h) => {
      (!u || u < 2.00703) && (h = nt(h));
      const l = isFinite(h) ? e[h] : h === "c" ? n : (function() {
        const y = h.match(/^b(\d+)$/);
        if (y) return c[parseInt(y[1])];
        const o = h.match(/^e(\d+)$/);
        if (o) return r[parseInt(o[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[l[1], l[0]], h] : [[l[0], l[1]], h];
    }
  );
  return _t(g);
}
function nt(t) {
  return typeof t == "number" ? t : t.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
const q = 2.00703;
function Et(t) {
  return !!(t.version !== void 0 || !t.tins && t.points && t.tins_points);
}
function Ot(t) {
  return {
    points: t.points,
    pointsWeightBuffer: St(t),
    strictStatus: kt(t),
    verticesParams: Tt(t),
    centroid: It(t),
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
    xy: t.xy ?? [0, 0]
  };
}
function Pt(t) {
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
  return !t.version || t.version < q ? ["forw", "bakw"].reduce((e, r) => {
    const n = t.weight_buffer[r];
    return n && (e[r] = Object.keys(n).reduce((c, i) => {
      const u = nt(i);
      return c[u] = n[i], c;
    }, {})), e;
  }, {}) : t.weight_buffer;
}
function kt(t) {
  return t.strict_status ? t.strict_status : t.kinks_points ? "strict_error" : t.tins_points.length === 2 ? "loose" : "strict";
}
function Tt(t) {
  const e = {
    forw: [t.vertices_params[0]],
    bakw: [t.vertices_params[1]]
  };
  return e.forw[1] = H(t, !1), e.bakw[1] = H(t, !0), e;
}
function H(t, e) {
  const r = t.vertices_points.length;
  return Array.from({ length: r }, (n, c) => {
    const i = (c + 1) % r, u = D(
      ["c", `b${c}`, `b${i}`],
      t.points,
      t.edgeNodes || [],
      t.centroid_point,
      t.vertices_points,
      e,
      q
    );
    return F([u]);
  });
}
function It(t) {
  return {
    forw: X(t.centroid_point[0], {
      target: {
        geom: t.centroid_point[1],
        index: "c"
      }
    }),
    bakw: X(t.centroid_point[1], {
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
        (r) => D(
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
        (r) => D(
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
        t.map((e) => X(e))
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
    ["a", "b", "c"].forEach((i, u) => {
      const g = c.geometry.coordinates[0][u], h = c.properties[i].geom, l = c.properties[i].index;
      typeof l == "number" && (e[l] = [g, h]);
    });
  }
  return e;
}
const Xt = q, E = class E {
  constructor() {
    x(this, "points", []);
    x(this, "pointsWeightBuffer");
    x(this, "strict_status");
    x(this, "vertices_params");
    x(this, "centroid");
    x(this, "edgeNodes");
    x(this, "edges");
    x(this, "tins");
    x(this, "kinks");
    x(this, "yaxisMode", E.YAXIS_INVERT);
    x(this, "strictMode", E.MODE_AUTO);
    x(this, "vertexMode", E.VERTEX_PLAIN);
    x(this, "bounds");
    x(this, "boundsPolygon");
    x(this, "wh");
    x(this, "xy");
    x(this, "indexedTins");
    x(this, "stateFull", !1);
    x(this, "stateTriangle");
    x(this, "stateBackward");
    /**
     * Optional properties for MaplatCore extension
     * These properties allow consuming applications to extend Transform instances
     * with additional metadata without requiring Module Augmentation
     */
    /** Layer priority for rendering order */
    x(this, "priority");
    /** Layer importance for display decisions */
    x(this, "importance");
    /** Bounds in XY (source) coordinate system */
    x(this, "xyBounds");
    /** Bounds in Mercator (Web Mercator) coordinate system */
    x(this, "mercBounds");
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
      this.applyModernState(Ot(e));
      return;
    }
    this.applyLegacyState(Pt(e));
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
    let i = [], u = [];
    const g = r.features.map((d) => {
      let a = [];
      return G(d)[0].map((s) => {
        i.length === 0 ? i = [Array.from(s), Array.from(s)] : (s[0] < i[0][0] && (i[0][0] = s[0]), s[0] > i[1][0] && (i[1][0] = s[0]), s[1] < i[0][1] && (i[0][1] = s[1]), s[1] > i[1][1] && (i[1][1] = s[1])), a.length === 0 ? a = [Array.from(s), Array.from(s)] : (s[0] < a[0][0] && (a[0][0] = s[0]), s[0] > a[1][0] && (a[1][0] = s[0]), s[1] < a[0][1] && (a[0][1] = s[1]), s[1] > a[1][1] && (a[1][1] = s[1]));
      }), a;
    }), h = (i[1][0] - i[0][0]) / c, l = (i[1][1] - i[0][1]) / c, y = g.reduce(
      (d, a, s) => {
        const m = B(
          a[0][0],
          i[0][0],
          h,
          c
        ), M = B(
          a[1][0],
          i[0][0],
          h,
          c
        ), v = B(
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
        for (let w = m; w <= M; w++) {
          d[w] || (d[w] = []);
          for (let A = v; A <= _; A++)
            d[w][A] || (d[w][A] = []), d[w][A].push(s);
        }
        return d;
      },
      []
    ), o = n.features.map((d) => {
      let a = [];
      return G(d)[0].map((s) => {
        u.length === 0 ? u = [Array.from(s), Array.from(s)] : (s[0] < u[0][0] && (u[0][0] = s[0]), s[0] > u[1][0] && (u[1][0] = s[0]), s[1] < u[0][1] && (u[0][1] = s[1]), s[1] > u[1][1] && (u[1][1] = s[1])), a.length === 0 ? a = [Array.from(s), Array.from(s)] : (s[0] < a[0][0] && (a[0][0] = s[0]), s[0] > a[1][0] && (a[1][0] = s[0]), s[1] < a[0][1] && (a[0][1] = s[1]), s[1] > a[1][1] && (a[1][1] = s[1]));
      }), a;
    }), f = (u[1][0] - u[0][0]) / c, b = (u[1][1] - u[0][1]) / c, p = o.reduce(
      (d, a, s) => {
        const m = B(
          a[0][0],
          u[0][0],
          f,
          c
        ), M = B(
          a[1][0],
          u[0][0],
          f,
          c
        ), v = B(
          a[0][1],
          u[0][1],
          b,
          c
        ), _ = B(
          a[1][1],
          u[0][1],
          b,
          c
        );
        for (let w = m; w <= M; w++) {
          d[w] || (d[w] = []);
          for (let A = v; A <= _; A++)
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
        xOrigin: u[0][0],
        yOrigin: u[0][1],
        xUnit: f,
        yUnit: b,
        gridCache: p
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
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (r && this.strict_status == E.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    this.yaxisMode == E.YAXIS_FOLLOW && r && (e = [e[0], -1 * e[1]]);
    const c = X(e);
    if (this.bounds && !r && !n && !$(c, this.boundsPolygon))
      return !1;
    const i = r ? this.tins.bakw : this.tins.forw, u = r ? this.indexedTins.bakw : this.indexedTins.forw, g = r ? this.vertices_params.bakw : this.vertices_params.forw, h = r ? this.centroid.bakw : this.centroid.forw, l = r ? this.pointsWeightBuffer.bakw : this.pointsWeightBuffer.forw;
    let y, o;
    this.stateFull && (this.stateBackward == r ? y = this.stateTriangle : (this.stateBackward = r, this.stateTriangle = void 0), o = (b) => {
      this.stateTriangle = b;
    });
    let f = vt(
      c,
      i,
      u,
      g,
      h,
      l,
      y,
      o
    );
    if (this.bounds && r && !n) {
      const b = X(f);
      if (!$(b, this.boundsPolygon)) return !1;
    } else this.yaxisMode == E.YAXIS_FOLLOW && !r && (f = [f[0], -1 * f[1]]);
    return f;
  }
};
/**
 * 各種モードの定数定義
 * すべてreadonlyで、型安全性を確保
 */
x(E, "VERTEX_PLAIN", "plain"), x(E, "VERTEX_BIRDEYE", "birdeye"), x(E, "MODE_STRICT", "strict"), x(E, "MODE_AUTO", "auto"), x(E, "MODE_LOOSE", "loose"), x(E, "STATUS_STRICT", "strict"), x(E, "STATUS_ERROR", "strict_error"), x(E, "STATUS_LOOSE", "loose"), x(E, "YAXIS_FOLLOW", "follow"), x(E, "YAXIS_INVERT", "invert");
let Z = E;
export {
  Z as Transform,
  Wt as counterTri,
  Xt as format_version,
  At as normalizeEdges,
  Ft as rotateVerticesTriangle,
  vt as transformArr
};
