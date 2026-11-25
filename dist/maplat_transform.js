function lt(r, t, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = t || {}, n.geometry = r, n;
}
function B(r, t, e = {}) {
  if (!r)
    throw new Error("coordinates is required");
  if (!Array.isArray(r))
    throw new Error("coordinates must be an Array");
  if (r.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!H(r[0]) || !H(r[1]))
    throw new Error("coordinates must contain numbers");
  return lt({
    type: "Point",
    coordinates: r
  }, t, e);
}
function V(r, t, e = {}) {
  for (const s of r) {
    if (s.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (s[s.length - 1].length !== s[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let o = 0; o < s[s.length - 1].length; o++)
      if (s[s.length - 1][o] !== s[0][o])
        throw new Error("First and last Position are not equivalent.");
  }
  return lt({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function $(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function H(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function Et(r) {
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
function tt(r) {
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
function Tt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const X = 11102230246251565e-32, A = 134217729, vt = (3 + 8 * X) * X;
function z(r, t, e, n, s) {
  let o, i, u, c, a = t[0], m = n[0], f = 0, l = 0;
  m > a == m > -a ? (o = a, a = t[++f]) : (o = m, m = n[++l]);
  let h = 0;
  if (f < r && l < e)
    for (m > a == m > -a ? (i = a + o, u = o - (i - a), a = t[++f]) : (i = m + o, u = o - (i - m), m = n[++l]), o = i, u !== 0 && (s[h++] = u); f < r && l < e; )
      m > a == m > -a ? (i = o + a, c = i - o, u = o - (i - c) + (a - c), a = t[++f]) : (i = o + m, c = i - o, u = o - (i - c) + (m - c), m = n[++l]), o = i, u !== 0 && (s[h++] = u);
  for (; f < r; )
    i = o + a, c = i - o, u = o - (i - c) + (a - c), a = t[++f], o = i, u !== 0 && (s[h++] = u);
  for (; l < e; )
    i = o + m, c = i - o, u = o - (i - c) + (m - c), m = n[++l], o = i, u !== 0 && (s[h++] = u);
  return (o !== 0 || h === 0) && (s[h++] = o), h;
}
function St(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function q(r) {
  return new Float64Array(r);
}
const At = (3 + 16 * X) * X, It = (2 + 12 * X) * X, Ct = (9 + 64 * X) * X * X, W = q(4), rt = q(8), et = q(12), nt = q(16), C = q(4);
function Pt(r, t, e, n, s, o, i) {
  let u, c, a, m, f, l, h, w, x, g, d, y, M, _, T, E, p, b;
  const P = r - s, F = e - s, O = t - o, k = n - o;
  _ = P * k, l = A * P, h = l - (l - P), w = P - h, l = A * k, x = l - (l - k), g = k - x, T = w * g - (_ - h * x - w * x - h * g), E = O * F, l = A * O, h = l - (l - O), w = O - h, l = A * F, x = l - (l - F), g = F - x, p = w * g - (E - h * x - w * x - h * g), d = T - p, f = T - d, W[0] = T - (d + f) + (f - p), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, W[1] = M - (d + f) + (f - E), b = y + d, f = b - y, W[2] = y - (b - f) + (d - f), W[3] = b;
  let N = St(4, W), Y = It * i;
  if (N >= Y || -N >= Y || (f = r - P, u = r - (P + f) + (f - s), f = e - F, a = e - (F + f) + (f - s), f = t - O, c = t - (O + f) + (f - o), f = n - k, m = n - (k + f) + (f - o), u === 0 && c === 0 && a === 0 && m === 0) || (Y = Ct * i + vt * Math.abs(N), N += P * m + k * u - (O * a + F * c), N >= Y || -N >= Y)) return N;
  _ = u * k, l = A * u, h = l - (l - u), w = u - h, l = A * k, x = l - (l - k), g = k - x, T = w * g - (_ - h * x - w * x - h * g), E = c * F, l = A * c, h = l - (l - c), w = c - h, l = A * F, x = l - (l - F), g = F - x, p = w * g - (E - h * x - w * x - h * g), d = T - p, f = T - d, C[0] = T - (d + f) + (f - p), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), b = y + d, f = b - y, C[2] = y - (b - f) + (d - f), C[3] = b;
  const bt = z(4, W, 4, C, rt);
  _ = P * m, l = A * P, h = l - (l - P), w = P - h, l = A * m, x = l - (l - m), g = m - x, T = w * g - (_ - h * x - w * x - h * g), E = O * a, l = A * O, h = l - (l - O), w = O - h, l = A * a, x = l - (l - a), g = a - x, p = w * g - (E - h * x - w * x - h * g), d = T - p, f = T - d, C[0] = T - (d + f) + (f - p), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), b = y + d, f = b - y, C[2] = y - (b - f) + (d - f), C[3] = b;
  const Mt = z(bt, rt, 4, C, et);
  _ = u * m, l = A * u, h = l - (l - u), w = u - h, l = A * m, x = l - (l - m), g = m - x, T = w * g - (_ - h * x - w * x - h * g), E = c * a, l = A * c, h = l - (l - c), w = c - h, l = A * a, x = l - (l - a), g = a - x, p = w * g - (E - h * x - w * x - h * g), d = T - p, f = T - d, C[0] = T - (d + f) + (f - p), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), b = y + d, f = b - y, C[2] = y - (b - f) + (d - f), C[3] = b;
  const _t = z(Mt, et, 4, C, nt);
  return nt[_t - 1];
}
function Ft(r, t, e, n, s, o) {
  const i = (t - o) * (e - s), u = (r - s) * (n - o), c = i - u, a = Math.abs(i + u);
  return Math.abs(c) >= At * a ? c : -Pt(r, t, e, n, s, o, a);
}
function Ot(r, t) {
  var e, n, s = 0, o, i, u, c, a, m, f, l = r[0], h = r[1], w = t.length;
  for (e = 0; e < w; e++) {
    n = 0;
    var x = t[e], g = x.length - 1;
    if (m = x[0], m[0] !== x[g][0] && m[1] !== x[g][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (i = m[0] - l, u = m[1] - h, n; n < g; n++) {
      if (f = x[n + 1], c = f[0] - l, a = f[1] - h, u === 0 && a === 0) {
        if (c <= 0 && i >= 0 || i <= 0 && c >= 0)
          return 0;
      } else if (a >= 0 && u <= 0 || a <= 0 && u >= 0) {
        if (o = Ft(i, c, u, a, 0, 0), o === 0)
          return 0;
        (o > 0 && a > 0 && u <= 0 || o < 0 && a <= 0 && u > 0) && s++;
      }
      m = f, u = a, i = c;
    }
  }
  return s % 2 !== 0;
}
function L(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = Et(r), s = Tt(t), o = s.type, i = t.bbox;
  let u = s.coordinates;
  if (i && kt(n, i) === !1)
    return !1;
  o === "Polygon" && (u = [u]);
  for (var c = 0; c < u.length; ++c) {
    const a = Ot(n, u[c]);
    if (a === 0 && !e.ignoreBoundary) return !0;
    if (a) return !0;
  }
  return !1;
}
function kt(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function Z(r, t, e) {
  if (e) {
    const n = r.geometry.coordinates, s = I(n[0], e.xOrigin, e.xUnit, e.gridNum), o = I(n[1], e.yOrigin, e.yUnit, e.gridNum), i = e.gridCache[s]?.[o] ?? [];
    for (const u of i) {
      const c = t.features[u];
      if (c && L(r, c)) return c;
    }
    return;
  }
  for (let n = 0; n < t.features.length; n++)
    if (L(r, t.features[n]))
      return t.features[n];
}
function ht(r, t) {
  const e = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], s = t.geometry.coordinates[0][2], o = r.geometry.coordinates, i = t.properties.a.geom, u = t.properties.b.geom, c = t.properties.c.geom, a = [n[0] - e[0], n[1] - e[1]], m = [s[0] - e[0], s[1] - e[1]], f = [o[0] - e[0], o[1] - e[1]], l = [u[0] - i[0], u[1] - i[1]], h = [c[0] - i[0], c[1] - i[1]], w = (m[1] * f[0] - m[0] * f[1]) / (a[0] * m[1] - a[1] * m[0]), x = (a[0] * f[1] - a[1] * f[0]) / (a[0] * m[1] - a[1] * m[0]);
  return [
    w * l[0] + x * h[0] + i[0],
    w * l[1] + x * h[1] + i[1]
  ];
}
function Bt(r, t, e) {
  const n = r.geometry.coordinates, s = e.geometry.coordinates, o = Math.atan2(n[0] - s[0], n[1] - s[1]), i = Lt(o, t[0]);
  if (i === void 0)
    throw new Error("Unable to determine vertex index");
  const u = t[1][i];
  return ht(r, u.features[0]);
}
function Nt(r, t, e, n, s, o, i, u, c) {
  let a = c;
  if (!a && i && (a = Z(r, $([i]))), !a)
    if (e) {
      const m = r.geometry.coordinates, f = e.gridNum, l = e.xOrigin, h = e.yOrigin, w = e.xUnit, x = e.yUnit, g = e.gridCache, d = I(m[0], l, w, f), y = I(m[1], h, x, f), M = g[d] ? g[d][y] ? g[d][y] : [] : [], _ = $(M.map((T) => t.features[T]));
      a = Z(r, _);
    } else
      a = Z(r, t);
  return u && u(a), a ? ht(r, a) : Bt(r, n, s);
}
function I(r, t, e, n) {
  let s = Math.floor((r - t) / e);
  return s < 0 && (s = 0), s >= n && (s = n - 1), s;
}
const Rt = 36;
function st(r, t, e) {
  const n = (t[1][0] - t[0][0]) / e, s = (t[1][1] - t[0][1]) / e;
  return r.reduce((o, i) => {
    const u = I(i[0][0], t[0][0], n, e), c = I(i[1][0], t[0][0], n, e), a = I(i[0][1], t[0][1], s, e), m = I(i[1][1], t[0][1], s, e), f = (c - u + 1) * (m - a + 1);
    return f > 0 ? o + f : o;
  }, 0);
}
function Lt(r, t) {
  let e = it(r - t[0]), n = Math.PI * 2, s;
  for (let o = 0; o < t.length; o++) {
    const i = (o + 1) % t.length, u = it(r - t[i]), c = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && c < n && (n = c, s = o), e = u;
  }
  return s;
}
function it(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function nr(r) {
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
function sr(r) {
  const t = ["a", "b", "c", "a"].map(
    (o) => r.properties[o].geom
  ), e = r.geometry.coordinates[0], n = r.properties, s = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return V([t], s);
}
function Xt(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return V([t], e);
}
function Q(r, t, e, n, s, o = !1, i) {
  const u = r.map(
    (c) => {
      (!i || i < 2.00703) && (c = Wt(c));
      const a = isFinite(c) ? t[c] : c === "c" ? n : (function() {
        const m = c.match(/^b(\d+)$/);
        if (m) return s[parseInt(m[1])];
        const f = c.match(/^e(\d+)$/);
        if (f) return e[parseInt(f[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return o ? [[a[1], a[0]], c] : [[a[0], a[1]], c];
    }
  );
  return Xt(u);
}
function Wt(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function jt(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const mt = 2.00704;
function Vt(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function Ut(r) {
  return {
    points: r.points,
    strictStatus: Yt(r),
    verticesParams: Dt(r),
    centroid: qt(r),
    edges: jt(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Gt(r),
    kinks: Zt(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function $t(r) {
  const t = zt(r), e = t.tins, n = t.vertices_params;
  return n != null && dt(n), {
    compiled: t,
    tins: e,
    points: Kt(e),
    strictStatus: t.strict_status,
    verticesParams: n,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function Yt(r) {
  return r.strict_status ? r.strict_status : r.kinks_points ? "strict_error" : r.tins_points.length === 2 ? "loose" : "strict";
}
function Dt(r) {
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
  return t.forw[1] = ot(r, !1), t.bakw[1] = ot(r, !0), dt(t), t;
}
function dt(r) {
  if (typeof r != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((t) => {
    const e = r[t];
    if (e == null) return;
    const n = `vertices_params.${t}`, s = e[0], o = e[1];
    if (!Array.isArray(s) || !Array.isArray(o))
      throw new Error(`Invalid compiled data: ${n} must hold two arrays`);
    if (s.length !== o.length)
      throw new Error(
        `Invalid compiled data: ${n} must have one angle per vertex`
      );
    for (let i = 0; i < s.length; i++)
      if (typeof s[i] != "number" || !Number.isFinite(s[i]))
        throw new Error(
          `Invalid compiled data: ${n} must contain only finite numbers`
        );
  });
}
function ot(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, s) => {
    const o = (s + 1) % e, i = Q(
      ["c", `b${s}`, `b${o}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      mt
    );
    return $([i]);
  });
}
function qt(r) {
  return {
    forw: B(r.centroid_point[0], {
      target: {
        geom: r.centroid_point[1],
        index: "c"
      }
    }),
    bakw: B(r.centroid_point[1], {
      target: {
        geom: r.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Gt(r) {
  const t = r.tins_points.length === 1 ? 0 : 1;
  return {
    forw: $(
      r.tins_points[0].map(
        (e) => Q(
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
    bakw: $(
      r.tins_points[t].map(
        (e) => Q(
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
function Zt(r) {
  if (r)
    return {
      bakw: $(
        r.map((t) => B(t))
      )
    };
}
function zt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Kt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const s = e[n];
    ["a", "b", "c"].forEach((o, i) => {
      const u = s.geometry.coordinates[0][i], c = s.properties[o].geom, a = s.properties[o].index;
      typeof a == "number" && (t[a] = [u, c]);
    });
  }
  return t;
}
function yt(r) {
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
function gt(r, t) {
  const e = t[0] - 0.5, n = t[1] - 0.5;
  return [
    r.xScale * e + r.xSkew * n + r.xOrigin,
    r.ySkew * e + r.yScale * n + r.yOrigin
  ];
}
function wt(r, t) {
  const e = r.xScale * r.yScale - r.xSkew * r.ySkew, n = t[0] - r.xOrigin, s = t[1] - r.yOrigin;
  return [
    (r.yScale * n - r.xSkew * s) / e + 0.5,
    (-r.ySkew * n + r.xScale * s) / e + 0.5
  ];
}
const ir = mt;
function U(r, t, e) {
  return (t[0] - r[0]) * (e[1] - r[1]) - (t[1] - r[1]) * (e[0] - r[0]);
}
function D(r, t, e, n = 0) {
  return r[0] >= Math.min(t[0], e[0]) - n && r[0] <= Math.max(t[0], e[0]) + n && r[1] >= Math.min(t[1], e[1]) - n && r[1] <= Math.max(t[1], e[1]) + n;
}
function Jt(r, t, e, n) {
  const s = U(r, t, e), o = U(r, t, n), i = U(e, n, r), u = U(e, n, t);
  return s === 0 && D(e, r, t) || o === 0 && D(n, r, t) || i === 0 && D(r, e, n) || u === 0 && D(t, e, n) ? !0 : Math.sign(s) * Math.sign(o) === -1 && Math.sign(i) * Math.sign(u) === -1;
}
function at(r) {
  const t = r.reduce((e, n, s) => e + U(r[0], n, r[(s + 1) % r.length]), 0);
  if (!Number.isFinite(t) || t === 0)
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  for (let e = 0; e < r.length; e++) {
    const n = r[e], s = r[(e + 1) % r.length];
    if (n[0] === s[0] && n[1] === s[1])
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    for (let o = e + 2; o < r.length; o++)
      if (!(e === 0 && o === r.length - 1) && Jt(n, s, r[o], r[(o + 1) % r.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(t);
}
function Qt(r, t) {
  let e = !1;
  for (let n = 0, s = t.length - 1; n < t.length; s = n++) {
    const o = t[s], i = t[n], [u, c] = o, [a, m] = i, f = a - u, l = m - c, h = r[0] - u, w = r[1] - c, x = Number.EPSILON * 16 * Math.max(1, Math.abs(u), Math.abs(c), Math.abs(a), Math.abs(m), Math.abs(r[0]), Math.abs(r[1])), g = Math.hypot(f, l), d = x * g + Number.EPSILON * 16 * (Math.abs(h * l) + Math.abs(w * f));
    if (Math.abs(U(o, i, r)) <= d && D(r, o, i, x)) return "edge";
    c > r[1] != m > r[1] && r[0] < (a - u) * (r[1] - c) / (m - c) + u && (e = !e);
  }
  return e ? "inside" : "outside";
}
class S {
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
  yaxisMode = S.YAXIS_INVERT;
  strictMode = S.MODE_AUTO;
  vertexMode = S.VERTEX_PLAIN;
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
    const s = e ? t.worldFile : void 0;
    if (n === "worldFile") {
      if (!s) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      yt(s);
      const a = t.vertices_points;
      if (!Array.isArray(a) || a.length < 4 || a.some((h) => !Array.isArray(h) || h.length < 2 || h.some((w) => !Array.isArray(w) || w.length < 2 || !w.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const m = at(a.map((h) => h[0])), f = at(a.map((h) => h[1])), l = t.yaxisMode === S.YAXIS_FOLLOW ? -f : f;
      if (m === l)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const o = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, i = Vt(o) ? Ut(o) : $t(o), c = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices"].map((a) => [a, this[a]]));
    try {
      "compiled" in i ? this.applyLegacyState(i) : this.applyModernState(i), this.outerTransform = n ?? "extrapolate", this.worldFile = s, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0;
    } catch (a) {
      throw Object.assign(this, c), a;
    }
  }
  applyModernState(t) {
    this.points = t.points, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? S.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? S.VERTEX_PLAIN, this.strictMode = t.strictMode ?? S.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
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
    const t = this.tins, e = t.forw, n = t.bakw, s = Math.ceil(Math.sqrt(e.features.length));
    if (s < 3) {
      this.indexedTins = void 0;
      return;
    }
    let o = [], i = [];
    const u = e.features.map((g) => {
      let d = [];
      return tt(g)[0].map((y) => {
        o.length === 0 ? o = [Array.from(y), Array.from(y)] : (y[0] < o[0][0] && (o[0][0] = y[0]), y[0] > o[1][0] && (o[1][0] = y[0]), y[1] < o[0][1] && (o[0][1] = y[1]), y[1] > o[1][1] && (o[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    }), c = n.features.map((g) => {
      let d = [];
      return tt(g)[0].map((y) => {
        i.length === 0 ? i = [Array.from(y), Array.from(y)] : (y[0] < i[0][0] && (i[0][0] = y[0]), y[0] > i[1][0] && (i[1][0] = y[0]), y[1] < i[0][1] && (i[0][1] = y[1]), y[1] > i[1][1] && (i[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    });
    if (Math.max(
      st(u, o, s),
      st(c, i, s)
    ) > Rt * e.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const m = (o[1][0] - o[0][0]) / s, f = (o[1][1] - o[0][1]) / s, l = u.reduce(
      (g, d, y) => {
        const M = I(d[0][0], o[0][0], m, s), _ = I(d[1][0], o[0][0], m, s), T = I(d[0][1], o[0][1], f, s), E = I(d[1][1], o[0][1], f, s);
        for (let p = M; p <= _; p++) {
          g[p] || (g[p] = []);
          for (let b = T; b <= E; b++)
            g[p][b] || (g[p][b] = []), g[p][b].push(y);
        }
        return g;
      },
      []
    ), h = (i[1][0] - i[0][0]) / s, w = (i[1][1] - i[0][1]) / s, x = c.reduce(
      (g, d, y) => {
        const M = I(d[0][0], i[0][0], h, s), _ = I(d[1][0], i[0][0], h, s), T = I(d[0][1], i[0][1], w, s), E = I(d[1][1], i[0][1], w, s);
        for (let p = M; p <= _; p++) {
          g[p] || (g[p] = []);
          for (let b = T; b <= E; b++)
            g[p][b] || (g[p][b] = []), g[p][b].push(y);
        }
        return g;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: s,
        xOrigin: o[0][0],
        yOrigin: o[0][1],
        xUnit: m,
        yUnit: f,
        gridCache: l
      },
      bakw: {
        gridNum: s,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: h,
        yUnit: w,
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
    if (e && this.strict_status == S.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const s = t;
    this.yaxisMode == S.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const o = B(t);
    if (this.bounds && !e && !n && !L(o, this.boundsPolygon))
      return !1;
    const i = e ? this.tins.bakw : this.tins.forw, u = e ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let c;
    if (this.outerTransform === "worldFile") {
      const w = this.outerVertices?.map((g) => e ? g[1] : g[0]), x = w ? Qt(o.geometry.coordinates, w) : "outside";
      if (e && this.strict_status == S.STATUS_ERROR && x !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (x === "inside" && i && (c = Z(o, i, u)), !c) {
        const g = e ? wt(this.worldFile, s) : gt(this.worldFile, s);
        return !g.every(Number.isFinite) || e && this.bounds && !n && !L(B(g), this.boundsPolygon) ? !1 : g;
      }
    }
    const a = e ? this.vertices_params.bakw : this.vertices_params.forw, m = e ? this.centroid.bakw : this.centroid.forw;
    let f, l;
    this.stateFull && (this.stateBackward == e ? f = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), l = (w) => {
      this.stateTriangle = w;
    });
    let h = Nt(
      o,
      i,
      u,
      a,
      m,
      void 0,
      f,
      l,
      c
    );
    if (this.bounds && e && !n) {
      const w = B(h);
      if (!L(w, this.boundsPolygon)) return !1;
    } else this.yaxisMode == S.YAXIS_FOLLOW && !e && (h = [h[0], -1 * h[1]]);
    return h;
  }
}
const v = 20037508342789244e-9, Ht = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], G = 6378137, K = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function R(r) {
  return r.length >= 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]);
}
function xt(r) {
  if (r === null || typeof r != "object") throw new Error("CRS はオブジェクトで指定してください");
  if (r.epsg !== 3857 && r.epsg !== 4326)
    throw new Error(`一期では EPSG:${r.epsg} の CRS に対応していません`);
  if (r.wkt && !r.proj4)
    throw new Error("一期では WKT だけの CRS 定義に対応していません");
  if (r.proj4 === void 0) return;
  if (r.proj4.trim() === "") throw new Error("空の proj4 は許可されていません");
  const t = r.proj4.trim().split(/\s+/).map((s) => {
    const [o, ...i] = s.replace(/^\+/, "").split("="), u = o.toLowerCase(), c = i.join("="), a = i.length > 0;
    if (u === "axis" && (!a || c !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if ((u === "no_defs" || u === "wktext") && !a) return "";
    if (a && c === "") throw new Error(`+${u}= は許可されていません`);
    if (u === "wktext") throw new Error("+wktext は許可されていません");
    if (u === "type" && !a) throw new Error("+type は値が必要です");
    if (u === "type" && c.toLowerCase() === "crs" || u === "axis") return "";
    if (u === "towgs84") {
      const f = c.split(",");
      if (!a || f.some((h) => h.trim() === "")) throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(f.length) && f.every((h) => {
        const w = h.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(h)) && !/[1-9]/.test(w);
      })) return "";
    }
    const m = c ? c.split(",").map((f) => {
      const l = Number(f);
      return f.trim() !== "" && Number.isFinite(l) ? Object.is(l, -0) ? "0" : String(l) : f.toLowerCase();
    }).join(",") : "";
    return `+${u}${c ? `=${m}` : ""}`;
  }).filter(Boolean), e = [...new Set(t)].sort().join(" ");
  if (!(r.epsg === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : ["+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"]).includes(e))
    throw new Error(`epsg と proj4 が一致しないか、一期では判定できない CRS です（EPSG:${r.epsg}）`);
}
const tr = {
  toLonLat(r, t) {
    if (!R(r)) return !1;
    if (t.epsg === 4326) return Math.abs(r[0]) <= 180 && Math.abs(r[1]) <= 90 ? [r[0], r[1]] : !1;
    if (t.epsg !== 3857 || Math.abs(r[0]) > v || Math.abs(r[1]) > v) return !1;
    const e = r[0], n = r[1];
    return [
      Math.abs(e) === v ? Math.sign(e) * 180 : e / G * (180 / Math.PI),
      Math.abs(n) === v ? Math.sign(n) * K : (2 * Math.atan(Math.exp(n / G)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(r, t) {
    if (!R(r) || Math.abs(r[0]) > 180) return !1;
    const [e, n] = r;
    if (t.epsg === 4326) return Math.abs(n) <= 90 ? [e, n] : !1;
    if (t.epsg !== 3857 || Math.abs(n) > K) return !1;
    const s = e * Math.PI / 180, o = n * Math.PI / 180, i = [
      Math.abs(e) === 180 ? Math.sign(e) * v : G * s,
      Math.abs(n) === K ? Math.sign(n) * v : G * Math.log(Math.tan(Math.PI / 4 + o / 2))
    ];
    return i.every(Number.isFinite) ? i : !1;
  }
};
class rr {
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
    if (yt(t.worldFile), xt(t.crs), !t.wh && !t.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? tr;
    const e = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = e.map((u) => u[0]), s = e.map((u) => u[1]), o = Math.min(...n), i = Math.min(...s);
      if (this.wh = [Math.max(...n) - o, Math.max(...s) - i], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = t.xy ?? [o, i];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance;
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return gt(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return wt(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, e = !1, n = !1) {
    if (!R(t)) return !1;
    if (!e) {
      const u = this.xyToCrs(t);
      if (this.crs.epsg === 3857)
        return u.every((m) => Math.abs(m) <= v) ? u : !1;
      const c = this.projectionEngine.toLonLat(u, this.crs);
      if (c === !1 || !R(c)) return !1;
      const a = this.projectionEngine.fromLonLat(c, { epsg: 3857 });
      return a !== !1 && R(a) ? a : !1;
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(t[0]) > v || Math.abs(t[1]) > v) return !1;
      const u = this.crsToXy(t);
      return R(u) ? u : !1;
    }
    const s = this.projectionEngine.toLonLat(t, { epsg: 3857 });
    if (s === !1 || !R(s)) return !1;
    const o = this.projectionEngine.fromLonLat(s, this.crs);
    if (o === !1 || !R(o)) return !1;
    const i = this.crsToXy(o);
    return R(i) ? i : !1;
  }
}
function pt(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * v / 128 / Math.pow(2, t);
}
function er(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const s = r[n], o = s[0] * Math.cos(t) - s[1] * Math.sin(t), i = s[0] * Math.sin(t) + s[1] * Math.cos(t);
    e.push([o, i]);
  }
  return e;
}
function ct(r, t, e, n) {
  const s = pt(n, t);
  return er(Ht, e).map((u) => [
    u[0] * s + r[0],
    u[1] * s + r[1]
  ]);
}
function ut(r, t) {
  const e = r[0], s = r.slice(1, 5).map((h) => [
    h[0] - e[0],
    h[1] - e[1]
  ]), o = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let i = 0, u = 0, c = 0;
  for (let h = 0; h < 4; h++) {
    const w = s[h], x = o[h], g = Math.sqrt(Math.pow(w[0], 2) + Math.pow(w[1], 2));
    i += g;
    const d = w[0] * x[1] - w[1] * x[0], y = Math.acos(
      (w[0] * x[0] + w[1] * x[1]) / g
    ), M = d > 0 ? -1 * y : y;
    u += Math.cos(M), c += Math.sin(M);
  }
  const a = i / 4, m = Math.atan2(c, u), f = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(f * v / 128 / a) / Math.log(2);
  return { center: e, zoom: l, rotation: m };
}
function J(r, t) {
  const e = r[0] * (2 * v) / t - v, n = -1 * (r[1] * (2 * v) / t - v);
  return [e, n];
}
function ft(r, t) {
  const e = (r[0] + v) * t / (2 * v), n = (-r[1] + v) * t / (2 * v);
  return [e, n];
}
const j = 256;
class or {
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
    const e = new S();
    if (e.setCompiled(t.compiled), this.mainTin = e, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * j;
    else if (t.compiled.wh) {
      const n = Math.max(t.compiled.wh[0], t.compiled.wh[1]), s = Math.ceil(Math.log2(n / j));
      this._maxxy = Math.pow(2, s) * j;
    }
    if (this.subTins = [], t.sub_maps)
      for (const n of t.sub_maps) {
        const s = new S();
        s.setCompiled(n.compiled);
        const o = n.bounds ?? n.compiled.bounds;
        if (!o) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const i = [...o, o[0]], u = i.map((c) => {
          const a = s.transform(c, !1);
          if (!a) throw new Error("Failed to transform sub-map bounds to mercator");
          return a;
        });
        this.subTins.push({
          tin: s,
          priority: n.priority,
          importance: n.importance,
          xyBounds: V([i]),
          mercBounds: V([u])
        });
      }
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this.mainTin = this._createSurface(t.main), t.main.priority !== void 0 && (this.mainTin.priority = t.main.priority), t.main.importance !== void 0 && (this.mainTin.importance = t.main.importance);
    const e = t.main.kind === "tin" ? t.main.compiled.wh : this.mainTin.wh;
    if (t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * j;
    else if (e) {
      const n = Math.max(e[0], e[1]), s = Math.ceil(Math.log2(n / j));
      this._maxxy = Math.pow(2, s) * j;
    }
    this.subTins = [];
    for (const n of t.sub_maps ?? []) {
      const s = this._createSurface(n), o = n.bounds ?? (n.kind === "tin" ? n.compiled.bounds : void 0);
      if (!o) throw new Error("副層には bounds または compiled.bounds が必要です");
      const i = [...o, o[0]], u = i.map((c) => {
        const a = s.transform(c, !1);
        if (!a) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return a;
      });
      this.subTins.push({
        tin: s,
        priority: n.priority ?? 0,
        importance: n.importance ?? 0,
        xyBounds: V([i]),
        mercBounds: V([u])
      });
    }
  }
  _createSurface(t) {
    if (t.kind === "worldFile") return new rr(t);
    if ("crs" in t && t.crs === null) throw new Error("三角網の層の CRS は null にできません");
    if (t.crs) {
      if (t.crs.epsg !== 3857) throw new Error("三角網の層の3857以外のCRSはまだ扱えません");
      xt(t.crs);
    }
    const e = new S();
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
      const { index: s, isMain: o } = e[n];
      if (o || L(B(t), this.subTins[s - 1].xyBounds)) {
        const i = this._transformByIndex(t, s, !1);
        if (i === !1) continue;
        return [s, i];
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: i, tin: u, isMain: c }) => {
      const a = this._transformByIndex(t, i, !0);
      return a === !1 ? [u, i] : c || L(B(a), this.subTins[i - 1].xyBounds) ? [u, i, a] : [u, i];
    }).sort((i, u) => {
      const c = i[0].priority ?? 0, a = u[0].priority ?? 0;
      return c < a ? 1 : -1;
    }).reduce(
      (i, u, c, a) => {
        const m = u[0], f = u[1], l = u[2];
        if (!l) return i;
        for (let h = 0; h < c; h++) {
          const w = a[h][1], x = w === 0;
          if (a[h][2] && (x || L(B(l), this.subTins[w - 1].xyBounds)))
            if (i.length) {
              const g = !i[0], d = g ? i[1][2] : i[0][2], y = m.importance ?? 0, M = d.importance ?? 0;
              return g ? y < M ? i : [void 0, [f, l, m]] : [...i.filter(
                (E) => E !== void 0
              ), [f, l, m]].sort(
                (E, p) => (E[2].importance ?? 0) < (p[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[f, l, m]];
        }
        return !i.length || !i[0] ? [[f, l, m]] : (i.push([f, l, m]), i.sort((h, w) => {
          const x = h[2].importance ?? 0, g = w[2].importance ?? 0;
          return x < g ? 1 : -1;
        }).filter((h, w) => w < 2));
      },
      []
    ).map((i) => {
      if (i)
        return [i[0], i[1]];
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
   *    本図と sub_map がともに priority 0 の場合も、本図はその sub_map の `xyBounds` 内で覆われている
   * 3. 同じ priority の sub_map どうしは互いを覆わない
   * 4. 覆われていない対応層を importance 降順 → priority 降順 → 層番号昇順で並べ、上限を切らずに全件返す
   * 5. 覆われていない対応層が無ければ空配列（表現範囲外）。`undefined`（旧 hide 表現）は返さない
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns [レイヤーインデックス, ピクセル座標] の配列（0 件以上・上限なし）
   */
  merc2XyVisibleLayers(t) {
    this._assertMapData();
    const e = this._getAllTinsWithIndex(), n = (c) => (c === 0 ? this.mainTin?.priority : this.subTins[c - 1].priority) ?? 0, s = (c) => (c === 0 ? this.mainTin?.importance : this.subTins[c - 1].importance) ?? 0, o = (c, a) => c === 0 || L(B(a), this.subTins[c - 1].xyBounds), i = [];
    for (const { index: c } of e) {
      const a = this._transformByIndex(t, c, !0);
      a !== !1 && o(c, a) && i.push({ index: c, xy: a });
    }
    const u = (c) => e.some(
      ({ index: a }) => a !== 0 && a !== c.index && (n(a) > n(c.index) || c.index === 0 && n(0) === 0 && n(a) === 0) && o(a, c.xy)
    );
    return i.filter((c) => !u(c)).sort((c, a) => s(a.index) - s(c.index) || n(a.index) - n(c.index) || c.index - a.index).map((c) => [c.index, c.xy]);
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
    return e.map((s, o) => {
      if (!s) {
        n = !0;
        return;
      }
      const i = s[0], u = s[1];
      return o !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((a, m) => m === 0 ? u : this._transformByIndex(a, i, !0)).map((a) => this.xy2SysCoordInternal(a));
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
    const s = ct(t.center, t.zoom, t.rotation, e).map((a) => ft(a, this._maxxy)), o = this.xy2MercWithLayer(s[0]);
    if (!o) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const i = o[0], u = o[1];
    return s.map((a, m) => {
      if (m === 0) return u;
      const f = this._transformByIndex(a, i, !1);
      if (f === !1) throw new Error(`viewpoint2Mercs: point ${m} is out of bounds`);
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
    const n = this.merc2XyWithLayer(t[0]), s = n[0] || n[1];
    if (!s) throw new Error("mercs2Viewpoint: center point is out of bounds");
    const o = s[0], i = s[1], c = t.map((a, m) => {
      if (m === 0) return i;
      const f = this._transformByIndex(a, o, !0);
      if (f === !1) throw new Error(`mercs2Viewpoint: point ${m} is out of bounds`);
      return f;
    }).map((a) => J(a, this._maxxy));
    return ut(c, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return pt(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, s) {
    return ct(t, e, n, s);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return ut(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return J(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return ft(t, e);
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
    if (t === 0) return this.mainTin instanceof S ? this.mainTin : null;
    const e = this.subTins[t - 1];
    return e?.tin instanceof S ? e.tin : null;
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
      const s = e.tin.priority ?? 0, o = n.tin.priority ?? 0;
      return s < o ? 1 : -1;
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
    return J(t, this._maxxy);
  }
}
export {
  Ht as MERC_CROSSMATRIX,
  v as MERC_MAX,
  or as MapTransform,
  S as Transform,
  rr as WorldFileSurface,
  tr as builtinProjectionEngine,
  sr as counterTri,
  wt as crsToWorldFilePixel,
  ir as format_version,
  ct as mercViewpoint2Mercs,
  ut as mercs2MercViewpoint,
  jt as normalizeEdges,
  er as rotateMatrix,
  nr as rotateVerticesTriangle,
  ft as sysCoord2Xy,
  Nt as transformArr,
  yt as validateWorldFile,
  gt as worldFileToCrs,
  J as xy2SysCoord,
  pt as zoom2Radius
};
