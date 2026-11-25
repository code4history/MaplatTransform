function at(r, t, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = t || {}, n.geometry = r, n;
}
function L(r, t, e = {}) {
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
function j(r, t, e = {}) {
  for (const i of r) {
    if (i.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (i[i.length - 1].length !== i[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let o = 0; o < i[i.length - 1].length; o++)
      if (i[i.length - 1][o] !== i[0][o])
        throw new Error("First and last Position are not equivalent.");
  }
  return at({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function U(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function K(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function xt(r) {
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
function pt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const X = 11102230246251565e-32, v = 134217729, bt = (3 + 8 * X) * X;
function Y(r, t, e, n, i) {
  let o, s, f, a, c = t[0], d = n[0], u = 0, l = 0;
  d > c == d > -c ? (o = c, c = t[++u]) : (o = d, d = n[++l]);
  let y = 0;
  if (u < r && l < e)
    for (d > c == d > -c ? (s = c + o, f = o - (s - c), c = t[++u]) : (s = d + o, f = o - (s - d), d = n[++l]), o = s, f !== 0 && (i[y++] = f); u < r && l < e; )
      d > c == d > -c ? (s = o + c, a = s - o, f = o - (s - a) + (c - a), c = t[++u]) : (s = o + d, a = s - o, f = o - (s - a) + (d - a), d = n[++l]), o = s, f !== 0 && (i[y++] = f);
  for (; u < r; )
    s = o + c, a = s - o, f = o - (s - a) + (c - a), c = t[++u], o = s, f !== 0 && (i[y++] = f);
  for (; l < e; )
    s = o + d, a = s - o, f = o - (s - a) + (d - a), d = n[++l], o = s, f !== 0 && (i[y++] = f);
  return (o !== 0 || y === 0) && (i[y++] = o), y;
}
function Mt(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function $(r) {
  return new Float64Array(r);
}
const _t = (3 + 16 * X) * X, Tt = (2 + 12 * X) * X, Et = (9 + 64 * X) * X * X, F = $(4), Q = $(8), H = $(12), tt = $(16), A = $(4);
function vt(r, t, e, n, i, o, s) {
  let f, a, c, d, u, l, y, x, w, g, h, m, M, _, E, T, p, b;
  const P = r - i, k = e - i, B = t - o, O = n - o;
  _ = P * O, l = v * P, y = l - (l - P), x = P - y, l = v * O, w = l - (l - O), g = O - w, E = x * g - (_ - y * w - x * w - y * g), T = B * k, l = v * B, y = l - (l - B), x = B - y, l = v * k, w = l - (l - k), g = k - w, p = x * g - (T - y * w - x * w - y * g), h = E - p, u = E - h, F[0] = E - (h + u) + (u - p), m = _ + h, u = m - _, M = _ - (m - u) + (h - u), h = M - T, u = M - h, F[1] = M - (h + u) + (u - T), b = m + h, u = b - m, F[2] = m - (b - u) + (h - u), F[3] = b;
  let R = Mt(4, F), D = Tt * s;
  if (R >= D || -R >= D || (u = r - P, f = r - (P + u) + (u - i), u = e - k, c = e - (k + u) + (u - i), u = t - B, a = t - (B + u) + (u - o), u = n - O, d = n - (O + u) + (u - o), f === 0 && a === 0 && c === 0 && d === 0) || (D = Et * s + bt * Math.abs(R), R += P * d + O * f - (B * c + k * a), R >= D || -R >= D)) return R;
  _ = f * O, l = v * f, y = l - (l - f), x = f - y, l = v * O, w = l - (l - O), g = O - w, E = x * g - (_ - y * w - x * w - y * g), T = a * k, l = v * a, y = l - (l - a), x = a - y, l = v * k, w = l - (l - k), g = k - w, p = x * g - (T - y * w - x * w - y * g), h = E - p, u = E - h, A[0] = E - (h + u) + (u - p), m = _ + h, u = m - _, M = _ - (m - u) + (h - u), h = M - T, u = M - h, A[1] = M - (h + u) + (u - T), b = m + h, u = b - m, A[2] = m - (b - u) + (h - u), A[3] = b;
  const yt = Y(4, F, 4, A, Q);
  _ = P * d, l = v * P, y = l - (l - P), x = P - y, l = v * d, w = l - (l - d), g = d - w, E = x * g - (_ - y * w - x * w - y * g), T = B * c, l = v * B, y = l - (l - B), x = B - y, l = v * c, w = l - (l - c), g = c - w, p = x * g - (T - y * w - x * w - y * g), h = E - p, u = E - h, A[0] = E - (h + u) + (u - p), m = _ + h, u = m - _, M = _ - (m - u) + (h - u), h = M - T, u = M - h, A[1] = M - (h + u) + (u - T), b = m + h, u = b - m, A[2] = m - (b - u) + (h - u), A[3] = b;
  const gt = Y(yt, Q, 4, A, H);
  _ = f * d, l = v * f, y = l - (l - f), x = f - y, l = v * d, w = l - (l - d), g = d - w, E = x * g - (_ - y * w - x * w - y * g), T = a * c, l = v * a, y = l - (l - a), x = a - y, l = v * c, w = l - (l - c), g = c - w, p = x * g - (T - y * w - x * w - y * g), h = E - p, u = E - h, A[0] = E - (h + u) + (u - p), m = _ + h, u = m - _, M = _ - (m - u) + (h - u), h = M - T, u = M - h, A[1] = M - (h + u) + (u - T), b = m + h, u = b - m, A[2] = m - (b - u) + (h - u), A[3] = b;
  const wt = Y(gt, H, 4, A, tt);
  return tt[wt - 1];
}
function St(r, t, e, n, i, o) {
  const s = (t - o) * (e - i), f = (r - i) * (n - o), a = s - f, c = Math.abs(s + f);
  return Math.abs(a) >= _t * c ? a : -vt(r, t, e, n, i, o, c);
}
function At(r, t) {
  var e, n, i = 0, o, s, f, a, c, d, u, l = r[0], y = r[1], x = t.length;
  for (e = 0; e < x; e++) {
    n = 0;
    var w = t[e], g = w.length - 1;
    if (d = w[0], d[0] !== w[g][0] && d[1] !== w[g][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = d[0] - l, f = d[1] - y, n; n < g; n++) {
      if (u = w[n + 1], a = u[0] - l, c = u[1] - y, f === 0 && c === 0) {
        if (a <= 0 && s >= 0 || s <= 0 && a >= 0)
          return 0;
      } else if (c >= 0 && f <= 0 || c <= 0 && f >= 0) {
        if (o = St(s, a, f, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && f <= 0 || o < 0 && c <= 0 && f > 0) && i++;
      }
      d = u, f = c, s = a;
    }
  }
  return i % 2 !== 0;
}
function N(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = xt(r), i = pt(t), o = i.type, s = t.bbox;
  let f = i.coordinates;
  if (s && It(n, s) === !1)
    return !1;
  o === "Polygon" && (f = [f]);
  for (var a = 0; a < f.length; ++a) {
    const c = At(n, f[a]);
    if (c === 0 && !e.ignoreBoundary) return !0;
    if (c) return !0;
  }
  return !1;
}
function It(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function W(r, t) {
  for (let e = 0; e < t.features.length; e++)
    if (N(r, t.features[e]))
      return t.features[e];
}
function ct(r, t) {
  const e = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = r.geometry.coordinates, s = t.properties.a.geom, f = t.properties.b.geom, a = t.properties.c.geom, c = [n[0] - e[0], n[1] - e[1]], d = [i[0] - e[0], i[1] - e[1]], u = [o[0] - e[0], o[1] - e[1]], l = [f[0] - s[0], f[1] - s[1]], y = [a[0] - s[0], a[1] - s[1]], x = (d[1] * u[0] - d[0] * u[1]) / (c[0] * d[1] - c[1] * d[0]), w = (c[0] * u[1] - c[1] * u[0]) / (c[0] * d[1] - c[1] * d[0]);
  return [
    x * l[0] + w * y[0] + s[0],
    x * l[1] + w * y[1] + s[1]
  ];
}
function Ct(r, t, e) {
  const n = r.geometry.coordinates, i = e.geometry.coordinates, o = Math.atan2(n[0] - i[0], n[1] - i[1]), s = Bt(o, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const f = t[1][s];
  return ct(r, f.features[0]);
}
function Pt(r, t, e, n, i, o, s, f) {
  let a;
  if (s && (a = W(r, U([s]))), !a)
    if (e) {
      const c = r.geometry.coordinates, d = e.gridNum, u = e.xOrigin, l = e.yOrigin, y = e.xUnit, x = e.yUnit, w = e.gridCache, g = I(c[0], u, y, d), h = I(c[1], l, x, d), m = w[g] ? w[g][h] ? w[g][h] : [] : [], M = U(m.map((_) => t.features[_]));
      a = W(r, M);
    } else
      a = W(r, t);
  return f && f(a), a ? ct(r, a) : Ct(r, n, i);
}
function I(r, t, e, n) {
  let i = Math.floor((r - t) / e);
  return i < 0 && (i = 0), i >= n && (i = n - 1), i;
}
const kt = 36;
function rt(r, t, e) {
  const n = (t[1][0] - t[0][0]) / e, i = (t[1][1] - t[0][1]) / e;
  return r.reduce((o, s) => {
    const f = I(s[0][0], t[0][0], n, e), a = I(s[1][0], t[0][0], n, e), c = I(s[0][1], t[0][1], i, e), d = I(s[1][1], t[0][1], i, e), u = (a - f + 1) * (d - c + 1);
    return u > 0 ? o + u : o;
  }, 0);
}
function Bt(r, t) {
  let e = et(r - t[0]), n = Math.PI * 2, i;
  for (let o = 0; o < t.length; o++) {
    const s = (o + 1) % t.length, f = et(r - t[s]), a = Math.min(Math.abs(e), Math.abs(f));
    e * f <= 0 && a < n && (n = a, i = o), e = f;
  }
  return i;
}
function et(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function Qt(r) {
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
function Ht(r) {
  const t = ["a", "b", "c", "a"].map(
    (o) => r.properties[o].geom
  ), e = r.geometry.coordinates[0], n = r.properties, i = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return j([t], i);
}
function Ot(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return j([t], e);
}
function z(r, t, e, n, i, o = !1, s) {
  const f = r.map(
    (a) => {
      (!s || s < 2.00703) && (a = Rt(a));
      const c = isFinite(a) ? t[a] : a === "c" ? n : (function() {
        const d = a.match(/^b(\d+)$/);
        if (d) return i[parseInt(d[1])];
        const u = a.match(/^e(\d+)$/);
        if (u) return e[parseInt(u[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return o ? [[c[1], c[0]], a] : [[c[0], c[1]], a];
    }
  );
  return Ot(f);
}
function Rt(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Lt(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const ut = 2.00704;
function Xt(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function Nt(r) {
  return {
    points: r.points,
    strictStatus: Ut(r),
    verticesParams: Dt(r),
    centroid: $t(r),
    edges: Lt(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Vt(r),
    kinks: Wt(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function Ft(r) {
  const t = jt(r), e = t.tins, n = t.vertices_params;
  return n != null && ft(n), {
    compiled: t,
    tins: e,
    points: Yt(e),
    strictStatus: t.strict_status,
    verticesParams: n,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Ut(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function Dt(r) {
  if (r.outerTransform === "worldFile" && !r.vertices_params)
    return { forw: [[], []], bakw: [[], []] };
  if (!Array.isArray(r.vertices_params) || !Array.isArray(r.vertices_points))
    throw new Error(
      "Invalid compiled data: vertices_params and vertices_points must be arrays"
    );
  const t = {
    forw: [r.vertices_params[0]],
    bakw: [r.vertices_params[1]]
  };
  return t.forw[1] = nt(r, !1), t.bakw[1] = nt(r, !0), ft(t), t;
}
function ft(r) {
  if (typeof r != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((t) => {
    const e = r[t];
    if (e == null) return;
    const n = `vertices_params.${t}`, i = e[0], o = e[1];
    if (!Array.isArray(i) || !Array.isArray(o))
      throw new Error(`Invalid compiled data: ${n} must hold two arrays`);
    if (i.length !== o.length)
      throw new Error(
        `Invalid compiled data: ${n} must have one angle per vertex`
      );
    for (let s = 0; s < i.length; s++)
      if (typeof i[s] != "number" || !Number.isFinite(i[s]))
        throw new Error(
          `Invalid compiled data: ${n} must contain only finite numbers`
        );
  });
}
function nt(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, i) => {
    const o = (i + 1) % e, s = z(
      ["c", `b${i}`, `b${o}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      ut
    );
    return U([s]);
  });
}
function $t(r) {
  return {
    forw: L(r.centroid_point[0], {
      target: {
        geom: r.centroid_point[1],
        index: "c"
      }
    }),
    bakw: L(r.centroid_point[1], {
      target: {
        geom: r.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Vt(r) {
  const t = r.tins_points.length === 1 ? 0 : 1;
  return {
    forw: U(
      r.tins_points[0].map(
        (e) => z(
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
        (e) => z(
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
function Wt(r) {
  if (r)
    return {
      bakw: U(
        r.map((t) => L(t))
      )
    };
}
function jt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Yt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    ["a", "b", "c"].forEach((o, s) => {
      const f = i.geometry.coordinates[0][s], a = i.properties[o].geom, c = i.properties[o].index;
      typeof c == "number" && (t[c] = [f, a]);
    });
  }
  return t;
}
function lt(r) {
  if (![
    r.xScale,
    r.xSkew,
    r.xOrigin,
    r.ySkew,
    r.yScale,
    r.yOrigin
  ].every(Number.isFinite))
    throw new Error("worldFile の係数はすべて有限の数でなければなりません");
  const e = r.xScale * r.yScale - r.xSkew * r.ySkew;
  if (!Number.isFinite(e) || e === 0)
    throw new Error("worldFile は非正則です（行列式が 0）");
  if (e > 0)
    throw new Error("worldFile は鏡像です。yScale の符号を確かめてください");
}
function ht(r, t) {
  const e = t[0] - 0.5, n = t[1] - 0.5;
  return [
    r.xScale * e + r.xSkew * n + r.xOrigin,
    r.ySkew * e + r.yScale * n + r.yOrigin
  ];
}
function dt(r, t) {
  const e = r.xScale * r.yScale - r.xSkew * r.ySkew, n = t[0] - r.xOrigin, i = t[1] - r.yOrigin;
  return [
    (r.yScale * n - r.xSkew * i) / e + 0.5,
    (-r.ySkew * n + r.xScale * i) / e + 0.5
  ];
}
const tr = ut;
class C {
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
  /** @deprecated 2.00704 以降、Transform はこのプロパティを設定も参照もしない。サブクラス（MaplatTin）は、旧 @maplat/transform と組まれたときの互換のため {} を入れる */
  pointsWeightBuffer;
  strict_status;
  vertices_params;
  centroid;
  edgeNodes;
  edges;
  tins;
  kinks;
  yaxisMode = C.YAXIS_INVERT;
  strictMode = C.MODE_AUTO;
  vertexMode = C.VERTEX_PLAIN;
  bounds;
  boundsPolygon;
  wh;
  xy;
  indexedTins;
  stateFull = !1;
  stateTriangle;
  stateBackward;
  outerTransform = "extrapolate";
  worldFile;
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
    if (t.outerTransform !== void 0 && t.outerTransform !== "extrapolate" && t.outerTransform !== "worldFile")
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    if (this.outerTransform = t.outerTransform ?? "extrapolate", this.worldFile = t.worldFile, this.outerTransform === "worldFile") {
      if (!this.worldFile) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      lt(this.worldFile), t.centroid_point || (t = {
        ...t,
        centroid_point: t.centroid_point ?? [[0, 0], [0, 0]]
      });
    }
    if (Xt(t)) {
      this.applyModernState(Nt(t));
      return;
    }
    this.applyLegacyState(Ft(t));
  }
  applyModernState(t) {
    this.points = t.points, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? C.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? C.VERTEX_PLAIN, this.strictMode = t.strictMode ?? C.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
  }
  applyLegacyState(t) {
    this.tins = t.tins, this.addIndexedTin(), this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.kinks = t.kinks, this.points = t.points;
  }
  /**
   * TINネットワークのインデックスを作成します
   *
   * インデックスは変換処理を高速化するために使用されます。
   * グリッド形式のインデックスを作成し、各グリッドに
   * 含まれる三角形を記録します。
   * セル数が MAX_INDEX_CELLS_PER_TRIANGLE で決まる上限を超えるデータは
   * 索引を作らず、変換時に全三角形を線形に探します。
   */
  addIndexedTin() {
    const t = this.tins, e = t.forw, n = t.bakw, i = Math.ceil(Math.sqrt(e.features.length));
    if (i < 3) {
      this.indexedTins = void 0;
      return;
    }
    let o = [], s = [];
    const f = e.features.map((g) => {
      let h = [];
      return J(g)[0].map((m) => {
        o.length === 0 ? o = [Array.from(m), Array.from(m)] : (m[0] < o[0][0] && (o[0][0] = m[0]), m[0] > o[1][0] && (o[1][0] = m[0]), m[1] < o[0][1] && (o[0][1] = m[1]), m[1] > o[1][1] && (o[1][1] = m[1])), h.length === 0 ? h = [Array.from(m), Array.from(m)] : (m[0] < h[0][0] && (h[0][0] = m[0]), m[0] > h[1][0] && (h[1][0] = m[0]), m[1] < h[0][1] && (h[0][1] = m[1]), m[1] > h[1][1] && (h[1][1] = m[1]));
      }), h;
    }), a = n.features.map((g) => {
      let h = [];
      return J(g)[0].map((m) => {
        s.length === 0 ? s = [Array.from(m), Array.from(m)] : (m[0] < s[0][0] && (s[0][0] = m[0]), m[0] > s[1][0] && (s[1][0] = m[0]), m[1] < s[0][1] && (s[0][1] = m[1]), m[1] > s[1][1] && (s[1][1] = m[1])), h.length === 0 ? h = [Array.from(m), Array.from(m)] : (m[0] < h[0][0] && (h[0][0] = m[0]), m[0] > h[1][0] && (h[1][0] = m[0]), m[1] < h[0][1] && (h[0][1] = m[1]), m[1] > h[1][1] && (h[1][1] = m[1]));
      }), h;
    });
    if (Math.max(
      rt(f, o, i),
      rt(a, s, i)
    ) > kt * e.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const d = (o[1][0] - o[0][0]) / i, u = (o[1][1] - o[0][1]) / i, l = f.reduce(
      (g, h, m) => {
        const M = I(h[0][0], o[0][0], d, i), _ = I(h[1][0], o[0][0], d, i), E = I(h[0][1], o[0][1], u, i), T = I(h[1][1], o[0][1], u, i);
        for (let p = M; p <= _; p++) {
          g[p] || (g[p] = []);
          for (let b = E; b <= T; b++)
            g[p][b] || (g[p][b] = []), g[p][b].push(m);
        }
        return g;
      },
      []
    ), y = (s[1][0] - s[0][0]) / i, x = (s[1][1] - s[0][1]) / i, w = a.reduce(
      (g, h, m) => {
        const M = I(h[0][0], s[0][0], y, i), _ = I(h[1][0], s[0][0], y, i), E = I(h[0][1], s[0][1], x, i), T = I(h[1][1], s[0][1], x, i);
        for (let p = M; p <= _; p++) {
          g[p] || (g[p] = []);
          for (let b = E; b <= T; b++)
            g[p][b] || (g[p][b] = []), g[p][b].push(m);
        }
        return g;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: i,
        xOrigin: o[0][0],
        yOrigin: o[0][1],
        xUnit: d,
        yUnit: u,
        gridCache: l
      },
      bakw: {
        gridNum: i,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: y,
        yUnit: x,
        gridCache: w
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
    const i = t;
    this.yaxisMode == C.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const o = L(t);
    if (this.bounds && !e && !n && !N(o, this.boundsPolygon))
      return !1;
    const s = e ? this.tins.bakw : this.tins.forw;
    if (this.outerTransform === "worldFile" && s && !W(o, s))
      return e ? dt(this.worldFile, i) : ht(this.worldFile, i);
    if (e && this.strict_status == C.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const f = e ? this.indexedTins?.bakw : this.indexedTins?.forw, a = e ? this.vertices_params.bakw : this.vertices_params.forw, c = e ? this.centroid.bakw : this.centroid.forw;
    let d, u;
    this.stateFull && (this.stateBackward == e ? d = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), u = (y) => {
      this.stateTriangle = y;
    });
    let l = Pt(
      o,
      s,
      f,
      a,
      c,
      void 0,
      d,
      u
    );
    if (this.bounds && e && !n) {
      const y = L(l);
      if (!N(y, this.boundsPolygon)) return !1;
    } else this.yaxisMode == C.YAXIS_FOLLOW && !e && (l = [l[0], -1 * l[1]]);
    return l;
  }
}
const S = 20037508342789244e-9, Gt = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], V = 6378137, qt = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function Z(r) {
  return r.length >= 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]);
}
function zt(r) {
  if (r.epsg !== 3857 && r.epsg !== 4326)
    throw new Error(`一期では EPSG:${r.epsg} の CRS に対応していません`);
  if (r.wkt && !r.proj4)
    throw new Error("一期では WKT だけの CRS 定義に対応していません");
  if (!r.proj4) return;
  const t = r.proj4.trim().split(/\s+/).filter(Boolean).map((i) => {
    const [o, ...s] = i.replace(/^\+/, "").split("="), f = o.toLowerCase(), a = s.join("=");
    if (f === "axis" && a !== "enu")
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if (["no_defs", "type", "wktext"].includes(f) || f === "axis" && a === "enu" || f === "towgs84" && /^0(?:\.0+)?(?:,0(?:\.0+)?){2,6}$/.test(a)) return "";
    const c = a ? a.split(",").map((d) => {
      const u = Number(d);
      return d.trim() !== "" && Number.isFinite(u) ? String(u) : d.toLowerCase();
    }).join(",") : "";
    return `+${f}${a ? `=${c}` : ""}`;
  }).filter(Boolean), e = [...new Set(t)].sort().join(" ");
  if (!(r.epsg === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : ["+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"]).includes(e))
    throw new Error(`epsg と proj4 が一致しないか、一期では判定できない CRS です（EPSG:${r.epsg}）`);
}
const Zt = {
  toLonLat(r, t) {
    return Z(r) ? t.epsg === 4326 ? Math.abs(r[1]) <= 90 ? r.slice(0, 2) : !1 : t.epsg !== 3857 || Math.abs(r[0]) > S || Math.abs(r[1]) > S ? !1 : [
      r[0] / V * (180 / Math.PI),
      (2 * Math.atan(Math.exp(r[1] / V)) - Math.PI / 2) * (180 / Math.PI)
    ] : !1;
  },
  fromLonLat(r, t) {
    if (!Z(r) || Math.abs(r[0]) > 180 || Math.abs(r[1]) > qt) return !1;
    if (t.epsg === 4326) return r.slice(0, 2);
    if (t.epsg !== 3857) return !1;
    const e = r[0] * Math.PI / 180, n = r[1] * Math.PI / 180, i = [V * e, V * Math.log(Math.tan(Math.PI / 4 + n / 2))];
    return i.every(Number.isFinite) ? i : !1;
  }
};
class Kt {
  crs;
  worldFile;
  projectionEngine;
  wh;
  xy;
  bounds;
  priority;
  importance;
  points = [];
  edges = [];
  constructor(t) {
    if (lt(t.worldFile), zt(t.crs), t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (!t.wh && !t.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? Zt;
    const e = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = e.map((f) => f[0]), i = e.map((f) => f[1]), o = Math.min(...n), s = Math.min(...i);
      this.wh = [Math.max(...n) - o, Math.max(...i) - s], this.xy = t.xy ?? [o, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance;
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return ht(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return dt(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, e = !1, n = !1) {
    if (!Z(t)) return !1;
    if (!e) {
      const s = this.xyToCrs(t);
      if (this.crs.epsg === 3857)
        return Math.abs(s[0]) <= S && Math.abs(s[1]) <= S ? s : !1;
      const f = this.projectionEngine.toLonLat(s, this.crs);
      return f === !1 ? !1 : this.projectionEngine.fromLonLat(f, { epsg: 3857 });
    }
    if (this.crs.epsg === 3857)
      return Math.abs(t[0]) <= S && Math.abs(t[1]) <= S ? this.crsToXy(t) : !1;
    const i = this.projectionEngine.toLonLat(t, { epsg: 3857 });
    if (i === !1) return !1;
    const o = this.projectionEngine.fromLonLat(i, this.crs);
    return o === !1 ? !1 : this.crsToXy(o);
  }
}
function mt(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * S / 128 / Math.pow(2, t);
}
function Jt(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const i = r[n], o = i[0] * Math.cos(t) - i[1] * Math.sin(t), s = i[0] * Math.sin(t) + i[1] * Math.cos(t);
    e.push([o, s]);
  }
  return e;
}
function st(r, t, e, n) {
  const i = mt(n, t);
  return Jt(Gt, e).map((f) => [
    f[0] * i + r[0],
    f[1] * i + r[1]
  ]);
}
function it(r, t) {
  const e = r[0], i = r.slice(1, 5).map((y) => [
    y[0] - e[0],
    y[1] - e[1]
  ]), o = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, f = 0, a = 0;
  for (let y = 0; y < 4; y++) {
    const x = i[y], w = o[y], g = Math.sqrt(Math.pow(x[0], 2) + Math.pow(x[1], 2));
    s += g;
    const h = x[0] * w[1] - x[1] * w[0], m = Math.acos(
      (x[0] * w[0] + x[1] * w[1]) / g
    ), M = h > 0 ? -1 * m : m;
    f += Math.cos(M), a += Math.sin(M);
  }
  const c = s / 4, d = Math.atan2(a, f), u = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(u * S / 128 / c) / Math.log(2);
  return { center: e, zoom: l, rotation: d };
}
function G(r, t) {
  const e = r[0] * (2 * S) / t - S, n = -1 * (r[1] * (2 * S) / t - S);
  return [e, n];
}
function ot(r, t) {
  const e = (r[0] + S) * t / (2 * S), n = (-r[1] + S) * t / (2 * S);
  return [e, n];
}
const q = 256;
class rr {
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
    this.setLayeredMapData({
      main: { kind: "tin", compiled: t.compiled },
      maxZoom: t.maxZoom,
      sub_maps: t.sub_maps?.map((e) => ({ kind: "tin", ...e }))
    });
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this.mainTin = this._createSurface(t.main);
    const e = this.mainTin.wh;
    if (t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * q;
    else if (e) {
      const n = Math.max(e[0], e[1]), i = Math.ceil(Math.log2(n / q));
      this._maxxy = Math.pow(2, i) * q;
    }
    this.subTins = [];
    for (const n of t.sub_maps ?? []) {
      const i = this._createSurface(n), o = n.bounds ?? (n.kind === "tin" ? n.compiled.bounds : void 0);
      if (!o) throw new Error("副層には bounds または compiled.bounds が必要です");
      const s = [...o, o[0]], f = s.map((a) => {
        const c = i.transform(a, !1);
        if (!c) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return c;
      });
      this.subTins.push({
        tin: i,
        priority: n.priority ?? 0,
        importance: n.importance ?? 0,
        xyBounds: j([s]),
        mercBounds: j([f])
      });
    }
  }
  _createSurface(t) {
    if (t.kind === "worldFile") return new Kt(t);
    const e = new C();
    return e.setCompiled(t.compiled), e.priority = t.priority, e.importance = t.importance, e;
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
      const { index: i, isMain: o } = e[n];
      if (o || N(L(t), this.subTins[i - 1].xyBounds)) {
        const s = this._transformByIndex(t, i, !1);
        if (s === !1) continue;
        return [i, s];
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: f, isMain: a }) => {
      const c = this._transformByIndex(t, s, !0);
      return c === !1 ? [f, s] : a || N(L(c), this.subTins[s - 1].xyBounds) ? [f, s, c] : [f, s];
    }).sort((s, f) => {
      const a = s[0].priority ?? 0, c = f[0].priority ?? 0;
      return a < c ? 1 : -1;
    }).reduce(
      (s, f, a, c) => {
        const d = f[0], u = f[1], l = f[2];
        if (!l) return s;
        for (let y = 0; y < a; y++) {
          const x = c[y][1], w = x === 0;
          if (c[y][2] && (w || N(L(l), this.subTins[x - 1].xyBounds)))
            if (s.length) {
              const g = !s[0], h = g ? s[1][2] : s[0][2], m = d.importance ?? 0, M = h.importance ?? 0;
              return g ? m < M ? s : [void 0, [u, l, d]] : [...s.filter(
                (T) => T !== void 0
              ), [u, l, d]].sort(
                (T, p) => (T[2].importance ?? 0) < (p[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[u, l, d]];
        }
        return !s.length || !s[0] ? [[u, l, d]] : (s.push([u, l, d]), s.sort((y, x) => {
          const w = y[2].importance ?? 0, g = x[2].importance ?? 0;
          return w < g ? 1 : -1;
        }).filter((y, x) => x < 2));
      },
      []
    ).map((s) => {
      if (s)
        return [s[0], s[1]];
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
    const e = this._getAllTinsWithIndex(), n = (a) => a === 0 ? 0 : this.subTins[a - 1].priority ?? 0, i = (a) => a === 0 ? 0 : this.subTins[a - 1].importance ?? 0, o = (a, c) => a === 0 || N(L(c), this.subTins[a - 1].xyBounds), s = [];
    for (const { index: a } of e) {
      const c = this._transformByIndex(t, a, !0);
      c !== !1 && o(a, c) && s.push({ index: a, xy: c });
    }
    const f = (a) => e.some(
      ({ index: c }) => c !== 0 && c !== a.index && (n(c) > n(a.index) || a.index === 0 && n(c) === 0) && o(c, a.xy)
    );
    return s.filter((a) => !f(a)).sort((a, c) => i(c.index) - i(a.index) || n(c.index) - n(a.index) || a.index - c.index).map((a) => [a.index, a.xy]);
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
    return e.map((i, o) => {
      if (!i) {
        n = !0;
        return;
      }
      const s = i[0], f = i[1];
      return o !== 0 && !n ? [this.xy2SysCoordInternal(f)] : t.map((c, d) => d === 0 ? f : this._transformByIndex(c, s, !0)).map((c) => this.xy2SysCoordInternal(c));
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
    const i = st(t.center, t.zoom, t.rotation, e).map((c) => ot(c, this._maxxy)), o = this.xy2MercWithLayer(i[0]);
    if (!o) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const s = o[0], f = o[1];
    return i.map((c, d) => {
      if (d === 0) return f;
      const u = this._transformByIndex(c, s, !1);
      if (u === !1) throw new Error(`viewpoint2Mercs: point ${d} is out of bounds`);
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
    const n = this.merc2XyWithLayer(t[0]), i = n[0] || n[1];
    if (!i) throw new Error("mercs2Viewpoint: center point is out of bounds");
    const o = i[0], s = i[1], a = t.map((c, d) => {
      if (d === 0) return s;
      const u = this._transformByIndex(c, o, !0);
      if (u === !1) throw new Error(`mercs2Viewpoint: point ${d} is out of bounds`);
      return u;
    }).map((c) => G(c, this._maxxy));
    return it(a, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return mt(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, i) {
    return st(t, e, n, i);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return it(t, e);
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
    if (t === 0) return this.mainTin instanceof C ? this.mainTin : null;
    const e = this.subTins[t - 1];
    return e?.tin instanceof C ? e.tin : null;
  }
  /** レイヤーインデックスに対応する変換面を返す */
  getSurfaceTransform(t) {
    return t === 0 ? this.mainTin : this.subTins[t - 1]?.tin ?? null;
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
      const i = e.tin.priority ?? 0, o = n.tin.priority ?? 0;
      return i < o ? 1 : -1;
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
    const i = this.subTins[e - 1];
    return i ? i.tin.transform(t, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return G(t, this._maxxy);
  }
}
export {
  Gt as MERC_CROSSMATRIX,
  S as MERC_MAX,
  rr as MapTransform,
  C as Transform,
  Kt as WorldFileSurface,
  Zt as builtinProjectionEngine,
  Ht as counterTri,
  dt as crsToWorldFilePixel,
  tr as format_version,
  st as mercViewpoint2Mercs,
  it as mercs2MercViewpoint,
  Lt as normalizeEdges,
  Jt as rotateMatrix,
  Qt as rotateVerticesTriangle,
  ot as sysCoord2Xy,
  Pt as transformArr,
  lt as validateWorldFile,
  ht as worldFileToCrs,
  G as xy2SysCoord,
  mt as zoom2Radius
};
