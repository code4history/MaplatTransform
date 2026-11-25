function dt(t, r, e = {}) {
  const n = { type: "Feature" };
  return (e.id === 0 || e.id) && (n.id = e.id), e.bbox && (n.bbox = e.bbox), n.properties = r || {}, n.geometry = t, n;
}
function B(t, r, e = {}) {
  if (!t)
    throw new Error("coordinates is required");
  if (!Array.isArray(t))
    throw new Error("coordinates must be an Array");
  if (t.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!rt(t[0]) || !rt(t[1]))
    throw new Error("coordinates must contain numbers");
  return dt({
    type: "Point",
    coordinates: t
  }, r, e);
}
function U(t, r, e = {}) {
  for (const o of t) {
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
  return dt({
    type: "Polygon",
    coordinates: t
  }, r, e);
}
function D(t, r = {}) {
  const e = { type: "FeatureCollection" };
  return r.id && (e.id = r.id), r.bbox && (e.bbox = r.bbox), e.features = t, e;
}
function rt(t) {
  return !isNaN(t) && t !== null && !Array.isArray(t);
}
function jt(t) {
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
function et(t) {
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
function Rt(t) {
  return t.type === "Feature" ? t.geometry : t;
}
const N = 11102230246251565e-32, A = 134217729, Ft = (3 + 8 * N) * N;
function K(t, r, e, n, o) {
  let i, s, u, c, a = r[0], h = n[0], f = 0, l = 0;
  h > a == h > -a ? (i = a, a = r[++f]) : (i = h, h = n[++l]);
  let m = 0;
  if (f < t && l < e)
    for (h > a == h > -a ? (s = a + i, u = i - (s - a), a = r[++f]) : (s = h + i, u = i - (s - h), h = n[++l]), i = s, u !== 0 && (o[m++] = u); f < t && l < e; )
      h > a == h > -a ? (s = i + a, c = s - i, u = i - (s - c) + (a - c), a = r[++f]) : (s = i + h, c = s - i, u = i - (s - c) + (h - c), h = n[++l]), i = s, u !== 0 && (o[m++] = u);
  for (; f < t; )
    s = i + a, c = s - i, u = i - (s - c) + (a - c), a = r[++f], i = s, u !== 0 && (o[m++] = u);
  for (; l < e; )
    s = i + h, c = s - i, u = i - (s - c) + (h - c), h = n[++l], i = s, u !== 0 && (o[m++] = u);
  return (i !== 0 || m === 0) && (o[m++] = i), m;
}
function Bt(t, r) {
  let e = r[0];
  for (let n = 1; n < t; n++) e += r[n];
  return e;
}
function Z(t) {
  return new Float64Array(t);
}
const kt = (3 + 16 * N) * N, Ot = (2 + 12 * N) * N, Nt = (9 + 64 * N) * N * N, W = Z(4), nt = Z(8), st = Z(12), it = Z(16), I = Z(4);
function Xt(t, r, e, n, o, i, s) {
  let u, c, a, h, f, l, m, g, p, w, d, y, M, E, v, _, x, b;
  const L = t - o, P = e - o, j = r - i, R = n - i;
  E = L * R, l = A * L, m = l - (l - L), g = L - m, l = A * R, p = l - (l - R), w = R - p, v = g * w - (E - m * p - g * p - m * w), _ = j * P, l = A * j, m = l - (l - j), g = j - m, l = A * P, p = l - (l - P), w = P - p, x = g * w - (_ - m * p - g * p - m * w), d = v - x, f = v - d, W[0] = v - (d + f) + (f - x), y = E + d, f = y - E, M = E - (y - f) + (d - f), d = M - _, f = M - d, W[1] = M - (d + f) + (f - _), b = y + d, f = b - y, W[2] = y - (b - f) + (d - f), W[3] = b;
  let k = Bt(4, W), Y = Ot * s;
  if (k >= Y || -k >= Y || (f = t - L, u = t - (L + f) + (f - o), f = e - P, a = e - (P + f) + (f - o), f = r - j, c = r - (j + f) + (f - i), f = n - R, h = n - (R + f) + (f - i), u === 0 && c === 0 && a === 0 && h === 0) || (Y = Nt * s + Ft * Math.abs(k), k += L * h + R * u - (j * a + P * c), k >= Y || -k >= Y)) return k;
  E = u * R, l = A * u, m = l - (l - u), g = u - m, l = A * R, p = l - (l - R), w = R - p, v = g * w - (E - m * p - g * p - m * w), _ = c * P, l = A * c, m = l - (l - c), g = c - m, l = A * P, p = l - (l - P), w = P - p, x = g * w - (_ - m * p - g * p - m * w), d = v - x, f = v - d, I[0] = v - (d + f) + (f - x), y = E + d, f = y - E, M = E - (y - f) + (d - f), d = M - _, f = M - d, I[1] = M - (d + f) + (f - _), b = y + d, f = b - y, I[2] = y - (b - f) + (d - f), I[3] = b;
  const It = K(4, W, 4, I, nt);
  E = L * h, l = A * L, m = l - (l - L), g = L - m, l = A * h, p = l - (l - h), w = h - p, v = g * w - (E - m * p - g * p - m * w), _ = j * a, l = A * j, m = l - (l - j), g = j - m, l = A * a, p = l - (l - a), w = a - p, x = g * w - (_ - m * p - g * p - m * w), d = v - x, f = v - d, I[0] = v - (d + f) + (f - x), y = E + d, f = y - E, M = E - (y - f) + (d - f), d = M - _, f = M - d, I[1] = M - (d + f) + (f - _), b = y + d, f = b - y, I[2] = y - (b - f) + (d - f), I[3] = b;
  const Lt = K(It, nt, 4, I, st);
  E = u * h, l = A * u, m = l - (l - u), g = u - m, l = A * h, p = l - (l - h), w = h - p, v = g * w - (E - m * p - g * p - m * w), _ = c * a, l = A * c, m = l - (l - c), g = c - m, l = A * a, p = l - (l - a), w = a - p, x = g * w - (_ - m * p - g * p - m * w), d = v - x, f = v - d, I[0] = v - (d + f) + (f - x), y = E + d, f = y - E, M = E - (y - f) + (d - f), d = M - _, f = M - d, I[1] = M - (d + f) + (f - _), b = y + d, f = b - y, I[2] = y - (b - f) + (d - f), I[3] = b;
  const Pt = K(Lt, st, 4, I, it);
  return it[Pt - 1];
}
function Wt(t, r, e, n, o, i) {
  const s = (r - i) * (e - o), u = (t - o) * (n - i), c = s - u, a = Math.abs(s + u);
  return Math.abs(c) >= kt * a ? c : -Xt(t, r, e, n, o, i, a);
}
function Vt(t, r) {
  var e, n, o = 0, i, s, u, c, a, h, f, l = t[0], m = t[1], g = r.length;
  for (e = 0; e < g; e++) {
    n = 0;
    var p = r[e], w = p.length - 1;
    if (h = p[0], h[0] !== p[w][0] && h[1] !== p[w][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = h[0] - l, u = h[1] - m, n; n < w; n++) {
      if (f = p[n + 1], c = f[0] - l, a = f[1] - m, u === 0 && a === 0) {
        if (c <= 0 && s >= 0 || s <= 0 && c >= 0)
          return 0;
      } else if (a >= 0 && u <= 0 || a <= 0 && u >= 0) {
        if (i = Wt(s, c, u, a, 0, 0), i === 0)
          return 0;
        (i > 0 && a > 0 && u <= 0 || i < 0 && a <= 0 && u > 0) && o++;
      }
      h = f, u = a, s = c;
    }
  }
  return o % 2 !== 0;
}
function O(t, r, e = {}) {
  if (!t)
    throw new Error("point is required");
  if (!r)
    throw new Error("polygon is required");
  const n = jt(t), o = Rt(r), i = o.type, s = r.bbox;
  let u = o.coordinates;
  if (s && Ut(n, s) === !1)
    return !1;
  i === "Polygon" && (u = [u]);
  for (var c = 0; c < u.length; ++c) {
    const a = Vt(n, u[c]);
    if (a === 0 && !e.ignoreBoundary) return !0;
    if (a) return !0;
  }
  return !1;
}
function Ut(t, r) {
  return r[0] <= t[0] && r[1] <= t[1] && r[2] >= t[0] && r[3] >= t[1];
}
function z(t, r, e) {
  if (e) {
    const n = t.geometry.coordinates, o = C(n[0], e.xOrigin, e.xUnit, e.gridNum), i = C(n[1], e.yOrigin, e.yUnit, e.gridNum), s = e.gridCache[o]?.[i] ?? [];
    for (const u of s) {
      const c = r.features[u];
      if (c && O(t, c)) return c;
    }
    return;
  }
  for (let n = 0; n < r.features.length; n++)
    if (O(t, r.features[n]))
      return r.features[n];
}
function yt(t, r) {
  const e = r.geometry.coordinates[0][0], n = r.geometry.coordinates[0][1], o = r.geometry.coordinates[0][2], i = t.geometry.coordinates, s = r.properties.a.geom, u = r.properties.b.geom, c = r.properties.c.geom, a = [n[0] - e[0], n[1] - e[1]], h = [o[0] - e[0], o[1] - e[1]], f = [i[0] - e[0], i[1] - e[1]], l = [u[0] - s[0], u[1] - s[1]], m = [c[0] - s[0], c[1] - s[1]], g = (h[1] * f[0] - h[0] * f[1]) / (a[0] * h[1] - a[1] * h[0]), p = (a[0] * f[1] - a[1] * f[0]) / (a[0] * h[1] - a[1] * h[0]);
  return [
    g * l[0] + p * m[0] + s[0],
    g * l[1] + p * m[1] + s[1]
  ];
}
function $t(t, r, e) {
  const n = t.geometry.coordinates, o = e.geometry.coordinates, i = Math.atan2(n[0] - o[0], n[1] - o[1]), s = Gt(i, r[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const u = r[1][s];
  return yt(t, u.features[0]);
}
function Dt(t, r, e, n, o, i, s, u, c) {
  let a = c;
  if (!a && s && (a = z(t, D([s]))), !a)
    if (e) {
      const h = t.geometry.coordinates, f = e.gridNum, l = e.xOrigin, m = e.yOrigin, g = e.xUnit, p = e.yUnit, w = e.gridCache, d = C(h[0], l, g, f), y = C(h[1], m, p, f), M = w[d] ? w[d][y] ? w[d][y] : [] : [], E = D(M.map((v) => r.features[v]));
      a = z(t, E);
    } else
      a = z(t, r);
  return u && u(a), a ? yt(t, a) : $t(t, n, o);
}
function C(t, r, e, n) {
  let o = Math.floor((t - r) / e);
  return o < 0 && (o = 0), o >= n && (o = n - 1), o;
}
const Yt = 36;
function ot(t, r, e) {
  const n = (r[1][0] - r[0][0]) / e, o = (r[1][1] - r[0][1]) / e;
  return t.reduce((i, s) => {
    const u = C(s[0][0], r[0][0], n, e), c = C(s[1][0], r[0][0], n, e), a = C(s[0][1], r[0][1], o, e), h = C(s[1][1], r[0][1], o, e), f = (c - u + 1) * (h - a + 1);
    return f > 0 ? i + f : i;
  }, 0);
}
function Gt(t, r) {
  let e = at(t - r[0]), n = Math.PI * 2, o;
  for (let i = 0; i < r.length; i++) {
    const s = (i + 1) % r.length, u = at(t - r[s]), c = Math.min(Math.abs(e), Math.abs(u));
    e * u <= 0 && c < n && (n = c, o = i), e = u;
  }
  return o;
}
function at(t, r = !1) {
  const e = 2 * Math.PI, n = t - Math.floor(t / e) * e;
  return r ? n : n > Math.PI ? n - e : n;
}
function yr(t) {
  const r = t.features;
  for (let e = 0; e < r.length; e++) {
    const n = r[e];
    `${n.properties.a.index}`.substring(0, 1) === "b" && `${n.properties.b.index}`.substring(0, 1) === "b" ? r[e] = {
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
    } : `${n.properties.c.index}`.substring(0, 1) === "b" && `${n.properties.a.index}`.substring(0, 1) === "b" && (r[e] = {
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
function gr(t) {
  const r = ["a", "b", "c", "a"].map(
    (i) => t.properties[i].geom
  ), e = t.geometry.coordinates[0], n = t.properties, o = {
    a: { geom: e[0], index: n.a.index },
    b: { geom: e[1], index: n.b.index },
    c: { geom: e[2], index: n.c.index }
  };
  return U([r], o);
}
function Zt(t) {
  const r = [0, 1, 2, 0].map((n) => t[n][0][0]), e = {
    a: { geom: t[0][0][1], index: t[0][1] },
    b: { geom: t[1][0][1], index: t[1][1] },
    c: { geom: t[2][0][1], index: t[2][1] }
  };
  return U([r], e);
}
function H(t, r, e, n, o, i = !1, s) {
  const u = t.map(
    (c) => {
      (!s || s < 2.00703) && (c = qt(c));
      const a = isFinite(c) ? r[c] : c === "c" ? n : (function() {
        const h = c.match(/^b(\d+)$/);
        if (h) return o[parseInt(h[1])];
        const f = c.match(/^e(\d+)$/);
        if (f) return e[parseInt(f[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[a[1], a[0]], c] : [[a[0], a[1]], c];
    }
  );
  return Zt(u);
}
function qt(t) {
  return typeof t == "number" ? t : t.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function zt(t, r) {
  return r && r >= 2.00703 || Array.isArray(t[0]) ? t : t.map((e) => [
    e.illstNodes,
    e.mercNodes,
    e.startEnd
  ]);
}
const gt = 2.00704;
function Kt(t) {
  return !!(t.version !== void 0 || !t.tins && t.points && t.tins_points);
}
function Jt(t) {
  return {
    points: t.points,
    strictStatus: Ht(t),
    verticesParams: tr(t),
    centroid: rr(t),
    edges: zt(t.edges || []),
    edgeNodes: t.edgeNodes || [],
    tins: er(t),
    kinks: nr(t.kinks_points),
    yaxisMode: t.yaxisMode ?? "invert",
    strictMode: t.strictMode ?? "auto",
    vertexMode: t.vertexMode,
    bounds: t.bounds,
    boundsPolygon: t.boundsPolygon,
    wh: t.wh,
    xy: t.xy ?? [0, 0]
  };
}
function Qt(t) {
  const r = sr(t), e = r.tins, n = r.vertices_params;
  return n != null && wt(n), {
    compiled: r,
    tins: e,
    points: ir(e),
    strictStatus: r.strict_status,
    verticesParams: n,
    centroid: r.centroid,
    kinks: r.kinks
  };
}
function Ht(t) {
  return t.strict_status ? t.strict_status : t.kinks_points ? "strict_error" : t.tins_points.length === 2 ? "loose" : "strict";
}
function tr(t) {
  if ("outerTransform" in t && t.outerTransform === "worldFile" && !t.vertices_params)
    return { forw: [[], []], bakw: [[], []] };
  if (!Array.isArray(t.vertices_params) || !Array.isArray(t.vertices_points))
    throw new Error(
      "Invalid compiled data: vertices_params and vertices_points must be arrays"
    );
  const r = {
    forw: [t.vertices_params[0]],
    bakw: [t.vertices_params[1]]
  };
  return r.forw[1] = ct(t, !1), r.bakw[1] = ct(t, !0), wt(r), r;
}
function wt(t) {
  if (typeof t != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((r) => {
    const e = t[r];
    if (e == null) return;
    const n = `vertices_params.${r}`, o = e[0], i = e[1];
    if (!Array.isArray(o) || !Array.isArray(i))
      throw new Error(`Invalid compiled data: ${n} must hold two arrays`);
    if (o.length !== i.length)
      throw new Error(
        `Invalid compiled data: ${n} must have one angle per vertex`
      );
    for (let s = 0; s < o.length; s++)
      if (typeof o[s] != "number" || !Number.isFinite(o[s]))
        throw new Error(
          `Invalid compiled data: ${n} must contain only finite numbers`
        );
  });
}
function ct(t, r) {
  const e = t.vertices_points.length;
  return Array.from({ length: e }, (n, o) => {
    const i = (o + 1) % e, s = H(
      ["c", `b${o}`, `b${i}`],
      t.points,
      t.edgeNodes || [],
      t.centroid_point,
      t.vertices_points,
      r,
      gt
    );
    return D([s]);
  });
}
function rr(t) {
  return {
    forw: B(t.centroid_point[0], {
      target: {
        geom: t.centroid_point[1],
        index: "c"
      }
    }),
    bakw: B(t.centroid_point[1], {
      target: {
        geom: t.centroid_point[0],
        index: "c"
      }
    })
  };
}
function er(t) {
  const r = t.tins_points.length === 1 ? 0 : 1;
  return {
    forw: D(
      t.tins_points[0].map(
        (e) => H(
          e,
          t.points,
          t.edgeNodes || [],
          t.centroid_point,
          t.vertices_points,
          !1,
          t.version
        )
      )
    ),
    bakw: D(
      t.tins_points[r].map(
        (e) => H(
          e,
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
function nr(t) {
  if (t)
    return {
      bakw: D(
        t.map((r) => B(r))
      )
    };
}
function sr(t) {
  return JSON.parse(
    JSON.stringify(t).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function ir(t) {
  const r = [], e = t.forw.features;
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    ["a", "b", "c"].forEach((i, s) => {
      const u = o.geometry.coordinates[0][s], c = o.properties[i].geom, a = o.properties[i].index;
      typeof a == "number" && (r[a] = [u, c]);
    });
  }
  return r;
}
function pt(t) {
  if (![
    t.xScale,
    t.xSkew,
    t.xOrigin,
    t.ySkew,
    t.yScale,
    t.yOrigin
  ].every(Number.isFinite))
    throw new Error("worldFile の係数はすべて有限の数でなければなりません");
  const e = t.xScale * t.yScale - t.xSkew * t.ySkew;
  if (!Number.isFinite(e) || e === 0)
    throw new Error("worldFile は非正則です（行列式が 0）");
  if (e > 0)
    throw new Error("worldFile は鏡像です。yScale の符号を確かめてください");
}
function xt(t, r) {
  const e = r[0] - 0.5, n = r[1] - 0.5;
  return [
    t.xScale * e + t.xSkew * n + t.xOrigin,
    t.ySkew * e + t.yScale * n + t.yOrigin
  ];
}
function bt(t, r) {
  const e = t.xScale * t.yScale - t.xSkew * t.ySkew, n = r[0] - t.xOrigin, o = r[1] - t.yOrigin;
  return [
    (t.yScale * n - t.xSkew * o) / e + 0.5,
    (-t.ySkew * n + t.xScale * o) / e + 0.5
  ];
}
const wr = gt;
function $(t, r, e) {
  return (r[0] - t[0]) * (e[1] - t[1]) - (r[1] - t[1]) * (e[0] - t[0]);
}
function G(t, r, e, n = 0) {
  return t[0] >= Math.min(r[0], e[0]) - n && t[0] <= Math.max(r[0], e[0]) + n && t[1] >= Math.min(r[1], e[1]) - n && t[1] <= Math.max(r[1], e[1]) + n;
}
function or(t, r, e, n) {
  const o = $(t, r, e), i = $(t, r, n), s = $(e, n, t), u = $(e, n, r);
  return o === 0 && G(e, t, r) || i === 0 && G(n, t, r) || s === 0 && G(t, e, n) || u === 0 && G(r, e, n) ? !0 : Math.sign(o) * Math.sign(i) === -1 && Math.sign(s) * Math.sign(u) === -1;
}
function ut(t) {
  const r = t.reduce((e, n, o) => e + $(t[0], n, t[(o + 1) % t.length]), 0);
  if (!Number.isFinite(r) || r === 0)
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  for (let e = 0; e < t.length; e++) {
    const n = t[e], o = t[(e + 1) % t.length];
    if (n[0] === o[0] && n[1] === o[1])
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    for (let i = e + 2; i < t.length; i++)
      if (!(e === 0 && i === t.length - 1) && or(n, o, t[i], t[(i + 1) % t.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(r);
}
function ar(t, r) {
  let e = !1;
  for (let n = 0, o = r.length - 1; n < r.length; o = n++) {
    const i = r[o], s = r[n], [u, c] = i, [a, h] = s, f = a - u, l = h - c, m = t[0] - u, g = t[1] - c, p = Number.EPSILON * 16 * Math.max(1, Math.abs(u), Math.abs(c), Math.abs(a), Math.abs(h), Math.abs(t[0]), Math.abs(t[1])), w = Math.hypot(f, l), d = p * w + Number.EPSILON * 16 * (Math.abs(m * l) + Math.abs(g * f));
    if (Math.abs($(i, s, t)) <= d && G(t, i, s, p)) return "edge";
    c > t[1] != h > t[1] && t[0] < (a - u) * (t[1] - c) / (h - c) + u && (e = !e);
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
  /** B の外周の輪（地図面・地理面）。変換のたびに作らないよう setCompiled で一度だけ作る */
  outerRings;
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
  setCompiled(r) {
    const e = "outerTransform" in r, n = e ? r.outerTransform : void 0;
    if (n !== void 0 && n !== "extrapolate" && n !== "worldFile")
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    const o = e ? r.worldFile : void 0;
    if (n === "worldFile") {
      if (!o) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      pt(o);
      const a = r.vertices_points;
      if (!Array.isArray(a) || a.length < 4 || a.some((m) => !Array.isArray(m) || m.length < 2 || m.some((g) => !Array.isArray(g) || g.length < 2 || !g.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const h = ut(a.map((m) => m[0])), f = ut(a.map((m) => m[1])), l = r.yaxisMode === S.YAXIS_FOLLOW ? -f : f;
      if (h === l)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const i = n === "worldFile" ? { ...r, centroid_point: r.centroid_point ?? [[0, 0], [0, 0]] } : r, s = Kt(i) ? Jt(i) : Qt(i), c = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"].map((a) => [a, this[a]]));
    try {
      "compiled" in s ? this.applyLegacyState(s) : this.applyModernState(s), this.outerTransform = n ?? "extrapolate", this.worldFile = o, this.outerVertices = n === "worldFile" ? r.vertices_points : void 0, this.outerRings = this.outerVertices ? { forw: this.outerVertices.map((a) => a[0]), bakw: this.outerVertices.map((a) => a[1]) } : void 0, this.validateCompiledProjection();
    } catch (a) {
      throw Object.assign(this, c), a;
    }
  }
  /** 層固有の検査を、失敗時に compiled の適用を取り消せる位置で行う */
  validateCompiledProjection() {
  }
  applyModernState(r) {
    this.points = r.points, this.strict_status = r.strictStatus, this.vertices_params = r.verticesParams, this.centroid = r.centroid, this.edges = r.edges, this.edgeNodes = r.edgeNodes || [], this.tins = r.tins, this.addIndexedTin(), this.kinks = r.kinks, this.yaxisMode = r.yaxisMode ?? S.YAXIS_INVERT, this.vertexMode = r.vertexMode ?? S.VERTEX_PLAIN, this.strictMode = r.strictMode ?? S.MODE_AUTO, r.bounds ? (this.bounds = r.bounds, this.boundsPolygon = r.boundsPolygon, this.xy = r.xy, this.wh = r.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = r.xy ?? [0, 0], r.wh && (this.wh = r.wh));
  }
  applyLegacyState(r) {
    this.tins = r.tins, this.addIndexedTin(), this.strict_status = r.strictStatus, this.vertices_params = r.verticesParams, this.centroid = r.centroid, this.kinks = r.kinks, this.points = r.points;
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
    const r = this.tins, e = r.forw, n = r.bakw, o = Math.ceil(Math.sqrt(e.features.length));
    if (o < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], s = [];
    const u = e.features.map((w) => {
      let d = [];
      return et(w)[0].map((y) => {
        i.length === 0 ? i = [Array.from(y), Array.from(y)] : (y[0] < i[0][0] && (i[0][0] = y[0]), y[0] > i[1][0] && (i[1][0] = y[0]), y[1] < i[0][1] && (i[0][1] = y[1]), y[1] > i[1][1] && (i[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    }), c = n.features.map((w) => {
      let d = [];
      return et(w)[0].map((y) => {
        s.length === 0 ? s = [Array.from(y), Array.from(y)] : (y[0] < s[0][0] && (s[0][0] = y[0]), y[0] > s[1][0] && (s[1][0] = y[0]), y[1] < s[0][1] && (s[0][1] = y[1]), y[1] > s[1][1] && (s[1][1] = y[1])), d.length === 0 ? d = [Array.from(y), Array.from(y)] : (y[0] < d[0][0] && (d[0][0] = y[0]), y[0] > d[1][0] && (d[1][0] = y[0]), y[1] < d[0][1] && (d[0][1] = y[1]), y[1] > d[1][1] && (d[1][1] = y[1]));
      }), d;
    });
    if (Math.max(
      ot(u, i, o),
      ot(c, s, o)
    ) > Yt * e.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const h = (i[1][0] - i[0][0]) / o, f = (i[1][1] - i[0][1]) / o, l = u.reduce(
      (w, d, y) => {
        const M = C(d[0][0], i[0][0], h, o), E = C(d[1][0], i[0][0], h, o), v = C(d[0][1], i[0][1], f, o), _ = C(d[1][1], i[0][1], f, o);
        for (let x = M; x <= E; x++) {
          w[x] || (w[x] = []);
          for (let b = v; b <= _; b++)
            w[x][b] || (w[x][b] = []), w[x][b].push(y);
        }
        return w;
      },
      []
    ), m = (s[1][0] - s[0][0]) / o, g = (s[1][1] - s[0][1]) / o, p = c.reduce(
      (w, d, y) => {
        const M = C(d[0][0], s[0][0], m, o), E = C(d[1][0], s[0][0], m, o), v = C(d[0][1], s[0][1], g, o), _ = C(d[1][1], s[0][1], g, o);
        for (let x = M; x <= E; x++) {
          w[x] || (w[x] = []);
          for (let b = v; b <= _; b++)
            w[x][b] || (w[x][b] = []), w[x][b].push(y);
        }
        return w;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: o,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: h,
        yUnit: f,
        gridCache: l
      },
      bakw: {
        gridNum: o,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: m,
        yUnit: g,
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
  transform(r, e, n) {
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (e && this.strict_status == S.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const o = r;
    this.yaxisMode == S.YAXIS_FOLLOW && e && (r = [r[0], -1 * r[1]]);
    const i = B(r);
    if (this.bounds && !e && !n && !O(i, this.boundsPolygon))
      return !1;
    const s = e ? this.tins.bakw : this.tins.forw, u = e ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let c;
    if (this.outerTransform === "worldFile") {
      const g = e ? this.outerRings?.bakw : this.outerRings?.forw, p = g ? ar(i.geometry.coordinates, g) : "outside";
      if (e && this.strict_status == S.STATUS_ERROR && p !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (p === "inside" && s && (c = z(i, s, u)), !c) {
        const w = e ? bt(this.worldFile, o) : xt(this.worldFile, o);
        return !w.every(Number.isFinite) || e && this.bounds && !n && !O(B(w), this.boundsPolygon) ? !1 : w;
      }
    }
    const a = e ? this.vertices_params.bakw : this.vertices_params.forw, h = e ? this.centroid.bakw : this.centroid.forw;
    let f, l;
    this.stateFull && (this.stateBackward == e ? f = this.stateTriangle : (this.stateBackward = e, this.stateTriangle = void 0), l = (g) => {
      this.stateTriangle = g;
    });
    let m = Dt(
      i,
      s,
      u,
      a,
      h,
      void 0,
      f,
      l,
      c
    );
    if (this.bounds && e && !n) {
      const g = B(m);
      if (!O(g, this.boundsPolygon)) return !1;
    } else this.yaxisMode == S.YAXIS_FOLLOW && !e && (m = [m[0], -1 * m[1]]);
    return m;
  }
}
const T = 20037508342789244e-9, cr = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], q = 6378137, J = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function X(t) {
  return t.length >= 2 && Number.isFinite(t[0]) && Number.isFinite(t[1]);
}
function ur(t, r) {
  const e = r.trim().split(/\s+/).map((i) => {
    const [s, ...u] = i.replace(/^\+/, "").split("="), c = s.toLowerCase(), a = u.join("="), h = u.length > 0;
    if (c === "axis" && (!h || a !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if ((c === "no_defs" || c === "wktext") && !h) return "";
    if (h && a === "") throw new Error(`+${c}= は許可されていません`);
    if (c === "wktext") throw new Error("+wktext は許可されていません");
    if (c === "type" && !h) throw new Error("+type は値が必要です");
    if (c === "type" && a.toLowerCase() === "crs" || c === "axis") return "";
    if (c === "towgs84") {
      const l = a.split(",");
      if (!h || l.some((g) => g.trim() === ""))
        throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(l.length) && l.every((g) => {
        const p = g.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(g)) && !/[1-9]/.test(p);
      })) return "";
    }
    const f = a ? a.split(",").map((l) => {
      const m = Number(l);
      return l.trim() !== "" && Number.isFinite(m) ? Object.is(m, -0) ? "0" : String(m) : l.toLowerCase();
    }).join(",") : "";
    return `+${c}${a ? `=${f}` : ""}`;
  }).filter(Boolean), n = [...new Set(e)].sort().join(" ");
  if (!(t === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : [
    "+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"
  ]).includes(n))
    throw new Error(
      `epsg と proj4 が一致しないか、proj4js なしでは判定できない CRS です（EPSG:${t}）`
    );
}
const F = {
  toLonLat(t, r) {
    if (!X(t)) return !1;
    if (r.epsg === 4326)
      return Math.abs(t[0]) <= 180 && Math.abs(t[1]) <= 90 ? [t[0], t[1]] : !1;
    if (r.epsg !== 3857 || Math.abs(t[0]) > T || Math.abs(t[1]) > T)
      return !1;
    const e = t[0], n = t[1];
    return [
      Math.abs(e) === T ? Math.sign(e) * 180 : e / q * (180 / Math.PI),
      Math.abs(n) === T ? Math.sign(n) * J : (2 * Math.atan(Math.exp(n / q)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(t, r) {
    if (!X(t) || Math.abs(t[0]) > 180) return !1;
    const [e, n] = t;
    if (r.epsg === 4326) return Math.abs(n) <= 90 ? [e, n] : !1;
    if (r.epsg !== 3857 || Math.abs(n) > J) return !1;
    const o = e * Math.PI / 180, i = n * Math.PI / 180, s = [
      Math.abs(e) === 180 ? Math.sign(e) * T : q * o,
      Math.abs(n) === J ? Math.sign(n) * T : q * Math.log(Math.tan(Math.PI / 4 + i / 2))
    ];
    return s.every(Number.isFinite) ? s : !1;
  }
}, Mt = { epsg: 3857 }, ft = { epsg: 4326 }, fr = "+proj=longlat +datum=WGS84";
function tt(t) {
  return t.epsg === 3857 || t.epsg === 4326;
}
function lr(t) {
  if (t === null || typeof t != "object" || Array.isArray(t))
    throw new Error("CRS はオブジェクトで指定してください");
  if (t.epsg !== void 0 && (!Number.isSafeInteger(t.epsg) || t.epsg <= 0))
    throw new Error("CRS の epsg は正の整数で指定してください");
  if (t.proj4 !== void 0 && (typeof t.proj4 != "string" || !t.proj4.trim()))
    throw new Error("CRS の proj4 は空でない文字列で指定してください");
  const r = typeof t.authority == "string" && !!t.authority.trim(), e = typeof t.code == "string" ? !!t.code.trim() : Number.isFinite(t.code);
  if (t.epsg === void 0 && !(r && e) && t.proj4 === void 0)
    throw new Error(
      "CRS には epsg、authority と code の組、または proj4 が必要です。WKT のみの定義には対応していません"
    );
}
function Et(t) {
  let r = !1;
  for (const e of t.split("+")) {
    const [n, o] = e.trim().split("="), i = n.toLowerCase();
    if (i === "axis" && o !== "enu")
      throw new Error("CRS の座標は東・北の順で書き、+axis を外すか +axis=enu を指定してください");
    if (i === "nadgrids" && o !== "@null" || i === "geoidgrids" || i === "hgridshift" || i === "vgridshift" || i === "proj" && ["pipeline", "hgridshift", "vgridshift"].includes(o?.toLowerCase()))
      throw new Error(`proj4 の +${e.trim()} は読み込めません`);
    i === "proj" && o && (r = !0);
  }
  if (!t.startsWith("+") || !r)
    throw new Error("CRS の proj4 は +proj= を含む定義で指定してください");
}
function _t(t, r, e) {
  lr(t);
  const n = tt(t);
  if (t.proj4 === void 0) {
    if (t.wkt) throw new Error("WKT だけの CRS 定義に対応していません");
    if (!n) throw new Error("EPSG:3857・4326 以外の CRS には proj4 定義が必要です");
    return;
  }
  const o = t.proj4.trim();
  if (Et(o), r.validateDefinition)
    r.validateDefinition(t, n ? e() : void 0);
  else if (n)
    ur(t.epsg, o);
  else if (r === F)
    throw new Error("この CRS には proj4 に対応する投影エンジンが必要です");
}
function pr(t) {
  const r = /* @__PURE__ */ new Map();
  function e(i) {
    const s = r.get(i);
    if (s) return s;
    Et(i);
    try {
      const u = t(i, fr);
      return r.set(i, u), u;
    } catch (u) {
      throw new Error(`proj4 定義を読み込めません（${String(u)}）`, { cause: u });
    }
  }
  function n(i, [s, u]) {
    const c = i.inverse([s, u, 0], !0), a = c[2];
    return Number.isFinite(a) && Math.abs(a) > 1e-6 ? i.inverse([s, u, -a], !0) : c;
  }
  function o(i, s, u) {
    if (!X(i)) return !1;
    try {
      const c = u(e(s), [i[0], i[1]]);
      return X(c) ? [c[0], c[1]] : !1;
    } catch {
      return !1;
    }
  }
  return {
    toLonLat(i, s) {
      if (tt(s)) return F.toLonLat(i, s);
      if (!s.proj4) return !1;
      const u = o(
        i,
        s.proj4.trim(),
        (c, a) => c.forward(a)
      );
      return u === !1 ? !1 : F.toLonLat(u, ft);
    },
    fromLonLat(i, s) {
      return tt(s) ? F.fromLonLat(i, s) : !s.proj4 || F.fromLonLat(i, ft) === !1 ? !1 : o(i, s.proj4.trim(), n);
    },
    validateDefinition(i, s) {
      if (i.proj4 === void 0) return;
      const u = i.proj4.trim();
      if (e(u), !s) return;
      const c = i.epsg === 3857 ? 1e-3 : 1e-8;
      for (const a of s) {
        const h = F.toLonLat(a, i), f = h === !1 ? !1 : o(h, u, (l, m) => l.inverse(m));
        if (f === !1 || Math.hypot(f[0] - a[0], f[1] - a[1]) > c)
          throw new Error(
            `epsg と proj4 が地図の四隅または中心で一致しないか、比較できません（EPSG:${i.epsg}）`
          );
      }
    }
  };
}
function vt(t, r, e) {
  if (!X(t)) return !1;
  const n = e.toLonLat(t, r);
  return n === !1 ? !1 : F.fromLonLat(n, Mt);
}
function Tt(t, r, e) {
  const n = F.toLonLat(t, Mt);
  if (n === !1) return !1;
  const o = e.fromLonLat(n, r);
  return o !== !1 && X(o) ? o : !1;
}
function St(t, r, e) {
  let n, o, i, s;
  if (e?.length) {
    n = o = 1 / 0, i = s = -1 / 0;
    for (const [u, c] of e)
      n = Math.min(n, u), o = Math.min(o, c), i = Math.max(i, u), s = Math.max(s, c);
  } else if (t)
    [n, o] = r ?? [0, 0], i = n + t[0], s = o + t[1];
  else
    throw new Error("epsg と proj4 の照合には地図の範囲が必要です");
  if (![n, o, i, s].every(Number.isFinite))
    throw new Error("epsg と proj4 の照合には有限な地図の範囲が必要です");
  return [
    [n, o],
    [i, o],
    [i, s],
    [n, s],
    [n / 2 + i / 2, o / 2 + s / 2]
  ];
}
class hr {
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
  constructor(r) {
    if (pt(r.worldFile), !r.wh && !r.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (r.wh && (!Array.isArray(r.wh) || r.wh.length < 2 || !r.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (r.bounds && (r.bounds.length < 3 || r.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = r.crs, this.worldFile = r.worldFile, this.projectionEngine = r.projectionEngine ?? F;
    const e = r.bounds;
    if (r.wh)
      this.wh = r.wh, this.xy = r.xy;
    else {
      const n = e.map((u) => u[0]), o = e.map((u) => u[1]), i = Math.min(...n), s = Math.min(...o);
      if (this.wh = [Math.max(...n) - i, Math.max(...o) - s], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = r.xy ?? [i, s];
    }
    this.bounds = r.bounds, this.priority = r.priority, this.importance = r.importance, _t(
      this.crs,
      this.projectionEngine,
      () => St(r.wh, this.xy, r.wh ? void 0 : this.bounds).map((n) => this.xyToCrs(n))
    );
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(r) {
    return xt(this.worldFile, r);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(r) {
    return bt(this.worldFile, r);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(r, e = !1, n = !1) {
    if (!X(r)) return !1;
    if (!e) {
      const s = this.xyToCrs(r);
      return this.crs.epsg === 3857 ? s.every((u) => Math.abs(u) <= T) ? s : !1 : vt(s, this.crs, this.projectionEngine);
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(r[0]) > T || Math.abs(r[1]) > T) return !1;
      const s = this.crsToXy(r);
      return X(s) ? s : !1;
    }
    const o = Tt(r, this.crs, this.projectionEngine);
    if (o === !1) return !1;
    const i = this.crsToXy(o);
    return X(i) ? i : !1;
  }
}
function At(t, r) {
  return Math.floor(Math.min(t[0], t[1]) / 4) * T / 128 / Math.pow(2, r);
}
function mr(t, r) {
  const e = [];
  for (let n = 0; n < t.length; n++) {
    const o = t[n], i = o[0] * Math.cos(r) - o[1] * Math.sin(r), s = o[0] * Math.sin(r) + o[1] * Math.cos(r);
    e.push([i, s]);
  }
  return e;
}
function lt(t, r, e, n) {
  const o = At(n, r);
  return mr(cr, e).map((u) => [
    u[0] * o + t[0],
    u[1] * o + t[1]
  ]);
}
function ht(t, r) {
  const e = t[0], o = t.slice(1, 5).map((m) => [
    m[0] - e[0],
    m[1] - e[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, u = 0, c = 0;
  for (let m = 0; m < 4; m++) {
    const g = o[m], p = i[m], w = Math.sqrt(Math.pow(g[0], 2) + Math.pow(g[1], 2));
    s += w;
    const d = g[0] * p[1] - g[1] * p[0], y = Math.acos(
      (g[0] * p[0] + g[1] * p[1]) / w
    ), M = d > 0 ? -1 * y : y;
    u += Math.cos(M), c += Math.sin(M);
  }
  const a = s / 4, h = Math.atan2(c, u), f = Math.floor(Math.min(r[0], r[1]) / 4), l = Math.log(f * T / 128 / a) / Math.log(2);
  return { center: e, zoom: l, rotation: h };
}
function Q(t, r) {
  const e = t[0] * (2 * T) / r - T, n = -1 * (t[1] * (2 * T) / r - T);
  return [e, n];
}
function mt(t, r) {
  const e = (t[0] + T) * r / (2 * T), n = (-t[1] + T) * r / (2 * T);
  return [e, n];
}
function Ct(t, r, e, n, o) {
  _t(r, e, () => {
    const i = n ?? t.bounds ?? (t.wh ? void 0 : t.points.map(([u]) => u)), s = t.stateFull;
    t.stateFull = !1;
    try {
      return St(t.wh, t.xy, i).map((u) => {
        const c = o(u);
        if (c === !1) throw new Error("epsg と proj4 の照合点を三角網で変換できません");
        return c;
      });
    } finally {
      t.stateFull = s;
    }
  });
}
class dr extends S {
  constructor(r, e, n) {
    super(), this.crs = e, this.projectionEngine = n, this.layerBounds = r.bounds, this.setCompiled(r.compiled);
  }
  crs;
  projectionEngine;
  layerBounds;
  validateCompiledProjection() {
    Ct(
      this,
      this.crs,
      this.projectionEngine,
      this.layerBounds,
      (r) => super.transform(r, !1, !0)
    ), this.stateTriangle = void 0;
  }
  transform(r, e, n) {
    if (e) {
      const i = Tt(r, this.crs, this.projectionEngine);
      return i === !1 ? !1 : super.transform(i, e, n);
    }
    const o = super.transform(r, e, n);
    return o === !1 ? !1 : vt(o, this.crs, this.projectionEngine);
  }
}
const V = 256;
class xr {
  mainTin = null;
  subTins = [];
  _maxxy = 0;
  // ─── 初期化 ────────────────────────────────────────────────────────────────
  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(r) {
    const e = new S();
    if (e.setCompiled(r.compiled), this.mainTin = e, r.maxZoom !== void 0)
      this._maxxy = Math.pow(2, r.maxZoom) * V;
    else if (r.compiled.wh) {
      const n = Math.max(r.compiled.wh[0], r.compiled.wh[1]), o = Math.ceil(Math.log2(n / V));
      this._maxxy = Math.pow(2, o) * V;
    }
    if (this.subTins = [], r.sub_maps)
      for (const n of r.sub_maps) {
        const o = new S();
        o.setCompiled(n.compiled);
        const i = n.bounds ?? n.compiled.bounds;
        if (!i) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const s = [...i, i[0]], u = s.map((c) => {
          const a = o.transform(c, !1);
          if (!a) throw new Error("Failed to transform sub-map bounds to mercator");
          return a;
        });
        this.subTins.push({
          tin: o,
          priority: n.priority,
          importance: n.importance,
          xyBounds: U([s]),
          mercBounds: U([u])
        });
      }
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(r) {
    const e = this._createSurface(r.main);
    r.main.priority !== void 0 && (e.priority = r.main.priority), r.main.importance !== void 0 && (e.importance = r.main.importance);
    const n = r.main.kind === "tin" ? r.main.compiled.wh : e.wh;
    let o = this._maxxy;
    if (r.maxZoom !== void 0)
      o = Math.pow(2, r.maxZoom) * V;
    else if (n) {
      const s = Math.max(n[0], n[1]), u = Math.ceil(Math.log2(s / V));
      o = Math.pow(2, u) * V;
    }
    const i = [];
    for (const s of r.sub_maps ?? []) {
      const u = this._createSurface(s), c = s.bounds ?? (s.kind === "tin" ? s.compiled.bounds : void 0);
      if (!c) throw new Error("副層には bounds または compiled.bounds が必要です");
      const a = [...c, c[0]], h = a.map((f) => {
        const l = u.transform(f, !1);
        if (!l) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return l;
      });
      i.push({
        tin: u,
        priority: s.priority ?? 0,
        importance: s.importance ?? 0,
        xyBounds: U([a]),
        mercBounds: U([h])
      });
    }
    this.mainTin = e, this.subTins = i, this._maxxy = o;
  }
  _createSurface(r) {
    if (r.kind === "worldFile") return new hr(r);
    if ("crs" in r && r.crs === null) throw new Error("三角網の層の CRS は null にできません");
    const e = r.crs, n = r.projectionEngine ?? F;
    if (e !== void 0 && e.epsg !== 3857) return new dr(r, e, n);
    const o = new S();
    return o.setCompiled(r.compiled), e !== void 0 && Ct(o, e, n, r.bounds, (i) => o.transform(i, !1, !0)), o;
  }
  // ─── 処理2: submap TIN 選択付き変換 ───────────────────────────────────────
  /**
   * ピクセル座標 → メルカトル座標（最適レイヤー選択）
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns メルカトル座標、または範囲外の場合は false
   */
  xy2Merc(r) {
    const e = this.xy2MercWithLayer(r);
    return e ? e[1] : !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（最適レイヤー選択）
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns ピクセル座標、または範囲外の場合は false
   */
  merc2Xy(r) {
    const e = this.merc2XyWithLayer(r), n = e[0] || e[1];
    return n ? n[1] : !1;
  }
  /**
   * ピクセル座標 → メルカトル座標（レイヤーID付き）
   * histmap_tin.ts xy2MercAsync_returnLayer() の同期版
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns [レイヤーインデックス, メルカトル座標] または false
   */
  xy2MercWithLayer(r) {
    this._assertMapData();
    const e = this._getTinsSortedByPriority();
    for (let n = 0; n < e.length; n++) {
      const { index: o, isMain: i } = e[n];
      if (i || O(B(r), this.subTins[o - 1].xyBounds)) {
        const s = this._transformByIndex(r, o, !1);
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
   * 現在は MaplatCore の仕様に合わせ、最大2レイヤーまで返す。
   * 3レイヤー以上返したい場合は、下記の .slice(0, 2) および .filter(i < 2) の
   * 上限値を増やすか、引数で上限を指定できるようにすること。
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns 最大2要素の配列。各要素は [レイヤーインデックス, ピクセル座標] または undefined
   */
  merc2XyWithLayer(r) {
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: u, isMain: c }) => {
      const a = this._transformByIndex(r, s, !0);
      return a === !1 ? [u, s] : c || O(B(a), this.subTins[s - 1].xyBounds) ? [u, s, a] : [u, s];
    }).sort((s, u) => {
      const c = s[0].priority ?? 0, a = u[0].priority ?? 0;
      return c < a ? 1 : -1;
    }).reduce(
      (s, u, c, a) => {
        const h = u[0], f = u[1], l = u[2];
        if (!l) return s;
        for (let m = 0; m < c; m++) {
          const g = a[m][1], p = g === 0;
          if (a[m][2] && (p || O(B(l), this.subTins[g - 1].xyBounds)))
            if (s.length) {
              const w = !s[0], d = w ? s[1][2] : s[0][2], y = h.importance ?? 0, M = d.importance ?? 0;
              return w ? y < M ? s : [void 0, [f, l, h]] : [...s.filter(
                (_) => _ !== void 0
              ), [f, l, h]].sort(
                (_, x) => (_[2].importance ?? 0) < (x[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[f, l, h]];
        }
        return !s.length || !s[0] ? [[f, l, h]] : (s.push([f, l, h]), s.sort((m, g) => {
          const p = m[2].importance ?? 0, w = g[2].importance ?? 0;
          return p < w ? 1 : -1;
        }).filter((m, g) => g < 2));
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
   *    本図と sub_map がともに priority 0 の場合も、本図はその sub_map の `xyBounds` 内で覆われている
   * 3. 同じ priority の sub_map どうしは互いを覆わない
   * 4. 覆われていない対応層を importance 降順 → priority 降順 → 層番号昇順で並べ、上限を切らずに全件返す
   * 5. 覆われていない対応層が無ければ空配列（表現範囲外）。`undefined`（旧 hide 表現）は返さない
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns [レイヤーインデックス, ピクセル座標] の配列（0 件以上・上限なし）
   */
  merc2XyVisibleLayers(r) {
    this._assertMapData();
    const e = this._getAllTinsWithIndex(), n = (c) => (c === 0 ? this.mainTin?.priority : this.subTins[c - 1].priority) ?? 0, o = (c) => (c === 0 ? this.mainTin?.importance : this.subTins[c - 1].importance) ?? 0, i = (c, a) => c === 0 || O(B(a), this.subTins[c - 1].xyBounds), s = [];
    for (const { index: c } of e) {
      const a = this._transformByIndex(r, c, !0);
      a !== !1 && i(c, a) && s.push({ index: c, xy: a });
    }
    const u = (c) => e.some(
      ({ index: a }) => a !== 0 && a !== c.index && (n(a) > n(c.index) || c.index === 0 && n(0) === 0 && n(a) === 0) && i(a, c.xy)
    );
    return s.filter((c) => !u(c)).sort((c, a) => o(a.index) - o(c.index) || n(a.index) - n(c.index) || c.index - a.index).map((c) => [c.index, c.xy]);
  }
  /**
   * メルカトル5点 → システム座標（複数レイヤー）
   * histmap_tin.ts mercs2SysCoordsAsync_multiLayer() の同期版
   *
   * @param mercs - 5点のメルカトル座標配列（中心＋上下左右）
   * @returns 各レイヤーのシステム座標配列（または undefined）
   */
  mercs2SysCoords(r) {
    this._assertMapData();
    const e = this.merc2XyWithLayer(r[0]);
    let n = !1;
    return e.map((o, i) => {
      if (!o) {
        n = !0;
        return;
      }
      const s = o[0], u = o[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(u)] : r.map((a, h) => h === 0 ? u : this._transformByIndex(a, s, !0)).map((a) => this.xy2SysCoordInternal(a));
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
  viewpoint2Mercs(r, e) {
    this._assertMapData(), this._assertMaxxy();
    const o = lt(r.center, r.zoom, r.rotation, e).map((a) => mt(a, this._maxxy)), i = this.xy2MercWithLayer(o[0]);
    if (!i) throw new Error("viewpoint2Mercs: center point is out of bounds");
    const s = i[0], u = i[1];
    return o.map((a, h) => {
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
  mercs2Viewpoint(r, e) {
    this._assertMapData(), this._assertMaxxy();
    const n = this.merc2XyWithLayer(r[0]), o = n[0] || n[1];
    if (!o) throw new Error("mercs2Viewpoint: center point is out of bounds");
    const i = o[0], s = o[1], c = r.map((a, h) => {
      if (h === 0) return s;
      const f = this._transformByIndex(a, i, !0);
      if (f === !1) throw new Error(`mercs2Viewpoint: point ${h} is out of bounds`);
      return f;
    }).map((a) => Q(a, this._maxxy));
    return ht(c, e);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(r, e) {
    return At(r, e);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(r, e, n, o) {
    return lt(r, e, n, o);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(r, e) {
    return ht(r, e);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(r, e) {
    return Q(r, e);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(r, e) {
    return mt(r, e);
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
  getLayerTransform(r) {
    if (r === 0) return this.mainTin instanceof S ? this.mainTin : null;
    const e = this.subTins[r - 1];
    return e?.tin instanceof S ? e.tin : null;
  }
  /** レイヤーインデックスに対応する変換面を返す */
  getSurfaceTransform(r) {
    return r === 0 ? this.mainTin : this.subTins[r - 1]?.tin ?? null;
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
      const o = e.tin.priority ?? 0, i = n.tin.priority ?? 0;
      return o < i ? 1 : -1;
    });
  }
  /** メイン TIN + 全 sub TIN を index 付きで返す */
  _getAllTinsWithIndex() {
    const r = [
      { index: 0, tin: this.mainTin, isMain: !0 }
    ];
    return this.subTins.forEach((e, n) => {
      e.tin.priority = e.priority, e.tin.importance = e.importance, r.push({ index: n + 1, tin: e.tin, isMain: !1 });
    }), r;
  }
  /**
   * 指定レイヤーインデックスで TIN 変換を実行する
   * index 0 → mainTin, index 1..n → subTins[index-1]
   */
  _transformByIndex(r, e, n) {
    if (e === 0)
      return this.mainTin.transform(r, n);
    const o = this.subTins[e - 1];
    return o ? o.tin.transform(r, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(r) {
    return Q(r, this._maxxy);
  }
}
export {
  cr as MERC_CROSSMATRIX,
  T as MERC_MAX,
  xr as MapTransform,
  S as Transform,
  hr as WorldFileSurface,
  F as builtinProjectionEngine,
  gr as counterTri,
  pr as createProj4ProjectionEngine,
  bt as crsToWorldFilePixel,
  wr as format_version,
  lt as mercViewpoint2Mercs,
  ht as mercs2MercViewpoint,
  zt as normalizeEdges,
  mr as rotateMatrix,
  yr as rotateVerticesTriangle,
  mt as sysCoord2Xy,
  Dt as transformArr,
  pt as validateWorldFile,
  xt as worldFileToCrs,
  Q as xy2SysCoord,
  At as zoom2Radius
};
