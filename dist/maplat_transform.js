var lt = Object.defineProperty;
var yt = (r, t, e) => t in r ? lt(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var x = (r, t, e) => yt(r, typeof t != "symbol" ? t + "" : t, e);
function it(r, t, e = {}) {
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
  return it({
    type: "Point",
    coordinates: r
  }, t, e);
}
function Y(r, t, e = {}) {
  for (const o of r) {
    if (o.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (o[o.length - 1].length !== o[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let i = 0; i < o[o.length - 1].length; i++)
      if (o[o.length - 1][i] !== o[0][i])
        throw new Error("First and last Position are not equivalent.");
  }
  return it({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function L(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function K(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function mt(r) {
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
function Z(r) {
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
function gt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const X = 11102230246251565e-32, I = 134217729, bt = (3 + 8 * X) * X;
function q(r, t, e, n, o) {
  let i, s, u, d, f = t[0], m = n[0], a = 0, l = 0;
  m > f == m > -f ? (i = f, f = t[++a]) : (i = m, m = n[++l]);
  let g = 0;
  if (a < r && l < e)
    for (m > f == m > -f ? (s = f + i, u = i - (s - f), f = t[++a]) : (s = m + i, u = i - (s - m), m = n[++l]), i = s, u !== 0 && (o[g++] = u); a < r && l < e; )
      m > f == m > -f ? (s = i + f, d = s - i, u = i - (s - d) + (f - d), f = t[++a]) : (s = i + m, d = s - i, u = i - (s - d) + (m - d), m = n[++l]), i = s, u !== 0 && (o[g++] = u);
  for (; a < r; )
    s = i + f, d = s - i, u = i - (s - d) + (f - d), f = t[++a], i = s, u !== 0 && (o[g++] = u);
  for (; l < e; )
    s = i + m, d = s - i, u = i - (s - d) + (m - d), m = n[++l], i = s, u !== 0 && (o[g++] = u);
  return (i !== 0 || g === 0) && (o[g++] = i), g;
}
function pt(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function D(r) {
  return new Float64Array(r);
}
const xt = (3 + 16 * X) * X, wt = (2 + 12 * X) * X, Mt = (9 + 64 * X) * X * X, U = D(4), Q = D(8), H = D(12), tt = D(16), S = D(4);
function _t(r, t, e, n, o, i, s) {
  let u, d, f, m, a, l, g, b, y, h, c, p, M, _, E, w, v, A;
  const B = r - o, C = e - o, P = t - i, O = n - i;
  _ = B * O, l = I * B, g = l - (l - B), b = B - g, l = I * O, y = l - (l - O), h = O - y, E = b * h - (_ - g * y - b * y - g * h), w = P * C, l = I * P, g = l - (l - P), b = P - g, l = I * C, y = l - (l - C), h = C - y, v = b * h - (w - g * y - b * y - g * h), c = E - v, a = E - c, U[0] = E - (c + a) + (a - v), p = _ + c, a = p - _, M = _ - (p - a) + (c - a), c = M - w, a = M - c, U[1] = M - (c + a) + (a - w), A = p + c, a = A - p, U[2] = p - (A - a) + (c - a), U[3] = A;
  let N = pt(4, U), V = wt * s;
  if (N >= V || -N >= V || (a = r - B, u = r - (B + a) + (a - o), a = e - C, f = e - (C + a) + (a - o), a = t - P, d = t - (P + a) + (a - i), a = n - O, m = n - (O + a) + (a - i), u === 0 && d === 0 && f === 0 && m === 0) || (V = Mt * s + bt * Math.abs(N), N += B * m + O * u - (P * f + C * d), N >= V || -N >= V)) return N;
  _ = u * O, l = I * u, g = l - (l - u), b = u - g, l = I * O, y = l - (l - O), h = O - y, E = b * h - (_ - g * y - b * y - g * h), w = d * C, l = I * d, g = l - (l - d), b = d - g, l = I * C, y = l - (l - C), h = C - y, v = b * h - (w - g * y - b * y - g * h), c = E - v, a = E - c, S[0] = E - (c + a) + (a - v), p = _ + c, a = p - _, M = _ - (p - a) + (c - a), c = M - w, a = M - c, S[1] = M - (c + a) + (a - w), A = p + c, a = A - p, S[2] = p - (A - a) + (c - a), S[3] = A;
  const ft = q(4, U, 4, S, Q);
  _ = B * m, l = I * B, g = l - (l - B), b = B - g, l = I * m, y = l - (l - m), h = m - y, E = b * h - (_ - g * y - b * y - g * h), w = P * f, l = I * P, g = l - (l - P), b = P - g, l = I * f, y = l - (l - f), h = f - y, v = b * h - (w - g * y - b * y - g * h), c = E - v, a = E - c, S[0] = E - (c + a) + (a - v), p = _ + c, a = p - _, M = _ - (p - a) + (c - a), c = M - w, a = M - c, S[1] = M - (c + a) + (a - w), A = p + c, a = A - p, S[2] = p - (A - a) + (c - a), S[3] = A;
  const ht = q(ft, Q, 4, S, H);
  _ = u * m, l = I * u, g = l - (l - u), b = u - g, l = I * m, y = l - (l - m), h = m - y, E = b * h - (_ - g * y - b * y - g * h), w = d * f, l = I * d, g = l - (l - d), b = d - g, l = I * f, y = l - (l - f), h = f - y, v = b * h - (w - g * y - b * y - g * h), c = E - v, a = E - c, S[0] = E - (c + a) + (a - v), p = _ + c, a = p - _, M = _ - (p - a) + (c - a), c = M - w, a = M - c, S[1] = M - (c + a) + (a - w), A = p + c, a = A - p, S[2] = p - (A - a) + (c - a), S[3] = A;
  const dt = q(ht, H, 4, S, tt);
  return tt[dt - 1];
}
function vt(r, t, e, n, o, i) {
  const s = (t - i) * (e - o), u = (r - o) * (n - i), d = s - u, f = Math.abs(s + u);
  return Math.abs(d) >= xt * f ? d : -_t(r, t, e, n, o, i, f);
}
function Et(r, t) {
  var e, n, o = 0, i, s, u, d, f, m, a, l = r[0], g = r[1], b = t.length;
  for (e = 0; e < b; e++) {
    n = 0;
    var y = t[e], h = y.length - 1;
    if (m = y[0], m[0] !== y[h][0] && m[1] !== y[h][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = m[0] - l, u = m[1] - g, n; n < h; n++) {
      if (a = y[n + 1], d = a[0] - l, f = a[1] - g, u === 0 && f === 0) {
        if (d <= 0 && s >= 0 || s <= 0 && d >= 0)
          return 0;
      } else if (f >= 0 && u <= 0 || f <= 0 && u >= 0) {
        if (i = vt(s, d, u, f, 0, 0), i === 0)
          return 0;
        (i > 0 && f > 0 && u <= 0 || i < 0 && f <= 0 && u > 0) && o++;
      }
      m = a, u = f, s = d;
    }
  }
  return o % 2 !== 0;
}
function F(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = mt(r), o = gt(t), i = o.type, s = t.bbox;
  let u = o.coordinates;
  if (s && Tt(n, s) === !1)
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
function Tt(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function z(r, t) {
  for (let e = 0; e < t.features.length; e++)
    if (F(r, t.features[e]))
      return t.features[e];
}
function at(r, t, e) {
  const n = t.geometry.coordinates[0][0], o = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], s = r.geometry.coordinates, u = t.properties.a.geom, d = t.properties.b.geom, f = t.properties.c.geom, m = [o[0] - n[0], o[1] - n[1]], a = [i[0] - n[0], i[1] - n[1]], l = [s[0] - n[0], s[1] - n[1]], g = [d[0] - u[0], d[1] - u[1]], b = [f[0] - u[0], f[1] - u[1]];
  let y = (a[1] * l[0] - a[0] * l[1]) / (m[0] * a[1] - m[1] * a[0]), h = (m[0] * l[1] - m[1] * l[0]) / (m[0] * a[1] - m[1] * a[0]);
  if (e) {
    const c = e[t.properties.a.index], p = e[t.properties.b.index], M = e[t.properties.c.index];
    let _;
    if (y < 0 || h < 0 || 1 - y - h < 0) {
      const E = y / (y + h), w = h / (y + h);
      _ = y / p / (E / p + w / M), h = h / M / (E / p + w / M);
    } else
      _ = y / p / (y / p + h / M + (1 - y - h) / c), h = h / M / (y / p + h / M + (1 - y - h) / c);
    y = _;
  }
  return [
    y * g[0] + h * b[0] + u[0],
    y * g[1] + h * b[1] + u[1]
  ];
}
function At(r, t, e, n) {
  const o = r.geometry.coordinates, i = e.geometry.coordinates, s = Math.atan2(o[0] - i[0], o[1] - i[1]), u = St(s, t[0]);
  if (u === void 0)
    throw new Error("Unable to determine vertex index");
  const d = t[1][u];
  return at(r, d.features[0], n);
}
function It(r, t, e, n, o, i, s, u) {
  let d;
  if (s && (d = z(r, L([s]))), !d)
    if (e) {
      const f = r.geometry.coordinates, m = e.gridNum, a = e.xOrigin, l = e.yOrigin, g = e.xUnit, b = e.yUnit, y = e.gridCache, h = k(f[0], a, g, m), c = k(f[1], l, b, m), p = y[h] ? y[h][c] ? y[h][c] : [] : [], M = L(p.map((_) => t.features[_]));
      d = z(r, M);
    } else
      d = z(r, t);
  return u && u(d), d ? at(r, d, i) : At(r, n, o, i);
}
function k(r, t, e, n) {
  let o = Math.floor((r - t) / e);
  return o < 0 && (o = 0), o >= n && (o = n - 1), o;
}
function St(r, t) {
  let e = rt(r - t[0]), n = Math.PI * 2, o;
  for (let i = 0; i < t.length; i++) {
    const s = (i + 1) % t.length, u = rt(r - t[s]), d = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && d < n && (n = d, o = i), e = u;
  }
  return o;
}
function rt(r, t = !1) {
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
  ), e = r.geometry.coordinates[0], n = r.properties, o = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return Y([t], o);
}
function Bt(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return Y([t], e);
}
function j(r, t, e, n, o, i = !1, s) {
  const u = r.map(
    (d) => {
      (!s || s < 2.00703) && (d = ct(d));
      const f = isFinite(d) ? t[d] : d === "c" ? n : (function() {
        const m = d.match(/^b(\d+)$/);
        if (m) return o[parseInt(m[1])];
        const a = d.match(/^e(\d+)$/);
        if (a) return e[parseInt(a[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[f[1], f[0]], d] : [[f[0], f[1]], d];
    }
  );
  return Bt(u);
}
function ct(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Ct(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const J = 2.00703;
function Pt(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function Ot(r) {
  return {
    points: r.points,
    pointsWeightBuffer: Rt(r),
    strictStatus: Nt(r),
    verticesParams: Xt(r),
    centroid: Wt(r),
    edges: Ct(r.edges || []),
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
  const t = Lt(r), e = t.tins;
  return {
    compiled: t,
    tins: e,
    points: Vt(e),
    strictStatus: t.strict_status,
    pointsWeightBuffer: t.weight_buffer,
    verticesParams: t.vertices_params,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Rt(r) {
  return !r.version || r.version < J ? ["forw", "bakw"].reduce((t, e) => {
    const n = r.weight_buffer[e];
    return n && (t[e] = Object.keys(n).reduce((o, i) => {
      const s = ct(i);
      return o[s] = n[i], o;
    }, {})), t;
  }, {}) : r.weight_buffer;
}
function Nt(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function Xt(r) {
  const t = {
    forw: [r.vertices_params[0]],
    bakw: [r.vertices_params[1]]
  };
  return t.forw[1] = et(r, !1), t.bakw[1] = et(r, !0), t;
}
function et(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, o) => {
    const i = (o + 1) % e, s = j(
      ["c", `b${o}`, `b${i}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      J
    );
    return L([s]);
  });
}
function Wt(r) {
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
    forw: L(
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
    bakw: L(
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
      bakw: L(
        r.map((t) => W(t))
      )
    };
}
function Lt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Vt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    ["a", "b", "c"].forEach((i, s) => {
      const u = o.geometry.coordinates[0][s], d = o.properties[i].geom, f = o.properties[i].index;
      typeof f == "number" && (t[f] = [u, d]);
    });
  }
  return t;
}
const jt = J, T = class T {
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
    x(this, "yaxisMode", T.YAXIS_INVERT);
    x(this, "strictMode", T.MODE_AUTO);
    x(this, "vertexMode", T.VERTEX_PLAIN);
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
  setCompiled(t) {
    if (Pt(t)) {
      this.applyModernState(Ot(t));
      return;
    }
    this.applyLegacyState(kt(t));
  }
  applyModernState(t) {
    this.points = t.points, this.pointsWeightBuffer = t.pointsWeightBuffer, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? T.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? T.VERTEX_PLAIN, this.strictMode = t.strictMode ?? T.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
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
    const t = this.tins, e = t.forw, n = t.bakw, o = Math.ceil(Math.sqrt(e.features.length));
    if (o < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], s = [];
    const u = e.features.map((y) => {
      let h = [];
      return Z(y)[0].map((c) => {
        i.length === 0 ? i = [Array.from(c), Array.from(c)] : (c[0] < i[0][0] && (i[0][0] = c[0]), c[0] > i[1][0] && (i[1][0] = c[0]), c[1] < i[0][1] && (i[0][1] = c[1]), c[1] > i[1][1] && (i[1][1] = c[1])), h.length === 0 ? h = [Array.from(c), Array.from(c)] : (c[0] < h[0][0] && (h[0][0] = c[0]), c[0] > h[1][0] && (h[1][0] = c[0]), c[1] < h[0][1] && (h[0][1] = c[1]), c[1] > h[1][1] && (h[1][1] = c[1]));
      }), h;
    }), d = (i[1][0] - i[0][0]) / o, f = (i[1][1] - i[0][1]) / o, m = u.reduce(
      (y, h, c) => {
        const p = k(h[0][0], i[0][0], d, o), M = k(h[1][0], i[0][0], d, o), _ = k(h[0][1], i[0][1], f, o), E = k(h[1][1], i[0][1], f, o);
        for (let w = p; w <= M; w++) {
          y[w] || (y[w] = []);
          for (let v = _; v <= E; v++)
            y[w][v] || (y[w][v] = []), y[w][v].push(c);
        }
        return y;
      },
      []
    ), a = n.features.map((y) => {
      let h = [];
      return Z(y)[0].map((c) => {
        s.length === 0 ? s = [Array.from(c), Array.from(c)] : (c[0] < s[0][0] && (s[0][0] = c[0]), c[0] > s[1][0] && (s[1][0] = c[0]), c[1] < s[0][1] && (s[0][1] = c[1]), c[1] > s[1][1] && (s[1][1] = c[1])), h.length === 0 ? h = [Array.from(c), Array.from(c)] : (c[0] < h[0][0] && (h[0][0] = c[0]), c[0] > h[1][0] && (h[1][0] = c[0]), c[1] < h[0][1] && (h[0][1] = c[1]), c[1] > h[1][1] && (h[1][1] = c[1]));
      }), h;
    }), l = (s[1][0] - s[0][0]) / o, g = (s[1][1] - s[0][1]) / o, b = a.reduce(
      (y, h, c) => {
        const p = k(h[0][0], s[0][0], l, o), M = k(h[1][0], s[0][0], l, o), _ = k(h[0][1], s[0][1], g, o), E = k(h[1][1], s[0][1], g, o);
        for (let w = p; w <= M; w++) {
          y[w] || (y[w] = []);
          for (let v = _; v <= E; v++)
            y[w][v] || (y[w][v] = []), y[w][v].push(c);
        }
        return y;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: o,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: d,
        yUnit: f,
        gridCache: m
      },
      bakw: {
        gridNum: o,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
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
    if (e && this.strict_status == T.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    this.yaxisMode == T.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const o = W(t);
    if (this.bounds && !e && !n && !F(o, this.boundsPolygon))
      return !1;
    const i = e ? this.tins.bakw : this.tins.forw, s = e ? this.indexedTins.bakw : this.indexedTins.forw, u = e ? this.vertices_params.bakw : this.vertices_params.forw, d = e ? this.centroid.bakw : this.centroid.forw, f = e ? this.pointsWeightBuffer.bakw : this.pointsWeightBuffer.forw;
    let m, a;
    this.stateFull && (this.stateBackward == e ? m = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), a = (g) => {
      this.stateTriangle = g;
    });
    let l = It(
      o,
      i,
      s,
      u,
      d,
      f,
      m,
      a
    );
    if (this.bounds && e && !n) {
      const g = W(l);
      if (!F(g, this.boundsPolygon)) return !1;
    } else this.yaxisMode == T.YAXIS_FOLLOW && !e && (l = [l[0], -1 * l[1]]);
    return l;
  }
};
/**
 * 各種モードの定数定義
 * すべてreadonlyで、型安全性を確保
 */
x(T, "VERTEX_PLAIN", "plain"), x(T, "VERTEX_BIRDEYE", "birdeye"), x(T, "MODE_STRICT", "strict"), x(T, "MODE_AUTO", "auto"), x(T, "MODE_LOOSE", "loose"), x(T, "STATUS_STRICT", "strict"), x(T, "STATUS_ERROR", "strict_error"), x(T, "STATUS_LOOSE", "loose"), x(T, "YAXIS_FOLLOW", "follow"), x(T, "YAXIS_INVERT", "invert");
let $ = T;
const R = 20037508342789244e-9, Dt = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
];
function ut(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * R / 128 / Math.pow(2, t);
}
function Yt(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const o = r[n], i = o[0] * Math.cos(t) - o[1] * Math.sin(t), s = o[0] * Math.sin(t) + o[1] * Math.cos(t);
    e.push([i, s]);
  }
  return e;
}
function nt(r, t, e, n) {
  const o = ut(n, t);
  return Yt(Dt, e).map((u) => [
    u[0] * o + r[0],
    u[1] * o + r[1]
  ]);
}
function st(r, t) {
  const e = r[0], o = r.slice(1, 5).map((g) => [
    g[0] - e[0],
    g[1] - e[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, u = 0, d = 0;
  for (let g = 0; g < 4; g++) {
    const b = o[g], y = i[g], h = Math.sqrt(Math.pow(b[0], 2) + Math.pow(b[1], 2));
    s += h;
    const c = b[0] * y[1] - b[1] * y[0], p = Math.acos(
      (b[0] * y[0] + b[1] * y[1]) / h
    ), M = c > 0 ? -1 * p : p;
    u += Math.cos(M), d += Math.sin(M);
  }
  const f = s / 4, m = Math.atan2(d, u), a = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(a * R / 128 / f) / Math.log(2);
  return { center: e, zoom: l, rotation: m };
}
function G(r, t) {
  const e = r[0] * (2 * R) / t - R, n = -1 * (r[1] * (2 * R) / t - R);
  return [e, n];
}
function ot(r, t) {
  const e = (r[0] + R) * t / (2 * R), n = (-r[1] + R) * t / (2 * R);
  return [e, n];
}
const $t = 256;
class Jt {
  constructor() {
    x(this, "mainTin", null);
    x(this, "subTins", []);
    x(this, "_maxxy", 0);
  }
  // ─── 初期化 ────────────────────────────────────────────────────────────────
  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(t) {
    const e = new $();
    if (e.setCompiled(t.compiled), this.mainTin = e, t.maxZoom !== void 0 && (this._maxxy = Math.pow(2, t.maxZoom) * $t), this.subTins = [], t.sub_maps)
      for (const n of t.sub_maps) {
        const o = new $();
        o.setCompiled(n.compiled);
        const i = n.bounds ?? n.compiled.bounds;
        if (!i)
          throw new Error(
            "SubMapData must have bounds or compiled.bounds to create xyBounds polygon"
          );
        const s = [...i, i[0]], u = s.map((d) => {
          const f = o.transform(d, !1);
          if (!f) throw new Error("Failed to transform sub-map bounds to mercator");
          return f;
        });
        this.subTins.push({
          tin: o,
          priority: n.priority,
          importance: n.importance,
          xyBounds: Y([s]),
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
      const { index: o, isMain: i } = e[n];
      if (i || F(W(t), this.subTins[o - 1].xyBounds)) {
        const s = this._transformByIndex(t, o, !1);
        if (s === !1) continue;
        return [o, s];
      }
    }
    return !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（複数レイヤー結果）
   * histmap_tin.ts merc2XyAsync_returnLayer() の同期版
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns 最大2要素の配列。各要素は [レイヤーインデックス, ピクセル座標] または undefined
   */
  merc2XyWithLayer(t) {
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: u, isMain: d }) => {
      const f = this._transformByIndex(t, s, !0);
      return f === !1 ? [u, s] : d || F(W(f), this.subTins[s - 1].xyBounds) ? [u, s, f] : [u, s];
    }).sort((s, u) => {
      const d = s[0].priority ?? 0, f = u[0].priority ?? 0;
      return d < f ? 1 : -1;
    }).reduce(
      (s, u, d, f) => {
        const m = u[0], a = u[1], l = u[2];
        if (!l) return s;
        for (let g = 0; g < d; g++) {
          const b = f[g][1];
          if (b === 0 || F(W(l), this.subTins[b - 1].xyBounds))
            if (s.length) {
              const h = !s[0], c = h ? s[1][2] : s[0][2], p = m.importance ?? 0, M = c.importance ?? 0;
              return !h || p < M ? s : [void 0, [a, l, m]];
            } else
              return [void 0, [a, l, m]];
        }
        return !s.length || !s[0] ? [[a, l, m]] : (s.push([a, l, m]), s.sort((g, b) => {
          const y = g[2].importance ?? 0, h = b[2].importance ?? 0;
          return y < h ? 1 : -1;
        }).filter((g, b) => b < 2));
      },
      []
    ).map((s) => {
      if (s)
        return [s[0], s[1]];
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
    return e.map((o, i) => {
      if (!o) {
        n = !0;
        return;
      }
      const s = o[0], u = o[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((f, m) => m === 0 ? u : this._transformByIndex(f, s, !0)).map((f) => this.xy2SysCoordInternal(f));
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
    const o = nt(t.center, t.zoom, t.rotation, e).map((f) => ot(f, this._maxxy)), i = this.xy2MercWithLayer(o[0]);
    if (!i) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const s = i[0], u = i[1];
    return o.map((f, m) => {
      if (m === 0) return u;
      const a = this._transformByIndex(f, s, !1);
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
    const n = this.merc2XyWithLayer(t[0]), o = n[0] || n[1];
    if (!o) throw new Error("mercs2Viewpoint: center point is out of bounds");
    const i = o[0], s = o[1], d = t.map((f, m) => {
      if (m === 0) return s;
      const a = this._transformByIndex(f, i, !0);
      if (a === !1) throw new Error(`mercs2Viewpoint: point ${m} is out of bounds`);
      return a;
    }).map((f) => G(f, this._maxxy));
    return st(d, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return ut(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, o) {
    return nt(t, e, n, o);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return st(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return G(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return ot(t, e);
  }
  // ─── 内部ヘルパー ──────────────────────────────────────────────────────────
  _assertMapData() {
    if (!this.mainTin)
      throw new Error("setMapData() must be called before transformation");
  }
  _assertMaxxy() {
    if (this._maxxy === 0)
      throw new Error(
        "MapData.maxZoom must be set for viewpoint conversion (xy2SysCoord / sysCoord2Xy)"
      );
  }
  /** priority 降順でソートした [index, tin, isMain] の配列を返す */
  _getTinsSortedByPriority() {
    return this._getAllTinsWithIndex().sort((e, n) => {
      const o = e.tin.priority ?? 0, i = n.tin.priority ?? 0;
      return o < i ? 1 : -1;
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
    const o = this.subTins[e - 1];
    return o ? o.tin.transform(t, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return G(t, this._maxxy);
  }
}
export {
  Dt as MERC_CROSSMATRIX,
  R as MERC_MAX,
  Jt as MapTransform,
  $ as Transform,
  Gt as counterTri,
  jt as format_version,
  nt as mercViewpoint2Mercs,
  st as mercs2MercViewpoint,
  Ct as normalizeEdges,
  Yt as rotateMatrix,
  zt as rotateVerticesTriangle,
  ot as sysCoord2Xy,
  It as transformArr,
  G as xy2SysCoord,
  ut as zoom2Radius
};
