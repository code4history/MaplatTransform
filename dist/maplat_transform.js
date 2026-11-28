function de(e, t, n = {}) {
  const r = { type: "Feature" };
  return (n.id === 0 || n.id) && (r.id = n.id), n.bbox && (r.bbox = n.bbox), r.properties = t || {}, r.geometry = e, r;
}
function nt(e, t, n = {}) {
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
  }, t, n);
}
function lt(e, t, n = {}) {
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
  }, t, n);
}
function dt(e, t = {}) {
  const n = { type: "FeatureCollection" };
  return t.id && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.features = e, n;
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
function pe(e, t, n) {
  if (e !== null)
    for (var r, o, i, s, u, f, l, x = 0, p = 0, y, _ = e.type, w = _ === "FeatureCollection", b = _ === "Feature", E = w ? e.features.length : 1, M = 0; M < E; M++) {
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
              for (r = 0; r < f.length; r++) {
                if (
                  // @ts-expect-error: Known type conflict
                  t(
                    f[r],
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
              for (r = 0; r < f.length; r++) {
                for (o = 0; o < f[r].length - x; o++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    t(
                      f[r][o],
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
              for (r = 0; r < f.length; r++) {
                for (c = 0, o = 0; o < f[r].length; o++) {
                  for (i = 0; i < f[r][o].length - x; i++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      t(
                        f[r][o][i],
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
              for (r = 0; r < s.geometries.length; r++)
                if (
                  // @ts-expect-error: Known type conflict
                  pe(s.geometries[r], t) === !1
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
function Yt(e, t, n, r, o) {
  let i, s, u, f, l = t[0], x = r[0], p = 0, y = 0;
  x > l == x > -l ? (i = l, l = t[++p]) : (i = x, x = r[++y]);
  let _ = 0;
  if (p < e && y < n)
    for (x > l == x > -l ? (s = l + i, u = i - (s - l), l = t[++p]) : (s = x + i, u = i - (s - x), x = r[++y]), i = s, u !== 0 && (o[_++] = u); p < e && y < n; )
      x > l == x > -l ? (s = i + l, f = s - i, u = i - (s - f) + (l - f), l = t[++p]) : (s = i + x, f = s - i, u = i - (s - f) + (x - f), x = r[++y]), i = s, u !== 0 && (o[_++] = u);
  for (; p < e; )
    s = i + l, f = s - i, u = i - (s - f) + (l - f), l = t[++p], i = s, u !== 0 && (o[_++] = u);
  for (; y < n; )
    s = i + x, f = s - i, u = i - (s - f) + (x - f), x = r[++y], i = s, u !== 0 && (o[_++] = u);
  return (i !== 0 || _ === 0) && (o[_++] = i), _;
}
function We(e, t) {
  let n = t[0];
  for (let r = 1; r < e; r++) n += t[r];
  return n;
}
function St(e) {
  return new Float64Array(e);
}
const Ue = (3 + 16 * ct) * ct, qe = (2 + 12 * ct) * ct, ze = (9 + 64 * ct) * ct * ct, pt = St(4), Ut = St(8), qt = St(12), zt = St(16), Z = St(4);
function He(e, t, n, r, o, i, s) {
  let u, f, l, x, p, y, _, w, b, E, M, a, d, c, h, m, g, v;
  const S = e - o, C = n - o, T = t - i, X = r - i;
  c = S * X, y = z * S, _ = y - (y - S), w = S - _, y = z * X, b = y - (y - X), E = X - b, h = w * E - (c - _ * b - w * b - _ * E), m = T * C, y = z * T, _ = y - (y - T), w = T - _, y = z * C, b = y - (y - C), E = C - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, pt[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, pt[1] = d - (M + p) + (p - m), v = a + M, p = v - a, pt[2] = a - (v - p) + (M - p), pt[3] = v;
  let A = We(4, pt), O = qe * s;
  if (A >= O || -A >= O || (p = e - S, u = e - (S + p) + (p - o), p = n - C, l = n - (C + p) + (p - o), p = t - T, f = t - (T + p) + (p - i), p = r - X, x = r - (X + p) + (p - i), u === 0 && f === 0 && l === 0 && x === 0) || (O = ze * s + Ge * Math.abs(A), A += S * x + X * u - (T * l + C * f), A >= O || -A >= O)) return A;
  c = u * X, y = z * u, _ = y - (y - u), w = u - _, y = z * X, b = y - (y - X), E = X - b, h = w * E - (c - _ * b - w * b - _ * E), m = f * C, y = z * f, _ = y - (y - f), w = f - _, y = z * C, b = y - (y - C), E = C - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const U = Yt(4, pt, 4, Z, Ut);
  c = S * x, y = z * S, _ = y - (y - S), w = S - _, y = z * x, b = y - (y - x), E = x - b, h = w * E - (c - _ * b - w * b - _ * E), m = T * l, y = z * T, _ = y - (y - T), w = T - _, y = z * l, b = y - (y - l), E = l - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const B = Yt(U, Ut, 4, Z, qt);
  c = u * x, y = z * u, _ = y - (y - u), w = u - _, y = z * x, b = y - (y - x), E = x - b, h = w * E - (c - _ * b - w * b - _ * E), m = f * l, y = z * f, _ = y - (y - f), w = f - _, y = z * l, b = y - (y - l), E = l - b, g = w * E - (m - _ * b - w * b - _ * E), M = h - g, p = h - M, Z[0] = h - (M + p) + (p - g), a = c + M, p = a - c, d = c - (a - p) + (M - p), M = d - m, p = d - M, Z[1] = d - (M + p) + (p - m), v = a + M, p = v - a, Z[2] = a - (v - p) + (M - p), Z[3] = v;
  const L = Yt(B, qt, 4, Z, zt);
  return zt[L - 1];
}
function Ze(e, t, n, r, o, i) {
  const s = (t - i) * (n - o), u = (e - o) * (r - i), f = s - u, l = Math.abs(s + u);
  return Math.abs(f) >= Ue * l ? f : -He(e, t, n, r, o, i, l);
}
function Je(e, t) {
  var n, r, o = 0, i, s, u, f, l, x, p, y = e[0], _ = e[1], w = t.length;
  for (n = 0; n < w; n++) {
    r = 0;
    var b = t[n], E = b.length - 1;
    if (x = b[0], x[0] !== b[E][0] && x[1] !== b[E][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (s = x[0] - y, u = x[1] - _, r; r < E; r++) {
      if (p = b[r + 1], f = p[0] - y, l = p[1] - _, u === 0 && l === 0) {
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
function at(e, t, n = {}) {
  if (!e)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const r = Ve(e), o = $e(t), i = o.type, s = t.bbox;
  let u = o.coordinates;
  if (s && Ke(r, s) === !1)
    return !1;
  i === "Polygon" && (u = [u]);
  for (var f = 0; f < u.length; ++f) {
    const l = Je(r, u[f]);
    if (l === 0 && !n.ignoreBoundary) return !0;
    if (l) return !0;
  }
  return !1;
}
function Ke(e, t) {
  return t[0] <= e[0] && t[1] <= e[1] && t[2] >= e[0] && t[3] >= e[1];
}
class Qe {
  constructor(t = [], n = tn) {
    if (this.data = t, this.length = this.data.length, this.compare = n, this.length > 0)
      for (let r = (this.length >> 1) - 1; r >= 0; r--) this._down(r);
  }
  push(t) {
    this.data.push(t), this.length++, this._up(this.length - 1);
  }
  pop() {
    if (this.length === 0) return;
    const t = this.data[0], n = this.data.pop();
    return this.length--, this.length > 0 && (this.data[0] = n, this._down(0)), t;
  }
  peek() {
    return this.data[0];
  }
  _up(t) {
    const { data: n, compare: r } = this, o = n[t];
    for (; t > 0; ) {
      const i = t - 1 >> 1, s = n[i];
      if (r(o, s) >= 0) break;
      n[t] = s, t = i;
    }
    n[t] = o;
  }
  _down(t) {
    const { data: n, compare: r } = this, o = this.length >> 1, i = n[t];
    for (; t < o; ) {
      let s = (t << 1) + 1, u = n[s];
      const f = s + 1;
      if (f < this.length && r(n[f], u) < 0 && (s = f, u = n[f]), r(u, i) >= 0) break;
      n[t] = u, t = s;
    }
    n[t] = i;
  }
}
function tn(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
const en = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Qe
}, Symbol.toStringTag, { value: "Module" }));
function nn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
function rn(e) {
  if (Object.prototype.hasOwnProperty.call(e, "__esModule")) return e;
  var t = e.default;
  if (typeof t == "function") {
    var n = function r() {
      var o = !1;
      try {
        o = this instanceof r;
      } catch {
      }
      return o ? Reflect.construct(t, arguments, this.constructor) : t.apply(this, arguments);
    };
    n.prototype = t.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(e).forEach(function(r) {
    var o = Object.getOwnPropertyDescriptor(e, r);
    Object.defineProperty(n, r, o.get ? o : {
      enumerable: !0,
      get: function() {
        return e[r];
      }
    });
  }), n;
}
var Tt = { exports: {} }, Pt = { exports: {} }, on = Pt.exports, Ht;
function sn() {
  return Ht || (Ht = 1, (function(e, t) {
    (function(n, r) {
      e.exports = r();
    })(on, function() {
      function n(a, d, c, h, m) {
        (function g(v, S, C, T, X) {
          for (; T > C; ) {
            if (T - C > 600) {
              var A = T - C + 1, O = S - C + 1, U = Math.log(A), B = 0.5 * Math.exp(2 * U / 3), L = 0.5 * Math.sqrt(U * B * (A - B) / A) * (O - A / 2 < 0 ? -1 : 1), I = Math.max(C, Math.floor(S - O * B / A + L)), D = Math.min(T, Math.floor(S + (A - O) * B / A + L));
              g(v, S, I, D, X);
            }
            var P = v[S], R = C, Y = T;
            for (r(v, C, S), X(v[T], P) > 0 && r(v, C, T); R < Y; ) {
              for (r(v, R, Y), R++, Y--; X(v[R], P) < 0; ) R++;
              for (; X(v[Y], P) > 0; ) Y--;
            }
            X(v[C], P) === 0 ? r(v, C, Y) : r(v, ++Y, T), Y <= S && (C = Y + 1), S <= Y && (T = Y - 1);
          }
        })(a, d, c || 0, h || a.length - 1, m || o);
      }
      function r(a, d, c) {
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
          n(a, v, d, c, m), g.push(d, v, v, c);
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
const an = /* @__PURE__ */ rn(en);
var _t = { exports: {} }, Bt, Zt;
function cn() {
  return Zt || (Zt = 1, Bt = function(t, n, r, o) {
    var i = t[0], s = t[1], u = !1;
    r === void 0 && (r = 0), o === void 0 && (o = n.length);
    for (var f = (o - r) / 2, l = 0, x = f - 1; l < f; x = l++) {
      var p = n[r + l * 2 + 0], y = n[r + l * 2 + 1], _ = n[r + x * 2 + 0], w = n[r + x * 2 + 1], b = y > s != w > s && i < (_ - p) * (s - y) / (w - y) + p;
      b && (u = !u);
    }
    return u;
  }), Bt;
}
var Ot, Jt;
function fn() {
  return Jt || (Jt = 1, Ot = function(t, n, r, o) {
    var i = t[0], s = t[1], u = !1;
    r === void 0 && (r = 0), o === void 0 && (o = n.length);
    for (var f = o - r, l = 0, x = f - 1; l < f; x = l++) {
      var p = n[l + r][0], y = n[l + r][1], _ = n[x + r][0], w = n[x + r][1], b = y > s != w > s && i < (_ - p) * (s - y) / (w - y) + p;
      b && (u = !u);
    }
    return u;
  }), Ot;
}
var Kt;
function un() {
  if (Kt) return _t.exports;
  Kt = 1;
  var e = cn(), t = fn();
  return _t.exports = function(r, o, i, s) {
    return o.length > 0 && Array.isArray(o[0]) ? t(r, o, i, s) : e(r, o, i, s);
  }, _t.exports.nested = t, _t.exports.flat = e, _t.exports;
}
var bt = { exports: {} }, ln = bt.exports, Qt;
function hn() {
  return Qt || (Qt = 1, (function(e, t) {
    (function(n, r) {
      r(t);
    })(ln, function(n) {
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
      n.orient2d = function(b, E, M, a, d, c) {
        const h = (E - c) * (M - d), m = (b - d) * (a - c), g = h - m;
        if (h === 0 || m === 0 || h > 0 != m > 0) return g;
        const v = Math.abs(h + m);
        return Math.abs(g) >= u * v ? g : -(function(S, C, T, X, A, O, U) {
          let B, L, I, D, P, R, Y, V, k, F, N, j, G, $, J, K, ot, Q;
          const tt = S - A, et = T - A, rt = C - O, it = X - O;
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - (($ = tt * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = rt - (Y = (R = 134217729 * rt) - (R - rt))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = rt * et) - Y * k - V * k - Y * F))), x[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), x[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, x[2] = j - (Q - P) + (N - P), x[3] = Q;
          let ut = (function(De, Vt) {
            let $t = Vt[0];
            for (let Rt = 1; Rt < De; Rt++) $t += Vt[Rt];
            return $t;
          })(4, x), Mt = f * U;
          if (ut >= Mt || -ut >= Mt || (B = S - (tt + (P = S - tt)) + (P - A), I = T - (et + (P = T - et)) + (P - A), L = C - (rt + (P = C - rt)) + (P - O), D = X - (it + (P = X - it)) + (P - O), B === 0 && L === 0 && I === 0 && D === 0) || (Mt = l * U + o * Math.abs(ut), (ut += tt * D + it * B - (rt * I + et * L)) >= Mt || -ut >= Mt)) return ut;
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = it - (k = (R = 134217729 * it) - (R - it))) - (($ = B * it) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = L - (Y = (R = 134217729 * L) - (R - L))) * (F = et - (k = (R = 134217729 * et) - (R - et))) - ((K = L * et) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const Fe = i(4, x, 4, w, p);
          P = (J = (V = tt - (Y = (R = 134217729 * tt) - (R - tt))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - (($ = tt * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = rt - (Y = (R = 134217729 * rt) - (R - rt))) * (F = I - (k = (R = 134217729 * I) - (R - I))) - ((K = rt * I) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const je = i(Fe, p, 4, w, y);
          P = (J = (V = B - (Y = (R = 134217729 * B) - (R - B))) * (F = D - (k = (R = 134217729 * D) - (R - D))) - (($ = B * D) - Y * k - V * k - Y * F)) - (N = J - (ot = (V = L - (Y = (R = 134217729 * L) - (R - L))) * (F = I - (k = (R = 134217729 * I) - (R - I))) - ((K = L * I) - Y * k - V * k - Y * F))), w[0] = J - (N + P) + (P - ot), P = (G = $ - ((j = $ + N) - (P = j - $)) + (N - P)) - (N = G - K), w[1] = G - (N + P) + (P - K), P = (Q = j + N) - j, w[2] = j - (Q - P) + (N - P), w[3] = Q;
          const ke = i(je, y, 4, w, _);
          return _[ke - 1];
        })(b, E, M, a, d, c, v);
      }, n.orient2dfast = function(b, E, M, a, d, c) {
        return (E - c) * (M - d) - (b - d) * (a - c);
      }, Object.defineProperty(n, "__esModule", { value: !0 });
    });
  })(bt, bt.exports)), bt.exports;
}
var te;
function mn() {
  if (te) return Tt.exports;
  te = 1;
  var e = sn(), t = an, n = un(), r = hn().orient2d;
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
    return r(c[0], c[1], h[0], h[1], m[0], m[1]);
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
      n(c[S], T) || X.push(c[S]);
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
var dn = mn();
const pn = /* @__PURE__ */ nn(dn);
function gn(e, t = {}) {
  t.concavity = t.concavity || 1 / 0;
  const n = [];
  if (pe(e, (o) => {
    n.push([o[0], o[1]]);
  }), !n.length)
    return null;
  const r = pn(n, t.concavity);
  return r.length > 3 ? lt([r], t.properties) : null;
}
function At(e, t, n) {
  if (n) {
    const r = e.geometry.coordinates, o = H(r[0], n.xOrigin, n.xUnit, n.gridNum), i = H(r[1], n.yOrigin, n.yUnit, n.gridNum), s = n.gridCache[o]?.[i] ?? [];
    for (const u of s) {
      const f = t.features[u];
      if (f && at(e, f)) return f;
    }
    return;
  }
  for (let r = 0; r < t.features.length; r++)
    if (at(e, t.features[r]))
      return t.features[r];
}
function ge(e, t) {
  const n = t.geometry.coordinates[0][0], r = t.geometry.coordinates[0][1], o = t.geometry.coordinates[0][2], i = e.geometry.coordinates, s = t.properties.a.geom, u = t.properties.b.geom, f = t.properties.c.geom, l = [r[0] - n[0], r[1] - n[1]], x = [o[0] - n[0], o[1] - n[1]], p = [i[0] - n[0], i[1] - n[1]], y = [u[0] - s[0], u[1] - s[1]], _ = [f[0] - s[0], f[1] - s[1]], w = (x[1] * p[0] - x[0] * p[1]) / (l[0] * x[1] - l[1] * x[0]), b = (l[0] * p[1] - l[1] * p[0]) / (l[0] * x[1] - l[1] * x[0]);
  return [
    w * y[0] + b * _[0] + s[0],
    w * y[1] + b * _[1] + s[1]
  ];
}
function yn(e, t, n) {
  const r = e.geometry.coordinates, o = n.geometry.coordinates, i = Math.atan2(r[0] - o[0], r[1] - o[1]), s = vn(i, t[0]);
  if (s === void 0)
    throw new Error("Unable to determine vertex index");
  const u = t[1][s];
  return ge(e, u.features[0]);
}
function xn(e, t, n, r, o, i, s, u, f) {
  let l = f;
  if (!l && s && (l = At(e, dt([s]))), !l)
    if (n) {
      const x = e.geometry.coordinates, p = n.gridNum, y = n.xOrigin, _ = n.yOrigin, w = n.xUnit, b = n.yUnit, E = n.gridCache, M = H(x[0], y, w, p), a = H(x[1], _, b, p), d = E[M] ? E[M][a] ? E[M][a] : [] : [], c = dt(d.map((h) => t.features[h]));
      l = At(e, c);
    } else
      l = At(e, t);
  return u && u(l), l ? ge(e, l) : yn(e, r, o);
}
function H(e, t, n, r) {
  let o = Math.floor((e - t) / n);
  return o < 0 && (o = 0), o >= r && (o = r - 1), o;
}
const wn = 36;
function ee(e, t, n) {
  const r = (t[1][0] - t[0][0]) / n, o = (t[1][1] - t[0][1]) / n;
  return e.reduce((i, s) => {
    const u = H(s[0][0], t[0][0], r, n), f = H(s[1][0], t[0][0], r, n), l = H(s[0][1], t[0][1], o, n), x = H(s[1][1], t[0][1], o, n), p = (f - u + 1) * (x - l + 1);
    return p > 0 ? i + p : i;
  }, 0);
}
function vn(e, t) {
  let n = ne(e - t[0]), r = Math.PI * 2, o;
  for (let i = 0; i < t.length; i++) {
    const s = (i + 1) % t.length, u = ne(e - t[s]), f = Math.min(Math.abs(n), Math.abs(u));
    n * u <= 0 && f < r && (r = f, o = i), n = u;
  }
  return o;
}
function ne(e, t = !1) {
  const n = 2 * Math.PI, r = e - Math.floor(e / n) * n;
  return t ? r : r > Math.PI ? r - n : r;
}
function ar(e) {
  const t = e.features;
  for (let n = 0; n < t.length; n++) {
    const r = t[n];
    `${r.properties.a.index}`.substring(0, 1) === "b" && `${r.properties.b.index}`.substring(0, 1) === "b" ? t[n] = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            r.geometry.coordinates[0][2],
            r.geometry.coordinates[0][0],
            r.geometry.coordinates[0][1],
            r.geometry.coordinates[0][2]
          ]
        ]
      },
      properties: {
        a: {
          geom: r.properties.c.geom,
          index: r.properties.c.index
        },
        b: {
          geom: r.properties.a.geom,
          index: r.properties.a.index
        },
        c: {
          geom: r.properties.b.geom,
          index: r.properties.b.index
        }
      },
      type: "Feature"
    } : `${r.properties.c.index}`.substring(0, 1) === "b" && `${r.properties.a.index}`.substring(0, 1) === "b" && (t[n] = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            r.geometry.coordinates[0][1],
            r.geometry.coordinates[0][2],
            r.geometry.coordinates[0][0],
            r.geometry.coordinates[0][1]
          ]
        ]
      },
      properties: {
        a: {
          geom: r.properties.b.geom,
          index: r.properties.b.index
        },
        b: {
          geom: r.properties.c.geom,
          index: r.properties.c.index
        },
        c: {
          geom: r.properties.a.geom,
          index: r.properties.a.index
        }
      },
      type: "Feature"
    });
  }
  return e;
}
function cr(e) {
  const t = ["a", "b", "c", "a"].map(
    (i) => e.properties[i].geom
  ), n = e.geometry.coordinates[0], r = e.properties, o = {
    a: { geom: n[0], index: r.a.index },
    b: { geom: n[1], index: r.b.index },
    c: { geom: n[2], index: r.c.index }
  };
  return lt([t], o);
}
function Mn(e) {
  const t = [0, 1, 2, 0].map((r) => e[r][0][0]), n = {
    a: { geom: e[0][0][1], index: e[0][1] },
    b: { geom: e[1][0][1], index: e[1][1] },
    c: { geom: e[2][0][1], index: e[2][1] }
  };
  return lt([t], n);
}
function It(e, t, n, r, o, i = !1, s) {
  const u = e.map(
    (f) => {
      (!s || s < 2.00703) && (f = _n(f));
      const l = isFinite(f) ? t[f] : f === "c" ? r : (function() {
        const x = f.match(/^b(\d+)$/);
        if (x) return o[parseInt(x[1])];
        const p = f.match(/^e(\d+)$/);
        if (p) return n[parseInt(p[1])];
        throw new Error("Bad index value for indexesToTri");
      })();
      return i ? [[l[1], l[0]], f] : [[l[0], l[1]], f];
    }
  );
  return Mn(u);
}
function _n(e) {
  return typeof e == "number" ? e : e.replace(/^(c|e|b)(?:ent|dgeNode|box)(\d+)?$/, "$1$2");
}
function bn(e, t) {
  return t && t >= 2.00703 || Array.isArray(e[0]) ? e : e.map((n) => [
    n.illstNodes,
    n.mercNodes,
    n.startEnd
  ]);
}
const ye = 2.00704;
function En(e) {
  return !!(e.version !== void 0 || !e.tins && e.points && e.tins_points);
}
function Sn(e) {
  return {
    points: e.points,
    strictStatus: yt(e),
    verticesParams: Tn(e),
    centroid: Xn(e),
    edges: bn(e.edges || []),
    edgeNodes: e.edgeNodes || [],
    tins: Pn(e),
    kinks: An(e.kinks_points),
    yaxisMode: e.yaxisMode ?? "invert",
    strictMode: e.strictMode ?? "auto",
    vertexMode: e.vertexMode,
    bounds: e.bounds,
    boundsPolygon: e.boundsPolygon,
    wh: e.wh,
    xy: e.xy ?? [0, 0]
  };
}
function Cn(e) {
  const t = Rn(e), n = t.tins, r = t.vertices_params;
  return r != null && xe(r), {
    compiled: t,
    tins: n,
    points: Yn(n),
    strictStatus: t.strict_status,
    verticesParams: r,
    centroid: t.centroid,
    kinks: t.kinks
  };
}
function yt(e) {
  return e.strict_status ? e.strict_status : e.kinks_points ? "strict_error" : Array.isArray(e.tins_points) && e.tins_points.length === 2 ? "loose" : "strict";
}
function Tn(e) {
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
  return t.forw[1] = re(e, !1), t.bakw[1] = re(e, !0), xe(t), t;
}
function xe(e) {
  if (typeof e != "object")
    throw new Error("Invalid compiled data: vertices_params has a wrong shape");
  ["forw", "bakw"].forEach((t) => {
    const n = e[t];
    if (n == null) return;
    const r = `vertices_params.${t}`, o = n[0], i = n[1];
    if (!Array.isArray(o) || !Array.isArray(i))
      throw new Error(`Invalid compiled data: ${r} must hold two arrays`);
    if (o.length !== i.length)
      throw new Error(
        `Invalid compiled data: ${r} must have one angle per vertex`
      );
    for (let s = 0; s < o.length; s++)
      if (typeof o[s] != "number" || !Number.isFinite(o[s]))
        throw new Error(
          `Invalid compiled data: ${r} must contain only finite numbers`
        );
  });
}
function re(e, t) {
  const n = e.vertices_points.length;
  return Array.from({ length: n }, (r, o) => {
    const i = (o + 1) % n, s = It(
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
function Xn(e) {
  return {
    forw: nt(e.centroid_point[0], {
      target: {
        geom: e.centroid_point[1],
        index: "c"
      }
    }),
    bakw: nt(e.centroid_point[1], {
      target: {
        geom: e.centroid_point[0],
        index: "c"
      }
    })
  };
}
function Pn(e) {
  const t = e.tins_points.length === 1 ? 0 : 1;
  return {
    forw: dt(
      e.tins_points[0].map(
        (n) => It(
          n,
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
        (n) => It(
          n,
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
function An(e) {
  if (e)
    return {
      bakw: dt(
        e.map((t) => nt(t))
      )
    };
}
function Rn(e) {
  return JSON.parse(
    JSON.stringify(e).replace('"cent"', '"c"').replace(/"bbox(\d+)"/g, '"b$1"')
  );
}
function Yn(e) {
  const t = [], n = e.forw.features;
  for (let r = 0; r < n.length; r++) {
    const o = n[r];
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
  const n = e.xScale * e.yScale - e.xSkew * e.ySkew;
  if (!Number.isFinite(n) || n === 0)
    throw new Error("worldFile は非正則です（行列式が 0）");
  if (n > 0)
    throw new Error("worldFile は鏡像です。yScale の符号を確かめてください");
}
function ve(e, t) {
  const n = t[0] - 0.5, r = t[1] - 0.5;
  return [
    e.xScale * n + e.xSkew * r + e.xOrigin,
    e.ySkew * n + e.yScale * r + e.yOrigin
  ];
}
function Me(e, t) {
  const n = e.xScale * e.yScale - e.xSkew * e.ySkew, r = t[0] - e.xOrigin, o = t[1] - e.yOrigin;
  return [
    (e.yScale * r - e.xSkew * o) / n + 0.5,
    (-e.ySkew * r + e.xScale * o) / n + 0.5
  ];
}
const fr = ye;
function xt(e, t, n) {
  return (t[0] - e[0]) * (n[1] - e[1]) - (t[1] - e[1]) * (n[0] - e[0]);
}
function Et(e, t, n, r = 0) {
  return e[0] >= Math.min(t[0], n[0]) - r && e[0] <= Math.max(t[0], n[0]) + r && e[1] >= Math.min(t[1], n[1]) - r && e[1] <= Math.max(t[1], n[1]) + r;
}
function Bn(e, t, n, r) {
  const o = xt(e, t, n), i = xt(e, t, r), s = xt(n, r, e), u = xt(n, r, t);
  return o === 0 && Et(n, e, t) || i === 0 && Et(r, e, t) || s === 0 && Et(e, n, r) || u === 0 && Et(t, n, r) ? !0 : Math.sign(o) * Math.sign(i) === -1 && Math.sign(s) * Math.sign(u) === -1;
}
function ie(e) {
  const t = e.reduce((n, r, o) => n + xt(e[0], r, e[(o + 1) % e.length]), 0);
  if (!Number.isFinite(t) || t === 0)
    throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪は面積を持つ必要があります');
  for (let n = 0; n < e.length; n++) {
    const r = e[n], o = e[(n + 1) % e.length];
    if (r[0] === o[0] && r[1] === o[1])
      throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に重複頂点は許可されません');
    for (let i = n + 2; i < e.length; i++)
      if (!(n === 0 && i === e.length - 1) && Bn(r, o, e[i], e[(i + 1) % e.length]))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の輪に辺の交差は許可されません');
  }
  return Math.sign(t);
}
function On(e, t) {
  let n = !1;
  for (let r = 0, o = t.length - 1; r < t.length; o = r++) {
    const i = t[o], s = t[r], [u, f] = i, [l, x] = s, p = l - u, y = x - f, _ = e[0] - u, w = e[1] - f, b = Number.EPSILON * 16 * Math.max(1, Math.abs(u), Math.abs(f), Math.abs(l), Math.abs(x), Math.abs(e[0]), Math.abs(e[1])), E = Math.hypot(p, y), M = b * E + Number.EPSILON * 16 * (Math.abs(_ * y) + Math.abs(w * p));
    if (Math.abs(xt(i, s, e)) <= M && Et(e, i, s, b)) return "edge";
    f > e[1] != x > e[1] && e[0] < (l - u) * (e[1] - f) / (x - f) + u && (n = !n);
  }
  return n ? "inside" : "outside";
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
    const n = "outerTransform" in t, r = n ? t.outerTransform : void 0;
    if (r !== void 0 && r !== "extrapolate" && r !== "worldFile")
      throw new Error("Invalid compiled data: outerTransform must be extrapolate or worldFile");
    const o = n ? t.worldFile : void 0;
    if (r === "worldFile") {
      if (!o) throw new Error('compiled.outerTransform が "worldFile" ですが worldFile がありません');
      we(o);
      const l = t.vertices_points;
      if (!Array.isArray(l) || l.length < 4 || l.some((_) => !Array.isArray(_) || _.length < 2 || _.some((w) => !Array.isArray(w) || w.length < 2 || !w.slice(0, 2).every(Number.isFinite))))
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points は有限な 4 頂点以上の輪が必要です');
      const x = ie(l.map((_) => _[0])), p = ie(l.map((_) => _[1])), y = t.yaxisMode === q.YAXIS_FOLLOW ? -p : p;
      if (x === y)
        throw new Error('compiled.outerTransform が "worldFile" のとき vertices_points の両面の巻き方向が整合していません');
    }
    const i = r === "worldFile" ? { ...t, centroid_point: t.centroid_point ?? [[0, 0], [0, 0]] } : t, s = En(i) ? Sn(i) : Cn(i), f = Object.fromEntries(["points", "strict_status", "vertices_params", "centroid", "edges", "edgeNodes", "tins", "kinks", "yaxisMode", "vertexMode", "strictMode", "bounds", "boundsPolygon", "wh", "xy", "indexedTins", "outerTransform", "worldFile", "outerVertices", "outerRings"].map((l) => [l, this[l]]));
    try {
      "compiled" in s ? this.applyLegacyState(s) : this.applyModernState(s), this.outerTransform = r ?? "extrapolate", this.worldFile = o, this.outerVertices = r === "worldFile" ? t.vertices_points : void 0, this.outerRings = this.outerVertices ? { forw: this.outerVertices.map((l) => l[0]), bakw: this.outerVertices.map((l) => l[1]) } : void 0, this.validateCompiledProjection();
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
    const t = this.tins, n = t.forw, r = t.bakw, o = Math.ceil(Math.sqrt(n.features.length));
    if (o < 3) {
      this.indexedTins = void 0;
      return;
    }
    let i = [], s = [];
    const u = n.features.map((E) => {
      let M = [];
      return Wt(E)[0].map((a) => {
        i.length === 0 ? i = [Array.from(a), Array.from(a)] : (a[0] < i[0][0] && (i[0][0] = a[0]), a[0] > i[1][0] && (i[1][0] = a[0]), a[1] < i[0][1] && (i[0][1] = a[1]), a[1] > i[1][1] && (i[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    }), f = r.features.map((E) => {
      let M = [];
      return Wt(E)[0].map((a) => {
        s.length === 0 ? s = [Array.from(a), Array.from(a)] : (a[0] < s[0][0] && (s[0][0] = a[0]), a[0] > s[1][0] && (s[1][0] = a[0]), a[1] < s[0][1] && (s[0][1] = a[1]), a[1] > s[1][1] && (s[1][1] = a[1])), M.length === 0 ? M = [Array.from(a), Array.from(a)] : (a[0] < M[0][0] && (M[0][0] = a[0]), a[0] > M[1][0] && (M[1][0] = a[0]), a[1] < M[0][1] && (M[0][1] = a[1]), a[1] > M[1][1] && (M[1][1] = a[1]));
      }), M;
    });
    if (Math.max(
      ee(u, i, o),
      ee(f, s, o)
    ) > wn * n.features.length) {
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
  transform(t, n, r) {
    if (!this.tins)
      throw new Error("setCompiled() must be called before transform()");
    if (n && this.strict_status == q.STATUS_ERROR && this.outerTransform !== "worldFile")
      throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
    const o = t;
    this.yaxisMode == q.YAXIS_FOLLOW && n && (t = [t[0], -1 * t[1]]);
    const i = nt(t);
    if (this.bounds && !n && !r && !at(i, this.boundsPolygon))
      return !1;
    const s = n ? this.tins.bakw : this.tins.forw, u = n ? this.indexedTins?.bakw : this.indexedTins?.forw;
    let f;
    if (this.outerTransform === "worldFile") {
      const w = n ? this.outerRings?.bakw : this.outerRings?.forw, b = w ? On(i.geometry.coordinates, w) : "outside";
      if (n && this.strict_status == q.STATUS_ERROR && b !== "outside")
        throw new Error('Backward transform is not allowed if strict_status == "strict_error"');
      if (b === "inside" && s && (f = At(i, s, u)), !f) {
        const E = n ? Me(this.worldFile, o) : ve(this.worldFile, o);
        return !E.every(Number.isFinite) || n && this.bounds && !r && !at(nt(E), this.boundsPolygon) ? !1 : E;
      }
    }
    const l = n ? this.vertices_params.bakw : this.vertices_params.forw, x = n ? this.centroid.bakw : this.centroid.forw;
    let p, y;
    this.stateFull && (this.stateBackward == n ? p = this.stateTriangle : (this.stateBackward = n, this.stateTriangle = void 0), y = (w) => {
      this.stateTriangle = w;
    });
    let _ = xn(
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
    if (this.bounds && n && !r) {
      const w = nt(_);
      if (!at(w, this.boundsPolygon)) return !1;
    } else this.yaxisMode == q.YAXIS_FOLLOW && !n && (_ = [_[0], -1 * _[1]]);
    return _;
  }
}
const W = 20037508342789244e-9, Nn = [
  [0, 0],
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0]
], Xt = 6378137, Nt = 180 / Math.PI * Math.atan(Math.sinh(Math.PI));
function ft(e) {
  return e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function Ln(e, t) {
  const n = t.trim().split(/\s+/).map((i) => {
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
  }).filter(Boolean), r = [...new Set(n)].sort().join(" ");
  if (!(e === 4326 ? ["+datum=wgs84 +proj=longlat", "+ellps=wgs84 +proj=longlat"] : [
    "+a=6378137 +b=6378137 +k=1 +lat_ts=0 +lon_0=0 +nadgrids=@null +proj=merc +units=m +x_0=0 +y_0=0"
  ]).includes(r))
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
    const n = e[0], r = e[1];
    return [
      Math.abs(n) === W ? Math.sign(n) * 180 : n / Xt * (180 / Math.PI),
      Math.abs(r) === W ? Math.sign(r) * Nt : (2 * Math.atan(Math.exp(r / Xt)) - Math.PI / 2) * (180 / Math.PI)
    ];
  },
  fromLonLat(e, t) {
    if (!ft(e) || Math.abs(e[0]) > 180) return !1;
    const [n, r] = e;
    if (t.epsg === 4326) return Math.abs(r) <= 90 ? [n, r] : !1;
    if (t.epsg !== 3857 || Math.abs(r) > Nt) return !1;
    const o = n * Math.PI / 180, i = r * Math.PI / 180, s = [
      Math.abs(n) === 180 ? Math.sign(n) * W : Xt * o,
      Math.abs(r) === Nt ? Math.sign(r) * W : Xt * Math.log(Math.tan(Math.PI / 4 + i / 2))
    ];
    return s.every(Number.isFinite) ? s : !1;
  }
}, _e = { epsg: 3857 }, oe = { epsg: 4326 }, In = "+proj=longlat +datum=WGS84";
function Ft(e) {
  return e.epsg === 3857 || e.epsg === 4326;
}
function Fn(e) {
  if (e === null || typeof e != "object" || Array.isArray(e))
    throw new Error("CRS はオブジェクトで指定してください");
  if (e.epsg !== void 0 && (!Number.isSafeInteger(e.epsg) || e.epsg <= 0))
    throw new Error("CRS の epsg は正の整数で指定してください");
  if (e.proj4 !== void 0 && (typeof e.proj4 != "string" || !e.proj4.trim()))
    throw new Error("CRS の proj4 は空でない文字列で指定してください");
  const t = typeof e.authority == "string" && !!e.authority.trim(), n = typeof e.code == "string" ? !!e.code.trim() : Number.isFinite(e.code);
  if (e.epsg === void 0 && !(t && n) && e.proj4 === void 0)
    throw new Error(
      "CRS には epsg、authority と code の組、または proj4 が必要です。WKT のみの定義には対応していません"
    );
}
function be(e) {
  let t = !1;
  for (const n of e.split("+")) {
    const [r, o] = n.trim().split("="), i = r.toLowerCase();
    if (i === "axis" && o !== "enu")
      throw new Error("CRS の座標は東・北の順で書き、+axis を外すか +axis=enu を指定してください");
    if (i === "nadgrids" && o !== "@null" || i === "geoidgrids" || i === "hgridshift" || i === "vgridshift" || i === "proj" && ["pipeline", "hgridshift", "vgridshift"].includes(o?.toLowerCase()))
      throw new Error(`proj4 の +${n.trim()} は読み込めません`);
    i === "proj" && o && (t = !0);
  }
  if (!e.startsWith("+") || !t)
    throw new Error("CRS の proj4 は +proj= を含む定義で指定してください");
}
function Ee(e, t, n) {
  Fn(e);
  const r = Ft(e);
  if (e.proj4 === void 0) {
    if (e.wkt) throw new Error("WKT だけの CRS 定義に対応していません");
    if (!r) throw new Error("EPSG:3857・4326 以外の CRS には proj4 定義が必要です");
    return;
  }
  const o = e.proj4.trim();
  if (be(o), t.validateDefinition)
    t.validateDefinition(e, r ? n() : void 0);
  else if (r)
    Ln(e.epsg, o);
  else if (t === st)
    throw new Error("この CRS には proj4 に対応する投影エンジンが必要です");
}
function ur(e) {
  const t = /* @__PURE__ */ new Map();
  function n(i) {
    const s = t.get(i);
    if (s) return s;
    be(i);
    try {
      const u = e(i, In);
      return t.set(i, u), u;
    } catch (u) {
      throw new Error(`proj4 定義を読み込めません（${String(u)}）`, { cause: u });
    }
  }
  function r(i, [s, u]) {
    const f = i.inverse([s, u, 0], !0), l = f[2];
    return Number.isFinite(l) && Math.abs(l) > 1e-6 ? i.inverse([s, u, -l], !0) : f;
  }
  function o(i, s, u) {
    if (!ft(i)) return !1;
    try {
      const f = u(n(s), [i[0], i[1]]);
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
      return Ft(s) ? st.fromLonLat(i, s) : !s.proj4 || st.fromLonLat(i, oe) === !1 ? !1 : o(i, s.proj4.trim(), r);
    },
    validateDefinition(i, s) {
      if (i.proj4 === void 0) return;
      const u = i.proj4.trim();
      if (n(u), !s) return;
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
function Se(e, t, n) {
  if (!ft(e)) return !1;
  const r = n.toLonLat(e, t);
  return r === !1 ? !1 : st.fromLonLat(r, _e);
}
function Ce(e, t, n) {
  const r = st.toLonLat(e, _e);
  if (r === !1) return !1;
  const o = n.fromLonLat(r, t);
  return o !== !1 && ft(o) ? o : !1;
}
function Te(e, t, n) {
  let r, o, i, s;
  if (n?.length) {
    r = o = 1 / 0, i = s = -1 / 0;
    for (const [u, f] of n)
      r = Math.min(r, u), o = Math.min(o, f), i = Math.max(i, u), s = Math.max(s, f);
  } else if (e)
    [r, o] = t ?? [0, 0], i = r + e[0], s = o + e[1];
  else
    throw new Error("epsg と proj4 の照合には地図の範囲が必要です");
  if (![r, o, i, s].every(Number.isFinite))
    throw new Error("epsg と proj4 の照合には有限な地図の範囲が必要です");
  return [
    [r, o],
    [i, o],
    [i, s],
    [r, s],
    [r / 2 + i / 2, o / 2 + s / 2]
  ];
}
class jn {
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
    if (t.bounds && (t.bounds.length < 3 || t.bounds.some((r) => !Array.isArray(r) || r.length < 2 || !r.slice(0, 2).every(Number.isFinite)))) throw new Error("WorldFileSurface の bounds は有限な頂点を3つ以上必要とします");
    this.crs = t.crs, this.worldFile = t.worldFile, this.projectionEngine = t.projectionEngine ?? st;
    const n = t.bounds;
    if (t.wh)
      this.wh = t.wh, this.xy = t.xy;
    else {
      const r = n.map((u) => u[0]), o = n.map((u) => u[1]), i = Math.min(...r), s = Math.min(...o);
      if (this.wh = [Math.max(...r) - i, Math.max(...o) - s], !this.wh.every(Number.isFinite)) throw new Error("WorldFileSurface の bounds から算出した寸法は有限でなければなりません");
      this.xy = t.xy ?? [i, s];
    }
    this.bounds = t.bounds, this.priority = t.priority, this.importance = t.importance, Ee(
      this.crs,
      this.projectionEngine,
      () => Te(t.wh, this.xy, t.wh ? void 0 : this.bounds).map((r) => this.xyToCrs(r))
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
  transform(t, n = !1, r = !1) {
    if (!ft(t)) return !1;
    if (!n) {
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
function kn(e, t) {
  const n = [];
  for (let r = 0; r < e.length; r++) {
    const o = e[r], i = o[0] * Math.cos(t) - o[1] * Math.sin(t), s = o[0] * Math.sin(t) + o[1] * Math.cos(t);
    n.push([i, s]);
  }
  return n;
}
function se(e, t, n, r) {
  const o = Xe(r, t);
  return kn(Nn, n).map((u) => [
    u[0] * o + e[0],
    u[1] * o + e[1]
  ]);
}
function ae(e, t) {
  const n = e[0], o = e.slice(1, 5).map((_) => [
    _[0] - n[0],
    _[1] - n[1]
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
  return { center: n, zoom: y, rotation: x };
}
function Pe(e) {
  const t = e - 2 * Math.PI * Math.round(e / (2 * Math.PI));
  return t === -Math.PI ? Math.PI : t;
}
function Lt(e, t) {
  const n = e[0] * (2 * W) / t - W, r = -1 * (e[1] * (2 * W) / t - W);
  return [n, r];
}
function ce(e, t) {
  const n = (e[0] + W) * t / (2 * W), r = (-e[1] + W) * t / (2 * W);
  return [n, r];
}
const Dn = 16, Vn = 8, $n = 16, wt = 2, Gn = 1, Wn = 1, Un = 0.03, qn = 1e-24;
function zn(e) {
  return Array.isArray(e) && e.length >= 2 && Number.isFinite(e[0]) && Number.isFinite(e[1]);
}
function Ct(e, t, n, r = !0) {
  try {
    const o = e.transform(t, n, r);
    return zn(o) ? o : null;
  } catch {
    return null;
  }
}
function mt(e) {
  let t = 1 / 0, n = 1 / 0, r = -1 / 0, o = -1 / 0;
  for (const [i, s] of e)
    !Number.isFinite(i) || !Number.isFinite(s) || (t = Math.min(t, i), n = Math.min(n, s), r = Math.max(r, i), o = Math.max(o, s));
  if (!Number.isFinite(t)) throw new Error("視点グリッドの範囲を有限な座標から決められません");
  return { minX: t, minY: n, maxX: r, maxY: o };
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
  const n = e.points;
  if (n?.length) return mt(n.map((r) => r[0]));
  throw new Error("視点グリッドの紙側基準矩形を決められません（wh / bounds / GCP がありません）");
}
function vt(e, t) {
  return e instanceof q ? e.strict_status ?? t ?? "strict" : "strict";
}
function Re(e, t = Dn) {
  const n = e.maxX - e.minX, r = e.maxY - e.minY;
  if (!(n > 0) || !(r > 0))
    throw new Error("視点グリッドの基準矩形に面積がありません");
  const o = Math.max(n, r), i = Math.min(n, r), s = Math.min(
    $n,
    Math.max(Vn, Math.round(t * i / o))
  ), u = n >= r ? t : s, f = n >= r ? s : t, l = n / u, x = r / f;
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
function Hn(e, t, n, r) {
  const o = !r, i = [[n, 0], [-n, 0], [0, n], [0, -n]], s = [];
  for (const u of i) {
    const f = o ? [t[0] + u[0], t[1] - u[1]] : [t[0] + u[0], t[1] + u[1]], l = Ct(e, f, r, !0);
    l && s.push({ d: u, out: l });
  }
  return s;
}
function jt(e, t) {
  return t ? [e[0], -e[1]] : [e[0], e[1]];
}
function fe(e, t, n, r) {
  const o = e * r - t * n;
  if (!(o > 0) || !Number.isFinite(o)) return null;
  const i = Math.sqrt(o), s = Math.atan2(n - t, e + r);
  return Number.isFinite(i) && Number.isFinite(s) ? { s: i, theta: s } : null;
}
function Zn(e, t, n) {
  let r = 0, o = 0, i = 0;
  for (const { d: l, out: x } of e) {
    const [p, y] = jt(x, n), _ = l[0], w = l[1], b = p - t[0], E = y - t[1];
    r += _ * b + w * E, o += _ * E - w * b, i += _ * _ + w * w;
  }
  if (!(i > 0)) return null;
  const s = r / i, u = o / i, f = Math.hypot(s, u);
  return !(f > 0) || !Number.isFinite(f) ? null : n ? { s: 1 / f, theta: -Math.atan2(u, s) } : { s: f, theta: Math.atan2(u, s) };
}
function ue(e) {
  return e ? { s: 1 / e.s, theta: -e.theta } : null;
}
function Ye(e, t, n, r) {
  const o = Hn(e, t, n, r), i = (y, _) => {
    const w = o.find((b) => b.d[0] === y && b.d[1] === _);
    return w ? jt(w.out, r) : void 0;
  };
  if (o.length >= 4) {
    const y = i(n, 0), _ = i(-n, 0), w = i(0, n), b = i(0, -n), E = fe(
      (y[0] - _[0]) / (2 * n),
      (w[0] - b[0]) / (2 * n),
      (y[1] - _[1]) / (2 * n),
      (w[1] - b[1]) / (2 * n)
    );
    return r ? ue(E) : E;
  }
  const s = Ct(e, t, r, !0), u = s ? jt(s, r) : null;
  if (!u) return null;
  const f = (y) => y[1] === 0, l = o.filter((y) => f(y.d)), x = o.filter((y) => !f(y.d)), p = l.length >= 1 && x.length >= 1;
  if (o.length >= 3 || o.length === 2 && p) {
    const y = (E, M) => E && M ? [(E[0] - M[0]) / (2 * n), (E[1] - M[1]) / (2 * n)] : E ? [(E[0] - u[0]) / n, (E[1] - u[1]) / n] : M ? [(u[0] - M[0]) / n, (u[1] - M[1]) / n] : null, _ = y(i(n, 0), i(-n, 0)), w = y(i(0, n), i(0, -n));
    if (!_ || !w) return null;
    const b = fe(_[0], w[0], _[1], w[1]);
    return r ? ue(b) : b;
  }
  return o.length === 2 ? Zn(o, u, r) : null;
}
function ht(e, t, n) {
  const r = Math.min(Math.max((t - e.x0) / e.dx, 0), e.nx - 1), o = Math.min(Math.max((n - e.y0) / e.dy, 0), e.ny - 1), i = Math.min(Math.floor(r), e.nx - 2), s = Math.min(Math.floor(o), e.ny - 2), u = r - i, f = o - s, l = (1 - u) * (1 - f), x = u * (1 - f), p = (1 - u) * f, y = u * f, _ = e.nx, w = e.ls, b = e.cs, E = e.sn, M = s * _ + i, a = M + 1, d = M + _, c = d + 1;
  let h = l * w[M];
  h += x * w[a], h += p * w[d], h += y * w[c];
  let m = l * b[M];
  m += x * b[a], m += p * b[d], m += y * b[c];
  let g = l * E[M];
  g += x * E[a], g += p * E[d], g += y * E[c];
  const v = Math.exp(h), S = m * m + g * g > qn ? Math.atan2(g, m) : Math.atan2(E[M], b[M]);
  return { s: v, theta: S };
}
function le(e, t, n, r = Gn, o) {
  const i = Re(t, o), s = i.mx + 1, u = i.my + 1, f = new Float64Array(s * u), l = new Float64Array(s * u), x = new Float64Array(s * u), p = new Uint8Array(s * u), y = r * Math.min(i.dx, i.dy);
  for (let w = 0; w < u; w++)
    for (let b = 0; b < s; b++) {
      const E = [i.x0 + b * i.dx, i.y0 + w * i.dy], M = Ye(e, E, y, n), a = w * s + b;
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
function Jn(e, t) {
  const n = [];
  for (let o = 0; o <= 8; o++) {
    const i = o / 8;
    n.push([t.minX + (t.maxX - t.minX) * i, t.minY]), n.push([t.minX + (t.maxX - t.minX) * i, t.maxY]), n.push([t.minX, t.minY + (t.maxY - t.minY) * i]), n.push([t.maxX, t.minY + (t.maxY - t.minY) * i]);
  }
  for (let o = 1; o <= 3; o++)
    for (let i = 1; i <= 3; i++)
      n.push([
        t.minX + (t.maxX - t.minX) * o / 4,
        t.minY + (t.maxY - t.minY) * i / 4
      ]);
  const r = [];
  for (const o of n) {
    const i = Ct(e, o, !1, !0);
    i && r.push(i);
  }
  if (!r.length)
    throw new Error("視点グリッドの地理側範囲を決められません（有効な標本点がありません）");
  return mt(r);
}
function Kn(e, t, n) {
  const r = n * e.nx + t;
  return { s: Math.exp(e.ls[r]), theta: Math.atan2(e.sn[r], e.cs[r]) };
}
function Qn(e) {
  return e.gcps?.length ? e.gcps.map((n) => n[0].slice(0, 2)) : e.surface.points?.map((n) => n[0].slice(0, 2)) ?? [];
}
function tr(e) {
  return e.length < 3 ? null : gn(dt(e.map((t) => nt([t[0], t[1]]))));
}
function he(e, t) {
  return at(nt([e[0], e[1]]), t, { ignoreBoundary: !1 });
}
function Be(e) {
  const t = e.paperRect ?? Ae(e.surface), n = Re(t, e.nLong), r = e.strictness === "strict" ? void 0 : le(e.surface, t, !1, e.probeRadiusCells, e.nLong), o = e.strictness === "strict_error" ? void 0 : le(
    e.surface,
    Jn(e.surface, t),
    !0,
    e.probeRadiusCells,
    e.nLong
  );
  return { rect: t, spec: n, paper: r, merc: o };
}
function er(e, t, n) {
  if (t.strictness === "loose" || t.strictness === "strict_error")
    return e.paper ? ht(e.paper, n[0], n[1]) : null;
  const r = Ct(t.surface, n, !1, !0);
  return !r || !e.merc ? null : ht(e.merc, r[0], r[1]);
}
function Oe(e, t) {
  const n = [];
  for (let r = 0; r <= t.spec.nyInner; r++)
    for (let o = 0; o <= t.spec.nxInner; o++) {
      const i = wt + o, s = wt + r, u = [t.spec.x0 + i * t.spec.dx, t.spec.y0 + s * t.spec.dy];
      if (e.strictness === "loose" || e.strictness === "strict_error") {
        t.paper && n.push({ paper: u, ...Kn(t.paper, i, s) });
        continue;
      }
      const f = Ct(e.surface, u, !1, !0);
      if (!f || !t.merc) continue;
      const l = ht(t.merc, f[0], f[1]);
      l.s > 0 && Number.isFinite(l.s) && Number.isFinite(l.theta) && n.push({ paper: u, s: l.s, theta: l.theta });
    }
  return n;
}
function Ne(e, t, n) {
  const r = tr(Qn(e)), o = e.regionPolygon, i = (l) => !(r && !he(l, r) || o && !he(l, o)), s = n.filter((l) => i(l.paper));
  if (s.length >= 9) return s;
  const u = mt(r ? r.geometry.coordinates[0] : o ? o.geometry.coordinates[0] : n.map((l) => l.paper)), f = [];
  for (let l = 0; l < 9; l++)
    for (let x = 0; x < 9; x++) {
      const p = [
        u.minX + (u.maxX - u.minX) * (l + 0.5) / 9,
        u.minY + (u.maxY - u.minY) * (x + 0.5) / 9
      ];
      if (!i(p)) continue;
      const y = er(t, e, p);
      y && y.s > 0 && Number.isFinite(y.s) && f.push({ paper: p, ...y });
    }
  return f.length ? f : s.length ? s : n;
}
function Le(e) {
  if (!e.length) throw new Error("視点係数の標本がありません");
  let t = 0, n = 0, r = 0;
  for (const i of e)
    t += Math.log(i.s), n += Math.cos(i.theta), r += Math.sin(i.theta);
  const o = e.length;
  return { s: Math.exp(t / o), theta: Math.atan2(r / o, n / o) };
}
function me(e) {
  return e.length ? e[Math.min(e.length - 1, Math.max(0, Math.ceil(0.95 * e.length) - 1))] : 0;
}
function nr(e, t) {
  const n = [], r = [];
  for (const o of e)
    n.push(Math.abs(Pe(o.theta - t.theta))), r.push(Math.abs(o.s / t.s - 1));
  return n.sort((o, i) => o - i), r.sort((o, i) => o - i), {
    maxRotationDiffRad: n[n.length - 1] ?? 0,
    p95RotationDiffRad: me(n),
    maxScaleRatioDiff: r[r.length - 1] ?? 0,
    p95ScaleRatioDiff: me(r),
    sampleCount: e.length
  };
}
function rr(e) {
  const t = e.p95RotationDiffRad, n = e.p95ScaleRatioDiff;
  return t <= Wn * Math.PI / 180 && n <= Un ? "constant" : "grid";
}
function ir(e) {
  const t = Be(e);
  return Ne(e, t, Oe(e, t));
}
class Dt {
  mode;
  strictness;
  paperGrid;
  mercGrid;
  constant;
  constructor(t, n) {
    this.mode = t, this.strictness = n;
  }
  static build(t) {
    const n = new Dt(t.mode, t.strictness), r = Be(t);
    if (t.mode === "constant") {
      const o = Ne(t, r, Oe(t, r));
      n.constant = Le(o);
    } else
      n.paperGrid = r.paper, n.mercGrid = r.merc;
    return n;
  }
  /**
   * 中心 1 点の (s, θ) を引く（§7.1）。
   * - constant: 全体の (s0, θ0)
   * - strict / Plan A: 両方向とも地理側グリッド
   * - loose: 順方向は紙側グリッド、逆方向は地理側グリッド
   * - strict_error: 紙側グリッドのみ（逆方向の例外は呼び出し側の逆変換が担う）
   */
  eval(t, n, r) {
    return this.mode === "constant" ? this.constant : this.strictness === "strict" ? ht(this.mercGrid, n[0], n[1]) : this.strictness === "loose" ? r ? ht(this.mercGrid, n[0], n[1]) : ht(this.paperGrid, t[0], t[1]) : ht(this.paperGrid, t[0], t[1]);
  }
}
function Ie(e, t, n, r, o) {
  Ee(t, n, () => {
    const i = r ?? e.bounds ?? (e.wh ? void 0 : e.points.map(([u]) => u)), s = e.stateFull;
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
class or extends q {
  constructor(t, n, r) {
    super(), this.crs = n, this.projectionEngine = r, this.layerBounds = t.bounds, this.setCompiled(t.compiled);
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
  transform(t, n, r) {
    if (n) {
      const i = Ce(t, this.crs, this.projectionEngine);
      return i === !1 ? !1 : super.transform(i, n, r);
    }
    const o = super.transform(t, n, r);
    return o === !1 ? !1 : Se(o, this.crs, this.projectionEngine);
  }
}
const gt = 256;
function kt(e) {
  if (e.kind === "worldFile") return new jn(e);
  if ("crs" in e && e.crs === null) throw new Error("三角網の層の CRS は null にできません");
  const t = e.crs, n = e.projectionEngine ?? st;
  if (t !== void 0 && t.epsg !== 3857) return new or(e, t, n);
  const r = new q();
  return r.setCompiled(e.compiled), t !== void 0 && Ie(r, t, n, e.bounds, (o) => r.transform(o, !1, !0)), r;
}
class lr {
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
    const n = new q();
    if (n.setCompiled(t.compiled), this.mainTin = n, t.maxZoom !== void 0)
      this._maxxy = Math.pow(2, t.maxZoom) * gt;
    else if (t.compiled.wh) {
      const o = Math.max(t.compiled.wh[0], t.compiled.wh[1]), i = Math.ceil(Math.log2(o / gt));
      this._maxxy = Math.pow(2, i) * gt;
    }
    this.subTins = [];
    const r = [
      { strictness: vt(n, yt(t.compiled)) }
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
        }), r.push({
          strictness: vt(i, yt(o.compiled)),
          rectOverride: s,
          regionPolygon: l
        });
      }
    this._layerMetas = r, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
  }
  /** TIN と world file の変換面を混在させて読み込む */
  setLayeredMapData(t) {
    this._fields = [], this._layerMetas = [];
    const n = kt(t.main);
    t.main.priority !== void 0 && (n.priority = t.main.priority), t.main.importance !== void 0 && (n.importance = t.main.importance);
    const r = t.main.kind === "tin" ? t.main.compiled.wh : n.wh;
    let o = this._maxxy;
    if (t.maxZoom !== void 0)
      o = Math.pow(2, t.maxZoom) * gt;
    else if (r) {
      const u = Math.max(r[0], r[1]), f = Math.ceil(Math.log2(u / gt));
      o = Math.pow(2, f) * gt;
    }
    const i = [], s = [
      {
        strictness: vt(
          n,
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
    this.mainTin = n, this.subTins = i, this._maxxy = o, this._layerMetas = s, this._viewpointMode = t.viewpointMode ?? "grid", this._fields = [];
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
    const n = this.xy2MercWithLayer(t);
    return n ? n[1] : !1;
  }
  /**
   * メルカトル座標 → ピクセル座標（最適レイヤー選択）
   *
   * @param merc - メルカトル座標 [x, y]
   * @returns ピクセル座標、または範囲外の場合は false
   */
  merc2Xy(t) {
    const n = this.merc2XyWithLayer(t), r = n[0] || n[1];
    return r ? r[1] : !1;
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
    const n = this._getTinsSortedByPriority();
    for (let r = 0; r < n.length; r++) {
      const { index: o, isMain: i } = n[r];
      if (i || at(nt(t), this.subTins[o - 1].xyBounds)) {
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
      return l === !1 ? [u, s] : f || at(nt(l), this.subTins[s - 1].xyBounds) ? [u, s, l] : [u, s];
    }).sort((s, u) => {
      const f = s[0].priority ?? 0, l = u[0].priority ?? 0;
      return f < l ? 1 : -1;
    }).reduce(
      (s, u, f, l) => {
        const x = u[0], p = u[1], y = u[2];
        if (!y) return s;
        for (let _ = 0; _ < f; _++) {
          const w = l[_][1], b = w === 0;
          if (l[_][2] && (b || at(nt(y), this.subTins[w - 1].xyBounds)))
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
    const n = this._getAllTinsWithIndex(), r = (f) => (f === 0 ? this.mainTin?.priority : this.subTins[f - 1].priority) ?? 0, o = (f) => (f === 0 ? this.mainTin?.importance : this.subTins[f - 1].importance) ?? 0, i = (f, l) => f === 0 || at(nt(l), this.subTins[f - 1].xyBounds), s = [];
    for (const { index: f } of n) {
      const l = this._transformByIndex(t, f, !0);
      l !== !1 && i(f, l) && s.push({ index: f, xy: l });
    }
    const u = (f) => n.some(
      ({ index: l }) => l !== 0 && l !== f.index && (r(l) > r(f.index) || f.index === 0 && r(0) === 0 && r(l) === 0) && i(l, f.xy)
    );
    return s.filter((f) => !u(f)).sort((f, l) => o(l.index) - o(f.index) || r(l.index) - r(f.index) || f.index - l.index).map((f) => [f.index, f.xy]);
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
    const n = this.merc2XyWithLayer(t[0]);
    let r = !1;
    return n.map((o, i) => {
      if (!o) {
        r = !0;
        return;
      }
      const s = o[0], u = o[1];
      return i !== 0 && !r ? [this.xy2SysCoordInternal(u)] : t.map((l, x) => x === 0 ? u : this._transformByIndex(l, s, !0)).map((l) => this.xy2SysCoordInternal(l));
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
  viewpoint2Mercs(t, n, r) {
    this._assertMapData(), this._assertMaxxy();
    const o = ce(t.center, this._maxxy);
    let i, s;
    if (r !== void 0) {
      this._assertLayerIndex(r, "viewpoint2Mercs");
      const _ = this.getSurfaceTransform(r).transform(o, !1, !0);
      if (!_)
        throw new Error(`viewpoint2Mercs: layer ${r} transform failed`);
      i = r, s = _;
    } else {
      const y = this.xy2MercWithLayer(o);
      if (!y) throw new Error("viewpoint2Mercs: center point is out of bounds");
      [i, s] = y;
    }
    const { s: u, theta: f } = this._evalViewpointCoefficients(i, o, s, !1), l = 2 * W / this._maxxy, x = t.zoom + Math.log2(l / u), p = t.rotation + f;
    return se(s, x, p, n);
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
  mercs2Viewpoint(t, n, r) {
    this._assertMapData(), this._assertMaxxy();
    const o = ae(t, n);
    let i, s;
    if (r !== void 0) {
      this._assertLayerIndex(r, "mercs2Viewpoint");
      const p = this.getSurfaceTransform(r).transform(o.center, !0, !0);
      if (!p)
        throw new Error(`mercs2Viewpoint: layer ${r} transform failed`);
      i = r, s = p;
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
  getViewpointCoefficients(t, n, r = "xy2Merc") {
    this._assertMapData(), this._assertLayerIndex(t, "getViewpointCoefficients");
    const o = this.getSurfaceTransform(t);
    if (r === "xy2Merc") {
      const s = o.transform(n, !1, !0);
      if (!s) throw new Error("getViewpointCoefficients: transform failed");
      return this._evalViewpointCoefficients(t, n, s, !1);
    }
    const i = o.transform(n, !0, !0);
    if (!i) throw new Error("getViewpointCoefficients: transform failed");
    return this._evalViewpointCoefficients(t, i, n, !0);
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
  probeViewpointCoefficients(t, n, r) {
    this._assertMapData(), this._assertLayerIndex(t, "probeViewpointCoefficients");
    const o = this.getSurfaceTransform(t), i = Ye(o, n, r, !1);
    if (!i)
      throw new Error(
        `probeViewpointCoefficients: layer ${t} probe failed at [${n[0]}, ${n[1]}]`
      );
    return i;
  }
  // ─── ユーティリティ（静的メソッド）────────────────────────────────────────
  /** zoom2Radius の静的ラッパー */
  static zoom2Radius(t, n) {
    return Xe(t, n);
  }
  /** mercViewpoint2Mercs の静的ラッパー */
  static mercViewpoint2Mercs(t, n, r, o) {
    return se(t, n, r, o);
  }
  /** mercs2MercViewpoint の静的ラッパー */
  static mercs2MercViewpoint(t, n) {
    return ae(t, n);
  }
  /** xy2SysCoord の静的ラッパー */
  static xy2SysCoord(t, n) {
    return Lt(t, n);
  }
  /** sysCoord2Xy の静的ラッパー */
  static sysCoord2Xy(t, n) {
    return ce(t, n);
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
  _assertLayerIndex(t, n) {
    if (!Number.isInteger(t) || t < 0 || t >= this.layerCount)
      throw new Error(`${n}: invalid layerIndex ${t}`);
  }
  /** 層の ViewpointField を遅延構築して返す（§2.3。読み込み時には作らない） */
  _fieldFor(t) {
    const n = this._fields[t];
    if (n) return n;
    const r = this.getSurfaceTransform(t);
    if (!r) throw new Error(`invalid layerIndex ${t}`);
    const o = this._layerMetas[t], i = Dt.build({
      surface: r,
      mode: this._viewpointMode === "constant" ? "constant" : "grid",
      strictness: o.strictness,
      paperRect: o.rectOverride ? Ae(r, o.rectOverride) : void 0,
      regionPolygon: o.regionPolygon
    });
    return this._fields[t] = i, i;
  }
  /** 中心 1 点の視点係数を層の ViewpointField から引く */
  _evalViewpointCoefficients(t, n, r, o) {
    return this._fieldFor(t).eval(n, r, o);
  }
  /**
   * レイヤーインデックスに対応する Transform インスタンスを返す（三角網描画などの用途）
   *
   * @param idx - 0 = メイン TIN、1以上 = sub_maps[idx-1]
   * @returns 対応する Transform、または範囲外の場合は null
   */
  getLayerTransform(t) {
    if (t === 0) return this.mainTin instanceof q ? this.mainTin : null;
    const n = this.subTins[t - 1];
    return n?.tin instanceof q ? n.tin : null;
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
    return this._getAllTinsWithIndex().sort((n, r) => {
      const o = n.tin.priority ?? 0, i = r.tin.priority ?? 0;
      return o < i ? 1 : -1;
    });
  }
  /** メイン TIN + 全 sub TIN を index 付きで返す */
  _getAllTinsWithIndex() {
    const t = [
      { index: 0, tin: this.mainTin, isMain: !0 }
    ];
    return this.subTins.forEach((n, r) => {
      n.tin.priority = n.priority, n.tin.importance = n.importance, t.push({ index: r + 1, tin: n.tin, isMain: !1 });
    }), t;
  }
  /**
   * 指定レイヤーインデックスで TIN 変換を実行する
   * index 0 → mainTin, index 1..n → subTins[index-1]
   */
  _transformByIndex(t, n, r) {
    if (n === 0)
      return this.mainTin.transform(t, r);
    const o = this.subTins[n - 1];
    return o ? o.tin.transform(t, r, !0) : !1;
  }
  /** 内部用 xy2SysCoord（_maxxy を使用） */
  xy2SysCoordInternal(t) {
    return Lt(t, this._maxxy);
  }
}
function sr(e) {
  if (!e || e.length < 3) return;
  const t = e.map((o) => [o[0], o[1]]), n = t[0], r = t[t.length - 1];
  (n[0] !== r[0] || n[1] !== r[1]) && t.push([n[0], n[1]]);
  try {
    return lt([t]);
  } catch {
    return;
  }
}
function hr(e, t) {
  const n = kt({
    ...e,
    projectionEngine: t?.projectionEngine ?? e.projectionEngine
  }), r = e.kind === "tin" ? vt(n, yt(e.compiled)) : vt(n), o = e.bounds ?? (e.kind === "tin" ? e.compiled.bounds : void 0), i = {
    surface: n,
    strictness: r,
    regionPolygon: sr(o),
    gcps: t?.gcps
  }, s = ir(i), u = Le(s), f = nr(s, u);
  return {
    recommended: rr(f),
    maxRotationDiffDeg: f.maxRotationDiffRad * 180 / Math.PI,
    p95RotationDiffDeg: f.p95RotationDiffRad * 180 / Math.PI,
    maxScaleRatioDiff: f.maxScaleRatioDiff,
    p95ScaleRatioDiff: f.p95ScaleRatioDiff,
    sampleCount: f.sampleCount
  };
}
export {
  Nn as MERC_CROSSMATRIX,
  W as MERC_MAX,
  lr as MapTransform,
  q as Transform,
  jn as WorldFileSurface,
  st as builtinProjectionEngine,
  cr as counterTri,
  ur as createProj4ProjectionEngine,
  Me as crsToWorldFilePixel,
  fr as format_version,
  se as mercViewpoint2Mercs,
  ae as mercs2MercViewpoint,
  bn as normalizeEdges,
  hr as recommendViewpointMode,
  kn as rotateMatrix,
  ar as rotateVerticesTriangle,
  ce as sysCoord2Xy,
  xn as transformArr,
  we as validateWorldFile,
  ve as worldFileToCrs,
  Lt as xy2SysCoord,
  Xe as zoom2Radius
};
