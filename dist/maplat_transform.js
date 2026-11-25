function ht(r, t, e = {}) {
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
  return ht({
    type: "Point",
    coordinates: r
  }, t, e);
}
function V(r, t, e = {}) {
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
  return ht({
    type: "Polygon",
    coordinates: r
  }, t, e);
}
function W(r, t = {}) {
  const e = { type: "FeatureCollection" };
  return t.id && (e.id = t.id), t.bbox && (e.bbox = t.bbox), e.features = r, e;
}
function Q(r) {
  return !isNaN(r) && r !== null && !Array.isArray(r);
}
function Tt(r) {
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
function vt(r) {
  return r.type === "Feature" ? r.geometry : r;
}
const X = 11102230246251565e-32, A = 134217729, St = (3 + 8 * X) * X;
function z(r, t, e, n, i) {
  let o, s, u, c, a = t[0], h = n[0], f = 0, l = 0;
  h > a == h > -a ? (o = a, a = t[++f]) : (o = h, h = n[++l]);
  let m = 0;
  if (f < r && l < e)
    for (h > a == h > -a ? (s = a + o, u = o - (s - a), a = t[++f]) : (s = h + o, u = o - (s - h), h = n[++l]), o = s, u !== 0 && (i[m++] = u); f < r && l < e; )
      h > a == h > -a ? (s = o + a, c = s - o, u = o - (s - c) + (a - c), a = t[++f]) : (s = o + h, c = s - o, u = o - (s - c) + (h - c), h = n[++l]), o = s, u !== 0 && (i[m++] = u);
  for (; f < r; )
    s = o + a, c = s - o, u = o - (s - c) + (a - c), a = t[++f], o = s, u !== 0 && (i[m++] = u);
  for (; l < e; )
    s = o + h, c = s - o, u = o - (s - c) + (h - c), h = n[++l], o = s, u !== 0 && (i[m++] = u);
  return (o !== 0 || m === 0) && (i[m++] = o), m;
}
function At(r, t) {
  let e = t[0];
  for (let n = 1; n < r; n++) e += t[n];
  return e;
}
function D(r) {
  return new Float64Array(r);
}
const It = (3 + 16 * X) * X, Ct = (2 + 12 * X) * X, Pt = (9 + 64 * X) * X * X, j = D(4), tt = D(8), rt = D(12), et = D(16), C = D(4);
function Nt(r, t, e, n, i, o, s) {
  let u, c, a, h, f, l, m, w, b, g, d, y, M, _, T, E, x, p;
  const P = r - i, N = e - i, O = t - o, F = n - o;
  _ = P * F, l = A * P, m = l - (l - P), w = P - m, l = A * F, b = l - (l - F), g = F - b, T = w * g - (_ - m * b - w * b - m * g), E = O * N, l = A * O, m = l - (l - O), w = O - m, l = A * N, b = l - (l - N), g = N - b, x = w * g - (E - m * b - w * b - m * g), d = T - x, f = T - d, j[0] = T - (d + f) + (f - x), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, j[1] = M - (d + f) + (f - E), p = y + d, f = p - y, j[2] = y - (p - f) + (d - f), j[3] = p;
  let k = At(4, j), $ = Ct * s;
  if (k >= $ || -k >= $ || (f = r - P, u = r - (P + f) + (f - i), f = e - N, a = e - (N + f) + (f - i), f = t - O, c = t - (O + f) + (f - o), f = n - F, h = n - (F + f) + (f - o), u === 0 && c === 0 && a === 0 && h === 0) || ($ = Pt * s + St * Math.abs(k), k += P * h + F * u - (O * a + N * c), k >= $ || -k >= $)) return k;
  _ = u * F, l = A * u, m = l - (l - u), w = u - m, l = A * F, b = l - (l - F), g = F - b, T = w * g - (_ - m * b - w * b - m * g), E = c * N, l = A * c, m = l - (l - c), w = c - m, l = A * N, b = l - (l - N), g = N - b, x = w * g - (E - m * b - w * b - m * g), d = T - x, f = T - d, C[0] = T - (d + f) + (f - x), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), p = y + d, f = p - y, C[2] = y - (p - f) + (d - f), C[3] = p;
  const Mt = z(4, j, 4, C, tt);
  _ = P * h, l = A * P, m = l - (l - P), w = P - m, l = A * h, b = l - (l - h), g = h - b, T = w * g - (_ - m * b - w * b - m * g), E = O * a, l = A * O, m = l - (l - O), w = O - m, l = A * a, b = l - (l - a), g = a - b, x = w * g - (E - m * b - w * b - m * g), d = T - x, f = T - d, C[0] = T - (d + f) + (f - x), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), p = y + d, f = p - y, C[2] = y - (p - f) + (d - f), C[3] = p;
  const _t = z(Mt, tt, 4, C, rt);
  _ = u * h, l = A * u, m = l - (l - u), w = u - m, l = A * h, b = l - (l - h), g = h - b, T = w * g - (_ - m * b - w * b - m * g), E = c * a, l = A * c, m = l - (l - c), w = c - m, l = A * a, b = l - (l - a), g = a - b, x = w * g - (E - m * b - w * b - m * g), d = T - x, f = T - d, C[0] = T - (d + f) + (f - x), y = _ + d, f = y - _, M = _ - (y - f) + (d - f), d = M - E, f = M - d, C[1] = M - (d + f) + (f - E), p = y + d, f = p - y, C[2] = y - (p - f) + (d - f), C[3] = p;
  const Et = z(_t, rt, 4, C, et);
  return et[Et - 1];
}
function Ot(r, t, e, n, i, o) {
  const s = (t - o) * (e - i), u = (r - i) * (n - o), c = s - u, a = Math.abs(s + u);
  return Math.abs(c) >= It * a ? c : -Nt(r, t, e, n, i, o, a);
}
function Ft(r, t) {
  var e, n, i = 0, o, s, u, c, a, h, f, l = r[0], m = r[1], w = t.length;
  for (e = 0; e < w; e++) {
    n = 0;
    var b = t[e], g = b.length - 1;
    if (h = b[0], h[0] !== b[g][0] && h[1] !== b[g][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = h[0] - l, u = h[1] - m, n; n < g; n++) {
      if (f = b[n + 1], c = f[0] - l, a = f[1] - m, u === 0 && a === 0) {
        if (c <= 0 && s >= 0 || s <= 0 && c >= 0)
          return 0;
      } else if (a >= 0 && u <= 0 || a <= 0 && u >= 0) {
        if (o = Ot(s, c, u, a, 0, 0), o === 0)
          return 0;
        (o > 0 && a > 0 && u <= 0 || o < 0 && a <= 0 && u > 0) && i++;
      }
      h = f, u = a, s = c;
    }
  }
  return i % 2 !== 0;
}
function L(r, t, e = {}) {
  if (!r)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = Tt(r), i = vt(t), o = i.type, s = t.bbox;
  let u = i.coordinates;
  if (s && Rt(n, s) === !1)
    return !1;
  o === "Polygon" && (u = [u]);
  for (var c = 0; c < u.length; ++c) {
    const a = Ft(n, u[c]);
    if (a === 0 && !e.ignoreBoundary) return !0;
    if (a) return !0;
  }
  return !1;
}
function Rt(r, t) {
  return t[0] <= r[0] && t[1] <= r[1] && t[2] >= r[0] && t[3] >= r[1];
}
function Z(r, t, e) {
  if (e) {
    const n = r.geometry.coordinates, i = I(n[0], e.xOrigin, e.xUnit, e.gridNum), o = I(n[1], e.yOrigin, e.yUnit, e.gridNum), s = e.gridCache[i]?.[o] ?? [];
    for (const u of s) {
      const c = t.features[u];
      if (c && L(r, c)) return c;
    }
    return;
  }
  for (let n = 0; n < t.features.length; n++)
    if (L(r, t.features[n]))
      return t.features[n];
}
function mt(r, t) {
  const e = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = r.geometry.coordinates, s = t.properties.a.geom, u = t.properties.b.geom, c = t.properties.c.geom, a = [n[0] - e[0], n[1] - e[1]], h = [i[0] - e[0], i[1] - e[1]], f = [o[0] - e[0], o[1] - e[1]], l = [u[0] - s[0], u[1] - s[1]], m = [c[0] - s[0], c[1] - s[1]], w = (h[1] * f[0] - h[0] * f[1]) / (a[0] * h[1] - a[1] * h[0]), b = (a[0] * f[1] - a[1] * f[0]) / (a[0] * h[1] - a[1] * h[0]);
  return [
    w * l[0] + b * m[0] + s[0],
    w * l[1] + b * m[1] + s[1]
  ];
}
function kt(r, t, e) {
  const n = r.geometry.coordinates, i = e.geometry.coordinates, o = Math.atan2(n[0] - i[0], n[1] - i[1]), s = Xt(o, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const u = t[1][s];
  return mt(r, u.features[0]);
}
function Bt(r, t, e, n, i, o, s, u, c) {
  let a = c;
  if (!a && s && (a = Z(r, W([s]))), !a)
    if (e) {
      const h = r.geometry.coordinates, f = e.gridNum, l = e.xOrigin, m = e.yOrigin, w = e.xUnit, b = e.yUnit, g = e.gridCache, d = I(h[0], l, w, f), y = I(h[1], m, b, f), M = g[d] ? g[d][y] ? g[d][y] : [] : [], _ = W(M.map((T) => t.features[T]));
      a = Z(r, _);
    } else
      a = Z(r, t);
  return u && u(a), a ? mt(r, a) : kt(r, n, i);
}
function I(r, t, e, n) {
  let i = Math.floor((r - t) / e);
  return i < 0 && (i = 0), i >= n && (i = n - 1), i;
}
const Lt = 36;
function nt(r, t, e) {
  const n = (t[1][0] - t[0][0]) / e, i = (t[1][1] - t[0][1]) / e;
  return r.reduce((o, s) => {
    const u = I(s[0][0], t[0][0], n, e), c = I(s[1][0], t[0][0], n, e), a = I(s[0][1], t[0][1], i, e), h = I(s[1][1], t[0][1], i, e), f = (c - u + 1) * (h - a + 1);
    return f > 0 ? o + f : o;
  }, 0);
}
function Xt(r, t) {
  let e = st(r - t[0]), n = Math.PI * 2, i;
  for (let o = 0; o < t.length; o++) {
    const s = (o + 1) % t.length, u = st(r - t[s]), c = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && c < n && (n = c, i = o), e = u;
  }
  return i;
}
function st(r, t = !1) {
  const e = 2 * Math.PI, n = r - Math.floor(r / e) * e;
  return t ? n : n > Math.PI ? n - e : n;
}
function rr(r) {
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
function er(r) {
  const t = ["a", "b", "c", "a"].map(
    (o) => r.properties[o].geom
  ), e = r.geometry.coordinates[0], n = r.properties, i = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return V([t], i);
}
function jt(r) {
  const t = [0, 1, 2, 0].map((n) => r[n][0][0]), e = {
    a: { geom: r[0][0][1], index: r[0][1] },
    b: { geom: r[1][0][1], index: r[1][1] },
    c: { geom: r[2][0][1], index: r[2][1] }
  };
  return V([t], e);
}
function J(r, t, e, n, i, o = !1, s) {
  const u = r.map(
    (c) => {
      (!s || s < 2.00703) && (c = Ut(c));
      const a = isFinite(c) ? t[c] : c === "c" ? n : (function() {
        const h = c.match(/^b(\d+)$/);
        if (h) return i[parseInt(h[1])];
        const f = c.match(/^e(\d+)$/);
        if (f) return e[parseInt(f[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return o ? [[a[1], a[0]], c] : [[a[0], a[1]], c];
    }
  );
  return jt(u);
}
function Ut(r) {
  return typeof r == "number" ? r : r.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Vt(r, t) {
  return t && t >= 2.00703 || Array.isArray(r[0]) ? r : r.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const dt = 2.00704;
function it(r) {
  return !!(r.version !== void 0 || !r.tins && r.points && r.tins_points);
}
function ot(r) {
  return {
    points: r.points,
    strictStatus: Wt(r),
    verticesParams: $t(r),
    centroid: Dt(r),
    edges: Vt(r.edges || []),
    edgeNodes: r.edgeNodes || [],
    tins: Yt(r),
    kinks: qt(r.kinks_points),
    yaxisMode: r.yaxisMode ?? "invert",
    strictMode: r.strictMode ?? "auto",
    vertexMode: r.vertexMode,
    bounds: r.bounds,
    boundsPolygon: r.boundsPolygon,
    wh: r.wh,
    xy: r.xy ?? [0, 0]
  };
}
function at(r) {
  const t = Gt(r), e = t.tins, n = t.vertices_params;
  return n != null && yt(n), {
    compiled: t,
    tins: e,
    points: Zt(e),
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
  return t.forw[1] = ct(r, !1), t.bakw[1] = ct(r, !0), yt(t), t;
}
function yt(r) {
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
function ct(r, t) {
  const e = r.vertices_points.length;
  return Array.from({ length: e }, (n, i) => {
    const o = (i + 1) % e, s = J(
      ["c", `b${i}`, `b${o}`],
      r.points,
      r.edgeNodes || [],
      r.centroid_point,
      r.vertices_points,
      t,
      dt
    );
    return W([s]);
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
    forw: W(
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
    bakw: W(
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
function qt(r) {
  if (r)
    return {
      bakw: W(
        r.map((t) => R(t))
      )
    };
}
function Gt(r) {
  return JSON.parse(
    JSON.stringify(r).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Zt(r) {
  const t = [], e = r.forw.features;
  for (let n = 0; n < e.length; n++) {
    const i = e[n];
    ["a", "b", "c"].forEach((o, s) => {
      const u = i.geometry.coordinates[0][s], c = i.properties[o].geom, a = i.properties[o].index;
      typeof a == "number" && (t[a] = [u, c]);
    });
  }
  return t;
}
function gt(r) {
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
function wt(r, t) {
  const e = t[0] - 0.5, n = t[1] - 0.5;
  return [
    r.xScale * e + r.xSkew * n + r.xOrigin,
    r.ySkew * e + r.yScale * n + r.yOrigin
  ];
}
function bt(r, t) {
  const e = r.xScale * r.yScale - r.xSkew * r.ySkew, n = t[0] - r.xOrigin, i = t[1] - r.yOrigin;
  return [
    (r.yScale * n - r.xSkew * i) / e + 0.5,
    (-r.ySkew * n + r.xScale * i) / e + 0.5
  ];
}
const nr = dt;
function zt(r, t) {
  let e = !1;
  for (let n = 0, i = t.length - 1; n < t.length; i = n++) {
    const [o, s] = t[i], [u, c] = t[n], a = (r[0] - o) * (c - s) - (r[1] - s) * (u - o), h = u - o, f = c - s, l = r[0] - o, m = r[1] - s, w = Number.EPSILON * 16 * Math.max(1, Math.abs(o), Math.abs(s), Math.abs(u), Math.abs(c), Math.abs(r[0]), Math.abs(r[1])), b = Math.hypot(h, f), g = w * b + Number.EPSILON * 16 * (Math.abs(l * f) + Math.abs(m * h));
    if (Math.abs(a) <= g && r[0] >= Math.min(o, u) - w && r[0] <= Math.max(o, u) + w && r[1] >= Math.min(s, c) - w && r[1] <= Math.max(s, c) + w) return !0;
    s > r[1] != c > r[1] && r[0] < (u - o) * (r[1] - s) / (c - s) + o && (e = !e);
  }
  return e;
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
    const i = e ? t.worldFile : void 0;
    if (n === "worldFile") {
      if (!i) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      gt(i);
      const a = t.vertices_points;
      if (!Array.isArray(a) || a.length < 4 || a.some((m) => !Array.isArray(m) || m.length < 2 || m.some((w) => !Array.isArray(w) || w.length < 2 || !w.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const h = (m) => a.reduce((w, b, g) => {
        const d = a[(g + 1) % a.length][m];
        return w + b[m][0] * d[1] - d[0] * b[m][1];
      }, 0), f = h(0), l = h(1);
      if (!(Number.isFinite(f) && Number.isFinite(l)) || f === 0 || l === 0)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
    }
    const o = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = new S();
    it(o) ? s.applyModernState(ot(o)) : s.applyLegacyState(at(o));
    const c = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices"].map((a) => [a, this[a]]));
    try {
      it(o) ? this.applyModernState(ot(o)) : this.applyLegacyState(at(o)), this.outerTransform = n ?? "extrapolate", this.worldFile = i, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0;
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
    const t = this.tins, e = t.forw, n = t.bakw, i = Math.ceil(Math.sqrt(e.features.length));
    if (i < 3) {
      this.indexedTins = void 0;
      return;
    }
    let o = [], s = [];
    const u = e.features.map((g) => {
      let d = [];
      return H(g)[0].map((y) => {
        o.length === 0 ? o = [Array.from(y), Array.from(y)] : (y[0] < o[0][0] && (o[0][0] = y[0]), y[0] > o[1][0] && (o[1][0] = y[0]), y[1] < o[0][1] && (o[0][1] = y[1]), y[1] > o[1][1] && (o[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    }), c = n.features.map((g) => {
      let d = [];
      return H(g)[0].map((y) => {
        s.length === 0 ? s = [Array.from(y), Array.from(y)] : (y[0] < s[0][0] && (s[0][0] = y[0]), y[0] > s[1][0] && (s[1][0] = y[0]), y[1] < s[0][1] && (s[0][1] = y[1]), y[1] > s[1][1] && (s[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    });
    if (Math.max(
      nt(u, o, i),
      nt(c, s, i)
    ) > Lt * e.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const h = (o[1][0] - o[0][0]) / i, f = (o[1][1] - o[0][1]) / i, l = u.reduce(
      (g, d, y) => {
        const M = I(d[0][0], o[0][0], h, i), _ = I(d[1][0], o[0][0], h, i), T = I(d[0][1], o[0][1], f, i), E = I(d[1][1], o[0][1], f, i);
        for (let x = M; x <= _; x++) {
          g[x] || (g[x] = []);
          for (let p = T; p <= E; p++)
            g[x][p] || (g[x][p] = []), g[x][p].push(y);
        }
        return g;
      },
      []
    ), m = (s[1][0] - s[0][0]) / i, w = (s[1][1] - s[0][1]) / i, b = c.reduce(
      (g, d, y) => {
        const M = I(d[0][0], s[0][0], m, i), _ = I(d[1][0], s[0][0], m, i), T = I(d[0][1], s[0][1], w, i), E = I(d[1][1], s[0][1], w, i);
        for (let x = M; x <= _; x++) {
          g[x] || (g[x] = []);
          for (let p = T; p <= E; p++)
            g[x][p] || (g[x][p] = []), g[x][p].push(y);
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
        xUnit: h,
        yUnit: f,
        gridCache: l
      },
      bakw: {
        gridNum: i,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: m,
        yUnit: w,
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
    if (e && this.strict_status == S.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const i = t;
    this.yaxisMode == S.YAXIS_FOLLOW && e && (t = [t[0], -1 * t[1]]);
    const o = R(t);
    if (this.bounds && !e && !n && !L(o, this.boundsPolygon))
      return !1;
    const s = e ? this.tins.bakw : this.tins.forw, u = e ? this.indexedTins?.bakw : this.indexedTins?.forw, c = this.outerVertices?.map((g) => e ? g[1] : g[0]), a = c && zt(o.geometry.coordinates, c), h = this.outerTransform === "worldFile" && s ? Z(o, s, u) : void 0;
    if (this.outerTransform === "worldFile" && s && !a) {
      const g = e ? bt(this.worldFile, i) : wt(this.worldFile, i);
      return !g.every(Number.isFinite) || e && this.bounds && !n && !L(R(g), this.boundsPolygon) ? !1 : g;
    }
    if (e && this.strict_status == S.STATUS_ERROR)
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    if (this.outerTransform === "worldFile" && !h) return !1;
    const f = e ? this.vertices_params.bakw : this.vertices_params.forw, l = e ? this.centroid.bakw : this.centroid.forw;
    let m, w;
    this.stateFull && (this.stateBackward == e ? m = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), w = (g) => {
      this.stateTriangle = g;
    });
    let b = Bt(
      o,
      s,
      u,
      f,
      l,
      void 0,
      m,
      w,
      h
    );
    if (this.bounds && e && !n) {
      const g = R(b);
      if (!L(g, this.boundsPolygon)) return !1;
    } else this.yaxisMode == S.YAXIS_FOLLOW && !e && (b = [b[0], -1 * b[1]]);
    return b;
  }
}
const v = 20037508342789244e-9, Kt = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], Y = 6378137, q = 180 / Math.PI * Math.atan(Math.sinh(Math.PI)), Jt = Number.EPSILON * v * 16, G = ["+no_defs", "+type=crs", "+axis=enu", "+towgs84=0,0,0"];
function B(r) {
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
  const t = r.proj4.trim().split(/\s+/).map((i) => {
    const [o, ...s] = i.replace(/^\+/, "").split("="), u = o.toLowerCase(), c = s.join("="), a = s.length > 0;
    if (u === "axis" && (!a || c.toLowerCase() !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if (u === "no_defs" && !a && G.includes("+no_defs")) return "";
    if (a && c === "") throw new Error(`+${u}= は許可されていません`);
    if (u === "wktext") throw new Error("+wktext は許可されていません");
    if (u === "type" && !a) throw new Error("+type は値が必要です");
    if (u === "type" && c.toLowerCase() === "crs" && G.includes("+type=crs") || u === "axis" && c.toLowerCase() === "enu" && G.includes("+axis=enu")) return "";
    if (u === "towgs84") {
      const f = c.split(",");
      if (!a || f.some((m) => m.trim() === "")) throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(f.length) && f.every((m) => {
        const w = m.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(m)) && !/[1-9]/.test(w);
      }) && G.includes("+towgs84=0,0,0")) return "";
    }
    const h = c ? c.split(",").map((f) => {
      const l = Number(f);
      return f.trim() !== "" && Number.isFinite(l) ? Object.is(l, -0) ? "0" : String(l) : f.toLowerCase();
    }).join(",") : "";
    return `+${u}${c ? `=${h}` : ""}`;
  }).filter(Boolean), e = [...new Set(t)].sort().join(" ");
  if (!(r.epsg === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : ["+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"]).includes(e))
    throw new Error(`epsg と proj4 が一致しないか、一期では判定できない CRS です（EPSG:${r.epsg}）`);
}
const Qt = {
  toLonLat(r, t) {
    if (!B(r)) return !1;
    if (t.epsg === 4326) return Math.abs(r[0]) <= 180 && Math.abs(r[1]) <= q ? [r[0], r[1]] : !1;
    if (t.epsg !== 3857 || Math.abs(r[0]) > v || Math.abs(r[1]) > v) return !1;
    const e = r[0], n = r[1];
    return [
      Math.abs(e) === v ? Math.sign(e) * 180 : e / Y * (180 / Math.PI),
      Math.abs(n) === v ? Math.sign(n) * q : (2 * Math.atan(Math.exp(n / Y)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(r, t) {
    if (!B(r) || Math.abs(r[0]) > 180 || Math.abs(r[1]) > q) return !1;
    const e = r;
    if (t.epsg === 4326) return [e[0], e[1]];
    if (t.epsg !== 3857) return !1;
    const n = e[0] * Math.PI / 180, i = e[1] * Math.PI / 180, o = [
      Math.abs(e[0]) === 180 ? Math.sign(e[0]) * v : Y * n,
      Math.abs(e[1]) === q ? Math.sign(e[1]) * v : Y * Math.log(Math.tan(Math.PI / 4 + i / 2))
    ];
    return o.every(Number.isFinite) ? o : !1;
  }
};
class Ht {
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
    if (gt(t.worldFile), xt(t.crs), !t.wh && !t.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? Qt;
    const e = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = e.map((u) => u[0]), i = e.map((u) => u[1]), o = Math.min(...n), s = Math.min(...i);
      if (this.wh = [Math.max(...n) - o, Math.max(...i) - s], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = t.xy ?? [o, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance;
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return wt(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return bt(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, e = !1, n = !1) {
    if (!B(t)) return !1;
    if (!e) {
      const u = this.xyToCrs(t);
      if (this.crs.epsg === 3857) {
        const h = (l) => Math.abs(Math.abs(l) - v) <= Jt ? Math.sign(l) * v : l, f = [h(u[0]), h(u[1])];
        return f.every((l) => Number.isFinite(l) && Math.abs(l) <= v) ? f : !1;
      }
      const c = this.projectionEngine.toLonLat(u, this.crs);
      if (c === !1 || !B(c)) return !1;
      const a = this.projectionEngine.fromLonLat(c, { epsg: 3857 });
      return a !== !1 && B(a) ? a : !1;
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(t[0]) > v || Math.abs(t[1]) > v) return !1;
      const u = this.crsToXy(t);
      return B(u) ? u : !1;
    }
    const i = this.projectionEngine.toLonLat(t, { epsg: 3857 });
    if (i === !1 || !B(i)) return !1;
    const o = this.projectionEngine.fromLonLat(i, this.crs);
    if (o === !1 || !B(o)) return !1;
    const s = this.crsToXy(o);
    return B(s) ? s : !1;
  }
}
function pt(r, t) {
  return Math.floor(Math.min(r[0], r[1]) / 4) * v / 128 / Math.pow(2, t);
}
function tr(r, t) {
  const e = [];
  for (let n = 0; n < r.length; n++) {
    const i = r[n], o = i[0] * Math.cos(t) - i[1] * Math.sin(t), s = i[0] * Math.sin(t) + i[1] * Math.cos(t);
    e.push([o, s]);
  }
  return e;
}
function ut(r, t, e, n) {
  const i = pt(n, t);
  return tr(Kt, e).map((u) => [
    u[0] * i + r[0],
    u[1] * i + r[1]
  ]);
}
function ft(r, t) {
  const e = r[0], i = r.slice(1, 5).map((m) => [
    m[0] - e[0],
    m[1] - e[1]
  ]), o = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, u = 0, c = 0;
  for (let m = 0; m < 4; m++) {
    const w = i[m], b = o[m], g = Math.sqrt(Math.pow(w[0], 2) + Math.pow(w[1], 2));
    s += g;
    const d = w[0] * b[1] - w[1] * b[0], y = Math.acos(
      (w[0] * b[0] + w[1] * b[1]) / g
    ), M = d > 0 ? -1 * y : y;
    u += Math.cos(M), c += Math.sin(M);
  }
  const a = s / 4, h = Math.atan2(c, u), f = Math.floor(Math.min(t[0], t[1]) / 4), l = Math.log(f * v / 128 / a) / Math.log(2);
  return { center: e, zoom: l, rotation: h };
}
function K(r, t) {
  const e = r[0] * (2 * v) / t - v, n = -1 * (r[1] * (2 * v) / t - v);
  return [e, n];
}
function lt(r, t) {
  const e = (r[0] + v) * t / (2 * v), n = (-r[1] + v) * t / (2 * v);
  return [e, n];
}
const U = 256;
class sr {
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
      this._maxxy = Math.pow(2, t.maxZoom) * U;
    else if (t.compiled.wh) {
      const n = Math.max(t.compiled.wh[0], t.compiled.wh[1]), i = Math.ceil(Math.log2(n / U));
      this._maxxy = Math.pow(2, i) * U;
    }
    if (this.subTins = [], t.sub_maps)
      for (const n of t.sub_maps) {
        const i = new S();
        i.setCompiled(n.compiled);
        const o = n.bounds ?? n.compiled.bounds;
        if (!o) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const s = [...o, o[0]], u = s.map((c) => {
          const a = i.transform(c, !1);
          if (!a) throw new Error("Failed to transform sub-map bounds to mercator");
          return a;
        });
        this.subTins.push({
          tin: i,
          priority: n.priority,
          importance: n.importance,
          xyBounds: V([s]),
          mercBounds: V([u])
        });
      }
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this.mainTin = this._createSurface(t.main), t.main.priority !== void 0 && (this.mainTin.priority = t.main.priority), t.main.importance !== void 0 && (this.mainTin.importance = t.main.importance);
    const e = t.main.kind === "tin" ? t.main.compiled.wh : this.mainTin.wh;
    if (t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * U;
    else if (e) {
      const n = Math.max(e[0], e[1]), i = Math.ceil(Math.log2(n / U));
      this._maxxy = Math.pow(2, i) * U;
    }
    this.subTins = [];
    for (const n of t.sub_maps ?? []) {
      const i = this._createSurface(n), o = n.bounds ?? (n.kind === "tin" ? n.compiled.bounds : void 0);
      if (!o) throw new Error("副層には bounds または compiled.bounds が必要です");
      const s = [...o, o[0]], u = s.map((c) => {
        const a = i.transform(c, !1);
        if (!a) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return a;
      });
      this.subTins.push({
        tin: i,
        priority: n.priority ?? 0,
        importance: n.importance ?? 0,
        xyBounds: V([s]),
        mercBounds: V([u])
      });
    }
  }
  _createSurface(t) {
    if (t.kind === "worldFile") return new Ht(t);
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: u, isMain: c }) => {
      const a = this._transformByIndex(t, s, !0);
      return a === !1 ? [u, s] : c || L(R(a), this.subTins[s - 1].xyBounds) ? [u, s, a] : [u, s];
    }).sort((s, u) => {
      const c = s[0].priority ?? 0, a = u[0].priority ?? 0;
      return c < a ? 1 : -1;
    }).reduce(
      (s, u, c, a) => {
        const h = u[0], f = u[1], l = u[2];
        if (!l) return s;
        for (let m = 0; m < c; m++) {
          const w = a[m][1], b = w === 0;
          if (a[m][2] && (b || L(R(l), this.subTins[w - 1].xyBounds)))
            if (s.length) {
              const g = !s[0], d = g ? s[1][2] : s[0][2], y = h.importance ?? 0, M = d.importance ?? 0;
              return g ? y < M ? s : [void 0, [f, l, h]] : [...s.filter(
                (E) => E !== void 0
              ), [f, l, h]].sort(
                (E, x) => (E[2].importance ?? 0) < (x[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[f, l, h]];
        }
        return !s.length || !s[0] ? [[f, l, h]] : (s.push([f, l, h]), s.sort((m, w) => {
          const b = m[2].importance ?? 0, g = w[2].importance ?? 0;
          return b < g ? 1 : -1;
        }).filter((m, w) => w < 2));
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
    const e = this._getAllTinsWithIndex(), n = (c) => c === 0 ? 0 : this.subTins[c - 1].priority ?? 0, i = (c) => c === 0 ? 0 : this.subTins[c - 1].importance ?? 0, o = (c, a) => c === 0 || L(R(a), this.subTins[c - 1].xyBounds), s = [];
    for (const { index: c } of e) {
      const a = this._transformByIndex(t, c, !0);
      a !== !1 && o(c, a) && s.push({ index: c, xy: a });
    }
    const u = (c) => e.some(
      ({ index: a }) => a !== 0 && a !== c.index && (n(a) > n(c.index) || c.index === 0 && n(a) === 0) && o(a, c.xy)
    );
    return s.filter((c) => !u(c)).sort((c, a) => i(a.index) - i(c.index) || n(a.index) - n(c.index) || c.index - a.index).map((c) => [c.index, c.xy]);
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
      return o !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((a, h) => h === 0 ? u : this._transformByIndex(a, s, !0)).map((a) => this.xy2SysCoordInternal(a));
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
    const i = ut(t.center, t.zoom, t.rotation, e).map((a) => lt(a, this._maxxy)), o = this.xy2MercWithLayer(i[0]);
    if (!o) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const s = o[0], u = o[1];
    return i.map((a, h) => {
      if (h === 0) return u;
      const f = this._transformByIndex(a, s, !1);
      if (f === !1) throw new Error(`viewpoint2Mercs: point ${h} is out of bounds`);
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
    const o = i[0], s = i[1], c = t.map((a, h) => {
      if (h === 0) return s;
      const f = this._transformByIndex(a, o, !0);
      if (f === !1) throw new Error(`mercs2Viewpoint: point ${h} is out of bounds`);
      return f;
    }).map((a) => K(a, this._maxxy));
    return ft(c, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, e) {
    return pt(t, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, e, n, i) {
    return ut(t, e, n, i);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, e) {
    return ft(t, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, e) {
    return K(t, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, e) {
    return lt(t, e);
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
    return K(t, this._maxxy);
  }
}
export {
  Kt as MERC_CROSSMATRIX,
  v as MERC_MAX,
  sr as MapTransform,
  S as Transform,
  Ht as WorldFileSurface,
  Qt as builtinProjectionEngine,
  er as counterTri,
  bt as crsToWorldFilePixel,
  nr as format_version,
  ut as mercViewpoint2Mercs,
  ft as mercs2MercViewpoint,
  Vt as normalizeEdges,
  tr as rotateMatrix,
  rr as rotateVerticesTriangle,
  lt as sysCoord2Xy,
  Bt as transformArr,
  gt as validateWorldFile,
  wt as worldFileToCrs,
  K as xy2SysCoord,
  pt as zoom2Radius
};
