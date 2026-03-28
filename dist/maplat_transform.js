var yt = Object.defineProperty;
var mt = (r, t, e) => t in r ? yt(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var w = (r, t, e) => mt(r, typeof t != "symbol" ? t + "" : t, e);
function at(r, t, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = t || {}, n.geometry = r, n;
}
function W(r, t, e = {}) {
  if (!r)
    throw new Error("coordinates is required");
  if (!Array.isArray(r))
    throw new Error("coordinates must be an Array");
  if (r.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!K(r[0]) || !K(r[1]))
    throw new Error("coordinates must contain numbers");
  return at({
    type: "Point",
    coordinates: r
  }, t, e);
}
function Y(r, t, e = {}) {
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
  return at({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function F(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function K(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function gt(r) {
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
function Q(r) {
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
function bt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const X = 11102230246251565e-32, I = 134217729, xt = (3 + 8 * X) * X;
function q(r, t, e, n, s) {
  let i, o, u, d, f = t[0], m = n[0], a = 0, l = 0;
  m > f == m > -f ? (i = f, f = t[++a]) : (i = m, m = n[++l]);
  let g = 0;
  if (a < r && l < e)
    for (m > f == m > -f ? (o = f + i, u = i - (o - f), f = t[++a]) : (o = m + i, u = i - (o - m), m = n[++l]), i = o, u !== 0 && (s[g++] = u); a < r && l < e; )
      m > f == m > -f ? (o = i + f, d = o - i, u = i - (o - d) + (f - d), f = t[++a]) : (o = i + m, d = o - i, u = i - (o - d) + (m - d), m = n[++l]), i = o, u !== 0 && (s[g++] = u);
  for (; a < r; )
    o = i + f, d = o - i, u = i - (o - d) + (f - d), f = t[++a], i = o, u !== 0 && (s[g++] = u);
  for (; l < e; )
    o = i + m, d = o - i, u = i - (o - d) + (m - d), m = n[++l], i = o, u !== 0 && (s[g++] = u);
  return (i !== 0 || g === 0) && (s[g++] = i), g;
}
function pt(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function D(r) {
  return new Float64Array(r);
}
const wt = (3 + 16 * X) * X, Mt = (2 + 12 * X) * X, _t = (9 + 64 * X) * X * X, L = D(4), H = D(8), tt = D(12), rt = D(16), S = D(4);
function vt(r, t, e, n, s, i, o) {
  let u, d, f, m, a, l, g, b, y, h, c, x, M, _, T, p, v, A;
  const B = r - s, C = e - s, P = t - i, O = n - i;
  _ = B * O, l = I * B, g = l - (l - B), b = B - g, l = I * O, y = l - (l - O), h = O - y, T = b * h - (_ - g * y - b * y - g * h), p = P * C, l = I * P, g = l - (l - P), b = P - g, l = I * C, y = l - (l - C), h = C - y, v = b * h - (p - g * y - b * y - g * h), c = T - v, a = T - c, L[0] = T - (c + a) + (a - v), x = _ + c, a = x - _, M = _ - (x - a) + (c - a), c = M - p, a = M - c, L[1] = M - (c + a) + (a - p), A = x + c, a = A - x, L[2] = x - (A - a) + (c - a), L[3] = A;
  let N = pt(4, L), V = Mt * o;
  if (N >= V || -N >= V || (a = r - B, u = r - (B + a) + (a - s), a = e - C, f = e - (C + a) + (a - s), a = t - P, d = t - (P + a) + (a - i), a = n - O, m = n - (O + a) + (a - i), u === 0 && d === 0 && f === 0 && m === 0) || (V = _t * o + xt * Math.abs(N), N += B * m + O * u - (P * f + C * d), N >= V || -N >= V)) return N;
  _ = u * O, l = I * u, g = l - (l - u), b = u - g, l = I * O, y = l - (l - O), h = O - y, T = b * h - (_ - g * y - b * y - g * h), p = d * C, l = I * d, g = l - (l - d), b = d - g, l = I * C, y = l - (l - C), h = C - y, v = b * h - (p - g * y - b * y - g * h), c = T - v, a = T - c, S[0] = T - (c + a) + (a - v), x = _ + c, a = x - _, M = _ - (x - a) + (c - a), c = M - p, a = M - c, S[1] = M - (c + a) + (a - p), A = x + c, a = A - x, S[2] = x - (A - a) + (c - a), S[3] = A;
  const ht = q(4, L, 4, S, H);
  _ = B * m, l = I * B, g = l - (l - B), b = B - g, l = I * m, y = l - (l - m), h = m - y, T = b * h - (_ - g * y - b * y - g * h), p = P * f, l = I * P, g = l - (l - P), b = P - g, l = I * f, y = l - (l - f), h = f - y, v = b * h - (p - g * y - b * y - g * h), c = T - v, a = T - c, S[0] = T - (c + a) + (a - v), x = _ + c, a = x - _, M = _ - (x - a) + (c - a), c = M - p, a = M - c, S[1] = M - (c + a) + (a - p), A = x + c, a = A - x, S[2] = x - (A - a) + (c - a), S[3] = A;
  const lt = q(ht, H, 4, S, tt);
  _ = u * m, l = I * u, g = l - (l - u), b = u - g, l = I * m, y = l - (l - m), h = m - y, T = b * h - (_ - g * y - b * y - g * h), p = d * f, l = I * d, g = l - (l - d), b = d - g, l = I * f, y = l - (l - f), h = f - y, v = b * h - (p - g * y - b * y - g * h), c = T - v, a = T - c, S[0] = T - (c + a) + (a - v), x = _ + c, a = x - _, M = _ - (x - a) + (c - a), c = M - p, a = M - c, S[1] = M - (c + a) + (a - p), A = x + c, a = A - x, S[2] = x - (A - a) + (c - a), S[3] = A;
  const dt = q(lt, tt, 4, S, rt);
  return rt[dt - 1];
}
function Tt(r, t, e, n, s, i) {
  const o = (t - i) * (e - s), u = (r - s) * (n - i), d = o - u, f = Math.abs(o + u);
  return Math.abs(d) >= wt * f ? d : -vt(r, t, e, n, s, i, f);
}
function Et(r, t) {
  var e, n, s = 0, i, o, u, d, f, m, a, l = r[0], g = r[1], b = t.length;
  for (e = 0; e < b; e++) {
    n = 0;
    var y = t[e], h = y.length - 1;
    if (m = y[0], m[0] !== y[h][0] && m[1] !== y[h][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (o = m[0] - l, u = m[1] - g, n; n < h; n++) {
      if (a = y[n + 1], d = a[0] - l, f = a[1] - g, u === 0 && f === 0) {
        if (d <= 0 && o >= 0 || o <= 0 && d >= 0)
          return 0;
      } else if (f >= 0 && u <= 0 || f <= 0 && u >= 0) {
        if (i = Tt(o, d, u, f, 0, 0), i === 0)
          return 0;
        (i > 0 && f > 0 && u <= 0 || i < 0 && f <= 0 && u > 0) && s++;
      }
      m = a, u = f, o = d;
    }
  }
  return s % 2 !== 0;
}
function U(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = gt(r), s = bt(t), i = s.type, o = t.bbox;
  let u = s.coordinates;
  if (o && At(n, o) === !1)
    return !1;
  i === "Polygon" && (u = [u]);
  let d = !1;
  for (var f = 0; f < u.length; ++f) {
    const m = Et(n, u[f]);
    if (m === 0) return !e.ignoreBoundary;
    m && (d = !0);
  }
  return d;
}
function At(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function z(r, t) {
  for (let e = 0; e < t.features.length; e++)
    if (U(r, t.features[e]))
      return t.features[e];
}
function ct(r, t, e) {
  const n = t.geometry.coordinates[0][0], s = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = r.geometry.coordinates, u = t.properties.a.geom, d = t.properties.b.geom, f = t.properties.c.geom, m = [s[0] - n[0], s[1] - n[1]], a = [i[0] - n[0], i[1] - n[1]], l = [o[0] - n[0], o[1] - n[1]], g = [d[0] - u[0], d[1] - u[1]], b = [f[0] - u[0], f[1] - u[1]];
  let y = (a[1] * l[0] - a[0] * l[1]) / (m[0] * a[1] - m[1] * a[0]), h = (m[0] * l[1] - m[1] * l[0]) / (m[0] * a[1] - m[1] * a[0]);
  if (e) {
    const c = e[t.properties.a.index], x = e[t.properties.b.index], M = e[t.properties.c.index];
    let _;
    if (y < 0 || h < 0 || 1 - y - h < 0) {
      const T = y / (y + h), p = h / (y + h);
      _ = y / x / (T / x + p / M), h = h / M / (T / x + p / M);
    } else
      _ = y / x / (y / x + h / M + (1 - y - h) / c), h = h / M / (y / x + h / M + (1 - y - h) / c);
    y = _;
  }
  return [
    y * g[0] + h * b[0] + u[0],
    y * g[1] + h * b[1] + u[1]
  ];
}
function It(r, t, e, n) {
  const s = r.geometry.coordinates, i = e.geometry.coordinates, o = Math.atan2(s[0] - i[0], s[1] - i[1]), u = Bt(o, t[0]);
  if (u === void 0)
    throw new Error("Unable to determine vertex index");
  const d = t[1][u];
  return ct(r, d.features[0], n);
}
function St(r, t, e, n, s, i, o, u) {
  let d;
  if (o && (d = z(r, F([o]))), !d)
    if (e) {
      const f = r.geometry.coordinates, m = e.gridNum, a = e.xOrigin, l = e.yOrigin, g = e.xUnit, b = e.yUnit, y = e.gridCache, h = R(f[0], a, g, m), c = R(f[1], l, b, m), x = y[h] ? y[h][c] ? y[h][c] : [] : [], M = F(x.map((_) => t.features[_]));
      d = z(r, M);
    } else
      d = z(r, t);
  return u && u(d), d ? ct(r, d, i) : It(r, n, s, i);
}
function R(r, t, e, n) {
  let s = Math.floor((r - t) / e);
  return s < 0 && (s = 0), s >= n && (s = n - 1), s;
}
function Bt(r, t) {
  let e = et(r - t[0]), n = Math.PI * 2, s;
  for (let i = 0; i < t.length; i++) {
    const o = (i + 1) % t.length, u = et(r - t[o]), d = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && d < n && (n = d, s = i), e = u;
  }
  return s;
}
function et(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function zt(r) {
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
function Gt(r) {
  const t = ["a", "b", "c", "a"].map(
    (i) => r.properties[i].geom
  ), e = r.geometry.coordinates[0], n = r.properties, s = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return Y([t], s);
}
function Ct(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return Y([t], e);
}
function j(r, t, e, n, s, i = !1, o) {
  const u = r.map(
    (d) => {
      (!o || o < 2.00703) && (d = ut(d));
      const f = isFinite(d) ? t[d] : d === "c" ? n : (function() {
        const m = d.match(/^b(\d+)$/);
        if (m) return s[parseInt(m[1])];
        const a = d.match(/^e(\d+)$/);
        if (a) return e[parseInt(a[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[f[1], f[0]], d] : [[f[0], f[1]], d];
    }
  );
  return Ct(u);
}
function ut(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Pt(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const J = 2.00703;
function Ot(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function Rt(r) {
  return {
    points: r.points,
    pointsWeightBuffer: Nt(r),
    strictStatus: Xt(r),
    verticesParams: Wt(r),
    centroid: Lt(r),
    edges: Pt(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Ut(r),
    kinks: Ft(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function kt(r) {
  const t = Vt(r), e = t.tins;
  return {
    compiled: t,
    tins: e,
    points: Dt(e),
    strictStatus: t.strict_status,
    pointsWeightBuffer: t.weight_buffer,
    verticesParams: t.vertices_params,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Nt(r) {
  return !r.version || r.version < J ? ["forw", "bakw"].reduce((t, e) => {
    const n = r.weight_buffer[e];
    return n && (t[e] = Object.keys(n).reduce((s, i) => {
      const o = ut(i);
      return s[o] = n[i], s;
    }, {})), t;
  }, {}) : r.weight_buffer;
}
function Xt(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function Wt(r) {
  const t = {
    forw: [r.vertices_params[0]],
    bakw: [r.vertices_params[1]]
  };
  return t.forw[1] = nt(r, !1), t.bakw[1] = nt(r, !0), t;
}
function nt(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, s) => {
    const i = (s + 1) % e, o = j(
      ["c", `b${s}`, `b${i}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      J
    );
    return F([o]);
  });
}
function Lt(r) {
  return {
    forw: W(r.centroid_point[0], {
      target: {
        geom: r.centroid_point[1],
        index: "c"
      }
    }),
    bakw: W(r.centroid_point[1], {
      target: {
        geom: r.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Ut(r) {
  const t = r.tins_points.length === 1 ? 0 : 1;
  return {
    forw: F(
      r.tins_points[0].map(
        (e) => j(
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
    bakw: F(
      r.tins_points[t].map(
        (e) => j(
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
function Ft(r) {
  if (r)
    return {
      bakw: F(
        r.map((t) => W(t))
      )
    };
}
function Vt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Dt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    ["a", "b", "c"].forEach((i, o) => {
      const u = s.geometry.coordinates[0][o], d = s.properties[i].geom, f = s.properties[i].index;
      typeof f == "number" && (t[f] = [u, d]);
    });
  }
  return t;
}
const Zt = J, E = class E {
  constructor() {
    w(this, "points", []);
    w(this, "pointsWeightBuffer");
    w(this, "strict_status");
    w(this, "vertices_params");
    w(this, "centroid");
    w(this, "edgeNodes");
    w(this, "edges");
    w(this, "tins");
    w(this, "kinks");
    w(this, "yaxisMode", E.YAXIS_INVERT);
    w(this, "strictMode", E.MODE_AUTO);
    w(this, "vertexMode", E.VERTEX_PLAIN);
    w(this, "bounds");
    w(this, "boundsPolygon");
    w(this, "wh");
    w(this, "xy");
    w(this, "indexedTins");
    w(this, "stateFull", !1);
    w(this, "stateTriangle");
    w(this, "stateBackward");
    /**
     * Optional properties for MaplatCore extension
     * These properties allow consuming applications to extend Transform instances
     * with additional metadata without requiring Module Augmentation
     */
    /** Layer priority for rendering order */
    w(this, "priority");
    /** Layer importance for display decisions */
    w(this, "importance");
    /** Bounds in XY (source) coordinate system */
    w(this, "xyBounds");
    /** Bounds in Mercator (Web Mercator) coordinate system */
    w(this, "mercBounds");
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
    if (Ot(t)) {
      this.applyModernState(Rt(t));
      return;
    }
    this.applyLegacyState(kt(t));
  }
  applyModernState(t) {
    this.points = t.points, this.pointsWeightBuffer = t.pointsWeightBuffer, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? E.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? E.VERTEX_PLAIN, this.strictMode = t.strictMode ?? E.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
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
    const u = e.features.map((y) => {
      let h = [];
      return Q(y)[0].map((c) => {
        i.length === 0 ? i = [Array.from(c), Array.from(c)] : (c[0] < i[0][0] && (i[0][0] = c[0]), c[0] > i[1][0] && (i[1][0] = c[0]), c[1] < i[0][1] && (i[0][1] = c[1]), c[1] > i[1][1] && (i[1][1] = c[1])), h.length === 0 ? h = [Array.from(c), Array.from(c)] : (c[0] < h[0][0] && (h[0][0] = c[0]), c[0] > h[1][0] && (h[1][0] = c[0]), c[1] < h[0][1] && (h[0][1] = c[1]), c[1] > h[1][1] && (h[1][1] = c[1]));
      }), h;
    }), d = (i[1][0] - i[0][0]) / s, f = (i[1][1] - i[0][1]) / s, m = u.reduce(
      (y, h, c) => {
        const x = R(h[0][0], i[0][0], d, s), M = R(h[1][0], i[0][0], d, s), _ = R(h[0][1], i[0][1], f, s), T = R(h[1][1], i[0][1], f, s);
        for (let p = x; p <= M; p++) {
          y[p] || (y[p] = []);
          for (let v = _; v <= T; v++)
            y[p][v] || (y[p][v] = []), y[p][v].push(c);
        }
        return y;
      },
      []
    ), a = n.features.map((y) => {
      let h = [];
      return Q(y)[0].map((c) => {
        o.length === 0 ? o = [Array.from(c), Array.from(c)] : (c[0] < o[0][0] && (o[0][0] = c[0]), c[0] > o[1][0] && (o[1][0] = c[0]), c[1] < o[0][1] && (o[0][1] = c[1]), c[1] > o[1][1] && (o[1][1] = c[1])), h.length === 0 ? h = [Array.from(c), Array.from(c)] : (c[0] < h[0][0] && (h[0][0] = c[0]), c[0] > h[1][0] && (h[1][0] = c[0]), c[1] < h[0][1] && (h[0][1] = c[1]), c[1] > h[1][1] && (h[1][1] = c[1]));
      }), h;
    }), l = (o[1][0] - o[0][0]) / s, g = (o[1][1] - o[0][1]) / s, b = a.reduce(
      (y, h, c) => {
        const x = R(h[0][0], o[0][0], l, s), M = R(h[1][0], o[0][0], l, s), _ = R(h[0][1], o[0][1], g, s), T = R(h[1][1], o[0][1], g, s);
        for (let p = x; p <= M; p++) {
          y[p] || (y[p] = []);
          for (let v = _; v <= T; v++)
            y[p][v] || (y[p][v] = []), y[p][v].push(c);
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
        xUnit: d,
        yUnit: f,
        gridCache: m
      },
      bakw: {
        gridNum: s,
        xOrigin: o[0][0],
        yOrigin: o[0][1],
        xUnit: l,
        yUnit: g,
        gridCache: b
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
    if (e && this.strict_status == E.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    this.yaxisMode == E.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const s = W(t);
    if (this.bounds && !e && !n && !U(s, this.boundsPolygon))
      return !1;
    const i = e ? this.tins.bakw : this.tins.forw, o = e ? this.indexedTins.bakw : this.indexedTins.forw, u = e ? this.vertices_params.bakw : this.vertices_params.forw, d = e ? this.centroid.bakw : this.centroid.forw, f = e ? this.pointsWeightBuffer.bakw : this.pointsWeightBuffer.forw;
    let m, a;
    this.stateFull && (this.stateBackward == e ? m = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), a = (g) => {
      this.stateTriangle = g;
    });
    let l = St(
      s,
      i,
      o,
      u,
      d,
      f,
      m,
      a
    );
    if (this.bounds && e && !n) {
      const g = W(l);
      if (!U(g, this.boundsPolygon)) return !1;
    } else this.yaxisMode == E.YAXIS_FOLLOW && !e && (l = [l[0], -1 * l[1]]);
    return l;
  }
};
/**
 * 各種モードの定数定義
 * すべてreadonlyで、型安全性を確保
 */
w(E, "VERTEX_PLAIN", "plain"), w(E, "VERTEX_BIRDEYE", "birdeye"), w(E, "MODE_STRICT", "strict"), w(E, "MODE_AUTO", "auto"), w(E, "MODE_LOOSE", "loose"), w(E, "STATUS_STRICT", "strict"), w(E, "STATUS_ERROR", "strict_error"), w(E, "STATUS_LOOSE", "loose"), w(E, "YAXIS_FOLLOW", "follow"), w(E, "YAXIS_INVERT", "invert");
let $ = E;
const k = 20037508342789244e-9, Yt = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
];
function ft(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * k / 128 / Math.pow(2, t);
}
function $t(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const s = r[n], i = s[0] * Math.cos(t) - s[1] * Math.sin(t), o = s[0] * Math.sin(t) + s[1] * Math.cos(t);
    e.push([i, o]);
  }
  return e;
}
function st(r, t, e, n) {
  const s = ft(n, t);
  return $t(Yt, e).map((u) => [
    u[0] * s + r[0],
    u[1] * s + r[1]
  ]);
}
function ot(r, t) {
  const e = r[0], s = r.slice(1, 5).map((g) => [
    g[0] - e[0],
    g[1] - e[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let o = 0, u = 0, d = 0;
  for (let g = 0; g < 4; g++) {
    const b = s[g], y = i[g], h = Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2));
    o += h;
    const c = b[0] * y[1] - b[1] * y[0], x = Math.acos(
      (b[0] * y[0] + b[1] * y[1]) / h
    ), M = c > 0 ? -1 * x : x;
    u += Math.cos(M), d += Math.sin(M);
  }
  const f = o / 4, m = Math.atan2(d, u), a = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(a * k / 128 / f) / Math.log(2);
  return { center: e, zoom: l, rotation: m };
}
function G(r, t) {
  const e = r[0] * (2 * k) / t - k, n = -1 * (r[1] * (2 * k) / t - k);
  return [e, n];
}
function it(r, t) {
  const e = (r[0] + k) * t / (2 * k), n = (-r[1] + k) * t / (2 * k);
  return [e, n];
}
const Z = 256;
class jt {
  constructor() {
    w(this, "mainTin", null);
    w(this, "subTins", []);
    w(this, "_maxxy", 0);
  }
  // ─── 初期化 ────────────────────────────────────────────────────────────────
  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(t) {
    const e = new $();
    if (e.setCompiled(t.compiled), this.mainTin = e, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * Z;
    else if (t.compiled.wh) {
      const n = Math.max(t.compiled.wh[0], t.compiled.wh[1]), s = Math.ceil(Math.log2(n / Z));
      this._maxxy = Math.pow(2, s) * Z;
    }
    if (this.subTins = [], t.sub_maps)
      for (const n of t.sub_maps) {
        const s = new $();
        s.setCompiled(n.compiled);
        const i = n.bounds ?? n.compiled.bounds;
        if (!i)
          throw new Error(
            "SubMapData must have bounds or compiled.bounds to create xyBounds polygon"
          );
        const o = [...i, i[0]], u = o.map((d) => {
          const f = s.transform(d, !1);
          if (!f) throw new Error("Failed to transform sub-map bounds to mercator");
          return f;
        });
        this.subTins.push({
          tin: s,
          priority: n.priority,
          importance: n.importance,
          xyBounds: Y([o]),
          mercBounds: Y([u])
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
      if (i || U(W(t), this.subTins[s - 1].xyBounds)) {
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: o, tin: u, isMain: d }) => {
      const f = this._transformByIndex(t, o, !0);
      return f === !1 ? [u, o] : d || U(W(f), this.subTins[o - 1].xyBounds) ? [u, o, f] : [u, o];
    }).sort((o, u) => {
      const d = o[0].priority ?? 0, f = u[0].priority ?? 0;
      return d < f ? 1 : -1;
    }).reduce(
      (o, u, d, f) => {
        const m = u[0], a = u[1], l = u[2];
        if (!l) return o;
        for (let g = 0; g < d; g++) {
          const b = f[g][1], y = b === 0;
          if (f[g][2] && (y || U(W(l), this.subTins[b - 1].xyBounds)))
            if (o.length) {
              const h = !o[0], c = h ? o[1][2] : o[0][2], x = m.importance ?? 0, M = c.importance ?? 0;
              return h ? x < M ? o : [void 0, [a, l, m]] : [...o.filter(
                (p) => p !== void 0
              ), [a, l, m]].sort(
                (p, v) => (p[2].importance ?? 0) < (v[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[a, l, m]];
        }
        return !o.length || !o[0] ? [[a, l, m]] : (o.push([a, l, m]), o.sort((g, b) => {
          const y = g[2].importance ?? 0, h = b[2].importance ?? 0;
          return y < h ? 1 : -1;
        }).filter((g, b) => b < 2));
      },
      []
    ).map((o) => {
      if (o)
        return [o[0], o[1]];
    });
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
      const o = s[0], u = s[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((f, m) => m === 0 ? u : this._transformByIndex(f, o, !0)).map((f) => this.xy2SysCoordInternal(f));
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
    const s = st(t.center, t.zoom, t.rotation, e).map((f) => it(f, this._maxxy)), i = this.xy2MercWithLayer(s[0]);
    if (!i) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const o = i[0], u = i[1];
    return s.map((f, m) => {
      if (m === 0) return u;
      const a = this._transformByIndex(f, o, !1);
      if (a === !1) throw new Error(`viewpoint2Mercs: point ${m} is out of bounds`);
      return a;
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
    const i = s[0], o = s[1], d = t.map((f, m) => {
      if (m === 0) return o;
      const a = this._transformByIndex(f, i, !0);
      if (a === !1) throw new Error(`mercs2Viewpoint: point ${m} is out of bounds`);
      return a;
    }).map((f) => G(f, this._maxxy));
    return ot(d, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return ft(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, s) {
    return st(t, e, n, s);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return ot(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return G(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return it(t, e);
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
    return G(t, this._maxxy);
  }
}
export {
  Yt as MERC_CROSSMATRIX,
  k as MERC_MAX,
  jt as MapTransform,
  $ as Transform,
  Gt as counterTri,
  Zt as format_version,
  st as mercViewpoint2Mercs,
  ot as mercs2MercViewpoint,
  Pt as normalizeEdges,
  $t as rotateMatrix,
  zt as rotateVerticesTriangle,
  it as sysCoord2Xy,
  St as transformArr,
  G as xy2SysCoord,
  ft as zoom2Radius
};
