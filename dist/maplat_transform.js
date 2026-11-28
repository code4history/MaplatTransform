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
  if (!Wt(e[0]) || !Wt(e[1]))
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
function Wt(e) {
  return !isNaN(e) && e !== null && !Array.isArray(e);
}
function De(e) {
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
function Ut(e) {
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
function Ve(e) {
  return e.type === "Feature" ? e.geometry : e;
}
function pe(e, t, r) {
  if (e !== null)
    for (var n, o, i, s, c, u, l, y = 0, p = 0, g, v = e.type, w = v === "FeatureCollection", b = v === "Feature", E = w ? e.features.length : 1, M = 0; M < E; M++) {
      l = w ? (
        // @ts-expect-error: Known type conflict
        e.features[M].geometry
      ) : b ? (
        // @ts-expect-error: Known type conflict
        e.geometry
      ) : e, g = l ? l.type === "GeometryCollection" : !1, c = g ? l.geometries.length : 1;
      for (var a = 0; a < c; a++) {
        var m = 0, f = 0;
        if (s = g ? l.geometries[a] : l, s !== null) {
          u = s.coordinates;
          var h = s.type;
          switch (y = 0, h) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                t(
                  u,
                  p,
                  M,
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
                    M,
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
                for (o = 0; o < u[n].length - y; o++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    t(
                      u[n][o],
                      p,
                      M,
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
                for (f = 0, o = 0; o < u[n].length; o++) {
                  for (i = 0; i < u[n][o].length - y; i++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      t(
                        u[n][o][i],
                        p,
                        M,
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
  let i, s, c, u, l = t[0], y = n[0], p = 0, g = 0;
  y > l == y > -l ? (i = l, l = t[++p]) : (i = y, y = n[++g]);
  let v = 0;
  if (p < e && g < r)
    for (y > l == y > -l ? (s = l + i, c = i - (s - l), l = t[++p]) : (s = y + i, c = i - (s - y), y = n[++g]), i = s, c !== 0 && (o[v++] = c); p < e && g < r; )
      y > l == y > -l ? (s = i + l, u = s - i, c = i - (s - u) + (l - u), l = t[++p]) : (s = i + y, u = s - i, c = i - (s - u) + (y - u), y = n[++g]), i = s, c !== 0 && (o[v++] = c);
  for (; p < e; )
    s = i + l, u = s - i, c = i - (s - u) + (l - u), l = t[++p], i = s, c !== 0 && (o[v++] = c);
  for (; g < r; )
    s = i + y, u = s - i, c = i - (s - u) + (y - u), y = n[++g], i = s, c !== 0 && (o[v++] = c);
  return (i !== 0 || v === 0) && (o[v++] = i), v;
}
function We(e, t) {
  let r = t[0];
  for (let n = 1; n < e; n++) r += t[n];
  return r;
}
function St(e) {
  return new Float64Array(e);
}
const Ue = (3 + 16 * ct) * ct, $e = (2 + 12 * ct) * ct, qe = (9 + 64 * ct) * ct * ct, pt = St(4), $t = St(8), qt = St(12), zt = St(16), Z = St(4);
function ze(e, t, r, n, o, i, s) {
  let c, u, l, y, p, g, v, w, b, E, M, a, m, f, h, d, x, _;
  const S = e - o, C = r - o, T = t - i, X = n - i;
  f = S * X, g = z * S, v = g - (g - S), w = S - v, g = z * X, b = g - (g - X), E = X - b, h = w * E - (f - v * b - w * b - v * E), d = T * C, g = z * T, v = g - (g - T), w = T - v, g = z * C, b = g - (g - C), E = C - b, x = w * E - (d - v * b - w * b - v * E), M = h - x, p = h - M, pt[0] = h - (M + p) + (p - x), a = f + M, p = a - f, m = f - (a - p) + (M - p), M = m - d, p = m - M, pt[1] = m - (M + p) + (p - d), _ = a + M, p = _ - a, pt[2] = a - (_ - p) + (M - p), pt[3] = _;
  let A = We(4, pt), O = $e * s;
  if (A >= O || -A >= O || (p = e - S, c = e - (S + p) + (p - o), p = r - C, l = r - (C + p) + (p - o), p = t - T, u = t - (T + p) + (p - i), p = n - X, y = n - (X + p) + (p - i), c === 0 && u === 0 && l === 0 && y === 0) || (O = qe * s + Ge * Math.abs(A), A += S * y + X * c - (T * l + C * u), A >= O || -A >= O)) return A;
  f = c * X, g = z * c, v = g - (g - c), w = c - v, g = z * X, b = g - (g - X), E = X - b, h = w * E - (f - v * b - w * b - v * E), d = u * C, g = z * u, v = g - (g - u), w = u - v, g = z * C, b = g - (g - C), E = C - b, x = w * E - (d - v * b - w * b - v * E), M = h - x, p = h - M, Z[0] = h - (M + p) + (p - x), a = f + M, p = a - f, m = f - (a - p) + (M - p), M = m - d, p = m - M, Z[1] = m - (M + p) + (p - d), _ = a + M, p = _ - a, Z[2] = a - (_ - p) + (M - p), Z[3] = _;
  const $ = Yt(4, pt, 4, Z, $t);
  f = S * y, g = z * S, v = g - (g - S), w = S - v, g = z * y, b = g - (g - y), E = y - b, h = w * E - (f - v * b - w * b - v * E), d = T * l, g = z * T, v = g - (g - T), w = T - v, g = z * l, b = g - (g - l), E = l - b, x = w * E - (d - v * b - w * b - v * E), M = h - x, p = h - M, Z[0] = h - (M + p) + (p - x), a = f + M, p = a - f, m = f - (a - p) + (M - p), M = m - d, p = m - M, Z[1] = m - (M + p) + (p - d), _ = a + M, p = _ - a, Z[2] = a - (_ - p) + (M - p), Z[3] = _;
  const B = Yt($, $t, 4, Z, qt);
  f = c * y, g = z * c, v = g - (g - c), w = c - v, g = z * y, b = g - (g - y), E = y - b, h = w * E - (f - v * b - w * b - v * E), d = u * l, g = z * u, v = g - (g - u), w = u - v, g = z * l, b = g - (g - l), E = l - b, x = w * E - (d - v * b - w * b - v * E), M = h - x, p = h - M, Z[0] = h - (M + p) + (p - x), a = f + M, p = a - f, m = f - (a - p) + (M - p), M = m - d, p = m - M, Z[1] = m - (M + p) + (p - d), _ = a + M, p = _ - a, Z[2] = a - (_ - p) + (M - p), Z[3] = _;
  const I = Yt(B, qt, 4, Z, zt);
  return zt[I - 1];
}
function He(e, t, r, n, o, i) {
  const s = (t - i) * (r - o), c = (e - o) * (n - i), u = s - c, l = Math.abs(s + c);
  return Math.abs(u) >= Ue * l ? u : -ze(e, t, r, n, o, i, l);
}
function Ze(e, t) {
  var r, n, o = 0, i, s, c, u, l, y, p, g = e[0], v = e[1], w = t.length;
  for (r = 0; r < w; r++) {
    n = 0;
    var b = t[r], E = b.length - 1;
    if (y = b[0], y[0] !== b[E][0] && y[1] !== b[E][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = y[0] - g, c = y[1] - v, n; n < E; n++) {
      if (p = b[n + 1], u = p[0] - g, l = p[1] - v, c === 0 && l === 0) {
        if (u <= 0 && s >= 0 || s <= 0 && u >= 0)
          return 0;
      } else if (l >= 0 && c <= 0 || l <= 0 && c >= 0) {
        if (i = He(s, u, c, l, 0, 0), i === 0)
          return 0;
        (i > 0 && l > 0 && c <= 0 || i < 0 && l <= 0 && c > 0) && o++;
      }
      y = p, c = l, s = u;
    }
  }
  return o % 2 !== 0;
}
function at(e, t, r = {}) {
  if (!e)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = De(e), o = Ve(t), i = o.type, s = t.bbox;
  let c = o.coordinates;
  if (s && Je(n, s) === !1)
    return !1;
  i === "Polygon" && (c = [c]);
  for (var u = 0; u < c.length; ++u) {
    const l = Ze(n, c[u]);
    if (l === 0 && !r.ignoreBoundary) return !0;
    if (l) return !0;
  }
  return !1;
}
function Je(e, t) {
  return t[0] <= e[0] && t[1] <= e[1] && t[2] >= e[0] && t[3] >= e[1];
}
class Ke {
  constructor(t = [], r = Qe) {
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
      let s = (t << 1) + 1, c = r[s];
      const u = s + 1;
      if (u < this.length && n(r[u], c) < 0 && (s = u, c = r[u]), n(c, i) >= 0) break;
      r[t] = c, t = s;
    }
    r[t] = i;
  }
}
function Qe(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
const tr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ke
}, Symbol.toStringTag, { value: "Module" }));
function er(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function rr(e) {
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
var Tt = { exports: {} }, Pt = { exports: {} }, nr = Pt.exports, Ht;
function ir() {
  return Ht || (Ht = 1, (function(e, t) {
    (function(r, n) {
      e.exports = n();
    })(nr, function() {
      function r(a, m, f, h, d) {
        (function x(_, S, C, T, X) {
          for (; T > C; ) {
            if (T - C > 600) {
              var A = T - C + 1, O = S - C + 1, $ = Math.log(A), B = 0.5 * Math.exp(2 * $ / 3), I = 0.5 * Math.sqrt($ * B * (A - B) / A) * (O - A / 2 < 0 ? -1 : 1), L = Math.max(C, Math.floor(S - O * B / A + I)), D = Math.min(T, Math.floor(S + (A - O) * B / A + I));
              x(_, S, L, D, X);
            }
            var P = _[S], R = C, Y = T;
            for (n(_, C, S), X(_[T], P) > 0 && n(_, C, T); R < Y; ) {
              for (n(_, R, Y), R++, Y--; X(_[R], P) < 0; ) R++;
              for (; X(_[Y], P) > 0; ) Y--;
            }
            X(_[C], P) === 0 ? n(_, C, Y) : n(_, ++Y, T), Y <= S && (C = Y + 1), S <= Y && (T = Y - 1);
          }
        })(a, m, f || 0, h || a.length - 1, d || o);
      }
      function n(a, m, f) {
        var h = a[m];
        a[m] = a[f], a[f] = h;
      }
      function o(a, m) {
        return a < m ? -1 : a > m ? 1 : 0;
      }
      var i = function(a) {
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
        for (var x = m; x < f; x++) {
          var _ = a.children[x];
          l(d, a.leaf ? h(_) : _);
        }
        return d;
      }
      function l(a, m) {
        return a.minX = Math.min(a.minX, m.minX), a.minY = Math.min(a.minY, m.minY), a.maxX = Math.max(a.maxX, m.maxX), a.maxY = Math.max(a.maxY, m.maxY), a;
      }
      function y(a, m) {
        return a.minX - m.minX;
      }
      function p(a, m) {
        return a.minY - m.minY;
      }
      function g(a) {
        return (a.maxX - a.minX) * (a.maxY - a.minY);
      }
      function v(a) {
        return a.maxX - a.minX + (a.maxY - a.minY);
      }
      function w(a, m) {
        return a.minX <= m.minX && a.minY <= m.minY && m.maxX <= a.maxX && m.maxY <= a.maxY;
      }
      function b(a, m) {
        return m.minX <= a.maxX && m.minY <= a.maxY && m.maxX >= a.minX && m.maxY >= a.minY;
      }
      function E(a) {
        return { children: a, height: 1, leaf: !0, minX: 1 / 0, minY: 1 / 0, maxX: -1 / 0, maxY: -1 / 0 };
      }
      function M(a, m, f, h, d) {
        for (var x = [m, f]; x.length; ) if (!((f = x.pop()) - (m = x.pop()) <= h)) {
          var _ = m + Math.ceil((f - m) / h / 2) * h;
          r(a, _, m, f, d), x.push(m, _, _, f);
        }
      }
      return i.prototype.all = function() {
        return this._all(this.data, []);
      }, i.prototype.search = function(a) {
        var m = this.data, f = [];
        if (!b(a, m)) return f;
        for (var h = this.toBBox, d = []; m; ) {
          for (var x = 0; x < m.children.length; x++) {
            var _ = m.children[x], S = m.leaf ? h(_) : _;
            b(a, S) && (m.leaf ? f.push(_) : w(a, S) ? this._all(_, f) : d.push(_));
          }
          m = d.pop();
        }
        return f;
      }, i.prototype.collides = function(a) {
        var m = this.data;
        if (!b(a, m)) return !1;
        for (var f = []; m; ) {
          for (var h = 0; h < m.children.length; h++) {
            var d = m.children[h], x = m.leaf ? this.toBBox(d) : d;
            if (b(a, x)) {
              if (m.leaf || w(a, x)) return !0;
              f.push(d);
            }
          }
          m = f.pop();
        }
        return !1;
      }, i.prototype.load = function(a) {
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
      }, i.prototype.insert = function(a) {
        return a && this._insert(a, this.data.height - 1), this;
      }, i.prototype.clear = function() {
        return this.data = E([]), this;
      }, i.prototype.remove = function(a, m) {
        if (!a) return this;
        for (var f, h, d, x = this.data, _ = this.toBBox(a), S = [], C = []; x || S.length; ) {
          if (x || (x = S.pop(), h = S[S.length - 1], f = C.pop(), d = !0), x.leaf) {
            var T = s(a, x.children, m);
            if (T !== -1) return x.children.splice(T, 1), S.push(x), this._condense(S), this;
          }
          d || x.leaf || !w(x, _) ? h ? (f++, x = h.children[f], d = !1) : x = null : (S.push(x), C.push(f), f = 0, h = x, x = x.children[0]);
        }
        return this;
      }, i.prototype.toBBox = function(a) {
        return a;
      }, i.prototype.compareMinX = function(a, m) {
        return a.minX - m.minX;
      }, i.prototype.compareMinY = function(a, m) {
        return a.minY - m.minY;
      }, i.prototype.toJSON = function() {
        return this.data;
      }, i.prototype.fromJSON = function(a) {
        return this.data = a, this;
      }, i.prototype._all = function(a, m) {
        for (var f = []; a; ) a.leaf ? m.push.apply(m, a.children) : f.push.apply(f, a.children), a = f.pop();
        return m;
      }, i.prototype._build = function(a, m, f, h) {
        var d, x = f - m + 1, _ = this._maxEntries;
        if (x <= _) return c(d = E(a.slice(m, f + 1)), this.toBBox), d;
        h || (h = Math.ceil(Math.log(x) / Math.log(_)), _ = Math.ceil(x / Math.pow(_, h - 1))), (d = E([])).leaf = !1, d.height = h;
        var S = Math.ceil(x / _), C = S * Math.ceil(Math.sqrt(_));
        M(a, m, f, C, this.compareMinX);
        for (var T = m; T <= f; T += C) {
          var X = Math.min(T + C - 1, f);
          M(a, T, X, S, this.compareMinY);
          for (var A = T; A <= X; A += S) {
            var O = Math.min(A + S - 1, X);
            d.children.push(this._build(a, A, O, h - 1));
          }
        }
        return c(d, this.toBBox), d;
      }, i.prototype._chooseSubtree = function(a, m, f, h) {
        for (; h.push(m), !m.leaf && h.length - 1 !== f; ) {
          for (var d = 1 / 0, x = 1 / 0, _ = void 0, S = 0; S < m.children.length; S++) {
            var C = m.children[S], T = g(C), X = (A = a, O = C, (Math.max(O.maxX, A.maxX) - Math.min(O.minX, A.minX)) * (Math.max(O.maxY, A.maxY) - Math.min(O.minY, A.minY)) - T);
            X < x ? (x = X, d = T < d ? T : d, _ = C) : X === x && T < d && (d = T, _ = C);
          }
          m = _ || m.children[0];
        }
        var A, O;
        return m;
      }, i.prototype._insert = function(a, m, f) {
        var h = f ? a : this.toBBox(a), d = [], x = this._chooseSubtree(h, this.data, m, d);
        for (x.children.push(a), l(x, h); m >= 0 && d[m].children.length > this._maxEntries; ) this._split(d, m), m--;
        this._adjustParentBBoxes(h, d, m);
      }, i.prototype._split = function(a, m) {
        var f = a[m], h = f.children.length, d = this._minEntries;
        this._chooseSplitAxis(f, d, h);
        var x = this._chooseSplitIndex(f, d, h), _ = E(f.children.splice(x, f.children.length - x));
        _.height = f.height, _.leaf = f.leaf, c(f, this.toBBox), c(_, this.toBBox), m ? a[m - 1].children.push(_) : this._splitRoot(f, _);
      }, i.prototype._splitRoot = function(a, m) {
        this.data = E([a, m]), this.data.height = a.height + 1, this.data.leaf = !1, c(this.data, this.toBBox);
      }, i.prototype._chooseSplitIndex = function(a, m, f) {
        for (var h, d, x, _, S, C, T, X = 1 / 0, A = 1 / 0, O = m; O <= f - m; O++) {
          var $ = u(a, 0, O, this.toBBox), B = u(a, O, f, this.toBBox), I = (d = $, x = B, _ = void 0, S = void 0, C = void 0, T = void 0, _ = Math.max(d.minX, x.minX), S = Math.max(d.minY, x.minY), C = Math.min(d.maxX, x.maxX), T = Math.min(d.maxY, x.maxY), Math.max(0, C - _) * Math.max(0, T - S)), L = g($) + g(B);
          I < X ? (X = I, h = O, A = L < A ? L : A) : I === X && L < A && (A = L, h = O);
        }
        return h || f - m;
      }, i.prototype._chooseSplitAxis = function(a, m, f) {
        var h = a.leaf ? this.compareMinX : y, d = a.leaf ? this.compareMinY : p;
        this._allDistMargin(a, m, f, h) < this._allDistMargin(a, m, f, d) && a.children.sort(h);
      }, i.prototype._allDistMargin = function(a, m, f, h) {
        a.children.sort(h);
        for (var d = this.toBBox, x = u(a, 0, m, d), _ = u(a, f - m, f, d), S = v(x) + v(_), C = m; C < f - m; C++) {
          var T = a.children[C];
          l(x, a.leaf ? d(T) : T), S += v(x);
        }
        for (var X = f - m - 1; X >= m; X--) {
          var A = a.children[X];
          l(_, a.leaf ? d(A) : A), S += v(_);
        }
        return S;
      }, i.prototype._adjustParentBBoxes = function(a, m, f) {
        for (var h = f; h >= 0; h--) l(m[h], a);
      }, i.prototype._condense = function(a) {
        for (var m = a.length - 1, f = void 0; m >= 0; m--) a[m].children.length === 0 ? m > 0 ? (f = a[m - 1].children).splice(f.indexOf(a[m]), 1) : this.clear() : c(a[m], this.toBBox);
      }, i;
    });
  })(Pt)), Pt.exports;
}
const or = /* @__PURE__ */ rr(tr);
var _t = { exports: {} }, Bt, Zt;
function sr() {
  return Zt || (Zt = 1, Bt = function(t, r, n, o) {
    var i = t[0], s = t[1], c = !1;
    n === void 0 && (n = 0), o === void 0 && (o = r.length);
    for (var u = (o - n) / 2, l = 0, y = u - 1; l < u; y = l++) {
      var p = r[n + l * 2 + 0], g = r[n + l * 2 + 1], v = r[n + y * 2 + 0], w = r[n + y * 2 + 1], b = g > s != w > s && i < (v - p) * (s - g) / (w - g) + p;
      b && (c = !c);
    }
    return c;
  }), Bt;
}
var Ot, Jt;
function ar() {
  return Jt || (Jt = 1, Ot = function(t, r, n, o) {
    var i = t[0], s = t[1], c = !1;
    n === void 0 && (n = 0), o === void 0 && (o = r.length);
    for (var u = o - n, l = 0, y = u - 1; l < u; y = l++) {
      var p = r[l + n][0], g = r[l + n][1], v = r[y + n][0], w = r[y + n][1], b = g > s != w > s && i < (v - p) * (s - g) / (w - g) + p;
      b && (c = !c);
    }
    return c;
  }), Ot;
}
var Kt;
function cr() {
  if (Kt) return _t.exports;
  Kt = 1;
  var e = sr(), t = ar();
  return _t.exports = function(n, o, i, s) {
    return o.length > 0 && Array.isArray(o[0]) ? t(n, o, i, s) : e(n, o, i, s);
  }, _t.exports.nested = t, _t.exports.flat = e, _t.exports;
}
var bt = { exports: {} }, fr = bt.exports, Qt;
function ur() {
  return Qt || (Qt = 1, (function(e, t) {
    (function(r, n) {
      n(t);
    })(fr, function(r) {
      const o = 33306690738754706e-32;
      function i(b, E, M, a, m) {
        let f, h, d, x, _ = E[0], S = a[0], C = 0, T = 0;
        S > _ == S > -_ ? (f = _, _ = E[++C]) : (f = S, S = a[++T]);
        let X = 0;
        if (C < b && T < M) for (S > _ == S > -_ ? (d = f - ((h = _ + f) - _), _ = E[++C]) : (d = f - ((h = S + f) - S), S = a[++T]), f = h, d !== 0 && (m[X++] = d); C < b && T < M; ) S > _ == S > -_ ? (d = f - ((h = f + _) - (x = h - f)) + (_ - x), _ = E[++C]) : (d = f - ((h = f + S) - (x = h - f)) + (S - x), S = a[++T]), f = h, d !== 0 && (m[X++] = d);
        for (; C < b; ) d = f - ((h = f + _) - (x = h - f)) + (_ - x), _ = E[++C], f = h, d !== 0 && (m[X++] = d);
        for (; T < M; ) d = f - ((h = f + S) - (x = h - f)) + (S - x), S = a[++T], f = h, d !== 0 && (m[X++] = d);
        return f === 0 && X !== 0 || (m[X++] = f), X;
      }
      function s(b) {
        return new Float64Array(b);
      }
      const c = 33306690738754716e-32, u = 22204460492503146e-32, l = 11093356479670487e-47, y = s(4), p = s(8), g = s(12), v = s(16), w = s(4);
      r.orient2d = function(b, E, M, a, m, f) {
        const h = (E - f) * (M - m), d = (b - m) * (a - f), x = h - d;
        if (h === 0 || d === 0 || h > 0 != d > 0) return x;
        const _ = Math.abs(h + d);
        return Math.abs(x) >= c * _ ? x : -(function(S, C, T, X, A, O, $) {
          let B, I, L, D, P, R, Y, V, k, F, N, j, W, G, J, K, ot, Q;
          const tt = S - A, et = T - A, nt = C - O, it = X - O;
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - ((G = tt * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = nt * et) - Y * k - V * k - Y * F))), y[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), y[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, y[2] = j - (Q - P) + (N - P), y[3] = Q;
          let ut = (function(ke, Vt) {
            let Gt = Vt[0];
            for (let Rt = 1; Rt < ke; Rt++) Gt += Vt[Rt];
            return Gt;
          })(4, y), Mt = u * $;
          if (ut >= Mt || -ut >= Mt || (B = S - (tt + (P = S - tt)) + (P - A), L = T - (et + (P = T - et)) + (P - A), I = C - (nt + (P = C - nt)) + (P - O), D = X - (it + (P = X - it)) + (P - O), B === 0 && I === 0 && L === 0 && D === 0) || (Mt = l * $ + o * Math.abs(ut), (ut += tt * D + it * B - (nt * L + et * I)) >= Mt || -ut >= Mt)) return ut;
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - ((G = B * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = I - (Y = (R = 134217729 * I) - (R - I))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = I * et) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), w[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const Le = i(4, y, 4, w, p);
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - ((G = tt * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = nt - (Y = (R = 134217729 * nt) - (R - nt))) * (F = L - (k = (R = 134217729 * L) - (R - L))) - ((K = nt * L) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), w[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const Fe = i(Le, p, 4, w, g);
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - ((G = B * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = I - (Y = (R = 134217729 * I) - (R - I))) * (F = L - (k = (R = 134217729 * L) - (R - L))) - ((K = I * L) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (W = G - ((j = G + N) - (P = j - G)) + (N - P)) - (N = W - K), w[1] = W - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const je = i(Fe, g, 4, w, v);
          return v[je - 1];
        })(b, E, M, a, m, f, _);
      }, r.orient2dfast = function(b, E, M, a, m, f) {
        return (E - f) * (M - m) - (b - m) * (a - f);
      }, Object.defineProperty(r, "__esModule", { value: !0 });
    });
  })(bt, bt.exports)), bt.exports;
}
var te;
function lr() {
  if (te) return Tt.exports;
  te = 1;
  var e = ir(), t = or, r = cr(), n = ur().orient2d;
  t.default && (t = t.default), Tt.exports = o, Tt.exports.default = o;
  function o(f, h, d) {
    h = Math.max(0, h === void 0 ? 2 : h), d = d || 0;
    var x = v(f), _ = new e(16);
    _.toBBox = function(Y) {
      return {
        minX: Y[0],
        minY: Y[1],
        maxX: Y[0],
        maxY: Y[1]
      };
    }, _.compareMinX = function(Y, V) {
      return Y[0] - V[0];
    }, _.compareMinY = function(Y, V) {
      return Y[1] - V[1];
    }, _.load(f);
    for (var S = [], C = 0, T; C < x.length; C++) {
      var X = x[C];
      _.remove(X), T = w(X, T), S.push(T);
    }
    var A = new e(16);
    for (C = 0; C < S.length; C++) A.insert(g(S[C]));
    for (var O = h * h, $ = d * d; S.length; ) {
      var B = S.shift(), I = B.p, L = B.next.p, D = b(I, L);
      if (!(D < $)) {
        var P = D / O;
        X = i(_, B.prev.p, I, L, B.next.next.p, P, A), X && Math.min(b(X, I), b(X, L)) <= P && (S.push(B), S.push(w(X, B)), _.remove(X), A.remove(B), A.insert(g(B)), A.insert(g(B.next)));
      }
    }
    B = T;
    var R = [];
    do
      R.push(B.p), B = B.next;
    while (B !== T);
    return R.push(B.p), R;
  }
  function i(f, h, d, x, _, S, C) {
    for (var T = new t([], s), X = f.data; X; ) {
      for (var A = 0; A < X.children.length; A++) {
        var O = X.children[A], $ = X.leaf ? E(O, d, x) : c(d, x, O);
        $ > S || T.push({
          node: O,
          dist: $
        });
      }
      for (; T.length && !T.peek().node.children; ) {
        var B = T.pop(), I = B.node, L = E(I, h, d), D = E(I, x, _);
        if (B.dist < L && B.dist < D && l(d, I, C) && l(x, I, C)) return I;
      }
      X = T.pop(), X && (X = X.node);
    }
    return null;
  }
  function s(f, h) {
    return f.dist - h.dist;
  }
  function c(f, h, d) {
    if (u(f, d) || u(h, d)) return 0;
    var x = M(f[0], f[1], h[0], h[1], d.minX, d.minY, d.maxX, d.minY);
    if (x === 0) return 0;
    var _ = M(f[0], f[1], h[0], h[1], d.minX, d.minY, d.minX, d.maxY);
    if (_ === 0) return 0;
    var S = M(f[0], f[1], h[0], h[1], d.maxX, d.minY, d.maxX, d.maxY);
    if (S === 0) return 0;
    var C = M(f[0], f[1], h[0], h[1], d.minX, d.maxY, d.maxX, d.maxY);
    return C === 0 ? 0 : Math.min(x, _, S, C);
  }
  function u(f, h) {
    return f[0] >= h.minX && f[0] <= h.maxX && f[1] >= h.minY && f[1] <= h.maxY;
  }
  function l(f, h, d) {
    for (var x = Math.min(f[0], h[0]), _ = Math.min(f[1], h[1]), S = Math.max(f[0], h[0]), C = Math.max(f[1], h[1]), T = d.search({ minX: x, minY: _, maxX: S, maxY: C }), X = 0; X < T.length; X++)
      if (p(T[X].p, T[X].next.p, f, h)) return !1;
    return !0;
  }
  function y(f, h, d) {
    return n(f[0], f[1], h[0], h[1], d[0], d[1]);
  }
  function p(f, h, d, x) {
    return f !== x && h !== d && y(f, h, d) > 0 != y(f, h, x) > 0 && y(d, x, f) > 0 != y(d, x, h) > 0;
  }
  function g(f) {
    var h = f.p, d = f.next.p;
    return f.minX = Math.min(h[0], d[0]), f.minY = Math.min(h[1], d[1]), f.maxX = Math.max(h[0], d[0]), f.maxY = Math.max(h[1], d[1]), f;
  }
  function v(f) {
    for (var h = f[0], d = f[0], x = f[0], _ = f[0], S = 0; S < f.length; S++) {
      var C = f[S];
      C[0] < h[0] && (h = C), C[0] > x[0] && (x = C), C[1] < d[1] && (d = C), C[1] > _[1] && (_ = C);
    }
    var T = [h, d, x, _], X = T.slice();
    for (S = 0; S < f.length; S++)
      r(f[S], T) || X.push(f[S]);
    return m(X);
  }
  function w(f, h) {
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
    var d = f[0] - h[0], x = f[1] - h[1];
    return d * d + x * x;
  }
  function E(f, h, d) {
    var x = h[0], _ = h[1], S = d[0] - x, C = d[1] - _;
    if (S !== 0 || C !== 0) {
      var T = ((f[0] - x) * S + (f[1] - _) * C) / (S * S + C * C);
      T > 1 ? (x = d[0], _ = d[1]) : T > 0 && (x += S * T, _ += C * T);
    }
    return S = f[0] - x, C = f[1] - _, S * S + C * C;
  }
  function M(f, h, d, x, _, S, C, T) {
    var X = d - f, A = x - h, O = C - _, $ = T - S, B = f - _, I = h - S, L = X * X + A * A, D = X * O + A * $, P = O * O + $ * $, R = X * B + A * I, Y = O * B + $ * I, V = L * P - D * D, k, F, N, j, W = V, G = V;
    V === 0 ? (F = 0, W = 1, j = Y, G = P) : (F = D * Y - P * R, j = L * Y - D * R, F < 0 ? (F = 0, j = Y, G = P) : F > W && (F = W, j = Y + D, G = P)), j < 0 ? (j = 0, -R < 0 ? F = 0 : -R > L ? F = W : (F = -R, W = L)) : j > G && (j = G, -R + D < 0 ? F = 0 : -R + D > L ? F = W : (F = -R + D, W = L)), k = F === 0 ? 0 : F / W, N = j === 0 ? 0 : j / G;
    var J = (1 - k) * f + k * d, K = (1 - k) * h + k * x, ot = (1 - N) * _ + N * C, Q = (1 - N) * S + N * T, tt = ot - J, et = Q - K;
    return tt * tt + et * et;
  }
  function a(f, h) {
    return f[0] === h[0] ? f[1] - h[1] : f[0] - h[0];
  }
  function m(f) {
    f.sort(a);
    for (var h = [], d = 0; d < f.length; d++) {
      for (; h.length >= 2 && y(h[h.length - 2], h[h.length - 1], f[d]) <= 0; )
        h.pop();
      h.push(f[d]);
    }
    for (var x = [], _ = f.length - 1; _ >= 0; _--) {
      for (; x.length >= 2 && y(x[x.length - 2], x[x.length - 1], f[_]) <= 0; )
        x.pop();
      x.push(f[_]);
    }
    return x.pop(), h.pop(), h.concat(x);
  }
  return Tt.exports;
}
var hr = lr();
const mr = /* @__PURE__ */ er(hr);
function dr(e, t = {}) {
  t.concavity = t.concavity || 1 / 0;
  const r = [];
  if (pe(e, (o) => {
    r.push([o[0], o[1]]);
  }), !r.length)
    return null;
  const n = mr(r, t.concavity);
  return n.length > 3 ? lt([n], t.properties) : null;
}
function At(e, t, r) {
  if (r) {
    const n = e.geometry.coordinates, o = H(n[0], r.xOrigin, r.xUnit, r.gridNum), i = H(n[1], r.yOrigin, r.yUnit, r.gridNum), s = r.gridCache[o]?.[i] ?? [];
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
function ge(e, t) {
  const r = t.geometry.coordinates[0][0], n = t.geometry.coordinates[0][1], o = t.geometry.coordinates[0][2], i = e.geometry.coordinates, s = t.properties.a.geom, c = t.properties.b.geom, u = t.properties.c.geom, l = [n[0] - r[0], n[1] - r[1]], y = [o[0] - r[0], o[1] - r[1]], p = [i[0] - r[0], i[1] - r[1]], g = [c[0] - s[0], c[1] - s[1]], v = [u[0] - s[0], u[1] - s[1]], w = (y[1] * p[0] - y[0] * p[1]) / (l[0] * y[1] - l[1] * y[0]), b = (l[0] * p[1] - l[1] * p[0]) / (l[0] * y[1] - l[1] * y[0]);
  return [
    w * g[0] + b * v[0] + s[0],
    w * g[1] + b * v[1] + s[1]
  ];
}
function pr(e, t, r) {
  const n = e.geometry.coordinates, o = r.geometry.coordinates, i = Math.atan2(n[0] - o[0], n[1] - o[1]), s = xr(i, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const c = t[1][s];
  return ge(e, c.features[0]);
}
function gr(e, t, r, n, o, i, s, c, u) {
  let l = u;
  if (!l && s && (l = At(e, dt([s]))), !l)
    if (r) {
      const y = e.geometry.coordinates, p = r.gridNum, g = r.xOrigin, v = r.yOrigin, w = r.xUnit, b = r.yUnit, E = r.gridCache, M = H(y[0], g, w, p), a = H(y[1], v, b, p), m = E[M] ? E[M][a] ? E[M][a] : [] : [], f = dt(m.map((h) => t.features[h]));
      l = At(e, f);
    } else
      l = At(e, t);
  return c && c(l), l ? ge(e, l) : pr(e, n, o);
}
function H(e, t, r, n) {
  let o = Math.floor((e - t) / r);
  return o < 0 && (o = 0), o >= n && (o = n - 1), o;
}
const yr = 36;
function ee(e, t, r) {
  const n = (t[1][0] - t[0][0]) / r, o = (t[1][1] - t[0][1]) / r;
  return e.reduce((i, s) => {
    const c = H(s[0][0], t[0][0], n, r), u = H(s[1][0], t[0][0], n, r), l = H(s[0][1], t[0][1], o, r), y = H(s[1][1], t[0][1], o, r), p = (u - c + 1) * (y - l + 1);
    return p > 0 ? i + p : i;
  }, 0);
}
function xr(e, t) {
  let r = re(e - t[0]), n = Math.PI * 2, o;
  for (let i = 0; i < t.length; i++) {
    const s = (i + 1) % t.length, c = re(e - t[s]), u = Math.min(Math.abs(r), Math.abs(c));
    r * c <= 0 && u < n && (n = u, o = i), r = c;
  }
  return o;
}
function re(e, t = !1) {
  const r = 2 * Math.PI, n = e - Math.floor(e / r) * r;
  return t ? n : n > Math.PI ? n - r : n;
}
function on(e) {
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
function sn(e) {
  const t = ["a", "b", "c", "a"].map(
    (i) => e.properties[i].geom
  ), r = e.geometry.coordinates[0], n = e.properties, o = {
    a: { geom: r[0], index: n.a.index },
    b: { geom: r[1], index: n.b.index },
    c: { geom: r[2], index: n.c.index }
  };
  return lt([t], o);
}
function wr(e) {
  const t = [0, 1, 2, 0].map((n) => e[n][0][0]), r = {
    a: { geom: e[0][0][1], index: e[0][1] },
    b: { geom: e[1][0][1], index: e[1][1] },
    c: { geom: e[2][0][1], index: e[2][1] }
  };
  return lt([t], r);
}
function Lt(e, t, r, n, o, i = !1, s) {
  const c = e.map(
    (u) => {
      (!s || s < 2.00703) && (u = vr(u));
      const l = isFinite(u) ? t[u] : u === "c" ? n : (function() {
        const y = u.match(/^b(\d+)$/);
        if (y) return o[parseInt(y[1])];
        const p = u.match(/^e(\d+)$/);
        if (p) return r[parseInt(p[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[l[1], l[0]], u] : [[l[0], l[1]], u];
    }
  );
  return wr(c);
}
function vr(e) {
  return typeof e == "number" ? e : e.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function Mr(e, t) {
  return t && t >= 2.00703 || Array.isArray(e[0]) ? e : e.map((r) => [
    r.illstNodes,
    r.mercNodes,
    r.startEnd
  ]);
}
const ye = 2.00704;
function _r(e) {
  return !!(e.version !== void 0 || !e.tins && e.points && e.tins_points);
}
function br(e) {
  return {
    points: e.points,
    strictStatus: yt(e),
    verticesParams: Sr(e),
    centroid: Cr(e),
    edges: Mr(e.edges || []),
    edgeNodes: e.edgeNodes || [],
    tins: Tr(e),
    kinks: Xr(e.kinks_points),
    yaxisMode: e.yaxisMode ?? "invert",
    strictMode: e.strictMode ?? "auto",
    vertexMode: e.vertexMode,
    bounds: e.bounds,
    boundsPolygon: e.boundsPolygon,
    wh: e.wh,
    xy: e.xy ?? [0, 0]
  };
}
function Er(e) {
  const t = Pr(e), r = t.tins, n = t.vertices_params;
  return n != null && xe(n), {
    compiled: t,
    tins: r,
    points: Ar(r),
    strictStatus: t.strict_status,
    verticesParams: n,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function yt(e) {
  return e.strict_status ? e.strict_status : e.kinks_points ? "strict_error" : Array.isArray(e.tins_points) && e.tins_points.length === 2 ? "loose" : "strict";
}
function Sr(e) {
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
    const i = (o + 1) % r, s = Lt(
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
function Tr(e) {
  const t = e.tins_points.length === 1 ? 0 : 1;
  return {
    forw: dt(
      e.tins_points[0].map(
        (r) => Lt(
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
        (r) => Lt(
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
function Xr(e) {
  if (e)
    return {
      bakw: dt(
        e.map((t) => rt(t))
      )
    };
}
function Pr(e) {
  return JSON.parse(
    JSON.stringify(e).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Ar(e) {
  const t = [], r = e.forw.features;
  for (let n = 0; n < r.length; n++) {
    const o = r[n];
    ["a", "b", "c"].forEach((i, s) => {
      const c = o.geometry.coordinates[0][s], u = o.properties[i].geom, l = o.properties[i].index;
      typeof l == "number" && (t[l] = [c, u]);
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
const an = ye;
function xt(e, t, r) {
  return (t[0] - e[0]) * (r[1] - e[1]) - (t[1] - e[1]) * (r[0] - e[0]);
}
function Et(e, t, r, n = 0) {
  return e[0] >= Math.min(t[0], r[0]) - n && e[0] <= Math.max(t[0], r[0]) + n && e[1] >= Math.min(t[1], r[1]) - n && e[1] <= Math.max(t[1], r[1]) + n;
}
function Rr(e, t, r, n) {
  const o = xt(e, t, r), i = xt(e, t, n), s = xt(r, n, e), c = xt(r, n, t);
  return o === 0 && Et(r, e, t) || i === 0 && Et(n, e, t) || s === 0 && Et(e, r, n) || c === 0 && Et(t, r, n) ? !0 : Math.sign(o) * Math.sign(i) === -1 && Math.sign(s) * Math.sign(c) === -1;
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
      if (!(r === 0 && i === e.length - 1) && Rr(n, o, e[i], e[(i + 1) % e.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(t);
}
function Yr(e, t) {
  let r = !1;
  for (let n = 0, o = t.length - 1; n < t.length; o = n++) {
    const i = t[o], s = t[n], [c, u] = i, [l, y] = s, p = l - c, g = y - u, v = e[0] - c, w = e[1] - u, b = Number.EPSILON * 16 * Math.max(1, Math.abs(c), Math.abs(u), Math.abs(l), Math.abs(y), Math.abs(e[0]), Math.abs(e[1])), E = Math.hypot(p, g), M = b * E + Number.EPSILON * 16 * (Math.abs(v * g) + Math.abs(w * p));
    if (Math.abs(xt(i, s, e)) <= M && Et(e, i, s, b)) return "edge";
    u > e[1] != y > e[1] && e[0] < (l - c) * (e[1] - u) / (y - u) + c && (r = !r);
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
      if (!Array.isArray(l) || l.length < 4 || l.some((v) => !Array.isArray(v) || v.length < 2 || v.some((w) => !Array.isArray(w) || w.length < 2 || !w.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const y = ie(l.map((v) => v[0])), p = ie(l.map((v) => v[1])), g = t.yaxisMode === q.YAXIS_FOLLOW ? -p : p;
      if (y === g)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const i = n === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = _r(i) ? br(i) : Er(i), u = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"].map((l) => [l, this[l]]));
    try {
      "compiled" in s ? this.applyLegacyState(s) : this.applyModernState(s), this.outerTransform = n ?? "extrapolate", this.worldFile = o, this.outerVertices = n === "worldFile" ? t.vertices_points : void 0, this.outerRings = this.outerVertices ? { forw: this.outerVertices.map((l) => l[0]), bakw: this.outerVertices.map((l) => l[1]) } : void 0, this.validateCompiledProjection();
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
    const t = this.tins, r = t.forw, n = t.bakw, o = Math.ceil(Math.sqrt(r.features.length));
    if (o < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], s = [];
    const c = r.features.map((E) => {
      let M = [];
      return Ut(E)[0].map((a) => {
        i.length === 0 ? i = [Array.from(a), Array.from(a)] : (a[0] < i[0][0] && (i[0][0] = a[0]), a[0] > i[1][0] && (i[1][0] = a[0]), a[1] < i[0][1] && (i[0][1] = a[1]), a[1] > i[1][1] && (i[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    }), u = n.features.map((E) => {
      let M = [];
      return Ut(E)[0].map((a) => {
        s.length === 0 ? s = [Array.from(a), Array.from(a)] : (a[0] < s[0][0] && (s[0][0] = a[0]), a[0] > s[1][0] && (s[1][0] = a[0]), a[1] < s[0][1] && (s[0][1] = a[1]), a[1] > s[1][1] && (s[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    });
    if (Math.max(
      ee(c, i, o),
      ee(u, s, o)
    ) > yr * r.features.length) {
      this.indexedTins = void 0;
      return;
    }
    const y = (i[1][0] - i[0][0]) / o, p = (i[1][1] - i[0][1]) / o, g = c.reduce(
      (E, M, a) => {
        const m = H(M[0][0], i[0][0], y, o), f = H(M[1][0], i[0][0], y, o), h = H(M[0][1], i[0][1], p, o), d = H(M[1][1], i[0][1], p, o);
        for (let x = m; x <= f; x++) {
          E[x] || (E[x] = []);
          for (let _ = h; _ <= d; _++)
            E[x][_] || (E[x][_] = []), E[x][_].push(a);
        }
        return E;
      },
      []
    ), v = (s[1][0] - s[0][0]) / o, w = (s[1][1] - s[0][1]) / o, b = u.reduce(
      (E, M, a) => {
        const m = H(M[0][0], s[0][0], v, o), f = H(M[1][0], s[0][0], v, o), h = H(M[0][1], s[0][1], w, o), d = H(M[1][1], s[0][1], w, o);
        for (let x = m; x <= f; x++) {
          E[x] || (E[x] = []);
          for (let _ = h; _ <= d; _++)
            E[x][_] || (E[x][_] = []), E[x][_].push(a);
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
        xUnit: y,
        yUnit: p,
        gridCache: g
      },
      bakw: {
        gridNum: o,
        xOrigin: s[0][0],
        yOrigin: s[0][1],
        xUnit: v,
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
    const s = r ? this.tins.bakw : this.tins.forw, c = r ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let u;
    if (this.outerTransform === "worldFile") {
      const w = r ? this.outerRings?.bakw : this.outerRings?.forw, b = w ? Yr(i.geometry.coordinates, w) : "outside";
      if (r && this.strict_status == q.STATUS_ERROR && b !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (b === "inside" && s && (u = At(i, s, c)), !u) {
        const E = r ? Me(this.worldFile, o) : ve(this.worldFile, o);
        return !E.every(Number.isFinite) || r && this.bounds && !n && !at(rt(E), this.boundsPolygon) ? !1 : E;
      }
    }
    const l = r ? this.vertices_params.bakw : this.vertices_params.forw, y = r ? this.centroid.bakw : this.centroid.forw;
    let p, g;
    this.stateFull && (this.stateBackward == r ? p = this.stateTriangle : (this.stateBackward = r, this.stateTriangle = void 0), g = (w) => {
      this.stateTriangle = w;
    });
    let v = gr(
      i,
      s,
      c,
      l,
      y,
      void 0,
      p,
      g,
      u
    );
    if (this.bounds && r && !n) {
      const w = rt(v);
      if (!at(w, this.boundsPolygon)) return !1;
    } else this.yaxisMode == q.YAXIS_FOLLOW && !r && (v = [v[0], -1 * v[1]]);
    return v;
  }
}
const U = 20037508342789244e-9, Br = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], Xt = 6378137, Nt = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function ft(e) {
  return e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function Or(e, t) {
  const r = t.trim().split(/\s+/).map((i) => {
    const [s, ...c] = i.replace(/^\+/, "").split("="), u = s.toLowerCase(), l = c.join("="), y = c.length > 0;
    if (u === "axis" && (!y || l !== "enu"))
      throw new Error("worldFile は東・北の順で書き、+axis を外してください");
    if ((u === "no_defs" || u === "wktext") && !y) return "";
    if (y && l === "") throw new Error(`+${u}= は許可されていません`);
    if (u === "wktext") throw new Error("+wktext は許可されていません");
    if (u === "type" && !y) throw new Error("+type は値が必要です");
    if (u === "type" && l.toLowerCase() === "crs" || u === "axis") return "";
    if (u === "towgs84") {
      const g = l.split(",");
      if (!y || g.some((w) => w.trim() === ""))
        throw new Error("+towgs84 は数値の値が必要です");
      if ([3, 7].includes(g.length) && g.every((w) => {
        const b = w.trim().split(/[eE]/, 1)[0].replace(/[+\-.]/g, "");
        return Number.isFinite(Number(w)) && !/[1-9]/.test(b);
      })) return "";
    }
    const p = l ? l.split(",").map((g) => {
      const v = Number(g);
      return g.trim() !== "" && Number.isFinite(v) ? Object.is(v, -0) ? "0" : String(v) : g.toLowerCase();
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
    const o = r * Math.PI / 180, i = n * Math.PI / 180, s = [
      Math.abs(r) === 180 ? Math.sign(r) * U : Xt * o,
      Math.abs(n) === Nt ? Math.sign(n) * U : Xt * Math.log(Math.tan(Math.PI / 4 + i / 2))
    ];
    return s.every(Number.isFinite) ? s : !1;
  }
}, _e = { epsg: 3857 }, oe = { epsg: 4326 }, Nr = "+proj=longlat +datum=WGS84";
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
    Or(e.epsg, o);
  else if (t === st)
    throw new Error("この CRS には proj4 に対応する投影エンジンが必要です");
}
function cn(e) {
  const t = /* @__PURE__ */ new Map();
  function r(i) {
    const s = t.get(i);
    if (s) return s;
    be(i);
    try {
      const c = e(i, Nr);
      return t.set(i, c), c;
    } catch (c) {
      throw new Error(`proj4 定義を読み込めません（${String(c)}）`, { cause: c });
    }
  }
  function n(i, [s, c]) {
    const u = i.inverse([s, c, 0], !0), l = u[2];
    return Number.isFinite(l) && Math.abs(l) > 1e-6 ? i.inverse([s, c, -l], !0) : u;
  }
  function o(i, s, c) {
    if (!ft(i)) return !1;
    try {
      const u = c(r(s), [i[0], i[1]]);
      return ft(u) ? [u[0], u[1]] : !1;
    } catch {
      return !1;
    }
  }
  return {
    toLonLat(i, s) {
      if (Ft(s)) return st.toLonLat(i, s);
      if (!s.proj4) return !1;
      const c = o(
        i,
        s.proj4.trim(),
        (u, l) => u.forward(l)
      );
      return c === !1 ? !1 : st.toLonLat(c, oe);
    },
    fromLonLat(i, s) {
      return Ft(s) ? st.fromLonLat(i, s) : !s.proj4 || st.fromLonLat(i, oe) === !1 ? !1 : o(i, s.proj4.trim(), n);
    },
    validateDefinition(i, s) {
      if (i.proj4 === void 0) return;
      const c = i.proj4.trim();
      if (r(c), !s) return;
      const u = i.epsg === 3857 ? 1e-3 : 1e-8;
      for (const l of s) {
        const y = st.toLonLat(l, i), p = y === !1 ? !1 : o(y, c, (g, v) => g.inverse(v));
        if (p === !1 || Math.hypot(p[0] - l[0], p[1] - l[1]) > u)
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
    for (const [c, u] of r)
      n = Math.min(n, c), o = Math.min(o, u), i = Math.max(i, c), s = Math.max(s, u);
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
class Lr {
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
      const n = r.map((c) => c[0]), o = r.map((c) => c[1]), i = Math.min(...n), s = Math.min(...o);
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
      return this.crs.epsg === 3857 ? s.every((c) => Math.abs(c) <= U) ? s : !1 : Se(s, this.crs, this.projectionEngine);
    }
    if (this.crs.epsg === 3857) {
      if (Math.abs(t[0]) > U || Math.abs(t[1]) > U) return !1;
      const s = this.crsToXy(t);
      return ft(s) ? s : !1;
    }
    const o = Ce(t, this.crs, this.projectionEngine);
    if (o === !1) return !1;
    const i = this.crsToXy(o);
    return ft(i) ? i : !1;
  }
}
const Fr = 16, jr = 8, fn = 16, wt = 2, kr = 1, un = "max", Dr = 1, Vr = 0.02, Gr = 1e-24;
function Xe(e, t) {
  return Math.floor(Math.min(e[0], e[1]) / 4) * U / 128 / Math.pow(2, t);
}
function Wr(e, t) {
  const r = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n], i = o[0] * Math.cos(t) - o[1] * Math.sin(t), s = o[0] * Math.sin(t) + o[1] * Math.cos(t);
    r.push([i, s]);
  }
  return r;
}
function se(e, t, r, n) {
  const o = Xe(n, t);
  return Wr(Br, r).map((c) => [
    c[0] * o + e[0],
    c[1] * o + e[1]
  ]);
}
function ae(e, t) {
  const r = e[0], o = e.slice(1, 5).map((v) => [
    v[0] - r[0],
    v[1] - r[1]
  ]), i = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0]
  ];
  let s = 0, c = 0, u = 0;
  for (let v = 0; v < 4; v++) {
    const w = o[v], b = i[v], E = Math.sqrt(Math.pow(w[0], 2) + Math.pow(w[1], 2));
    s += E;
    const M = w[0] * b[1] - w[1] * b[0], a = w[0] * b[0] + w[1] * b[1], m = -Math.atan2(M, a);
    c += Math.cos(m), u += Math.sin(m);
  }
  const l = s / 4, y = Math.atan2(u, c), p = Math.floor(Math.min(t[0], t[1]) / 4), g = Math.log(p * U / 128 / l) / Math.log(2);
  return { center: r, zoom: g, rotation: y };
}
function Pe(e) {
  const t = e - 2 * Math.PI * Math.round(e / (2 * Math.PI));
  return t === -Math.PI ? Math.PI : t;
}
function It(e, t) {
  const r = e[0] * (2 * U) / t - U, n = -1 * (e[1] * (2 * U) / t - U);
  return [r, n];
}
function ce(e, t) {
  const r = (e[0] + U) * t / (2 * U), n = (-e[1] + U) * t / (2 * U);
  return [r, n];
}
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
function Re(e, t = Fr) {
  const r = e.maxX - e.minX, n = e.maxY - e.minY;
  if (!(r > 0) || !(n > 0))
    throw new Error("視点グリッドの基準矩形に面積がありません");
  const o = Math.max(r, n), i = Math.min(r, n), s = Math.min(
    t,
    Math.max(jr, Math.round(t * i / o))
  ), c = r >= n ? t : s, u = r >= n ? s : t, l = r / c, y = n / u;
  return {
    x0: e.minX - wt * l,
    y0: e.minY - wt * y,
    dx: l,
    dy: y,
    mx: c + 2 * wt,
    my: u + 2 * wt,
    nxInner: c,
    nyInner: u
  };
}
function Ur(e, t, r, n) {
  const o = !n, i = [[r, 0], [-r, 0], [0, r], [0, -r]], s = [];
  for (const c of i) {
    const u = o ? [t[0] + c[0], t[1] - c[1]] : [t[0] + c[0], t[1] + c[1]], l = e.transform(u, n, !0);
    Ct(l) && s.push({ d: c, out: l });
  }
  return { valid: s, center: e.transform(t, n, !0) };
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
function $r(e, t, r) {
  let n = 0, o = 0, i = 0;
  for (const { d: l, out: y } of e) {
    const [p, g] = jt(y, r), v = l[0], w = l[1], b = p - t[0], E = g - t[1];
    n += v * b + w * E, o += v * E - w * b, i += v * v + w * w;
  }
  if (!(i > 0)) return null;
  const s = n / i, c = o / i, u = Math.hypot(s, c);
  return !(u > 0) || !Number.isFinite(u) ? null : r ? { s: 1 / u, theta: -Math.atan2(c, s) } : { s: u, theta: Math.atan2(c, s) };
}
function ue(e) {
  return e ? { s: 1 / e.s, theta: -e.theta } : null;
}
function qr(e, t, r, n) {
  const { valid: o, center: i } = Ur(e, t, r, n), s = Ct(i) ? jt(i, n) : null, c = (g, v) => {
    const w = o.find((b) => b.d[0] === g && b.d[1] === v);
    return w ? jt(w.out, n) : void 0;
  };
  if (o.length >= 4) {
    const g = c(r, 0), v = c(-r, 0), w = c(0, r), b = c(0, -r), E = fe(
      (g[0] - v[0]) / (2 * r),
      (w[0] - b[0]) / (2 * r),
      (g[1] - v[1]) / (2 * r),
      (w[1] - b[1]) / (2 * r)
    );
    return n ? ue(E) : E;
  }
  if (!s) return null;
  const u = (g) => g[1] === 0, l = o.filter((g) => u(g.d)), y = o.filter((g) => !u(g.d)), p = l.length >= 1 && y.length >= 1;
  if (o.length >= 3 || o.length === 2 && p) {
    const g = (E, M) => E && M ? [(E[0] - M[0]) / (2 * r), (E[1] - M[1]) / (2 * r)] : E ? [(E[0] - s[0]) / r, (E[1] - s[1]) / r] : M ? [(s[0] - M[0]) / r, (s[1] - M[1]) / r] : null, v = g(c(r, 0), c(-r, 0)), w = g(c(0, r), c(0, -r));
    if (!v || !w) return null;
    const b = fe(v[0], w[0], v[1], w[1]);
    return n ? ue(b) : b;
  }
  return o.length === 2 ? $r(o, s, n) : null;
}
function ht(e, t, r) {
  const n = Math.min(Math.max((t - e.x0) / e.dx, 0), e.nx - 1), o = Math.min(Math.max((r - e.y0) / e.dy, 0), e.ny - 1), i = Math.min(Math.floor(n), e.nx - 2), s = Math.min(Math.floor(o), e.ny - 2), c = n - i, u = o - s, l = [
    (1 - c) * (1 - u),
    c * (1 - u),
    (1 - c) * u,
    c * u
  ], y = (M, a, m) => M[m * e.nx + a], p = [[i, s], [i + 1, s], [i, s + 1], [i + 1, s + 1]];
  let g = 0, v = 0, w = 0;
  for (let M = 0; M < 4; M++) {
    const [a, m] = p[M];
    g += l[M] * y(e.ls, a, m), v += l[M] * y(e.cs, a, m), w += l[M] * y(e.sn, a, m);
  }
  const b = Math.exp(g), E = v * v + w * w > Gr ? Math.atan2(w, v) : Math.atan2(y(e.sn, i, s), y(e.cs, i, s));
  return { s: b, theta: E };
}
function le(e, t, r, n = kr, o) {
  const i = Re(t, o), s = i.mx + 1, c = i.my + 1, u = new Float64Array(s * c), l = new Float64Array(s * c), y = new Float64Array(s * c), p = new Uint8Array(s * c), g = n * Math.min(i.dx, i.dy);
  for (let w = 0; w < c; w++)
    for (let b = 0; b < s; b++) {
      const E = [i.x0 + b * i.dx, i.y0 + w * i.dy], M = qr(e, E, g, r), a = w * s + b;
      M && M.s > 0 && Number.isFinite(M.s) && (u[a] = Math.log(M.s), l[a] = Math.cos(M.theta), y[a] = Math.sin(M.theta), p[a] = 1);
    }
  const v = [];
  for (let w = 0; w < p.length; w++) p[w] && v.push(w);
  if (v.length === 0)
    u.fill(0), l.fill(1), y.fill(0);
  else
    for (let w = 0; w < c; w++)
      for (let b = 0; b < s; b++) {
        const E = w * s + b;
        if (p[E]) continue;
        let M = v[0], a = 1 / 0;
        for (const m of v) {
          const f = m % s, h = (m - f) / s, d = (f - b) * (f - b) + (h - w) * (h - w);
          d < a && (a = d, M = m);
        }
        u[E] = u[M], l[E] = l[M], y[E] = y[M];
      }
  return { nx: s, ny: c, x0: i.x0, y0: i.y0, dx: i.dx, dy: i.dy, ls: u, cs: l, sn: y };
}
function zr(e, t) {
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
function Hr(e, t, r) {
  const n = r * e.nx + t;
  return { s: Math.exp(e.ls[n]), theta: Math.atan2(e.sn[n], e.cs[n]) };
}
function Zr(e) {
  return e.gcps?.length ? e.gcps.map((r) => r[0].slice(0, 2)) : e.surface.points?.map((r) => r[0].slice(0, 2)) ?? [];
}
function Jr(e) {
  return e.length < 3 ? null : dr(dt(e.map((t) => rt([t[0], t[1]]))));
}
function he(e, t) {
  return at(rt([e[0], e[1]]), t, { ignoreBoundary: !1 });
}
function Ye(e) {
  const t = e.paperRect ?? Ae(e.surface), r = Re(t, e.nLong), n = e.strictness === "strict" ? void 0 : le(e.surface, t, !1, e.probeRadiusCells, e.nLong), o = e.strictness === "strict_error" ? void 0 : le(
    e.surface,
    zr(e.surface, t),
    !0,
    e.probeRadiusCells,
    e.nLong
  );
  return { rect: t, spec: r, paper: n, merc: o };
}
function Kr(e, t, r) {
  if (t.strictness === "loose" || t.strictness === "strict_error")
    return e.paper ? ht(e.paper, r[0], r[1]) : null;
  const n = t.surface.transform(r, !1, !0);
  return !Ct(n) || !e.merc ? null : ht(e.merc, n[0], n[1]);
}
function Be(e, t) {
  const r = [];
  for (let n = 0; n <= t.spec.nyInner; n++)
    for (let o = 0; o <= t.spec.nxInner; o++) {
      const i = wt + o, s = wt + n, c = [t.spec.x0 + i * t.spec.dx, t.spec.y0 + s * t.spec.dy];
      if (e.strictness === "loose" || e.strictness === "strict_error") {
        t.paper && r.push({ paper: c, ...Hr(t.paper, i, s) });
        continue;
      }
      const u = e.surface.transform(c, !1, !0);
      if (!Ct(u) || !t.merc) continue;
      const l = ht(t.merc, u[0], u[1]);
      l.s > 0 && Number.isFinite(l.s) && Number.isFinite(l.theta) && r.push({ paper: c, s: l.s, theta: l.theta });
    }
  return r;
}
function Oe(e, t, r) {
  const n = Jr(Zr(e)), o = e.regionPolygon, i = (l) => !(n && !he(l, n) || o && !he(l, o)), s = r.filter((l) => i(l.paper));
  if (s.length >= 9) return s;
  const c = mt(n ? n.geometry.coordinates[0] : o ? o.geometry.coordinates[0] : r.map((l) => l.paper)), u = [];
  for (let l = 0; l < 9; l++)
    for (let y = 0; y < 9; y++) {
      const p = [
        c.minX + (c.maxX - c.minX) * (l + 0.5) / 9,
        c.minY + (c.maxY - c.minY) * (y + 0.5) / 9
      ];
      if (!i(p)) continue;
      const g = Kr(t, e, p);
      g && g.s > 0 && Number.isFinite(g.s) && u.push({ paper: p, ...g });
    }
  return u.length ? u : s.length ? s : r;
}
function Ne(e) {
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
function Qr(e, t) {
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
function tn(e) {
  const t = e.maxRotationDiffRad, r = e.maxScaleRatioDiff;
  return t <= Dr * Math.PI / 180 && r <= Vr ? "constant" : "grid";
}
function en(e) {
  const t = Ye(e);
  return Oe(e, t, Be(e, t));
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
    const r = new Dt(t.mode, t.strictness), n = Ye(t);
    if (t.mode === "constant") {
      const o = Oe(t, n, Be(t, n));
      r.constant = Ne(o);
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
    const i = n ?? e.bounds ?? (e.wh ? void 0 : e.points.map(([c]) => c)), s = e.stateFull;
    e.stateFull = !1;
    try {
      return Te(e.wh, e.xy, i).map((c) => {
        const u = o(c);
        if (u === !1) throw new Error("epsg と proj4 の照合点を三角網で変換できません");
        return u;
      });
    } finally {
      e.stateFull = s;
    }
  });
}
class rn extends q {
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
  if (e.kind === "worldFile") return new Lr(e);
  if ("crs" in e && e.crs === null) throw new Error("三角網の層の CRS は null にできません");
  const t = e.crs, r = e.projectionEngine ?? st;
  if (t !== void 0 && t.epsg !== 3857) return new rn(e, t, r);
  const n = new q();
  return n.setCompiled(e.compiled), t !== void 0 && Ie(n, t, r, e.bounds, (o) => n.transform(o, !1, !0)), n;
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
  /** ViewpointField の分割数・プローブ半径の上書き（実測用。省略時は viewpoint-constants の既定値） */
  _fieldParams = {};
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
        const c = [...s, s[0]], u = c.map((y) => {
          const p = i.transform(y, !1);
          if (!p) throw new Error("Failed to transform sub-map bounds to mercator");
          return p;
        }), l = lt([c]);
        this.subTins.push({
          tin: i,
          priority: o.priority,
          importance: o.importance,
          xyBounds: l,
          mercBounds: lt([u])
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
    const r = kt(t.main);
    t.main.priority !== void 0 && (r.priority = t.main.priority), t.main.importance !== void 0 && (r.importance = t.main.importance);
    const n = t.main.kind === "tin" ? t.main.compiled.wh : r.wh;
    let o = this._maxxy;
    if (t.maxZoom !== void 0)
      o = Math.pow(2, t.maxZoom) * gt;
    else if (n) {
      const c = Math.max(n[0], n[1]), u = Math.ceil(Math.log2(c / gt));
      o = Math.pow(2, u) * gt;
    }
    const i = [], s = [
      {
        strictness: vt(
          r,
          t.main.kind === "tin" ? yt(t.main.compiled) : void 0
        )
      }
    ];
    for (const c of t.sub_maps ?? []) {
      const u = kt(c), l = c.bounds ?? (c.kind === "tin" ? c.compiled.bounds : void 0);
      if (!l) throw new Error("副層には bounds または compiled.bounds が必要です");
      const y = [...l, l[0]], p = y.map((v) => {
        const w = u.transform(v, !1);
        if (!w) throw new Error("副層の bounds をメルカトル座標へ変換できません");
        return w;
      }), g = lt([y]);
      i.push({
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
    this.mainTin = r, this.subTins = i, this._maxxy = o, this._layerMetas = s, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
  }
  /** 読み込み時の地図全体の視点変換モード（未指定は "grid"） */
  get viewpointMode() {
    return this._viewpointMode;
  }
  /**
   * ViewpointField の分割数（nLong）・4 点プローブ半径（probeRadiusCells）を上書きする（実測用）。
   * 呼び出し済みの層の格子は破棄され、次の視点変換で組み直される。
   * 省略した項目は viewpoint-constants の既定値に戻る。
   */
  setViewpointFieldParams(t) {
    this._fieldParams = { ...t }, this._fields = [];
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
    return this._assertMapData(), this._getAllTinsWithIndex().map(({ index: s, tin: c, isMain: u }) => {
      const l = this._transformByIndex(t, s, !0);
      return l === !1 ? [c, s] : u || at(rt(l), this.subTins[s - 1].xyBounds) ? [c, s, l] : [c, s];
    }).sort((s, c) => {
      const u = s[0].priority ?? 0, l = c[0].priority ?? 0;
      return u < l ? 1 : -1;
    }).reduce(
      (s, c, u, l) => {
        const y = c[0], p = c[1], g = c[2];
        if (!g) return s;
        for (let v = 0; v < u; v++) {
          const w = l[v][1], b = w === 0;
          if (l[v][2] && (b || at(rt(g), this.subTins[w - 1].xyBounds)))
            if (s.length) {
              const E = !s[0], M = E ? s[1][2] : s[0][2], a = y.importance ?? 0, m = M.importance ?? 0;
              return E ? a < m ? s : [void 0, [p, g, y]] : [...s.filter(
                (d) => d !== void 0
              ), [p, g, y]].sort(
                (d, x) => (d[2].importance ?? 0) < (x[2].importance ?? 0) ? 1 : -1
              ).slice(0, 2);
            } else
              return [[p, g, y]];
        }
        return !s.length || !s[0] ? [[p, g, y]] : (s.push([p, g, y]), s.sort((v, w) => {
          const b = v[2].importance ?? 0, E = w[2].importance ?? 0;
          return b < E ? 1 : -1;
        }).filter((v, w) => w < 2));
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
    const r = this._getAllTinsWithIndex(), n = (u) => (u === 0 ? this.mainTin?.priority : this.subTins[u - 1].priority) ?? 0, o = (u) => (u === 0 ? this.mainTin?.importance : this.subTins[u - 1].importance) ?? 0, i = (u, l) => u === 0 || at(rt(l), this.subTins[u - 1].xyBounds), s = [];
    for (const { index: u } of r) {
      const l = this._transformByIndex(t, u, !0);
      l !== !1 && i(u, l) && s.push({ index: u, xy: l });
    }
    const c = (u) => r.some(
      ({ index: l }) => l !== 0 && l !== u.index && (n(l) > n(u.index) || u.index === 0 && n(0) === 0 && n(l) === 0) && i(l, u.xy)
    );
    return s.filter((u) => !c(u)).sort((u, l) => o(l.index) - o(u.index) || n(l.index) - n(u.index) || u.index - l.index).map((u) => [u.index, u.xy]);
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
      const s = o[0], c = o[1];
      return i !== 0 && !n ? [this.xy2SysCoordInternal(c)] : t.map((l, y) => y === 0 ? c : this._transformByIndex(l, s, !0)).map((l) => this.xy2SysCoordInternal(l));
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
      const v = this.getSurfaceTransform(n).transform(o, !1, !0);
      if (!v)
        throw new Error(`viewpoint2Mercs: layer ${n} transform failed`);
      i = n, s = v;
    } else {
      const g = this.xy2MercWithLayer(o);
      if (!g) throw new Error("viewpoint2Mercs: center point is out of bounds");
      [i, s] = g;
    }
    const { s: c, theta: u } = this._evalViewpointCoefficients(i, o, s, !1), l = 2 * U / this._maxxy, y = t.zoom + Math.log2(l / c), p = t.rotation + u;
    return se(s, y, p, r);
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
      const y = this.merc2XyWithLayer(o.center), p = y[0] || y[1];
      if (!p) throw new Error("mercs2Viewpoint: center point is out of bounds");
      [i, s] = p;
    }
    const { s: c, theta: u } = this._evalViewpointCoefficients(i, s, o.center, !0), l = 2 * U / this._maxxy;
    return {
      center: It(s, this._maxxy),
      zoom: o.zoom - Math.log2(l / c),
      rotation: Pe(o.rotation - u)
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
    return It(t, r);
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
      regionPolygon: o.regionPolygon,
      nLong: this._fieldParams.nLong,
      probeRadiusCells: this._fieldParams.probeRadiusCells
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
    return It(t, this._maxxy);
  }
}
function nn(e) {
  if (!e || e.length < 3) return;
  const t = e.map((o) => [o[0], o[1]]), r = t[0], n = t[t.length - 1];
  (r[0] !== n[0] || r[1] !== n[1]) && t.push([r[0], r[1]]);
  try {
    return lt([t]);
  } catch {
    return;
  }
}
function hn(e, t) {
  const r = kt({
    ...e,
    projectionEngine: t?.projectionEngine ?? e.projectionEngine
  }), n = e.kind === "tin" ? vt(r, yt(e.compiled)) : vt(r), o = {
    surface: r,
    strictness: n,
    regionPolygon: nn(e.bounds),
    gcps: t?.gcps
  }, i = en(o), s = Ne(i), c = Qr(i, s);
  return {
    recommended: tn(c),
    maxRotationDiffDeg: c.maxRotationDiffRad * 180 / Math.PI,
    p95RotationDiffDeg: c.p95RotationDiffRad * 180 / Math.PI,
    maxScaleRatioDiff: c.maxScaleRatioDiff,
    p95ScaleRatioDiff: c.p95ScaleRatioDiff,
    sampleCount: c.sampleCount
  };
}
export {
  un as JUDGE_STATISTIC,
  Br as MERC_CROSSMATRIX,
  U as MERC_MAX,
  ln as MapTransform,
  Fr as N_LONG,
  wt as N_MARGIN,
  fn as N_SHORT_MAX,
  jr as N_SHORT_MIN,
  kr as PROBE_RADIUS_CELLS,
  Dr as ROTATION_THRESHOLD_DEG,
  Vr as SCALE_RATIO_THRESHOLD,
  q as Transform,
  Lr as WorldFileSurface,
  st as builtinProjectionEngine,
  sn as counterTri,
  kt as createLayerSurface,
  cn as createProj4ProjectionEngine,
  Me as crsToWorldFilePixel,
  an as format_version,
  se as mercViewpoint2Mercs,
  ae as mercs2MercViewpoint,
  Mr as normalizeEdges,
  hn as recommendViewpointMode,
  Wr as rotateMatrix,
  on as rotateVerticesTriangle,
  ce as sysCoord2Xy,
  gr as transformArr,
  we as validateWorldFile,
  ve as worldFileToCrs,
  Pe as wrapAngle,
  It as xy2SysCoord,
  Xe as zoom2Radius
};
