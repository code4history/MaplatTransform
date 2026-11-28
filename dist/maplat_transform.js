function de(e, t, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = t || {}, n.geometry = e, n;
}
function rt(e, t, r = {}) {
  if (!e)
    throw new Error("coordinates is required");
  if (!Array.isArray(e))
    throw new Error("coordinates must be an Array");
  if (e.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!Gt(e[0]) || !Gt(e[1]))
    throw new Error("coordinates must contain numbers");
  return de({
    type: "Point",
    coordinates: e
  }, t, r);
}
function lt(e, t, r = {}) {
  for (const o of e) {
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
  return de({
    type: "Polygon",
    coordinates: e
  }, t, r);
}
function dt(e, t = {}) {
  const r = { type: "FeatureCollection" };
  return t.id && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.features = e, r;
}
function Gt(e) {
  return !isNaN(e) && e !== null && !Array.isArray(e);
}
function Ve(e) {
  if (!e)
    throw new Error("coord is required");
  if (!Array.isArray(e)) {
    if (e.type === "Feature" && e.geometry !== null && e.geometry.type === "Point")
      return [...e.geometry.coordinates];
    if (e.type === "Point")
      return [...e.coordinates];
  }
  if (Array.isArray(e) && e.length >= 2 && !Array.isArray(e[0]) && !Array.isArray(e[1]))
    return [...e];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function Wt(e) {
  if (Array.isArray(e))
    return e;
  if (e.type === "Feature") {
    if (e.geometry !== null)
      return e.geometry.coordinates;
  } else if (e.coordinates)
    return e.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function $e(e) {
  return e.type === "Feature" ? e.geometry : e;
}
function pe(e, t, r) {
  if (e !== null)
    for (var n, o, i, s, u, f, l, x = 0, p = 0, y, _ = e.type, w = _ === "FeatureCollection", b = _ === "Feature", E = w ? e.features.length : 1, M = 0; M < E; M++) {
      l = w ? (
        // @ts-expect-error: Known type conflict
        e.features[M].geometry
      ) : b ? (
        // @ts-expect-error: Known type conflict
        e.geometry
      ) : e, y = l ? l.type === "GeometryCollection" : !1, u = y ? l.geometries.length : 1;
      for (var a = 0; a < u; a++) {
        var d = 0, c = 0;
        if (s = y ? l.geometries[a] : l, s !== null) {
          f = s.coordinates;
          var h = s.type;
          switch (x = 0, h) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                t(
                  f,
                  p,
                  M,
                  d,
                  c
                ) === !1
              )
                return !1;
              p++, d++;
              break;
            case "LineString":
            case "MultiPoint":
              for (n = 0; n < f.length; n++) {
                if (
                  // @ts-expect-error: Known type conflict
                  t(
                    f[n],
                    p,
                    M,
                    d,
                    c
                  ) === !1
                )
                  return !1;
                p++, h === "MultiPoint" && d++;
              }
              h === "LineString" && d++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < f.length; n++) {
                for (o = 0; o < f[n].length - x; o++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    t(
                      f[n][o],
                      p,
                      M,
                      d,
                      c
                    ) === !1
                  )
                    return !1;
                  p++;
                }
                h === "MultiLineString" && d++, h === "Polygon" && c++;
              }
              h === "Polygon" && d++;
              break;
            case "MultiPolygon":
              for (n = 0; n < f.length; n++) {
                for (c = 0, o = 0; o < f[n].length; o++) {
                  for (i = 0; i < f[n][o].length - x; i++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      t(
                        f[n][o][i],
                        p,
                        M,
                        d,
                        c
                      ) === !1
                    )
                      return !1;
                    p++;
                  }
                  c++;
                }
                d++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < s.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  pe(s.geometries[n], t) === !1
                )
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
const ct = 11102230246251565e-32, z = 134217729, Ge = (3 + 8 * ct) * ct;
function Yt(e, t, r, n, o) {
  let i, s, u, f, l = t[0], x = n[0], p = 0, y = 0;
  x > l == x > -l ? (i = l, l = t[++p]) : (i = x, x = n[++y]);
  let _ = 0;
  if (p < e && y < r)
    for (x > l == x > -l ? (s = l + i, u = i - (s - l), l = t[++p]) : (s = x + i, u = i - (s - x), x = n[++y]), i = s, u !== 0 && (o[_++] = u); p < e && y < r; )
      x > l == x > -l ? (s = i + l, f = s - i, u = i - (s - f) + (l - f), l = t[++p]) : (s = i + x, f = s - i, u = i - (s - f) + (x - f), x = n[++y]), i = s, u !== 0 && (o[_++] = u);
  for (; p < e; )
    s = i + l, f = s - i, u = i - (s - f) + (l - f), l = t[++p], i = s, u !== 0 && (o[_++] = u);
  for (; y < r; )
    s = i + x, f = s - i, u = i - (s - f) + (x - f), x = n[++y], i = s, u !== 0 && (o[_++] = u);
  return (i !== 0 || _ === 0) && (o[_++] = i), _;
}
function We(e, t) {
  let r = t[0];
  for (let n = 1; n < e; n++) r += t[n];
  return r;
}
function St(e) {
  return new Float64Array(e);
}
const Ue = (3 + 16 * ct) * ct, qe = (2 + 12 * ct) * ct, ze = (9 + 64 * ct) * ct * ct, pt = St(4), Ut = St(8), qt = St(12), zt = St(16), Z = St(4);
function He(e, t, r, n, o, i, s) {
  let u, f, l, x, p, y, _, w, b, E, M, a, d, c, h, m, g, v;
  const S = e - o, C = r - o, T = t - i, X = n - i;
  c = S * X, y = z * S, _ = y - (y - S), w = S - _, y = z * X, b = y - (y - X), E = X - b, h = w * E - (c - _ * b - w * b - _ * E), m = T * C, y = z * T, _ = y - (y - T), w = T - _, y = z * C, b = y - (y - C), E = C - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, pt[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, pt[1] = d - (M + p) + (p - m), v = a + M, p = v - a, pt[2] = a - (v - p) + (M - p), pt[3] = v;
  let A = We(4, pt), O = qe * s;
  if (A >= O || -A >= O || (p = e - S, u = e - (S + p) + (p - o), p = r - C, l = r - (C + p) + (p - o), p = t - T, f = t - (T + p) + (p - i), p = n - X, x = n - (X + p) + (p - i), u === 0 && f === 0 && l === 0 && x === 0) || (O = ze * s + Ge * Math.abs(A), A += S * x + X * u - (T * l + C * f), A >= O || -A >= O)) return A;
  c = u * X, y = z * u, _ = y - (y - u), w = u - _, y = z * X, b = y - (y - X), E = X - b, h = w * E - (c - _ * b - w * b - _ * E), m = f * C, y = z * f, _ = y - (y - f), w = f - _, y = z * C, b = y - (y - C), E = C - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const U = Yt(4, pt, 4, Z, Ut);
  c = S * x, y = z * S, _ = y - (y - S), w = S - _, y = z * x, b = y - (y - x), E = x - b, h = w * E - (c - _ * b - w * b - _ * E), m = T * l, y = z * T, _ = y - (y - T), w = T - _, y = z * l, b = y - (y - l), E = l - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const B = Yt(U, Ut, 4, Z, qt);
  c = u * x, y = z * u, _ = y - (y - u), w = u - _, y = z * x, b = y - (y - x), E = x - b, h = w * E - (c - _ * b - w * b - _ * E), m = f * l, y = z * f, _ = y - (y - f), w = f - _, y = z * l, b = y - (y - l), E = l - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const L = Yt(B, qt, 4, Z, zt);
  return zt[L - 1];
}
function Ze(e, t, r, n, o, i) {
  const s = (t - i) * (r - o), u = (e - o) * (n - i), f = s - u, l = Math.abs(s + u);
  return Math.abs(f) >= Ue * l ? f : -He(e, t, r, n, o, i, l);
}
function Je(e, t) {
  var r, n, o = 0, i, s, u, f, l, x, p, y = e[0], _ = e[1], w = t.length;
  for (r = 0; r < w; r++) {
    n = 0;
    var b = t[r], E = b.length - 1;
    if (x = b[0], x[0] !== b[E][0] && x[1] !== b[E][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = x[0] - y, u = x[1] - _, n; n < E; n++) {
      if (p = b[n + 1], f = p[0] - y, l = p[1] - _, u === 0 && l === 0) {
        if (f <= 0 && s >= 0 || s <= 0 && f >= 0)
          return 0;
      } else if (l >= 0 && u <= 0 || l <= 0 && u >= 0) {
        if (i = Ze(s, f, u, l, 0, 0), i === 0)
          return 0;
        (i > 0 && l > 0 && u <= 0 || i < 0 && l <= 0 && u > 0) && o++;
      }
      x = p, u = l, s = f;
    }
  }
  return o % 2 !== 0;
}
function at(e, t, r = {}) {
  if (!e)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = Ve(e), o = $e(t), i = o.type, s = t.bbox;
  let u = o.coordinates;
  if (s && Ke(n, s) === !1)
    return !1;
  i === "Polygon" && (u = [u]);
  for (var f = 0; f < u.length; ++f) {
    const l = Je(n, u[f]);
    if (l === 0 && !r.ignoreBoundary) return !0;
    if (l) return !0;
  }
  return !1;
}
function Ke(e, t) {
  return t[0] <= e[0] && t[1] <= e[1] && t[2] >= e[0] && t[3] >= e[1];
}
class Qe {
  constructor(t = [], r = tr) {
    if (this.data = t, this.length = this.data.length, this.compare = r, this.length > 0)
      for (let n = (this.length >> 1) - 1; n >= 0; n--) this._down(n);
  }
  push(t) {
    this.data.push(t), this.length++, this._up(this.length - 1);
  }
  pop() {
    if (this.length === 0) return;
    const t = this.data[0], r = this.data.pop();
    return this.length--, this.length > 0 && (this.data[0] = r, this._down(0)), t;
  }
  peek() {
    return this.data[0];
  }
  _up(t) {
    const { data: r, compare: n } = this, o = r[t];
    for (; t > 0; ) {
      const i = t - 1 >> 1, s = r[i];
      if (n(o, s) >= 0) break;
      r[t] = s, t = i;
    }
    r[t] = o;
  }
  _down(t) {
    const { data: r, compare: n } = this, o = this.length >> 1, i = r[t];
    for (; t < o; ) {
      let s = (t << 1) + 1, u = r[s];
      const f = s + 1;
      if (f < this.length && n(r[f], u) < 0 && (s = f, u = r[f]), n(u, i) >= 0) break;
      r[t] = u, t = s;
    }
    r[t] = i;
  }
}
function tr(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
const er = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Qe
}, Symbol.toStringTag, { value: "Module" }));
function rr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function nr(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var r = function n() {
      var o = !1;
      try {
        o = this instanceof n;
      } catch {
      }
      return o ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(n) {
    var o = Object.getOwnPropertyDescriptor(e, n);
    Object.defineProperty(r, n, o.get ? o : {
      enumerable: !0,
      get: function() {
        return e[n];
      }
    });
  }), r;
}
var Tt = { exports: {} }, Pt = { exports: {} }, ir = Pt.exports, Ht;
function or() {
  return Ht || (Ht = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(ir, function() {
      function r(a, d, c, h, m) {
        (function g(v, S, C, T, X) {
          for (; T > C; ) {
            if (T - C > 600) {
              var A = T - C + 1, O = S - C + 1, U = Math.log(A), B = 0.5 * Math.exp(2 * U / 3), L = 0.5 * Math.sqrt(U * B * (A - B) / A) * (O - A / 2 < 0 ? -1 : 1), I = Math.max(C, Math.floor(S - O * B / A + L)), D = Math.min(T, Math.floor(S + (A - O) * B / A + L));
              g(v, S, I, D, X);
            }
            var P = v[S], R = C, Y = T;
            for (n(v, C, S), X(v[T], P) > 0 && n(v, C, T); R < Y; ) {
              for (n(v, R, Y), R++, Y--; X(v[R], P) < 0; ) R++;
              for (; X(v[Y], P) > 0; ) Y--;
            }
            X(v[C], P) === 0 ? n(v, C, Y) : n(v, ++Y, T), Y <= S && (C = Y + 1), S <= Y && (T = Y - 1);
          }
        })(a, d, c || 0, h || a.length - 1, m || o);
      }
      function n(a, d, c) {
        var h = a[d];
        a[d] = a[c], a[c] = h;
      }
      function o(a, d) {
        return a < d ? -1 : a > d ? 1 : 0;
      }
      var i = function(a) {
        a === void 0 && (a = 9), this._maxEntries = Math.max(4, a), this._minEntries = Math.max(2, Math.ceil(0.4 * this._maxEntries)), this.clear();
      };
      function s(a, d, c) {
        if (!c) return d.indexOf(a);
        for (var h = 0; h < d.length; h++) if (c(a, d[h])) return h;
        return -1;
      }
      function u(a, d) {
        f(a, 0, a.children.length, d, a);
      }
      function f(a, d, c, h, m) {
        m || (m = E(null)), m.minX = 1 / 0, m.minY = 1 / 0, m.maxX = -1 / 0, m.maxY = -1 / 0;
        for (var g = d; g < c; g++) {
          var v = a.children[g];
          l(m, a.leaf ? h(v) : v);
        }
        return m;
      }
      function l(a, d) {
        return a.minX = Math.min(a.minX, d.minX), a.minY = Math.min(a.minY, d.minY), a.maxX = Math.max(a.maxX, d.maxX), a.maxY = Math.max(a.maxY, d.maxY), a;
      }
      function x(a, d) {
        return a.minX - d.minX;
      }
      function p(a, d) {
        return a.minY - d.minY;
      }
      function y(a) {
        return (a.maxX - a.minX) * (a.maxY - a.minY);
      }
      function _(a) {
        return a.maxX - a.minX + (a.maxY - a.minY);
      }
      function w(a, d) {
        return a.minX <= d.minX && a.minY <= d.minY && d.maxX <= a.maxX && d.maxY <= a.maxY;
      }
      function b(a, d) {
        return d.minX <= a.maxX && d.minY <= a.maxY && d.maxX >= a.minX && d.maxY >= a.minY;
      }
      function E(a) {
        return { children: a, height: 1, leaf: !0, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 };
      }
      function M(a, d, c, h, m) {
        for (var g = [d, c]; g.length; ) if (!((c = g.pop()) - (d = g.pop()) <= h)) {
          var v = d + Math.ceil((c - d) / h / 2) * h;
          r(a, v, d, c, m), g.push(d, v, v, c);
        }
      }
      return i.prototype.all = function() {
        return this._all(this.data, []);
      }, i.prototype.search = function(a) {
        var d = this.data, c = [];
        if (!b(a, d)) return c;
        for (var h = this.toBBox, m = []; d; ) {
          for (var g = 0; g < d.children.length; g++) {
            var v = d.children[g], S = d.leaf ? h(v) : v;
            b(a, S) && (d.leaf ? c.push(v) : w(a, S) ? this._all(v, c) : m.push(v));
          }
          d = m.pop();
        }
        return c;
      }, i.prototype.collides = function(a) {
        var d = this.data;
        if (!b(a, d)) return !1;
        for (var c = []; d; ) {
          for (var h = 0; h < d.children.length; h++) {
            var m = d.children[h], g = d.leaf ? this.toBBox(m) : m;
            if (b(a, g)) {
              if (d.leaf || w(a, g)) return !0;
              c.push(m);
            }
          }
          d = c.pop();
        }
        return !1;
      }, i.prototype.load = function(a) {
        if (!a || !a.length) return this;
        if (a.length < this._minEntries) {
          for (var d = 0; d < a.length; d++) this.insert(a[d]);
          return this;
        }
        var c = this._build(a.slice(), 0, a.length - 1, 0);
        if (this.data.children.length) if (this.data.height === c.height) this._splitRoot(this.data, c);
        else {
          if (this.data.height < c.height) {
            var h = this.data;
            this.data = c, c = h;
          }
          this._insert(c, this.data.height - c.height - 1, !0);
        }
        else this.data = c;
        return this;
      }, i.prototype.insert = function(a) {
        return a && this._insert(a, this.data.height - 1), this;
      }, i.prototype.clear = function() {
        return this.data = E([]), this;
      }, i.prototype.remove = function(a, d) {
        if (!a) return this;
        for (var c, h, m, g = this.data, v = this.toBBox(a), S = [], C = []; g || S.length; ) {
          if (g || (g = S.pop(), h = S[S.length - 1], c = C.pop(), m = !0), g.leaf) {
            var T = s(a, g.children, d);
            if (T !== -1) return g.children.splice(T, 1), S.push(g), this._condense(S), this;
          }
          m || g.leaf || !w(g, v) ? h ? (c++, g = h.children[c], m = !1) : g = null : (S.push(g), C.push(c), c = 0, h = g, g = g.children[0]);
        }
        return this;
      }, i.prototype.toBBox = function(a) {
        return a;
      }, i.prototype.compareMinX = function(a, d) {
        return a.minX - d.minX;
      }, i.prototype.compareMinY = function(a, d) {
        return a.minY - d.minY;
      }, i.prototype.toJSON = function() {
        return this.data;
      }, i.prototype.fromJSON = function(a) {
        return this.data = a, this;
      }, i.prototype._all = function(a, d) {
        for (var c = []; a; ) a.leaf ? d.push.apply(d, a.children) : c.push.apply(c, a.children), a = c.pop();
        return d;
      }, i.prototype._build = function(a, d, c, h) {
        var m, g = c - d + 1, v = this._maxEntries;
        if (g <= v) return u(m = E(a.slice(d, c + 1)), this.toBBox), m;
        h || (h = Math.ceil(Math.log(g) / Math.log(v)), v = Math.ceil(g / Math.pow(v, h - 1))), (m = E([])).leaf = !1, m.height = h;
        var S = Math.ceil(g / v), C = S * Math.ceil(Math.sqrt(v));
        M(a, d, c, C, this.compareMinX);
        for (var T = d; T <= c; T += C) {
          var X = Math.min(T + C - 1, c);
          M(a, T, X, S, this.compareMinY);
          for (var A = T; A <= X; A += S) {
            var O = Math.min(A + S - 1, X);
            m.children.push(this._build(a, A, O, h - 1));
          }
        }
        return u(m, this.toBBox), m;
      }, i.prototype._chooseSubtree = function(a, d, c, h) {
        for (; h.push(d), !d.leaf && h.length - 1 !== c; ) {
          for (var m = 1 / 0, g = 1 / 0, v = void 0, S = 0; S < d.children.length; S++) {
            var C = d.children[S], T = y(C), X = (A = a, O = C, (Math.max(O.maxX, A.maxX) - Math.min(O.minX, A.minX)) * (Math.max(O.maxY, A.maxY) - Math.min(O.minY, A.minY)) - T);
            X < g ? (g = X, m = T < m ? T : m, v = C) : X === g && T < m && (m = T, v = C);
          }
          d = v || d.children[0];
        }
        var A, O;
        return d;
      }, i.prototype._insert = function(a, d, c) {
        var h = c ? a : this.toBBox(a), m = [], g = this._chooseSubtree(h, this.data, d, m);
        for (g.children.push(a), l(g, h); d >= 0 && m[d].children.length > this._maxEntries; ) this._split(m, d), d--;
        this._adjustParentBBoxes(h, m, d);
      }, i.prototype._split = function(a, d) {
        var c = a[d], h = c.children.length, m = this._minEntries;
        this._chooseSplitAxis(c, m, h);
        var g = this._chooseSplitIndex(c, m, h), v = E(c.children.splice(g, c.children.length - g));
        v.height = c.height, v.leaf = c.leaf, u(c, this.toBBox), u(v, this.toBBox), d ? a[d - 1].children.push(v) : this._splitRoot(c, v);
      }, i.prototype._splitRoot = function(a, d) {
        this.data = E([a, d]), this.data.height = a.height + 1, this.data.leaf = !1, u(this.data, this.toBBox);
      }, i.prototype._chooseSplitIndex = function(a, d, c) {
        for (var h, m, g, v, S, C, T, X = 1 / 0, A = 1 / 0, O = d; O <= c - d; O++) {
          var U = f(a, 0, O, this.toBBox), B = f(a, O, c, this.toBBox), L = (m = U, g = B, v = void 0, S = void 0, C = void 0, T = void 0, v = Math.max(m.minX, g.minX), S = Math.max(m.minY, g.minY), C = Math.min(m.maxX, g.maxX), T = Math.min(m.maxY, g.maxY), Math.max(0, C - v) * Math.max(0, T - S)), I = y(U) + y(B);
          L < X ? (X = L, h = O, A = I < A ? I : A) : L === X && I < A && (A = I, h = O);
        }
        return h || c - d;
      }, i.prototype._chooseSplitAxis = function(a, d, c) {
        var h = a.leaf ? this.compareMinX : x, m = a.leaf ? this.compareMinY : p;
        this._allDistMargin(a, d, c, h) < this._allDistMargin(a, d, c, m) && a.children.sort(h);
      }, i.prototype._allDistMargin = function(a, d, c, h) {
        a.children.sort(h);
        for (var m = this.toBBox, g = f(a, 0, d, m), v = f(a, c - d, c, m), S = _(g) + _(v), C = d; C < c - d; C++) {
          var T = a.children[C];
          l(g, a.leaf ? m(T) : T), S += _(g);
        }
        for (var X = c - d - 1; X >= d; X--) {
          var A = a.children[X];
          l(v, a.leaf ? m(A) : A), S += _(v);
        }
        return S;
      }, i.prototype._adjustParentBBoxes = function(a, d, c) {
        for (var h = c; h >= 0; h--) l(d[h], a);
      }, i.prototype._condense = function(a) {
        for (var d = a.length - 1, c = void 0; d >= 0; d--) a[d].children.length === 0 ? d > 0 ? (c = a[d - 1].children).splice(c.indexOf(a[d]), 1) : this.clear() : u(a[d], this.toBBox);
      }, i;
    });
  })(Pt)), Pt.exports;
}
const sr = /* @__PURE__ */ nr(er);
var _t = { exports: {} }, Bt, Zt;
function ar() {
  return Zt || (Zt = 1, Bt = function(t, r, n, o) {
    var i = t[0], s = t[1], u = !1;
    n === void 0 && (n = 0), o === void 0 && (o = r.length);
    for (var f = (o - n) / 2, l = 0, x = f - 1; l < f; x = l++) {
      var p = r[n + l * 2 + 0], y = r[n + l * 2 + 1], _ = r[n + x * 2 + 0], w = r[n + x * 2 + 1], b = y > s != w > s && i < (_ - p) * (s - y) / (w - y) + p;
      b && (u = !u);
    }
    return u;
  }), Bt;
}
var Ot, Jt;
function cr() {
  return Jt || (Jt = 1, Ot = function(t, r, n, o) {
    var i = t[0], s = t[1], u = !1;
    n === void 0 && (n = 0), o === void 0 && (o = r.length);
    for (var f = o - n, l = 0, x = f - 1; l < f; x = l++) {
      var p = r[l + n][0], y = r[l + n][1], _ = r[x + n][0], w = r[x + n][1], b = y > s != w > s && i < (_ - p) * (s - y) / (w - y) + p;
      b && (u = !u);
    }
    return u;
  }), Ot;
}
var Kt;
function fr() {
  if (Kt) return _t.exports;
  Kt = 1;
  var e = ar(), t = cr();
  return _t.exports = function(n, o, i, s) {
    return o.length > 0 && Array.isArray(o[0]) ? t(n, o, i, s) : e(n, o, i, s);
  }, _t.exports.nested = t, _t.exports.flat = e, _t.exports;
}
var bt = { exports: {} }, ur = bt.exports, Qt;
function lr() {
  return Qt || (Qt = 1, (function(e, t) {
    (function(r, n) {
      n(t);
    })(ur, function(r) {
      const o = 33306690738754706e-32;
      function i(b, E, M, a, d) {
        let c, h, m, g, v = E[0], S = a[0], C = 0, T = 0;
        S > v == S > -v ? (c = v, v = E[++C]) : (c = S, S = a[++T]);
        let X = 0;
        if (C < b && T < M) for (S > v == S > -v ? (m = c - ((h = v + c) - v), v = E[++C]) : (m = c - ((h = S + c) - S), S = a[++T]), c = h, m !== 0 && (d[X++] = m); C < b && T < M; ) S > v == S > -v ? (m = c - ((h = c + v) - (g = h - c)) + (v - g), v = E[++C]) : (m = c - ((h = c + S) - (g = h - c)) + (S - g), S = a[++T]), c = h, m !== 0 && (d[X++] = m);
        for (; C < b; ) m = c - ((h = c + v) - (g = h - c)) + (v - g), v = E[++C], c = h, m !== 0 && (d[X++] = m);
        for (; T < M; ) m = c - ((h = c + S) - (g = h - c)) + (S - g), S = a[++T], c = h, m !== 0 && (d[X++] = m);
        return c === 0 && X !== 0 || (d[X++] = c), X;
      }
      function s(b) {
        return new Float64Array(b);
      }
      const u = 33306690738754716e-32, f = 22204460492503146e-32, l = 11093356479670487e-47, x = s(4), p = s(8), y = s(12), _ = s(16), w = s(4);
      r.orient2d = function(b, E, M, a, d, c) {
        const h = (E - c) * (M - d), m = (b - d) * (a - c), g = h - m;
        if (h === 0 || m === 0 || h > 0 != m > 0) return g;
        const v = Math.abs(h + m);
        return Math.abs(g) >= u * v ? g : -(function(S, C, T, X, A, O, U) {
          let B, L, I, D, P, R, Y, V, k, F, N, j, G, $, J, K, ot, Q;
          const tt = S - A, et = T - A, nt = C - O, it = X - O;
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - (($ = tt * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = nt * et) - Y * k - V * k - Y * F))), x[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), x[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, x[2] = j - (Q - P) + (N - P), x[3] = Q;
          let ut = (function(De, Vt) {
            let $t = Vt[0];
            for (let Rt = 1; Rt < De; Rt++) $t += Vt[Rt];
            return $t;
          })(4, x), Mt = f * U;
          if (ut >= Mt || -ut >= Mt || (B = S - (tt + (P = S - tt)) + (P - A), I = T - (et + (P = T - et)) + (P - A), L = C - (nt + (P = C - nt)) + (P - O), D = X - (it + (P = X - it)) + (P - O), B === 0 && L === 0 && I === 0 && D === 0) || (Mt = l * U + o * Math.abs(ut), (ut += tt * D + it * B - (nt * I + et * L)) >= Mt || -ut >= Mt)) return ut;
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - (($ = B * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = L - (Y = (R = 134217729 * L) - (R - L))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = L * et) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const Fe = i(4, x, 4, w, p);
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - (($ = tt * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = I - (k = (R = 134217729 * I) - (R - I))) - ((K = nt * I) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const je = i(Fe, p, 4, w, y);
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - (($ = B * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = L - (Y = (R = 134217729 * L) - (R - L))) * (F = I - (k = (R = 134217729 * I) - (R - I))) - ((K = L * I) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const ke = i(je, y, 4, w, _);
          return _[ke - 1];
        })(b, E, M, a, d, c, v);
      }, r.orient2dfast = function(b, E, M, a, d, c) {
        return (E - c) * (M - d) - (b - d) * (a - c);
      }, Object.defineProperty(r, "__esModule", { value: !0 });
    });
  })(bt, bt.exports)), bt.exports;
}
var te;
function hr() {
  if (te) return Tt.exports;
  te = 1;
  var e = or(), t = sr, r = fr(), n = lr().orient2d;
  t.default && (t = t.default), Tt.exports = o, Tt.exports.default = o;
  function o(c, h, m) {
    h = Math.max(0, h === void 0 ? 2 : h), m = m || 0;
    var g = _(c), v = new e(16);
    v.toBBox = function(Y) {
      return {
        minX: Y[0],
        minY: Y[1],
        maxX: Y[0],
        maxY: Y[1]
      };
    }, v.compareMinX = function(Y, V) {
      return Y[0] - V[0];
    }, v.compareMinY = function(Y, V) {
      return Y[1] - V[1];
    }, v.load(c);
    for (var S = [], C = 0, T; C < g.length; C++) {
      var X = g[C];
      v.remove(X), T = w(X, T), S.push(T);
    }
    var A = new e(16);
    for (C = 0; C < S.length; C++) A.insert(y(S[C]));
    for (var O = h * h, U = m * m; S.length; ) {
      var B = S.shift(), L = B.p, I = B.next.p, D = b(L, I);
      if (!(D < U)) {
        var P = D / O;
        X = i(v, B.prev.p, L, I, B.next.next.p, P, A), X && Math.min(b(X, L), b(X, I)) <= P && (S.push(B), S.push(w(X, B)), v.remove(X), A.remove(B), A.insert(y(B)), A.insert(y(B.next)));
      }
    }
    B = T;
    var R = [];
    do
      R.push(B.p), B = B.next;
    while (B !== T);
    return R.push(B.p), R;
  }
  function i(c, h, m, g, v, S, C) {
    for (var T = new t([], s), X = c.data; X; ) {
      for (var A = 0; A < X.children.length; A++) {
        var O = X.children[A], U = X.leaf ? E(O, m, g) : u(m, g, O);
        U > S || T.push({
          node: O,
          dist: U
        });
      }
      for (; T.length && !T.peek().node.children; ) {
        var B = T.pop(), L = B.node, I = E(L, h, m), D = E(L, g, v);
        if (B.dist < I && B.dist < D && l(m, L, C) && l(g, L, C)) return L;
      }
      X = T.pop(), X && (X = X.node);
    }
    return null;
  }
  function s(c, h) {
    return c.dist - h.dist;
  }
  function u(c, h, m) {
    if (f(c, m) || f(h, m)) return 0;
    var g = M(c[0], c[1], h[0], h[1], m.minX, m.minY, m.maxX, m.minY);
    if (g === 0) return 0;
    var v = M(c[0], c[1], h[0], h[1], m.minX, m.minY, m.minX, m.maxY);
    if (v === 0) return 0;
    var S = M(c[0], c[1], h[0], h[1], m.maxX, m.minY, m.maxX, m.maxY);
    if (S === 0) return 0;
    var C = M(c[0], c[1], h[0], h[1], m.minX, m.maxY, m.maxX, m.maxY);
    return C === 0 ? 0 : Math.min(g, v, S, C);
  }
  function f(c, h) {
    return c[0] >= h.minX && c[0] <= h.maxX && c[1] >= h.minY && c[1] <= h.maxY;
  }
  function l(c, h, m) {
    for (var g = Math.min(c[0], h[0]), v = Math.min(c[1], h[1]), S = Math.max(c[0], h[0]), C = Math.max(c[1], h[1]), T = m.search({ minX: g, minY: v, maxX: S, maxY: C }), X = 0; X < T.length; X++)
      if (p(T[X].p, T[X].next.p, c, h)) return !1;
    return !0;
  }
  function x(c, h, m) {
    return n(c[0], c[1], h[0], h[1], m[0], m[1]);
  }
  function p(c, h, m, g) {
    return c !== g && h !== m && x(c, h, m) > 0 != x(c, h, g) > 0 && x(m, g, c) > 0 != x(m, g, h) > 0;
  }
  function y(c) {
    var h = c.p, m = c.next.p;
    return c.minX = Math.min(h[0], m[0]), c.minY = Math.min(h[1], m[1]), c.maxX = Math.max(h[0], m[0]), c.maxY = Math.max(h[1], m[1]), c;
  }
  function _(c) {
    for (var h = c[0], m = c[0], g = c[0], v = c[0], S = 0; S < c.length; S++) {
      var C = c[S];
      C[0] < h[0] && (h = C), C[0] > g[0] && (g = C), C[1] < m[1] && (m = C), C[1] > v[1] && (v = C);
    }
    var T = [h, m, g, v], X = T.slice();
    for (S = 0; S < c.length; S++)
      r(c[S], T) || X.push(c[S]);
    return d(X);
  }
  function w(c, h) {
    var m = {
      p: c,
      prev: null,
      next: null,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0
    };
    return h ? (m.next = h.next, m.prev = h, h.next.prev = m, h.next = m) : (m.prev = m, m.next = m), m;
  }
  function b(c, h) {
    var m = c[0] - h[0], g = c[1] - h[1];
    return m * m + g * g;
  }
  function E(c, h, m) {
    var g = h[0], v = h[1], S = m[0] - g, C = m[1] - v;
    if (S !== 0 || C !== 0) {
      var T = ((c[0] - g) * S + (c[1] - v) * C) / (S * S + C * C);
      T > 1 ? (g = m[0], v = m[1]) : T > 0 && (g += S * T, v += C * T);
    }
    return S = c[0] - g, C = c[1] - v, S * S + C * C;
  }
  function M(c, h, m, g, v, S, C, T) {
    var X = m - c, A = g - h, O = C - v, U = T - S, B = c - v, L = h - S, I = X * X + A * A, D = X * O + A * U, P = O * O + U * U, R = X * B + A * L, Y = O * B + U * L, V = I * P - D * D, k, F, N, j, G = V, $ = V;
    V === 0 ? (F = 0, G = 1, j = Y, $ = P) : (F = D * Y - P * R, j = I * Y - D * R, F < 0 ? (F = 0, j = Y, $ = P) : F > G && (F = G, j = Y + D, $ = P)), j < 0 ? (j = 0, -R < 0 ? F = 0 : -R > I ? F = G : (F = -R, G = I)) : j > $ && (j = $, -R + D < 0 ? F = 0 : -R + D > I ? F = G : (F = -R + D, G = I)), k = F === 0 ? 0 : F / G, N = j === 0 ? 0 : j / $;
    var J = (1 - k) * c + k * m, K = (1 - k) * h + k * g, ot = (1 - N) * v + N * C, Q = (1 - N) * S + N * T, tt = ot - J, et = Q - K;
    return tt * tt + et * et;
  }
  function a(c, h) {
    return c[0] === h[0] ? c[1] - h[1] : c[0] - h[0];
  }
  function d(c) {
    c.sort(a);
    for (var h = [], m = 0; m < c.length; m++) {
      for (; h.length >= 2 && x(h[h.length - 2], h[h.length - 1], c[m]) <= 0; )
        h.pop();
      h.push(c[m]);
    }
    for (var g = [], v = c.length - 1; v >= 0; v--) {
      for (; g.length >= 2 && x(g[g.length - 2], g[g.length - 1], c[v]) <= 0; )
        g.pop();
      g.push(c[v]);
    }
    return g.pop(), h.pop(), h.concat(g);
  }
  return Tt.exports;
}
var mr = hr();
const dr = /* @__PURE__ */ rr(mr);
function pr(e, t = {}) {
  t.concavity = t.concavity || 1 / 0;
  const r = [];
  if (pe(e, (o) => {
    r.push([o[0], o[1]]);
  }), !r.length)
    return null;
  const n = dr(r, t.concavity);
  return n.length > 3 ? lt([n], t.properties) : null;
}
function At(e, t, r) {
  if (r) {
    const n = e.geometry.coordinates, o = H(n[0], r.xOrigin, r.xUnit, r.gridNum), i = H(n[1], r.yOrigin, r.yUnit, r.gridNum), s = r.gridCache[o]?.[i] ?? [];
    for (const u of s) {
      const f = t.features[u];
      if (f && at(e, f)) return f;
    }
    return;
  }
  for (let n = 0; n < t.features.length; n++)
    if (at(e, t.features[n]))
      return t.features[n];
}
function ge(e, t) {
  const r = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], o = t.geometry.coordinates[0][2], i = e.geometry.coordinates, s = t.properties.a.geom, u = t.properties.b.geom, f = t.properties.c.geom, l = [n[0] - r[0], n[1] - r[1]], x = [o[0] - r[0], o[1] - r[1]], p = [i[0] - r[0], i[1] - r[1]], y = [u[0] - s[0], u[1] - s[1]], _ = [f[0] - s[0], f[1] - s[1]], w = (x[1] * p[0] - x[0] * p[1]) / (l[0] * x[1] - l[1] * x[0]), b = (l[0] * p[1] - l[1] * p[0]) / (l[0] * x[1] - l[1] * x[0]);
  return [
    w * y[0] + b * _[0] + s[0],
    w * y[1] + b * _[1] + s[1]
  ];
}
function gr(e, t, r) {
  const n = e.geometry.coordinates, o = r.geometry.coordinates, i = Math.atan2(n[0] - o[0], n[1] - o[1]), s = wr(i, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const u = t[1][s];
  return ge(e, u.features[0]);
}
function yr(e, t, r, n, o, i, s, u, f) {
  let l = f;
  if (!l && s && (l = At(e, dt([s]))), !l)
    if (r) {
      const x = e.geometry.coordinates, p = r.gridNum, y = r.xOrigin, _ = r.yOrigin, w = r.xUnit, b = r.yUnit, E = r.gridCache, M = H(x[0], y, w, p), a = H(x[1], _, b, p), d = E[M] ? E[M][a] ? E[M][a] : [] : [], c = dt(d.map((h) => t.features[h]));
      l = At(e, c);
    } else
      l = At(e, t);
  return u && u(l), l ? ge(e, l) : gr(e, n, o);
}
function H(e, t, r, n) {
  let o = Math.floor((e - t) / r);
  return o < 0 && (o = 0), o >= n && (o = n - 1), o;
}
const xr = 36;
function ee(e, t, r) {
  const n = (t[1][0] - t[0][0]) / r, o = (t[1][1] - t[0][1]) / r;
  return e.reduce((i, s) => {
    const u = H(s[0][0], t[0][0], n, r), f = H(s[1][0], t[0][0], n, r), l = H(s[0][1], t[0][1], o, r), x = H(s[1][1], t[0][1], o, r), p = (f - u + 1) * (x - l + 1);
    return p > 0 ? i + p : i;
  }, 0);
}
function wr(e, t) {
  let r = re(e - t[0]), n = Math.PI * 2, o;
  for (let i = 0; i < t.length; i++) {
    const s = (i + 1) % t.length, u = re(e - t[s]), f = Math.min(Math.abs(r), Math.abs(u));
    r * u <= 0 && f < n && (n = f, o = i), r = u;
  }
  return o;
}
function re(e, t = !1) {
  const r = 2 * Math.PI, n = e - Math.floor(e / r) * r;
  return t ? n : n > Math.PI ? n - r : n;
}
function sn(e) {
  const t = e.features;
  for (let r = 0; r < t.length; r++) {
    const n = t[r];
    `${n.properties.a.index}`.substring(0, 1) === "b" && `${n.properties.b.index}`.substring(0, 1) === "b" ? t[r] = {
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
    } : `${n.properties.c.index}`.substring(0, 1) === "b" && `${n.properties.a.index}`.substring(0, 1) === "b" && (t[r] = {
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
  return e;
}
function an(e) {
  const t = ["a", "b", "c", "a"].map(
    (i) => e.properties[i].geom
  ), r = e.geometry.coordinates[0], n = e.properties, o = {
    a: { geom: r[0], index: n.a.index },
    b: { geom: r[1], index: n.b.index },
    c: { geom: r[2], index: n.c.index }
  };
  return lt([t], o);
}
function vr(e) {
  const t = [0, 1, 2, 0].map((n) => e[n][0][0]), r = {
    a: { geom: e[0][0][1], index: e[0][1] },
    b: { geom: e[1][0][1], index: e[1][1] },
    c: { geom: e[2][0][1], index: e[2][1] }
  };
  return lt([t], r);
}
function It(e, t, r, n, o, i = !1, s) {
  const u = e.map(
    (f) => {
      (!s || s < 2.00703) && (f = Mr(f));
      const l = isFinite(f) ? t[f] : f === "c" ? n : (function() {
        const x = f.match(/^b(\d+)$/);
        if (x) return o[parseInt(x[1])];
        const p = f.match(/^e(\d+)$/);
        if (p) return r[parseInt(p[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[l[1], l[0]], f] : [[l[0], l[1]], f];
    }
  );
  return vr(u);
}
function Mr(e) {
  return typeof e == "number" ? e : e.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function _r(e, t) {
  return t && t >= 2.00703 || Array.isArray(e[0]) ? e : e.map((r) => [
    r.illstNodes,
    r.mercNodes,
    r.startEnd
  ]);
}
const ye = 2.00704;
function br(e) {
  return !!(e.version !== void 0 || !e.tins && e.points && e.tins_points);
}
function Er(e) {
  return {
    points: e.points,
    strictStatus: yt(e),
    verticesParams: Cr(e),
    centroid: Tr(e),
    edges: _r(e.edges || []),
    edgeNodes: e.edgeNodes || [],
    tins: Xr(e),
    kinks: Pr(e.kinks_points),
    yaxisMode: e.yaxisMode ?? "invert",
    strictMode: e.strictMode ?? "auto",
    vertexMode: e.vertexMode,
    bounds: e.bounds,
    boundsPolygon: e.boundsPolygon,
    wh: e.wh,
    xy: e.xy ?? [0, 0]
  };
}
function Sr(e) {
  const t = Ar(e), r = t.tins, n = t.vertices_params;
  return n != null && xe(n), {
    compiled: t,
    tins: r,
    points: Rr(r),
    strictStatus: t.strict_status,
    verticesParams: n,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function yt(e) {
  return e.strict_status ? e.strict_status : e.kinks_points ? "strict_error" : Array.isArray(e.tins_points) && e.tins_points.length === 2 ? "loose" : "strict";
}
function Cr(e) {
  if ("outerTransform" in e && e.outerTransform === "worldFile" && !e.vertices_params)
    return { forw: [[], []], bakw: [[], []] };
  if (!Array.isArray(e.vertices_params) || !Array.isArray(e.vertices_points))
    throw new Error(
      "Invalid compiled data: vertices_params and vertices_points must be arrays"
    );
  const t = {
    forw: [e.vertices_params[0]],
    bakw: [e.vertices_params[1]]
  };
  return t.forw[1] = ne(e, !1), t.bakw[1] = ne(e, !0), xe(t), t;
}
function xe(e) {
  if (typeof e != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((t) => {
    const r = e[t];
    if (r == null) return;
    const n = `vertices_params.${t}`, o = r[0], i = r[1];
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
function ne(e, t) {
  const r = e.vertices_points.length;
  return Array.from({ length: r }, (n, o) => {
    const i = (o + 1) % r, s = It(
      ["c", `b${o}`, `b${i}`],
      e.points,
      e.edgeNodes || [],
      e.centroid_point,
      e.vertices_points,
      t,
      ye
    );
    return dt([s]);
  });
}
function Tr(e) {
  return {
    forw: rt(e.centroid_point[0], {
      target: {
        geom: e.centroid_point[1],
        index: "c"
      }
    }),
    bakw: rt(e.centroid_point[1], {
      target: {
        geom: e.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Xr(e) {
  const t = e.tins_points.length === 1 ? 0 : 1;
  return {
    forw: dt(
      e.tins_points[0].map(
        (r) => It(
          r,
          e.points,
          e.edgeNodes || [],
          e.centroid_point,
          e.vertices_points,
          !1,
          e.version
        )
      )
    ),
    bakw: dt(
      e.tins_points[t].map(
        (r) => It(
          r,
          e.points,
          e.edgeNodes || [],
          e.centroid_point,
          e.vertices_points,
          !0,
          e.version
        )
      )
    )
  };
}
function Pr(e) {
  if (e)
    return {
      bakw: dt(
        e.map((t) => rt(t))
      )
    };
}
function Ar(e) {
  return JSON.parse(
    JSON.stringify(e).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Rr(e) {
  const t = [], r = e.forw.features;
  for (let n = 0; n < r.length; n++) {
    const o = r[n];
    ["a", "b", "c"].forEach((i, s) => {
      const u = o.geometry.coordinates[0][s], f = o.properties[i].geom, l = o.properties[i].index;
      typeof l == "number" && (t[l] = [u, f]);
    });
  }
  return t;
}
function we(e) {
  if (![
    e.xScale,
    e.xSkew,
    e.xOrigin,
    e.ySkew,
    e.yScale,
    e.yOrigin
  ].every(Number.isFinite))
    throw new Error("worldFile の係数はすべて有限の数でなければなりません");
  const r = e.xScale * e.yScale - e.xSkew * e.ySkew;
  if (!Number.isFinite(r) || r === 0)
    throw new Error("worldFile は非正則です（行列式が 0）");
  if (r > 0)
    throw new Error("worldFile は鏡像です。yScale の符号を確かめてください");
}
function ve(e, t) {
  const r = t[0] - 0.5, n = t[1] - 0.5;
  return [
    e.xScale * r + e.xSkew * n + e.xOrigin,
    e.ySkew * r + e.yScale * n + e.yOrigin
  ];
}
function Me(e, t) {
  const r = e.xScale * e.yScale - e.xSkew * e.ySkew, n = t[0] - e.xOrigin, o = t[1] - e.yOrigin;
  return [
    (e.yScale * n - e.xSkew * o) / r + 0.5,
    (-e.ySkew * n + e.xScale * o) / r + 0.5
  ];
}
const cn = ye;
function xt(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function Et(e, t, r, n = 0) {
  return e[0] >= Math.min(t[0], r[0]) - n && e[0] <= Math.max(t[0], r[0]) + n && e[1] >= Math.min(t[1], r[1]) - n && e[1] <= Math.max(t[1], r[1]) + n;
}
function Yr(e, t, r, n) {
  const o = xt(e, t, r), i = xt(e, t, n), s = xt(r, n, e), u = xt(r, n, t);
  return o === 0 && Et(r, e, t) || i === 0 && Et(n, e, t) || s === 0 && Et(e, r, n) || u === 0 && Et(t, r, n) ? !0 : Math.sign(o) * Math.sign(i) === -1 && Math.sign(s) * Math.sign(u) === -1;
}
function ie(e) {
  const t = e.reduce((r, n, o) => r + xt(e[0], n, e[(o + 1) % e.length]), 0);
  if (!Number.isFinite(t) || t === 0)
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  for (let r = 0; r < e.length; r++) {
    const n = e[r], o = e[(r + 1) % e.length];
    if (n[0] === o[0] && n[1] === o[1])
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    for (let i = r + 2; i < e.length; i++)
      if (!(r === 0 && i === e.length - 1) && Yr(n, o, e[i], e[(i + 1) % e.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(t);
}
function Br(e, t) {
  let r = !1;
  for (let n = 0, o = t.length - 1; n < t.length; o = n++) {
    const i = t[o], s = t[n], [u, f] = i, [l, x] = s, p = l - u, y = x - f, _ = e[0] - u, w = e[1] - f, b = Number.EPSILON * 16 * Math.max(1, Math.abs(u), Math.abs(f), Math.abs(l), Math.abs(x), Math.abs(e[0]), Math.abs(e[1])), E = Math.hypot(p, y), M = b * E + Number.EPSILON * 16 * (Math.abs(_ * y) + Math.abs(w * p));
    if (Math.abs(xt(i, s, e)) <= M && Et(e, i, s, b)) return "edge";
    f > e[1] != x > e[1] && e[0] < (l - u) * (e[1] - f) / (x - f) + u && (r = !r);
  }
  return r ? "inside" : "outside";
}
class q {
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
  yaxisMode = q.YAXIS_INVERT;
  strictMode = q.MODE_AUTO;
  vertexMode = q.VERTEX_PLAIN;
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
  setCompiled(t) {
    const r = "outerTransform" in t, n = r ? t.outerTransform : void 0;
    if (n !== void 0 && n !== "extrapolate" && n !== "worldFile")
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    const o = r ? t.worldFile : void 0;
    if (n === "worldFile") {
      if (!o) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      we(o);
      const l = t.vertices_points;
      if (!Array.isArray(l) || l.length < 4 || l.some((_) => !Array.isArray(_) || _.length < 2 || _.some((w) => !Array.isArray(w) || w.length < 2 || !w.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const x = ie(l.map((_) => _[0])), p = ie(l.map((_) => _[1])), y = t.yaxisMode === q.YAXIS_FOLLOW ? -p : p;
      if (x === y)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const i = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = br(i) ? Er(i) : Sr(i), f = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"].map((l) => [l, this[l]]));
    try {
      "compiled" in s ? this.applyLegacyState(s) : this.applyModernState(s), this.outerTransform = n ?? "extrapolate", this.worldFile = o, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0, this.outerRings = this.outerVertices ? { forw: this.outerVertices.map((l) => l[0]), bakw: this.outerVertices.map((l) => l[1]) } : void 0, this.validateCompiledProjection();
    } catch (l) {
      throw Object.assign(this, f), l;
    }
  }
  /** 層固有の検査を、失敗時に compiled の適用を取り消せる位置で行う */
  validateCompiledProjection() {
  }
  applyModernState(t) {
    this.points = t.points, this.strict_status = t.strictStatus, this.vertices_params = t.verticesParams, this.centroid = t.centroid, this.edges = t.edges, this.edgeNodes = t.edgeNodes || [], this.tins = t.tins, this.addIndexedTin(), this.kinks = t.kinks, this.yaxisMode = t.yaxisMode ?? q.YAXIS_INVERT, this.vertexMode = t.vertexMode ?? q.VERTEX_PLAIN, this.strictMode = t.strictMode ?? q.MODE_AUTO, t.bounds ? (this.bounds = t.bounds, this.boundsPolygon = t.boundsPolygon, this.xy = t.xy, this.wh = t.wh) : (this.bounds = void 0, this.boundsPolygon = void 0, this.xy = t.xy ?? [0, 0], t.wh && (this.wh = t.wh));
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
    const t = this.tins, r = t.forw, n = t.bakw, o = Math.ceil(Math.sqrt(r.features.length));
    if (o < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], s = [];
    const u = r.features.map((E) => {
      let M = [];
      return Wt(E)[0].map((a) => {
        i.length === 0 ? i = [Array.from(a), Array.from(a)] : (a[0] < i[0][0] && (i[0][0] = a[0]), a[0] > i[1][0] && (i[1][0] = a[0]), a[1] < i[0][1] && (i[0][1] = a[1]), a[1] > i[1][1] && (i[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    }), f = n.features.map((E) => {
      let M = [];
      return Wt(E)[0].map((a) => {
        s.length === 0 ? s = [Array.from(a), Array.from(a)] : (a[0] < s[0][0] && (s[0][0] = a[0]), a[0] > s[1][0] && (s[1][0] = a[0]), a[1] < s[0][1] && (s[0][1] = a[1]), a[1] > s[1][1] && (s[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    });
    if (Math.max(
      ee(u, i, o),
      ee(f, s, o)
    ) > xr * r.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const x = (i[1][0] - i[0][0]) / o, p = (i[1][1] - i[0][1]) / o, y = u.reduce(
      (E, M, a) => {
        const d = H(M[0][0], i[0][0], x, o), c = H(M[1][0], i[0][0], x, o), h = H(M[0][1], i[0][1], p, o), m = H(M[1][1], i[0][1], p, o);
        for (let g = d; g <= c; g++) {
          E[g] || (E[g] = []);
          for (let v = h; v <= m; v++)
            E[g][v] || (E[g][v] = []), E[g][v].push(a);
        }
        return E;
      },
      []
    ), _ = (s[1][0] - s[0][0]) / o, w = (s[1][1] - s[0][1]) / o, b = f.reduce(
      (E, M, a) => {
        const d = H(M[0][0], s[0][0], _, o), c = H(M[1][0], s[0][0], _, o), h = H(M[0][1], s[0][1], w, o), m = H(M[1][1], s[0][1], w, o);
        for (let g = d; g <= c; g++) {
          E[g] || (E[g] = []);
          for (let v = h; v <= m; v++)
            E[g][v] || (E[g][v] = []), E[g][v].push(a);
        }
        return E;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: o,
        xOrigin: i[0][0],
        yOrigin: i[0][1],
        xUnit: x,
        yUnit: p,
        gridCache: y
      },
      bakw: {
        gridNum: o,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: _,
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
  transform(t, r, n) {
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (r && this.strict_status == q.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const o = t;
    this.yaxisMode == q.YAXIS_FOLLOW && r && (t = [t[0], -1 * t[1]]);
    const i = rt(t);
    if (this.bounds && !r && !n && !at(i, this.boundsPolygon))
      return !1;
    const s = r ? this.tins.bakw : this.tins.forw, u = r ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let f;
    if (this.outerTransform === "worldFile") {
      const w = r ? this.outerRings?.bakw : this.outerRings?.forw, b = w ? Br(i.geometry.coordinates, w) : "outside";
      if (r && this.strict_status == q.STATUS_ERROR && b !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (b === "inside" && s && (f = At(i, s, u)), !f) {
        const E = r ? Me(this.worldFile, o) : ve(this.worldFile, o);
        return !E.every(Number.isFinite) || r && this.bounds && !n && !at(rt(E), this.boundsPolygon) ? !1 : E;
      }
    }
    const l = r ? this.vertices_params.bakw : this.vertices_params.forw, x = r ? this.centroid.bakw : this.centroid.forw;
    let p, y;
    this.stateFull && (this.stateBackward == r ? p = this.stateTriangle : (this.stateBackward = r, this.stateTriangle = void 0), y = (w) => {
      this.stateTriangle = w;
    });
    let _ = yr(
      i,
      s,
      u,
      l,
      x,
      void 0,
      p,
      y,
      f
    );
    if (this.bounds && r && !n) {
      const w = rt(_);
      if (!at(w, this.boundsPolygon)) return !1;
    } else this.yaxisMode == q.YAXIS_FOLLOW && !r && (_ = [_[0], -1 * _[1]]);
    return _;
  }
}
const W = 20037508342789244e-9, Or = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], Xt = 6378137, Nt = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function ft(e) {
  return e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function Nr(e, t) {
  const r = t.trim().split(/\s+/).map((i) => {
    const [s, ...u] = i.replace(/^\+/, "").split("="), f = s.toLowerCase(), l = u.join("="), x = u.length > 0;
    if (f === "axis" && (!x || l !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if ((f === "no_defs" || f === "wktext") && !x) return "";
    if (x && l === "") throw new Error(`+${f}= は許可されていません`);
    if (f === "wktext") throw new Error("+wktext は許可されていません");
    if (f === "type" && !x) throw new Error("+type は値が必要です");
    if (f === "type" && l.toLowerCase() === "crs" || f === "axis") return "";
    if (f === "towgs84") {
      const y = l.split(",");
      if (!x || y.some((w) => w.trim() === ""))
        throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(y.length) && y.every((w) => {
        const b = w.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(w)) && !/[1-9]/.test(b);
      })) return "";
    }
    const p = l ? l.split(",").map((y) => {
      const _ = Number(y);
      return y.trim() !== "" && Number.isFinite(_) ? Object.is(_, -0) ? "0" : String(_) : y.toLowerCase();
    }).join(",") : "";
    return `+${f}${l ? `=${p}` : ""}`;
  }).filter(Boolean), n = [...new Set(r)].sort().join(" ");
  if (!(e === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : [
    "+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"
  ]).includes(n))
    throw new Error(
      `epsg と proj4 が一致しないか、proj4js なしでは判定できない CRS です（EPSG:${e}）`
    );
}
const st = {
  toLonLat(e, t) {
    if (!ft(e)) return !1;
    if (t.epsg === 4326)
      return Math.abs(e[0]) <= 180 && Math.abs(e[1]) <= 90 ? [e[0], e[1]] : !1;
    if (t.epsg !== 3857 || Math.abs(e[0]) > W || Math.abs(e[1]) > W)
      return !1;
    const r = e[0], n = e[1];
    return [
      Math.abs(r) === W ? Math.sign(r) * 180 : r / Xt * (180 / Math.PI),
      Math.abs(n) === W ? Math.sign(n) * Nt : (2 * Math.atan(Math.exp(n / Xt)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(e, t) {
    if (!ft(e) || Math.abs(e[0]) > 180) return !1;
    const [r, n] = e;
    if (t.epsg === 4326) return Math.abs(n) <= 90 ? [r, n] : !1;
    if (t.epsg !== 3857 || Math.abs(n) > Nt) return !1;
    const o = r * Math.PI / 180, i = n * Math.PI / 180, s = [
      Math.abs(r) === 180 ? Math.sign(r) * W : Xt * o,
      Math.abs(n) === Nt ? Math.sign(n) * W : Xt * Math.log(Math.tan(Math.PI / 4 + i / 2))
    ];
    return s.every(Number.isFinite) ? s : !1;
  }
}, _e = { epsg: 3857 }, oe = { epsg: 4326 }, Lr = "+proj=longlat +datum=WGS84";
function Ft(e) {
  return e.epsg === 3857 || e.epsg === 4326;
}
function Ir(e) {
  if (e === null || typeof e != "object" || Array.isArray(e))
    throw new Error("CRS はオブジェクトで指定してください");
  if (e.epsg !== void 0 && (!Number.isSafeInteger(e.epsg) || e.epsg <= 0))
    throw new Error("CRS の epsg は正の整数で指定してください");
  if (e.proj4 !== void 0 && (typeof e.proj4 != "string" || !e.proj4.trim()))
    throw new Error("CRS の proj4 は空でない文字列で指定してください");
  const t = typeof e.authority == "string" && !!e.authority.trim(), r = typeof e.code == "string" ? !!e.code.trim() : Number.isFinite(e.code);
  if (e.epsg === void 0 && !(t && r) && e.proj4 === void 0)
    throw new Error(
      "CRS には epsg、authority と code の組、または proj4 が必要です。WKT のみの定義には対応していません"
    );
}
function be(e) {
  let t = !1;
  for (const r of e.split("+")) {
    const [n, o] = r.trim().split("="), i = n.toLowerCase();
    if (i === "axis" && o !== "enu")
      throw new Error("CRS の座標は東・北の順で書き、+axis を外すか +axis=enu を指定してください");
    if (i === "nadgrids" && o !== "@null" || i === "geoidgrids" || i === "hgridshift" || i === "vgridshift" || i === "proj" && ["pipeline", "hgridshift", "vgridshift"].includes(o?.toLowerCase()))
      throw new Error(`proj4 の +${r.trim()} は読み込めません`);
    i === "proj" && o && (t = !0);
  }
  if (!e.startsWith("+") || !t)
    throw new Error("CRS の proj4 は +proj= を含む定義で指定してください");
}
function Ee(e, t, r) {
  Ir(e);
  const n = Ft(e);
  if (e.proj4 === void 0) {
    if (e.wkt) throw new Error("WKT だけの CRS 定義に対応していません");
    if (!n) throw new Error("EPSG:3857・4326 以外の CRS には proj4 定義が必要です");
    return;
  }
  const o = e.proj4.trim();
  if (be(o), t.validateDefinition)
    t.validateDefinition(e, n ? r() : void 0);
  else if (n)
    Nr(e.epsg, o);
  else if (t === st)
    throw new Error("この CRS には proj4 に対応する投影エンジンが必要です");
}
function fn(e) {
  const t = /* @__PURE__ */ new Map();
  function r(i) {
    const s = t.get(i);
    if (s) return s;
    be(i);
    try {
      const u = e(i, Lr);
      return t.set(i, u), u;
    } catch (u) {
      throw new Error(`proj4 定義を読み込めません（${String(u)}）`, { cause: u });
    }
  }
  function n(i, [s, u]) {
    const f = i.inverse([s, u, 0], !0), l = f[2];
    return Number.isFinite(l) && Math.abs(l) > 1e-6 ? i.inverse([s, u, -l], !0) : f;
  }
  function o(i, s, u) {
    if (!ft(i)) return !1;
    try {
      const f = u(r(s), [i[0], i[1]]);
      return ft(f) ? [f[0], f[1]] : !1;
    } catch {
      return !1;
    }
  }
  return {
    toLonLat(i, s) {
      if (Ft(s)) return st.toLonLat(i, s);
      if (!s.proj4) return !1;
      const u = o(
        i,
        s.proj4.trim(),
        (f, l) => f.forward(l)
      );
      return u === !1 ? !1 : st.toLonLat(u, oe);
    },
    fromLonLat(i, s) {
      return Ft(s) ? st.fromLonLat(i, s) : !s.proj4 || st.fromLonLat(i, oe) === !1 ? !1 : o(i, s.proj4.trim(), n);
    },
    validateDefinition(i, s) {
      if (i.proj4 === void 0) return;
      const u = i.proj4.trim();
      if (r(u), !s) return;
      const f = i.epsg === 3857 ? 1e-3 : 1e-8;
      for (const l of s) {
        const x = st.toLonLat(l, i), p = x === !1 ? !1 : o(x, u, (y, _) => y.inverse(_));
        if (p === !1 || Math.hypot(p[0] - l[0], p[1] - l[1]) > f)
          throw new Error(
            `epsg と proj4 が地図の四隅または中心で一致しないか、比較できません（EPSG:${i.epsg}）`
          );
      }
    }
  };
}
function Se(e, t, r) {
  if (!ft(e)) return !1;
  const n = r.toLonLat(e, t);
  return n === !1 ? !1 : st.fromLonLat(n, _e);
}
function Ce(e, t, r) {
  const n = st.toLonLat(e, _e);
  if (n === !1) return !1;
  const o = r.fromLonLat(n, t);
  return o !== !1 && ft(o) ? o : !1;
}
function Te(e, t, r) {
  let n, o, i, s;
  if (r?.length) {
    n = o = 1 / 0, i = s = -1 / 0;
    for (const [u, f] of r)
      n = Math.min(n, u), o = Math.min(o, f), i = Math.max(i, u), s = Math.max(s, f);
  } else if (e)
    [n, o] = t ?? [0, 0], i = n + e[0], s = o + e[1];
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
class Fr {
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
    if (we(t.worldFile), !t.wh && !t.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? st;
    const r = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = r.map((u) => u[0]), o = r.map((u) => u[1]), i = Math.min(...n), s = Math.min(...o);
      if (this.wh = [Math.max(...n) - i, Math.max(...o) - s], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = t.xy ?? [i, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance, Ee(
      this.crs,
      this.projectionEngine,
      () => Te(t.wh, this.xy, t.wh ? void 0 : this.bounds).map((n) => this.xyToCrs(n))
    );
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return ve(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return Me(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, r = !1, n = !1) {
    if (!ft(t)) return !1;
    if (!r) {
      const s = this.xyToCrs(t);
      return this.crs.epsg === 3857 ? s.every((u) => Math.abs(u) <= W) ? s : !1 : Se(s, this.crs, this.projectionEngine);
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(t[0]) > W || Math.abs(t[1]) > W) return !1;
      const s = this.crsToXy(t);
      return ft(s) ? s : !1;
    }
    const o = Ce(t, this.crs, this.projectionEngine);
    if (o === !1) return !1;
    const i = this.crsToXy(o);
    return ft(i) ? i : !1;
  }
}
function Xe(e, t) {
  return Math.floor(Math.min(e[0], e[1]) / 4) * W / 128 / Math.pow(2, t);
}
function jr(e, t) {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], i = o[0] * Math.cos(t) - o[1] * Math.sin(t), s = o[0] * Math.sin(t) + o[1] * Math.cos(t);
    r.push([i, s]);
  }
  return r;
}
function se(e, t, r, n) {
  const o = Xe(n, t);
  return jr(Or, r).map((u) => [
    u[0] * o + e[0],
    u[1] * o + e[1]
  ]);
}
function ae(e, t) {
  const r = e[0], o = e.slice(1, 5).map((_) => [
    _[0] - r[0],
    _[1] - r[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, u = 0, f = 0;
  for (let _ = 0; _ < 4; _++) {
    const w = o[_], b = i[_], E = Math.sqrt(Math.pow(w[0], 2) + Math.pow(w[1], 2));
    s += E;
    const M = w[0] * b[1] - w[1] * b[0], a = w[0] * b[0] + w[1] * b[1], d = -Math.atan2(M, a);
    u += Math.cos(d), f += Math.sin(d);
  }
  const l = s / 4, x = Math.atan2(f, u), p = Math.floor(Math.min(t[0], t[1]) / 4), y = Math.log(p * W / 128 / l) / Math.log(2);
  return { center: r, zoom: y, rotation: x };
}
function Pe(e) {
  const t = e - 2 * Math.PI * Math.round(e / (2 * Math.PI));
  return t === -Math.PI ? Math.PI : t;
}
function Lt(e, t) {
  const r = e[0] * (2 * W) / t - W, n = -1 * (e[1] * (2 * W) / t - W);
  return [r, n];
}
function ce(e, t) {
  const r = (e[0] + W) * t / (2 * W), n = (-e[1] + W) * t / (2 * W);
  return [r, n];
}
const kr = 16, Dr = 8, Vr = 16, wt = 2, $r = 1, Gr = 1, Wr = 0.03, Ur = 1e-24;
function Ct(e) {
  return Array.isArray(e) && e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function mt(e) {
  let t = 1 / 0, r = 1 / 0, n = -1 / 0, o = -1 / 0;
  for (const [i, s] of e)
    !Number.isFinite(i) || !Number.isFinite(s) || (t = Math.min(t, i), r = Math.min(r, s), n = Math.max(n, i), o = Math.max(o, s));
  if (!Number.isFinite(t)) throw new Error("視点グリッドの範囲を有限な座標から決められません");
  return { minX: t, minY: r, maxX: n, maxY: o };
}
function Ae(e, t) {
  if (t?.length) return mt(t);
  if (e.xy && e.wh)
    return {
      minX: e.xy[0],
      minY: e.xy[1],
      maxX: e.xy[0] + e.wh[0],
      maxY: e.xy[1] + e.wh[1]
    };
  if (e.wh) return { minX: 0, minY: 0, maxX: e.wh[0], maxY: e.wh[1] };
  if (e.bounds?.length) return mt(e.bounds);
  const r = e.points;
  if (r?.length) return mt(r.map((n) => n[0]));
  throw new Error("視点グリッドの紙側基準矩形を決められません（wh / bounds / GCP がありません）");
}
function vt(e, t) {
  return e instanceof q ? e.strict_status ?? t ?? "strict" : "strict";
}
function Re(e, t = kr) {
  const r = e.maxX - e.minX, n = e.maxY - e.minY;
  if (!(r > 0) || !(n > 0))
    throw new Error("視点グリッドの基準矩形に面積がありません");
  const o = Math.max(r, n), i = Math.min(r, n), s = Math.min(
    Vr,
    Math.max(Dr, Math.round(t * i / o))
  ), u = r >= n ? t : s, f = r >= n ? s : t, l = r / u, x = n / f;
  return {
    x0: e.minX - wt * l,
    y0: e.minY - wt * x,
    dx: l,
    dy: x,
    mx: u + 2 * wt,
    my: f + 2 * wt,
    nxInner: u,
    nyInner: f
  };
}
function qr(e, t, r, n) {
  const o = !n, i = [[r, 0], [-r, 0], [0, r], [0, -r]], s = [];
  for (const u of i) {
    const f = o ? [t[0] + u[0], t[1] - u[1]] : [t[0] + u[0], t[1] + u[1]], l = e.transform(f, n, !0);
    Ct(l) && s.push({ d: u, out: l });
  }
  return s;
}
function jt(e, t) {
  return t ? [e[0], -e[1]] : [e[0], e[1]];
}
function fe(e, t, r, n) {
  const o = e * n - t * r;
  if (!(o > 0) || !Number.isFinite(o)) return null;
  const i = Math.sqrt(o), s = Math.atan2(r - t, e + n);
  return Number.isFinite(i) && Number.isFinite(s) ? { s: i, theta: s } : null;
}
function zr(e, t, r) {
  let n = 0, o = 0, i = 0;
  for (const { d: l, out: x } of e) {
    const [p, y] = jt(x, r), _ = l[0], w = l[1], b = p - t[0], E = y - t[1];
    n += _ * b + w * E, o += _ * E - w * b, i += _ * _ + w * w;
  }
  if (!(i > 0)) return null;
  const s = n / i, u = o / i, f = Math.hypot(s, u);
  return !(f > 0) || !Number.isFinite(f) ? null : r ? { s: 1 / f, theta: -Math.atan2(u, s) } : { s: f, theta: Math.atan2(u, s) };
}
function ue(e) {
  return e ? { s: 1 / e.s, theta: -e.theta } : null;
}
function Ye(e, t, r, n) {
  const o = qr(e, t, r, n), i = (y, _) => {
    const w = o.find((b) => b.d[0] === y && b.d[1] === _);
    return w ? jt(w.out, n) : void 0;
  };
  if (o.length >= 4) {
    const y = i(r, 0), _ = i(-r, 0), w = i(0, r), b = i(0, -r), E = fe(
      (y[0] - _[0]) / (2 * r),
      (w[0] - b[0]) / (2 * r),
      (y[1] - _[1]) / (2 * r),
      (w[1] - b[1]) / (2 * r)
    );
    return n ? ue(E) : E;
  }
  const s = e.transform(t, n, !0), u = Ct(s) ? jt(s, n) : null;
  if (!u) return null;
  const f = (y) => y[1] === 0, l = o.filter((y) => f(y.d)), x = o.filter((y) => !f(y.d)), p = l.length >= 1 && x.length >= 1;
  if (o.length >= 3 || o.length === 2 && p) {
    const y = (E, M) => E && M ? [(E[0] - M[0]) / (2 * r), (E[1] - M[1]) / (2 * r)] : E ? [(E[0] - u[0]) / r, (E[1] - u[1]) / r] : M ? [(u[0] - M[0]) / r, (u[1] - M[1]) / r] : null, _ = y(i(r, 0), i(-r, 0)), w = y(i(0, r), i(0, -r));
    if (!_ || !w) return null;
    const b = fe(_[0], w[0], _[1], w[1]);
    return n ? ue(b) : b;
  }
  return o.length === 2 ? zr(o, u, n) : null;
}
function ht(e, t, r) {
  const n = Math.min(Math.max((t - e.x0) / e.dx, 0), e.nx - 1), o = Math.min(Math.max((r - e.y0) / e.dy, 0), e.ny - 1), i = Math.min(Math.floor(n), e.nx - 2), s = Math.min(Math.floor(o), e.ny - 2), u = n - i, f = o - s, l = (1 - u) * (1 - f), x = u * (1 - f), p = (1 - u) * f, y = u * f, _ = e.nx, w = e.ls, b = e.cs, E = e.sn, M = s * _ + i, a = M + 1, d = M + _, c = d + 1;
  let h = l * w[M];
  h += x * w[a], h += p * w[d], h += y * w[c];
  let m = l * b[M];
  m += x * b[a], m += p * b[d], m += y * b[c];
  let g = l * E[M];
  g += x * E[a], g += p * E[d], g += y * E[c];
  const v = Math.exp(h), S = m * m + g * g > Ur ? Math.atan2(g, m) : Math.atan2(E[M], b[M]);
  return { s: v, theta: S };
}
function le(e, t, r, n = $r, o) {
  const i = Re(t, o), s = i.mx + 1, u = i.my + 1, f = new Float64Array(s * u), l = new Float64Array(s * u), x = new Float64Array(s * u), p = new Uint8Array(s * u), y = n * Math.min(i.dx, i.dy);
  for (let w = 0; w < u; w++)
    for (let b = 0; b < s; b++) {
      const E = [i.x0 + b * i.dx, i.y0 + w * i.dy], M = Ye(e, E, y, r), a = w * s + b;
      M && M.s > 0 && Number.isFinite(M.s) && (f[a] = Math.log(M.s), l[a] = Math.cos(M.theta), x[a] = Math.sin(M.theta), p[a] = 1);
    }
  const _ = [];
  for (let w = 0; w < p.length; w++) p[w] && _.push(w);
  if (_.length === 0)
    f.fill(0), l.fill(1), x.fill(0);
  else
    for (let w = 0; w < u; w++)
      for (let b = 0; b < s; b++) {
        const E = w * s + b;
        if (p[E]) continue;
        let M = _[0], a = 1 / 0;
        for (const d of _) {
          const c = d % s, h = (d - c) / s, m = (c - b) * (c - b) + (h - w) * (h - w);
          m < a && (a = m, M = d);
        }
        f[E] = f[M], l[E] = l[M], x[E] = x[M];
      }
  return { nx: s, ny: u, x0: i.x0, y0: i.y0, dx: i.dx, dy: i.dy, ls: f, cs: l, sn: x };
}
function Hr(e, t) {
  const r = [];
  for (let o = 0; o <= 8; o++) {
    const i = o / 8;
    r.push([t.minX + (t.maxX - t.minX) * i, t.minY]), r.push([t.minX + (t.maxX - t.minX) * i, t.maxY]), r.push([t.minX, t.minY + (t.maxY - t.minY) * i]), r.push([t.maxX, t.minY + (t.maxY - t.minY) * i]);
  }
  for (let o = 1; o <= 3; o++)
    for (let i = 1; i <= 3; i++)
      r.push([
        t.minX + (t.maxX - t.minX) * o / 4,
        t.minY + (t.maxY - t.minY) * i / 4
      ]);
  const n = [];
  for (const o of r) {
    const i = e.transform(o, !1, !0);
    Ct(i) && n.push(i);
  }
  if (!n.length)
    throw new Error("視点グリッドの地理側範囲を決められません（有効な標本点がありません）");
  return mt(n);
}
function Zr(e, t, r) {
  const n = r * e.nx + t;
  return { s: Math.exp(e.ls[n]), theta: Math.atan2(e.sn[n], e.cs[n]) };
}
function Jr(e) {
  return e.gcps?.length ? e.gcps.map((r) => r[0].slice(0, 2)) : e.surface.points?.map((r) => r[0].slice(0, 2)) ?? [];
}
function Kr(e) {
  return e.length < 3 ? null : pr(dt(e.map((t) => rt([t[0], t[1]]))));
}
function he(e, t) {
  return at(rt([e[0], e[1]]), t, { ignoreBoundary: !1 });
}
function Be(e) {
  const t = e.paperRect ?? Ae(e.surface), r = Re(t, e.nLong), n = e.strictness === "strict" ? void 0 : le(e.surface, t, !1, e.probeRadiusCells, e.nLong), o = e.strictness === "strict_error" ? void 0 : le(
    e.surface,
    Hr(e.surface, t),
    !0,
    e.probeRadiusCells,
    e.nLong
  );
  return { rect: t, spec: r, paper: n, merc: o };
}
function Qr(e, t, r) {
  if (t.strictness === "loose" || t.strictness === "strict_error")
    return e.paper ? ht(e.paper, r[0], r[1]) : null;
  const n = t.surface.transform(r, !1, !0);
  return !Ct(n) || !e.merc ? null : ht(e.merc, n[0], n[1]);
}
function Oe(e, t) {
  const r = [];
  for (let n = 0; n <= t.spec.nyInner; n++)
    for (let o = 0; o <= t.spec.nxInner; o++) {
      const i = wt + o, s = wt + n, u = [t.spec.x0 + i * t.spec.dx, t.spec.y0 + s * t.spec.dy];
      if (e.strictness === "loose" || e.strictness === "strict_error") {
        t.paper && r.push({ paper: u, ...Zr(t.paper, i, s) });
        continue;
      }
      const f = e.surface.transform(u, !1, !0);
      if (!Ct(f) || !t.merc) continue;
      const l = ht(t.merc, f[0], f[1]);
      l.s > 0 && Number.isFinite(l.s) && Number.isFinite(l.theta) && r.push({ paper: u, s: l.s, theta: l.theta });
    }
  return r;
}
function Ne(e, t, r) {
  const n = Kr(Jr(e)), o = e.regionPolygon, i = (l) => !(n && !he(l, n) || o && !he(l, o)), s = r.filter((l) => i(l.paper));
  if (s.length >= 9) return s;
  const u = mt(n ? n.geometry.coordinates[0] : o ? o.geometry.coordinates[0] : r.map((l) => l.paper)), f = [];
  for (let l = 0; l < 9; l++)
    for (let x = 0; x < 9; x++) {
      const p = [
        u.minX + (u.maxX - u.minX) * (l + 0.5) / 9,
        u.minY + (u.maxY - u.minY) * (x + 0.5) / 9
      ];
      if (!i(p)) continue;
      const y = Qr(t, e, p);
      y && y.s > 0 && Number.isFinite(y.s) && f.push({ paper: p, ...y });
    }
  return f.length ? f : s.length ? s : r;
}
function Le(e) {
  if (!e.length) throw new Error("視点係数の標本がありません");
  let t = 0, r = 0, n = 0;
  for (const i of e)
    t += Math.log(i.s), r += Math.cos(i.theta), n += Math.sin(i.theta);
  const o = e.length;
  return { s: Math.exp(t / o), theta: Math.atan2(n / o, r / o) };
}
function me(e) {
  return e.length ? e[Math.min(e.length - 1, Math.max(0, Math.ceil(0.95 * e.length) - 1))] : 0;
}
function tn(e, t) {
  const r = [], n = [];
  for (const o of e)
    r.push(Math.abs(Pe(o.theta - t.theta))), n.push(Math.abs(o.s / t.s - 1));
  return r.sort((o, i) => o - i), n.sort((o, i) => o - i), {
    maxRotationDiffRad: r[r.length - 1] ?? 0,
    p95RotationDiffRad: me(r),
    maxScaleRatioDiff: n[n.length - 1] ?? 0,
    p95ScaleRatioDiff: me(n),
    sampleCount: e.length
  };
}
function en(e) {
  const t = e.p95RotationDiffRad, r = e.p95ScaleRatioDiff;
  return t <= Gr * Math.PI / 180 && r <= Wr ? "constant" : "grid";
}
function rn(e) {
  const t = Be(e);
  return Ne(e, t, Oe(e, t));
}
class Dt {
  mode;
  strictness;
  paperGrid;
  mercGrid;
  constant;
  constructor(t, r) {
    this.mode = t, this.strictness = r;
  }
  static build(t) {
    const r = new Dt(t.mode, t.strictness), n = Be(t);
    if (t.mode === "constant") {
      const o = Ne(t, n, Oe(t, n));
      r.constant = Le(o);
    } else
      r.paperGrid = n.paper, r.mercGrid = n.merc;
    return r;
  }
  /**
   * 中心 1 点の (s, θ) を引く（§7.1）。
   * - constant: 全体の (s0, θ0)
   * - strict / Plan A: 両方向とも地理側グリッド
   * - loose: 順方向は紙側グリッド、逆方向は地理側グリッド
   * - strict_error: 紙側グリッドのみ（逆方向の例外は呼び出し側の逆変換が担う）
   */
  eval(t, r, n) {
    return this.mode === "constant" ? this.constant : this.strictness === "strict" ? ht(this.mercGrid, r[0], r[1]) : this.strictness === "loose" ? n ? ht(this.mercGrid, r[0], r[1]) : ht(this.paperGrid, t[0], t[1]) : ht(this.paperGrid, t[0], t[1]);
  }
}
function Ie(e, t, r, n, o) {
  Ee(t, r, () => {
    const i = n ?? e.bounds ?? (e.wh ? void 0 : e.points.map(([u]) => u)), s = e.stateFull;
    e.stateFull = !1;
    try {
      return Te(e.wh, e.xy, i).map((u) => {
        const f = o(u);
        if (f === !1) throw new Error("epsg と proj4 の照合点を三角網で変換できません");
        return f;
      });
    } finally {
      e.stateFull = s;
    }
  });
}
class nn extends q {
  constructor(t, r, n) {
    super(), this.crs = r, this.projectionEngine = n, this.layerBounds = t.bounds, this.setCompiled(t.compiled);
  }
  crs;
  projectionEngine;
  layerBounds;
  validateCompiledProjection() {
    Ie(
      this,
      this.crs,
      this.projectionEngine,
      this.layerBounds,
      (t) => super.transform(t, !1, !0)
    ), this.stateTriangle = void 0;
  }
  transform(t, r, n) {
    if (r) {
      const i = Ce(t, this.crs, this.projectionEngine);
      return i === !1 ? !1 : super.transform(i, r, n);
    }
    const o = super.transform(t, r, n);
    return o === !1 ? !1 : Se(o, this.crs, this.projectionEngine);
  }
}
const gt = 256;
function kt(e) {
  if (e.kind === "worldFile") return new Fr(e);
  if ("crs" in e && e.crs === null) throw new Error("三角網の層の CRS は null にできません");
  const t = e.crs, r = e.projectionEngine ?? st;
  if (t !== void 0 && t.epsg !== 3857) return new nn(e, t, r);
  const n = new q();
  return n.setCompiled(e.compiled), t !== void 0 && Ie(n, t, r, e.bounds, (o) => n.transform(o, !1, !0)), n;
}
class un {
  mainTin = null;
  subTins = [];
  _maxxy = 0;
  /** 視点変換モード（地図全体で共通。未指定は "grid"） */
  _viewpointMode = "grid";
  /** 層ごとの ViewpointField 遅延構築スロット（§2.3。読み込み時には作らない） */
  _fields = [];
  _layerMetas = [];
  // ─── 初期化 ────────────────────────────────────────────────────────────────
  /**
   * 地図データ（コンパイル済み TIN + sub_maps）をロードする
   *
   * @param mapData - メイン TIN と sub_maps の情報
   */
  setMapData(t) {
    this._fields = [], this._layerMetas = [];
    const r = new q();
    if (r.setCompiled(t.compiled), this.mainTin = r, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * gt;
    else if (t.compiled.wh) {
      const o = Math.max(t.compiled.wh[0], t.compiled.wh[1]), i = Math.ceil(Math.log2(o / gt));
      this._maxxy = Math.pow(2, i) * gt;
    }
    this.subTins = [];
    const n = [
      { strictness: vt(r, yt(t.compiled)) }
    ];
    if (t.sub_maps)
      for (const o of t.sub_maps) {
        const i = new q();
        i.setCompiled(o.compiled);
        const s = o.bounds ?? o.compiled.bounds;
        if (!s) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const u = [...s, s[0]], f = u.map((x) => {
          const p = i.transform(x, !1);
          if (!p) throw new Error("Failed to transform sub-map bounds to mercator");
          return p;
        }), l = lt([u]);
        this.subTins.push({
          tin: i,
          priority: o.priority,
          importance: o.importance,
          xyBounds: l,
          mercBounds: lt([f])
        }), n.push({
          strictness: vt(i, yt(o.compiled)),
          rectOverride: s,
          regionPolygon: l
        });
      }
    this._layerMetas = n, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this._fields = [], this._layerMetas = [];
    const r = kt(t.main);
    t.main.priority !== void 0 && (r.priority = t.main.priority), t.main.importance !== void 0 && (r.importance = t.main.importance);
    const n = t.main.kind === "tin" ? t.main.compiled.wh : r.wh;
    let o = this._maxxy;
    if (t.maxZoom !== void 0)
      o = Math.pow(2, t.maxZoom) * gt;
    else if (n) {
      const u = Math.max(n[0], n[1]), f = Math.ceil(Math.log2(u / gt));
      o = Math.pow(2, f) * gt;
    }
    const i = [], s = [
      {
        strictness: vt(
          r,
          t.main.kind === "tin" ? yt(t.main.compiled) : void 0
        )
      }
    ];
    for (const u of t.sub_maps ?? []) {
      const f = kt(u), l = u.bounds ?? (u.kind === "tin" ? u.compiled.bounds : void 0);
      if (!l) throw new Error("副層には bounds または compiled.bounds が必要です");
      const x = [...l, l[0]], p = x.map((_) => {
        const w = f.transform(_, !1);
        if (!w) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return w;
      }), y = lt([x]);
      i.push({
        tin: f,
        priority: u.priority ?? 0,
        importance: u.importance ?? 0,
        xyBounds: y,
        mercBounds: lt([p])
      }), s.push({
        strictness: vt(
          f,
          u.kind === "tin" ? yt(u.compiled) : void 0
        ),
        rectOverride: l,
        regionPolygon: y
      });
    }
    this.mainTin = r, this.subTins = i, this._maxxy = o, this._layerMetas = s, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
  }
  /** 読み込み時の地図全体の視点変換モード（未指定は "grid"） */
  get viewpointMode() {
    return this._viewpointMode;
  }
  // ─── 処理2: submap TIN 選択付き変換 ───────────────────────────────────────
  /**
   * ピクセル座標 → メルカトル座標（最適レイヤー選択）
   *
   * @param xy - ピクセル座標 [x, y]
   * @returns メルカトル座標、または範囲外の場合は false
   */
  xy2Merc(t) {
    const r = this.xy2MercWithLayer(t);
    return r ? r[1] : !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（最適レイヤー選択）
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns ピクセル座標、または範囲外の場合は false
   */
  merc2Xy(t) {
    const r = this.merc2XyWithLayer(t), n = r[0] || r[1];
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
    const r = this._getTinsSortedByPriority();
    for (let n = 0; n < r.length; n++) {
      const { index: o, isMain: i } = r[n];
      if (i || at(rt(t), this.subTins[o - 1].xyBounds)) {
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
   * 現在は MaplatCore の仕様に合わせ、最大2レイヤーまで返す。
   * 3レイヤー以上返したい場合は、下記の .slice(0, 2) および .filter(i < 2) の
   * 上限値を増やすか、引数で上限を指定できるようにすること。
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns 最大2要素の配列。各要素は [レイヤーインデックス, ピクセル座標] または undefined
   */
  merc2XyWithLayer(t) {
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: u, isMain: f }) => {
      const l = this._transformByIndex(t, s, !0);
      return l === !1 ? [u, s] : f || at(rt(l), this.subTins[s - 1].xyBounds) ? [u, s, l] : [u, s];
    }).sort((s, u) => {
      const f = s[0].priority ?? 0, l = u[0].priority ?? 0;
      return f < l ? 1 : -1;
    }).reduce(
      (s, u, f, l) => {
        const x = u[0], p = u[1], y = u[2];
        if (!y) return s;
        for (let _ = 0; _ < f; _++) {
          const w = l[_][1], b = w === 0;
          if (l[_][2] && (b || at(rt(y), this.subTins[w - 1].xyBounds)))
            if (s.length) {
              const E = !s[0], M = E ? s[1][2] : s[0][2], a = x.importance ?? 0, d = M.importance ?? 0;
              return E ? a < d ? s : [void 0, [p, y, x]] : [...s.filter(
                (m) => m !== void 0
              ), [p, y, x]].sort(
                (m, g) => (m[2].importance ?? 0) < (g[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[p, y, x]];
        }
        return !s.length || !s[0] ? [[p, y, x]] : (s.push([p, y, x]), s.sort((_, w) => {
          const b = _[2].importance ?? 0, E = w[2].importance ?? 0;
          return b < E ? 1 : -1;
        }).filter((_, w) => w < 2));
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
  merc2XyVisibleLayers(t) {
    this._assertMapData();
    const r = this._getAllTinsWithIndex(), n = (f) => (f === 0 ? this.mainTin?.priority : this.subTins[f - 1].priority) ?? 0, o = (f) => (f === 0 ? this.mainTin?.importance : this.subTins[f - 1].importance) ?? 0, i = (f, l) => f === 0 || at(rt(l), this.subTins[f - 1].xyBounds), s = [];
    for (const { index: f } of r) {
      const l = this._transformByIndex(t, f, !0);
      l !== !1 && i(f, l) && s.push({ index: f, xy: l });
    }
    const u = (f) => r.some(
      ({ index: l }) => l !== 0 && l !== f.index && (n(l) > n(f.index) || f.index === 0 && n(0) === 0 && n(l) === 0) && i(l, f.xy)
    );
    return s.filter((f) => !u(f)).sort((f, l) => o(l.index) - o(f.index) || n(l.index) - n(f.index) || f.index - l.index).map((f) => [f.index, f.xy]);
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
    const r = this.merc2XyWithLayer(t[0]);
    let n = !1;
    return r.map((o, i) => {
      if (!o) {
        n = !0;
        return;
      }
      const s = o[0], u = o[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(u)] : t.map((l, x) => x === 0 ? u : this._transformByIndex(l, s, !0)).map((l) => this.xy2SysCoordInternal(l));
    });
  }
  // ─── 処理3: ビューポート変換 ───────────────────────────────────────────────
  /**
   * ビューポート → TIN 適用後メルカトル5点
   * histmap_tin.ts viewpoint2MercsAsync() の同期版
   *
   * 中心と ViewpointField から理想相似 5 点をエンコードする（§7.1）。
   * 周囲 4 点の幾何は中心と同じ層の格子からだけ決める。
   *
   * @param viewpoint - ビューポート（center, zoom, rotation）
   * @param size - 画面サイズ [width, height]
   * @param layerIndex - 層番号（省略時は従来の層選択。指定時は範囲判定なしでその層を使い、範囲外は格子端へ clamp）
   * @returns TIN 変換後のメルカトル5点
   */
  viewpoint2Mercs(t, r, n) {
    this._assertMapData(), this._assertMaxxy();
    const o = ce(t.center, this._maxxy);
    let i, s;
    if (n !== void 0) {
      this._assertLayerIndex(n, "viewpoint2Mercs");
      const _ = this.getSurfaceTransform(n).transform(o, !1, !0);
      if (!_)
        throw new Error(`viewpoint2Mercs: layer ${n} transform failed`);
      i = n, s = _;
    } else {
      const y = this.xy2MercWithLayer(o);
      if (!y) throw new Error("viewpoint2Mercs: center point is out of bounds");
      [i, s] = y;
    }
    const { s: u, theta: f } = this._evalViewpointCoefficients(i, o, s, !1), l = 2 * W / this._maxxy, x = t.zoom + Math.log2(l / u), p = t.rotation + f;
    return se(s, x, p, r);
  }
  /**
   * TIN 適用後メルカトル5点 → ビューポート
   * histmap_tin.ts mercs2ViewpointAsync() の同期版
   *
   * 5 点を理想相似としてデコードし、中心と ViewpointField から復元する（§7.1）。
   *
   * @param mercs - TIN 適用後メルカトル5点
   * @param size - 画面サイズ [width, height]
   * @param layerIndex - 層番号（省略時は従来の層選択。指定時は範囲判定なしでその層を使い、範囲外は格子端へ clamp）
   * @returns ビューポート（center, zoom, rotation）
   */
  mercs2Viewpoint(t, r, n) {
    this._assertMapData(), this._assertMaxxy();
    const o = ae(t, r);
    let i, s;
    if (n !== void 0) {
      this._assertLayerIndex(n, "mercs2Viewpoint");
      const p = this.getSurfaceTransform(n).transform(o.center, !0, !0);
      if (!p)
        throw new Error(`mercs2Viewpoint: layer ${n} transform failed`);
      i = n, s = p;
    } else {
      const x = this.merc2XyWithLayer(o.center), p = x[0] || x[1];
      if (!p) throw new Error("mercs2Viewpoint: center point is out of bounds");
      [i, s] = p;
    }
    const { s: u, theta: f } = this._evalViewpointCoefficients(i, s, o.center, !0), l = 2 * W / this._maxxy;
    return {
      center: Lt(s, this._maxxy),
      zoom: o.zoom - Math.log2(l / u),
      rotation: Pe(o.rotation - f)
    };
  }
  /**
   * 層番号を指定して、その層の視点係数 (s, θ) を引く公開 API（§7.1 補助メソッド・M-5）。
   * デバッグ・単体試験・`setupMapParameter` 等から、層を 1 つに固定して
   * 中心 1 点の縮尺・向きを問い合わせるために使う。
   *
   * @param layerIndex - 0 = 本図、1 以上 = sub_maps[layerIndex - 1]。範囲外番号・非整数は例外
   * @param coord - 問い合わせ座標（direction が "xy2Merc" なら紙座標、"merc2Xy" ならメルカトル座標）
   * @param direction - "xy2Merc"（既定）= 紙 → 地理の係数参照、"merc2Xy" = 地理 → 紙
   * @returns 視点係数（s: 縮尺比 [3857 単位 / 地図画素]、theta: 局所回転角 [rad]）
   */
  getViewpointCoefficients(t, r, n = "xy2Merc") {
    this._assertMapData(), this._assertLayerIndex(t, "getViewpointCoefficients");
    const o = this.getSurfaceTransform(t);
    if (n === "xy2Merc") {
      const s = o.transform(r, !1, !0);
      if (!s) throw new Error("getViewpointCoefficients: transform failed");
      return this._evalViewpointCoefficients(t, r, s, !1);
    }
    const i = o.transform(r, !0, !0);
    if (!i) throw new Error("getViewpointCoefficients: transform failed");
    return this._evalViewpointCoefficients(t, i, r, !0);
  }
  /**
   * Core の既定ズーム（mercZoom が無い地図）のための口（§7.2 OQ-3）。
   * モード 2 では格子を作らずに紙の中心で測る: その層の面で紙の xy の十字 4 点
   * （半径 radiusPx、ignoreBounds = true）を測り、§1.2 の式で (s, theta) を返すだけ。
   * 視点グリッド（ViewpointField）は作らない（既存の probeCoefficients を使う）。
   *
   * @param layerIndex - 0 = 本図、1 以上 = sub_maps[layerIndex - 1]。範囲外番号・非整数は例外
   * @param xy - 紙座標（十字 4 点の中心）
   * @param radiusPx - 十字 4 点の半径（紙の画素単位。Core の既定値は 150）
   * @returns 視点係数（s: 縮尺比 [3857 単位 / 地図画素]、theta: 局所回転角 [rad]）
   */
  probeViewpointCoefficients(t, r, n) {
    this._assertMapData(), this._assertLayerIndex(t, "probeViewpointCoefficients");
    const o = this.getSurfaceTransform(t), i = Ye(o, r, n, !1);
    if (!i)
      throw new Error(
        `probeViewpointCoefficients: layer ${t} probe failed at [${r[0]}, ${r[1]}]`
      );
    return i;
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, r) {
    return Xe(t, r);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, r, n, o) {
    return se(t, r, n, o);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, r) {
    return ae(t, r);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, r) {
    return Lt(t, r);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, r) {
    return ce(t, r);
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
  /** 層番号の明示指定の検査（範囲外番号・負数・非整数は例外、§4.2 2.） */
  _assertLayerIndex(t, r) {
    if (!Number.isInteger(t) || t < 0 || t >= this.layerCount)
      throw new Error(`${r}: invalid layerIndex ${t}`);
  }
  /** 層の ViewpointField を遅延構築して返す（§2.3。読み込み時には作らない） */
  _fieldFor(t) {
    const r = this._fields[t];
    if (r) return r;
    const n = this.getSurfaceTransform(t);
    if (!n) throw new Error(`invalid layerIndex ${t}`);
    const o = this._layerMetas[t], i = Dt.build({
      surface: n,
      mode: this._viewpointMode === "constant" ? "constant" : "grid",
      strictness: o.strictness,
      paperRect: o.rectOverride ? Ae(n, o.rectOverride) : void 0,
      regionPolygon: o.regionPolygon
    });
    return this._fields[t] = i, i;
  }
  /** 中心 1 点の視点係数を層の ViewpointField から引く */
  _evalViewpointCoefficients(t, r, n, o) {
    return this._fieldFor(t).eval(r, n, o);
  }
  /**
   * レイヤーインデックスに対応する Transform インスタンスを返す（三角網描画などの用途）
   *
   * @param idx - 0 = メイン TIN、1以上 = sub_maps[idx-1]
   * @returns 対応する Transform、または範囲外の場合は null
   */
  getLayerTransform(t) {
    if (t === 0) return this.mainTin instanceof q ? this.mainTin : null;
    const r = this.subTins[t - 1];
    return r?.tin instanceof q ? r.tin : null;
  }
  /**
   * レイヤーインデックスに対応する変換面を返す。
   * 返した面を外で差し替えたら、地図を読み込み直すこと（視点の格子は作り直されない）。
   */
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
    return this._getAllTinsWithIndex().sort((r, n) => {
      const o = r.tin.priority ?? 0, i = n.tin.priority ?? 0;
      return o < i ? 1 : -1;
    });
  }
  /** メイン TIN + 全 sub TIN を index 付きで返す */
  _getAllTinsWithIndex() {
    const t = [
      { index: 0, tin: this.mainTin, isMain: !0 }
    ];
    return this.subTins.forEach((r, n) => {
      r.tin.priority = r.priority, r.tin.importance = r.importance, t.push({ index: n + 1, tin: r.tin, isMain: !1 });
    }), t;
  }
  /**
   * 指定レイヤーインデックスで TIN 変換を実行する
   * index 0 → mainTin, index 1..n → subTins[index-1]
   */
  _transformByIndex(t, r, n) {
    if (r === 0)
      return this.mainTin.transform(t, n);
    const o = this.subTins[r - 1];
    return o ? o.tin.transform(t, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return Lt(t, this._maxxy);
  }
}
function on(e) {
  if (!e || e.length < 3) return;
  const t = e.map((o) => [o[0], o[1]]), r = t[0], n = t[t.length - 1];
  (r[0] !== n[0] || r[1] !== n[1]) && t.push([r[0], r[1]]);
  try {
    return lt([t]);
  } catch {
    return;
  }
}
function ln(e, t) {
  const r = kt({
    ...e,
    projectionEngine: t?.projectionEngine ?? e.projectionEngine
  }), n = e.kind === "tin" ? vt(r, yt(e.compiled)) : vt(r), o = e.bounds ?? (e.kind === "tin" ? e.compiled.bounds : void 0), i = {
    surface: r,
    strictness: n,
    regionPolygon: on(o),
    gcps: t?.gcps
  }, s = rn(i), u = Le(s), f = tn(s, u);
  return {
    recommended: en(f),
    maxRotationDiffDeg: f.maxRotationDiffRad * 180 / Math.PI,
    p95RotationDiffDeg: f.p95RotationDiffRad * 180 / Math.PI,
    maxScaleRatioDiff: f.maxScaleRatioDiff,
    p95ScaleRatioDiff: f.p95ScaleRatioDiff,
    sampleCount: f.sampleCount
  };
}
export {
  Or as MERC_CROSSMATRIX,
  W as MERC_MAX,
  un as MapTransform,
  q as Transform,
  Fr as WorldFileSurface,
  st as builtinProjectionEngine,
  an as counterTri,
  fn as createProj4ProjectionEngine,
  Me as crsToWorldFilePixel,
  cn as format_version,
  se as mercViewpoint2Mercs,
  ae as mercs2MercViewpoint,
  _r as normalizeEdges,
  ln as recommendViewpointMode,
  jr as rotateMatrix,
  sn as rotateVerticesTriangle,
  ce as sysCoord2Xy,
  yr as transformArr,
  we as validateWorldFile,
  ve as worldFileToCrs,
  Lt as xy2SysCoord,
  Xe as zoom2Radius
};
