function pe(e, t, r = {}) {
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
  if (!Ut(e[0]) || !Ut(e[1]))
    throw new Error("coordinates must contain numbers");
  return pe({
    type: "Point",
    coordinates: e
  }, t, r);
}
function lt(e, t, r = {}) {
  for (const i of e) {
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
  return pe({
    type: "Polygon",
    coordinates: e
  }, t, r);
}
function dt(e, t = {}) {
  const r = { type: "FeatureCollection" };
  return t.id && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.features = e, r;
}
function Ut(e) {
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
function $t(e) {
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
function Ge(e) {
  return e.type === "Feature" ? e.geometry : e;
}
function ge(e, t, r) {
  if (e !== null)
    for (var n, i, o, s, c, u, l, w = 0, p = 0, g, x = e.type, M = x === "FeatureCollection", b = x === "Feature", E = M ? e.features.length : 1, _ = 0; _ < E; _++) {
      l = M ? (
        // @ts-expect-error: Known type conflict
        e.features[_].geometry
      ) : b ? (
        // @ts-expect-error: Known type conflict
        e.geometry
      ) : e, g = l ? l.type === "GeometryCollection" : !1, c = g ? l.geometries.length : 1;
      for (var a = 0; a < c; a++) {
        var m = 0, f = 0;
        if (s = g ? l.geometries[a] : l, s !== null) {
          u = s.coordinates;
          var h = s.type;
          switch (w = 0, h) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                t(
                  u,
                  p,
                  _,
                  m,
                  f
                ) === !1
              )
                return !1;
              p++, m++;
              break;
            case "LineString":
            case "MultiPoint":
              for (n = 0; n < u.length; n++) {
                if (
                  // @ts-expect-error: Known type conflict
                  t(
                    u[n],
                    p,
                    _,
                    m,
                    f
                  ) === !1
                )
                  return !1;
                p++, h === "MultiPoint" && m++;
              }
              h === "LineString" && m++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < u.length; n++) {
                for (i = 0; i < u[n].length - w; i++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    t(
                      u[n][i],
                      p,
                      _,
                      m,
                      f
                    ) === !1
                  )
                    return !1;
                  p++;
                }
                h === "MultiLineString" && m++, h === "Polygon" && f++;
              }
              h === "Polygon" && m++;
              break;
            case "MultiPolygon":
              for (n = 0; n < u.length; n++) {
                for (f = 0, i = 0; i < u[n].length; i++) {
                  for (o = 0; o < u[n][i].length - w; o++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      t(
                        u[n][i][o],
                        p,
                        _,
                        m,
                        f
                      ) === !1
                    )
                      return !1;
                    p++;
                  }
                  f++;
                }
                m++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < s.geometries.length; n++)
                if (
                  // @ts-expect-error: Known type conflict
                  ge(s.geometries[n], t) === !1
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
const ct = 11102230246251565e-32, z = 134217729, We = (3 + 8 * ct) * ct;
function Yt(e, t, r, n, i) {
  let o, s, c, u, l = t[0], w = n[0], p = 0, g = 0;
  w > l == w > -l ? (o = l, l = t[++p]) : (o = w, w = n[++g]);
  let x = 0;
  if (p < e && g < r)
    for (w > l == w > -l ? (s = l + o, c = o - (s - l), l = t[++p]) : (s = w + o, c = o - (s - w), w = n[++g]), o = s, c !== 0 && (i[x++] = c); p < e && g < r; )
      w > l == w > -l ? (s = o + l, u = s - o, c = o - (s - u) + (l - u), l = t[++p]) : (s = o + w, u = s - o, c = o - (s - u) + (w - u), w = n[++g]), o = s, c !== 0 && (i[x++] = c);
  for (; p < e; )
    s = o + l, u = s - o, c = o - (s - u) + (l - u), l = t[++p], o = s, c !== 0 && (i[x++] = c);
  for (; g < r; )
    s = o + w, u = s - o, c = o - (s - u) + (w - u), w = n[++g], o = s, c !== 0 && (i[x++] = c);
  return (o !== 0 || x === 0) && (i[x++] = o), x;
}
function Ue(e, t) {
  let r = t[0];
  for (let n = 1; n < e; n++) r += t[n];
  return r;
}
function St(e) {
  return new Float64Array(e);
}
const $e = (3 + 16 * ct) * ct, qe = (2 + 12 * ct) * ct, ze = (9 + 64 * ct) * ct * ct, pt = St(4), qt = St(8), zt = St(12), Ht = St(16), Z = St(4);
function He(e, t, r, n, i, o, s) {
  let c, u, l, w, p, g, x, M, b, E, _, a, m, f, h, d, y, v;
  const S = e - i, T = r - i, C = t - o, X = n - o;
  f = S * X, g = z * S, x = g - (g - S), M = S - x, g = z * X, b = g - (g - X), E = X - b, h = M * E - (f - x * b - M * b - x * E), d = C * T, g = z * C, x = g - (g - C), M = C - x, g = z * T, b = g - (g - T), E = T - b, y = M * E - (d - x * b - M * b - x * E), _ = h - y, p = h - _, pt[0] = h - (_ + p) + (p - y), a = f + _, p = a - f, m = f - (a - p) + (_ - p), _ = m - d, p = m - _, pt[1] = m - (_ + p) + (p - d), v = a + _, p = v - a, pt[2] = a - (v - p) + (_ - p), pt[3] = v;
  let A = Ue(4, pt), O = qe * s;
  if (A >= O || -A >= O || (p = e - S, c = e - (S + p) + (p - i), p = r - T, l = r - (T + p) + (p - i), p = t - C, u = t - (C + p) + (p - o), p = n - X, w = n - (X + p) + (p - o), c === 0 && u === 0 && l === 0 && w === 0) || (O = ze * s + We * Math.abs(A), A += S * w + X * c - (C * l + T * u), A >= O || -A >= O)) return A;
  f = c * X, g = z * c, x = g - (g - c), M = c - x, g = z * X, b = g - (g - X), E = X - b, h = M * E - (f - x * b - M * b - x * E), d = u * T, g = z * u, x = g - (g - u), M = u - x, g = z * T, b = g - (g - T), E = T - b, y = M * E - (d - x * b - M * b - x * E), _ = h - y, p = h - _, Z[0] = h - (_ + p) + (p - y), a = f + _, p = a - f, m = f - (a - p) + (_ - p), _ = m - d, p = m - _, Z[1] = m - (_ + p) + (p - d), v = a + _, p = v - a, Z[2] = a - (v - p) + (_ - p), Z[3] = v;
  const $ = Yt(4, pt, 4, Z, qt);
  f = S * w, g = z * S, x = g - (g - S), M = S - x, g = z * w, b = g - (g - w), E = w - b, h = M * E - (f - x * b - M * b - x * E), d = C * l, g = z * C, x = g - (g - C), M = C - x, g = z * l, b = g - (g - l), E = l - b, y = M * E - (d - x * b - M * b - x * E), _ = h - y, p = h - _, Z[0] = h - (_ + p) + (p - y), a = f + _, p = a - f, m = f - (a - p) + (_ - p), _ = m - d, p = m - _, Z[1] = m - (_ + p) + (p - d), v = a + _, p = v - a, Z[2] = a - (v - p) + (_ - p), Z[3] = v;
  const B = Yt($, qt, 4, Z, zt);
  f = c * w, g = z * c, x = g - (g - c), M = c - x, g = z * w, b = g - (g - w), E = w - b, h = M * E - (f - x * b - M * b - x * E), d = u * l, g = z * u, x = g - (g - u), M = u - x, g = z * l, b = g - (g - l), E = l - b, y = M * E - (d - x * b - M * b - x * E), _ = h - y, p = h - _, Z[0] = h - (_ + p) + (p - y), a = f + _, p = a - f, m = f - (a - p) + (_ - p), _ = m - d, p = m - _, Z[1] = m - (_ + p) + (p - d), v = a + _, p = v - a, Z[2] = a - (v - p) + (_ - p), Z[3] = v;
  const I = Yt(B, zt, 4, Z, Ht);
  return Ht[I - 1];
}
function Ze(e, t, r, n, i, o) {
  const s = (t - o) * (r - i), c = (e - i) * (n - o), u = s - c, l = Math.abs(s + c);
  return Math.abs(u) >= $e * l ? u : -He(e, t, r, n, i, o, l);
}
function Je(e, t) {
  var r, n, i = 0, o, s, c, u, l, w, p, g = e[0], x = e[1], M = t.length;
  for (r = 0; r < M; r++) {
    n = 0;
    var b = t[r], E = b.length - 1;
    if (w = b[0], w[0] !== b[E][0] && w[1] !== b[E][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = w[0] - g, c = w[1] - x, n; n < E; n++) {
      if (p = b[n + 1], u = p[0] - g, l = p[1] - x, c === 0 && l === 0) {
        if (u <= 0 && s >= 0 || s <= 0 && u >= 0)
          return 0;
      } else if (l >= 0 && c <= 0 || l <= 0 && c >= 0) {
        if (o = Ze(s, u, c, l, 0, 0), o === 0)
          return 0;
        (o > 0 && l > 0 && c <= 0 || o < 0 && l <= 0 && c > 0) && i++;
      }
      w = p, c = l, s = u;
    }
  }
  return i % 2 !== 0;
}
function at(e, t, r = {}) {
  if (!e)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = Ve(e), i = Ge(t), o = i.type, s = t.bbox;
  let c = i.coordinates;
  if (s && Ke(n, s) === !1)
    return !1;
  o === "Polygon" && (c = [c]);
  for (var u = 0; u < c.length; ++u) {
    const l = Je(n, c[u]);
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
    const { data: r, compare: n } = this, i = r[t];
    for (; t > 0; ) {
      const o = t - 1 >> 1, s = r[o];
      if (n(i, s) >= 0) break;
      r[t] = s, t = o;
    }
    r[t] = i;
  }
  _down(t) {
    const { data: r, compare: n } = this, i = this.length >> 1, o = r[t];
    for (; t < i; ) {
      let s = (t << 1) + 1, c = r[s];
      const u = s + 1;
      if (u < this.length && n(r[u], c) < 0 && (s = u, c = r[u]), n(c, o) >= 0) break;
      r[t] = c, t = s;
    }
    r[t] = o;
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
      var i = !1;
      try {
        i = this instanceof n;
      } catch {
      }
      return i ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    r.prototype = t.prototype;
  } else r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(e).forEach(function(n) {
    var i = Object.getOwnPropertyDescriptor(e, n);
    Object.defineProperty(r, n, i.get ? i : {
      enumerable: !0,
      get: function() {
        return e[n];
      }
    });
  }), r;
}
var Ct = { exports: {} }, Pt = { exports: {} }, ir = Pt.exports, Zt;
function or() {
  return Zt || (Zt = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(ir, function() {
      function r(a, m, f, h, d) {
        (function y(v, S, T, C, X) {
          for (; C > T; ) {
            if (C - T > 600) {
              var A = C - T + 1, O = S - T + 1, $ = Math.log(A), B = 0.5 * Math.exp(2 * $ / 3), I = 0.5 * Math.sqrt($ * B * (A - B) / A) * (O - A / 2 < 0 ? -1 : 1), L = Math.max(T, Math.floor(S - O * B / A + I)), D = Math.min(C, Math.floor(S + (A - O) * B / A + I));
              y(v, S, L, D, X);
            }
            var P = v[S], R = T, Y = C;
            for (n(v, T, S), X(v[C], P) > 0 && n(v, T, C); R < Y; ) {
              for (n(v, R, Y), R++, Y--; X(v[R], P) < 0; ) R++;
              for (; X(v[Y], P) > 0; ) Y--;
            }
            X(v[T], P) === 0 ? n(v, T, Y) : n(v, ++Y, C), Y <= S && (T = Y + 1), S <= Y && (C = Y - 1);
          }
        })(a, m, f || 0, h || a.length - 1, d || i);
      }
      function n(a, m, f) {
        var h = a[m];
        a[m] = a[f], a[f] = h;
      }
      function i(a, m) {
        return a < m ? -1 : a > m ? 1 : 0;
      }
      var o = function(a) {
        a === void 0 && (a = 9), this._maxEntries = Math.max(4, a), this._minEntries = Math.max(2, Math.ceil(0.4 * this._maxEntries)), this.clear();
      };
      function s(a, m, f) {
        if (!f) return m.indexOf(a);
        for (var h = 0; h < m.length; h++) if (f(a, m[h])) return h;
        return -1;
      }
      function c(a, m) {
        u(a, 0, a.children.length, m, a);
      }
      function u(a, m, f, h, d) {
        d || (d = E(null)), d.minX = 1 / 0, d.minY = 1 / 0, d.maxX = -1 / 0, d.maxY = -1 / 0;
        for (var y = m; y < f; y++) {
          var v = a.children[y];
          l(d, a.leaf ? h(v) : v);
        }
        return d;
      }
      function l(a, m) {
        return a.minX = Math.min(a.minX, m.minX), a.minY = Math.min(a.minY, m.minY), a.maxX = Math.max(a.maxX, m.maxX), a.maxY = Math.max(a.maxY, m.maxY), a;
      }
      function w(a, m) {
        return a.minX - m.minX;
      }
      function p(a, m) {
        return a.minY - m.minY;
      }
      function g(a) {
        return (a.maxX - a.minX) * (a.maxY - a.minY);
      }
      function x(a) {
        return a.maxX - a.minX + (a.maxY - a.minY);
      }
      function M(a, m) {
        return a.minX <= m.minX && a.minY <= m.minY && m.maxX <= a.maxX && m.maxY <= a.maxY;
      }
      function b(a, m) {
        return m.minX <= a.maxX && m.minY <= a.maxY && m.maxX >= a.minX && m.maxY >= a.minY;
      }
      function E(a) {
        return { children: a, height: 1, leaf: !0, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 };
      }
      function _(a, m, f, h, d) {
        for (var y = [m, f]; y.length; ) if (!((f = y.pop()) - (m = y.pop()) <= h)) {
          var v = m + Math.ceil((f - m) / h / 2) * h;
          r(a, v, m, f, d), y.push(m, v, v, f);
        }
      }
      return o.prototype.all = function() {
        return this._all(this.data, []);
      }, o.prototype.search = function(a) {
        var m = this.data, f = [];
        if (!b(a, m)) return f;
        for (var h = this.toBBox, d = []; m; ) {
          for (var y = 0; y < m.children.length; y++) {
            var v = m.children[y], S = m.leaf ? h(v) : v;
            b(a, S) && (m.leaf ? f.push(v) : M(a, S) ? this._all(v, f) : d.push(v));
          }
          m = d.pop();
        }
        return f;
      }, o.prototype.collides = function(a) {
        var m = this.data;
        if (!b(a, m)) return !1;
        for (var f = []; m; ) {
          for (var h = 0; h < m.children.length; h++) {
            var d = m.children[h], y = m.leaf ? this.toBBox(d) : d;
            if (b(a, y)) {
              if (m.leaf || M(a, y)) return !0;
              f.push(d);
            }
          }
          m = f.pop();
        }
        return !1;
      }, o.prototype.load = function(a) {
        if (!a || !a.length) return this;
        if (a.length < this._minEntries) {
          for (var m = 0; m < a.length; m++) this.insert(a[m]);
          return this;
        }
        var f = this._build(a.slice(), 0, a.length - 1, 0);
        if (this.data.children.length) if (this.data.height === f.height) this._splitRoot(this.data, f);
        else {
          if (this.data.height < f.height) {
            var h = this.data;
            this.data = f, f = h;
          }
          this._insert(f, this.data.height - f.height - 1, !0);
        }
        else this.data = f;
        return this;
      }, o.prototype.insert = function(a) {
        return a && this._insert(a, this.data.height - 1), this;
      }, o.prototype.clear = function() {
        return this.data = E([]), this;
      }, o.prototype.remove = function(a, m) {
        if (!a) return this;
        for (var f, h, d, y = this.data, v = this.toBBox(a), S = [], T = []; y || S.length; ) {
          if (y || (y = S.pop(), h = S[S.length - 1], f = T.pop(), d = !0), y.leaf) {
            var C = s(a, y.children, m);
            if (C !== -1) return y.children.splice(C, 1), S.push(y), this._condense(S), this;
          }
          d || y.leaf || !M(y, v) ? h ? (f++, y = h.children[f], d = !1) : y = null : (S.push(y), T.push(f), f = 0, h = y, y = y.children[0]);
        }
        return this;
      }, o.prototype.toBBox = function(a) {
        return a;
      }, o.prototype.compareMinX = function(a, m) {
        return a.minX - m.minX;
      }, o.prototype.compareMinY = function(a, m) {
        return a.minY - m.minY;
      }, o.prototype.toJSON = function() {
        return this.data;
      }, o.prototype.fromJSON = function(a) {
        return this.data = a, this;
      }, o.prototype._all = function(a, m) {
        for (var f = []; a; ) a.leaf ? m.push.apply(m, a.children) : f.push.apply(f, a.children), a = f.pop();
        return m;
      }, o.prototype._build = function(a, m, f, h) {
        var d, y = f - m + 1, v = this._maxEntries;
        if (y <= v) return c(d = E(a.slice(m, f + 1)), this.toBBox), d;
        h || (h = Math.ceil(Math.log(y) / Math.log(v)), v = Math.ceil(y / Math.pow(v, h - 1))), (d = E([])).leaf = !1, d.height = h;
        var S = Math.ceil(y / v), T = S * Math.ceil(Math.sqrt(v));
        _(a, m, f, T, this.compareMinX);
        for (var C = m; C <= f; C += T) {
          var X = Math.min(C + T - 1, f);
          _(a, C, X, S, this.compareMinY);
          for (var A = C; A <= X; A += S) {
            var O = Math.min(A + S - 1, X);
            d.children.push(this._build(a, A, O, h - 1));
          }
        }
        return c(d, this.toBBox), d;
      }, o.prototype._chooseSubtree = function(a, m, f, h) {
        for (; h.push(m), !m.leaf && h.length - 1 !== f; ) {
          for (var d = 1 / 0, y = 1 / 0, v = void 0, S = 0; S < m.children.length; S++) {
            var T = m.children[S], C = g(T), X = (A = a, O = T, (Math.max(O.maxX, A.maxX) - Math.min(O.minX, A.minX)) * (Math.max(O.maxY, A.maxY) - Math.min(O.minY, A.minY)) - C);
            X < y ? (y = X, d = C < d ? C : d, v = T) : X === y && C < d && (d = C, v = T);
          }
          m = v || m.children[0];
        }
        var A, O;
        return m;
      }, o.prototype._insert = function(a, m, f) {
        var h = f ? a : this.toBBox(a), d = [], y = this._chooseSubtree(h, this.data, m, d);
        for (y.children.push(a), l(y, h); m >= 0 && d[m].children.length > this._maxEntries; ) this._split(d, m), m--;
        this._adjustParentBBoxes(h, d, m);
      }, o.prototype._split = function(a, m) {
        var f = a[m], h = f.children.length, d = this._minEntries;
        this._chooseSplitAxis(f, d, h);
        var y = this._chooseSplitIndex(f, d, h), v = E(f.children.splice(y, f.children.length - y));
        v.height = f.height, v.leaf = f.leaf, c(f, this.toBBox), c(v, this.toBBox), m ? a[m - 1].children.push(v) : this._splitRoot(f, v);
      }, o.prototype._splitRoot = function(a, m) {
        this.data = E([a, m]), this.data.height = a.height + 1, this.data.leaf = !1, c(this.data, this.toBBox);
      }, o.prototype._chooseSplitIndex = function(a, m, f) {
        for (var h, d, y, v, S, T, C, X = 1 / 0, A = 1 / 0, O = m; O <= f - m; O++) {
          var $ = u(a, 0, O, this.toBBox), B = u(a, O, f, this.toBBox), I = (d = $, y = B, v = void 0, S = void 0, T = void 0, C = void 0, v = Math.max(d.minX, y.minX), S = Math.max(d.minY, y.minY), T = Math.min(d.maxX, y.maxX), C = Math.min(d.maxY, y.maxY), Math.max(0, T - v) * Math.max(0, C - S)), L = g($) + g(B);
          I < X ? (X = I, h = O, A = L < A ? L : A) : I === X && L < A && (A = L, h = O);
        }
        return h || f - m;
      }, o.prototype._chooseSplitAxis = function(a, m, f) {
        var h = a.leaf ? this.compareMinX : w, d = a.leaf ? this.compareMinY : p;
        this._allDistMargin(a, m, f, h) < this._allDistMargin(a, m, f, d) && a.children.sort(h);
      }, o.prototype._allDistMargin = function(a, m, f, h) {
        a.children.sort(h);
        for (var d = this.toBBox, y = u(a, 0, m, d), v = u(a, f - m, f, d), S = x(y) + x(v), T = m; T < f - m; T++) {
          var C = a.children[T];
          l(y, a.leaf ? d(C) : C), S += x(y);
        }
        for (var X = f - m - 1; X >= m; X--) {
          var A = a.children[X];
          l(v, a.leaf ? d(A) : A), S += x(v);
        }
        return S;
      }, o.prototype._adjustParentBBoxes = function(a, m, f) {
        for (var h = f; h >= 0; h--) l(m[h], a);
      }, o.prototype._condense = function(a) {
        for (var m = a.length - 1, f = void 0; m >= 0; m--) a[m].children.length === 0 ? m > 0 ? (f = a[m - 1].children).splice(f.indexOf(a[m]), 1) : this.clear() : c(a[m], this.toBBox);
      }, o;
    });
  })(Pt)), Pt.exports;
}
const sr = /* @__PURE__ */ nr(er);
var _t = { exports: {} }, Bt, Jt;
function ar() {
  return Jt || (Jt = 1, Bt = function(t, r, n, i) {
    var o = t[0], s = t[1], c = !1;
    n === void 0 && (n = 0), i === void 0 && (i = r.length);
    for (var u = (i - n) / 2, l = 0, w = u - 1; l < u; w = l++) {
      var p = r[n + l * 2 + 0], g = r[n + l * 2 + 1], x = r[n + w * 2 + 0], M = r[n + w * 2 + 1], b = g > s != M > s && o < (x - p) * (s - g) / (M - g) + p;
      b && (c = !c);
    }
    return c;
  }), Bt;
}
var Ot, Kt;
function cr() {
  return Kt || (Kt = 1, Ot = function(t, r, n, i) {
    var o = t[0], s = t[1], c = !1;
    n === void 0 && (n = 0), i === void 0 && (i = r.length);
    for (var u = i - n, l = 0, w = u - 1; l < u; w = l++) {
      var p = r[l + n][0], g = r[l + n][1], x = r[w + n][0], M = r[w + n][1], b = g > s != M > s && o < (x - p) * (s - g) / (M - g) + p;
      b && (c = !c);
    }
    return c;
  }), Ot;
}
var Qt;
function fr() {
  if (Qt) return _t.exports;
  Qt = 1;
  var e = ar(), t = cr();
  return _t.exports = function(n, i, o, s) {
    return i.length > 0 && Array.isArray(i[0]) ? t(n, i, o, s) : e(n, i, o, s);
  }, _t.exports.nested = t, _t.exports.flat = e, _t.exports;
}
var bt = { exports: {} }, ur = bt.exports, te;
function lr() {
  return te || (te = 1, (function(e, t) {
    (function(r, n) {
      n(t);
    })(ur, function(r) {
      const i = 33306690738754706e-32;
      function o(b, E, _, a, m) {
        let f, h, d, y, v = E[0], S = a[0], T = 0, C = 0;
        S > v == S > -v ? (f = v, v = E[++T]) : (f = S, S = a[++C]);
        let X = 0;
        if (T < b && C < _) for (S > v == S > -v ? (d = f - ((h = v + f) - v), v = E[++T]) : (d = f - ((h = S + f) - S), S = a[++C]), f = h, d !== 0 && (m[X++] = d); T < b && C < _; ) S > v == S > -v ? (d = f - ((h = f + v) - (y = h - f)) + (v - y), v = E[++T]) : (d = f - ((h = f + S) - (y = h - f)) + (S - y), S = a[++C]), f = h, d !== 0 && (m[X++] = d);
        for (; T < b; ) d = f - ((h = f + v) - (y = h - f)) + (v - y), v = E[++T], f = h, d !== 0 && (m[X++] = d);
        for (; C < _; ) d = f - ((h = f + S) - (y = h - f)) + (S - y), S = a[++C], f = h, d !== 0 && (m[X++] = d);
        return f === 0 && X !== 0 || (m[X++] = f), X;
      }
      function s(b) {
        return new Float64Array(b);
      }
      const c = 33306690738754716e-32, u = 22204460492503146e-32, l = 11093356479670487e-47, w = s(4), p = s(8), g = s(12), x = s(16), M = s(4);
      r.orient2d = function(b, E, _, a, m, f) {
        const h = (E - f) * (_ - m), d = (b - m) * (a - f), y = h - d;
        if (h === 0 || d === 0 || h > 0 != d > 0) return y;
        const v = Math.abs(h + d);
        return Math.abs(y) >= c * v ? y : -(function(S, T, C, X, A, O, $) {
          let B, I, L, D, P, R, Y, V, k, F, N, j, W, G, J, K, ot, Q;
          const tt = S - A, et = C - A, nt = T - O, it = X - O;
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - ((G = tt * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = nt * et) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), w[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          let ut = (function(De, Gt) {
            let Wt = Gt[0];
            for (let Rt = 1; Rt < De; Rt++) Wt += Gt[Rt];
            return Wt;
          })(4, w), Mt = u * $;
          if (ut >= Mt || -ut >= Mt || (B = S - (tt + (P = S - tt)) + (P - A), L = C - (et + (P = C - et)) + (P - A), I = T - (nt + (P = T - nt)) + (P - O), D = X - (it + (P = X - it)) + (P - O), B === 0 && I === 0 && L === 0 && D === 0) || (Mt = l * $ + i * Math.abs(ut), (ut += tt * D + it * B - (nt * L + et * I)) >= Mt || -ut >= Mt)) return ut;
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - ((G = B * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = I - (Y = (R = 134217729 * I) - (R - I))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = I * et) - Y * k - V * k - Y * F))), M[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), M[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, M[2] = j - (Q - P) + (N - P), M[3] = Q;
          const Fe = o(4, w, 4, M, p);
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - ((G = tt * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = L - (k = (R = 134217729 * L) - (R - L))) - ((K = nt * L) - Y * k - V * k - Y * F))), M[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), M[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, M[2] = j - (Q - P) + (N - P), M[3] = Q;
          const je = o(Fe, p, 4, M, g);
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - ((G = B * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = I - (Y = (R = 134217729 * I) - (R - I))) * (F = L - (k = (R = 134217729 * L) - (R - L))) - ((K = I * L) - Y * k - V * k - Y * F))), M[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), M[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, M[2] = j - (Q - P) + (N - P), M[3] = Q;
          const ke = o(je, g, 4, M, x);
          return x[ke - 1];
        })(b, E, _, a, m, f, v);
      }, r.orient2dfast = function(b, E, _, a, m, f) {
        return (E - f) * (_ - m) - (b - m) * (a - f);
      }, Object.defineProperty(r, "__esModule", { value: !0 });
    });
  })(bt, bt.exports)), bt.exports;
}
var ee;
function hr() {
  if (ee) return Ct.exports;
  ee = 1;
  var e = or(), t = sr, r = fr(), n = lr().orient2d;
  t.default && (t = t.default), Ct.exports = i, Ct.exports.default = i;
  function i(f, h, d) {
    h = Math.max(0, h === void 0 ? 2 : h), d = d || 0;
    var y = x(f), v = new e(16);
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
    }, v.load(f);
    for (var S = [], T = 0, C; T < y.length; T++) {
      var X = y[T];
      v.remove(X), C = M(X, C), S.push(C);
    }
    var A = new e(16);
    for (T = 0; T < S.length; T++) A.insert(g(S[T]));
    for (var O = h * h, $ = d * d; S.length; ) {
      var B = S.shift(), I = B.p, L = B.next.p, D = b(I, L);
      if (!(D < $)) {
        var P = D / O;
        X = o(v, B.prev.p, I, L, B.next.next.p, P, A), X && Math.min(b(X, I), b(X, L)) <= P && (S.push(B), S.push(M(X, B)), v.remove(X), A.remove(B), A.insert(g(B)), A.insert(g(B.next)));
      }
    }
    B = C;
    var R = [];
    do
      R.push(B.p), B = B.next;
    while (B !== C);
    return R.push(B.p), R;
  }
  function o(f, h, d, y, v, S, T) {
    for (var C = new t([], s), X = f.data; X; ) {
      for (var A = 0; A < X.children.length; A++) {
        var O = X.children[A], $ = X.leaf ? E(O, d, y) : c(d, y, O);
        $ > S || C.push({
          node: O,
          dist: $
        });
      }
      for (; C.length && !C.peek().node.children; ) {
        var B = C.pop(), I = B.node, L = E(I, h, d), D = E(I, y, v);
        if (B.dist < L && B.dist < D && l(d, I, T) && l(y, I, T)) return I;
      }
      X = C.pop(), X && (X = X.node);
    }
    return null;
  }
  function s(f, h) {
    return f.dist - h.dist;
  }
  function c(f, h, d) {
    if (u(f, d) || u(h, d)) return 0;
    var y = _(f[0], f[1], h[0], h[1], d.minX, d.minY, d.maxX, d.minY);
    if (y === 0) return 0;
    var v = _(f[0], f[1], h[0], h[1], d.minX, d.minY, d.minX, d.maxY);
    if (v === 0) return 0;
    var S = _(f[0], f[1], h[0], h[1], d.maxX, d.minY, d.maxX, d.maxY);
    if (S === 0) return 0;
    var T = _(f[0], f[1], h[0], h[1], d.minX, d.maxY, d.maxX, d.maxY);
    return T === 0 ? 0 : Math.min(y, v, S, T);
  }
  function u(f, h) {
    return f[0] >= h.minX && f[0] <= h.maxX && f[1] >= h.minY && f[1] <= h.maxY;
  }
  function l(f, h, d) {
    for (var y = Math.min(f[0], h[0]), v = Math.min(f[1], h[1]), S = Math.max(f[0], h[0]), T = Math.max(f[1], h[1]), C = d.search({ minX: y, minY: v, maxX: S, maxY: T }), X = 0; X < C.length; X++)
      if (p(C[X].p, C[X].next.p, f, h)) return !1;
    return !0;
  }
  function w(f, h, d) {
    return n(f[0], f[1], h[0], h[1], d[0], d[1]);
  }
  function p(f, h, d, y) {
    return f !== y && h !== d && w(f, h, d) > 0 != w(f, h, y) > 0 && w(d, y, f) > 0 != w(d, y, h) > 0;
  }
  function g(f) {
    var h = f.p, d = f.next.p;
    return f.minX = Math.min(h[0], d[0]), f.minY = Math.min(h[1], d[1]), f.maxX = Math.max(h[0], d[0]), f.maxY = Math.max(h[1], d[1]), f;
  }
  function x(f) {
    for (var h = f[0], d = f[0], y = f[0], v = f[0], S = 0; S < f.length; S++) {
      var T = f[S];
      T[0] < h[0] && (h = T), T[0] > y[0] && (y = T), T[1] < d[1] && (d = T), T[1] > v[1] && (v = T);
    }
    var C = [h, d, y, v], X = C.slice();
    for (S = 0; S < f.length; S++)
      r(f[S], C) || X.push(f[S]);
    return m(X);
  }
  function M(f, h) {
    var d = {
      p: f,
      prev: null,
      next: null,
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0
    };
    return h ? (d.next = h.next, d.prev = h, h.next.prev = d, h.next = d) : (d.prev = d, d.next = d), d;
  }
  function b(f, h) {
    var d = f[0] - h[0], y = f[1] - h[1];
    return d * d + y * y;
  }
  function E(f, h, d) {
    var y = h[0], v = h[1], S = d[0] - y, T = d[1] - v;
    if (S !== 0 || T !== 0) {
      var C = ((f[0] - y) * S + (f[1] - v) * T) / (S * S + T * T);
      C > 1 ? (y = d[0], v = d[1]) : C > 0 && (y += S * C, v += T * C);
    }
    return S = f[0] - y, T = f[1] - v, S * S + T * T;
  }
  function _(f, h, d, y, v, S, T, C) {
    var X = d - f, A = y - h, O = T - v, $ = C - S, B = f - v, I = h - S, L = X * X + A * A, D = X * O + A * $, P = O * O + $ * $, R = X * B + A * I, Y = O * B + $ * I, V = L * P - D * D, k, F, N, j, W = V, G = V;
    V === 0 ? (F = 0, W = 1, j = Y, G = P) : (F = D * Y - P * R, j = L * Y - D * R, F < 0 ? (F = 0, j = Y, G = P) : F > W && (F = W, j = Y + D, G = P)), j < 0 ? (j = 0, -R < 0 ? F = 0 : -R > L ? F = W : (F = -R, W = L)) : j > G && (j = G, -R + D < 0 ? F = 0 : -R + D > L ? F = W : (F = -R + D, W = L)), k = F === 0 ? 0 : F / W, N = j === 0 ? 0 : j / G;
    var J = (1 - k) * f + k * d, K = (1 - k) * h + k * y, ot = (1 - N) * v + N * T, Q = (1 - N) * S + N * C, tt = ot - J, et = Q - K;
    return tt * tt + et * et;
  }
  function a(f, h) {
    return f[0] === h[0] ? f[1] - h[1] : f[0] - h[0];
  }
  function m(f) {
    f.sort(a);
    for (var h = [], d = 0; d < f.length; d++) {
      for (; h.length >= 2 && w(h[h.length - 2], h[h.length - 1], f[d]) <= 0; )
        h.pop();
      h.push(f[d]);
    }
    for (var y = [], v = f.length - 1; v >= 0; v--) {
      for (; y.length >= 2 && w(y[y.length - 2], y[y.length - 1], f[v]) <= 0; )
        y.pop();
      y.push(f[v]);
    }
    return y.pop(), h.pop(), h.concat(y);
  }
  return Ct.exports;
}
var mr = hr();
const dr = /* @__PURE__ */ rr(mr);
function pr(e, t = {}) {
  t.concavity = t.concavity || 1 / 0;
  const r = [];
  if (ge(e, (i) => {
    r.push([i[0], i[1]]);
  }), !r.length)
    return null;
  const n = dr(r, t.concavity);
  return n.length > 3 ? lt([n], t.properties) : null;
}
function At(e, t, r) {
  if (r) {
    const n = e.geometry.coordinates, i = H(n[0], r.xOrigin, r.xUnit, r.gridNum), o = H(n[1], r.yOrigin, r.yUnit, r.gridNum), s = r.gridCache[i]?.[o] ?? [];
    for (const c of s) {
      const u = t.features[c];
      if (u && at(e, u)) return u;
    }
    return;
  }
  for (let n = 0; n < t.features.length; n++)
    if (at(e, t.features[n]))
      return t.features[n];
}
function ye(e, t) {
  const r = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], i = t.geometry.coordinates[0][2], o = e.geometry.coordinates, s = t.properties.a.geom, c = t.properties.b.geom, u = t.properties.c.geom, l = [n[0] - r[0], n[1] - r[1]], w = [i[0] - r[0], i[1] - r[1]], p = [o[0] - r[0], o[1] - r[1]], g = [c[0] - s[0], c[1] - s[1]], x = [u[0] - s[0], u[1] - s[1]], M = (w[1] * p[0] - w[0] * p[1]) / (l[0] * w[1] - l[1] * w[0]), b = (l[0] * p[1] - l[1] * p[0]) / (l[0] * w[1] - l[1] * w[0]);
  return [
    M * g[0] + b * x[0] + s[0],
    M * g[1] + b * x[1] + s[1]
  ];
}
function gr(e, t, r) {
  const n = e.geometry.coordinates, i = r.geometry.coordinates, o = Math.atan2(n[0] - i[0], n[1] - i[1]), s = wr(o, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const c = t[1][s];
  return ye(e, c.features[0]);
}
function yr(e, t, r, n, i, o, s, c, u) {
  let l = u;
  if (!l && s && (l = At(e, dt([s]))), !l)
    if (r) {
      const w = e.geometry.coordinates, p = r.gridNum, g = r.xOrigin, x = r.yOrigin, M = r.xUnit, b = r.yUnit, E = r.gridCache, _ = H(w[0], g, M, p), a = H(w[1], x, b, p), m = E[_] ? E[_][a] ? E[_][a] : [] : [], f = dt(m.map((h) => t.features[h]));
      l = At(e, f);
    } else
      l = At(e, t);
  return c && c(l), l ? ye(e, l) : gr(e, n, i);
}
function H(e, t, r, n) {
  let i = Math.floor((e - t) / r);
  return i < 0 && (i = 0), i >= n && (i = n - 1), i;
}
const xr = 36;
function re(e, t, r) {
  const n = (t[1][0] - t[0][0]) / r, i = (t[1][1] - t[0][1]) / r;
  return e.reduce((o, s) => {
    const c = H(s[0][0], t[0][0], n, r), u = H(s[1][0], t[0][0], n, r), l = H(s[0][1], t[0][1], i, r), w = H(s[1][1], t[0][1], i, r), p = (u - c + 1) * (w - l + 1);
    return p > 0 ? o + p : o;
  }, 0);
}
function wr(e, t) {
  let r = ne(e - t[0]), n = Math.PI * 2, i;
  for (let o = 0; o < t.length; o++) {
    const s = (o + 1) % t.length, c = ne(e - t[s]), u = Math.min(Math.abs(r), Math.abs(c));
    r * c <= 0 && u < n && (n = u, i = o), r = c;
  }
  return i;
}
function ne(e, t = !1) {
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
    (o) => e.properties[o].geom
  ), r = e.geometry.coordinates[0], n = e.properties, i = {
    a: { geom: r[0], index: n.a.index },
    b: { geom: r[1], index: n.b.index },
    c: { geom: r[2], index: n.c.index }
  };
  return lt([t], i);
}
function vr(e) {
  const t = [0, 1, 2, 0].map((n) => e[n][0][0]), r = {
    a: { geom: e[0][0][1], index: e[0][1] },
    b: { geom: e[1][0][1], index: e[1][1] },
    c: { geom: e[2][0][1], index: e[2][1] }
  };
  return lt([t], r);
}
function Ft(e, t, r, n, i, o = !1, s) {
  const c = e.map(
    (u) => {
      (!s || s < 2.00703) && (u = Mr(u));
      const l = isFinite(u) ? t[u] : u === "c" ? n : (function() {
        const w = u.match(/^b(\d+)$/);
        if (w) return i[parseInt(w[1])];
        const p = u.match(/^e(\d+)$/);
        if (p) return r[parseInt(p[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return o ? [[l[1], l[0]], u] : [[l[0], l[1]], u];
    }
  );
  return vr(c);
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
const xe = 2.00704;
function br(e) {
  return !!(e.version !== void 0 || !e.tins && e.points && e.tins_points);
}
function Er(e) {
  return {
    points: e.points,
    strictStatus: yt(e),
    verticesParams: Tr(e),
    centroid: Cr(e),
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
  return n != null && we(n), {
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
function Tr(e) {
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
  return t.forw[1] = ie(e, !1), t.bakw[1] = ie(e, !0), we(t), t;
}
function we(e) {
  if (typeof e != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((t) => {
    const r = e[t];
    if (r == null) return;
    const n = `vertices_params.${t}`, i = r[0], o = r[1];
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
function ie(e, t) {
  const r = e.vertices_points.length;
  return Array.from({ length: r }, (n, i) => {
    const o = (i + 1) % r, s = Ft(
      ["c", `b${i}`, `b${o}`],
      e.points,
      e.edgeNodes || [],
      e.centroid_point,
      e.vertices_points,
      t,
      xe
    );
    return dt([s]);
  });
}
function Cr(e) {
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
        (r) => Ft(
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
        (r) => Ft(
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
    const i = r[n];
    ["a", "b", "c"].forEach((o, s) => {
      const c = i.geometry.coordinates[0][s], u = i.properties[o].geom, l = i.properties[o].index;
      typeof l == "number" && (t[l] = [c, u]);
    });
  }
  return t;
}
function ve(e) {
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
function Me(e, t) {
  const r = t[0] - 0.5, n = t[1] - 0.5;
  return [
    e.xScale * r + e.xSkew * n + e.xOrigin,
    e.ySkew * r + e.yScale * n + e.yOrigin
  ];
}
function _e(e, t) {
  const r = e.xScale * e.yScale - e.xSkew * e.ySkew, n = t[0] - e.xOrigin, i = t[1] - e.yOrigin;
  return [
    (e.yScale * n - e.xSkew * i) / r + 0.5,
    (-e.ySkew * n + e.xScale * i) / r + 0.5
  ];
}
const cn = xe;
function xt(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function Et(e, t, r, n = 0) {
  return e[0] >= Math.min(t[0], r[0]) - n && e[0] <= Math.max(t[0], r[0]) + n && e[1] >= Math.min(t[1], r[1]) - n && e[1] <= Math.max(t[1], r[1]) + n;
}
function Yr(e, t, r, n) {
  const i = xt(e, t, r), o = xt(e, t, n), s = xt(r, n, e), c = xt(r, n, t);
  return i === 0 && Et(r, e, t) || o === 0 && Et(n, e, t) || s === 0 && Et(e, r, n) || c === 0 && Et(t, r, n) ? !0 : Math.sign(i) * Math.sign(o) === -1 && Math.sign(s) * Math.sign(c) === -1;
}
function oe(e) {
  const t = e.reduce((r, n, i) => r + xt(e[0], n, e[(i + 1) % e.length]), 0);
  if (!Number.isFinite(t) || t === 0)
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  for (let r = 0; r < e.length; r++) {
    const n = e[r], i = e[(r + 1) % e.length];
    if (n[0] === i[0] && n[1] === i[1])
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    for (let o = r + 2; o < e.length; o++)
      if (!(r === 0 && o === e.length - 1) && Yr(n, i, e[o], e[(o + 1) % e.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(t);
}
function Br(e, t) {
  let r = !1;
  for (let n = 0, i = t.length - 1; n < t.length; i = n++) {
    const o = t[i], s = t[n], [c, u] = o, [l, w] = s, p = l - c, g = w - u, x = e[0] - c, M = e[1] - u, b = Number.EPSILON * 16 * Math.max(1, Math.abs(c), Math.abs(u), Math.abs(l), Math.abs(w), Math.abs(e[0]), Math.abs(e[1])), E = Math.hypot(p, g), _ = b * E + Number.EPSILON * 16 * (Math.abs(x * g) + Math.abs(M * p));
    if (Math.abs(xt(o, s, e)) <= _ && Et(e, o, s, b)) return "edge";
    u > e[1] != w > e[1] && e[0] < (l - c) * (e[1] - u) / (w - u) + c && (r = !r);
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
    const i = r ? t.worldFile : void 0;
    if (n === "worldFile") {
      if (!i) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      ve(i);
      const l = t.vertices_points;
      if (!Array.isArray(l) || l.length < 4 || l.some((x) => !Array.isArray(x) || x.length < 2 || x.some((M) => !Array.isArray(M) || M.length < 2 || !M.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const w = oe(l.map((x) => x[0])), p = oe(l.map((x) => x[1])), g = t.yaxisMode === q.YAXIS_FOLLOW ? -p : p;
      if (w === g)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const o = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = br(o) ? Er(o) : Sr(o), u = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"].map((l) => [l, this[l]]));
    try {
      "compiled" in s ? this.applyLegacyState(s) : this.applyModernState(s), this.outerTransform = n ?? "extrapolate", this.worldFile = i, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0, this.outerRings = this.outerVertices ? { forw: this.outerVertices.map((l) => l[0]), bakw: this.outerVertices.map((l) => l[1]) } : void 0, this.validateCompiledProjection();
    } catch (l) {
      throw Object.assign(this, u), l;
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
    const t = this.tins, r = t.forw, n = t.bakw, i = Math.ceil(Math.sqrt(r.features.length));
    if (i < 3) {
      this.indexedTins = void 0;
      return;
    }
    let o = [], s = [];
    const c = r.features.map((E) => {
      let _ = [];
      return $t(E)[0].map((a) => {
        o.length === 0 ? o = [Array.from(a), Array.from(a)] : (a[0] < o[0][0] && (o[0][0] = a[0]), a[0] > o[1][0] && (o[1][0] = a[0]), a[1] < o[0][1] && (o[0][1] = a[1]), a[1] > o[1][1] && (o[1][1] = a[1])), _.length === 0 ? _ = [Array.from(a), Array.from(a)] : (a[0] < _[0][0] && (_[0][0] = a[0]), a[0] > _[1][0] && (_[1][0] = a[0]), a[1] < _[0][1] && (_[0][1] = a[1]), a[1] > _[1][1] && (_[1][1] = a[1]));
      }), _;
    }), u = n.features.map((E) => {
      let _ = [];
      return $t(E)[0].map((a) => {
        s.length === 0 ? s = [Array.from(a), Array.from(a)] : (a[0] < s[0][0] && (s[0][0] = a[0]), a[0] > s[1][0] && (s[1][0] = a[0]), a[1] < s[0][1] && (s[0][1] = a[1]), a[1] > s[1][1] && (s[1][1] = a[1])), _.length === 0 ? _ = [Array.from(a), Array.from(a)] : (a[0] < _[0][0] && (_[0][0] = a[0]), a[0] > _[1][0] && (_[1][0] = a[0]), a[1] < _[0][1] && (_[0][1] = a[1]), a[1] > _[1][1] && (_[1][1] = a[1]));
      }), _;
    });
    if (Math.max(
      re(c, o, i),
      re(u, s, i)
    ) > xr * r.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const w = (o[1][0] - o[0][0]) / i, p = (o[1][1] - o[0][1]) / i, g = c.reduce(
      (E, _, a) => {
        const m = H(_[0][0], o[0][0], w, i), f = H(_[1][0], o[0][0], w, i), h = H(_[0][1], o[0][1], p, i), d = H(_[1][1], o[0][1], p, i);
        for (let y = m; y <= f; y++) {
          E[y] || (E[y] = []);
          for (let v = h; v <= d; v++)
            E[y][v] || (E[y][v] = []), E[y][v].push(a);
        }
        return E;
      },
      []
    ), x = (s[1][0] - s[0][0]) / i, M = (s[1][1] - s[0][1]) / i, b = u.reduce(
      (E, _, a) => {
        const m = H(_[0][0], s[0][0], x, i), f = H(_[1][0], s[0][0], x, i), h = H(_[0][1], s[0][1], M, i), d = H(_[1][1], s[0][1], M, i);
        for (let y = m; y <= f; y++) {
          E[y] || (E[y] = []);
          for (let v = h; v <= d; v++)
            E[y][v] || (E[y][v] = []), E[y][v].push(a);
        }
        return E;
      },
      []
    );
    this.indexedTins = {
      forw: {
        gridNum: i,
        xOrigin: o[0][0],
        yOrigin: o[0][1],
        xUnit: w,
        yUnit: p,
        gridCache: g
      },
      bakw: {
        gridNum: i,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: x,
        yUnit: M,
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
    const i = t;
    this.yaxisMode == q.YAXIS_FOLLOW && r && (t = [t[0], -1 * t[1]]);
    const o = rt(t);
    if (this.bounds && !r && !n && !at(o, this.boundsPolygon))
      return !1;
    const s = r ? this.tins.bakw : this.tins.forw, c = r ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let u;
    if (this.outerTransform === "worldFile") {
      const M = r ? this.outerRings?.bakw : this.outerRings?.forw, b = M ? Br(o.geometry.coordinates, M) : "outside";
      if (r && this.strict_status == q.STATUS_ERROR && b !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (b === "inside" && s && (u = At(o, s, c)), !u) {
        const E = r ? _e(this.worldFile, i) : Me(this.worldFile, i);
        return !E.every(Number.isFinite) || r && this.bounds && !n && !at(rt(E), this.boundsPolygon) ? !1 : E;
      }
    }
    const l = r ? this.vertices_params.bakw : this.vertices_params.forw, w = r ? this.centroid.bakw : this.centroid.forw;
    let p, g;
    this.stateFull && (this.stateBackward == r ? p = this.stateTriangle : (this.stateBackward = r, this.stateTriangle = void 0), g = (M) => {
      this.stateTriangle = M;
    });
    let x = yr(
      o,
      s,
      c,
      l,
      w,
      void 0,
      p,
      g,
      u
    );
    if (this.bounds && r && !n) {
      const M = rt(x);
      if (!at(M, this.boundsPolygon)) return !1;
    } else this.yaxisMode == q.YAXIS_FOLLOW && !r && (x = [x[0], -1 * x[1]]);
    return x;
  }
}
const U = 20037508342789244e-9, Or = [
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
  const r = t.trim().split(/\s+/).map((o) => {
    const [s, ...c] = o.replace(/^\+/, "").split("="), u = s.toLowerCase(), l = c.join("="), w = c.length > 0;
    if (u === "axis" && (!w || l !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if ((u === "no_defs" || u === "wktext") && !w) return "";
    if (w && l === "") throw new Error(`+${u}= は許可されていません`);
    if (u === "wktext") throw new Error("+wktext は許可されていません");
    if (u === "type" && !w) throw new Error("+type は値が必要です");
    if (u === "type" && l.toLowerCase() === "crs" || u === "axis") return "";
    if (u === "towgs84") {
      const g = l.split(",");
      if (!w || g.some((M) => M.trim() === ""))
        throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(g.length) && g.every((M) => {
        const b = M.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(M)) && !/[1-9]/.test(b);
      })) return "";
    }
    const p = l ? l.split(",").map((g) => {
      const x = Number(g);
      return g.trim() !== "" && Number.isFinite(x) ? Object.is(x, -0) ? "0" : String(x) : g.toLowerCase();
    }).join(",") : "";
    return `+${u}${l ? `=${p}` : ""}`;
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
    if (t.epsg !== 3857 || Math.abs(e[0]) > U || Math.abs(e[1]) > U)
      return !1;
    const r = e[0], n = e[1];
    return [
      Math.abs(r) === U ? Math.sign(r) * 180 : r / Xt * (180 / Math.PI),
      Math.abs(n) === U ? Math.sign(n) * Nt : (2 * Math.atan(Math.exp(n / Xt)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(e, t) {
    if (!ft(e) || Math.abs(e[0]) > 180) return !1;
    const [r, n] = e;
    if (t.epsg === 4326) return Math.abs(n) <= 90 ? [r, n] : !1;
    if (t.epsg !== 3857 || Math.abs(n) > Nt) return !1;
    const i = r * Math.PI / 180, o = n * Math.PI / 180, s = [
      Math.abs(r) === 180 ? Math.sign(r) * U : Xt * i,
      Math.abs(n) === Nt ? Math.sign(n) * U : Xt * Math.log(Math.tan(Math.PI / 4 + o / 2))
    ];
    return s.every(Number.isFinite) ? s : !1;
  }
}, be = { epsg: 3857 }, se = { epsg: 4326 }, Ir = "+proj=longlat +datum=WGS84";
function jt(e) {
  return e.epsg === 3857 || e.epsg === 4326;
}
function Lr(e) {
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
function Ee(e) {
  let t = !1;
  for (const r of e.split("+")) {
    const [n, i] = r.trim().split("="), o = n.toLowerCase();
    if (o === "axis" && i !== "enu")
      throw new Error("CRS の座標は東・北の順で書き、+axis を外すか +axis=enu を指定してください");
    if (o === "nadgrids" && i !== "@null" || o === "geoidgrids" || o === "hgridshift" || o === "vgridshift" || o === "proj" && ["pipeline", "hgridshift", "vgridshift"].includes(i?.toLowerCase()))
      throw new Error(`proj4 の +${r.trim()} は読み込めません`);
    o === "proj" && i && (t = !0);
  }
  if (!e.startsWith("+") || !t)
    throw new Error("CRS の proj4 は +proj= を含む定義で指定してください");
}
function Se(e, t, r) {
  Lr(e);
  const n = jt(e);
  if (e.proj4 === void 0) {
    if (e.wkt) throw new Error("WKT だけの CRS 定義に対応していません");
    if (!n) throw new Error("EPSG:3857・4326 以外の CRS には proj4 定義が必要です");
    return;
  }
  const i = e.proj4.trim();
  if (Ee(i), t.validateDefinition)
    t.validateDefinition(e, n ? r() : void 0);
  else if (n)
    Nr(e.epsg, i);
  else if (t === st)
    throw new Error("この CRS には proj4 に対応する投影エンジンが必要です");
}
function fn(e) {
  const t = /* @__PURE__ */ new Map();
  function r(o) {
    const s = t.get(o);
    if (s) return s;
    Ee(o);
    try {
      const c = e(o, Ir);
      return t.set(o, c), c;
    } catch (c) {
      throw new Error(`proj4 定義を読み込めません（${String(c)}）`, { cause: c });
    }
  }
  function n(o, [s, c]) {
    const u = o.inverse([s, c, 0], !0), l = u[2];
    return Number.isFinite(l) && Math.abs(l) > 1e-6 ? o.inverse([s, c, -l], !0) : u;
  }
  function i(o, s, c) {
    if (!ft(o)) return !1;
    try {
      const u = c(r(s), [o[0], o[1]]);
      return ft(u) ? [u[0], u[1]] : !1;
    } catch {
      return !1;
    }
  }
  return {
    toLonLat(o, s) {
      if (jt(s)) return st.toLonLat(o, s);
      if (!s.proj4) return !1;
      const c = i(
        o,
        s.proj4.trim(),
        (u, l) => u.forward(l)
      );
      return c === !1 ? !1 : st.toLonLat(c, se);
    },
    fromLonLat(o, s) {
      return jt(s) ? st.fromLonLat(o, s) : !s.proj4 || st.fromLonLat(o, se) === !1 ? !1 : i(o, s.proj4.trim(), n);
    },
    validateDefinition(o, s) {
      if (o.proj4 === void 0) return;
      const c = o.proj4.trim();
      if (r(c), !s) return;
      const u = o.epsg === 3857 ? 1e-3 : 1e-8;
      for (const l of s) {
        const w = st.toLonLat(l, o), p = w === !1 ? !1 : i(w, c, (g, x) => g.inverse(x));
        if (p === !1 || Math.hypot(p[0] - l[0], p[1] - l[1]) > u)
          throw new Error(
            `epsg と proj4 が地図の四隅または中心で一致しないか、比較できません（EPSG:${o.epsg}）`
          );
      }
    }
  };
}
function Te(e, t, r) {
  if (!ft(e)) return !1;
  const n = r.toLonLat(e, t);
  return n === !1 ? !1 : st.fromLonLat(n, be);
}
function Ce(e, t, r) {
  const n = st.toLonLat(e, be);
  if (n === !1) return !1;
  const i = r.fromLonLat(n, t);
  return i !== !1 && ft(i) ? i : !1;
}
function Xe(e, t, r) {
  let n, i, o, s;
  if (r?.length) {
    n = i = 1 / 0, o = s = -1 / 0;
    for (const [c, u] of r)
      n = Math.min(n, c), i = Math.min(i, u), o = Math.max(o, c), s = Math.max(s, u);
  } else if (e)
    [n, i] = t ?? [0, 0], o = n + e[0], s = i + e[1];
  else
    throw new Error("epsg と proj4 の照合には地図の範囲が必要です");
  if (![n, i, o, s].every(Number.isFinite))
    throw new Error("epsg と proj4 の照合には有限な地図の範囲が必要です");
  return [
    [n, i],
    [o, i],
    [o, s],
    [n, s],
    [n / 2 + o / 2, i / 2 + s / 2]
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
    if (ve(t.worldFile), !t.wh && !t.bounds) throw new Error("WorldFileSurface には wh または bounds が必要です");
    if (t.wh && (!Array.isArray(t.wh) || t.wh.length < 2 || !t.wh.slice(0, 2).every(Number.isFinite)))
      throw new Error("WorldFileSurface の wh は有限な 2 要素以上の配列でなければなりません");
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((n) => !Array.isArray(n) || n.length < 2 || !n.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? st;
    const r = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const n = r.map((c) => c[0]), i = r.map((c) => c[1]), o = Math.min(...n), s = Math.min(...i);
      if (this.wh = [Math.max(...n) - o, Math.max(...i) - s], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = t.xy ?? [o, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance, Se(
      this.crs,
      this.projectionEngine,
      () => Xe(t.wh, this.xy, t.wh ? void 0 : this.bounds).map((n) => this.xyToCrs(n))
    );
  }
  /** 画素座標を指定 CRS に変換する */
  xyToCrs(t) {
    return Me(this.worldFile, t);
  }
  /** 指定 CRS 座標を画素座標に変換する */
  crsToXy(t) {
    return _e(this.worldFile, t);
  }
  /** 地図画素と EPSG:3857 の間を変換する */
  transform(t, r = !1, n = !1) {
    if (!ft(t)) return !1;
    if (!r) {
      const s = this.xyToCrs(t);
      return this.crs.epsg === 3857 ? s.every((c) => Math.abs(c) <= U) ? s : !1 : Te(s, this.crs, this.projectionEngine);
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(t[0]) > U || Math.abs(t[1]) > U) return !1;
      const s = this.crsToXy(t);
      return ft(s) ? s : !1;
    }
    const i = Ce(t, this.crs, this.projectionEngine);
    if (i === !1) return !1;
    const o = this.crsToXy(i);
    return ft(o) ? o : !1;
  }
}
const It = 16, jr = 8, kr = 16, wt = 2, Dr = 1, un = "max", Vr = 1, Gr = 0.02, Wr = 1e-24;
function Pe(e, t) {
  return Math.floor(Math.min(e[0], e[1]) / 4) * U / 128 / Math.pow(2, t);
}
function Ur(e, t) {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const i = e[n], o = i[0] * Math.cos(t) - i[1] * Math.sin(t), s = i[0] * Math.sin(t) + i[1] * Math.cos(t);
    r.push([o, s]);
  }
  return r;
}
function ae(e, t, r, n) {
  const i = Pe(n, t);
  return Ur(Or, r).map((c) => [
    c[0] * i + e[0],
    c[1] * i + e[1]
  ]);
}
function ce(e, t) {
  const r = e[0], i = e.slice(1, 5).map((x) => [
    x[0] - r[0],
    x[1] - r[1]
  ]), o = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, c = 0, u = 0;
  for (let x = 0; x < 4; x++) {
    const M = i[x], b = o[x], E = Math.sqrt(Math.pow(M[0], 2) + Math.pow(M[1], 2));
    s += E;
    const _ = M[0] * b[1] - M[1] * b[0], a = M[0] * b[0] + M[1] * b[1], m = -Math.atan2(_, a);
    c += Math.cos(m), u += Math.sin(m);
  }
  const l = s / 4, w = Math.atan2(u, c), p = Math.floor(Math.min(t[0], t[1]) / 4), g = Math.log(p * U / 128 / l) / Math.log(2);
  return { center: r, zoom: g, rotation: w };
}
function Ae(e) {
  const t = e - 2 * Math.PI * Math.round(e / (2 * Math.PI));
  return t === -Math.PI ? Math.PI : t;
}
function Lt(e, t) {
  const r = e[0] * (2 * U) / t - U, n = -1 * (e[1] * (2 * U) / t - U);
  return [r, n];
}
function fe(e, t) {
  const r = (e[0] + U) * t / (2 * U), n = (-e[1] + U) * t / (2 * U);
  return [r, n];
}
function Tt(e) {
  return Array.isArray(e) && e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function mt(e) {
  let t = 1 / 0, r = 1 / 0, n = -1 / 0, i = -1 / 0;
  for (const [o, s] of e)
    !Number.isFinite(o) || !Number.isFinite(s) || (t = Math.min(t, o), r = Math.min(r, s), n = Math.max(n, o), i = Math.max(i, s));
  if (!Number.isFinite(t)) throw new Error("視点グリッドの範囲を有限な座標から決められません");
  return { minX: t, minY: r, maxX: n, maxY: i };
}
function Re(e, t) {
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
function Ye(e) {
  const t = e.maxX - e.minX, r = e.maxY - e.minY;
  if (!(t > 0) || !(r > 0))
    throw new Error("視点グリッドの基準矩形に面積がありません");
  const n = Math.max(t, r), i = Math.min(t, r), o = Math.min(
    kr,
    Math.max(jr, Math.round(It * i / n))
  ), s = t >= r ? It : o, c = t >= r ? o : It, u = t / s, l = r / c;
  return {
    x0: e.minX - wt * u,
    y0: e.minY - wt * l,
    dx: u,
    dy: l,
    mx: s + 2 * wt,
    my: c + 2 * wt,
    nxInner: s,
    nyInner: c
  };
}
function $r(e, t, r, n) {
  const i = !n, o = [[r, 0], [-r, 0], [0, r], [0, -r]], s = [];
  for (const c of o) {
    const u = i ? [t[0] + c[0], t[1] - c[1]] : [t[0] + c[0], t[1] + c[1]], l = e.transform(u, n, !0);
    Tt(l) && s.push({ d: c, out: l });
  }
  return { valid: s, center: e.transform(t, n, !0) };
}
function kt(e, t) {
  return t ? [e[0], -e[1]] : [e[0], e[1]];
}
function ue(e, t, r, n) {
  const i = e * n - t * r;
  if (!(i > 0) || !Number.isFinite(i)) return null;
  const o = Math.sqrt(i), s = Math.atan2(r - t, e + n);
  return Number.isFinite(o) && Number.isFinite(s) ? { s: o, theta: s } : null;
}
function qr(e, t, r) {
  let n = 0, i = 0, o = 0;
  for (const { d: l, out: w } of e) {
    const [p, g] = kt(w, r), x = l[0], M = l[1], b = p - t[0], E = g - t[1];
    n += x * b + M * E, i += x * E - M * b, o += x * x + M * M;
  }
  if (!(o > 0)) return null;
  const s = n / o, c = i / o, u = Math.hypot(s, c);
  return !(u > 0) || !Number.isFinite(u) ? null : r ? { s: 1 / u, theta: -Math.atan2(c, s) } : { s: u, theta: Math.atan2(c, s) };
}
function le(e) {
  return e ? { s: 1 / e.s, theta: -e.theta } : null;
}
function zr(e, t, r, n) {
  const { valid: i, center: o } = $r(e, t, r, n), s = Tt(o) ? kt(o, n) : null, c = (g, x) => {
    const M = i.find((b) => b.d[0] === g && b.d[1] === x);
    return M ? kt(M.out, n) : void 0;
  };
  if (i.length >= 4) {
    const g = c(r, 0), x = c(-r, 0), M = c(0, r), b = c(0, -r), E = ue(
      (g[0] - x[0]) / (2 * r),
      (M[0] - b[0]) / (2 * r),
      (g[1] - x[1]) / (2 * r),
      (M[1] - b[1]) / (2 * r)
    );
    return n ? le(E) : E;
  }
  if (!s) return null;
  const u = (g) => g[1] === 0, l = i.filter((g) => u(g.d)), w = i.filter((g) => !u(g.d)), p = l.length >= 1 && w.length >= 1;
  if (i.length >= 3 || i.length === 2 && p) {
    const g = (E, _) => E && _ ? [(E[0] - _[0]) / (2 * r), (E[1] - _[1]) / (2 * r)] : E ? [(E[0] - s[0]) / r, (E[1] - s[1]) / r] : _ ? [(s[0] - _[0]) / r, (s[1] - _[1]) / r] : null, x = g(c(r, 0), c(-r, 0)), M = g(c(0, r), c(0, -r));
    if (!x || !M) return null;
    const b = ue(x[0], M[0], x[1], M[1]);
    return n ? le(b) : b;
  }
  return i.length === 2 ? qr(i, s, n) : null;
}
function ht(e, t, r) {
  const n = Math.min(Math.max((t - e.x0) / e.dx, 0), e.nx - 1), i = Math.min(Math.max((r - e.y0) / e.dy, 0), e.ny - 1), o = Math.min(Math.floor(n), e.nx - 2), s = Math.min(Math.floor(i), e.ny - 2), c = n - o, u = i - s, l = [
    (1 - c) * (1 - u),
    c * (1 - u),
    (1 - c) * u,
    c * u
  ], w = (_, a, m) => _[m * e.nx + a], p = [[o, s], [o + 1, s], [o, s + 1], [o + 1, s + 1]];
  let g = 0, x = 0, M = 0;
  for (let _ = 0; _ < 4; _++) {
    const [a, m] = p[_];
    g += l[_] * w(e.ls, a, m), x += l[_] * w(e.cs, a, m), M += l[_] * w(e.sn, a, m);
  }
  const b = Math.exp(g), E = x * x + M * M > Wr ? Math.atan2(M, x) : Math.atan2(w(e.sn, o, s), w(e.cs, o, s));
  return { s: b, theta: E };
}
function he(e, t, r) {
  const n = Ye(t), i = n.mx + 1, o = n.my + 1, s = new Float64Array(i * o), c = new Float64Array(i * o), u = new Float64Array(i * o), l = new Uint8Array(i * o), w = Dr * Math.min(n.dx, n.dy);
  for (let g = 0; g < o; g++)
    for (let x = 0; x < i; x++) {
      const M = [n.x0 + x * n.dx, n.y0 + g * n.dy], b = zr(e, M, w, r), E = g * i + x;
      b && b.s > 0 && Number.isFinite(b.s) && (s[E] = Math.log(b.s), c[E] = Math.cos(b.theta), u[E] = Math.sin(b.theta), l[E] = 1);
    }
  const p = [];
  for (let g = 0; g < l.length; g++) l[g] && p.push(g);
  if (p.length === 0)
    s.fill(0), c.fill(1), u.fill(0);
  else
    for (let g = 0; g < o; g++)
      for (let x = 0; x < i; x++) {
        const M = g * i + x;
        if (l[M]) continue;
        let b = p[0], E = 1 / 0;
        for (const _ of p) {
          const a = _ % i, m = (_ - a) / i, f = (a - x) * (a - x) + (m - g) * (m - g);
          f < E && (E = f, b = _);
        }
        s[M] = s[b], c[M] = c[b], u[M] = u[b];
      }
  return { nx: i, ny: o, x0: n.x0, y0: n.y0, dx: n.dx, dy: n.dy, ls: s, cs: c, sn: u };
}
function Hr(e, t) {
  const r = [];
  for (let i = 0; i <= 8; i++) {
    const o = i / 8;
    r.push([t.minX + (t.maxX - t.minX) * o, t.minY]), r.push([t.minX + (t.maxX - t.minX) * o, t.maxY]), r.push([t.minX, t.minY + (t.maxY - t.minY) * o]), r.push([t.maxX, t.minY + (t.maxY - t.minY) * o]);
  }
  for (let i = 1; i <= 3; i++)
    for (let o = 1; o <= 3; o++)
      r.push([
        t.minX + (t.maxX - t.minX) * i / 4,
        t.minY + (t.maxY - t.minY) * o / 4
      ]);
  const n = [];
  for (const i of r) {
    const o = e.transform(i, !1, !0);
    Tt(o) && n.push(o);
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
function me(e, t) {
  return at(rt([e[0], e[1]]), t, { ignoreBoundary: !1 });
}
function Be(e) {
  const t = e.paperRect ?? Re(e.surface), r = Ye(t), n = e.strictness === "strict" ? void 0 : he(e.surface, t, !1), i = e.strictness === "strict_error" ? void 0 : he(e.surface, Hr(e.surface, t), !0);
  return { rect: t, spec: r, paper: n, merc: i };
}
function Qr(e, t, r) {
  if (t.strictness === "loose" || t.strictness === "strict_error")
    return e.paper ? ht(e.paper, r[0], r[1]) : null;
  const n = t.surface.transform(r, !1, !0);
  return !Tt(n) || !e.merc ? null : ht(e.merc, n[0], n[1]);
}
function Oe(e, t) {
  const r = [];
  for (let n = 0; n <= t.spec.nyInner; n++)
    for (let i = 0; i <= t.spec.nxInner; i++) {
      const o = wt + i, s = wt + n, c = [t.spec.x0 + o * t.spec.dx, t.spec.y0 + s * t.spec.dy];
      if (e.strictness === "loose" || e.strictness === "strict_error") {
        t.paper && r.push({ paper: c, ...Zr(t.paper, o, s) });
        continue;
      }
      const u = e.surface.transform(c, !1, !0);
      if (!Tt(u) || !t.merc) continue;
      const l = ht(t.merc, u[0], u[1]);
      l.s > 0 && Number.isFinite(l.s) && Number.isFinite(l.theta) && r.push({ paper: c, s: l.s, theta: l.theta });
    }
  return r;
}
function Ne(e, t, r) {
  const n = Kr(Jr(e)), i = e.regionPolygon, o = (l) => !(n && !me(l, n) || i && !me(l, i)), s = r.filter((l) => o(l.paper));
  if (s.length >= 9) return s;
  const c = mt(n ? n.geometry.coordinates[0] : i ? i.geometry.coordinates[0] : r.map((l) => l.paper)), u = [];
  for (let l = 0; l < 9; l++)
    for (let w = 0; w < 9; w++) {
      const p = [
        c.minX + (c.maxX - c.minX) * (l + 0.5) / 9,
        c.minY + (c.maxY - c.minY) * (w + 0.5) / 9
      ];
      if (!o(p)) continue;
      const g = Qr(t, e, p);
      g && g.s > 0 && Number.isFinite(g.s) && u.push({ paper: p, ...g });
    }
  return u.length ? u : s.length ? s : r;
}
function Ie(e) {
  if (!e.length) throw new Error("視点係数の標本がありません");
  let t = 0, r = 0, n = 0;
  for (const o of e)
    t += Math.log(o.s), r += Math.cos(o.theta), n += Math.sin(o.theta);
  const i = e.length;
  return { s: Math.exp(t / i), theta: Math.atan2(n / i, r / i) };
}
function de(e) {
  return e.length ? e[Math.min(e.length - 1, Math.max(0, Math.ceil(0.95 * e.length) - 1))] : 0;
}
function tn(e, t) {
  const r = [], n = [];
  for (const i of e)
    r.push(Math.abs(Ae(i.theta - t.theta))), n.push(Math.abs(i.s / t.s - 1));
  return r.sort((i, o) => i - o), n.sort((i, o) => i - o), {
    maxRotationDiffRad: r[r.length - 1] ?? 0,
    p95RotationDiffRad: de(r),
    maxScaleRatioDiff: n[n.length - 1] ?? 0,
    p95ScaleRatioDiff: de(n),
    sampleCount: e.length
  };
}
function en(e) {
  const t = e.maxRotationDiffRad, r = e.maxScaleRatioDiff;
  return t <= Vr * Math.PI / 180 && r <= Gr ? "constant" : "grid";
}
function rn(e) {
  const t = Be(e);
  return Ne(e, t, Oe(e, t));
}
class Vt {
  mode;
  strictness;
  paperGrid;
  mercGrid;
  constant;
  constructor(t, r) {
    this.mode = t, this.strictness = r;
  }
  static build(t) {
    const r = new Vt(t.mode, t.strictness), n = Be(t);
    if (t.mode === "constant") {
      const i = Ne(t, n, Oe(t, n));
      r.constant = Ie(i);
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
function Le(e, t, r, n, i) {
  Se(t, r, () => {
    const o = n ?? e.bounds ?? (e.wh ? void 0 : e.points.map(([c]) => c)), s = e.stateFull;
    e.stateFull = !1;
    try {
      return Xe(e.wh, e.xy, o).map((c) => {
        const u = i(c);
        if (u === !1) throw new Error("epsg と proj4 の照合点を三角網で変換できません");
        return u;
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
    Le(
      this,
      this.crs,
      this.projectionEngine,
      this.layerBounds,
      (t) => super.transform(t, !1, !0)
    ), this.stateTriangle = void 0;
  }
  transform(t, r, n) {
    if (r) {
      const o = Ce(t, this.crs, this.projectionEngine);
      return o === !1 ? !1 : super.transform(o, r, n);
    }
    const i = super.transform(t, r, n);
    return i === !1 ? !1 : Te(i, this.crs, this.projectionEngine);
  }
}
const gt = 256;
function Dt(e) {
  if (e.kind === "worldFile") return new Fr(e);
  if ("crs" in e && e.crs === null) throw new Error("三角網の層の CRS は null にできません");
  const t = e.crs, r = e.projectionEngine ?? st;
  if (t !== void 0 && t.epsg !== 3857) return new nn(e, t, r);
  const n = new q();
  return n.setCompiled(e.compiled), t !== void 0 && Le(n, t, r, e.bounds, (i) => n.transform(i, !1, !0)), n;
}
class ln {
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
    const r = new q();
    if (r.setCompiled(t.compiled), this.mainTin = r, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * gt;
    else if (t.compiled.wh) {
      const i = Math.max(t.compiled.wh[0], t.compiled.wh[1]), o = Math.ceil(Math.log2(i / gt));
      this._maxxy = Math.pow(2, o) * gt;
    }
    this.subTins = [];
    const n = [
      { strictness: vt(r, yt(t.compiled)) }
    ];
    if (t.sub_maps)
      for (const i of t.sub_maps) {
        const o = new q();
        o.setCompiled(i.compiled);
        const s = i.bounds ?? i.compiled.bounds;
        if (!s) throw new Error("SubMapData must have bounds or compiled.bounds to create xyBounds polygon");
        const c = [...s, s[0]], u = c.map((w) => {
          const p = o.transform(w, !1);
          if (!p) throw new Error("Failed to transform sub-map bounds to mercator");
          return p;
        }), l = lt([c]);
        this.subTins.push({
          tin: o,
          priority: i.priority,
          importance: i.importance,
          xyBounds: l,
          mercBounds: lt([u])
        }), n.push({
          strictness: vt(o, yt(i.compiled)),
          rectOverride: s,
          regionPolygon: l
        });
      }
    this._layerMetas = n, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    const r = Dt(t.main);
    t.main.priority !== void 0 && (r.priority = t.main.priority), t.main.importance !== void 0 && (r.importance = t.main.importance);
    const n = t.main.kind === "tin" ? t.main.compiled.wh : r.wh;
    let i = this._maxxy;
    if (t.maxZoom !== void 0)
      i = Math.pow(2, t.maxZoom) * gt;
    else if (n) {
      const c = Math.max(n[0], n[1]), u = Math.ceil(Math.log2(c / gt));
      i = Math.pow(2, u) * gt;
    }
    const o = [], s = [
      {
        strictness: vt(
          r,
          t.main.kind === "tin" ? yt(t.main.compiled) : void 0
        )
      }
    ];
    for (const c of t.sub_maps ?? []) {
      const u = Dt(c), l = c.bounds ?? (c.kind === "tin" ? c.compiled.bounds : void 0);
      if (!l) throw new Error("副層には bounds または compiled.bounds が必要です");
      const w = [...l, l[0]], p = w.map((x) => {
        const M = u.transform(x, !1);
        if (!M) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return M;
      }), g = lt([w]);
      o.push({
        tin: u,
        priority: c.priority ?? 0,
        importance: c.importance ?? 0,
        xyBounds: g,
        mercBounds: lt([p])
      }), s.push({
        strictness: vt(
          u,
          c.kind === "tin" ? yt(c.compiled) : void 0
        ),
        rectOverride: l,
        regionPolygon: g
      });
    }
    this.mainTin = r, this.subTins = o, this._maxxy = i, this._layerMetas = s, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
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
      const { index: i, isMain: o } = r[n];
      if (o || at(rt(t), this.subTins[i - 1].xyBounds)) {
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: c, isMain: u }) => {
      const l = this._transformByIndex(t, s, !0);
      return l === !1 ? [c, s] : u || at(rt(l), this.subTins[s - 1].xyBounds) ? [c, s, l] : [c, s];
    }).sort((s, c) => {
      const u = s[0].priority ?? 0, l = c[0].priority ?? 0;
      return u < l ? 1 : -1;
    }).reduce(
      (s, c, u, l) => {
        const w = c[0], p = c[1], g = c[2];
        if (!g) return s;
        for (let x = 0; x < u; x++) {
          const M = l[x][1], b = M === 0;
          if (l[x][2] && (b || at(rt(g), this.subTins[M - 1].xyBounds)))
            if (s.length) {
              const E = !s[0], _ = E ? s[1][2] : s[0][2], a = w.importance ?? 0, m = _.importance ?? 0;
              return E ? a < m ? s : [void 0, [p, g, w]] : [...s.filter(
                (d) => d !== void 0
              ), [p, g, w]].sort(
                (d, y) => (d[2].importance ?? 0) < (y[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[p, g, w]];
        }
        return !s.length || !s[0] ? [[p, g, w]] : (s.push([p, g, w]), s.sort((x, M) => {
          const b = x[2].importance ?? 0, E = M[2].importance ?? 0;
          return b < E ? 1 : -1;
        }).filter((x, M) => M < 2));
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
    const r = this._getAllTinsWithIndex(), n = (u) => (u === 0 ? this.mainTin?.priority : this.subTins[u - 1].priority) ?? 0, i = (u) => (u === 0 ? this.mainTin?.importance : this.subTins[u - 1].importance) ?? 0, o = (u, l) => u === 0 || at(rt(l), this.subTins[u - 1].xyBounds), s = [];
    for (const { index: u } of r) {
      const l = this._transformByIndex(t, u, !0);
      l !== !1 && o(u, l) && s.push({ index: u, xy: l });
    }
    const c = (u) => r.some(
      ({ index: l }) => l !== 0 && l !== u.index && (n(l) > n(u.index) || u.index === 0 && n(0) === 0 && n(l) === 0) && o(l, u.xy)
    );
    return s.filter((u) => !c(u)).sort((u, l) => i(l.index) - i(u.index) || n(l.index) - n(u.index) || u.index - l.index).map((u) => [u.index, u.xy]);
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
    return r.map((i, o) => {
      if (!i) {
        n = !0;
        return;
      }
      const s = i[0], c = i[1];
      return o !== 0 && !n ? [this.xy2SysCoordInternal(c)] : t.map((l, w) => w === 0 ? c : this._transformByIndex(l, s, !0)).map((l) => this.xy2SysCoordInternal(l));
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
    const i = fe(t.center, this._maxxy);
    let o, s;
    if (n !== void 0) {
      this._assertLayerIndex(n, "viewpoint2Mercs");
      const x = this.getSurfaceTransform(n).transform(i, !1, !0);
      if (!x)
        throw new Error(`viewpoint2Mercs: layer ${n} transform failed`);
      o = n, s = x;
    } else {
      const g = this.xy2MercWithLayer(i);
      if (!g) throw new Error("viewpoint2Mercs: center point is out of bounds");
      [o, s] = g;
    }
    const { s: c, theta: u } = this._evalViewpointCoefficients(o, i, s, !1), l = 2 * U / this._maxxy, w = t.zoom + Math.log2(l / c), p = t.rotation + u;
    return ae(s, w, p, r);
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
    const i = ce(t, r);
    let o, s;
    if (n !== void 0) {
      this._assertLayerIndex(n, "mercs2Viewpoint");
      const p = this.getSurfaceTransform(n).transform(i.center, !0, !0);
      if (!p)
        throw new Error(`mercs2Viewpoint: layer ${n} transform failed`);
      o = n, s = p;
    } else {
      const w = this.merc2XyWithLayer(i.center), p = w[0] || w[1];
      if (!p) throw new Error("mercs2Viewpoint: center point is out of bounds");
      [o, s] = p;
    }
    const { s: c, theta: u } = this._evalViewpointCoefficients(o, s, i.center, !0), l = 2 * U / this._maxxy;
    return {
      center: Lt(s, this._maxxy),
      zoom: i.zoom - Math.log2(l / c),
      rotation: Ae(i.rotation - u)
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
    const i = this.getSurfaceTransform(t);
    if (n === "xy2Merc") {
      const s = i.transform(r, !1, !0);
      if (!s) throw new Error("getViewpointCoefficients: transform failed");
      return this._evalViewpointCoefficients(t, r, s, !1);
    }
    const o = i.transform(r, !0, !0);
    if (!o) throw new Error("getViewpointCoefficients: transform failed");
    return this._evalViewpointCoefficients(t, o, r, !0);
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, r) {
    return Pe(t, r);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, r, n, i) {
    return ae(t, r, n, i);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, r) {
    return ce(t, r);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, r) {
    return Lt(t, r);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, r) {
    return fe(t, r);
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
    const i = this._layerMetas[t], o = Vt.build({
      surface: n,
      mode: this._viewpointMode === "constant" ? "constant" : "grid",
      strictness: i.strictness,
      paperRect: i.rectOverride ? Re(n, i.rectOverride) : void 0,
      regionPolygon: i.regionPolygon
    });
    return this._fields[t] = o, o;
  }
  /** 中心 1 点の視点係数を層の ViewpointField から引く */
  _evalViewpointCoefficients(t, r, n, i) {
    return this._fieldFor(t).eval(r, n, i);
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
    return this._getAllTinsWithIndex().sort((r, n) => {
      const i = r.tin.priority ?? 0, o = n.tin.priority ?? 0;
      return i < o ? 1 : -1;
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
    const i = this.subTins[r - 1];
    return i ? i.tin.transform(t, n, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return Lt(t, this._maxxy);
  }
}
function on(e) {
  if (!e || e.length < 3) return;
  const t = e.map((i) => [i[0], i[1]]), r = t[0], n = t[t.length - 1];
  (r[0] !== n[0] || r[1] !== n[1]) && t.push([r[0], r[1]]);
  try {
    return lt([t]);
  } catch {
    return;
  }
}
function hn(e, t) {
  const r = Dt({
    ...e,
    projectionEngine: t?.projectionEngine ?? e.projectionEngine
  }), n = e.kind === "tin" ? vt(r, yt(e.compiled)) : vt(r), i = {
    surface: r,
    strictness: n,
    regionPolygon: on(e.bounds),
    gcps: t?.gcps
  }, o = rn(i), s = Ie(o), c = tn(o, s);
  return {
    recommended: en(c),
    maxRotationDiffDeg: c.maxRotationDiffRad * 180 / Math.PI,
    p95RotationDiffDeg: c.p95RotationDiffRad * 180 / Math.PI,
    maxScaleRatioDiff: c.maxScaleRatioDiff,
    p95ScaleRatioDiff: c.p95ScaleRatioDiff,
    sampleCount: c.sampleCount
  };
}
export {
  un as JUDGE_STATISTIC,
  Or as MERC_CROSSMATRIX,
  U as MERC_MAX,
  ln as MapTransform,
  It as N_LONG,
  wt as N_MARGIN,
  kr as N_SHORT_MAX,
  jr as N_SHORT_MIN,
  Dr as PROBE_RADIUS_CELLS,
  Vr as ROTATION_THRESHOLD_DEG,
  Gr as SCALE_RATIO_THRESHOLD,
  q as Transform,
  Fr as WorldFileSurface,
  st as builtinProjectionEngine,
  an as counterTri,
  Dt as createLayerSurface,
  fn as createProj4ProjectionEngine,
  _e as crsToWorldFilePixel,
  cn as format_version,
  ae as mercViewpoint2Mercs,
  ce as mercs2MercViewpoint,
  _r as normalizeEdges,
  hn as recommendViewpointMode,
  Ur as rotateMatrix,
  sn as rotateVerticesTriangle,
  fe as sysCoord2Xy,
  yr as transformArr,
  ve as validateWorldFile,
  Me as worldFileToCrs,
  Ae as wrapAngle,
  Lt as xy2SysCoord,
  Pe as zoom2Radius
};
