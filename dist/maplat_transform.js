function ut(r, t, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = t || {}, n.geometry = r, n;
}
function R(r, t, e = {}) {
  if (!r)
    throw new Error("coordinates is required");
  if (!Array.isArray(r))
    throw new Error("coordinates must be an Array");
  if (r.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!Q(r[0]) || !Q(r[1]))
    throw new Error("coordinates must contain numbers");
  return ut({
    type: "Point",
    coordinates: r
  }, t, e);
}
function z(r, t, e = {}) {
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
  return ut({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function j(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function Q(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function Mt(r) {
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
function H(r) {
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
function _t(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const F = 11102230246251565e-32, S = 134217729, Et = (3 + 8 * F) * F;
function G(r, t, e, n, i) {
  let o, s, u, a, c = t[0], l = n[0], f = 0, m = 0;
  l > c == l > -c ? (o = c, c = t[++f]) : (o = l, l = n[++m]);
  let y = 0;
  if (f < r && m < e)
    for (l > c == l > -c ? (s = c + o, u = o - (s - c), c = t[++f]) : (s = l + o, u = o - (s - l), l = n[++m]), o = s, u !== 0 && (i[y++] = u); f < r && m < e; )
      l > c == l > -c ? (s = o + c, a = s - o, u = o - (s - a) + (c - a), c = t[++f]) : (s = o + l, a = s - o, u = o - (s - a) + (l - a), l = n[++m]), o = s, u !== 0 && (i[y++] = u);
  for (; f < r; )
    s = o + c, a = s - o, u = o - (s - a) + (c - a), c = t[++f], o = s, u !== 0 && (i[y++] = u);
  for (; m < e; )
    s = o + l, a = s - o, u = o - (s - a) + (l - a), l = n[++m], o = s, u !== 0 && (i[y++] = u);
  return (o !== 0 || y === 0) && (i[y++] = o), y;
}
function vt(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function $(r) {
  return new Float64Array(r);
}
const Tt = (3 + 16 * F) * F, St = (2 + 12 * F) * F, At = (9 + 64 * F) * F * F, U = $(4), tt = $(8), rt = $(12), et = $(16), I = $(4);
function It(r, t, e, n, i, o, s) {
  let u, a, c, l, f, m, y, x, w, g, h, d, _, E, T, v, p, M;
  const P = r - i, k = e - i, O = t - o, N = n - o;
  E = P * N, m = S * P, y = m - (m - P), x = P - y, m = S * N, w = m - (m - N), g = N - w, T = x * g - (E - y * w - x * w - y * g), v = O * k, m = S * O, y = m - (m - O), x = O - y, m = S * k, w = m - (m - k), g = k - w, p = x * g - (v - y * w - x * w - y * g), h = T - p, f = T - h, U[0] = T - (h + f) + (f - p), d = E + h, f = d - E, _ = E - (d - f) + (h - f), h = _ - v, f = _ - h, U[1] = _ - (h + f) + (f - v), M = d + h, f = M - d, U[2] = d - (M - f) + (h - f), U[3] = M;
  let B = vt(4, U), W = St * s;
  if (B >= W || -B >= W || (f = r - P, u = r - (P + f) + (f - i), f = e - k, c = e - (k + f) + (f - i), f = t - O, a = t - (O + f) + (f - o), f = n - N, l = n - (N + f) + (f - o), u === 0 && a === 0 && c === 0 && l === 0) || (W = At * s + Et * Math.abs(B), B += P * l + N * u - (O * c + k * a), B >= W || -B >= W)) return B;
  E = u * N, m = S * u, y = m - (m - u), x = u - y, m = S * N, w = m - (m - N), g = N - w, T = x * g - (E - y * w - x * w - y * g), v = a * k, m = S * a, y = m - (m - a), x = a - y, m = S * k, w = m - (m - k), g = k - w, p = x * g - (v - y * w - x * w - y * g), h = T - p, f = T - h, I[0] = T - (h + f) + (f - p), d = E + h, f = d - E, _ = E - (d - f) + (h - f), h = _ - v, f = _ - h, I[1] = _ - (h + f) + (f - v), M = d + h, f = M - d, I[2] = d - (M - f) + (h - f), I[3] = M;
  const xt = G(4, U, 4, I, tt);
  E = P * l, m = S * P, y = m - (m - P), x = P - y, m = S * l, w = m - (m - l), g = l - w, T = x * g - (E - y * w - x * w - y * g), v = O * c, m = S * O, y = m - (m - O), x = O - y, m = S * c, w = m - (m - c), g = c - w, p = x * g - (v - y * w - x * w - y * g), h = T - p, f = T - h, I[0] = T - (h + f) + (f - p), d = E + h, f = d - E, _ = E - (d - f) + (h - f), h = _ - v, f = _ - h, I[1] = _ - (h + f) + (f - v), M = d + h, f = M - d, I[2] = d - (M - f) + (h - f), I[3] = M;
  const pt = G(xt, tt, 4, I, rt);
  E = u * l, m = S * u, y = m - (m - u), x = u - y, m = S * l, w = m - (m - l), g = l - w, T = x * g - (E - y * w - x * w - y * g), v = a * c, m = S * a, y = m - (m - a), x = a - y, m = S * c, w = m - (m - c), g = c - w, p = x * g - (v - y * w - x * w - y * g), h = T - p, f = T - h, I[0] = T - (h + f) + (f - p), d = E + h, f = d - E, _ = E - (d - f) + (h - f), h = _ - v, f = _ - h, I[1] = _ - (h + f) + (f - v), M = d + h, f = M - d, I[2] = d - (M - f) + (h - f), I[3] = M;
  const bt = G(pt, rt, 4, I, et);
  return et[bt - 1];
}
function Ct(r, t, e, n, i, o) {
  const s = (t - o) * (e - i), u = (r - i) * (n - o), a = s - u, c = Math.abs(s + u);
  return Math.abs(a) >= Tt * c ? a : -It(r, t, e, n, i, o, c);
}
function Pt(r, t) {
  var e, n, i = 0, o, s, u, a, c, l, f, m = r[0], y = r[1], x = t.length;
  for (e = 0; e < x; e++) {
    n = 0;
    var w = t[e], g = w.length - 1;
    if (l = w[0], l[0] !== w[g][0] && l[1] !== w[g][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = l[0] - m, u = l[1] - y, n; n < g; n++) {
      if (f = w[n + 1], a = f[0] - m, c = f[1] - y, u === 0 && c === 0) {
        if (a <= 0 && s >= 0 || s <= 0 && a >= 0)
          return 0;
      } else if (c >= 0 && u <= 0 || c <= 0 && u >= 0) {
        if (o = Ct(s, a, u, c, 0, 0), o === 0)
          return 0;
        (o > 0 && c > 0 && u <= 0 || o < 0 && c <= 0 && u > 0) && i++;
      }
      l = f, u = c, s = a;
    }
  }
  return i % 2 !== 0;
}
function L(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = Mt(r), i = _t(t), o = i.type, s = t.bbox;
  let u = i.coordinates;
  if (s && kt(n, s) === !1)
    return !1;
  o === "Polygon" && (u = [u]);
  for (var a = 0; a < u.length; ++a) {
    const c = Pt(n, u[a]);
    if (c === 0 && !e.ignoreBoundary) return !0;
    if (c) return !0;
  }
  return !1;
}
function kt(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function Y(r, t, e) {
  if (e) {
    const n = r.geometry.coordinates, i = A(n[0], e.xOrigin, e.xUnit, e.gridNum), o = A(n[1], e.yOrigin, e.yUnit, e.gridNum), s = e.gridCache[i]?.[o] ?? [];
    for (const u of s) {
      const a = t.features[u];
      if (a && L(r, a)) return a;
    }
    return;
  }
  for (let n = 0; n < t.features.length; n++)
    if (L(r, t.features[n]))
      return t.features[n];
}
function ft(r, t) {
  const e = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = r.geometry.coordinates, s = t.properties.a.geom, u = t.properties.b.geom, a = t.properties.c.geom, c = [n[0] - e[0], n[1] - e[1]], l = [i[0] - e[0], i[1] - e[1]], f = [o[0] - e[0], o[1] - e[1]], m = [u[0] - s[0], u[1] - s[1]], y = [a[0] - s[0], a[1] - s[1]], x = (l[1] * f[0] - l[0] * f[1]) / (c[0] * l[1] - c[1] * l[0]), w = (c[0] * f[1] - c[1] * f[0]) / (c[0] * l[1] - c[1] * l[0]);
  return [
    x * m[0] + w * y[0] + s[0],
    x * m[1] + w * y[1] + s[1]
  ];
}
function Ot(r, t, e) {
  const n = r.geometry.coordinates, i = e.geometry.coordinates, o = Math.atan2(n[0] - i[0], n[1] - i[1]), s = Bt(o, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const u = t[1][s];
  return ft(r, u.features[0]);
}
function Nt(r, t, e, n, i, o, s, u, a) {
  let c = a;
  if (!c && s && (c = Y(r, j([s]))), !c)
    if (e) {
      const l = r.geometry.coordinates, f = e.gridNum, m = e.xOrigin, y = e.yOrigin, x = e.xUnit, w = e.yUnit, g = e.gridCache, h = A(l[0], m, x, f), d = A(l[1], y, w, f), _ = g[h] ? g[h][d] ? g[h][d] : [] : [], E = j(_.map((T) => t.features[T]));
      c = Y(r, E);
    } else
      c = Y(r, t);
  return u && u(c), c ? ft(r, c) : Ot(r, n, i);
}
function A(r, t, e, n) {
  let i = Math.floor((r - t) / e);
  return i < 0 && (i = 0), i >= n && (i = n - 1), i;
}
const Rt = 36;
function nt(r, t, e) {
  const n = (t[1][0] - t[0][0]) / e, i = (t[1][1] - t[0][1]) / e;
  return r.reduce((o, s) => {
    const u = A(s[0][0], t[0][0], n, e), a = A(s[1][0], t[0][0], n, e), c = A(s[0][1], t[0][1], i, e), l = A(s[1][1], t[0][1], i, e), f = (a - u + 1) * (l - c + 1);
    return f > 0 ? o + f : o;
  }, 0);
}
function Bt(r, t) {
  let e = st(r - t[0]), n = Math.PI * 2, i;
  for (let o = 0; o < t.length; o++) {
    const s = (o + 1) % t.length, u = st(r - t[s]), a = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && a < n && (n = a, i = o), e = u;
  }
  return i;
}
function st(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function tr(r) {
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
function rr(r) {
  const t = ["a", "b", "c", "a"].map(
    (o) => r.properties[o].geom
  ), e = r.geometry.coordinates[0], n = r.properties, i = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return z([t], i);
}
function Lt(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return z([t], e);
}
function J(r, t, e, n, i, o = !1, s) {
  const u = r.map(
    (a) => {
      (!s || s < 2.00703) && (a = Ft(a));
      const c = isFinite(a) ? t[a] : a === "c" ? n : (function() {
        const l = a.match(/^b(\d+)$/);
        if (l) return i[parseInt(l[1])];
        const f = a.match(/^e(\d+)$/);
        if (f) return e[parseInt(f[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return o ? [[c[1], c[0]], a] : [[c[0], c[1]], a];
    }
  );
  return Lt(u);
}
function Ft(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Xt(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const lt = 2.00704;
function Ut(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function Vt(r) {
  return {
    points: r.points,
    strictStatus: Wt(r),
    verticesParams: $t(r),
    centroid: Dt(r),
    edges: Xt(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Yt(r),
    kinks: zt(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function jt(r) {
  const t = Gt(r), e = t.tins, n = t.vertices_params;
  return n != null && ht(n), {
    compiled: t,
    tins: e,
    points: qt(e),
    strictStatus: t.strict_status,
    verticesParams: n,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Wt(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function $t(r) {
  if ("outerTransform" in r && r.outerTransform === "worldFile" && !r.vertices_params)
    return { forw: [[], []], bakw: [[], []] };
  if (!Array.isArray(r.vertices_params) || !Array.isArray(r.vertices_points))
    throw new Error(
      "Invalid compiled data: vertices_params and vertices_points must be arrays"
    );
  const t = {
    forw: [r.vertices_params[0]],
    bakw: [r.vertices_params[1]]
  };
  return t.forw[1] = it(r, !1), t.bakw[1] = it(r, !0), ht(t), t;
}
function ht(r) {
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
function it(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, i) => {
    const o = (i + 1) % e, s = J(
      ["c", `b${i}`, `b${o}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      lt
    );
    return j([s]);
  });
}
function Dt(r) {
  return {
    forw: R(r.centroid_point[0], {
      target: {
        geom: r.centroid_point[1],
        index: "c"
      }
    }),
    bakw: R(r.centroid_point[1], {
      target: {
        geom: r.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Yt(r) {
  const t = r.tins_points.length === 1 ? 0 : 1;
  return {
    forw: j(
      r.tins_points[0].map(
        (e) => J(
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
    bakw: j(
      r.tins_points[t].map(
        (e) => J(
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
function zt(r) {
  if (r)
    return {
      bakw: j(
        r.map((t) => R(t))
      )
    };
}
function Gt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function qt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    ["a", "b", "c"].forEach((o, s) => {
      const u = i.geometry.coordinates[0][s], a = i.properties[o].geom, c = i.properties[o].index;
      typeof c == "number" && (t[c] = [u, a]);
    });
  }
  return t;
}
function mt(r) {
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
function dt(r, t) {
  const e = t[0] - 0.5, n = t[1] - 0.5;
  return [
    r.xScale * e + r.xSkew * n + r.xOrigin,
    r.ySkew * e + r.yScale * n + r.yOrigin
  ];
}
function yt(r, t) {
  const e = r.xScale * r.yScale - r.xSkew * r.ySkew, n = t[0] - r.xOrigin, i = t[1] - r.yOrigin;
  return [
    (r.yScale * n - r.xSkew * i) / e + 0.5,
    (-r.ySkew * n + r.xScale * i) / e + 0.5
  ];
}
const er = lt;
function Zt(r, t) {
  let e = !1;
  for (let n = 0, i = t.length - 1; n < t.length; i = n++) {
    const [o, s] = t[i], [u, a] = t[n], c = (r[0] - o) * (a - s) - (r[1] - s) * (u - o), l = Math.max(1, Math.abs(o), Math.abs(s), Math.abs(u), Math.abs(a)), f = Number.EPSILON * 16 * l, m = f * l;
    if (Math.abs(c) <= m && r[0] >= Math.min(o, u) - f && r[0] <= Math.max(o, u) + f && r[1] >= Math.min(s, a) - f && r[1] <= Math.max(s, a) + f) return !0;
    s > r[1] != a > r[1] && r[0] < (u - o) * (r[1] - s) / (a - s) + o && (e = !e);
  }
  return e;
}
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
  outerVertices;
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
    const e = "outerTransform" in t, n = e ? t.outerTransform : void 0;
    if (n !== void 0 && n !== "extrapolate" && n !== "worldFile")
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    const i = e ? t.worldFile : void 0;
    if (n === "worldFile") {
      if (!i) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      mt(i);
      const u = t.vertices_points;
      if (!Array.isArray(u) || u.length !== 4 || u.some((a) => !Array.isArray(a) || a.length < 2 || a.some((c) => !Array.isArray(c) || c.length < 2 || !c.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な4頂点が必要です');
    }
    const o = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = new C();
    Ut(o) ? s.applyModernState(Vt(o)) : s.applyLegacyState(jt(o));
    for (const u of ["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins"])
      Object.assign(this, { [u]: s[u] });
    this.outerTransform = n ?? "extrapolate", this.worldFile = i, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0;
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
    const u = e.features.map((g) => {
      let h = [];
      return H(g)[0].map((d) => {
        o.length === 0 ? o = [Array.from(d), Array.from(d)] : (d[0] < o[0][0] && (o[0][0] = d[0]), d[0] > o[1][0] && (o[1][0] = d[0]), d[1] < o[0][1] && (o[0][1] = d[1]), d[1] > o[1][1] && (o[1][1] = d[1])), h.length === 0 ? h = [Array.from(d), Array.from(d)] : (d[0] < h[0][0] && (h[0][0] = d[0]), d[0] > h[1][0] && (h[1][0] = d[0]), d[1] < h[0][1] && (h[0][1] = d[1]), d[1] > h[1][1] && (h[1][1] = d[1]));
      }), h;
    }), a = n.features.map((g) => {
      let h = [];
      return H(g)[0].map((d) => {
        s.length === 0 ? s = [Array.from(d), Array.from(d)] : (d[0] < s[0][0] && (s[0][0] = d[0]), d[0] > s[1][0] && (s[1][0] = d[0]), d[1] < s[0][1] && (s[0][1] = d[1]), d[1] > s[1][1] && (s[1][1] = d[1])), h.length === 0 ? h = [Array.from(d), Array.from(d)] : (d[0] < h[0][0] && (h[0][0] = d[0]), d[0] > h[1][0] && (h[1][0] = d[0]), d[1] < h[0][1] && (h[0][1] = d[1]), d[1] > h[1][1] && (h[1][1] = d[1]));
      }), h;
    });
    if (Math.max(
      nt(u, o, i),
      nt(a, s, i)
    ) > Rt * e.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const l = (o[1][0] - o[0][0]) / i, f = (o[1][1] - o[0][1]) / i, m = u.reduce(
      (g, h, d) => {
        const _ = A(h[0][0], o[0][0], l, i), E = A(h[1][0], o[0][0], l, i), T = A(h[0][1], o[0][1], f, i), v = A(h[1][1], o[0][1], f, i);
        for (let p = _; p <= E; p++) {
          g[p] || (g[p] = []);
          for (let M = T; M <= v; M++)
            g[p][M] || (g[p][M] = []), g[p][M].push(d);
        }
        return g;
      },
      []
    ), y = (s[1][0] - s[0][0]) / i, x = (s[1][1] - s[0][1]) / i, w = a.reduce(
      (g, h, d) => {
        const _ = A(h[0][0], s[0][0], y, i), E = A(h[1][0], s[0][0], y, i), T = A(h[0][1], s[0][1], x, i), v = A(h[1][1], s[0][1], x, i);
        for (let p = _; p <= E; p++) {
          g[p] || (g[p] = []);
          for (let M = T; M <= v; M++)
            g[p][M] || (g[p][M] = []), g[p][M].push(d);
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
        xUnit: l,
        yUnit: f,
        gridCache: m
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
    const o = R(t);
    if (this.bounds && !e && !n && !L(o, this.boundsPolygon))
      return !1;
    const s = e ? this.tins.bakw : this.tins.forw, u = e ? this.indexedTins?.bakw : this.indexedTins?.forw, a = this.outerVertices?.map((g) => e ? g[1] : g[0]), c = a && Zt(o.geometry.coordinates, a), l = this.outerTransform === "worldFile" && s ? Y(o, s, u) : void 0;
    if (this.outerTransform === "worldFile" && s && !c) {
      const g = e ? yt(this.worldFile, i) : dt(this.worldFile, i);
      return !g.every(Number.isFinite) || e && this.bounds && !n && !L(R(g), this.boundsPolygon) ? !1 : g;
    }
    if (e && this.strict_status == C.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    if (this.outerTransform === "worldFile" && !l) return !1;
    const f = e ? this.vertices_params.bakw : this.vertices_params.forw, m = e ? this.centroid.bakw : this.centroid.forw;
    let y, x;
    this.stateFull && (this.stateBackward == e ? y = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), x = (g) => {
      this.stateTriangle = g;
    });
    let w = Nt(
      o,
      s,
      u,
      f,
      m,
      void 0,
      y,
      x,
      l
    );
    if (this.bounds && e && !n) {
      const g = R(w);
      if (!L(g, this.boundsPolygon)) return !1;
    } else this.yaxisMode == C.YAXIS_FOLLOW && !e && (w = [w[0], -1 * w[1]]);
    return w;
  }
}
const b = 20037508342789244e-9, Kt = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], D = 6378137, q = 180 / Math.PI * Math.atan(Math.sinh(Math.PI)), V = Number.EPSILON * b * 16;
function X(r) {
  return r.length >= 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]);
}
function gt(r) {
  if (r.epsg !== 3857 && r.epsg !== 4326)
    throw new Error(`一期では EPSG:${r.epsg} の CRS に対応していません`);
  if (r.wkt && !r.proj4)
    throw new Error("一期では WKT だけの CRS 定義に対応していません");
  if (!r.proj4) return;
  const t = r.proj4.trim().split(/\s+/).filter(Boolean).map((i) => {
    const [o, ...s] = i.replace(/^\+/, "").split("="), u = o.toLowerCase(), a = s.join("=");
    if (u === "axis" && a !== "enu")
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if (["no_defs", "wktext"].includes(u) && a === "" || u === "type" && a.toLowerCase() === "crs" || u === "axis" && a === "enu") return "";
    if (u === "towgs84") {
      const l = a.split(",");
      if ([3, 7].includes(l.length) && l.every((f) => f.trim() !== "" && Number(f) === 0)) return "";
    }
    const c = a ? a.split(",").map((l) => {
      const f = Number(l);
      return l.trim() !== "" && Number.isFinite(f) ? Object.is(f, -0) ? "0" : String(f) : l.toLowerCase();
    }).join(",") : "";
    return `+${u}${a ? `=${c}` : ""}`;
  }).filter(Boolean), e = [...new Set(t)].sort().join(" ");
  if (!(r.epsg === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : ["+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"]).includes(e))
    throw new Error(`epsg と proj4 が一致しないか、一期では判定できない CRS です（EPSG:${r.epsg}）`);
}
const Jt = {
  toLonLat(r, t) {
    if (!X(r)) return !1;
    if (t.epsg === 4326) return Math.abs(r[1]) <= 90 + 1e-10 ? [r[0], Math.max(-90, Math.min(90, r[1]))] : !1;
    if (t.epsg !== 3857 || Math.abs(r[0]) > b + V || Math.abs(r[1]) > b + V) return !1;
    const e = Math.max(-b, Math.min(b, r[0])), n = Math.max(-b, Math.min(b, r[1]));
    return [
      e / D * (180 / Math.PI),
      (2 * Math.atan(Math.exp(n / D)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(r, t) {
    if (!X(r) || Math.abs(r[0]) > 180 + 1e-10 || Math.abs(r[1]) > q + 1e-10) return !1;
    const e = [Math.max(-180, Math.min(180, r[0])), Math.max(-q, Math.min(q, r[1]))];
    if (t.epsg === 4326) return e;
    if (t.epsg !== 3857) return !1;
    const n = e[0] * Math.PI / 180, i = e[1] * Math.PI / 180, o = [D * n, D * Math.log(Math.tan(Math.PI / 4 + i / 2))];
    return o.every(Number.isFinite) ? o : !1;
  }
};
class Qt {
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
    if (mt(t.worldFile), gt(t.crs), t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? Jt;
    const e = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = e.map((u) => u[0]), i = e.map((u) => u[1]), o = Math.min(...n), s = Math.min(...i);
      this.wh = [Math.max(...n) - o, Math.max(...i) - s], this.xy = t.xy ?? [o, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance;
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return dt(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return yt(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, e = !1, n = !1) {
    if (!X(t)) return !1;
    if (!e) {
      const u = this.xyToCrs(t);
      if (this.crs.epsg === 3857)
        return Math.abs(u[0]) <= b + V && Math.abs(u[1]) <= b + V ? [Math.max(-b, Math.min(b, u[0])), Math.max(-b, Math.min(b, u[1]))] : !1;
      const a = this.projectionEngine.toLonLat(u, this.crs);
      if (a === !1 || !X(a)) return !1;
      const c = this.projectionEngine.fromLonLat(a, { epsg: 3857 });
      return c !== !1 && X(c) ? c : !1;
    }
    if (this.crs.epsg === 3857)
      return Math.abs(t[0]) <= b + V && Math.abs(t[1]) <= b + V ? this.crsToXy([Math.max(-b, Math.min(b, t[0])), Math.max(-b, Math.min(b, t[1]))]) : !1;
    const i = this.projectionEngine.toLonLat(t, { epsg: 3857 });
    if (i === !1 || !X(i)) return !1;
    const o = this.projectionEngine.fromLonLat(i, this.crs);
    if (o === !1 || !X(o)) return !1;
    const s = this.crsToXy(o);
    return X(s) ? s : !1;
  }
}
function wt(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * b / 128 / Math.pow(2, t);
}
function Ht(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const i = r[n], o = i[0] * Math.cos(t) - i[1] * Math.sin(t), s = i[0] * Math.sin(t) + i[1] * Math.cos(t);
    e.push([o, s]);
  }
  return e;
}
function ot(r, t, e, n) {
  const i = wt(n, t);
  return Ht(Kt, e).map((u) => [
    u[0] * i + r[0],
    u[1] * i + r[1]
  ]);
}
function at(r, t) {
  const e = r[0], i = r.slice(1, 5).map((y) => [
    y[0] - e[0],
    y[1] - e[1]
  ]), o = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, u = 0, a = 0;
  for (let y = 0; y < 4; y++) {
    const x = i[y], w = o[y], g = Math.sqrt(Math.pow(x[0], 2) + Math.pow(x[1], 2));
    s += g;
    const h = x[0] * w[1] - x[1] * w[0], d = Math.acos(
      (x[0] * w[0] + x[1] * w[1]) / g
    ), _ = h > 0 ? -1 * d : d;
    u += Math.cos(_), a += Math.sin(_);
  }
  const c = s / 4, l = Math.atan2(a, u), f = Math.floor(Math.min(t[0], t[1]) / 4), m = Math.log(f * b / 128 / c) / Math.log(2);
  return { center: e, zoom: m, rotation: l };
}
function Z(r, t) {
  const e = r[0] * (2 * b) / t - b, n = -1 * (r[1] * (2 * b) / t - b);
  return [e, n];
}
function ct(r, t) {
  const e = (r[0] + b) * t / (2 * b), n = (-r[1] + b) * t / (2 * b);
  return [e, n];
}
const K = 256;
class nr {
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
      sub_maps: t.sub_maps?.map((e) => ({ kind: "tin", compiled: e.compiled, priority: e.priority, importance: e.importance, bounds: e.bounds }))
    });
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this.mainTin = this._createSurface(t.main);
    const e = t.main.kind === "tin" ? t.main.compiled.wh : this.mainTin.wh;
    if (t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * K;
    else if (e) {
      const n = Math.max(e[0], e[1]), i = Math.ceil(Math.log2(n / K));
      this._maxxy = Math.pow(2, i) * K;
    }
    this.subTins = [];
    for (const n of t.sub_maps ?? []) {
      const i = this._createSurface(n), o = n.bounds ?? (n.kind === "tin" ? n.compiled.bounds : void 0);
      if (!o) throw new Error("副層には bounds または compiled.bounds が必要です");
      const s = [...o, o[0]], u = s.map((a) => {
        const c = i.transform(a, !1);
        if (!c) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return c;
      });
      this.subTins.push({
        tin: i,
        priority: n.priority ?? 0,
        importance: n.importance ?? 0,
        xyBounds: z([s]),
        mercBounds: z([u])
      });
    }
  }
  _createSurface(t) {
    if (t.kind === "worldFile") return new Qt(t);
    if (t.crs) {
      if (t.crs.epsg !== 3857) throw new Error("三角網の層の3857以外のCRSはまだ扱えません");
      gt(t.crs);
    }
    const e = new C();
    return e.setCompiled(t.compiled), e;
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
      if (o || L(R(t), this.subTins[i - 1].xyBounds)) {
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: u, isMain: a }) => {
      const c = this._transformByIndex(t, s, !0);
      return c === !1 ? [u, s] : a || L(R(c), this.subTins[s - 1].xyBounds) ? [u, s, c] : [u, s];
    }).sort((s, u) => {
      const a = s[0].priority ?? 0, c = u[0].priority ?? 0;
      return a < c ? 1 : -1;
    }).reduce(
      (s, u, a, c) => {
        const l = u[0], f = u[1], m = u[2];
        if (!m) return s;
        for (let y = 0; y < a; y++) {
          const x = c[y][1], w = x === 0;
          if (c[y][2] && (w || L(R(m), this.subTins[x - 1].xyBounds)))
            if (s.length) {
              const g = !s[0], h = g ? s[1][2] : s[0][2], d = l.importance ?? 0, _ = h.importance ?? 0;
              return g ? d < _ ? s : [void 0, [f, m, l]] : [...s.filter(
                (v) => v !== void 0
              ), [f, m, l]].sort(
                (v, p) => (v[2].importance ?? 0) < (p[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[f, m, l]];
        }
        return !s.length || !s[0] ? [[f, m, l]] : (s.push([f, m, l]), s.sort((y, x) => {
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
    const e = this._getAllTinsWithIndex(), n = (a) => a === 0 ? 0 : this.subTins[a - 1].priority ?? 0, i = (a) => a === 0 ? 0 : this.subTins[a - 1].importance ?? 0, o = (a, c) => a === 0 || L(R(c), this.subTins[a - 1].xyBounds), s = [];
    for (const { index: a } of e) {
      const c = this._transformByIndex(t, a, !0);
      c !== !1 && o(a, c) && s.push({ index: a, xy: c });
    }
    const u = (a) => e.some(
      ({ index: c }) => c !== 0 && c !== a.index && (n(c) > n(a.index) || a.index === 0 && n(c) === 0) && o(c, a.xy)
    );
    return s.filter((a) => !u(a)).sort((a, c) => i(c.index) - i(a.index) || n(c.index) - n(a.index) || a.index - c.index).map((a) => [a.index, a.xy]);
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
      const s = i[0], u = i[1];
      return o !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((c, l) => l === 0 ? u : this._transformByIndex(c, s, !0)).map((c) => this.xy2SysCoordInternal(c));
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
    const i = ot(t.center, t.zoom, t.rotation, e).map((c) => ct(c, this._maxxy)), o = this.xy2MercWithLayer(i[0]);
    if (!o) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const s = o[0], u = o[1];
    return i.map((c, l) => {
      if (l === 0) return u;
      const f = this._transformByIndex(c, s, !1);
      if (f === !1) throw new Error(`viewpoint2Mercs: point ${l} is out of bounds`);
      return f;
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
    const o = i[0], s = i[1], a = t.map((c, l) => {
      if (l === 0) return s;
      const f = this._transformByIndex(c, o, !0);
      if (f === !1) throw new Error(`mercs2Viewpoint: point ${l} is out of bounds`);
      return f;
    }).map((c) => Z(c, this._maxxy));
    return at(a, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return wt(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, i) {
    return ot(t, e, n, i);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return at(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return Z(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return ct(t, e);
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
    return Z(t, this._maxxy);
  }
}
export {
  Kt as MERC_CROSSMATRIX,
  b as MERC_MAX,
  nr as MapTransform,
  C as Transform,
  Qt as WorldFileSurface,
  Jt as builtinProjectionEngine,
  rr as counterTri,
  yt as crsToWorldFilePixel,
  er as format_version,
  ot as mercViewpoint2Mercs,
  at as mercs2MercViewpoint,
  Xt as normalizeEdges,
  Ht as rotateMatrix,
  tr as rotateVerticesTriangle,
  ct as sysCoord2Xy,
  Nt as transformArr,
  mt as validateWorldFile,
  dt as worldFileToCrs,
  Z as xy2SysCoord,
  wt as zoom2Radius
};
