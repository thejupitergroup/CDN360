! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).janus = e()
}(this, (function() {
    "use strict";
    const t = {};

    function e(r, n) {
        "string" != typeof n && (n = e.defaultChars);
        const s = function(e) {
            let r = t[e];
            if (r) return r;
            r = t[e] = [];
            for (let t = 0; t < 128; t++) {
                const e = String.fromCharCode(t);
                r.push(e)
            }
            for (let t = 0; t < e.length; t++) {
                const n = e.charCodeAt(t);
                r[n] = "%" + ("0" + n.toString(16).toUpperCase()).slice(-2)
            }
            return r
        }(n);
        return r.replace(/(%[a-f0-9]{2})+/gi, (function(t) {
            let e = "";
            for (let r = 0, n = t.length; r < n; r += 3) {
                const i = parseInt(t.slice(r + 1, r + 3), 16);
                if (i < 128) e += s[i];
                else {
                    if (192 == (224 & i) && r + 3 < n) {
                        const n = parseInt(t.slice(r + 4, r + 6), 16);
                        if (128 == (192 & n)) {
                            const t = i << 6 & 1984 | 63 & n;
                            e += t < 128 ? "\ufffd\ufffd" : String.fromCharCode(t), r += 3;
                            continue
                        }
                    }
                    if (224 == (240 & i) && r + 6 < n) {
                        const n = parseInt(t.slice(r + 4, r + 6), 16),
                            s = parseInt(t.slice(r + 7, r + 9), 16);
                        if (128 == (192 & n) && 128 == (192 & s)) {
                            const t = i << 12 & 61440 | n << 6 & 4032 | 63 & s;
                            e += t < 2048 || t >= 55296 && t <= 57343 ? "\ufffd\ufffd\ufffd" : String.fromCharCode(t), r += 6;
                            continue
                        }
                    }
                    if (240 == (248 & i) && r + 9 < n) {
                        const n = parseInt(t.slice(r + 4, r + 6), 16),
                            s = parseInt(t.slice(r + 7, r + 9), 16),
                            o = parseInt(t.slice(r + 10, r + 12), 16);
                        if (128 == (192 & n) && 128 == (192 & s) && 128 == (192 & o)) {
                            let t = i << 18 & 1835008 | n << 12 & 258048 | s << 6 & 4032 | 63 & o;
                            t < 65536 || t > 1114111 ? e += "\ufffd\ufffd\ufffd\ufffd" : (t -= 65536, e += String.fromCharCode(55296 + (t >> 10), 56320 + (1023 & t))), r += 9;
                            continue
                        }
                    }
                    e += "\ufffd"
                }
            }
            return e
        }))
    }
    e.defaultChars = ";/?:@&=+$,#", e.componentChars = "";
    const r = {};

    function n(t, e, s) {
        "string" != typeof e && (s = e, e = n.defaultChars), void 0 === s && (s = !0);
        const i = function(t) {
            let e = r[t];
            if (e) return e;
            e = r[t] = [];
            for (let t = 0; t < 128; t++) {
                const r = String.fromCharCode(t);
                /^[0-9a-z]$/i.test(r) ? e.push(r) : e.push("%" + ("0" + t.toString(16).toUpperCase()).slice(-2))
            }
            for (let r = 0; r < t.length; r++) e[t.charCodeAt(r)] = t[r];
            return e
        }(e);
        let o = "";
        for (let e = 0, r = t.length; e < r; e++) {
            const n = t.charCodeAt(e);
            if (s && 37 === n && e + 2 < r && /^[0-9a-f]{2}$/i.test(t.slice(e + 1, e + 3))) o += t.slice(e, e + 3), e += 2;
            else if (n < 128) o += i[n];
            else if (n >= 55296 && n <= 57343) {
                if (n >= 55296 && n <= 56319 && e + 1 < r) {
                    const r = t.charCodeAt(e + 1);
                    if (r >= 56320 && r <= 57343) {
                        o += encodeURIComponent(t[e] + t[e + 1]), e++;
                        continue
                    }
                }
                o += "%EF%BF%BD"
            } else o += encodeURIComponent(t[e])
        }
        return o
    }

    function s(t) {
        let e = "";
        return e += t.protocol || "", e += t.slashes ? "//" : "", e += t.auth ? t.auth + "@" : "", t.hostname && -1 !== t.hostname.indexOf(":") ? e += "[" + t.hostname + "]" : e += t.hostname || "", e += t.port ? ":" + t.port : "", e += t.pathname || "", e += t.search || "", e += t.hash || "", e
    }

    function i() {
        this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null
    }
    n.defaultChars = ";/?:@&=+$,-_.!~*'()#", n.componentChars = "-_.!~*'()";
    const o = /^([a-z0-9.+-]+:)/i,
        u = /:[0-9]*$/,
        c = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
        a = ["{", "}", "|", "\\", "^", "`"].concat(["<", ">", '"', "`", " ", "\r", "\n", "\t"]),
        l = ["'"].concat(a),
        h = ["%", "/", "?", ";", "#"].concat(l),
        p = ["/", "?", "#"],
        f = /^[+a-z0-9A-Z_-]{0,63}$/,
        d = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
        _ = {
            javascript: !0,
            "javascript:": !0
        },
        m = {
            http: !0,
            https: !0,
            ftp: !0,
            gopher: !0,
            file: !0,
            "http:": !0,
            "https:": !0,
            "ftp:": !0,
            "gopher:": !0,
            "file:": !0
        };

    function g(t, e) {
        if (t && t instanceof i) return t;
        const r = new i;
        return r.parse(t, e), r
    }
    i.prototype.parse = function(t, e) {
        let r, n, s, i = t;
        if (i = i.trim(), !e && 1 === t.split("#").length) {
            const t = c.exec(i);
            if (t) return this.pathname = t[1], t[2] && (this.search = t[2]), this
        }
        let u = o.exec(i);
        if (u && (u = u[0], r = u.toLowerCase(), this.protocol = u, i = i.substr(u.length)), (e || u || i.match(/^\/\/[^@\/]+@[^@\/]+/)) && (s = "//" === i.substr(0, 2), !s || u && _[u] || (i = i.substr(2), this.slashes = !0)), !_[u] && (s || u && !m[u])) {
            let t, e, r = -1;
            for (let t = 0; t < p.length; t++) n = i.indexOf(p[t]), -1 !== n && (-1 === r || n < r) && (r = n);
            e = -1 === r ? i.lastIndexOf("@") : i.lastIndexOf("@", r), -1 !== e && (t = i.slice(0, e), i = i.slice(e + 1), this.auth = t), r = -1;
            for (let t = 0; t < h.length; t++) n = i.indexOf(h[t]), -1 !== n && (-1 === r || n < r) && (r = n); - 1 === r && (r = i.length), ":" === i[r - 1] && r--;
            const s = i.slice(0, r);
            i = i.slice(r), this.parseHost(s), this.hostname = this.hostname || "";
            const o = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
            if (!o) {
                const t = this.hostname.split(/\./);
                for (let e = 0, r = t.length; e < r; e++) {
                    const r = t[e];
                    if (r && !r.match(f)) {
                        let n = "";
                        for (let t = 0, e = r.length; t < e; t++) r.charCodeAt(t) > 127 ? n += "x" : n += r[t];
                        if (!n.match(f)) {
                            const n = t.slice(0, e),
                                s = t.slice(e + 1),
                                o = r.match(d);
                            o && (n.push(o[1]), s.unshift(o[2])), s.length && (i = s.join(".") + i), this.hostname = n.join(".");
                            break
                        }
                    }
                }
            }
            this.hostname.length > 255 && (this.hostname = ""), o && (this.hostname = this.hostname.substr(1, this.hostname.length - 2))
        }
        const a = i.indexOf("#"); - 1 !== a && (this.hash = i.substr(a), i = i.slice(0, a));
        const l = i.indexOf("?");
        return -1 !== l && (this.search = i.substr(l), i = i.slice(0, l)), i && (this.pathname = i), m[r] && this.hostname && !this.pathname && (this.pathname = ""), this
    }, i.prototype.parseHost = function(t) {
        let e = u.exec(t);
        e && (e = e[0], ":" !== e && (this.port = e.substr(1)), t = t.substr(0, t.length - e.length)), t && (this.hostname = t)
    };
    var k, D = Object.freeze({
            __proto__: null,
            decode: e,
            encode: n,
            format: s,
            parse: g
        }),
        C = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,
        y = /[\0-\x1F\x7F-\x9F]/,
        E = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/,
        A = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/,
        b = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/,
        F = Object.freeze({
            __proto__: null,
            Any: C,
            Cc: y,
            Cf: /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/,
            P: E,
            S: A,
            Z: b
        }),
        x = new Uint16Array('\u1d41<\xd5\u0131\u028a\u049d\u057b\u05d0\u0675\u06de\u07a2\u07d6\u080f\u0a4a\u0a91\u0da1\u0e6d\u0f09\u0f26\u10ca\u1228\u12e1\u1415\u149d\u14c3\u14df\u1525\0\0\0\0\0\0\u156b\u16cd\u198d\u1c12\u1ddd\u1f7e\u2060\u21b0\u228d\u23c0\u23fb\u2442\u2824\u2912\u2d08\u2e48\u2fce\u3016\u32ba\u3639\u37ac\u38fe\u3a28\u3a71\u3ae0\u3b2e\u0800EMabcfglmnoprstu\\bfms\x7f\x84\x8b\x90\x95\x98\xa6\xb3\xb9\xc8\xcflig\u803b\xc6\u40c6P\u803b&\u4026cute\u803b\xc1\u40c1reve;\u4102\u0100iyx}rc\u803b\xc2\u40c2;\u4410r;\uc000\ud835\udd04rave\u803b\xc0\u40c0pha;\u4391acr;\u4100d;\u6a53\u0100gp\x9d\xa1on;\u4104f;\uc000\ud835\udd38plyFunction;\u6061ing\u803b\xc5\u40c5\u0100cs\xbe\xc3r;\uc000\ud835\udc9cign;\u6254ilde\u803b\xc3\u40c3ml\u803b\xc4\u40c4\u0400aceforsu\xe5\xfb\xfe\u0117\u011c\u0122\u0127\u012a\u0100cr\xea\xf2kslash;\u6216\u0176\xf6\xf8;\u6ae7ed;\u6306y;\u4411\u0180crt\u0105\u010b\u0114ause;\u6235noullis;\u612ca;\u4392r;\uc000\ud835\udd05pf;\uc000\ud835\udd39eve;\u42d8c\xf2\u0113mpeq;\u624e\u0700HOacdefhilorsu\u014d\u0151\u0156\u0180\u019e\u01a2\u01b5\u01b7\u01ba\u01dc\u0215\u0273\u0278\u027ecy;\u4427PY\u803b\xa9\u40a9\u0180cpy\u015d\u0162\u017aute;\u4106\u0100;i\u0167\u0168\u62d2talDifferentialD;\u6145leys;\u612d\u0200aeio\u0189\u018e\u0194\u0198ron;\u410cdil\u803b\xc7\u40c7rc;\u4108nint;\u6230ot;\u410a\u0100dn\u01a7\u01adilla;\u40b8terDot;\u40b7\xf2\u017fi;\u43a7rcle\u0200DMPT\u01c7\u01cb\u01d1\u01d6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01e2\u01f8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020foubleQuote;\u601duote;\u6019\u0200lnpu\u021e\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6a74\u0180git\u022f\u0236\u023aruent;\u6261nt;\u622fourIntegral;\u622e\u0100fr\u024c\u024e;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6a2fcr;\uc000\ud835\udc9ep\u0100;C\u0284\u0285\u62d3ap;\u624d\u0580DJSZacefios\u02a0\u02ac\u02b0\u02b4\u02b8\u02cb\u02d7\u02e1\u02e6\u0333\u048d\u0100;o\u0179\u02a5trahd;\u6911cy;\u4402cy;\u4405cy;\u440f\u0180grs\u02bf\u02c4\u02c7ger;\u6021r;\u61a1hv;\u6ae4\u0100ay\u02d0\u02d5ron;\u410e;\u4414l\u0100;t\u02dd\u02de\u6207a;\u4394r;\uc000\ud835\udd07\u0100af\u02eb\u0327\u0100cm\u02f0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031ccute;\u40b4o\u0174\u030b\u030d;\u42d9bleAcute;\u42ddrave;\u4060ilde;\u42dcond;\u62c4ferentialD;\u6146\u0470\u033d\0\0\0\u0342\u0354\0\u0405f;\uc000\ud835\udd3b\u0180;DE\u0348\u0349\u034d\u40a8ot;\u60dcqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03cf\u03e2\u03f8ontourIntegra\xec\u0239o\u0274\u0379\0\0\u037b\xbb\u0349nArrow;\u61d3\u0100eo\u0387\u03a4ft\u0180ART\u0390\u0396\u03a1rrow;\u61d0ightArrow;\u61d4e\xe5\u02cang\u0100LR\u03ab\u03c4eft\u0100AR\u03b3\u03b9rrow;\u67f8ightArrow;\u67faightArrow;\u67f9ight\u0100AT\u03d8\u03derrow;\u61d2ee;\u62a8p\u0241\u03e9\0\0\u03efrrow;\u61d1ownArrow;\u61d5erticalBar;\u6225n\u0300ABLRTa\u0412\u042a\u0430\u045e\u047f\u037crrow\u0180;BU\u041d\u041e\u0422\u6193ar;\u6913pArrow;\u61f5reve;\u4311eft\u02d2\u043a\0\u0446\0\u0450ightVector;\u6950eeVector;\u695eector\u0100;B\u0459\u045a\u61bdar;\u6956ight\u01d4\u0467\0\u0471eeVector;\u695fector\u0100;B\u047a\u047b\u61c1ar;\u6957ee\u0100;A\u0486\u0487\u62a4rrow;\u61a7\u0100ct\u0492\u0497r;\uc000\ud835\udc9frok;\u4110\u0800NTacdfglmopqstux\u04bd\u04c0\u04c4\u04cb\u04de\u04e2\u04e7\u04ee\u04f5\u0521\u052f\u0536\u0552\u055d\u0560\u0565G;\u414aH\u803b\xd0\u40d0cute\u803b\xc9\u40c9\u0180aiy\u04d2\u04d7\u04dcron;\u411arc\u803b\xca\u40ca;\u442dot;\u4116r;\uc000\ud835\udd08rave\u803b\xc8\u40c8ement;\u6208\u0100ap\u04fa\u04fecr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65fberySmallSquare;\u65ab\u0100gp\u0526\u052aon;\u4118f;\uc000\ud835\udd3csilon;\u4395u\u0100ai\u053c\u0549l\u0100;T\u0542\u0543\u6a75ilde;\u6242librium;\u61cc\u0100ci\u0557\u055ar;\u6130m;\u6a73a;\u4397ml\u803b\xcb\u40cb\u0100ip\u056a\u056fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058d\u05b2\u05ccy;\u4424r;\uc000\ud835\udd09lled\u0253\u0597\0\0\u05a3mallSquare;\u65fcerySmallSquare;\u65aa\u0370\u05ba\0\u05bf\0\0\u05c4f;\uc000\ud835\udd3dAll;\u6200riertrf;\u6131c\xf2\u05cb\u0600JTabcdfgorst\u05e8\u05ec\u05ef\u05fa\u0600\u0612\u0616\u061b\u061d\u0623\u066c\u0672cy;\u4403\u803b>\u403emma\u0100;d\u05f7\u05f8\u4393;\u43dcreve;\u411e\u0180eiy\u0607\u060c\u0610dil;\u4122rc;\u411c;\u4413ot;\u4120r;\uc000\ud835\udd0a;\u62d9pf;\uc000\ud835\udd3eeater\u0300EFGLST\u0635\u0644\u064e\u0656\u065b\u0666qual\u0100;L\u063e\u063f\u6265ess;\u62dbullEqual;\u6267reater;\u6aa2ess;\u6277lantEqual;\u6a7eilde;\u6273cr;\uc000\ud835\udca2;\u626b\u0400Aacfiosu\u0685\u068b\u0696\u069b\u069e\u06aa\u06be\u06caRDcy;\u442a\u0100ct\u0690\u0694ek;\u42c7;\u405eirc;\u4124r;\u610clbertSpace;\u610b\u01f0\u06af\0\u06b2f;\u610dizontalLine;\u6500\u0100ct\u06c3\u06c5\xf2\u06a9rok;\u4126mp\u0144\u06d0\u06d8ownHum\xf0\u012fqual;\u624f\u0700EJOacdfgmnostu\u06fa\u06fe\u0703\u0707\u070e\u071a\u071e\u0721\u0728\u0744\u0778\u078b\u078f\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803b\xcd\u40cd\u0100iy\u0713\u0718rc\u803b\xce\u40ce;\u4418ot;\u4130r;\u6111rave\u803b\xcc\u40cc\u0180;ap\u0720\u072f\u073f\u0100cg\u0734\u0737r;\u412ainaryI;\u6148lie\xf3\u03dd\u01f4\u0749\0\u0762\u0100;e\u074d\u074e\u622c\u0100gr\u0753\u0758ral;\u622bsection;\u62c2isible\u0100CT\u076c\u0772omma;\u6063imes;\u6062\u0180gpt\u077f\u0783\u0788on;\u412ef;\uc000\ud835\udd40a;\u4399cr;\u6110ilde;\u4128\u01eb\u079a\0\u079ecy;\u4406l\u803b\xcf\u40cf\u0280cfosu\u07ac\u07b7\u07bc\u07c2\u07d0\u0100iy\u07b1\u07b5rc;\u4134;\u4419r;\uc000\ud835\udd0dpf;\uc000\ud835\udd41\u01e3\u07c7\0\u07ccr;\uc000\ud835\udca5rcy;\u4408kcy;\u4404\u0380HJacfos\u07e4\u07e8\u07ec\u07f1\u07fd\u0802\u0808cy;\u4425cy;\u440cppa;\u439a\u0100ey\u07f6\u07fbdil;\u4136;\u441ar;\uc000\ud835\udd0epf;\uc000\ud835\udd42cr;\uc000\ud835\udca6\u0580JTaceflmost\u0825\u0829\u082c\u0850\u0863\u09b3\u09b8\u09c7\u09cd\u0a37\u0a47cy;\u4409\u803b<\u403c\u0280cmnpr\u0837\u083c\u0841\u0844\u084dute;\u4139bda;\u439bg;\u67ealacetrf;\u6112r;\u619e\u0180aey\u0857\u085c\u0861ron;\u413ddil;\u413b;\u441b\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087e\u08a9\u08b1\u08e0\u08e6\u08fc\u092f\u095b\u0390\u096a\u0100nr\u0883\u088fgleBracket;\u67e8row\u0180;BR\u0899\u089a\u089e\u6190ar;\u61e4ightArrow;\u61c6eiling;\u6308o\u01f5\u08b7\0\u08c3bleBracket;\u67e6n\u01d4\u08c8\0\u08d2eeVector;\u6961ector\u0100;B\u08db\u08dc\u61c3ar;\u6959loor;\u630aight\u0100AV\u08ef\u08f5rrow;\u6194ector;\u694e\u0100er\u0901\u0917e\u0180;AV\u0909\u090a\u0910\u62a3rrow;\u61a4ector;\u695aiangle\u0180;BE\u0924\u0925\u0929\u62b2ar;\u69cfqual;\u62b4p\u0180DTV\u0937\u0942\u094cownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61bfar;\u6958ector\u0100;B\u0965\u0966\u61bcar;\u6952ight\xe1\u039cs\u0300EFGLST\u097e\u098b\u0995\u099d\u09a2\u09adqualGreater;\u62daullEqual;\u6266reater;\u6276ess;\u6aa1lantEqual;\u6a7dilde;\u6272r;\uc000\ud835\udd0f\u0100;e\u09bd\u09be\u62d8ftarrow;\u61daidot;\u413f\u0180npw\u09d4\u0a16\u0a1bg\u0200LRlr\u09de\u09f7\u0a02\u0a10eft\u0100AR\u09e6\u09ecrrow;\u67f5ightArrow;\u67f7ightArrow;\u67f6eft\u0100ar\u03b3\u0a0aight\xe1\u03bfight\xe1\u03caf;\uc000\ud835\udd43er\u0100LR\u0a22\u0a2ceftArrow;\u6199ightArrow;\u6198\u0180cht\u0a3e\u0a40\u0a42\xf2\u084c;\u61b0rok;\u4141;\u626a\u0400acefiosu\u0a5a\u0a5d\u0a60\u0a77\u0a7c\u0a85\u0a8b\u0a8ep;\u6905y;\u441c\u0100dl\u0a65\u0a6fiumSpace;\u605flintrf;\u6133r;\uc000\ud835\udd10nusPlus;\u6213pf;\uc000\ud835\udd44c\xf2\u0a76;\u439c\u0480Jacefostu\u0aa3\u0aa7\u0aad\u0ac0\u0b14\u0b19\u0d91\u0d97\u0d9ecy;\u440acute;\u4143\u0180aey\u0ab4\u0ab9\u0aberon;\u4147dil;\u4145;\u441d\u0180gsw\u0ac7\u0af0\u0b0eative\u0180MTV\u0ad3\u0adf\u0ae8ediumSpace;\u600bhi\u0100cn\u0ae6\u0ad8\xeb\u0ad9eryThi\xee\u0ad9ted\u0100GL\u0af8\u0b06reaterGreate\xf2\u0673essLes\xf3\u0a48Line;\u400ar;\uc000\ud835\udd11\u0200Bnpt\u0b22\u0b28\u0b37\u0b3areak;\u6060BreakingSpace;\u40a0f;\u6115\u0680;CDEGHLNPRSTV\u0b55\u0b56\u0b6a\u0b7c\u0ba1\u0beb\u0c04\u0c5e\u0c84\u0ca6\u0cd8\u0d61\u0d85\u6aec\u0100ou\u0b5b\u0b64ngruent;\u6262pCap;\u626doubleVerticalBar;\u6226\u0180lqx\u0b83\u0b8a\u0b9bement;\u6209ual\u0100;T\u0b92\u0b93\u6260ilde;\uc000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0bb6\u0bb7\u0bbd\u0bc9\u0bd3\u0bd8\u0be5\u626fqual;\u6271ullEqual;\uc000\u2267\u0338reater;\uc000\u226b\u0338ess;\u6279lantEqual;\uc000\u2a7e\u0338ilde;\u6275ump\u0144\u0bf2\u0bfdownHump;\uc000\u224e\u0338qual;\uc000\u224f\u0338e\u0100fs\u0c0a\u0c27tTriangle\u0180;BE\u0c1a\u0c1b\u0c21\u62eaar;\uc000\u29cf\u0338qual;\u62ecs\u0300;EGLST\u0c35\u0c36\u0c3c\u0c44\u0c4b\u0c58\u626equal;\u6270reater;\u6278ess;\uc000\u226a\u0338lantEqual;\uc000\u2a7d\u0338ilde;\u6274ested\u0100GL\u0c68\u0c79reaterGreater;\uc000\u2aa2\u0338essLess;\uc000\u2aa1\u0338recedes\u0180;ES\u0c92\u0c93\u0c9b\u6280qual;\uc000\u2aaf\u0338lantEqual;\u62e0\u0100ei\u0cab\u0cb9verseElement;\u620cghtTriangle\u0180;BE\u0ccb\u0ccc\u0cd2\u62ebar;\uc000\u29d0\u0338qual;\u62ed\u0100qu\u0cdd\u0d0cuareSu\u0100bp\u0ce8\u0cf9set\u0100;E\u0cf0\u0cf3\uc000\u228f\u0338qual;\u62e2erset\u0100;E\u0d03\u0d06\uc000\u2290\u0338qual;\u62e3\u0180bcp\u0d13\u0d24\u0d4eset\u0100;E\u0d1b\u0d1e\uc000\u2282\u20d2qual;\u6288ceeds\u0200;EST\u0d32\u0d33\u0d3b\u0d46\u6281qual;\uc000\u2ab0\u0338lantEqual;\u62e1ilde;\uc000\u227f\u0338erset\u0100;E\u0d58\u0d5b\uc000\u2283\u20d2qual;\u6289ilde\u0200;EFT\u0d6e\u0d6f\u0d75\u0d7f\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uc000\ud835\udca9ilde\u803b\xd1\u40d1;\u439d\u0700Eacdfgmoprstuv\u0dbd\u0dc2\u0dc9\u0dd5\u0ddb\u0de0\u0de7\u0dfc\u0e02\u0e20\u0e22\u0e32\u0e3f\u0e44lig;\u4152cute\u803b\xd3\u40d3\u0100iy\u0dce\u0dd3rc\u803b\xd4\u40d4;\u441eblac;\u4150r;\uc000\ud835\udd12rave\u803b\xd2\u40d2\u0180aei\u0dee\u0df2\u0df6cr;\u414cga;\u43a9cron;\u439fpf;\uc000\ud835\udd46enCurly\u0100DQ\u0e0e\u0e1aoubleQuote;\u601cuote;\u6018;\u6a54\u0100cl\u0e27\u0e2cr;\uc000\ud835\udcaaash\u803b\xd8\u40d8i\u016c\u0e37\u0e3cde\u803b\xd5\u40d5es;\u6a37ml\u803b\xd6\u40d6er\u0100BP\u0e4b\u0e60\u0100ar\u0e50\u0e53r;\u603eac\u0100ek\u0e5a\u0e5c;\u63deet;\u63b4arenthesis;\u63dc\u0480acfhilors\u0e7f\u0e87\u0e8a\u0e8f\u0e92\u0e94\u0e9d\u0eb0\u0efcrtialD;\u6202y;\u441fr;\uc000\ud835\udd13i;\u43a6;\u43a0usMinus;\u40b1\u0100ip\u0ea2\u0eadncareplan\xe5\u069df;\u6119\u0200;eio\u0eb9\u0eba\u0ee0\u0ee4\u6abbcedes\u0200;EST\u0ec8\u0ec9\u0ecf\u0eda\u627aqual;\u6aaflantEqual;\u627cilde;\u627eme;\u6033\u0100dp\u0ee9\u0eeeuct;\u620fortion\u0100;a\u0225\u0ef9l;\u621d\u0100ci\u0f01\u0f06r;\uc000\ud835\udcab;\u43a8\u0200Ufos\u0f11\u0f16\u0f1b\u0f1fOT\u803b"\u4022r;\uc000\ud835\udd14pf;\u611acr;\uc000\ud835\udcac\u0600BEacefhiorsu\u0f3e\u0f43\u0f47\u0f60\u0f73\u0fa7\u0faa\u0fad\u1096\u10a9\u10b4\u10bearr;\u6910G\u803b\xae\u40ae\u0180cnr\u0f4e\u0f53\u0f56ute;\u4154g;\u67ebr\u0100;t\u0f5c\u0f5d\u61a0l;\u6916\u0180aey\u0f67\u0f6c\u0f71ron;\u4158dil;\u4156;\u4420\u0100;v\u0f78\u0f79\u611cerse\u0100EU\u0f82\u0f99\u0100lq\u0f87\u0f8eement;\u620builibrium;\u61cbpEquilibrium;\u696fr\xbb\u0f79o;\u43a1ght\u0400ACDFTUVa\u0fc1\u0feb\u0ff3\u1022\u1028\u105b\u1087\u03d8\u0100nr\u0fc6\u0fd2gleBracket;\u67e9row\u0180;BL\u0fdc\u0fdd\u0fe1\u6192ar;\u61e5eftArrow;\u61c4eiling;\u6309o\u01f5\u0ff9\0\u1005bleBracket;\u67e7n\u01d4\u100a\0\u1014eeVector;\u695dector\u0100;B\u101d\u101e\u61c2ar;\u6955loor;\u630b\u0100er\u102d\u1043e\u0180;AV\u1035\u1036\u103c\u62a2rrow;\u61a6ector;\u695biangle\u0180;BE\u1050\u1051\u1055\u62b3ar;\u69d0qual;\u62b5p\u0180DTV\u1063\u106e\u1078ownVector;\u694feeVector;\u695cector\u0100;B\u1082\u1083\u61bear;\u6954ector\u0100;B\u1091\u1092\u61c0ar;\u6953\u0100pu\u109b\u109ef;\u611dndImplies;\u6970ightarrow;\u61db\u0100ch\u10b9\u10bcr;\u611b;\u61b1leDelayed;\u69f4\u0680HOacfhimoqstu\u10e4\u10f1\u10f7\u10fd\u1119\u111e\u1151\u1156\u1161\u1167\u11b5\u11bb\u11bf\u0100Cc\u10e9\u10eeHcy;\u4429y;\u4428FTcy;\u442ccute;\u415a\u0280;aeiy\u1108\u1109\u110e\u1113\u1117\u6abcron;\u4160dil;\u415erc;\u415c;\u4421r;\uc000\ud835\udd16ort\u0200DLRU\u112a\u1134\u113e\u1149ownArrow\xbb\u041eeftArrow\xbb\u089aightArrow\xbb\u0fddpArrow;\u6191gma;\u43a3allCircle;\u6218pf;\uc000\ud835\udd4a\u0272\u116d\0\0\u1170t;\u621aare\u0200;ISU\u117b\u117c\u1189\u11af\u65a1ntersection;\u6293u\u0100bp\u118f\u119eset\u0100;E\u1197\u1198\u628fqual;\u6291erset\u0100;E\u11a8\u11a9\u6290qual;\u6292nion;\u6294cr;\uc000\ud835\udcaear;\u62c6\u0200bcmp\u11c8\u11db\u1209\u120b\u0100;s\u11cd\u11ce\u62d0et\u0100;E\u11cd\u11d5qual;\u6286\u0100ch\u11e0\u1205eeds\u0200;EST\u11ed\u11ee\u11f4\u11ff\u627bqual;\u6ab0lantEqual;\u627dilde;\u627fTh\xe1\u0f8c;\u6211\u0180;es\u1212\u1213\u1223\u62d1rset\u0100;E\u121c\u121d\u6283qual;\u6287et\xbb\u1213\u0580HRSacfhiors\u123e\u1244\u1249\u1255\u125e\u1271\u1276\u129f\u12c2\u12c8\u12d1ORN\u803b\xde\u40deADE;\u6122\u0100Hc\u124e\u1252cy;\u440by;\u4426\u0100bu\u125a\u125c;\u4009;\u43a4\u0180aey\u1265\u126a\u126fron;\u4164dil;\u4162;\u4422r;\uc000\ud835\udd17\u0100ei\u127b\u1289\u01f2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128e\u1298kSpace;\uc000\u205f\u200aSpace;\u6009lde\u0200;EFT\u12ab\u12ac\u12b2\u12bc\u623cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uc000\ud835\udd4bipleDot;\u60db\u0100ct\u12d6\u12dbr;\uc000\ud835\udcafrok;\u4166\u0ae1\u12f7\u130e\u131a\u1326\0\u132c\u1331\0\0\0\0\0\u1338\u133d\u1377\u1385\0\u13ff\u1404\u140a\u1410\u0100cr\u12fb\u1301ute\u803b\xda\u40dar\u0100;o\u1307\u1308\u619fcir;\u6949r\u01e3\u1313\0\u1316y;\u440eve;\u416c\u0100iy\u131e\u1323rc\u803b\xdb\u40db;\u4423blac;\u4170r;\uc000\ud835\udd18rave\u803b\xd9\u40d9acr;\u416a\u0100di\u1341\u1369er\u0100BP\u1348\u135d\u0100ar\u134d\u1350r;\u405fac\u0100ek\u1357\u1359;\u63dfet;\u63b5arenthesis;\u63ddon\u0100;P\u1370\u1371\u62c3lus;\u628e\u0100gp\u137b\u137fon;\u4172f;\uc000\ud835\udd4c\u0400ADETadps\u1395\u13ae\u13b8\u13c4\u03e8\u13d2\u13d7\u13f3rrow\u0180;BD\u1150\u13a0\u13a4ar;\u6912ownArrow;\u61c5ownArrow;\u6195quilibrium;\u696eee\u0100;A\u13cb\u13cc\u62a5rrow;\u61a5own\xe1\u03f3er\u0100LR\u13de\u13e8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13f9\u13fa\u43d2on;\u43a5ing;\u416ecr;\uc000\ud835\udcb0ilde;\u4168ml\u803b\xdc\u40dc\u0480Dbcdefosv\u1427\u142c\u1430\u1433\u143e\u1485\u148a\u1490\u1496ash;\u62abar;\u6aeby;\u4412ash\u0100;l\u143b\u143c\u62a9;\u6ae6\u0100er\u1443\u1445;\u62c1\u0180bty\u144c\u1450\u147aar;\u6016\u0100;i\u144f\u1455cal\u0200BLST\u1461\u1465\u146a\u1474ar;\u6223ine;\u407ceparator;\u6758ilde;\u6240ThinSpace;\u600ar;\uc000\ud835\udd19pf;\uc000\ud835\udd4dcr;\uc000\ud835\udcb1dash;\u62aa\u0280cefos\u14a7\u14ac\u14b1\u14b6\u14bcirc;\u4174dge;\u62c0r;\uc000\ud835\udd1apf;\uc000\ud835\udd4ecr;\uc000\ud835\udcb2\u0200fios\u14cb\u14d0\u14d2\u14d8r;\uc000\ud835\udd1b;\u439epf;\uc000\ud835\udd4fcr;\uc000\ud835\udcb3\u0480AIUacfosu\u14f1\u14f5\u14f9\u14fd\u1504\u150f\u1514\u151a\u1520cy;\u442fcy;\u4407cy;\u442ecute\u803b\xdd\u40dd\u0100iy\u1509\u150drc;\u4176;\u442br;\uc000\ud835\udd1cpf;\uc000\ud835\udd50cr;\uc000\ud835\udcb4ml;\u4178\u0400Hacdefos\u1535\u1539\u153f\u154b\u154f\u155d\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417d;\u4417ot;\u417b\u01f2\u1554\0\u155boWidt\xe8\u0ad9a;\u4396r;\u6128pf;\u6124cr;\uc000\ud835\udcb5\u0be1\u1583\u158a\u1590\0\u15b0\u15b6\u15bf\0\0\0\0\u15c6\u15db\u15eb\u165f\u166d\0\u1695\u169b\u16b2\u16b9\0\u16becute\u803b\xe1\u40e1reve;\u4103\u0300;Ediuy\u159c\u159d\u15a1\u15a3\u15a8\u15ad\u623e;\uc000\u223e\u0333;\u623frc\u803b\xe2\u40e2te\u80bb\xb4\u0306;\u4430lig\u803b\xe6\u40e6\u0100;r\xb2\u15ba;\uc000\ud835\udd1erave\u803b\xe0\u40e0\u0100ep\u15ca\u15d6\u0100fp\u15cf\u15d4sym;\u6135\xe8\u15d3ha;\u43b1\u0100ap\u15dfc\u0100cl\u15e4\u15e7r;\u4101g;\u6a3f\u0264\u15f0\0\0\u160a\u0280;adsv\u15fa\u15fb\u15ff\u1601\u1607\u6227nd;\u6a55;\u6a5clope;\u6a58;\u6a5a\u0380;elmrsz\u1618\u1619\u161b\u161e\u163f\u164f\u1659\u6220;\u69a4e\xbb\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163a\u163c\u163e;\u69a8;\u69a9;\u69aa;\u69ab;\u69ac;\u69ad;\u69ae;\u69aft\u0100;v\u1645\u1646\u621fb\u0100;d\u164c\u164d\u62be;\u699d\u0100pt\u1654\u1657h;\u6222\xbb\xb9arr;\u637c\u0100gp\u1663\u1667on;\u4105f;\uc000\ud835\udd52\u0380;Eaeiop\u12c1\u167b\u167d\u1682\u1684\u1687\u168a;\u6a70cir;\u6a6f;\u624ad;\u624bs;\u4027rox\u0100;e\u12c1\u1692\xf1\u1683ing\u803b\xe5\u40e5\u0180cty\u16a1\u16a6\u16a8r;\uc000\ud835\udcb6;\u402amp\u0100;e\u12c1\u16af\xf1\u0288ilde\u803b\xe3\u40e3ml\u803b\xe4\u40e4\u0100ci\u16c2\u16c8onin\xf4\u0272nt;\u6a11\u0800Nabcdefiklnoprsu\u16ed\u16f1\u1730\u173c\u1743\u1748\u1778\u177d\u17e0\u17e6\u1839\u1850\u170d\u193d\u1948\u1970ot;\u6aed\u0100cr\u16f6\u171ek\u0200ceps\u1700\u1705\u170d\u1713ong;\u624cpsilon;\u43f6rime;\u6035im\u0100;e\u171a\u171b\u623dq;\u62cd\u0176\u1722\u1726ee;\u62bded\u0100;g\u172c\u172d\u6305e\xbb\u172drk\u0100;t\u135c\u1737brk;\u63b6\u0100oy\u1701\u1741;\u4431quo;\u601e\u0280cmprt\u1753\u175b\u1761\u1764\u1768aus\u0100;e\u010a\u0109ptyv;\u69b0s\xe9\u170cno\xf5\u0113\u0180ahw\u176f\u1771\u1773;\u43b2;\u6136een;\u626cr;\uc000\ud835\udd1fg\u0380costuvw\u178d\u179d\u17b3\u17c1\u17d5\u17db\u17de\u0180aiu\u1794\u1796\u179a\xf0\u0760rc;\u65efp\xbb\u1371\u0180dpt\u17a4\u17a8\u17adot;\u6a00lus;\u6a01imes;\u6a02\u0271\u17b9\0\0\u17becup;\u6a06ar;\u6605riangle\u0100du\u17cd\u17d2own;\u65bdp;\u65b3plus;\u6a04e\xe5\u1444\xe5\u14adarow;\u690d\u0180ako\u17ed\u1826\u1835\u0100cn\u17f2\u1823k\u0180lst\u17fa\u05ab\u1802ozenge;\u69ebriangle\u0200;dlr\u1812\u1813\u1818\u181d\u65b4own;\u65beeft;\u65c2ight;\u65b8k;\u6423\u01b1\u182b\0\u1833\u01b2\u182f\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183e\u184d\u0100;q\u1843\u1846\uc000=\u20e5uiv;\uc000\u2261\u20e5t;\u6310\u0200ptwx\u1859\u185e\u1867\u186cf;\uc000\ud835\udd53\u0100;t\u13cb\u1863om\xbb\u13cctie;\u62c8\u0600DHUVbdhmptuv\u1885\u1896\u18aa\u18bb\u18d7\u18db\u18ec\u18ff\u1905\u190a\u1910\u1921\u0200LRlr\u188e\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18a1\u18a2\u18a4\u18a6\u18a8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18b3\u18b5\u18b7\u18b9;\u655d;\u655a;\u655c;\u6559\u0380;HLRhlr\u18ca\u18cb\u18cd\u18cf\u18d1\u18d3\u18d5\u6551;\u656c;\u6563;\u6560;\u656b;\u6562;\u655fox;\u69c9\u0200LRlr\u18e4\u18e6\u18e8\u18ea;\u6555;\u6552;\u6510;\u650c\u0280;DUdu\u06bd\u18f7\u18f9\u18fb\u18fd;\u6565;\u6568;\u652c;\u6534inus;\u629flus;\u629eimes;\u62a0\u0200LRlr\u1919\u191b\u191d\u191f;\u655b;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193b\u6502;\u656a;\u6561;\u655e;\u653c;\u6524;\u651c\u0100ev\u0123\u1942bar\u803b\xa6\u40a6\u0200ceio\u1951\u1956\u195a\u1960r;\uc000\ud835\udcb7mi;\u604fm\u0100;e\u171a\u171cl\u0180;bh\u1968\u1969\u196b\u405c;\u69c5sub;\u67c8\u016c\u1974\u197el\u0100;e\u1979\u197a\u6022t\xbb\u197ap\u0180;Ee\u012f\u1985\u1987;\u6aae\u0100;q\u06dc\u06db\u0ce1\u19a7\0\u19e8\u1a11\u1a15\u1a32\0\u1a37\u1a50\0\0\u1ab4\0\0\u1ac1\0\0\u1b21\u1b2e\u1b4d\u1b52\0\u1bfd\0\u1c0c\u0180cpr\u19ad\u19b2\u19ddute;\u4107\u0300;abcds\u19bf\u19c0\u19c4\u19ca\u19d5\u19d9\u6229nd;\u6a44rcup;\u6a49\u0100au\u19cf\u19d2p;\u6a4bp;\u6a47ot;\u6a40;\uc000\u2229\ufe00\u0100eo\u19e2\u19e5t;\u6041\xee\u0693\u0200aeiu\u19f0\u19fb\u1a01\u1a05\u01f0\u19f5\0\u19f8s;\u6a4don;\u410ddil\u803b\xe7\u40e7rc;\u4109ps\u0100;s\u1a0c\u1a0d\u6a4cm;\u6a50ot;\u410b\u0180dmn\u1a1b\u1a20\u1a26il\u80bb\xb8\u01adptyv;\u69b2t\u8100\xa2;e\u1a2d\u1a2e\u40a2r\xe4\u01b2r;\uc000\ud835\udd20\u0180cei\u1a3d\u1a40\u1a4dy;\u4447ck\u0100;m\u1a47\u1a48\u6713ark\xbb\u1a48;\u43c7r\u0380;Ecefms\u1a5f\u1a60\u1a62\u1a6b\u1aa4\u1aaa\u1aae\u65cb;\u69c3\u0180;el\u1a69\u1a6a\u1a6d\u42c6q;\u6257e\u0261\u1a74\0\0\u1a88rrow\u0100lr\u1a7c\u1a81eft;\u61baight;\u61bb\u0280RSacd\u1a92\u1a94\u1a96\u1a9a\u1a9f\xbb\u0f47;\u64c8st;\u629birc;\u629aash;\u629dnint;\u6a10id;\u6aefcir;\u69c2ubs\u0100;u\u1abb\u1abc\u6663it\xbb\u1abc\u02ec\u1ac7\u1ad4\u1afa\0\u1b0aon\u0100;e\u1acd\u1ace\u403a\u0100;q\xc7\xc6\u026d\u1ad9\0\0\u1ae2a\u0100;t\u1ade\u1adf\u402c;\u4040\u0180;fl\u1ae8\u1ae9\u1aeb\u6201\xee\u1160e\u0100mx\u1af1\u1af6ent\xbb\u1ae9e\xf3\u024d\u01e7\u1afe\0\u1b07\u0100;d\u12bb\u1b02ot;\u6a6dn\xf4\u0246\u0180fry\u1b10\u1b14\u1b17;\uc000\ud835\udd54o\xe4\u0254\u8100\xa9;s\u0155\u1b1dr;\u6117\u0100ao\u1b25\u1b29rr;\u61b5ss;\u6717\u0100cu\u1b32\u1b37r;\uc000\ud835\udcb8\u0100bp\u1b3c\u1b44\u0100;e\u1b41\u1b42\u6acf;\u6ad1\u0100;e\u1b49\u1b4a\u6ad0;\u6ad2dot;\u62ef\u0380delprvw\u1b60\u1b6c\u1b77\u1b82\u1bac\u1bd4\u1bf9arr\u0100lr\u1b68\u1b6a;\u6938;\u6935\u0270\u1b72\0\0\u1b75r;\u62dec;\u62dfarr\u0100;p\u1b7f\u1b80\u61b6;\u693d\u0300;bcdos\u1b8f\u1b90\u1b96\u1ba1\u1ba5\u1ba8\u622arcap;\u6a48\u0100au\u1b9b\u1b9ep;\u6a46p;\u6a4aot;\u628dr;\u6a45;\uc000\u222a\ufe00\u0200alrv\u1bb5\u1bbf\u1bde\u1be3rr\u0100;m\u1bbc\u1bbd\u61b7;\u693cy\u0180evw\u1bc7\u1bd4\u1bd8q\u0270\u1bce\0\0\u1bd2re\xe3\u1b73u\xe3\u1b75ee;\u62ceedge;\u62cfen\u803b\xa4\u40a4earrow\u0100lr\u1bee\u1bf3eft\xbb\u1b80ight\xbb\u1bbde\xe4\u1bdd\u0100ci\u1c01\u1c07onin\xf4\u01f7nt;\u6231lcty;\u632d\u0980AHabcdefhijlorstuwz\u1c38\u1c3b\u1c3f\u1c5d\u1c69\u1c75\u1c8a\u1c9e\u1cac\u1cb7\u1cfb\u1cff\u1d0d\u1d7b\u1d91\u1dab\u1dbb\u1dc6\u1dcdr\xf2\u0381ar;\u6965\u0200glrs\u1c48\u1c4d\u1c52\u1c54ger;\u6020eth;\u6138\xf2\u1133h\u0100;v\u1c5a\u1c5b\u6010\xbb\u090a\u016b\u1c61\u1c67arow;\u690fa\xe3\u0315\u0100ay\u1c6e\u1c73ron;\u410f;\u4434\u0180;ao\u0332\u1c7c\u1c84\u0100gr\u02bf\u1c81r;\u61catseq;\u6a77\u0180glm\u1c91\u1c94\u1c98\u803b\xb0\u40b0ta;\u43b4ptyv;\u69b1\u0100ir\u1ca3\u1ca8sht;\u697f;\uc000\ud835\udd21ar\u0100lr\u1cb3\u1cb5\xbb\u08dc\xbb\u101e\u0280aegsv\u1cc2\u0378\u1cd6\u1cdc\u1ce0m\u0180;os\u0326\u1cca\u1cd4nd\u0100;s\u0326\u1cd1uit;\u6666amma;\u43ddin;\u62f2\u0180;io\u1ce7\u1ce8\u1cf8\u40f7de\u8100\xf7;o\u1ce7\u1cf0ntimes;\u62c7n\xf8\u1cf7cy;\u4452c\u026f\u1d06\0\0\u1d0arn;\u631eop;\u630d\u0280lptuw\u1d18\u1d1d\u1d22\u1d49\u1d55lar;\u4024f;\uc000\ud835\udd55\u0280;emps\u030b\u1d2d\u1d37\u1d3d\u1d42q\u0100;d\u0352\u1d33ot;\u6251inus;\u6238lus;\u6214quare;\u62a1blebarwedg\xe5\xfan\u0180adh\u112e\u1d5d\u1d67ownarrow\xf3\u1c83arpoon\u0100lr\u1d72\u1d76ef\xf4\u1cb4igh\xf4\u1cb6\u0162\u1d7f\u1d85karo\xf7\u0f42\u026f\u1d8a\0\0\u1d8ern;\u631fop;\u630c\u0180cot\u1d98\u1da3\u1da6\u0100ry\u1d9d\u1da1;\uc000\ud835\udcb9;\u4455l;\u69f6rok;\u4111\u0100dr\u1db0\u1db4ot;\u62f1i\u0100;f\u1dba\u1816\u65bf\u0100ah\u1dc0\u1dc3r\xf2\u0429a\xf2\u0fa6angle;\u69a6\u0100ci\u1dd2\u1dd5y;\u445fgrarr;\u67ff\u0900Dacdefglmnopqrstux\u1e01\u1e09\u1e19\u1e38\u0578\u1e3c\u1e49\u1e61\u1e7e\u1ea5\u1eaf\u1ebd\u1ee1\u1f2a\u1f37\u1f44\u1f4e\u1f5a\u0100Do\u1e06\u1d34o\xf4\u1c89\u0100cs\u1e0e\u1e14ute\u803b\xe9\u40e9ter;\u6a6e\u0200aioy\u1e22\u1e27\u1e31\u1e36ron;\u411br\u0100;c\u1e2d\u1e2e\u6256\u803b\xea\u40ealon;\u6255;\u444dot;\u4117\u0100Dr\u1e41\u1e45ot;\u6252;\uc000\ud835\udd22\u0180;rs\u1e50\u1e51\u1e57\u6a9aave\u803b\xe8\u40e8\u0100;d\u1e5c\u1e5d\u6a96ot;\u6a98\u0200;ils\u1e6a\u1e6b\u1e72\u1e74\u6a99nters;\u63e7;\u6113\u0100;d\u1e79\u1e7a\u6a95ot;\u6a97\u0180aps\u1e85\u1e89\u1e97cr;\u4113ty\u0180;sv\u1e92\u1e93\u1e95\u6205et\xbb\u1e93p\u01001;\u1e9d\u1ea4\u0133\u1ea1\u1ea3;\u6004;\u6005\u6003\u0100gs\u1eaa\u1eac;\u414bp;\u6002\u0100gp\u1eb4\u1eb8on;\u4119f;\uc000\ud835\udd56\u0180als\u1ec4\u1ece\u1ed2r\u0100;s\u1eca\u1ecb\u62d5l;\u69e3us;\u6a71i\u0180;lv\u1eda\u1edb\u1edf\u43b5on\xbb\u1edb;\u43f5\u0200csuv\u1eea\u1ef3\u1f0b\u1f23\u0100io\u1eef\u1e31rc\xbb\u1e2e\u0269\u1ef9\0\0\u1efb\xed\u0548ant\u0100gl\u1f02\u1f06tr\xbb\u1e5dess\xbb\u1e7a\u0180aei\u1f12\u1f16\u1f1als;\u403dst;\u625fv\u0100;D\u0235\u1f20D;\u6a78parsl;\u69e5\u0100Da\u1f2f\u1f33ot;\u6253rr;\u6971\u0180cdi\u1f3e\u1f41\u1ef8r;\u612fo\xf4\u0352\u0100ah\u1f49\u1f4b;\u43b7\u803b\xf0\u40f0\u0100mr\u1f53\u1f57l\u803b\xeb\u40ebo;\u60ac\u0180cip\u1f61\u1f64\u1f67l;\u4021s\xf4\u056e\u0100eo\u1f6c\u1f74ctatio\xee\u0559nential\xe5\u0579\u09e1\u1f92\0\u1f9e\0\u1fa1\u1fa7\0\0\u1fc6\u1fcc\0\u1fd3\0\u1fe6\u1fea\u2000\0\u2008\u205allingdotse\xf1\u1e44y;\u4444male;\u6640\u0180ilr\u1fad\u1fb3\u1fc1lig;\u8000\ufb03\u0269\u1fb9\0\0\u1fbdg;\u8000\ufb00ig;\u8000\ufb04;\uc000\ud835\udd23lig;\u8000\ufb01lig;\uc000fj\u0180alt\u1fd9\u1fdc\u1fe1t;\u666dig;\u8000\ufb02ns;\u65b1of;\u4192\u01f0\u1fee\0\u1ff3f;\uc000\ud835\udd57\u0100ak\u05bf\u1ff7\u0100;v\u1ffc\u1ffd\u62d4;\u6ad9artint;\u6a0d\u0100ao\u200c\u2055\u0100cs\u2011\u2052\u03b1\u201a\u2030\u2038\u2045\u2048\0\u2050\u03b2\u2022\u2025\u2027\u202a\u202c\0\u202e\u803b\xbd\u40bd;\u6153\u803b\xbc\u40bc;\u6155;\u6159;\u615b\u01b3\u2034\0\u2036;\u6154;\u6156\u02b4\u203e\u2041\0\0\u2043\u803b\xbe\u40be;\u6157;\u615c5;\u6158\u01b6\u204c\0\u204e;\u615a;\u615d8;\u615el;\u6044wn;\u6322cr;\uc000\ud835\udcbb\u0880Eabcdefgijlnorstv\u2082\u2089\u209f\u20a5\u20b0\u20b4\u20f0\u20f5\u20fa\u20ff\u2103\u2112\u2138\u0317\u213e\u2152\u219e\u0100;l\u064d\u2087;\u6a8c\u0180cmp\u2090\u2095\u209dute;\u41f5ma\u0100;d\u209c\u1cda\u43b3;\u6a86reve;\u411f\u0100iy\u20aa\u20aerc;\u411d;\u4433ot;\u4121\u0200;lqs\u063e\u0642\u20bd\u20c9\u0180;qs\u063e\u064c\u20c4lan\xf4\u0665\u0200;cdl\u0665\u20d2\u20d5\u20e5c;\u6aa9ot\u0100;o\u20dc\u20dd\u6a80\u0100;l\u20e2\u20e3\u6a82;\u6a84\u0100;e\u20ea\u20ed\uc000\u22db\ufe00s;\u6a94r;\uc000\ud835\udd24\u0100;g\u0673\u061bmel;\u6137cy;\u4453\u0200;Eaj\u065a\u210c\u210e\u2110;\u6a92;\u6aa5;\u6aa4\u0200Eaes\u211b\u211d\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6a8arox\xbb\u2124\u0100;q\u212e\u212f\u6a88\u0100;q\u212e\u211bim;\u62e7pf;\uc000\ud835\udd58\u0100ci\u2143\u2146r;\u610am\u0180;el\u066b\u214e\u2150;\u6a8e;\u6a90\u8300>;cdlqr\u05ee\u2160\u216a\u216e\u2173\u2179\u0100ci\u2165\u2167;\u6aa7r;\u6a7aot;\u62d7Par;\u6995uest;\u6a7c\u0280adels\u2184\u216a\u2190\u0656\u219b\u01f0\u2189\0\u218epro\xf8\u209er;\u6978q\u0100lq\u063f\u2196les\xf3\u2088i\xed\u066b\u0100en\u21a3\u21adrtneqq;\uc000\u2269\ufe00\xc5\u21aa\u0500Aabcefkosy\u21c4\u21c7\u21f1\u21f5\u21fa\u2218\u221d\u222f\u2268\u227dr\xf2\u03a0\u0200ilmr\u21d0\u21d4\u21d7\u21dbrs\xf0\u1484f\xbb\u2024il\xf4\u06a9\u0100dr\u21e0\u21e4cy;\u444a\u0180;cw\u08f4\u21eb\u21efir;\u6948;\u61adar;\u610firc;\u4125\u0180alr\u2201\u220e\u2213rts\u0100;u\u2209\u220a\u6665it\xbb\u220alip;\u6026con;\u62b9r;\uc000\ud835\udd25s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223a\u223e\u2243\u225e\u2263rr;\u61fftht;\u623bk\u0100lr\u2249\u2253eftarrow;\u61a9ightarrow;\u61aaf;\uc000\ud835\udd59bar;\u6015\u0180clt\u226f\u2274\u2278r;\uc000\ud835\udcbdas\xe8\u21f4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xbb\u1c5b\u0ae1\u22a3\0\u22aa\0\u22b8\u22c5\u22ce\0\u22d5\u22f3\0\0\u22f8\u2322\u2367\u2362\u237f\0\u2386\u23aa\u23b4cute\u803b\xed\u40ed\u0180;iy\u0771\u22b0\u22b5rc\u803b\xee\u40ee;\u4438\u0100cx\u22bc\u22bfy;\u4435cl\u803b\xa1\u40a1\u0100fr\u039f\u22c9;\uc000\ud835\udd26rave\u803b\xec\u40ec\u0200;ino\u073e\u22dd\u22e9\u22ee\u0100in\u22e2\u22e6nt;\u6a0ct;\u622dfin;\u69dcta;\u6129lig;\u4133\u0180aop\u22fe\u231a\u231d\u0180cgt\u2305\u2308\u2317r;\u412b\u0180elp\u071f\u230f\u2313in\xe5\u078ear\xf4\u0720h;\u4131f;\u62b7ed;\u41b5\u0280;cfot\u04f4\u232c\u2331\u233d\u2341are;\u6105in\u0100;t\u2338\u2339\u621eie;\u69dddo\xf4\u2319\u0280;celp\u0757\u234c\u2350\u235b\u2361al;\u62ba\u0100gr\u2355\u2359er\xf3\u1563\xe3\u234darhk;\u6a17rod;\u6a3c\u0200cgpt\u236f\u2372\u2376\u237by;\u4451on;\u412ff;\uc000\ud835\udd5aa;\u43b9uest\u803b\xbf\u40bf\u0100ci\u238a\u238fr;\uc000\ud835\udcben\u0280;Edsv\u04f4\u239b\u239d\u23a1\u04f3;\u62f9ot;\u62f5\u0100;v\u23a6\u23a7\u62f4;\u62f3\u0100;i\u0777\u23aelde;\u4129\u01eb\u23b8\0\u23bccy;\u4456l\u803b\xef\u40ef\u0300cfmosu\u23cc\u23d7\u23dc\u23e1\u23e7\u23f5\u0100iy\u23d1\u23d5rc;\u4135;\u4439r;\uc000\ud835\udd27ath;\u4237pf;\uc000\ud835\udd5b\u01e3\u23ec\0\u23f1r;\uc000\ud835\udcbfrcy;\u4458kcy;\u4454\u0400acfghjos\u240b\u2416\u2422\u2427\u242d\u2431\u2435\u243bppa\u0100;v\u2413\u2414\u43ba;\u43f0\u0100ey\u241b\u2420dil;\u4137;\u443ar;\uc000\ud835\udd28reen;\u4138cy;\u4445cy;\u445cpf;\uc000\ud835\udd5ccr;\uc000\ud835\udcc0\u0b80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248d\u2491\u250e\u253d\u255a\u2580\u264e\u265e\u2665\u2679\u267d\u269a\u26b2\u26d8\u275d\u2768\u278b\u27c0\u2801\u2812\u0180art\u2477\u247a\u247cr\xf2\u09c6\xf2\u0395ail;\u691barr;\u690e\u0100;g\u0994\u248b;\u6a8bar;\u6962\u0963\u24a5\0\u24aa\0\u24b1\0\0\0\0\0\u24b5\u24ba\0\u24c6\u24c8\u24cd\0\u24f9ute;\u413amptyv;\u69b4ra\xee\u084cbda;\u43bbg\u0180;dl\u088e\u24c1\u24c3;\u6991\xe5\u088e;\u6a85uo\u803b\xab\u40abr\u0400;bfhlpst\u0899\u24de\u24e6\u24e9\u24eb\u24ee\u24f1\u24f5\u0100;f\u089d\u24e3s;\u691fs;\u691d\xeb\u2252p;\u61abl;\u6939im;\u6973l;\u61a2\u0180;ae\u24ff\u2500\u2504\u6aabil;\u6919\u0100;s\u2509\u250a\u6aad;\uc000\u2aad\ufe00\u0180abr\u2515\u2519\u251drr;\u690crk;\u6772\u0100ak\u2522\u252cc\u0100ek\u2528\u252a;\u407b;\u405b\u0100es\u2531\u2533;\u698bl\u0100du\u2539\u253b;\u698f;\u698d\u0200aeuy\u2546\u254b\u2556\u2558ron;\u413e\u0100di\u2550\u2554il;\u413c\xec\u08b0\xe2\u2529;\u443b\u0200cqrs\u2563\u2566\u256d\u257da;\u6936uo\u0100;r\u0e19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694bh;\u61b2\u0280;fgqs\u258b\u258c\u0989\u25f3\u25ff\u6264t\u0280ahlrt\u2598\u25a4\u25b7\u25c2\u25e8rrow\u0100;t\u0899\u25a1a\xe9\u24f6arpoon\u0100du\u25af\u25b4own\xbb\u045ap\xbb\u0966eftarrows;\u61c7ight\u0180ahs\u25cd\u25d6\u25derrow\u0100;s\u08f4\u08a7arpoon\xf3\u0f98quigarro\xf7\u21f0hreetimes;\u62cb\u0180;qs\u258b\u0993\u25falan\xf4\u09ac\u0280;cdgs\u09ac\u260a\u260d\u261d\u2628c;\u6aa8ot\u0100;o\u2614\u2615\u6a7f\u0100;r\u261a\u261b\u6a81;\u6a83\u0100;e\u2622\u2625\uc000\u22da\ufe00s;\u6a93\u0280adegs\u2633\u2639\u263d\u2649\u264bppro\xf8\u24c6ot;\u62d6q\u0100gq\u2643\u2645\xf4\u0989gt\xf2\u248c\xf4\u099bi\xed\u09b2\u0180ilr\u2655\u08e1\u265asht;\u697c;\uc000\ud835\udd29\u0100;E\u099c\u2663;\u6a91\u0161\u2669\u2676r\u0100du\u25b2\u266e\u0100;l\u0965\u2673;\u696alk;\u6584cy;\u4459\u0280;acht\u0a48\u2688\u268b\u2691\u2696r\xf2\u25c1orne\xf2\u1d08ard;\u696bri;\u65fa\u0100io\u269f\u26a4dot;\u4140ust\u0100;a\u26ac\u26ad\u63b0che\xbb\u26ad\u0200Eaes\u26bb\u26bd\u26c9\u26d4;\u6268p\u0100;p\u26c3\u26c4\u6a89rox\xbb\u26c4\u0100;q\u26ce\u26cf\u6a87\u0100;q\u26ce\u26bbim;\u62e6\u0400abnoptwz\u26e9\u26f4\u26f7\u271a\u272f\u2741\u2747\u2750\u0100nr\u26ee\u26f1g;\u67ecr;\u61fdr\xeb\u08c1g\u0180lmr\u26ff\u270d\u2714eft\u0100ar\u09e6\u2707ight\xe1\u09f2apsto;\u67fcight\xe1\u09fdparrow\u0100lr\u2725\u2729ef\xf4\u24edight;\u61ac\u0180afl\u2736\u2739\u273dr;\u6985;\uc000\ud835\udd5dus;\u6a2dimes;\u6a34\u0161\u274b\u274fst;\u6217\xe1\u134e\u0180;ef\u2757\u2758\u1800\u65cange\xbb\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277c\u2785\u2787r\xf2\u08a8orne\xf2\u1d8car\u0100;d\u0f98\u2783;\u696d;\u600eri;\u62bf\u0300achiqt\u2798\u279d\u0a40\u27a2\u27ae\u27bbquo;\u6039r;\uc000\ud835\udcc1m\u0180;eg\u09b2\u27aa\u27ac;\u6a8d;\u6a8f\u0100bu\u252a\u27b3o\u0100;r\u0e1f\u27b9;\u601arok;\u4142\u8400<;cdhilqr\u082b\u27d2\u2639\u27dc\u27e0\u27e5\u27ea\u27f0\u0100ci\u27d7\u27d9;\u6aa6r;\u6a79re\xe5\u25f2mes;\u62c9arr;\u6976uest;\u6a7b\u0100Pi\u27f5\u27f9ar;\u6996\u0180;ef\u2800\u092d\u181b\u65c3r\u0100du\u2807\u280dshar;\u694ahar;\u6966\u0100en\u2817\u2821rtneqq;\uc000\u2268\ufe00\xc5\u281e\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288e\u2893\u28a0\u28a5\u28a8\u28da\u28e2\u28e4\u0a83\u28f3\u2902Dot;\u623a\u0200clpr\u284e\u2852\u2863\u287dr\u803b\xaf\u40af\u0100et\u2857\u2859;\u6642\u0100;e\u285e\u285f\u6720se\xbb\u285f\u0100;s\u103b\u2868to\u0200;dlu\u103b\u2873\u2877\u287bow\xee\u048cef\xf4\u090f\xf0\u13d1ker;\u65ae\u0100oy\u2887\u288cmma;\u6a29;\u443cash;\u6014asuredangle\xbb\u1626r;\uc000\ud835\udd2ao;\u6127\u0180cdn\u28af\u28b4\u28c9ro\u803b\xb5\u40b5\u0200;acd\u1464\u28bd\u28c0\u28c4s\xf4\u16a7ir;\u6af0ot\u80bb\xb7\u01b5us\u0180;bd\u28d2\u1903\u28d3\u6212\u0100;u\u1d3c\u28d8;\u6a2a\u0163\u28de\u28e1p;\u6adb\xf2\u2212\xf0\u0a81\u0100dp\u28e9\u28eeels;\u62a7f;\uc000\ud835\udd5e\u0100ct\u28f8\u28fdr;\uc000\ud835\udcc2pos\xbb\u159d\u0180;lm\u2909\u290a\u290d\u43bctimap;\u62b8\u0c00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297e\u2989\u2998\u29da\u29e9\u2a15\u2a1a\u2a58\u2a5d\u2a83\u2a95\u2aa4\u2aa8\u2b04\u2b07\u2b44\u2b7f\u2bae\u2c34\u2c67\u2c7c\u2ce9\u0100gt\u2947\u294b;\uc000\u22d9\u0338\u0100;v\u2950\u0bcf\uc000\u226b\u20d2\u0180elt\u295a\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61cdightarrow;\u61ce;\uc000\u22d8\u0338\u0100;v\u297b\u0c47\uc000\u226a\u20d2ightarrow;\u61cf\u0100Dd\u298e\u2993ash;\u62afash;\u62ae\u0280bcnpt\u29a3\u29a7\u29ac\u29b1\u29ccla\xbb\u02deute;\u4144g;\uc000\u2220\u20d2\u0280;Eiop\u0d84\u29bc\u29c0\u29c5\u29c8;\uc000\u2a70\u0338d;\uc000\u224b\u0338s;\u4149ro\xf8\u0d84ur\u0100;a\u29d3\u29d4\u666el\u0100;s\u29d3\u0b38\u01f3\u29df\0\u29e3p\u80bb\xa0\u0b37mp\u0100;e\u0bf9\u0c00\u0280aeouy\u29f4\u29fe\u2a03\u2a10\u2a13\u01f0\u29f9\0\u29fb;\u6a43on;\u4148dil;\u4146ng\u0100;d\u0d7e\u2a0aot;\uc000\u2a6d\u0338p;\u6a42;\u443dash;\u6013\u0380;Aadqsx\u0b92\u2a29\u2a2d\u2a3b\u2a41\u2a45\u2a50rr;\u61d7r\u0100hr\u2a33\u2a36k;\u6924\u0100;o\u13f2\u13f0ot;\uc000\u2250\u0338ui\xf6\u0b63\u0100ei\u2a4a\u2a4ear;\u6928\xed\u0b98ist\u0100;s\u0ba0\u0b9fr;\uc000\ud835\udd2b\u0200Eest\u0bc5\u2a66\u2a79\u2a7c\u0180;qs\u0bbc\u2a6d\u0be1\u0180;qs\u0bbc\u0bc5\u2a74lan\xf4\u0be2i\xed\u0bea\u0100;r\u0bb6\u2a81\xbb\u0bb7\u0180Aap\u2a8a\u2a8d\u2a91r\xf2\u2971rr;\u61aear;\u6af2\u0180;sv\u0f8d\u2a9c\u0f8c\u0100;d\u2aa1\u2aa2\u62fc;\u62facy;\u445a\u0380AEadest\u2ab7\u2aba\u2abe\u2ac2\u2ac5\u2af6\u2af9r\xf2\u2966;\uc000\u2266\u0338rr;\u619ar;\u6025\u0200;fqs\u0c3b\u2ace\u2ae3\u2aeft\u0100ar\u2ad4\u2ad9rro\xf7\u2ac1ightarro\xf7\u2a90\u0180;qs\u0c3b\u2aba\u2aealan\xf4\u0c55\u0100;s\u0c55\u2af4\xbb\u0c36i\xed\u0c5d\u0100;r\u0c35\u2afei\u0100;e\u0c1a\u0c25i\xe4\u0d90\u0100pt\u2b0c\u2b11f;\uc000\ud835\udd5f\u8180\xac;in\u2b19\u2b1a\u2b36\u40acn\u0200;Edv\u0b89\u2b24\u2b28\u2b2e;\uc000\u22f9\u0338ot;\uc000\u22f5\u0338\u01e1\u0b89\u2b33\u2b35;\u62f7;\u62f6i\u0100;v\u0cb8\u2b3c\u01e1\u0cb8\u2b41\u2b43;\u62fe;\u62fd\u0180aor\u2b4b\u2b63\u2b69r\u0200;ast\u0b7b\u2b55\u2b5a\u2b5flle\xec\u0b7bl;\uc000\u2afd\u20e5;\uc000\u2202\u0338lint;\u6a14\u0180;ce\u0c92\u2b70\u2b73u\xe5\u0ca5\u0100;c\u0c98\u2b78\u0100;e\u0c92\u2b7d\xf1\u0c98\u0200Aait\u2b88\u2b8b\u2b9d\u2ba7r\xf2\u2988rr\u0180;cw\u2b94\u2b95\u2b99\u619b;\uc000\u2933\u0338;\uc000\u219d\u0338ghtarrow\xbb\u2b95ri\u0100;e\u0ccb\u0cd6\u0380chimpqu\u2bbd\u2bcd\u2bd9\u2b04\u0b78\u2be4\u2bef\u0200;cer\u0d32\u2bc6\u0d37\u2bc9u\xe5\u0d45;\uc000\ud835\udcc3ort\u026d\u2b05\0\0\u2bd6ar\xe1\u2b56m\u0100;e\u0d6e\u2bdf\u0100;q\u0d74\u0d73su\u0100bp\u2beb\u2bed\xe5\u0cf8\xe5\u0d0b\u0180bcp\u2bf6\u2c11\u2c19\u0200;Ees\u2bff\u2c00\u0d22\u2c04\u6284;\uc000\u2ac5\u0338et\u0100;e\u0d1b\u2c0bq\u0100;q\u0d23\u2c00c\u0100;e\u0d32\u2c17\xf1\u0d38\u0200;Ees\u2c22\u2c23\u0d5f\u2c27\u6285;\uc000\u2ac6\u0338et\u0100;e\u0d58\u2c2eq\u0100;q\u0d60\u2c23\u0200gilr\u2c3d\u2c3f\u2c45\u2c47\xec\u0bd7lde\u803b\xf1\u40f1\xe7\u0c43iangle\u0100lr\u2c52\u2c5ceft\u0100;e\u0c1a\u2c5a\xf1\u0c26ight\u0100;e\u0ccb\u2c65\xf1\u0cd7\u0100;m\u2c6c\u2c6d\u43bd\u0180;es\u2c74\u2c75\u2c79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2c8f\u2c94\u2c99\u2c9e\u2ca3\u2cb0\u2cb6\u2cd3\u2ce3ash;\u62adarr;\u6904p;\uc000\u224d\u20d2ash;\u62ac\u0100et\u2ca8\u2cac;\uc000\u2265\u20d2;\uc000>\u20d2nfin;\u69de\u0180Aet\u2cbd\u2cc1\u2cc5rr;\u6902;\uc000\u2264\u20d2\u0100;r\u2cca\u2ccd\uc000<\u20d2ie;\uc000\u22b4\u20d2\u0100At\u2cd8\u2cdcrr;\u6903rie;\uc000\u22b5\u20d2im;\uc000\u223c\u20d2\u0180Aan\u2cf0\u2cf4\u2d02rr;\u61d6r\u0100hr\u2cfa\u2cfdk;\u6923\u0100;o\u13e7\u13e5ear;\u6927\u1253\u1a95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2d2d\0\u2d38\u2d48\u2d60\u2d65\u2d72\u2d84\u1b07\0\0\u2d8d\u2dab\0\u2dc8\u2dce\0\u2ddc\u2e19\u2e2b\u2e3e\u2e43\u0100cs\u2d31\u1a97ute\u803b\xf3\u40f3\u0100iy\u2d3c\u2d45r\u0100;c\u1a9e\u2d42\u803b\xf4\u40f4;\u443e\u0280abios\u1aa0\u2d52\u2d57\u01c8\u2d5alac;\u4151v;\u6a38old;\u69bclig;\u4153\u0100cr\u2d69\u2d6dir;\u69bf;\uc000\ud835\udd2c\u036f\u2d79\0\0\u2d7c\0\u2d82n;\u42dbave\u803b\xf2\u40f2;\u69c1\u0100bm\u2d88\u0df4ar;\u69b5\u0200acit\u2d95\u2d98\u2da5\u2da8r\xf2\u1a80\u0100ir\u2d9d\u2da0r;\u69beoss;\u69bbn\xe5\u0e52;\u69c0\u0180aei\u2db1\u2db5\u2db9cr;\u414dga;\u43c9\u0180cdn\u2dc0\u2dc5\u01cdron;\u43bf;\u69b6pf;\uc000\ud835\udd60\u0180ael\u2dd4\u2dd7\u01d2r;\u69b7rp;\u69b9\u0380;adiosv\u2dea\u2deb\u2dee\u2e08\u2e0d\u2e10\u2e16\u6228r\xf2\u1a86\u0200;efm\u2df7\u2df8\u2e02\u2e05\u6a5dr\u0100;o\u2dfe\u2dff\u6134f\xbb\u2dff\u803b\xaa\u40aa\u803b\xba\u40bagof;\u62b6r;\u6a56lope;\u6a57;\u6a5b\u0180clo\u2e1f\u2e21\u2e27\xf2\u2e01ash\u803b\xf8\u40f8l;\u6298i\u016c\u2e2f\u2e34de\u803b\xf5\u40f5es\u0100;a\u01db\u2e3as;\u6a36ml\u803b\xf6\u40f6bar;\u633d\u0ae1\u2e5e\0\u2e7d\0\u2e80\u2e9d\0\u2ea2\u2eb9\0\0\u2ecb\u0e9c\0\u2f13\0\0\u2f2b\u2fbc\0\u2fc8r\u0200;ast\u0403\u2e67\u2e72\u0e85\u8100\xb6;l\u2e6d\u2e6e\u40b6le\xec\u0403\u0269\u2e78\0\0\u2e7bm;\u6af3;\u6afdy;\u443fr\u0280cimpt\u2e8b\u2e8f\u2e93\u1865\u2e97nt;\u4025od;\u402eil;\u6030enk;\u6031r;\uc000\ud835\udd2d\u0180imo\u2ea8\u2eb0\u2eb4\u0100;v\u2ead\u2eae\u43c6;\u43d5ma\xf4\u0a76ne;\u660e\u0180;tv\u2ebf\u2ec0\u2ec8\u43c0chfork\xbb\u1ffd;\u43d6\u0100au\u2ecf\u2edfn\u0100ck\u2ed5\u2eddk\u0100;h\u21f4\u2edb;\u610e\xf6\u21f4s\u0480;abcdemst\u2ef3\u2ef4\u1908\u2ef9\u2efd\u2f04\u2f06\u2f0a\u2f0e\u402bcir;\u6a23ir;\u6a22\u0100ou\u1d40\u2f02;\u6a25;\u6a72n\u80bb\xb1\u0e9dim;\u6a26wo;\u6a27\u0180ipu\u2f19\u2f20\u2f25ntint;\u6a15f;\uc000\ud835\udd61nd\u803b\xa3\u40a3\u0500;Eaceinosu\u0ec8\u2f3f\u2f41\u2f44\u2f47\u2f81\u2f89\u2f92\u2f7e\u2fb6;\u6ab3p;\u6ab7u\xe5\u0ed9\u0100;c\u0ece\u2f4c\u0300;acens\u0ec8\u2f59\u2f5f\u2f66\u2f68\u2f7eppro\xf8\u2f43urlye\xf1\u0ed9\xf1\u0ece\u0180aes\u2f6f\u2f76\u2f7approx;\u6ab9qq;\u6ab5im;\u62e8i\xed\u0edfme\u0100;s\u2f88\u0eae\u6032\u0180Eas\u2f78\u2f90\u2f7a\xf0\u2f75\u0180dfp\u0eec\u2f99\u2faf\u0180als\u2fa0\u2fa5\u2faalar;\u632eine;\u6312urf;\u6313\u0100;t\u0efb\u2fb4\xef\u0efbrel;\u62b0\u0100ci\u2fc0\u2fc5r;\uc000\ud835\udcc5;\u43c8ncsp;\u6008\u0300fiopsu\u2fda\u22e2\u2fdf\u2fe5\u2feb\u2ff1r;\uc000\ud835\udd2epf;\uc000\ud835\udd62rime;\u6057cr;\uc000\ud835\udcc6\u0180aeo\u2ff8\u3009\u3013t\u0100ei\u2ffe\u3005rnion\xf3\u06b0nt;\u6a16st\u0100;e\u3010\u3011\u403f\xf1\u1f19\xf4\u0f14\u0a80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30e0\u310e\u312b\u3147\u3162\u3172\u318e\u3206\u3215\u3224\u3229\u3258\u326e\u3272\u3290\u32b0\u32b7\u0180art\u3047\u304a\u304cr\xf2\u10b3\xf2\u03ddail;\u691car\xf2\u1c65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307f\u308f\u3094\u30cc\u0100eu\u306d\u3071;\uc000\u223d\u0331te;\u4155i\xe3\u116emptyv;\u69b3g\u0200;del\u0fd1\u3089\u308b\u308d;\u6992;\u69a5\xe5\u0fd1uo\u803b\xbb\u40bbr\u0580;abcfhlpstw\u0fdc\u30ac\u30af\u30b7\u30b9\u30bc\u30be\u30c0\u30c3\u30c7\u30cap;\u6975\u0100;f\u0fe0\u30b4s;\u6920;\u6933s;\u691e\xeb\u225d\xf0\u272el;\u6945im;\u6974l;\u61a3;\u619d\u0100ai\u30d1\u30d5il;\u691ao\u0100;n\u30db\u30dc\u6236al\xf3\u0f1e\u0180abr\u30e7\u30ea\u30eer\xf2\u17e5rk;\u6773\u0100ak\u30f3\u30fdc\u0100ek\u30f9\u30fb;\u407d;\u405d\u0100es\u3102\u3104;\u698cl\u0100du\u310a\u310c;\u698e;\u6990\u0200aeuy\u3117\u311c\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xec\u0ff2\xe2\u30fa;\u4440\u0200clqs\u3134\u3137\u313d\u3144a;\u6937dhar;\u6969uo\u0100;r\u020e\u020dh;\u61b3\u0180acg\u314e\u315f\u0f44l\u0200;ips\u0f78\u3158\u315b\u109cn\xe5\u10bbar\xf4\u0fa9t;\u65ad\u0180ilr\u3169\u1023\u316esht;\u697d;\uc000\ud835\udd2f\u0100ao\u3177\u3186r\u0100du\u317d\u317f\xbb\u047b\u0100;l\u1091\u3184;\u696c\u0100;v\u318b\u318c\u43c1;\u43f1\u0180gns\u3195\u31f9\u31fcht\u0300ahlrst\u31a4\u31b0\u31c2\u31d8\u31e4\u31eerrow\u0100;t\u0fdc\u31ada\xe9\u30c8arpoon\u0100du\u31bb\u31bfow\xee\u317ep\xbb\u1092eft\u0100ah\u31ca\u31d0rrow\xf3\u0feaarpoon\xf3\u0551ightarrows;\u61c9quigarro\xf7\u30cbhreetimes;\u62ccg;\u42daingdotse\xf1\u1f32\u0180ahm\u320d\u3210\u3213r\xf2\u0feaa\xf2\u0551;\u600foust\u0100;a\u321e\u321f\u63b1che\xbb\u321fmid;\u6aee\u0200abpt\u3232\u323d\u3240\u3252\u0100nr\u3237\u323ag;\u67edr;\u61fer\xeb\u1003\u0180afl\u3247\u324a\u324er;\u6986;\uc000\ud835\udd63us;\u6a2eimes;\u6a35\u0100ap\u325d\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6a12ar\xf2\u31e3\u0200achq\u327b\u3280\u10bc\u3285quo;\u603ar;\uc000\ud835\udcc7\u0100bu\u30fb\u328ao\u0100;r\u0214\u0213\u0180hir\u3297\u329b\u32a0re\xe5\u31f8mes;\u62cai\u0200;efl\u32aa\u1059\u1821\u32ab\u65b9tri;\u69celuhar;\u6968;\u611e\u0d61\u32d5\u32db\u32df\u332c\u3338\u3371\0\u337a\u33a4\0\0\u33ec\u33f0\0\u3428\u3448\u345a\u34ad\u34b1\u34ca\u34f1\0\u3616\0\0\u3633cute;\u415bqu\xef\u27ba\u0500;Eaceinpsy\u11ed\u32f3\u32f5\u32ff\u3302\u330b\u330f\u331f\u3326\u3329;\u6ab4\u01f0\u32fa\0\u32fc;\u6ab8on;\u4161u\xe5\u11fe\u0100;d\u11f3\u3307il;\u415frc;\u415d\u0180Eas\u3316\u3318\u331b;\u6ab6p;\u6abaim;\u62e9olint;\u6a13i\xed\u1204;\u4441ot\u0180;be\u3334\u1d47\u3335\u62c5;\u6a66\u0380Aacmstx\u3346\u334a\u3357\u335b\u335e\u3363\u336drr;\u61d8r\u0100hr\u3350\u3352\xeb\u2228\u0100;o\u0a36\u0a34t\u803b\xa7\u40a7i;\u403bwar;\u6929m\u0100in\u3369\xf0nu\xf3\xf1t;\u6736r\u0100;o\u3376\u2055\uc000\ud835\udd30\u0200acoy\u3382\u3386\u3391\u33a0rp;\u666f\u0100hy\u338b\u338fcy;\u4449;\u4448rt\u026d\u3399\0\0\u339ci\xe4\u1464ara\xec\u2e6f\u803b\xad\u40ad\u0100gm\u33a8\u33b4ma\u0180;fv\u33b1\u33b2\u33b2\u43c3;\u43c2\u0400;deglnpr\u12ab\u33c5\u33c9\u33ce\u33d6\u33de\u33e1\u33e6ot;\u6a6a\u0100;q\u12b1\u12b0\u0100;E\u33d3\u33d4\u6a9e;\u6aa0\u0100;E\u33db\u33dc\u6a9d;\u6a9fe;\u6246lus;\u6a24arr;\u6972ar\xf2\u113d\u0200aeit\u33f8\u3408\u340f\u3417\u0100ls\u33fd\u3404lsetm\xe9\u336ahp;\u6a33parsl;\u69e4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341c\u341d\u6aaa\u0100;s\u3422\u3423\u6aac;\uc000\u2aac\ufe00\u0180flp\u342e\u3433\u3442tcy;\u444c\u0100;b\u3438\u3439\u402f\u0100;a\u343e\u343f\u69c4r;\u633ff;\uc000\ud835\udd64a\u0100dr\u344d\u0402es\u0100;u\u3454\u3455\u6660it\xbb\u3455\u0180csu\u3460\u3479\u349f\u0100au\u3465\u346fp\u0100;s\u1188\u346b;\uc000\u2293\ufe00p\u0100;s\u11b4\u3475;\uc000\u2294\ufe00u\u0100bp\u347f\u348f\u0180;es\u1197\u119c\u3486et\u0100;e\u1197\u348d\xf1\u119d\u0180;es\u11a8\u11ad\u3496et\u0100;e\u11a8\u349d\xf1\u11ae\u0180;af\u117b\u34a6\u05b0r\u0165\u34ab\u05b1\xbb\u117car\xf2\u1148\u0200cemt\u34b9\u34be\u34c2\u34c5r;\uc000\ud835\udcc8tm\xee\xf1i\xec\u3415ar\xe6\u11be\u0100ar\u34ce\u34d5r\u0100;f\u34d4\u17bf\u6606\u0100an\u34da\u34edight\u0100ep\u34e3\u34eapsilo\xee\u1ee0h\xe9\u2eafs\xbb\u2852\u0280bcmnp\u34fb\u355e\u1209\u358b\u358e\u0480;Edemnprs\u350e\u350f\u3511\u3515\u351e\u3523\u352c\u3531\u3536\u6282;\u6ac5ot;\u6abd\u0100;d\u11da\u351aot;\u6ac3ult;\u6ac1\u0100Ee\u3528\u352a;\u6acb;\u628alus;\u6abfarr;\u6979\u0180eiu\u353d\u3552\u3555t\u0180;en\u350e\u3545\u354bq\u0100;q\u11da\u350feq\u0100;q\u352b\u3528m;\u6ac7\u0100bp\u355a\u355c;\u6ad5;\u6ad3c\u0300;acens\u11ed\u356c\u3572\u3579\u357b\u3326ppro\xf8\u32faurlye\xf1\u11fe\xf1\u11f3\u0180aes\u3582\u3588\u331bppro\xf8\u331aq\xf1\u3317g;\u666a\u0680123;Edehlmnps\u35a9\u35ac\u35af\u121c\u35b2\u35b4\u35c0\u35c9\u35d5\u35da\u35df\u35e8\u35ed\u803b\xb9\u40b9\u803b\xb2\u40b2\u803b\xb3\u40b3;\u6ac6\u0100os\u35b9\u35bct;\u6abeub;\u6ad8\u0100;d\u1222\u35c5ot;\u6ac4s\u0100ou\u35cf\u35d2l;\u67c9b;\u6ad7arr;\u697bult;\u6ac2\u0100Ee\u35e4\u35e6;\u6acc;\u628blus;\u6ac0\u0180eiu\u35f4\u3609\u360ct\u0180;en\u121c\u35fc\u3602q\u0100;q\u1222\u35b2eq\u0100;q\u35e7\u35e4m;\u6ac8\u0100bp\u3611\u3613;\u6ad4;\u6ad6\u0180Aan\u361c\u3620\u362drr;\u61d9r\u0100hr\u3626\u3628\xeb\u222e\u0100;o\u0a2b\u0a29war;\u692alig\u803b\xdf\u40df\u0be1\u3651\u365d\u3660\u12ce\u3673\u3679\0\u367e\u36c2\0\0\0\0\0\u36db\u3703\0\u3709\u376c\0\0\0\u3787\u0272\u3656\0\0\u365bget;\u6316;\u43c4r\xeb\u0e5f\u0180aey\u3666\u366b\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uc000\ud835\udd31\u0200eiko\u3686\u369d\u36b5\u36bc\u01f2\u368b\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369b\u43b8ym;\u43d1\u0100cn\u36a2\u36b2k\u0100as\u36a8\u36aeppro\xf8\u12c1im\xbb\u12acs\xf0\u129e\u0100as\u36ba\u36ae\xf0\u12c1rn\u803b\xfe\u40fe\u01ec\u031f\u36c6\u22e7es\u8180\xd7;bd\u36cf\u36d0\u36d8\u40d7\u0100;a\u190f\u36d5r;\u6a31;\u6a30\u0180eps\u36e1\u36e3\u3700\xe1\u2a4d\u0200;bcf\u0486\u36ec\u36f0\u36f4ot;\u6336ir;\u6af1\u0100;o\u36f9\u36fc\uc000\ud835\udd65rk;\u6ada\xe1\u3362rime;\u6034\u0180aip\u370f\u3712\u3764d\xe5\u1248\u0380adempst\u3721\u374d\u3740\u3751\u3757\u375c\u375fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65b5own\xbb\u1dbbeft\u0100;e\u2800\u373e\xf1\u092e;\u625cight\u0100;e\u32aa\u374b\xf1\u105aot;\u65ecinus;\u6a3alus;\u6a39b;\u69cdime;\u6a3bezium;\u63e2\u0180cht\u3772\u377d\u3781\u0100ry\u3777\u377b;\uc000\ud835\udcc9;\u4446cy;\u445brok;\u4167\u0100io\u378b\u378ex\xf4\u1777head\u0100lr\u3797\u37a0eftarro\xf7\u084fightarrow\xbb\u0f5d\u0900AHabcdfghlmoprstuw\u37d0\u37d3\u37d7\u37e4\u37f0\u37fc\u380e\u381c\u3823\u3834\u3851\u385d\u386b\u38a9\u38cc\u38d2\u38ea\u38f6r\xf2\u03edar;\u6963\u0100cr\u37dc\u37e2ute\u803b\xfa\u40fa\xf2\u1150r\u01e3\u37ea\0\u37edy;\u445eve;\u416d\u0100iy\u37f5\u37farc\u803b\xfb\u40fb;\u4443\u0180abh\u3803\u3806\u380br\xf2\u13adlac;\u4171a\xf2\u13c3\u0100ir\u3813\u3818sht;\u697e;\uc000\ud835\udd32rave\u803b\xf9\u40f9\u0161\u3827\u3831r\u0100lr\u382c\u382e\xbb\u0957\xbb\u1083lk;\u6580\u0100ct\u3839\u384d\u026f\u383f\0\0\u384arn\u0100;e\u3845\u3846\u631cr\xbb\u3846op;\u630fri;\u65f8\u0100al\u3856\u385acr;\u416b\u80bb\xa8\u0349\u0100gp\u3862\u3866on;\u4173f;\uc000\ud835\udd66\u0300adhlsu\u114b\u3878\u387d\u1372\u3891\u38a0own\xe1\u13b3arpoon\u0100lr\u3888\u388cef\xf4\u382digh\xf4\u382fi\u0180;hl\u3899\u389a\u389c\u43c5\xbb\u13faon\xbb\u389aparrows;\u61c8\u0180cit\u38b0\u38c4\u38c8\u026f\u38b6\0\0\u38c1rn\u0100;e\u38bc\u38bd\u631dr\xbb\u38bdop;\u630eng;\u416fri;\u65f9cr;\uc000\ud835\udcca\u0180dir\u38d9\u38dd\u38e2ot;\u62f0lde;\u4169i\u0100;f\u3730\u38e8\xbb\u1813\u0100am\u38ef\u38f2r\xf2\u38a8l\u803b\xfc\u40fcangle;\u69a7\u0780ABDacdeflnoprsz\u391c\u391f\u3929\u392d\u39b5\u39b8\u39bd\u39df\u39e4\u39e8\u39f3\u39f9\u39fd\u3a01\u3a20r\xf2\u03f7ar\u0100;v\u3926\u3927\u6ae8;\u6ae9as\xe8\u03e1\u0100nr\u3932\u3937grt;\u699c\u0380eknprst\u34e3\u3946\u394b\u3952\u395d\u3964\u3996app\xe1\u2415othin\xe7\u1e96\u0180hir\u34eb\u2ec8\u3959op\xf4\u2fb5\u0100;h\u13b7\u3962\xef\u318d\u0100iu\u3969\u396dgm\xe1\u33b3\u0100bp\u3972\u3984setneq\u0100;q\u397d\u3980\uc000\u228a\ufe00;\uc000\u2acb\ufe00setneq\u0100;q\u398f\u3992\uc000\u228b\ufe00;\uc000\u2acc\ufe00\u0100hr\u399b\u399fet\xe1\u369ciangle\u0100lr\u39aa\u39afeft\xbb\u0925ight\xbb\u1051y;\u4432ash\xbb\u1036\u0180elr\u39c4\u39d2\u39d7\u0180;be\u2dea\u39cb\u39cfar;\u62bbq;\u625alip;\u62ee\u0100bt\u39dc\u1468a\xf2\u1469r;\uc000\ud835\udd33tr\xe9\u39aesu\u0100bp\u39ef\u39f1\xbb\u0d1c\xbb\u0d59pf;\uc000\ud835\udd67ro\xf0\u0efbtr\xe9\u39b4\u0100cu\u3a06\u3a0br;\uc000\ud835\udccb\u0100bp\u3a10\u3a18n\u0100Ee\u3980\u3a16\xbb\u397en\u0100Ee\u3992\u3a1e\xbb\u3990igzag;\u699a\u0380cefoprs\u3a36\u3a3b\u3a56\u3a5b\u3a54\u3a61\u3a6airc;\u4175\u0100di\u3a40\u3a51\u0100bg\u3a45\u3a49ar;\u6a5fe\u0100;q\u15fa\u3a4f;\u6259erp;\u6118r;\uc000\ud835\udd34pf;\uc000\ud835\udd68\u0100;e\u1479\u3a66at\xe8\u1479cr;\uc000\ud835\udccc\u0ae3\u178e\u3a87\0\u3a8b\0\u3a90\u3a9b\0\0\u3a9d\u3aa8\u3aab\u3aaf\0\0\u3ac3\u3ace\0\u3ad8\u17dc\u17dftr\xe9\u17d1r;\uc000\ud835\udd35\u0100Aa\u3a94\u3a97r\xf2\u03c3r\xf2\u09f6;\u43be\u0100Aa\u3aa1\u3aa4r\xf2\u03b8r\xf2\u09eba\xf0\u2713is;\u62fb\u0180dpt\u17a4\u3ab5\u3abe\u0100fl\u3aba\u17a9;\uc000\ud835\udd69im\xe5\u17b2\u0100Aa\u3ac7\u3acar\xf2\u03cer\xf2\u0a01\u0100cq\u3ad2\u17b8r;\uc000\ud835\udccd\u0100pt\u17d6\u3adcr\xe9\u17d4\u0400acefiosu\u3af0\u3afd\u3b08\u3b0c\u3b11\u3b15\u3b1b\u3b21c\u0100uy\u3af6\u3afbte\u803b\xfd\u40fd;\u444f\u0100iy\u3b02\u3b06rc;\u4177;\u444bn\u803b\xa5\u40a5r;\uc000\ud835\udd36cy;\u4457pf;\uc000\ud835\udd6acr;\uc000\ud835\udcce\u0100cm\u3b26\u3b29y;\u444el\u803b\xff\u40ff\u0500acdefhiosw\u3b42\u3b48\u3b54\u3b58\u3b64\u3b69\u3b6d\u3b74\u3b7a\u3b80cute;\u417a\u0100ay\u3b4d\u3b52ron;\u417e;\u4437ot;\u417c\u0100et\u3b5d\u3b61tr\xe6\u155fa;\u43b6r;\uc000\ud835\udd37cy;\u4436grarr;\u61ddpf;\uc000\ud835\udd6bcr;\uc000\ud835\udccf\u0100jn\u3b85\u3b87;\u600dj;\u600c'.split("").map((t => t.charCodeAt(0)))),
        w = new Uint16Array("\u0200aglq\t\x15\x18\x1b\u026d\x0f\0\0\x12p;\u4026os;\u4027t;\u403et;\u403cuot;\u4022".split("").map((t => t.charCodeAt(0))));
    const v = new Map([
            [0, 65533],
            [128, 8364],
            [130, 8218],
            [131, 402],
            [132, 8222],
            [133, 8230],
            [134, 8224],
            [135, 8225],
            [136, 710],
            [137, 8240],
            [138, 352],
            [139, 8249],
            [140, 338],
            [142, 381],
            [145, 8216],
            [146, 8217],
            [147, 8220],
            [148, 8221],
            [149, 8226],
            [150, 8211],
            [151, 8212],
            [152, 732],
            [153, 8482],
            [154, 353],
            [155, 8250],
            [156, 339],
            [158, 382],
            [159, 376]
        ]),
        z = null !== (k = String.fromCodePoint) && void 0 !== k ? k : function(t) {
            let e = "";
            return t > 65535 && (t -= 65536, e += String.fromCharCode(t >>> 10 & 1023 | 55296), t = 56320 | 1023 & t), e += String.fromCharCode(t), e
        };
    var S;
    ! function(t) {
        t[t.NUM = 35] = "NUM", t[t.SEMI = 59] = "SEMI", t[t.EQUALS = 61] = "EQUALS", t[t.ZERO = 48] = "ZERO", t[t.NINE = 57] = "NINE", t[t.LOWER_A = 97] = "LOWER_A", t[t.LOWER_F = 102] = "LOWER_F", t[t.LOWER_X = 120] = "LOWER_X", t[t.LOWER_Z = 122] = "LOWER_Z", t[t.UPPER_A = 65] = "UPPER_A", t[t.UPPER_F = 70] = "UPPER_F", t[t.UPPER_Z = 90] = "UPPER_Z"
    }(S || (S = {}));
    var q, B, L;

    function I(t) {
        return t >= S.ZERO && t <= S.NINE
    }

    function M(t) {
        return t >= S.UPPER_A && t <= S.UPPER_F || t >= S.LOWER_A && t <= S.LOWER_F
    }

    function T(t) {
        return t === S.EQUALS || function(t) {
            return t >= S.UPPER_A && t <= S.UPPER_Z || t >= S.LOWER_A && t <= S.LOWER_Z || I(t)
        }(t)
    }! function(t) {
        t[t.VALUE_LENGTH = 49152] = "VALUE_LENGTH", t[t.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", t[t.JUMP_TABLE = 127] = "JUMP_TABLE"
    }(q || (q = {})),
    function(t) {
        t[t.EntityStart = 0] = "EntityStart", t[t.NumericStart = 1] = "NumericStart", t[t.NumericDecimal = 2] = "NumericDecimal", t[t.NumericHex = 3] = "NumericHex", t[t.NamedEntity = 4] = "NamedEntity"
    }(B || (B = {})),
    function(t) {
        t[t.Legacy = 0] = "Legacy", t[t.Strict = 1] = "Strict", t[t.Attribute = 2] = "Attribute"
    }(L || (L = {}));
    class R {
        constructor(t, e, r) {
            this.decodeTree = t, this.emitCodePoint = e, this.errors = r, this.state = B.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = L.Strict
        }
        startEntity(t) {
            this.decodeMode = t, this.state = B.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1
        }
        write(t, e) {
            switch (this.state) {
                case B.EntityStart:
                    return t.charCodeAt(e) === S.NUM ? (this.state = B.NumericStart, this.consumed += 1, this.stateNumericStart(t, e + 1)) : (this.state = B.NamedEntity, this.stateNamedEntity(t, e));
                case B.NumericStart:
                    return this.stateNumericStart(t, e);
                case B.NumericDecimal:
                    return this.stateNumericDecimal(t, e);
                case B.NumericHex:
                    return this.stateNumericHex(t, e);
                case B.NamedEntity:
                    return this.stateNamedEntity(t, e)
            }
        }
        stateNumericStart(t, e) {
            return e >= t.length ? -1 : (32 | t.charCodeAt(e)) === S.LOWER_X ? (this.state = B.NumericHex, this.consumed += 1, this.stateNumericHex(t, e + 1)) : (this.state = B.NumericDecimal, this.stateNumericDecimal(t, e))
        }
        addToNumericResult(t, e, r, n) {
            if (e !== r) {
                const s = r - e;
                this.result = this.result * Math.pow(n, s) + parseInt(t.substr(e, s), n), this.consumed += s
            }
        }
        stateNumericHex(t, e) {
            const r = e;
            for (; e < t.length;) {
                const n = t.charCodeAt(e);
                if (!I(n) && !M(n)) return this.addToNumericResult(t, r, e, 16), this.emitNumericEntity(n, 3);
                e += 1
            }
            return this.addToNumericResult(t, r, e, 16), -1
        }
        stateNumericDecimal(t, e) {
            const r = e;
            for (; e < t.length;) {
                const n = t.charCodeAt(e);
                if (!I(n)) return this.addToNumericResult(t, r, e, 10), this.emitNumericEntity(n, 2);
                e += 1
            }
            return this.addToNumericResult(t, r, e, 10), -1
        }
        emitNumericEntity(t, e) {
            var r;
            if (this.consumed <= e) return null === (r = this.errors) || void 0 === r || r.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
            if (t === S.SEMI) this.consumed += 1;
            else if (this.decodeMode === L.Strict) return 0;
            return this.emitCodePoint(function(t) {
                var e;
                return t >= 55296 && t <= 57343 || t > 1114111 ? 65533 : null !== (e = v.get(t)) && void 0 !== e ? e : t
            }(this.result), this.consumed), this.errors && (t !== S.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed
        }
        stateNamedEntity(t, e) {
            const {
                decodeTree: r
            } = this;
            let n = r[this.treeIndex],
                s = (n & q.VALUE_LENGTH) >> 14;
            for (; e < t.length; e++, this.excess++) {
                const i = t.charCodeAt(e);
                if (this.treeIndex = P(r, n, this.treeIndex + Math.max(1, s), i), this.treeIndex < 0) return 0 === this.result || this.decodeMode === L.Attribute && (0 === s || T(i)) ? 0 : this.emitNotTerminatedNamedEntity();
                if (n = r[this.treeIndex], s = (n & q.VALUE_LENGTH) >> 14, 0 !== s) {
                    if (i === S.SEMI) return this.emitNamedEntityData(this.treeIndex, s, this.consumed + this.excess);
                    this.decodeMode !== L.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0)
                }
            }
            return -1
        }
        emitNotTerminatedNamedEntity() {
            var t;
            const {
                result: e,
                decodeTree: r
            } = this, n = (r[e] & q.VALUE_LENGTH) >> 14;
            return this.emitNamedEntityData(e, n, this.consumed), null === (t = this.errors) || void 0 === t || t.missingSemicolonAfterCharacterReference(), this.consumed
        }
        emitNamedEntityData(t, e, r) {
            const {
                decodeTree: n
            } = this;
            return this.emitCodePoint(1 === e ? n[t] & ~q.VALUE_LENGTH : n[t + 1], r), 3 === e && this.emitCodePoint(n[t + 2], r), r
        }
        end() {
            var t;
            switch (this.state) {
                case B.NamedEntity:
                    return 0 === this.result || this.decodeMode === L.Attribute && this.result !== this.treeIndex ? 0 : this.emitNotTerminatedNamedEntity();
                case B.NumericDecimal:
                    return this.emitNumericEntity(0, 2);
                case B.NumericHex:
                    return this.emitNumericEntity(0, 3);
                case B.NumericStart:
                    return null === (t = this.errors) || void 0 === t || t.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
                case B.EntityStart:
                    return 0
            }
        }
    }

    function N(t) {
        let e = "";
        const r = new R(t, (t => e += z(t)));
        return function(t, n) {
            let s = 0,
                i = 0;
            for (;
                (i = t.indexOf("&", i)) >= 0;) {
                e += t.slice(s, i), r.startEntity(n);
                const o = r.write(t, i + 1);
                if (o < 0) {
                    s = i + r.end();
                    break
                }
                s = i + o, i = 0 === o ? s + 1 : s
            }
            const o = e + t.slice(s);
            return e = "", o
        }
    }

    function P(t, e, r, n) {
        const s = (e & q.BRANCH_LENGTH) >> 7,
            i = e & q.JUMP_TABLE;
        if (0 === s) return 0 !== i && n === i ? r : -1;
        if (i) {
            const e = n - i;
            return e < 0 || e >= s ? -1 : t[r + e] - 1
        }
        let o = r,
            u = o + s - 1;
        for (; o <= u;) {
            const e = o + u >>> 1,
                r = t[e];
            if (r < n) o = e + 1;
            else {
                if (!(r > n)) return t[e + s];
                u = e - 1
            }
        }
        return -1
    }
    const O = N(x);

    function j(t, e = L.Legacy) {
        return O(t, e)
    }

    function Z(t) {
        return "[object String]" === function(t) {
            return Object.prototype.toString.call(t)
        }(t)
    }
    N(w);
    const $ = Object.prototype.hasOwnProperty;

    function U(t) {
        return Array.prototype.slice.call(arguments, 1).forEach((function(e) {
            if (e) {
                if ("object" != typeof e) throw new TypeError(e + "must be object");
                Object.keys(e).forEach((function(r) {
                    t[r] = e[r]
                }))
            }
        })), t
    }

    function H(t, e, r) {
        return [].concat(t.slice(0, e), r, t.slice(e + 1))
    }

    function V(t) {
        return !(t >= 55296 && t <= 57343) && (!(t >= 64976 && t <= 65007) && (!!(65535 & ~t && 65534 != (65535 & t)) && (!(t >= 0 && t <= 8) && (11 !== t && (!(t >= 14 && t <= 31) && (!(t >= 127 && t <= 159) && !(t > 1114111)))))))
    }

    function G(t) {
        if (t > 65535) {
            const e = 55296 + ((t -= 65536) >> 10),
                r = 56320 + (1023 & t);
            return String.fromCharCode(e, r)
        }
        return String.fromCharCode(t)
    }
    const W = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,
        J = new RegExp(W.source + "|" + /&([a-z#][a-z0-9]{1,31});/gi.source, "gi"),
        Q = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;

    function X(t) {
        return t.indexOf("\\") < 0 && t.indexOf("&") < 0 ? t : t.replace(J, (function(t, e, r) {
            return e || function(t, e) {
                if (35 === e.charCodeAt(0) && Q.test(e)) {
                    const r = "x" === e[1].toLowerCase() ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
                    return V(r) ? G(r) : t
                }
                const r = j(t);
                return r !== t ? r : t
            }(t, r)
        }))
    }
    const Y = /[&<>"]/,
        K = /[&<>"]/g,
        tt = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
        };

    function et(t) {
        return tt[t]
    }

    function rt(t) {
        return Y.test(t) ? t.replace(K, et) : t
    }
    const nt = /[.?*+^$[\]\\(){}|-]/g;

    function st(t) {
        switch (t) {
            case 9:
            case 32:
                return !0
        }
        return !1
    }

    function it(t) {
        if (t >= 8192 && t <= 8202) return !0;
        switch (t) {
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 32:
            case 160:
            case 5760:
            case 8239:
            case 8287:
            case 12288:
                return !0
        }
        return !1
    }

    function ot(t) {
        return E.test(t) || A.test(t)
    }

    function ut(t) {
        switch (t) {
            case 33:
            case 34:
            case 35:
            case 36:
            case 37:
            case 38:
            case 39:
            case 40:
            case 41:
            case 42:
            case 43:
            case 44:
            case 45:
            case 46:
            case 47:
            case 58:
            case 59:
            case 60:
            case 61:
            case 62:
            case 63:
            case 64:
            case 91:
            case 92:
            case 93:
            case 94:
            case 95:
            case 96:
            case 123:
            case 124:
            case 125:
            case 126:
                return !0;
            default:
                return !1
        }
    }

    function ct(t) {
        return t = t.trim().replace(/\s+/g, " "), "\u1e7e" === "\u1e9e".toLowerCase() && (t = t.replace(/\u1e9e/g, "\xdf")), t.toLowerCase().toUpperCase()
    }
    const at = {
        mdurl: D,
        ucmicro: F
    };
    var lt = Object.freeze({
        __proto__: null,
        arrayReplaceAt: H,
        assign: U,
        escapeHtml: rt,
        escapeRE: function(t) {
            return t.replace(nt, "\\$&")
        },
        fromCodePoint: G,
        has: function(t, e) {
            return $.call(t, e)
        },
        isMdAsciiPunct: ut,
        isPunctChar: ot,
        isSpace: st,
        isString: Z,
        isValidEntityCode: V,
        isWhiteSpace: it,
        lib: at,
        normalizeReference: ct,
        unescapeAll: X,
        unescapeMd: function(t) {
            return t.indexOf("\\") < 0 ? t : t.replace(W, "$1")
        }
    });
    var ht = Object.freeze({
        __proto__: null,
        parseLinkDestination: function(t, e, r) {
            let n, s = e;
            const i = {
                ok: !1,
                pos: 0,
                str: ""
            };
            if (60 === t.charCodeAt(s)) {
                for (s++; s < r;) {
                    if (n = t.charCodeAt(s), 10 === n) return i;
                    if (60 === n) return i;
                    if (62 === n) return i.pos = s + 1, i.str = X(t.slice(e + 1, s)), i.ok = !0, i;
                    92 === n && s + 1 < r ? s += 2 : s++
                }
                return i
            }
            let o = 0;
            for (; s < r && (n = t.charCodeAt(s), 32 !== n) && !(n < 32 || 127 === n);)
                if (92 === n && s + 1 < r) {
                    if (32 === t.charCodeAt(s + 1)) break;
                    s += 2
                } else {
                    if (40 === n && (o++, o > 32)) return i;
                    if (41 === n) {
                        if (0 === o) break;
                        o--
                    }
                    s++
                } return e === s || 0 !== o || (i.str = X(t.slice(e, s)), i.pos = s, i.ok = !0), i
        },
        parseLinkLabel: function(t, e, r) {
            let n, s, i, o;
            const u = t.posMax,
                c = t.pos;
            for (t.pos = e + 1, n = 1; t.pos < u;) {
                if (i = t.src.charCodeAt(t.pos), 93 === i && (n--, 0 === n)) {
                    s = !0;
                    break
                }
                if (o = t.pos, t.md.inline.skipToken(t), 91 === i)
                    if (o === t.pos - 1) n++;
                    else if (r) return t.pos = c, -1
            }
            let a = -1;
            return s && (a = t.pos), t.pos = c, a
        },
        parseLinkTitle: function(t, e, r, n) {
            let s, i = e;
            const o = {
                ok: !1,
                can_continue: !1,
                pos: 0,
                str: "",
                marker: 0
            };
            if (n) o.str = n.str, o.marker = n.marker;
            else {
                if (i >= r) return o;
                let n = t.charCodeAt(i);
                if (34 !== n && 39 !== n && 40 !== n) return o;
                e++, i++, 40 === n && (n = 41), o.marker = n
            }
            for (; i < r;) {
                if (s = t.charCodeAt(i), s === o.marker) return o.pos = i + 1, o.str += X(t.slice(e, i)), o.ok = !0, o;
                if (40 === s && 41 === o.marker) return o;
                92 === s && i + 1 < r && i++, i++
            }
            return o.can_continue = !0, o.str += X(t.slice(e, i)), o
        }
    });
    const pt = {};

    function ft() {
        this.rules = U({}, pt)
    }

    function dt() {
        this.__rules__ = [], this.__cache__ = null
    }

    function _t(t, e, r) {
        this.type = t, this.tag = e, this.attrs = null, this.map = null, this.nesting = r, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = !1, this.hidden = !1
    }

    function mt(t, e, r) {
        this.src = t, this.env = r, this.tokens = [], this.inlineMode = !1, this.md = e
    }
    pt.code_inline = function(t, e, r, n, s) {
        const i = t[e];
        return "<code" + s.renderAttrs(i) + ">" + rt(i.content) + "</code>"
    }, pt.code_block = function(t, e, r, n, s) {
        const i = t[e];
        return "<pre" + s.renderAttrs(i) + "><code>" + rt(t[e].content) + "</code></pre>\n"
    }, pt.fence = function(t, e, r, n, s) {
        const i = t[e],
            o = i.info ? X(i.info).trim() : "";
        let u, c = "",
            a = "";
        if (o) {
            const t = o.split(/(\s+)/g);
            c = t[0], a = t.slice(2).join("")
        }
        if (u = r.highlight && r.highlight(i.content, c, a) || rt(i.content), 0 === u.indexOf("<pre")) return u + "\n";
        if (o) {
            const t = i.attrIndex("class"),
                e = i.attrs ? i.attrs.slice() : [];
            t < 0 ? e.push(["class", r.langPrefix + c]) : (e[t] = e[t].slice(), e[t][1] += " " + r.langPrefix + c);
            const n = {
                attrs: e
            };
            return `<pre><code${s.renderAttrs(n)}>${u}</code></pre>\n`
        }
        return `<pre><code${s.renderAttrs(i)}>${u}</code></pre>\n`
    }, pt.image = function(t, e, r, n, s) {
        const i = t[e];
        return i.attrs[i.attrIndex("alt")][1] = s.renderInlineAsText(i.children, r, n), s.renderToken(t, e, r)
    }, pt.hardbreak = function(t, e, r) {
        return r.xhtmlOut ? "<br />\n" : "<br>\n"
    }, pt.softbreak = function(t, e, r) {
        return r.breaks ? r.xhtmlOut ? "<br />\n" : "<br>\n" : "\n"
    }, pt.text = function(t, e) {
        return rt(t[e].content)
    }, pt.html_block = function(t, e) {
        return t[e].content
    }, pt.html_inline = function(t, e) {
        return t[e].content
    }, ft.prototype.renderAttrs = function(t) {
        let e, r, n;
        if (!t.attrs) return "";
        for (n = "", e = 0, r = t.attrs.length; e < r; e++) n += " " + rt(t.attrs[e][0]) + '="' + rt(t.attrs[e][1]) + '"';
        return n
    }, ft.prototype.renderToken = function(t, e, r) {
        const n = t[e];
        let s = "";
        if (n.hidden) return "";
        n.block && -1 !== n.nesting && e && t[e - 1].hidden && (s += "\n"), s += (-1 === n.nesting ? "</" : "<") + n.tag, s += this.renderAttrs(n), 0 === n.nesting && r.xhtmlOut && (s += " /");
        let i = !1;
        if (n.block && (i = !0, 1 === n.nesting && e + 1 < t.length)) {
            const r = t[e + 1];
            ("inline" === r.type || r.hidden || -1 === r.nesting && r.tag === n.tag) && (i = !1)
        }
        return s += i ? ">\n" : ">", s
    }, ft.prototype.renderInline = function(t, e, r) {
        let n = "";
        const s = this.rules;
        for (let i = 0, o = t.length; i < o; i++) {
            const o = t[i].type;
            void 0 !== s[o] ? n += s[o](t, i, e, r, this) : n += this.renderToken(t, i, e)
        }
        return n
    }, ft.prototype.renderInlineAsText = function(t, e, r) {
        let n = "";
        for (let s = 0, i = t.length; s < i; s++) switch (t[s].type) {
            case "text":
            case "html_inline":
            case "html_block":
                n += t[s].content;
                break;
            case "image":
                n += this.renderInlineAsText(t[s].children, e, r);
                break;
            case "softbreak":
            case "hardbreak":
                n += "\n"
        }
        return n
    }, ft.prototype.render = function(t, e, r) {
        let n = "";
        const s = this.rules;
        for (let i = 0, o = t.length; i < o; i++) {
            const o = t[i].type;
            "inline" === o ? n += this.renderInline(t[i].children, e, r) : void 0 !== s[o] ? n += s[o](t, i, e, r, this) : n += this.renderToken(t, i, e, r)
        }
        return n
    }, dt.prototype.__find__ = function(t) {
        for (let e = 0; e < this.__rules__.length; e++)
            if (this.__rules__[e].name === t) return e;
        return -1
    }, dt.prototype.__compile__ = function() {
        const t = this,
            e = [""];
        t.__rules__.forEach((function(t) {
            t.enabled && t.alt.forEach((function(t) {
                e.indexOf(t) < 0 && e.push(t)
            }))
        })), t.__cache__ = {}, e.forEach((function(e) {
            t.__cache__[e] = [], t.__rules__.forEach((function(r) {
                r.enabled && (e && r.alt.indexOf(e) < 0 || t.__cache__[e].push(r.fn))
            }))
        }))
    }, dt.prototype.at = function(t, e, r) {
        const n = this.__find__(t),
            s = r || {};
        if (-1 === n) throw new Error("Parser rule not found: " + t);
        this.__rules__[n].fn = e, this.__rules__[n].alt = s.alt || [], this.__cache__ = null
    }, dt.prototype.before = function(t, e, r, n) {
        const s = this.__find__(t),
            i = n || {};
        if (-1 === s) throw new Error("Parser rule not found: " + t);
        this.__rules__.splice(s, 0, {
            name: e,
            enabled: !0,
            fn: r,
            alt: i.alt || []
        }), this.__cache__ = null
    }, dt.prototype.after = function(t, e, r, n) {
        const s = this.__find__(t),
            i = n || {};
        if (-1 === s) throw new Error("Parser rule not found: " + t);
        this.__rules__.splice(s + 1, 0, {
            name: e,
            enabled: !0,
            fn: r,
            alt: i.alt || []
        }), this.__cache__ = null
    }, dt.prototype.push = function(t, e, r) {
        const n = r || {};
        this.__rules__.push({
            name: t,
            enabled: !0,
            fn: e,
            alt: n.alt || []
        }), this.__cache__ = null
    }, dt.prototype.enable = function(t, e) {
        Array.isArray(t) || (t = [t]);
        const r = [];
        return t.forEach((function(t) {
            const n = this.__find__(t);
            if (n < 0) {
                if (e) return;
                throw new Error("Rules manager: invalid rule name " + t)
            }
            this.__rules__[n].enabled = !0, r.push(t)
        }), this), this.__cache__ = null, r
    }, dt.prototype.enableOnly = function(t, e) {
        Array.isArray(t) || (t = [t]), this.__rules__.forEach((function(t) {
            t.enabled = !1
        })), this.enable(t, e)
    }, dt.prototype.disable = function(t, e) {
        Array.isArray(t) || (t = [t]);
        const r = [];
        return t.forEach((function(t) {
            const n = this.__find__(t);
            if (n < 0) {
                if (e) return;
                throw new Error("Rules manager: invalid rule name " + t)
            }
            this.__rules__[n].enabled = !1, r.push(t)
        }), this), this.__cache__ = null, r
    }, dt.prototype.getRules = function(t) {
        return null === this.__cache__ && this.__compile__(), this.__cache__[t] || []
    }, _t.prototype.attrIndex = function(t) {
        if (!this.attrs) return -1;
        const e = this.attrs;
        for (let r = 0, n = e.length; r < n; r++)
            if (e[r][0] === t) return r;
        return -1
    }, _t.prototype.attrPush = function(t) {
        this.attrs ? this.attrs.push(t) : this.attrs = [t]
    }, _t.prototype.attrSet = function(t, e) {
        const r = this.attrIndex(t),
            n = [t, e];
        r < 0 ? this.attrPush(n) : this.attrs[r] = n
    }, _t.prototype.attrGet = function(t) {
        const e = this.attrIndex(t);
        let r = null;
        return e >= 0 && (r = this.attrs[e][1]), r
    }, _t.prototype.attrJoin = function(t, e) {
        const r = this.attrIndex(t);
        r < 0 ? this.attrPush([t, e]) : this.attrs[r][1] = this.attrs[r][1] + " " + e
    }, mt.prototype.Token = _t;
    const gt = /\r\n?|\n/g,
        kt = /\0/g;

    function Dt(t) {
        return /^<\/a\s*>/i.test(t)
    }
    const Ct = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/,
        yt = /\((c|tm|r)\)/i,
        Et = /\((c|tm|r)\)/gi,
        At = {
            c: "\xa9",
            r: "\xae",
            tm: "\u2122"
        };

    function bt(t, e) {
        return At[e.toLowerCase()]
    }

    function Ft(t) {
        let e = 0;
        for (let r = t.length - 1; r >= 0; r--) {
            const n = t[r];
            "text" !== n.type || e || (n.content = n.content.replace(Et, bt)), "link_open" === n.type && "auto" === n.info && e--, "link_close" === n.type && "auto" === n.info && e++
        }
    }

    function xt(t) {
        let e = 0;
        for (let r = t.length - 1; r >= 0; r--) {
            const n = t[r];
            "text" !== n.type || e || Ct.test(n.content) && (n.content = n.content.replace(/\+-/g, "\xb1").replace(/\.{2,}/g, "\u2026").replace(/([?!])\u2026/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/gm, "$1\u2014").replace(/(^|\s)--(?=\s|$)/gm, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/gm, "$1\u2013")), "link_open" === n.type && "auto" === n.info && e--, "link_close" === n.type && "auto" === n.info && e++
        }
    }
    const wt = /['"]/,
        vt = /['"]/g,
        zt = "\u2019";

    function St(t, e, r) {
        return t.slice(0, e) + r + t.slice(e + 1)
    }

    function qt(t, e) {
        let r;
        const n = [];
        for (let s = 0; s < t.length; s++) {
            const i = t[s],
                o = t[s].level;
            for (r = n.length - 1; r >= 0 && !(n[r].level <= o); r--);
            if (n.length = r + 1, "text" !== i.type) continue;
            let u = i.content,
                c = 0,
                a = u.length;
            t: for (; c < a;) {
                vt.lastIndex = c;
                const l = vt.exec(u);
                if (!l) break;
                let h = !0,
                    p = !0;
                c = l.index + 1;
                const f = "'" === l[0];
                let d = 32;
                if (l.index - 1 >= 0) d = u.charCodeAt(l.index - 1);
                else
                    for (r = s - 1; r >= 0 && ("softbreak" !== t[r].type && "hardbreak" !== t[r].type); r--)
                        if (t[r].content) {
                            d = t[r].content.charCodeAt(t[r].content.length - 1);
                            break
                        } let _ = 32;
                if (c < a) _ = u.charCodeAt(c);
                else
                    for (r = s + 1; r < t.length && ("softbreak" !== t[r].type && "hardbreak" !== t[r].type); r++)
                        if (t[r].content) {
                            _ = t[r].content.charCodeAt(0);
                            break
                        } const m = ut(d) || ot(String.fromCharCode(d)),
                    g = ut(_) || ot(String.fromCharCode(_)),
                    k = it(d),
                    D = it(_);
                if (D ? h = !1 : g && (k || m || (h = !1)), k ? p = !1 : m && (D || g || (p = !1)), 34 === _ && '"' === l[0] && d >= 48 && d <= 57 && (p = h = !1), h && p && (h = m, p = g), h || p) {
                    if (p)
                        for (r = n.length - 1; r >= 0; r--) {
                            let h = n[r];
                            if (n[r].level < o) break;
                            if (h.single === f && n[r].level === o) {
                                let o, p;
                                h = n[r], f ? (o = e.md.options.quotes[2], p = e.md.options.quotes[3]) : (o = e.md.options.quotes[0], p = e.md.options.quotes[1]), i.content = St(i.content, l.index, p), t[h.token].content = St(t[h.token].content, h.pos, o), c += p.length - 1, h.token === s && (c += o.length - 1), u = i.content, a = u.length, n.length = r;
                                continue t
                            }
                        }
                    h ? n.push({
                        token: s,
                        pos: l.index,
                        single: f,
                        level: o
                    }) : p && f && (i.content = St(i.content, l.index, zt))
                } else f && (i.content = St(i.content, l.index, zt))
            }
        }
    }
    const Bt = [
        ["normalize", function(t) {
            let e;
            e = t.src.replace(gt, "\n"), e = e.replace(kt, "\ufffd"), t.src = e
        }],
        ["block", function(t) {
            let e;
            t.inlineMode ? (e = new t.Token("inline", "", 0), e.content = t.src, e.map = [0, 1], e.children = [], t.tokens.push(e)) : t.md.block.parse(t.src, t.md, t.env, t.tokens)
        }],
        ["inline", function(t) {
            const e = t.tokens;
            for (let r = 0, n = e.length; r < n; r++) {
                const n = e[r];
                "inline" === n.type && t.md.inline.parse(n.content, t.md, t.env, n.children)
            }
        }],
        ["linkify", function(t) {
            const e = t.tokens;
            var r;
            if (t.md.options.linkify)
                for (let n = 0, s = e.length; n < s; n++) {
                    if ("inline" !== e[n].type || !t.md.linkify.pretest(e[n].content)) continue;
                    let s = e[n].children,
                        i = 0;
                    for (let o = s.length - 1; o >= 0; o--) {
                        const u = s[o];
                        if ("link_close" !== u.type) {
                            if ("html_inline" === u.type && (r = u.content, /^<a[>\s]/i.test(r) && i > 0 && i--, Dt(u.content) && i++), !(i > 0) && "text" === u.type && t.md.linkify.test(u.content)) {
                                const r = u.content;
                                let i = t.md.linkify.match(r);
                                const c = [];
                                let a = u.level,
                                    l = 0;
                                i.length > 0 && 0 === i[0].index && o > 0 && "text_special" === s[o - 1].type && (i = i.slice(1));
                                for (let e = 0; e < i.length; e++) {
                                    const n = i[e].url,
                                        s = t.md.normalizeLink(n);
                                    if (!t.md.validateLink(s)) continue;
                                    let o = i[e].text;
                                    o = i[e].schema ? "mailto:" !== i[e].schema || /^mailto:/i.test(o) ? t.md.normalizeLinkText(o) : t.md.normalizeLinkText("mailto:" + o).replace(/^mailto:/, "") : t.md.normalizeLinkText("http://" + o).replace(/^http:\/\//, "");
                                    const u = i[e].index;
                                    if (u > l) {
                                        const e = new t.Token("text", "", 0);
                                        e.content = r.slice(l, u), e.level = a, c.push(e)
                                    }
                                    const h = new t.Token("link_open", "a", 1);
                                    h.attrs = [
                                        ["href", s]
                                    ], h.level = a++, h.markup = "linkify", h.info = "auto", c.push(h);
                                    const p = new t.Token("text", "", 0);
                                    p.content = o, p.level = a, c.push(p);
                                    const f = new t.Token("link_close", "a", -1);
                                    f.level = --a, f.markup = "linkify", f.info = "auto", c.push(f), l = i[e].lastIndex
                                }
                                if (l < r.length) {
                                    const e = new t.Token("text", "", 0);
                                    e.content = r.slice(l), e.level = a, c.push(e)
                                }
                                e[n].children = s = H(s, o, c)
                            }
                        } else
                            for (o--; s[o].level !== u.level && "link_open" !== s[o].type;) o--
                    }
                }
        }],
        ["replacements", function(t) {
            let e;
            if (t.md.options.typographer)
                for (e = t.tokens.length - 1; e >= 0; e--) "inline" === t.tokens[e].type && (yt.test(t.tokens[e].content) && Ft(t.tokens[e].children), Ct.test(t.tokens[e].content) && xt(t.tokens[e].children))
        }],
        ["smartquotes", function(t) {
            if (t.md.options.typographer)
                for (let e = t.tokens.length - 1; e >= 0; e--) "inline" === t.tokens[e].type && wt.test(t.tokens[e].content) && qt(t.tokens[e].children, t)
        }],
        ["text_join", function(t) {
            let e, r;
            const n = t.tokens,
                s = n.length;
            for (let t = 0; t < s; t++) {
                if ("inline" !== n[t].type) continue;
                const s = n[t].children,
                    i = s.length;
                for (e = 0; e < i; e++) "text_special" === s[e].type && (s[e].type = "text");
                for (e = r = 0; e < i; e++) "text" === s[e].type && e + 1 < i && "text" === s[e + 1].type ? s[e + 1].content = s[e].content + s[e + 1].content : (e !== r && (s[r] = s[e]), r++);
                e !== r && (s.length = r)
            }
        }]
    ];

    function Lt() {
        this.ruler = new dt;
        for (let t = 0; t < Bt.length; t++) this.ruler.push(Bt[t][0], Bt[t][1])
    }

    function It(t, e, r, n) {
        this.src = t, this.md = e, this.env = r, this.tokens = n, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = !1, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0;
        const s = this.src;
        for (let t = 0, e = 0, r = 0, n = 0, i = s.length, o = !1; e < i; e++) {
            const u = s.charCodeAt(e);
            if (!o) {
                if (st(u)) {
                    r++, 9 === u ? n += 4 - n % 4 : n++;
                    continue
                }
                o = !0
            }
            10 !== u && e !== i - 1 || (10 !== u && e++, this.bMarks.push(t), this.eMarks.push(e), this.tShift.push(r), this.sCount.push(n), this.bsCount.push(0), o = !1, r = 0, n = 0, t = e + 1)
        }
        this.bMarks.push(s.length), this.eMarks.push(s.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1
    }
    Lt.prototype.process = function(t) {
        const e = this.ruler.getRules("");
        for (let r = 0, n = e.length; r < n; r++) e[r](t)
    }, Lt.prototype.State = mt, It.prototype.push = function(t, e, r) {
        const n = new _t(t, e, r);
        return n.block = !0, r < 0 && this.level--, n.level = this.level, r > 0 && this.level++, this.tokens.push(n), n
    }, It.prototype.isEmpty = function(t) {
        return this.bMarks[t] + this.tShift[t] >= this.eMarks[t]
    }, It.prototype.skipEmptyLines = function(t) {
        for (let e = this.lineMax; t < e && !(this.bMarks[t] + this.tShift[t] < this.eMarks[t]); t++);
        return t
    }, It.prototype.skipSpaces = function(t) {
        for (let e = this.src.length; t < e; t++) {
            if (!st(this.src.charCodeAt(t))) break
        }
        return t
    }, It.prototype.skipSpacesBack = function(t, e) {
        if (t <= e) return t;
        for (; t > e;)
            if (!st(this.src.charCodeAt(--t))) return t + 1;
        return t
    }, It.prototype.skipChars = function(t, e) {
        for (let r = this.src.length; t < r && this.src.charCodeAt(t) === e; t++);
        return t
    }, It.prototype.skipCharsBack = function(t, e, r) {
        if (t <= r) return t;
        for (; t > r;)
            if (e !== this.src.charCodeAt(--t)) return t + 1;
        return t
    }, It.prototype.getLines = function(t, e, r, n) {
        if (t >= e) return "";
        const s = new Array(e - t);
        for (let i = 0, o = t; o < e; o++, i++) {
            let t = 0;
            const u = this.bMarks[o];
            let c, a = u;
            for (c = o + 1 < e || n ? this.eMarks[o] + 1 : this.eMarks[o]; a < c && t < r;) {
                const e = this.src.charCodeAt(a);
                if (st(e)) 9 === e ? t += 4 - (t + this.bsCount[o]) % 4 : t++;
                else {
                    if (!(a - u < this.tShift[o])) break;
                    t++
                }
                a++
            }
            s[i] = t > r ? new Array(t - r + 1).join(" ") + this.src.slice(a, c) : this.src.slice(a, c)
        }
        return s.join("")
    }, It.prototype.Token = _t;

    function Mt(t, e) {
        const r = t.bMarks[e] + t.tShift[e],
            n = t.eMarks[e];
        return t.src.slice(r, n)
    }

    function Tt(t) {
        const e = [],
            r = t.length;
        let n = 0,
            s = t.charCodeAt(n),
            i = !1,
            o = 0,
            u = "";
        for (; n < r;) 124 === s && (i ? (u += t.substring(o, n - 1), o = n) : (e.push(u + t.substring(o, n)), u = "", o = n + 1)), i = 92 === s, n++, s = t.charCodeAt(n);
        return e.push(u + t.substring(o)), e
    }

    function Rt(t, e) {
        const r = t.eMarks[e];
        let n = t.bMarks[e] + t.tShift[e];
        const s = t.src.charCodeAt(n++);
        if (42 !== s && 45 !== s && 43 !== s) return -1;
        if (n < r) {
            if (!st(t.src.charCodeAt(n))) return -1
        }
        return n
    }

    function Nt(t, e) {
        const r = t.bMarks[e] + t.tShift[e],
            n = t.eMarks[e];
        let s = r;
        if (s + 1 >= n) return -1;
        let i = t.src.charCodeAt(s++);
        if (i < 48 || i > 57) return -1;
        for (;;) {
            if (s >= n) return -1;
            if (i = t.src.charCodeAt(s++), !(i >= 48 && i <= 57)) {
                if (41 === i || 46 === i) break;
                return -1
            }
            if (s - r >= 10) return -1
        }
        return s < n && (i = t.src.charCodeAt(s), !st(i)) ? -1 : s
    }
    const Pt = "<[A-Za-z][A-Za-z0-9\\-]*(?:\\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\\s*=\\s*(?:[^\"'=<>`\\x00-\\x20]+|'[^']*'|\"[^\"]*\"))?)*\\s*\\/?>",
        Ot = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>",
        jt = new RegExp("^(?:" + Pt + "|" + Ot + "|\x3c!---?>|\x3c!--(?:[^-]|-[^-]|--[^>])*--\x3e|<[?][\\s\\S]*?[?]>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)"),
        Zt = new RegExp("^(?:" + Pt + "|" + Ot + ")"),
        $t = [
            [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, !0],
            [/^<!--/, /-->/, !0],
            [/^<\?/, /\?>/, !0],
            [/^<![A-Z]/, />/, !0],
            [/^<!\[CDATA\[/, /\]\]>/, !0],
            [new RegExp("^</?(" + ["address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "nav", "noframes", "ol", "optgroup", "option", "p", "param", "search", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "title", "tr", "track", "ul"].join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, !0],
            [new RegExp(Zt.source + "\\s*$"), /^$/, !1]
        ];
    const Ut = [
        ["table", function(t, e, r, n) {
                if (e + 2 > r) return !1;
                let s = e + 1;
                if (t.sCount[s] < t.blkIndent) return !1;
                if (t.sCount[s] - t.blkIndent >= 4) return !1;
                let i = t.bMarks[s] + t.tShift[s];
                if (i >= t.eMarks[s]) return !1;
                const o = t.src.charCodeAt(i++);
                if (124 !== o && 45 !== o && 58 !== o) return !1;
                if (i >= t.eMarks[s]) return !1;
                const u = t.src.charCodeAt(i++);
                if (124 !== u && 45 !== u && 58 !== u && !st(u)) return !1;
                if (45 === o && st(u)) return !1;
                for (; i < t.eMarks[s];) {
                    const e = t.src.charCodeAt(i);
                    if (124 !== e && 45 !== e && 58 !== e && !st(e)) return !1;
                    i++
                }
                let c = Mt(t, e + 1),
                    a = c.split("|");
                const l = [];
                for (let t = 0; t < a.length; t++) {
                    const e = a[t].trim();
                    if (!e) {
                        if (0 === t || t === a.length - 1) continue;
                        return !1
                    }
                    if (!/^:?-+:?$/.test(e)) return !1;
                    58 === e.charCodeAt(e.length - 1) ? l.push(58 === e.charCodeAt(0) ? "center" : "right") : 58 === e.charCodeAt(0) ? l.push("left") : l.push("")
                }
                if (c = Mt(t, e).trim(), -1 === c.indexOf("|")) return !1;
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                a = Tt(c), a.length && "" === a[0] && a.shift(), a.length && "" === a[a.length - 1] && a.pop();
                const h = a.length;
                if (0 === h || h !== l.length) return !1;
                if (n) return !0;
                const p = t.parentType;
                t.parentType = "table";
                const f = t.md.block.ruler.getRules("blockquote"),
                    d = [e, 0];
                t.push("table_open", "table", 1).map = d, t.push("thead_open", "thead", 1).map = [e, e + 1], t.push("tr_open", "tr", 1).map = [e, e + 1];
                for (let e = 0; e < a.length; e++) {
                    const r = t.push("th_open", "th", 1);
                    l[e] && (r.attrs = [
                        ["style", "text-align:" + l[e]]
                    ]);
                    const n = t.push("inline", "", 0);
                    n.content = a[e].trim(), n.children = [], t.push("th_close", "th", -1)
                }
                let _;
                t.push("tr_close", "tr", -1), t.push("thead_close", "thead", -1);
                let m = 0;
                for (s = e + 2; s < r && !(t.sCount[s] < t.blkIndent); s++) {
                    let n = !1;
                    for (let e = 0, i = f.length; e < i; e++)
                        if (f[e](t, s, r, !0)) {
                            n = !0;
                            break
                        } if (n) break;
                    if (c = Mt(t, s).trim(), !c) break;
                    if (t.sCount[s] - t.blkIndent >= 4) break;
                    if (a = Tt(c), a.length && "" === a[0] && a.shift(), a.length && "" === a[a.length - 1] && a.pop(), m += h - a.length, m > 65536) break;
                    if (s === e + 2) {
                        t.push("tbody_open", "tbody", 1).map = _ = [e + 2, 0]
                    }
                    t.push("tr_open", "tr", 1).map = [s, s + 1];
                    for (let e = 0; e < h; e++) {
                        const r = t.push("td_open", "td", 1);
                        l[e] && (r.attrs = [
                            ["style", "text-align:" + l[e]]
                        ]);
                        const n = t.push("inline", "", 0);
                        n.content = a[e] ? a[e].trim() : "", n.children = [], t.push("td_close", "td", -1)
                    }
                    t.push("tr_close", "tr", -1)
                }
                return _ && (t.push("tbody_close", "tbody", -1), _[1] = s), t.push("table_close", "table", -1), d[1] = s, t.parentType = p, t.line = s, !0
            },
            ["paragraph", "reference"]
        ],
        ["code", function(t, e, r) {
            if (t.sCount[e] - t.blkIndent < 4) return !1;
            let n = e + 1,
                s = n;
            for (; n < r;)
                if (t.isEmpty(n)) n++;
                else {
                    if (!(t.sCount[n] - t.blkIndent >= 4)) break;
                    n++, s = n
                } t.line = s;
            const i = t.push("code_block", "code", 0);
            return i.content = t.getLines(e, s, 4 + t.blkIndent, !1) + "\n", i.map = [e, t.line], !0
        }],
        ["fence", function(t, e, r, n) {
                let s = t.bMarks[e] + t.tShift[e],
                    i = t.eMarks[e];
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                if (s + 3 > i) return !1;
                const o = t.src.charCodeAt(s);
                if (126 !== o && 96 !== o) return !1;
                let u = s;
                s = t.skipChars(s, o);
                let c = s - u;
                if (c < 3) return !1;
                const a = t.src.slice(u, s),
                    l = t.src.slice(s, i);
                if (96 === o && l.indexOf(String.fromCharCode(o)) >= 0) return !1;
                if (n) return !0;
                let h = e,
                    p = !1;
                for (;
                    (h++, !(h >= r)) && (s = u = t.bMarks[h] + t.tShift[h], i = t.eMarks[h], !(s < i && t.sCount[h] < t.blkIndent));)
                    if (t.src.charCodeAt(s) === o && !(t.sCount[h] - t.blkIndent >= 4 || (s = t.skipChars(s, o), s - u < c || (s = t.skipSpaces(s), s < i)))) {
                        p = !0;
                        break
                    } c = t.sCount[e], t.line = h + (p ? 1 : 0);
                const f = t.push("fence", "code", 0);
                return f.info = l, f.content = t.getLines(e + 1, h, c, !0), f.markup = a, f.map = [e, t.line], !0
            },
            ["paragraph", "reference", "blockquote", "list"]
        ],
        ["blockquote", function(t, e, r, n) {
                let s = t.bMarks[e] + t.tShift[e],
                    i = t.eMarks[e];
                const o = t.lineMax;
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                if (62 !== t.src.charCodeAt(s)) return !1;
                if (n) return !0;
                const u = [],
                    c = [],
                    a = [],
                    l = [],
                    h = t.md.block.ruler.getRules("blockquote"),
                    p = t.parentType;
                t.parentType = "blockquote";
                let f, d = !1;
                for (f = e; f < r; f++) {
                    const e = t.sCount[f] < t.blkIndent;
                    if (s = t.bMarks[f] + t.tShift[f], i = t.eMarks[f], s >= i) break;
                    if (62 === t.src.charCodeAt(s++) && !e) {
                        let e, r, n = t.sCount[f] + 1;
                        32 === t.src.charCodeAt(s) ? (s++, n++, r = !1, e = !0) : 9 === t.src.charCodeAt(s) ? (e = !0, (t.bsCount[f] + n) % 4 == 3 ? (s++, n++, r = !1) : r = !0) : e = !1;
                        let o = n;
                        for (u.push(t.bMarks[f]), t.bMarks[f] = s; s < i;) {
                            const e = t.src.charCodeAt(s);
                            if (!st(e)) break;
                            9 === e ? o += 4 - (o + t.bsCount[f] + (r ? 1 : 0)) % 4 : o++, s++
                        }
                        d = s >= i, c.push(t.bsCount[f]), t.bsCount[f] = t.sCount[f] + 1 + (e ? 1 : 0), a.push(t.sCount[f]), t.sCount[f] = o - n, l.push(t.tShift[f]), t.tShift[f] = s - t.bMarks[f];
                        continue
                    }
                    if (d) break;
                    let n = !1;
                    for (let e = 0, s = h.length; e < s; e++)
                        if (h[e](t, f, r, !0)) {
                            n = !0;
                            break
                        } if (n) {
                        t.lineMax = f, 0 !== t.blkIndent && (u.push(t.bMarks[f]), c.push(t.bsCount[f]), l.push(t.tShift[f]), a.push(t.sCount[f]), t.sCount[f] -= t.blkIndent);
                        break
                    }
                    u.push(t.bMarks[f]), c.push(t.bsCount[f]), l.push(t.tShift[f]), a.push(t.sCount[f]), t.sCount[f] = -1
                }
                const _ = t.blkIndent;
                t.blkIndent = 0;
                const m = t.push("blockquote_open", "blockquote", 1);
                m.markup = ">";
                const g = [e, 0];
                m.map = g, t.md.block.tokenize(t, e, f), t.push("blockquote_close", "blockquote", -1).markup = ">", t.lineMax = o, t.parentType = p, g[1] = t.line;
                for (let r = 0; r < l.length; r++) t.bMarks[r + e] = u[r], t.tShift[r + e] = l[r], t.sCount[r + e] = a[r], t.bsCount[r + e] = c[r];
                return t.blkIndent = _, !0
            },
            ["paragraph", "reference", "blockquote", "list"]
        ],
        ["hr", function(t, e, r, n) {
                const s = t.eMarks[e];
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                let i = t.bMarks[e] + t.tShift[e];
                const o = t.src.charCodeAt(i++);
                if (42 !== o && 45 !== o && 95 !== o) return !1;
                let u = 1;
                for (; i < s;) {
                    const e = t.src.charCodeAt(i++);
                    if (e !== o && !st(e)) return !1;
                    e === o && u++
                }
                if (u < 3) return !1;
                if (n) return !0;
                t.line = e + 1;
                const c = t.push("hr", "hr", 0);
                return c.map = [e, t.line], c.markup = Array(u + 1).join(String.fromCharCode(o)), !0
            },
            ["paragraph", "reference", "blockquote", "list"]
        ],
        ["list", function(t, e, r, n) {
                let s, i, o, u, c = e,
                    a = !0;
                if (t.sCount[c] - t.blkIndent >= 4) return !1;
                if (t.listIndent >= 0 && t.sCount[c] - t.listIndent >= 4 && t.sCount[c] < t.blkIndent) return !1;
                let l, h, p, f = !1;
                if (n && "paragraph" === t.parentType && t.sCount[c] >= t.blkIndent && (f = !0), (p = Nt(t, c)) >= 0) {
                    if (l = !0, o = t.bMarks[c] + t.tShift[c], h = Number(t.src.slice(o, p - 1)), f && 1 !== h) return !1
                } else {
                    if (!((p = Rt(t, c)) >= 0)) return !1;
                    l = !1
                }
                if (f && t.skipSpaces(p) >= t.eMarks[c]) return !1;
                if (n) return !0;
                const d = t.src.charCodeAt(p - 1),
                    _ = t.tokens.length;
                l ? (u = t.push("ordered_list_open", "ol", 1), 1 !== h && (u.attrs = [
                    ["start", h]
                ])) : u = t.push("bullet_list_open", "ul", 1);
                const m = [c, 0];
                u.map = m, u.markup = String.fromCharCode(d);
                let g = !1;
                const k = t.md.block.ruler.getRules("list"),
                    D = t.parentType;
                for (t.parentType = "list"; c < r;) {
                    i = p, s = t.eMarks[c];
                    const e = t.sCount[c] + p - (t.bMarks[c] + t.tShift[c]);
                    let n = e;
                    for (; i < s;) {
                        const e = t.src.charCodeAt(i);
                        if (9 === e) n += 4 - (n + t.bsCount[c]) % 4;
                        else {
                            if (32 !== e) break;
                            n++
                        }
                        i++
                    }
                    const h = i;
                    let f;
                    f = h >= s ? 1 : n - e, f > 4 && (f = 1);
                    const _ = e + f;
                    u = t.push("list_item_open", "li", 1), u.markup = String.fromCharCode(d);
                    const m = [c, 0];
                    u.map = m, l && (u.info = t.src.slice(o, p - 1));
                    const D = t.tight,
                        C = t.tShift[c],
                        y = t.sCount[c],
                        E = t.listIndent;
                    if (t.listIndent = t.blkIndent, t.blkIndent = _, t.tight = !0, t.tShift[c] = h - t.bMarks[c], t.sCount[c] = n, h >= s && t.isEmpty(c + 1) ? t.line = Math.min(t.line + 2, r) : t.md.block.tokenize(t, c, r, !0), t.tight && !g || (a = !1), g = t.line - c > 1 && t.isEmpty(t.line - 1), t.blkIndent = t.listIndent, t.listIndent = E, t.tShift[c] = C, t.sCount[c] = y, t.tight = D, u = t.push("list_item_close", "li", -1), u.markup = String.fromCharCode(d), c = t.line, m[1] = c, c >= r) break;
                    if (t.sCount[c] < t.blkIndent) break;
                    if (t.sCount[c] - t.blkIndent >= 4) break;
                    let A = !1;
                    for (let e = 0, n = k.length; e < n; e++)
                        if (k[e](t, c, r, !0)) {
                            A = !0;
                            break
                        } if (A) break;
                    if (l) {
                        if (p = Nt(t, c), p < 0) break;
                        o = t.bMarks[c] + t.tShift[c]
                    } else if (p = Rt(t, c), p < 0) break;
                    if (d !== t.src.charCodeAt(p - 1)) break
                }
                return u = l ? t.push("ordered_list_close", "ol", -1) : t.push("bullet_list_close", "ul", -1), u.markup = String.fromCharCode(d), m[1] = c, t.line = c, t.parentType = D, a && function(t, e) {
                    const r = t.level + 2;
                    for (let n = e + 2, s = t.tokens.length - 2; n < s; n++) t.tokens[n].level === r && "paragraph_open" === t.tokens[n].type && (t.tokens[n + 2].hidden = !0, t.tokens[n].hidden = !0, n += 2)
                }(t, _), !0
            },
            ["paragraph", "reference", "blockquote"]
        ],
        ["reference", function(t, e, r, n) {
            let s = t.bMarks[e] + t.tShift[e],
                i = t.eMarks[e],
                o = e + 1;
            if (t.sCount[e] - t.blkIndent >= 4) return !1;
            if (91 !== t.src.charCodeAt(s)) return !1;

            function u(e) {
                const r = t.lineMax;
                if (e >= r || t.isEmpty(e)) return null;
                let n = !1;
                if (t.sCount[e] - t.blkIndent > 3 && (n = !0), t.sCount[e] < 0 && (n = !0), !n) {
                    const n = t.md.block.ruler.getRules("reference"),
                        s = t.parentType;
                    t.parentType = "reference";
                    let i = !1;
                    for (let s = 0, o = n.length; s < o; s++)
                        if (n[s](t, e, r, !0)) {
                            i = !0;
                            break
                        } if (t.parentType = s, i) return null
                }
                const s = t.bMarks[e] + t.tShift[e],
                    i = t.eMarks[e];
                return t.src.slice(s, i + 1)
            }
            let c = t.src.slice(s, i + 1);
            i = c.length;
            let a = -1;
            for (s = 1; s < i; s++) {
                const t = c.charCodeAt(s);
                if (91 === t) return !1;
                if (93 === t) {
                    a = s;
                    break
                }
                if (10 === t) {
                    const t = u(o);
                    null !== t && (c += t, i = c.length, o++)
                } else if (92 === t && (s++, s < i && 10 === c.charCodeAt(s))) {
                    const t = u(o);
                    null !== t && (c += t, i = c.length, o++)
                }
            }
            if (a < 0 || 58 !== c.charCodeAt(a + 1)) return !1;
            for (s = a + 2; s < i; s++) {
                const t = c.charCodeAt(s);
                if (10 === t) {
                    const t = u(o);
                    null !== t && (c += t, i = c.length, o++)
                } else if (!st(t)) break
            }
            const l = t.md.helpers.parseLinkDestination(c, s, i);
            if (!l.ok) return !1;
            const h = t.md.normalizeLink(l.str);
            if (!t.md.validateLink(h)) return !1;
            s = l.pos;
            const p = s,
                f = o,
                d = s;
            for (; s < i; s++) {
                const t = c.charCodeAt(s);
                if (10 === t) {
                    const t = u(o);
                    null !== t && (c += t, i = c.length, o++)
                } else if (!st(t)) break
            }
            let _, m = t.md.helpers.parseLinkTitle(c, s, i);
            for (; m.can_continue;) {
                const e = u(o);
                if (null === e) break;
                c += e, s = i, i = c.length, o++, m = t.md.helpers.parseLinkTitle(c, s, i, m)
            }
            for (s < i && d !== s && m.ok ? (_ = m.str, s = m.pos) : (_ = "", s = p, o = f); s < i;) {
                if (!st(c.charCodeAt(s))) break;
                s++
            }
            if (s < i && 10 !== c.charCodeAt(s) && _)
                for (_ = "", s = p, o = f; s < i;) {
                    if (!st(c.charCodeAt(s))) break;
                    s++
                }
            if (s < i && 10 !== c.charCodeAt(s)) return !1;
            const g = ct(c.slice(1, a));
            return !!g && (n || (void 0 === t.env.references && (t.env.references = {}), void 0 === t.env.references[g] && (t.env.references[g] = {
                title: _,
                href: h
            }), t.line = o), !0)
        }],
        ["html_block", function(t, e, r, n) {
                let s = t.bMarks[e] + t.tShift[e],
                    i = t.eMarks[e];
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                if (!t.md.options.html) return !1;
                if (60 !== t.src.charCodeAt(s)) return !1;
                let o = t.src.slice(s, i),
                    u = 0;
                for (; u < $t.length && !$t[u][0].test(o); u++);
                if (u === $t.length) return !1;
                if (n) return $t[u][2];
                let c = e + 1;
                if (!$t[u][1].test(o))
                    for (; c < r && !(t.sCount[c] < t.blkIndent); c++)
                        if (s = t.bMarks[c] + t.tShift[c], i = t.eMarks[c], o = t.src.slice(s, i), $t[u][1].test(o)) {
                            0 !== o.length && c++;
                            break
                        } t.line = c;
                const a = t.push("html_block", "", 0);
                return a.map = [e, c], a.content = t.getLines(e, c, t.blkIndent, !0), !0
            },
            ["paragraph", "reference", "blockquote"]
        ],
        ["heading", function(t, e, r, n) {
                let s = t.bMarks[e] + t.tShift[e],
                    i = t.eMarks[e];
                if (t.sCount[e] - t.blkIndent >= 4) return !1;
                let o = t.src.charCodeAt(s);
                if (35 !== o || s >= i) return !1;
                let u = 1;
                for (o = t.src.charCodeAt(++s); 35 === o && s < i && u <= 6;) u++, o = t.src.charCodeAt(++s);
                if (u > 6 || s < i && !st(o)) return !1;
                if (n) return !0;
                i = t.skipSpacesBack(i, s);
                const c = t.skipCharsBack(i, 35, s);
                c > s && st(t.src.charCodeAt(c - 1)) && (i = c), t.line = e + 1;
                const a = t.push("heading_open", "h" + String(u), 1);
                a.markup = "########".slice(0, u), a.map = [e, t.line];
                const l = t.push("inline", "", 0);
                return l.content = t.src.slice(s, i).trim(), l.map = [e, t.line], l.children = [], t.push("heading_close", "h" + String(u), -1).markup = "########".slice(0, u), !0
            },
            ["paragraph", "reference", "blockquote"]
        ],
        ["lheading", function(t, e, r) {
            const n = t.md.block.ruler.getRules("paragraph");
            if (t.sCount[e] - t.blkIndent >= 4) return !1;
            const s = t.parentType;
            t.parentType = "paragraph";
            let i, o = 0,
                u = e + 1;
            for (; u < r && !t.isEmpty(u); u++) {
                if (t.sCount[u] - t.blkIndent > 3) continue;
                if (t.sCount[u] >= t.blkIndent) {
                    let e = t.bMarks[u] + t.tShift[u];
                    const r = t.eMarks[u];
                    if (e < r && (i = t.src.charCodeAt(e), (45 === i || 61 === i) && (e = t.skipChars(e, i), e = t.skipSpaces(e), e >= r))) {
                        o = 61 === i ? 1 : 2;
                        break
                    }
                }
                if (t.sCount[u] < 0) continue;
                let e = !1;
                for (let s = 0, i = n.length; s < i; s++)
                    if (n[s](t, u, r, !0)) {
                        e = !0;
                        break
                    } if (e) break
            }
            if (!o) return !1;
            const c = t.getLines(e, u, t.blkIndent, !1).trim();
            t.line = u + 1;
            const a = t.push("heading_open", "h" + String(o), 1);
            a.markup = String.fromCharCode(i), a.map = [e, t.line];
            const l = t.push("inline", "", 0);
            return l.content = c, l.map = [e, t.line - 1], l.children = [], t.push("heading_close", "h" + String(o), -1).markup = String.fromCharCode(i), t.parentType = s, !0
        }],
        ["paragraph", function(t, e, r) {
            const n = t.md.block.ruler.getRules("paragraph"),
                s = t.parentType;
            let i = e + 1;
            for (t.parentType = "paragraph"; i < r && !t.isEmpty(i); i++) {
                if (t.sCount[i] - t.blkIndent > 3) continue;
                if (t.sCount[i] < 0) continue;
                let e = !1;
                for (let s = 0, o = n.length; s < o; s++)
                    if (n[s](t, i, r, !0)) {
                        e = !0;
                        break
                    } if (e) break
            }
            const o = t.getLines(e, i, t.blkIndent, !1).trim();
            t.line = i, t.push("paragraph_open", "p", 1).map = [e, t.line];
            const u = t.push("inline", "", 0);
            return u.content = o, u.map = [e, t.line], u.children = [], t.push("paragraph_close", "p", -1), t.parentType = s, !0
        }]
    ];

    function Ht() {
        this.ruler = new dt;
        for (let t = 0; t < Ut.length; t++) this.ruler.push(Ut[t][0], Ut[t][1], {
            alt: (Ut[t][2] || []).slice()
        })
    }

    function Vt(t, e, r, n) {
        this.src = t, this.env = r, this.md = e, this.tokens = n, this.tokens_meta = Array(n.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = !1, this.linkLevel = 0
    }

    function Gt(t) {
        switch (t) {
            case 10:
            case 33:
            case 35:
            case 36:
            case 37:
            case 38:
            case 42:
            case 43:
            case 45:
            case 58:
            case 60:
            case 61:
            case 62:
            case 64:
            case 91:
            case 92:
            case 93:
            case 94:
            case 95:
            case 96:
            case 123:
            case 125:
            case 126:
                return !0;
            default:
                return !1
        }
    }
    Ht.prototype.tokenize = function(t, e, r) {
        const n = this.ruler.getRules(""),
            s = n.length,
            i = t.md.options.maxNesting;
        let o = e,
            u = !1;
        for (; o < r && (t.line = o = t.skipEmptyLines(o), !(o >= r)) && !(t.sCount[o] < t.blkIndent);) {
            if (t.level >= i) {
                t.line = r;
                break
            }
            const e = t.line;
            let c = !1;
            for (let i = 0; i < s; i++)
                if (c = n[i](t, o, r, !1), c) {
                    if (e >= t.line) throw new Error("block rule didn't increment state.line");
                    break
                } if (!c) throw new Error("none of the block rules matched");
            t.tight = !u, t.isEmpty(t.line - 1) && (u = !0), o = t.line, o < r && t.isEmpty(o) && (u = !0, o++, t.line = o)
        }
    }, Ht.prototype.parse = function(t, e, r, n) {
        if (!t) return;
        const s = new this.State(t, e, r, n);
        this.tokenize(s, s.line, s.lineMax)
    }, Ht.prototype.State = It, Vt.prototype.pushPending = function() {
        const t = new _t("text", "", 0);
        return t.content = this.pending, t.level = this.pendingLevel, this.tokens.push(t), this.pending = "", t
    }, Vt.prototype.push = function(t, e, r) {
        this.pending && this.pushPending();
        const n = new _t(t, e, r);
        let s = null;
        return r < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), n.level = this.level, r > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], s = {
            delimiters: this.delimiters
        }), this.pendingLevel = this.level, this.tokens.push(n), this.tokens_meta.push(s), n
    }, Vt.prototype.scanDelims = function(t, e) {
        const r = this.posMax,
            n = this.src.charCodeAt(t),
            s = t > 0 ? this.src.charCodeAt(t - 1) : 32;
        let i = t;
        for (; i < r && this.src.charCodeAt(i) === n;) i++;
        const o = i - t,
            u = i < r ? this.src.charCodeAt(i) : 32,
            c = ut(s) || ot(String.fromCharCode(s)),
            a = ut(u) || ot(String.fromCharCode(u)),
            l = it(s),
            h = it(u),
            p = !h && (!a || l || c),
            f = !l && (!c || h || a);
        return {
            can_open: p && (e || !f || c),
            can_close: f && (e || !p || a),
            length: o
        }
    }, Vt.prototype.Token = _t;
    const Wt = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
    const Jt = [];
    for (let t = 0; t < 256; t++) Jt.push(0);

    function Qt(t, e) {
        let r;
        const n = [],
            s = e.length;
        for (let i = 0; i < s; i++) {
            const s = e[i];
            if (126 !== s.marker) continue;
            if (-1 === s.end) continue;
            const o = e[s.end];
            r = t.tokens[s.token], r.type = "s_open", r.tag = "s", r.nesting = 1, r.markup = "~~", r.content = "", r = t.tokens[o.token], r.type = "s_close", r.tag = "s", r.nesting = -1, r.markup = "~~", r.content = "", "text" === t.tokens[o.token - 1].type && "~" === t.tokens[o.token - 1].content && n.push(o.token - 1)
        }
        for (; n.length;) {
            const e = n.pop();
            let s = e + 1;
            for (; s < t.tokens.length && "s_close" === t.tokens[s].type;) s++;
            s--, e !== s && (r = t.tokens[s], t.tokens[s] = t.tokens[e], t.tokens[e] = r)
        }
    }
    "\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach((function(t) {
        Jt[t.charCodeAt(0)] = 1
    }));
    var Xt = {
        tokenize: function(t, e) {
            const r = t.pos,
                n = t.src.charCodeAt(r);
            if (e) return !1;
            if (126 !== n) return !1;
            const s = t.scanDelims(t.pos, !0);
            let i = s.length;
            const o = String.fromCharCode(n);
            if (i < 2) return !1;
            let u;
            i % 2 && (u = t.push("text", "", 0), u.content = o, i--);
            for (let e = 0; e < i; e += 2) u = t.push("text", "", 0), u.content = o + o, t.delimiters.push({
                marker: n,
                length: 0,
                token: t.tokens.length - 1,
                end: -1,
                open: s.can_open,
                close: s.can_close
            });
            return t.pos += s.length, !0
        },
        postProcess: function(t) {
            const e = t.tokens_meta,
                r = t.tokens_meta.length;
            Qt(t, t.delimiters);
            for (let n = 0; n < r; n++) e[n] && e[n].delimiters && Qt(t, e[n].delimiters)
        }
    };

    function Yt(t, e) {
        for (let r = e.length - 1; r >= 0; r--) {
            const n = e[r];
            if (95 !== n.marker && 42 !== n.marker) continue;
            if (-1 === n.end) continue;
            const s = e[n.end],
                i = r > 0 && e[r - 1].end === n.end + 1 && e[r - 1].marker === n.marker && e[r - 1].token === n.token - 1 && e[n.end + 1].token === s.token + 1,
                o = String.fromCharCode(n.marker),
                u = t.tokens[n.token];
            u.type = i ? "strong_open" : "em_open", u.tag = i ? "strong" : "em", u.nesting = 1, u.markup = i ? o + o : o, u.content = "";
            const c = t.tokens[s.token];
            c.type = i ? "strong_close" : "em_close", c.tag = i ? "strong" : "em", c.nesting = -1, c.markup = i ? o + o : o, c.content = "", i && (t.tokens[e[r - 1].token].content = "", t.tokens[e[n.end + 1].token].content = "", r--)
        }
    }
    var Kt = {
        tokenize: function(t, e) {
            const r = t.pos,
                n = t.src.charCodeAt(r);
            if (e) return !1;
            if (95 !== n && 42 !== n) return !1;
            const s = t.scanDelims(t.pos, 42 === n);
            for (let e = 0; e < s.length; e++) {
                t.push("text", "", 0).content = String.fromCharCode(n), t.delimiters.push({
                    marker: n,
                    length: s.length,
                    token: t.tokens.length - 1,
                    end: -1,
                    open: s.can_open,
                    close: s.can_close
                })
            }
            return t.pos += s.length, !0
        },
        postProcess: function(t) {
            const e = t.tokens_meta,
                r = t.tokens_meta.length;
            Yt(t, t.delimiters);
            for (let n = 0; n < r; n++) e[n] && e[n].delimiters && Yt(t, e[n].delimiters)
        }
    };
    const te = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,
        ee = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
    const re = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,
        ne = /^&([a-z][a-z0-9]{1,31});/i;

    function se(t) {
        const e = {},
            r = t.length;
        if (!r) return;
        let n = 0,
            s = -2;
        const i = [];
        for (let o = 0; o < r; o++) {
            const r = t[o];
            if (i.push(0), t[n].marker === r.marker && s === r.token - 1 || (n = o), s = r.token, r.length = r.length || 0, !r.close) continue;
            e.hasOwnProperty(r.marker) || (e[r.marker] = [-1, -1, -1, -1, -1, -1]);
            const u = e[r.marker][(r.open ? 3 : 0) + r.length % 3];
            let c = n - i[n] - 1,
                a = c;
            for (; c > u; c -= i[c] + 1) {
                const e = t[c];
                if (e.marker === r.marker && (e.open && e.end < 0)) {
                    let n = !1;
                    if ((e.close || r.open) && (e.length + r.length) % 3 == 0 && (e.length % 3 == 0 && r.length % 3 == 0 || (n = !0)), !n) {
                        const n = c > 0 && !t[c - 1].open ? i[c - 1] + 1 : 0;
                        i[o] = o - c + n, i[c] = n, r.open = !1, e.end = o, e.close = !1, a = -1, s = -2;
                        break
                    }
                }
            } - 1 !== a && (e[r.marker][(r.open ? 3 : 0) + (r.length || 0) % 3] = a)
        }
    }
    const ie = [
            ["text", function(t, e) {
                let r = t.pos;
                for (; r < t.posMax && !Gt(t.src.charCodeAt(r));) r++;
                return r !== t.pos && (e || (t.pending += t.src.slice(t.pos, r)), t.pos = r, !0)
            }],
            ["linkify", function(t, e) {
                if (!t.md.options.linkify) return !1;
                if (t.linkLevel > 0) return !1;
                const r = t.pos;
                if (r + 3 > t.posMax) return !1;
                if (58 !== t.src.charCodeAt(r)) return !1;
                if (47 !== t.src.charCodeAt(r + 1)) return !1;
                if (47 !== t.src.charCodeAt(r + 2)) return !1;
                const n = t.pending.match(Wt);
                if (!n) return !1;
                const s = n[1],
                    i = t.md.linkify.matchAtStart(t.src.slice(r - s.length));
                if (!i) return !1;
                let o = i.url;
                if (o.length <= s.length) return !1;
                o = o.replace(/\*+$/, "");
                const u = t.md.normalizeLink(o);
                if (!t.md.validateLink(u)) return !1;
                if (!e) {
                    t.pending = t.pending.slice(0, -s.length);
                    const e = t.push("link_open", "a", 1);
                    e.attrs = [
                        ["href", u]
                    ], e.markup = "linkify", e.info = "auto";
                    t.push("text", "", 0).content = t.md.normalizeLinkText(o);
                    const r = t.push("link_close", "a", -1);
                    r.markup = "linkify", r.info = "auto"
                }
                return t.pos += o.length - s.length, !0
            }],
            ["newline", function(t, e) {
                let r = t.pos;
                if (10 !== t.src.charCodeAt(r)) return !1;
                const n = t.pending.length - 1,
                    s = t.posMax;
                if (!e)
                    if (n >= 0 && 32 === t.pending.charCodeAt(n))
                        if (n >= 1 && 32 === t.pending.charCodeAt(n - 1)) {
                            let e = n - 1;
                            for (; e >= 1 && 32 === t.pending.charCodeAt(e - 1);) e--;
                            t.pending = t.pending.slice(0, e), t.push("hardbreak", "br", 0)
                        } else t.pending = t.pending.slice(0, -1), t.push("softbreak", "br", 0);
                else t.push("softbreak", "br", 0);
                for (r++; r < s && st(t.src.charCodeAt(r));) r++;
                return t.pos = r, !0
            }],
            ["escape", function(t, e) {
                let r = t.pos;
                const n = t.posMax;
                if (92 !== t.src.charCodeAt(r)) return !1;
                if (r++, r >= n) return !1;
                let s = t.src.charCodeAt(r);
                if (10 === s) {
                    for (e || t.push("hardbreak", "br", 0), r++; r < n && (s = t.src.charCodeAt(r), st(s));) r++;
                    return t.pos = r, !0
                }
                let i = t.src[r];
                if (s >= 55296 && s <= 56319 && r + 1 < n) {
                    const e = t.src.charCodeAt(r + 1);
                    e >= 56320 && e <= 57343 && (i += t.src[r + 1], r++)
                }
                const o = "\\" + i;
                if (!e) {
                    const e = t.push("text_special", "", 0);
                    s < 256 && 0 !== Jt[s] ? e.content = i : e.content = o, e.markup = o, e.info = "escape"
                }
                return t.pos = r + 1, !0
            }],
            ["backticks", function(t, e) {
                let r = t.pos;
                if (96 !== t.src.charCodeAt(r)) return !1;
                const n = r;
                r++;
                const s = t.posMax;
                for (; r < s && 96 === t.src.charCodeAt(r);) r++;
                const i = t.src.slice(n, r),
                    o = i.length;
                if (t.backticksScanned && (t.backticks[o] || 0) <= n) return e || (t.pending += i), t.pos += o, !0;
                let u, c = r;
                for (; - 1 !== (u = t.src.indexOf("`", c));) {
                    for (c = u + 1; c < s && 96 === t.src.charCodeAt(c);) c++;
                    const n = c - u;
                    if (n === o) {
                        if (!e) {
                            const e = t.push("code_inline", "code", 0);
                            e.markup = i, e.content = t.src.slice(r, u).replace(/\n/g, " ").replace(/^ (.+) $/, "$1")
                        }
                        return t.pos = c, !0
                    }
                    t.backticks[n] = u
                }
                return t.backticksScanned = !0, e || (t.pending += i), t.pos += o, !0
            }],
            ["strikethrough", Xt.tokenize],
            ["emphasis", Kt.tokenize],
            ["link", function(t, e) {
                let r, n, s, i, o = "",
                    u = "",
                    c = t.pos,
                    a = !0;
                if (91 !== t.src.charCodeAt(t.pos)) return !1;
                const l = t.pos,
                    h = t.posMax,
                    p = t.pos + 1,
                    f = t.md.helpers.parseLinkLabel(t, t.pos, !0);
                if (f < 0) return !1;
                let d = f + 1;
                if (d < h && 40 === t.src.charCodeAt(d)) {
                    for (a = !1, d++; d < h && (r = t.src.charCodeAt(d), st(r) || 10 === r); d++);
                    if (d >= h) return !1;
                    if (c = d, s = t.md.helpers.parseLinkDestination(t.src, d, t.posMax), s.ok) {
                        for (o = t.md.normalizeLink(s.str), t.md.validateLink(o) ? d = s.pos : o = "", c = d; d < h && (r = t.src.charCodeAt(d), st(r) || 10 === r); d++);
                        if (s = t.md.helpers.parseLinkTitle(t.src, d, t.posMax), d < h && c !== d && s.ok)
                            for (u = s.str, d = s.pos; d < h && (r = t.src.charCodeAt(d), st(r) || 10 === r); d++);
                    }(d >= h || 41 !== t.src.charCodeAt(d)) && (a = !0), d++
                }
                if (a) {
                    if (void 0 === t.env.references) return !1;
                    if (d < h && 91 === t.src.charCodeAt(d) ? (c = d + 1, d = t.md.helpers.parseLinkLabel(t, d), d >= 0 ? n = t.src.slice(c, d++) : d = f + 1) : d = f + 1, n || (n = t.src.slice(p, f)), i = t.env.references[ct(n)], !i) return t.pos = l, !1;
                    o = i.href, u = i.title
                }
                if (!e) {
                    t.pos = p, t.posMax = f;
                    const e = [
                        ["href", o]
                    ];
                    t.push("link_open", "a", 1).attrs = e, u && e.push(["title", u]), t.linkLevel++, t.md.inline.tokenize(t), t.linkLevel--, t.push("link_close", "a", -1)
                }
                return t.pos = d, t.posMax = h, !0
            }],
            ["image", function(t, e) {
                let r, n, s, i, o, u, c, a, l = "";
                const h = t.pos,
                    p = t.posMax;
                if (33 !== t.src.charCodeAt(t.pos)) return !1;
                if (91 !== t.src.charCodeAt(t.pos + 1)) return !1;
                const f = t.pos + 2,
                    d = t.md.helpers.parseLinkLabel(t, t.pos + 1, !1);
                if (d < 0) return !1;
                if (i = d + 1, i < p && 40 === t.src.charCodeAt(i)) {
                    for (i++; i < p && (r = t.src.charCodeAt(i), st(r) || 10 === r); i++);
                    if (i >= p) return !1;
                    for (a = i, u = t.md.helpers.parseLinkDestination(t.src, i, t.posMax), u.ok && (l = t.md.normalizeLink(u.str), t.md.validateLink(l) ? i = u.pos : l = ""), a = i; i < p && (r = t.src.charCodeAt(i), st(r) || 10 === r); i++);
                    if (u = t.md.helpers.parseLinkTitle(t.src, i, t.posMax), i < p && a !== i && u.ok)
                        for (c = u.str, i = u.pos; i < p && (r = t.src.charCodeAt(i), st(r) || 10 === r); i++);
                    else c = "";
                    if (i >= p || 41 !== t.src.charCodeAt(i)) return t.pos = h, !1;
                    i++
                } else {
                    if (void 0 === t.env.references) return !1;
                    if (i < p && 91 === t.src.charCodeAt(i) ? (a = i + 1, i = t.md.helpers.parseLinkLabel(t, i), i >= 0 ? s = t.src.slice(a, i++) : i = d + 1) : i = d + 1, s || (s = t.src.slice(f, d)), o = t.env.references[ct(s)], !o) return t.pos = h, !1;
                    l = o.href, c = o.title
                }
                if (!e) {
                    n = t.src.slice(f, d);
                    const e = [];
                    t.md.inline.parse(n, t.md, t.env, e);
                    const r = t.push("image", "img", 0),
                        s = [
                            ["src", l],
                            ["alt", ""]
                        ];
                    r.attrs = s, r.children = e, r.content = n, c && s.push(["title", c])
                }
                return t.pos = i, t.posMax = p, !0
            }],
            ["autolink", function(t, e) {
                let r = t.pos;
                if (60 !== t.src.charCodeAt(r)) return !1;
                const n = t.pos,
                    s = t.posMax;
                for (;;) {
                    if (++r >= s) return !1;
                    const e = t.src.charCodeAt(r);
                    if (60 === e) return !1;
                    if (62 === e) break
                }
                const i = t.src.slice(n + 1, r);
                if (ee.test(i)) {
                    const r = t.md.normalizeLink(i);
                    if (!t.md.validateLink(r)) return !1;
                    if (!e) {
                        const e = t.push("link_open", "a", 1);
                        e.attrs = [
                            ["href", r]
                        ], e.markup = "autolink", e.info = "auto";
                        t.push("text", "", 0).content = t.md.normalizeLinkText(i);
                        const n = t.push("link_close", "a", -1);
                        n.markup = "autolink", n.info = "auto"
                    }
                    return t.pos += i.length + 2, !0
                }
                if (te.test(i)) {
                    const r = t.md.normalizeLink("mailto:" + i);
                    if (!t.md.validateLink(r)) return !1;
                    if (!e) {
                        const e = t.push("link_open", "a", 1);
                        e.attrs = [
                            ["href", r]
                        ], e.markup = "autolink", e.info = "auto";
                        t.push("text", "", 0).content = t.md.normalizeLinkText(i);
                        const n = t.push("link_close", "a", -1);
                        n.markup = "autolink", n.info = "auto"
                    }
                    return t.pos += i.length + 2, !0
                }
                return !1
            }],
            ["html_inline", function(t, e) {
                if (!t.md.options.html) return !1;
                const r = t.posMax,
                    n = t.pos;
                if (60 !== t.src.charCodeAt(n) || n + 2 >= r) return !1;
                const s = t.src.charCodeAt(n + 1);
                if (33 !== s && 63 !== s && 47 !== s && ! function(t) {
                        const e = 32 | t;
                        return e >= 97 && e <= 122
                    }(s)) return !1;
                const i = t.src.slice(n).match(jt);
                if (!i) return !1;
                if (!e) {
                    const e = t.push("html_inline", "", 0);
                    e.content = i[0], o = e.content, /^<a[>\s]/i.test(o) && t.linkLevel++,
                        function(t) {
                            return /^<\/a\s*>/i.test(t)
                        }(e.content) && t.linkLevel--
                }
                var o;
                return t.pos += i[0].length, !0
            }],
            ["entity", function(t, e) {
                const r = t.pos,
                    n = t.posMax;
                if (38 !== t.src.charCodeAt(r)) return !1;
                if (r + 1 >= n) return !1;
                if (35 === t.src.charCodeAt(r + 1)) {
                    const n = t.src.slice(r).match(re);
                    if (n) {
                        if (!e) {
                            const e = "x" === n[1][0].toLowerCase() ? parseInt(n[1].slice(1), 16) : parseInt(n[1], 10),
                                r = t.push("text_special", "", 0);
                            r.content = V(e) ? G(e) : G(65533), r.markup = n[0], r.info = "entity"
                        }
                        return t.pos += n[0].length, !0
                    }
                } else {
                    const n = t.src.slice(r).match(ne);
                    if (n) {
                        const r = j(n[0]);
                        if (r !== n[0]) {
                            if (!e) {
                                const e = t.push("text_special", "", 0);
                                e.content = r, e.markup = n[0], e.info = "entity"
                            }
                            return t.pos += n[0].length, !0
                        }
                    }
                }
                return !1
            }]
        ],
        oe = [
            ["balance_pairs", function(t) {
                const e = t.tokens_meta,
                    r = t.tokens_meta.length;
                se(t.delimiters);
                for (let t = 0; t < r; t++) e[t] && e[t].delimiters && se(e[t].delimiters)
            }],
            ["strikethrough", Xt.postProcess],
            ["emphasis", Kt.postProcess],
            ["fragments_join", function(t) {
                let e, r, n = 0;
                const s = t.tokens,
                    i = t.tokens.length;
                for (e = r = 0; e < i; e++) s[e].nesting < 0 && n--, s[e].level = n, s[e].nesting > 0 && n++, "text" === s[e].type && e + 1 < i && "text" === s[e + 1].type ? s[e + 1].content = s[e].content + s[e + 1].content : (e !== r && (s[r] = s[e]), r++);
                e !== r && (s.length = r)
            }]
        ];

    function ue() {
        this.ruler = new dt;
        for (let t = 0; t < ie.length; t++) this.ruler.push(ie[t][0], ie[t][1]);
        this.ruler2 = new dt;
        for (let t = 0; t < oe.length; t++) this.ruler2.push(oe[t][0], oe[t][1])
    }

    function ce(t) {
        return Array.prototype.slice.call(arguments, 1).forEach((function(e) {
            e && Object.keys(e).forEach((function(r) {
                t[r] = e[r]
            }))
        })), t
    }

    function ae(t) {
        return Object.prototype.toString.call(t)
    }

    function le(t) {
        return "[object Function]" === ae(t)
    }

    function he(t) {
        return t.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&")
    }
    ue.prototype.skipToken = function(t) {
        const e = t.pos,
            r = this.ruler.getRules(""),
            n = r.length,
            s = t.md.options.maxNesting,
            i = t.cache;
        if (void 0 !== i[e]) return void(t.pos = i[e]);
        let o = !1;
        if (t.level < s) {
            for (let s = 0; s < n; s++)
                if (t.level++, o = r[s](t, !0), t.level--, o) {
                    if (e >= t.pos) throw new Error("inline rule didn't increment state.pos");
                    break
                }
        } else t.pos = t.posMax;
        o || t.pos++, i[e] = t.pos
    }, ue.prototype.tokenize = function(t) {
        const e = this.ruler.getRules(""),
            r = e.length,
            n = t.posMax,
            s = t.md.options.maxNesting;
        for (; t.pos < n;) {
            const i = t.pos;
            let o = !1;
            if (t.level < s)
                for (let n = 0; n < r; n++)
                    if (o = e[n](t, !1), o) {
                        if (i >= t.pos) throw new Error("inline rule didn't increment state.pos");
                        break
                    } if (o) {
                if (t.pos >= n) break
            } else t.pending += t.src[t.pos++]
        }
        t.pending && t.pushPending()
    }, ue.prototype.parse = function(t, e, r, n) {
        const s = new this.State(t, e, r, n);
        this.tokenize(s);
        const i = this.ruler2.getRules(""),
            o = i.length;
        for (let t = 0; t < o; t++) i[t](s)
    }, ue.prototype.State = Vt;
    const pe = {
        fuzzyLink: !0,
        fuzzyEmail: !0,
        fuzzyIP: !1
    };
    const fe = {
            "http:": {
                validate: function(t, e, r) {
                    const n = t.slice(e);
                    return r.re.http || (r.re.http = new RegExp("^\\/\\/" + r.re.src_auth + r.re.src_host_port_strict + r.re.src_path, "i")), r.re.http.test(n) ? n.match(r.re.http)[0].length : 0
                }
            },
            "https:": "http:",
            "ftp:": "http:",
            "//": {
                validate: function(t, e, r) {
                    const n = t.slice(e);
                    return r.re.no_http || (r.re.no_http = new RegExp("^" + r.re.src_auth + "(?:localhost|(?:(?:" + r.re.src_domain + ")\\.)+" + r.re.src_domain_root + ")" + r.re.src_port + r.re.src_host_terminator + r.re.src_path, "i")), r.re.no_http.test(n) ? e >= 3 && ":" === t[e - 3] || e >= 3 && "/" === t[e - 3] ? 0 : n.match(r.re.no_http)[0].length : 0
                }
            },
            "mailto:": {
                validate: function(t, e, r) {
                    const n = t.slice(e);
                    return r.re.mailto || (r.re.mailto = new RegExp("^" + r.re.src_email_name + "@" + r.re.src_host_strict, "i")), r.re.mailto.test(n) ? n.match(r.re.mailto)[0].length : 0
                }
            }
        },
        de = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",
        _e = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");

    function me(t) {
        const e = t.re = function(t) {
                const e = {};
                t = t || {}, e.src_Any = C.source, e.src_Cc = y.source, e.src_Z = b.source, e.src_P = E.source, e.src_ZPCc = [e.src_Z, e.src_P, e.src_Cc].join("|"), e.src_ZCc = [e.src_Z, e.src_Cc].join("|");
                const r = "[><\uff5c]";
                return e.src_pseudo_letter = "(?:(?![><\uff5c]|" + e.src_ZPCc + ")" + e.src_Any + ")", e.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", e.src_auth = "(?:(?:(?!" + e.src_ZCc + "|[@/\\[\\]()]).)+@)?", e.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", e.src_host_terminator = "(?=$|[><\uff5c]|" + e.src_ZPCc + ")(?!" + (t["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + e.src_ZPCc + "))", e.src_path = "(?:[/?#](?:(?!" + e.src_ZCc + "|" + r + "|[()[\\]{}.,\"'?!\\-;]).|\\[(?:(?!" + e.src_ZCc + "|\\]).)*\\]|\\((?:(?!" + e.src_ZCc + "|[)]).)*\\)|\\{(?:(?!" + e.src_ZCc + '|[}]).)*\\}|\\"(?:(?!' + e.src_ZCc + '|["]).)+\\"|\\\'(?:(?!' + e.src_ZCc + "|[']).)+\\'|\\'(?=" + e.src_pseudo_letter + "|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!" + e.src_ZCc + "|[.]|$)|" + (t["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + ",(?!" + e.src_ZCc + "|$)|;(?!" + e.src_ZCc + "|$)|\\!+(?!" + e.src_ZCc + "|[!]|$)|\\?(?!" + e.src_ZCc + "|[?]|$))+|\\/)?", e.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*', e.src_xn = "xn--[a-z0-9\\-]{1,59}", e.src_domain_root = "(?:" + e.src_xn + "|" + e.src_pseudo_letter + "{1,63})", e.src_domain = "(?:" + e.src_xn + "|(?:" + e.src_pseudo_letter + ")|(?:" + e.src_pseudo_letter + "(?:-|" + e.src_pseudo_letter + "){0,61}" + e.src_pseudo_letter + "))", e.src_host = "(?:(?:(?:(?:" + e.src_domain + ")\\.)*" + e.src_domain + "))", e.tpl_host_fuzzy = "(?:" + e.src_ip4 + "|(?:(?:(?:" + e.src_domain + ")\\.)+(?:%TLDS%)))", e.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + e.src_domain + ")\\.)+(?:%TLDS%))", e.src_host_strict = e.src_host + e.src_host_terminator, e.tpl_host_fuzzy_strict = e.tpl_host_fuzzy + e.src_host_terminator, e.src_host_port_strict = e.src_host + e.src_port + e.src_host_terminator, e.tpl_host_port_fuzzy_strict = e.tpl_host_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_port_no_ip_fuzzy_strict = e.tpl_host_no_ip_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + e.src_ZPCc + "|>|$))", e.tpl_email_fuzzy = '(^|[><\uff5c]|"|\\(|' + e.src_ZCc + ")(" + e.src_email_name + "@" + e.tpl_host_fuzzy_strict + ")", e.tpl_link_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + e.src_ZPCc + "))((?![$+<=>^`|\uff5c])" + e.tpl_host_port_fuzzy_strict + e.src_path + ")", e.tpl_link_no_ip_fuzzy = "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|" + e.src_ZPCc + "))((?![$+<=>^`|\uff5c])" + e.tpl_host_port_no_ip_fuzzy_strict + e.src_path + ")", e
            }(t.__opts__),
            r = t.__tlds__.slice();

        function n(t) {
            return t.replace("%TLDS%", e.src_tlds)
        }
        t.onCompile(), t.__tlds_replaced__ || r.push(de), r.push(e.src_xn), e.src_tlds = r.join("|"), e.email_fuzzy = RegExp(n(e.tpl_email_fuzzy), "i"), e.link_fuzzy = RegExp(n(e.tpl_link_fuzzy), "i"), e.link_no_ip_fuzzy = RegExp(n(e.tpl_link_no_ip_fuzzy), "i"), e.host_fuzzy_test = RegExp(n(e.tpl_host_fuzzy_test), "i");
        const s = [];

        function i(t, e) {
            throw new Error('(LinkifyIt) Invalid schema "' + t + '": ' + e)
        }
        t.__compiled__ = {}, Object.keys(t.__schemas__).forEach((function(e) {
            const r = t.__schemas__[e];
            if (null === r) return;
            const n = {
                validate: null,
                link: null
            };
            if (t.__compiled__[e] = n, "[object Object]" === ae(r)) return ! function(t) {
                return "[object RegExp]" === ae(t)
            }(r.validate) ? le(r.validate) ? n.validate = r.validate : i(e, r) : n.validate = function(t) {
                return function(e, r) {
                    const n = e.slice(r);
                    return t.test(n) ? n.match(t)[0].length : 0
                }
            }(r.validate), void(le(r.normalize) ? n.normalize = r.normalize : r.normalize ? i(e, r) : n.normalize = function(t, e) {
                e.normalize(t)
            });
            ! function(t) {
                return "[object String]" === ae(t)
            }(r) ? i(e, r): s.push(e)
        })), s.forEach((function(e) {
            t.__compiled__[t.__schemas__[e]] && (t.__compiled__[e].validate = t.__compiled__[t.__schemas__[e]].validate, t.__compiled__[e].normalize = t.__compiled__[t.__schemas__[e]].normalize)
        })), t.__compiled__[""] = {
            validate: null,
            normalize: function(t, e) {
                e.normalize(t)
            }
        };
        const o = Object.keys(t.__compiled__).filter((function(e) {
            return e.length > 0 && t.__compiled__[e]
        })).map(he).join("|");
        t.re.schema_test = RegExp("(^|(?!_)(?:[><\uff5c]|" + e.src_ZPCc + "))(" + o + ")", "i"), t.re.schema_search = RegExp("(^|(?!_)(?:[><\uff5c]|" + e.src_ZPCc + "))(" + o + ")", "ig"), t.re.schema_at_start = RegExp("^" + t.re.schema_search.source, "i"), t.re.pretest = RegExp("(" + t.re.schema_test.source + ")|(" + t.re.host_fuzzy_test.source + ")|@", "i"),
            function(t) {
                t.__index__ = -1, t.__text_cache__ = ""
            }(t)
    }

    function ge(t, e) {
        const r = t.__index__,
            n = t.__last_index__,
            s = t.__text_cache__.slice(r, n);
        this.schema = t.__schema__.toLowerCase(), this.index = r + e, this.lastIndex = n + e, this.raw = s, this.text = s, this.url = s
    }

    function ke(t, e) {
        const r = new ge(t, e);
        return t.__compiled__[r.schema].normalize(r, t), r
    }

    function De(t, e) {
        if (!(this instanceof De)) return new De(t, e);
        var r;
        e || (r = t, Object.keys(r || {}).reduce((function(t, e) {
            return t || pe.hasOwnProperty(e)
        }), !1) && (e = t, t = {})), this.__opts__ = ce({}, pe, e), this.__index__ = -1, this.__last_index__ = -1, this.__schema__ = "", this.__text_cache__ = "", this.__schemas__ = ce({}, fe, t), this.__compiled__ = {}, this.__tlds__ = _e, this.__tlds_replaced__ = !1, this.re = {}, me(this)
    }
    De.prototype.add = function(t, e) {
        return this.__schemas__[t] = e, me(this), this
    }, De.prototype.set = function(t) {
        return this.__opts__ = ce(this.__opts__, t), this
    }, De.prototype.test = function(t) {
        if (this.__text_cache__ = t, this.__index__ = -1, !t.length) return !1;
        let e, r, n, s, i, o, u, c, a;
        if (this.re.schema_test.test(t))
            for (u = this.re.schema_search, u.lastIndex = 0; null !== (e = u.exec(t));)
                if (s = this.testSchemaAt(t, e[2], u.lastIndex), s) {
                    this.__schema__ = e[2], this.__index__ = e.index + e[1].length, this.__last_index__ = e.index + e[0].length + s;
                    break
                } return this.__opts__.fuzzyLink && this.__compiled__["http:"] && (c = t.search(this.re.host_fuzzy_test), c >= 0 && (this.__index__ < 0 || c < this.__index__) && null !== (r = t.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) && (i = r.index + r[1].length, (this.__index__ < 0 || i < this.__index__) && (this.__schema__ = "", this.__index__ = i, this.__last_index__ = r.index + r[0].length))), this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && (a = t.indexOf("@"), a >= 0 && null !== (n = t.match(this.re.email_fuzzy)) && (i = n.index + n[1].length, o = n.index + n[0].length, (this.__index__ < 0 || i < this.__index__ || i === this.__index__ && o > this.__last_index__) && (this.__schema__ = "mailto:", this.__index__ = i, this.__last_index__ = o))), this.__index__ >= 0
    }, De.prototype.pretest = function(t) {
        return this.re.pretest.test(t)
    }, De.prototype.testSchemaAt = function(t, e, r) {
        return this.__compiled__[e.toLowerCase()] ? this.__compiled__[e.toLowerCase()].validate(t, r, this) : 0
    }, De.prototype.match = function(t) {
        const e = [];
        let r = 0;
        this.__index__ >= 0 && this.__text_cache__ === t && (e.push(ke(this, r)), r = this.__last_index__);
        let n = r ? t.slice(r) : t;
        for (; this.test(n);) e.push(ke(this, r)), n = n.slice(this.__last_index__), r += this.__last_index__;
        return e.length ? e : null
    }, De.prototype.matchAtStart = function(t) {
        if (this.__text_cache__ = t, this.__index__ = -1, !t.length) return null;
        const e = this.re.schema_at_start.exec(t);
        if (!e) return null;
        const r = this.testSchemaAt(t, e[2], e[0].length);
        return r ? (this.__schema__ = e[2], this.__index__ = e.index + e[1].length, this.__last_index__ = e.index + e[0].length + r, ke(this, 0)) : null
    }, De.prototype.tlds = function(t, e) {
        return t = Array.isArray(t) ? t : [t], e ? (this.__tlds__ = this.__tlds__.concat(t).sort().filter((function(t, e, r) {
            return t !== r[e - 1]
        })).reverse(), me(this), this) : (this.__tlds__ = t.slice(), this.__tlds_replaced__ = !0, me(this), this)
    }, De.prototype.normalize = function(t) {
        t.schema || (t.url = "http://" + t.url), "mailto:" !== t.schema || /^mailto:/i.test(t.url) || (t.url = "mailto:" + t.url)
    }, De.prototype.onCompile = function() {};
    const Ce = 2147483647,
        ye = 36,
        Ee = /^xn--/,
        Ae = /[^\0-\x7F]/,
        be = /[\x2E\u3002\uFF0E\uFF61]/g,
        Fe = {
            overflow: "Overflow: input needs wider integers to process",
            "not-basic": "Illegal input >= 0x80 (not a basic code point)",
            "invalid-input": "Invalid input"
        },
        xe = Math.floor,
        we = String.fromCharCode;

    function ve(t) {
        throw new RangeError(Fe[t])
    }

    function ze(t, e) {
        const r = t.split("@");
        let n = "";
        r.length > 1 && (n = r[0] + "@", t = r[1]);
        const s = function(t, e) {
            const r = [];
            let n = t.length;
            for (; n--;) r[n] = e(t[n]);
            return r
        }((t = t.replace(be, ".")).split("."), e).join(".");
        return n + s
    }

    function Se(t) {
        const e = [];
        let r = 0;
        const n = t.length;
        for (; r < n;) {
            const s = t.charCodeAt(r++);
            if (s >= 55296 && s <= 56319 && r < n) {
                const n = t.charCodeAt(r++);
                56320 == (64512 & n) ? e.push(((1023 & s) << 10) + (1023 & n) + 65536) : (e.push(s), r--)
            } else e.push(s)
        }
        return e
    }
    const qe = function(t, e) {
            return t + 22 + 75 * (t < 26) - ((0 != e) << 5)
        },
        Be = function(t, e, r) {
            let n = 0;
            for (t = r ? xe(t / 700) : t >> 1, t += xe(t / e); t > 455; n += ye) t = xe(t / 35);
            return xe(n + 36 * t / (t + 38))
        },
        Le = function(t) {
            const e = [],
                r = t.length;
            let n = 0,
                s = 128,
                i = 72,
                o = t.lastIndexOf("-");
            o < 0 && (o = 0);
            for (let r = 0; r < o; ++r) t.charCodeAt(r) >= 128 && ve("not-basic"), e.push(t.charCodeAt(r));
            for (let c = o > 0 ? o + 1 : 0; c < r;) {
                const o = n;
                for (let e = 1, s = ye;; s += ye) {
                    c >= r && ve("invalid-input");
                    const o = (u = t.charCodeAt(c++)) >= 48 && u < 58 ? u - 48 + 26 : u >= 65 && u < 91 ? u - 65 : u >= 97 && u < 123 ? u - 97 : ye;
                    o >= ye && ve("invalid-input"), o > xe((Ce - n) / e) && ve("overflow"), n += o * e;
                    const a = s <= i ? 1 : s >= i + 26 ? 26 : s - i;
                    if (o < a) break;
                    const l = ye - a;
                    e > xe(Ce / l) && ve("overflow"), e *= l
                }
                const a = e.length + 1;
                i = Be(n - o, a, 0 == o), xe(n / a) > Ce - s && ve("overflow"), s += xe(n / a), n %= a, e.splice(n++, 0, s)
            }
            var u;
            return String.fromCodePoint(...e)
        },
        Ie = function(t) {
            const e = [],
                r = (t = Se(t)).length;
            let n = 128,
                s = 0,
                i = 72;
            for (const r of t) r < 128 && e.push(we(r));
            const o = e.length;
            let u = o;
            for (o && e.push("-"); u < r;) {
                let r = Ce;
                for (const e of t) e >= n && e < r && (r = e);
                const c = u + 1;
                r - n > xe((Ce - s) / c) && ve("overflow"), s += (r - n) * c, n = r;
                for (const r of t)
                    if (r < n && ++s > Ce && ve("overflow"), r === n) {
                        let t = s;
                        for (let r = ye;; r += ye) {
                            const n = r <= i ? 1 : r >= i + 26 ? 26 : r - i;
                            if (t < n) break;
                            const s = t - n,
                                o = ye - n;
                            e.push(we(qe(n + s % o, 0))), t = xe(s / o)
                        }
                        e.push(we(qe(t, 0))), i = Be(s, c, u === o), s = 0, ++u
                    }++ s, ++n
            }
            return e.join("")
        },
        Me = {
            version: "2.3.1",
            ucs2: {
                decode: Se,
                encode: t => String.fromCodePoint(...t)
            },
            decode: Le,
            encode: Ie,
            toASCII: function(t) {
                return ze(t, (function(t) {
                    return Ae.test(t) ? "xn--" + Ie(t) : t
                }))
            },
            toUnicode: function(t) {
                return ze(t, (function(t) {
                    return Ee.test(t) ? Le(t.slice(4).toLowerCase()) : t
                }))
            }
        };
    const Te = {
            default: {
                options: {
                    html: !1,
                    xhtmlOut: !1,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: 1,
                    typographer: 1,
                    quotes: "\u201c\u201d\u2018\u2019",
                    highlight: null,
                    maxNesting: 100
                },
                components: {
                    core: {},
                    block: {},
                    inline: {}
                }
            },
            zero: {
                options: {
                    html: !1,
                    xhtmlOut: !1,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: 1,
                    typographer: 1,
                    quotes: "\u201c\u201d\u2018\u2019",
                    highlight: null,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ["normalize", "block", "inline", "text_join"]
                    },
                    block: {
                        rules: ["paragraph"]
                    },
                    inline: {
                        rules: ["text"],
                        rules2: ["balance_pairs", "fragments_join"]
                    }
                }
            },
            commonmark: {
                options: {
                    html: !0,
                    xhtmlOut: !0,
                    breaks: !1,
                    langPrefix: "language-",
                    linkify: !1,
                    typographer: !1,
                    quotes: "\u201c\u201d\u2018\u2019",
                    highlight: null,
                    maxNesting: 20
                },
                components: {
                    core: {
                        rules: ["normalize", "block", "inline", "text_join"]
                    },
                    block: {
                        rules: ["blockquote", "code", "fence", "heading", "hr", "html_block", "lheading", "list", "reference", "paragraph"]
                    },
                    inline: {
                        rules: ["autolink", "backticks", "emphasis", "entity", "escape", "html_inline", "image", "link", "newline", "text"],
                        rules2: ["balance_pairs", "emphasis", "fragments_join"]
                    }
                }
            }
        },
        Re = /^(vbscript|javascript|file|data):/,
        Ne = /^data:image\/(gif|png|jpeg|webp);/;

    function Pe(t) {
        const e = t.trim().toLowerCase();
        return !Re.test(e) || Ne.test(e)
    }
    const Oe = ["http:", "https:", "mailto:"];

    function je(t) {
        const e = g(t, !0);
        if (e.hostname && (!e.protocol || Oe.indexOf(e.protocol) >= 0)) try {
            e.hostname = Me.toASCII(e.hostname)
        } catch (t) {}
        return n(s(e))
    }

    function Ze(t) {
        const r = g(t, !0);
        if (r.hostname && (!r.protocol || Oe.indexOf(r.protocol) >= 0)) try {
            r.hostname = Me.toUnicode(r.hostname)
        } catch (t) {}
        return e(s(r), e.defaultChars + "%")
    }

    function $e(t, e) {
        if (!(this instanceof $e)) return new $e(t, e);
        e || Z(t) || (e = t || {}, t = "default"), this.inline = new ue, this.block = new Ht, this.core = new Lt, this.renderer = new ft, this.linkify = new De, this.validateLink = Pe, this.normalizeLink = je, this.normalizeLinkText = Ze, this.utils = lt, this.helpers = U({}, ht), this.options = {}, this.configure(t), e && this.set(e)
    }
    return $e.prototype.set = function(t) {
        return U(this.options, t), this
    }, $e.prototype.configure = function(t) {
        const e = this;
        if (Z(t)) {
            const e = t;
            if (!(t = Te[e])) throw new Error('Wrong `janus` preset "' + e + '", check name')
        }
        if (!t) throw new Error("Wrong `janus` preset, can't be empty");
        return t.options && e.set(t.options), t.components && Object.keys(t.components).forEach((function(r) {
            t.components[r].rules && e[r].ruler.enableOnly(t.components[r].rules), t.components[r].rules2 && e[r].ruler2.enableOnly(t.components[r].rules2)
        })), this
    }, $e.prototype.enable = function(t, e) {
        let r = [];
        Array.isArray(t) || (t = [t]), ["core", "block", "inline"].forEach((function(e) {
            r = r.concat(this[e].ruler.enable(t, !0))
        }), this), r = r.concat(this.inline.ruler2.enable(t, !0));
        const n = t.filter((function(t) {
            return r.indexOf(t) < 0
        }));
        if (n.length && !e) throw new Error("janus. Failed to enable unknown rule(s): " + n);
        return this
    }, $e.prototype.disable = function(t, e) {
        let r = [];
        Array.isArray(t) || (t = [t]), ["core", "block", "inline"].forEach((function(e) {
            r = r.concat(this[e].ruler.disable(t, !0))
        }), this), r = r.concat(this.inline.ruler2.disable(t, !0));
        const n = t.filter((function(t) {
            return r.indexOf(t) < 0
        }));
        if (n.length && !e) throw new Error("janus. Failed to disable unknown rule(s): " + n);
        return this
    }, $e.prototype.use = function(t) {
        const e = [this].concat(Array.prototype.slice.call(arguments, 1));
        return t.apply(t, e), this
    }, $e.prototype.parse = function(t, e) {
        if ("string" != typeof t) throw new Error("Input data should be a String");
        const r = new this.core.State(t, this, e);
        return this.core.process(r), r.tokens
    }, $e.prototype.render = function(t, e) {
        return e = e || {}, this.renderer.render(this.parse(t, e), this.options, e)
    }, $e.prototype.parseInline = function(t, e) {
        const r = new this.core.State(t, this, e);
        return r.inlineMode = !0, this.core.process(r), r.tokens
    }, $e.prototype.renderInline = function(t, e) {
        return e = e || {}, this.renderer.render(this.parseInline(t, e), this.options, e)
    }, $e
}));

! function(e, o) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = o() : "function" == typeof define && define.amd ? define(o) : (e = "undefined" != typeof globalThis ? globalThis : e || self).janusFootnote = o()
}(this, (function() {
    "use strict";

    function e(e, o, t, n) {
        const r = Number(e[o].meta.id + 1).toString();
        let s = "";
        return "string" == typeof n.docId && (s = `-${n.docId}-`), s + r
    }

    function o(e, o) {
        let t = Number(e[o].meta.id + 1).toString();
        return e[o].meta.subId > 0 && (t += `:${e[o].meta.subId}`), `[${t}]`
    }

    function t(e, o, t, n, r) {
        const s = r.rules.footnote_anchor_name(e, o, t, n, r),
            f = r.rules.footnote_caption(e, o, t, n, r);
        let l = s;
        return e[o].meta.subId > 0 && (l += `:${e[o].meta.subId}`), `<sup class="footnote-ref"><a href="#fn${s}" id="fnref${l}">${f}</a></sup>`
    }

    function n(e, o, t) {
        return (t.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') + '<section class="footnotes">\n<ol class="footnotes-list">\n'
    }

    function r() {
        return "</ol>\n</section>\n"
    }

    function s(e, o, t, n, r) {
        let s = r.rules.footnote_anchor_name(e, o, t, n, r);
        return e[o].meta.subId > 0 && (s += `:${e[o].meta.subId}`), `<li id="fn${s}" class="footnote-item">`
    }

    function f() {
        return "</li>\n"
    }

    function l(e, o, t, n, r) {
        let s = r.rules.footnote_anchor_name(e, o, t, n, r);
        return e[o].meta.subId > 0 && (s += `:${e[o].meta.subId}`), ` <a href="#fnref${s}" class="footnote-backref">^\ufe0e</a>`
    }
    return function(c) {
        const i = c.helpers.parseLinkLabel,
            u = c.utils.isSpace;
        c.renderer.rules.footnote_ref = t, c.renderer.rules.footnote_block_open = n, c.renderer.rules.footnote_block_close = r, c.renderer.rules.footnote_open = s, c.renderer.rules.footnote_close = f, c.renderer.rules.footnote_anchor = l, c.renderer.rules.footnote_caption = o, c.renderer.rules.footnote_anchor_name = e, c.block.ruler.before("reference", "footnote_def", (function(e, o, t, n) {
            const r = e.bMarks[o] + e.tShift[o],
                s = e.eMarks[o];
            if (r + 4 > s) return !1;
            if (91 !== e.src.charCodeAt(r)) return !1;
            if (94 !== e.src.charCodeAt(r + 1)) return !1;
            let f;
            for (f = r + 2; f < s; f++) {
                if (32 === e.src.charCodeAt(f)) return !1;
                if (93 === e.src.charCodeAt(f)) break
            }
            if (f === r + 2) return !1;
            if (f + 1 >= s || 58 !== e.src.charCodeAt(++f)) return !1;
            if (n) return !0;
            f++, e.env.footnotes || (e.env.footnotes = {}), e.env.footnotes.refs || (e.env.footnotes.refs = {});
            const l = e.src.slice(r + 2, f - 2);
            e.env.footnotes.refs[`:${l}`] = -1;
            const c = new e.Token("footnote_reference_open", "", 1);
            c.meta = {
                label: l
            }, c.level = e.level++, e.tokens.push(c);
            const i = e.bMarks[o],
                a = e.tShift[o],
                p = e.sCount[o],
                d = e.parentType,
                h = f,
                k = e.sCount[o] + f - (e.bMarks[o] + e.tShift[o]);
            let b = k;
            for (; f < s;) {
                const o = e.src.charCodeAt(f);
                if (!u(o)) break;
                9 === o ? b += 4 - b % 4 : b++, f++
            }
            e.tShift[o] = f - h, e.sCount[o] = b - k, e.bMarks[o] = h, e.blkIndent += 4, e.parentType = "footnote", e.sCount[o] < e.blkIndent && (e.sCount[o] += e.blkIndent), e.md.block.tokenize(e, o, t, !0), e.parentType = d, e.blkIndent -= 4, e.tShift[o] = a, e.sCount[o] = p, e.bMarks[o] = i;
            const _ = new e.Token("footnote_reference_close", "", -1);
            return _.level = --e.level, e.tokens.push(_), !0
        }), {
            alt: ["paragraph", "reference"]
        }), c.inline.ruler.after("image", "footnote_inline", (function(e, o) {
            const t = e.posMax,
                n = e.pos;
            if (n + 2 >= t) return !1;
            if (94 !== e.src.charCodeAt(n)) return !1;
            if (91 !== e.src.charCodeAt(n + 1)) return !1;
            const r = n + 2,
                s = i(e, n + 1);
            if (s < 0) return !1;
            if (!o) {
                e.env.footnotes || (e.env.footnotes = {}), e.env.footnotes.list || (e.env.footnotes.list = []);
                const o = e.env.footnotes.list.length,
                    t = [];
                e.md.inline.parse(e.src.slice(r, s), e.md, e.env, t);
                e.push("footnote_ref", "", 0).meta = {
                    id: o
                }, e.env.footnotes.list[o] = {
                    content: e.src.slice(r, s),
                    tokens: t
                }
            }
            return e.pos = s + 1, e.posMax = t, !0
        })), c.inline.ruler.after("footnote_inline", "footnote_ref", (function(e, o) {
            const t = e.posMax,
                n = e.pos;
            if (n + 3 > t) return !1;
            if (!e.env.footnotes || !e.env.footnotes.refs) return !1;
            if (91 !== e.src.charCodeAt(n)) return !1;
            if (94 !== e.src.charCodeAt(n + 1)) return !1;
            let r;
            for (r = n + 2; r < t; r++) {
                if (32 === e.src.charCodeAt(r)) return !1;
                if (10 === e.src.charCodeAt(r)) return !1;
                if (93 === e.src.charCodeAt(r)) break
            }
            if (r === n + 2) return !1;
            if (r >= t) return !1;
            r++;
            const s = e.src.slice(n + 2, r - 1);
            if (void 0 === e.env.footnotes.refs[`:${s}`]) return !1;
            if (!o) {
                let o;
                e.env.footnotes.list || (e.env.footnotes.list = []), e.env.footnotes.refs[`:${s}`] < 0 ? (o = e.env.footnotes.list.length, e.env.footnotes.list[o] = {
                    label: s,
                    count: 0
                }, e.env.footnotes.refs[`:${s}`] = o) : o = e.env.footnotes.refs[`:${s}`];
                const t = e.env.footnotes.list[o].count;
                e.env.footnotes.list[o].count++;
                e.push("footnote_ref", "", 0).meta = {
                    id: o,
                    subId: t,
                    label: s
                }
            }
            return e.pos = r, e.posMax = t, !0
        })), c.core.ruler.after("inline", "footnote_tail", (function(e) {
            let o, t, n, r = !1;
            const s = {};
            if (!e.env.footnotes) return;
            if (e.tokens = e.tokens.filter((function(e) {
                    return "footnote_reference_open" === e.type ? (r = !0, t = [], n = e.meta.label, !1) : "footnote_reference_close" === e.type ? (r = !1, s[":" + n] = t, !1) : (r && t.push(e), !r)
                })), !e.env.footnotes.list) return;
            const f = e.env.footnotes.list;
            e.tokens.push(new e.Token("footnote_block_open", "", 1));
            for (let t = 0, n = f.length; t < n; t++) {
                const n = new e.Token("footnote_open", "", 1);
                if (n.meta = {
                        id: t,
                        label: f[t].label
                    }, e.tokens.push(n), f[t].tokens) {
                    o = [];
                    const n = new e.Token("paragraph_open", "p", 1);
                    n.block = !0, o.push(n);
                    const r = new e.Token("inline", "", 0);
                    r.children = f[t].tokens, r.content = f[t].content, o.push(r);
                    const s = new e.Token("paragraph_close", "p", -1);
                    s.block = !0, o.push(s)
                } else f[t].label && (o = s[`:${f[t].label}`]);
                let r;
                o && (e.tokens = e.tokens.concat(o)), r = "paragraph_close" === e.tokens[e.tokens.length - 1].type ? e.tokens.pop() : null;
                const l = f[t].count > 0 ? f[t].count : 1;
                for (let o = 0; o < l; o++) {
                    const n = new e.Token("footnote_anchor", "", 0);
                    n.meta = {
                        id: t,
                        subId: o,
                        label: f[t].label
                    }, e.tokens.push(n)
                }
                r && e.tokens.push(r), e.tokens.push(new e.Token("footnote_close", "", -1))
            }
            e.tokens.push(new e.Token("footnote_block_close", "", -1))
        }))
    }
}));

! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).janusDeflist = e()
}(this, (function() {
    "use strict";
    return function(t) {
        const e = t.utils.isSpace;

        function n(t, e) {
            let n = t.bMarks[e] + t.tShift[e];
            const i = t.eMarks[e];
            if (n >= i) return -1;
            const o = t.src.charCodeAt(n++);
            if (126 !== o && 58 !== o) return -1;
            const r = t.skipSpaces(n);
            return n === r || r >= i ? -1 : n
        }
        t.block.ruler.before("paragraph", "deflist", (function(t, i, o, r) {
            if (r) return !(t.ddIndent < 0) && n(t, i) >= 0;
            let s = i + 1;
            if (s >= o) return !1;
            if (t.isEmpty(s) && (s++, s >= o)) return !1;
            if (t.sCount[s] < t.blkIndent) return !1;
            let d = n(t, s);
            if (d < 0) return !1;
            const l = t.tokens.length;
            let f = !0;
            const a = [i, 0];
            t.push("dl_open", "dl", 1).map = a;
            let p = i,
                u = s;
            t: for (;;) {
                let i = !1;
                t.push("dt_open", "dt", 1).map = [p, p];
                const r = t.push("inline", "", 0);
                for (r.map = [p, p], r.content = t.getLines(p, p + 1, t.blkIndent, !1).trim(), r.children = [], t.push("dt_close", "dt", -1);;) {
                    const r = [s, 0];
                    t.push("dd_open", "dd", 1).map = r;
                    let l = d;
                    const a = t.eMarks[u];
                    let p = t.sCount[u] + d - (t.bMarks[u] + t.tShift[u]);
                    for (; l < a;) {
                        const n = t.src.charCodeAt(l);
                        if (!e(n)) break;
                        9 === n ? p += 4 - p % 4 : p++, l++
                    }
                    d = l;
                    const c = t.tight,
                        k = t.ddIndent,
                        b = t.blkIndent,
                        h = t.tShift[u],
                        m = t.sCount[u],
                        g = t.parentType;
                    if (t.blkIndent = t.ddIndent = t.sCount[u] + 2, t.tShift[u] = d - t.bMarks[u], t.sCount[u] = p, t.tight = !0, t.parentType = "deflist", t.md.block.tokenize(t, u, o, !0), t.tight && !i || (f = !1), i = t.line - u > 1 && t.isEmpty(t.line - 1), t.tShift[u] = h, t.sCount[u] = m, t.tight = c, t.parentType = g, t.blkIndent = b, t.ddIndent = k, t.push("dd_close", "dd", -1), r[1] = s = t.line, s >= o) break t;
                    if (t.sCount[s] < t.blkIndent) break t;
                    if (d = n(t, s), d < 0) break;
                    u = s
                }
                if (s >= o) break;
                if (p = s, t.isEmpty(p)) break;
                if (t.sCount[p] < t.blkIndent) break;
                if (u = p + 1, u >= o) break;
                if (t.isEmpty(u) && u++, u >= o) break;
                if (t.sCount[u] < t.blkIndent) break;
                if (d = n(t, u), d < 0) break
            }
            return t.push("dl_close", "dl", -1), a[1] = s, t.line = s, f && function(t, e) {
                const n = t.level + 2;
                for (let i = e + 2, o = t.tokens.length - 2; i < o; i++) t.tokens[i].level === n && "paragraph_open" === t.tokens[i].type && (t.tokens[i + 2].hidden = !0, t.tokens[i].hidden = !0, i += 2)
            }(t, l), !0
        }), {
            alt: ["paragraph", "reference", "blockquote"]
        })
    }
}));

! function(n) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = n();
    else if ("function" == typeof define && define.amd) define([], n);
    else {
        var e;
        e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, e.janusTaskLists = n()
    }
}(function() {
    return function() {
        function n(e, t, i) {
            function r(c, l) {
                if (!t[c]) {
                    if (!e[c]) {
                        var f = "function" == typeof require && require;
                        if (!l && f) return f(c, !0);
                        if (o) return o(c, !0);
                        var u = new Error("Cannot find module '" + c + "'");
                        throw u.code = "MODULE_NOT_FOUND", u
                    }
                    var a = t[c] = {
                        exports: {}
                    };
                    e[c][0].call(a.exports, function(n) {
                        var t = e[c][1][n];
                        return r(t ? t : n)
                    }, a, a.exports, n, e, t, i)
                }
                return t[c].exports
            }
            for (var o = "function" == typeof require && require, c = 0; c < i.length; c++) r(i[c]);
            return r
        }
        return n
    }()({
        1: [function(n, e, t) {
            function i(n, e, t) {
                var i = n.attrIndex(e),
                    r = [e, t];
                0 > i ? n.attrPush(r) : n.attrs[i] = r
            }

            function r(n, e) {
                for (var t = n[e].level - 1, i = e - 1; i >= 0; i--)
                    if (n[i].level === t) return i;
                return -1
            }

            function o(n, e) {
                return s(n[e]) && d(n[e - 1]) && h(n[e - 2]) && p(n[e])
            }

            function c(n, e) {
                if (n.children.unshift(l(n, e)), n.children[1].content = n.children[1].content.slice(3), n.content = n.content.slice(3), b)
                    if (v) {
                        n.children.pop();
                        var t = "task-item-" + Math.ceil(1e7 * Math.random() - 1e3);
                        n.children[0].content = n.children[0].content.slice(0, -1) + ' id="' + t + '">', n.children.push(a(n.content, t, e))
                    } else n.children.unshift(f(e)), n.children.push(u(e))
            }

            function l(n, e) {
                var t = new e("html_inline", "", 0),
                    i = x ? ' disabled="" ' : "";
                return 0 === n.content.indexOf("[ ] ") ? t.content = '<input class="task-list-item-checkbox"' + i + 'type="checkbox">' : (0 === n.content.indexOf("[x] ") || 0 === n.content.indexOf("[X] ")) && (t.content = '<input class="task-list-item-checkbox" checked=""' + i + 'type="checkbox">'), t
            }

            function f(n) {
                var e = new n("html_inline", "", 0);
                return e.content = "<label>", e
            }

            function u(n) {
                var e = new n("html_inline", "", 0);
                return e.content = "</label>", e
            }

            function a(n, e, t) {
                var i = new t("html_inline", "", 0);
                return i.content = '<label class="task-list-item-label" for="' + e + '">' + n + "</label>", i.attrs = [{
                    "for": e
                }], i
            }

            function s(n) {
                return "inline" === n.type
            }

            function d(n) {
                return "paragraph_open" === n.type
            }

            function h(n) {
                return "list_item_open" === n.type
            }

            function p(n) {
                return 0 === n.content.indexOf("[ ] ") || 0 === n.content.indexOf("[x] ") || 0 === n.content.indexOf("[X] ")
            }
            var x = !0,
                b = !1,
                v = !1;
            e.exports = function(n, e) {
                e && (x = !e.enabled, b = !!e.label, v = !!e.labelAfter), n.core.ruler.after("inline", "github-task-lists", function(n) {
                    for (var e = n.tokens, t = 2; t < e.length; t++) o(e, t) && (c(e[t], n.Token), i(e[t - 2], "class", "task-list-item" + (x ? "" : " enabled")), i(e[r(e, t - 2)], "class", "contains-task-list"))
                })
            }
        }, {}]
    }, {}, [1])(1)
});

! function(e, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (e = "undefined" != typeof globalThis ? globalThis : e || self).janusMark = n()
}(this, (function() {
    "use strict";
    return function(e) {
        function n(e, n) {
            const t = [],
                o = n.length;
            for (let s = 0; s < o; s++) {
                const o = n[s];
                if (61 !== o.marker) continue;
                if (-1 === o.end) continue;
                const r = n[o.end],
                    i = e.tokens[o.token];
                i.type = "mark_open", i.tag = "mark", i.nesting = 1, i.markup = "==", i.content = "";
                const c = e.tokens[r.token];
                c.type = "mark_close", c.tag = "mark", c.nesting = -1, c.markup = "==", c.content = "", "text" === e.tokens[r.token - 1].type && "=" === e.tokens[r.token - 1].content && t.push(r.token - 1)
            }
            for (; t.length;) {
                const n = t.pop();
                let o = n + 1;
                for (; o < e.tokens.length && "mark_close" === e.tokens[o].type;) o++;
                if (o--, n !== o) {
                    const t = e.tokens[o];
                    e.tokens[o] = e.tokens[n], e.tokens[n] = t
                }
            }
        }
        e.inline.ruler.before("emphasis", "mark", (function(e, n) {
            const t = e.pos,
                o = e.src.charCodeAt(t);
            if (n) return !1;
            if (61 !== o) return !1;
            const s = e.scanDelims(e.pos, !0);
            let r = s.length;
            const i = String.fromCharCode(o);
            if (r < 2) return !1;
            if (r % 2) {
                e.push("text", "", 0).content = i, r--
            }
            for (let n = 0; n < r; n += 2) {
                e.push("text", "", 0).content = i + i, (s.can_open || s.can_close) && e.delimiters.push({
                    marker: o,
                    length: 0,
                    jump: n / 2,
                    token: e.tokens.length - 1,
                    end: -1,
                    open: s.can_open,
                    close: s.can_close
                })
            }
            return e.pos += s.length, !0
        })), e.inline.ruler2.before("emphasis", "mark", (function(e) {
            let t;
            const o = e.tokens_meta,
                s = (e.tokens_meta || []).length;
            for (n(e, e.delimiters), t = 0; t < s; t++) o[t] && o[t].delimiters && n(e, o[t].delimiters)
        }))
    }
}));

! function(e, s) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = s() : "function" == typeof define && define.amd ? define(s) : (e = "undefined" != typeof globalThis ? globalThis : e || self).janusSub = s()
}(this, (function() {
    "use strict";
    const e = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;

    function s(s, o) {
        const n = s.posMax,
            t = s.pos;
        if (126 !== s.src.charCodeAt(t)) return !1;
        if (o) return !1;
        if (t + 2 >= n) return !1;
        s.pos = t + 1;
        let r = !1;
        for (; s.pos < n;) {
            if (126 === s.src.charCodeAt(s.pos)) {
                r = !0;
                break
            }
            s.md.inline.skipToken(s)
        }
        if (!r || t + 1 === s.pos) return s.pos = t, !1;
        const p = s.src.slice(t + 1, s.pos);
        if (p.match(/(^|[^\\])(\\\\)*\s/)) return s.pos = t, !1;
        s.posMax = s.pos, s.pos = t + 1;
        s.push("sub_open", "sub", 1).markup = "~";
        s.push("text", "", 0).content = p.replace(e, "$1");
        return s.push("sub_close", "sub", -1).markup = "~", s.pos = s.posMax + 1, s.posMax = n, !0
    }
    return function(e) {
        e.inline.ruler.after("emphasis", "sub", s)
    }
}));

/*! janus-sup 2.0.0 https://github.com/janus/janus-sup @license MIT */
! function(e, s) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = s() : "function" == typeof define && define.amd ? define(s) : (e = "undefined" != typeof globalThis ? globalThis : e || self).janusSup = s()
}(this, (function() {
    "use strict";
    const e = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;

    function s(s, o) {
        const n = s.posMax,
            p = s.pos;
        if (94 !== s.src.charCodeAt(p)) return !1;
        if (o) return !1;
        if (p + 2 >= n) return !1;
        s.pos = p + 1;
        let t = !1;
        for (; s.pos < n;) {
            if (94 === s.src.charCodeAt(s.pos)) {
                t = !0;
                break
            }
            s.md.inline.skipToken(s)
        }
        if (!t || p + 1 === s.pos) return s.pos = p, !1;
        const r = s.src.slice(p + 1, s.pos);
        if (r.match(/(^|[^\\])(\\\\)*\s/)) return s.pos = p, !1;
        s.posMax = s.pos, s.pos = p + 1;
        s.push("sup_open", "sup", 1).markup = "^";
        s.push("text", "", 0).content = r.replace(e, "$1");
        return s.push("sup_close", "sup", -1).markup = "^", s.pos = s.posMax + 1, s.posMax = n, !0
    }
    return function(e) {
        e.inline.ruler.after("emphasis", "sup", s)
    }
}));

! function(e, n) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define(n) : (e || self).janusAnchor = n()
}(this, function() {
    var e = !1,
        n = {
            false: "push",
            true: "unshift",
            after: "push",
            before: "unshift"
        },
        t = {
            isPermalinkSymbol: !0
        };

    function r(r, i, a, l) {
        var o;
        if (!e) {
            var c = "Using deprecated janus-anchor permalink option, see https://github.com/valeriangalliat/janus-anchor#permalinks";
            "object" == typeof process && process && process.emitWarning ? process.emitWarning(c) : console.warn(c), e = !0
        }
        var s = [Object.assign(new a.Token("link_open", "a", 1), {
            attrs: [].concat(i.permalinkClass ? [
                ["class", i.permalinkClass]
            ] : [], [
                ["href", i.permalinkHref(r, a)]
            ], Object.entries(i.permalinkAttrs(r, a)))
        }), Object.assign(new a.Token("html_block", "", 0), {
            content: i.permalinkSymbol,
            meta: t
        }), new a.Token("link_close", "a", -1)];
        i.permalinkSpace && a.tokens[l + 1].children[n[i.permalinkBefore]](Object.assign(new a.Token("text", "", 0), {
            content: " "
        })), (o = a.tokens[l + 1].children)[n[i.permalinkBefore]].apply(o, s)
    }

    function i(e) {
        return "#" + e
    }

    function a(e) {
        return {}
    }
    var l = {
        class: "header-anchor",
        symbol: "#",
        renderHref: i,
        renderAttrs: a
    };

    function o(e) {
        function n(t) {
            return t = Object.assign({}, n.defaults, t),
                function(n, r, i, a) {
                    return e(n, t, r, i, a)
                }
        }
        return n.defaults = Object.assign({}, l), n.renderPermalinkImpl = e, n
    }
    var c = o(function(e, r, i, a, l) {
        var o, c = [Object.assign(new a.Token("link_open", "a", 1), {
            attrs: [].concat(r.class ? [
                ["class", r.class]
            ] : [], [
                ["href", r.renderHref(e, a)]
            ], r.ariaHidden ? [
                ["aria-hidden", "true"]
            ] : [], Object.entries(r.renderAttrs(e, a)))
        }), Object.assign(new a.Token("html_inline", "", 0), {
            content: r.symbol,
            meta: t
        }), new a.Token("link_close", "a", -1)];
        if (r.space) {
            var s = "string" == typeof r.space ? r.space : " ";
            a.tokens[l + 1].children[n[r.placement]](Object.assign(new a.Token("string" == typeof r.space ? "html_inline" : "text", "", 0), {
                content: s
            }))
        }(o = a.tokens[l + 1].children)[n[r.placement]].apply(o, c)
    });
    Object.assign(c.defaults, {
        space: !0,
        placement: "after",
        ariaHidden: !1
    });
    var s = o(c.renderPermalinkImpl);
    s.defaults = Object.assign({}, c.defaults, {
        ariaHidden: !0
    });
    var f = o(function(e, n, t, r, i) {
        var a = [Object.assign(new r.Token("link_open", "a", 1), {
            attrs: [].concat(n.class ? [
                ["class", n.class]
            ] : [], [
                ["href", n.renderHref(e, r)]
            ], Object.entries(n.renderAttrs(e, r)))
        })].concat(n.safariReaderFix ? [new r.Token("span_open", "span", 1)] : [], r.tokens[i + 1].children, n.safariReaderFix ? [new r.Token("span_close", "span", -1)] : [], [new r.Token("link_close", "a", -1)]);
        r.tokens[i + 1] = Object.assign(new r.Token("inline", "", 0), {
            children: a
        })
    });
    Object.assign(f.defaults, {
        safariReaderFix: !1
    });
    var u = o(function(e, r, i, a, l) {
        var o;
        if (!["visually-hidden", "aria-label", "aria-describedby", "aria-labelledby"].includes(r.style)) throw new Error("`permalink.linkAfterHeader` called with unknown style option `" + r.style + "`");
        if (!["aria-describedby", "aria-labelledby"].includes(r.style) && !r.assistiveText) throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `" + r.style + "` style");
        if ("visually-hidden" === r.style && !r.visuallyHiddenClass) throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");
        var c = a.tokens[l + 1].children.filter(function(e) {
                return "text" === e.type || "code_inline" === e.type
            }).reduce(function(e, n) {
                return e + n.content
            }, ""),
            s = [],
            f = [];
        if (r.class && f.push(["class", r.class]), f.push(["href", r.renderHref(e, a)]), f.push.apply(f, Object.entries(r.renderAttrs(e, a))), "visually-hidden" === r.style) {
            if (s.push(Object.assign(new a.Token("span_open", "span", 1), {
                    attrs: [
                        ["class", r.visuallyHiddenClass]
                    ]
                }), Object.assign(new a.Token("text", "", 0), {
                    content: r.assistiveText(c)
                }), new a.Token("span_close", "span", -1)), r.space) {
                var u = "string" == typeof r.space ? r.space : " ";
                s[n[r.placement]](Object.assign(new a.Token("string" == typeof r.space ? "html_inline" : "text", "", 0), {
                    content: u
                }))
            }
            s[n[r.placement]](Object.assign(new a.Token("span_open", "span", 1), {
                attrs: [
                    ["aria-hidden", "true"]
                ]
            }), Object.assign(new a.Token("html_inline", "", 0), {
                content: r.symbol,
                meta: t
            }), new a.Token("span_close", "span", -1))
        } else s.push(Object.assign(new a.Token("html_inline", "", 0), {
            content: r.symbol,
            meta: t
        }));
        "aria-label" === r.style ? f.push(["aria-label", r.assistiveText(c)]) : ["aria-describedby", "aria-labelledby"].includes(r.style) && f.push([r.style, e]);
        var d = [Object.assign(new a.Token("link_open", "a", 1), {
            attrs: f
        })].concat(s, [new a.Token("link_close", "a", -1)]);
        (o = a.tokens).splice.apply(o, [l + 3, 0].concat(d)), r.wrapper && (a.tokens.splice(l, 0, Object.assign(new a.Token("html_block", "", 0), {
            content: r.wrapper[0] + "\n"
        })), a.tokens.splice(l + 3 + d.length + 1, 0, Object.assign(new a.Token("html_block", "", 0), {
            content: r.wrapper[1] + "\n"
        })))
    });

    function d(e, n, t, r) {
        var i = e,
            a = r;
        if (t && Object.prototype.hasOwnProperty.call(n, i)) throw new Error("User defined `id` attribute `" + e + "` is not unique. Please fix it in your janus to continue.");
        for (; Object.prototype.hasOwnProperty.call(n, i);) i = e + "-" + a, a += 1;
        return n[i] = !0, i
    }

    function p(e, n) {
        n = Object.assign({}, p.defaults, n), e.core.ruler.push("anchor", function(e) {
            for (var t, i = {}, a = e.tokens, l = Array.isArray(n.level) ? (t = n.level, function(e) {
                    return t.includes(e)
                }) : function(e) {
                    return function(n) {
                        return n >= e
                    }
                }(n.level), o = 0; o < a.length; o++) {
                var c = a[o];
                if ("heading_open" === c.type && l(Number(c.tag.substr(1)))) {
                    var s = n.getTokensText(a[o + 1].children),
                        f = c.attrGet("id");
                    f = null == f ? d(n.slugify(s), i, !1, n.uniqueSlugStartIndex) : d(f, i, !0, n.uniqueSlugStartIndex), c.attrSet("id", f), !1 !== n.tabIndex && c.attrSet("tabindex", "" + n.tabIndex), "function" == typeof n.permalink ? n.permalink(f, n, e, o) : (n.permalink || n.renderPermalink && n.renderPermalink !== r) && n.renderPermalink(f, n, e, o), o = a.indexOf(c), n.callback && n.callback(c, {
                        slug: f,
                        title: s
                    })
                }
            }
        })
    }
    return Object.assign(u.defaults, {
        style: "visually-hidden",
        space: !0,
        placement: "after",
        wrapper: null
    }), p.permalink = {
        __proto__: null,
        legacy: r,
        renderHref: i,
        renderAttrs: a,
        makePermalink: o,
        linkInsideHeader: c,
        ariaHidden: s,
        headerLink: f,
        linkAfterHeader: u
    }, p.defaults = {
        level: 1,
        slugify: function(e) {
            return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g, "-"))
        },
        uniqueSlugStartIndex: 1,
        tabIndex: "-1",
        getTokensText: function(e) {
            return e.filter(function(e) {
                return ["text", "code_inline"].includes(e.type)
            }).map(function(e) {
                return e.content
            }).join("")
        },
        permalink: !1,
        renderPermalink: r,
        permalinkClass: s.defaults.class,
        permalinkSpace: s.defaults.space,
        permalinkSymbol: "¶",
        permalinkBefore: "before" === s.defaults.placement,
        permalinkHref: s.defaults.renderHref,
        permalinkAttrs: s.defaults.renderAttrs
    }, p.default = p, p
});

(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.janusAttrs = f()
    }
})(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }
        return r
    })()({
        1: [function(require, module, exports) {
            'use strict';

            function _typeof(o) {
                "@babel/helpers - typeof";
                return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
                    return typeof o;
                } : function(o) {
                    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
                }, _typeof(o);
            }
            var patternsConfig = require('./patterns.js');

            /**
             * @typedef {import('janus')} janus
             *
             * @typedef {import('janus/lib/rules_core/state_core.mjs').default} StateCore
             *
             * @typedef {import('janus/lib/token.mjs').default} Token
             *
             * @typedef {import('janus/lib/token.mjs').Nesting} Nesting
             *
             * @typedef {Object} Options
             * @property {!string} leftDelimiter left delimiter, default is `{`(left curly bracket)
             * @property {!string} rightDelimiter right delimiter, default is `}`(right curly bracket)
             * @property {AllowedAttribute[]} allowedAttributes empty means no limit
             *
             * @typedef {string|RegExp} AllowedAttribute rule of allowed attribute
             *
             * @typedef {[string, string]} AttributePair
             *
             * @typedef {[number, number]} SourceLineInfo
             *
             * @typedef {Object} CurlyAttrsPattern
             * @property {string} name
             * @property {DetectingRule[]} tests
             * @property {(tokens: Token[], i: number, j?: number) => void} transform
             *
             * @typedef {Object} MatchedResult
             * @property {boolean} match true means matched
             * @property {number?} j postion index number of Array<{@link Token}>
             *
             * @typedef {(str: string) => boolean} DetectingStrRule
             *
             * @typedef {Object} DetectingRule rule for testing {@link Token}'s properties
             * @property {number=} shift offset index number of Array<{@link Token}>
             * @property {number=} position fixed index number of Array<{@link Token}>
             * @property {(string | DetectingStrRule)=} type
             * @property {(string | DetectingStrRule)=} tag
             * @property {DetectingRule[]=} children
             * @property {(string | DetectingStrRule)=} content
             * @property {(string | DetectingStrRule)=} markup
             * @property {(string | DetectingStrRule)=} info
             * @property {Nesting=} nesting
             * @property {number=} level
             * @property {boolean=} block
             * @property {boolean=} hidden
             * @property {AttributePair[]=} attrs
             * @property {SourceLineInfo[]=} map
             * @property {any=} meta
             */

            /** @type {Options} */
            var defaultOptions = {
                leftDelimiter: '{',
                rightDelimiter: '}',
                allowedAttributes: []
            };

            /**
             * @param {janus} md
             * @param {Options=} options_
             */
            module.exports = function attributes(md, options_) {
                var options = Object.assign({}, defaultOptions);
                options = Object.assign(options, options_);
                var patterns = patternsConfig(options);

                /**
                 * @param {StateCore} state
                 */
                function curlyAttrs(state) {
                    var tokens = state.tokens;
                    var _loop = function _loop(i) {
                        var _loop2 = function _loop2(_p) {
                            var pattern = patterns[_p];
                            var j = null; // position of child with offset 0
                            var match = pattern.tests.every(function(t) {
                                var res = test(tokens, i, t);
                                if (res.j !== null) {
                                    j = res.j;
                                }
                                return res.match;
                            });
                            if (match) {
                                try {
                                    pattern.transform(tokens, i, j);
                                    if (pattern.name === 'inline attributes' || pattern.name === 'inline nesting 0') {
                                        // retry, may be several inline attributes
                                        _p--;
                                    }
                                } catch (error) {
                                    // eslint-disable-next-line no-console
                                    console.error("janus-attrs: Error in pattern '".concat(pattern.name, "': ").concat(error.message));
                                    console.error(error.stack);
                                }
                            }
                            p = _p;
                        };
                        for (var p = 0; p < patterns.length; p++) {
                            _loop2(p);
                        }
                    };
                    for (var i = 0; i < tokens.length; i++) {
                        _loop(i);
                    }
                }
                md.core.ruler.before('linkify', 'curly_attributes', curlyAttrs);
            };

            /**
             * Test if t matches token stream.
             *
             * @param {Token[]} tokens
             * @param {number} i
             * @param {DetectingRule} t
             * @returns {MatchedResult}
             */
            function test(tokens, i, t) {
                /** @type {MatchedResult} */
                var res = {
                    match: false,
                    j: null // position of child
                };
                var ii = t.shift !== undefined ? i + t.shift : t.position;
                if (t.shift !== undefined && ii < 0) {
                    // we should never shift to negative indexes (rolling around to back of array)
                    return res;
                }
                var token = get(tokens, ii); // supports negative ii

                if (token === undefined) {
                    return res;
                }
                var _loop3 = function _loop3() {
                        var key = _Object$keys[_i];
                        if (key === 'shift' || key === 'position') {
                            return 0; // continue
                        }
                        if (token[key] === undefined) {
                            return {
                                v: res
                            };
                        }
                        if (key === 'children' && isArrayOfObjects(t.children)) {
                            if (token.children.length === 0) {
                                return {
                                    v: res
                                };
                            }
                            var match;
                            /** @type {DetectingRule[]} */
                            var childTests = t.children;
                            /** @type {Token[]} */
                            var children = token.children;
                            if (childTests.every(function(tt) {
                                    return tt.position !== undefined;
                                })) {
                                // positions instead of shifts, do not loop all children
                                match = childTests.every(function(tt) {
                                    return test(children, tt.position, tt).match;
                                });
                                if (match) {
                                    // we may need position of child in transform
                                    var j = last(childTests).position;
                                    res.j = j >= 0 ? j : children.length + j;
                                }
                            } else {
                                var _loop4 = function _loop4(_j) {
                                    match = childTests.every(function(tt) {
                                        return test(children, _j, tt).match;
                                    });
                                    if (match) {
                                        res.j = _j;
                                        // all tests true, continue with next key of pattern t
                                        return 1; // break
                                    }
                                };
                                for (var _j = 0; _j < children.length; _j++) {
                                    if (_loop4(_j)) break;
                                }
                            }
                            if (match === false) {
                                return {
                                    v: res
                                };
                            }
                            return 0; // continue
                        }
                        switch (_typeof(t[key])) {
                            case 'boolean':
                            case 'number':
                            case 'string':
                                if (token[key] !== t[key]) {
                                    return {
                                        v: res
                                    };
                                }
                                break;
                            case 'function':
                                if (!t[key](token[key])) {
                                    return {
                                        v: res
                                    };
                                }
                                break;
                            case 'object':
                                if (isArrayOfFunctions(t[key])) {
                                    var r = t[key].every(function(tt) {
                                        return tt(token[key]);
                                    });
                                    if (r === false) {
                                        return {
                                            v: res
                                        };
                                    }
                                    break;
                                }
                                // fall through for objects !== arrays of functions
                            default:
                                throw new Error("Unknown type of pattern test (key: ".concat(key, "). Test should be of type boolean, number, string, function or array of functions."));
                        }
                    },
                    _ret;
                for (var _i = 0, _Object$keys = Object.keys(t); _i < _Object$keys.length; _i++) {
                    _ret = _loop3();
                    if (_ret === 0) continue;
                    if (_ret) return _ret.v;
                }

                // no tests returned false -> all tests returns true
                res.match = true;
                return res;
            }

            function isArrayOfObjects(arr) {
                return Array.isArray(arr) && arr.length && arr.every(function(i) {
                    return _typeof(i) === 'object';
                });
            }

            function isArrayOfFunctions(arr) {
                return Array.isArray(arr) && arr.length && arr.every(function(i) {
                    return typeof i === 'function';
                });
            }

            /**
             * Get n item of array. Supports negative n, where -1 is last
             * element in array.
             * @param {Token[]} arr
             * @param {number} n
             * @returns {Token=}
             */
            function get(arr, n) {
                return n >= 0 ? arr[n] : arr[arr.length + n];
            }

            /**
             * get last element of array, safe - returns {} if not found
             * @param {DetectingRule[]} arr
             * @returns {DetectingRule}
             */
            function last(arr) {
                return arr.slice(-1)[0] || {};
            }

        }, {
            "./patterns.js": 2
        }],
        2: [function(require, module, exports) {
            'use strict';

            /**
             * If a pattern matches the token stream,
             * then run transform.
             */
            var utils = require('./utils.js');

            /**
             * @param {import('.').Options} options
             * @returns {import('.').CurlyAttrsPattern[]}
             */
            module.exports = function(options) {
                var __hr = new RegExp('^ {0,3}[-*_]{3,} ?' + utils.escapeRegExp(options.leftDelimiter) + '[^' + utils.escapeRegExp(options.rightDelimiter) + ']');
                return [{
                    /**
                     * ```python {.cls}
                     * for i in range(10):
                     *     print(i)
                     * ```
                     */
                    name: 'fenced code blocks',
                    tests: [{
                        shift: 0,
                        block: true,
                        info: utils.hasDelimiters('end', options)
                    }],
                    transform: function transform(tokens, i) {
                        var token = tokens[i];
                        var start = token.info.lastIndexOf(options.leftDelimiter);
                        var attrs = utils.getAttrs(token.info, start, options);
                        utils.addAttrs(attrs, token);
                        token.info = utils.removeDelimiter(token.info, options);
                    }
                }, {
                    /**
                     * bla `click()`{.c} ![](img.png){.d}
                     *
                     * differs from 'inline attributes' as it does
                     * not have a closing tag (nesting: -1)
                     */
                    name: 'inline nesting 0',
                    tests: [{
                        shift: 0,
                        type: 'inline',
                        children: [{
                            shift: -1,
                            type: function type(str) {
                                return str === 'image' || str === 'code_inline';
                            }
                        }, {
                            shift: 0,
                            type: 'text',
                            content: utils.hasDelimiters('start', options)
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var endChar = token.content.indexOf(options.rightDelimiter);
                        var attrToken = tokens[i].children[j - 1];
                        var attrs = utils.getAttrs(token.content, 0, options);
                        utils.addAttrs(attrs, attrToken);
                        if (token.content.length === endChar + options.rightDelimiter.length) {
                            tokens[i].children.splice(j, 1);
                        } else {
                            token.content = token.content.slice(endChar + options.rightDelimiter.length);
                        }
                    }
                }, {
                    /**
                     * | h1 |
                     * | -- |
                     * | c1 |
                     *
                     * {.c}
                     */
                    name: 'tables',
                    tests: [{
                        // let this token be i, such that for-loop continues at
                        // next token after tokens.splice
                        shift: 0,
                        type: 'table_close'
                    }, {
                        shift: 1,
                        type: 'paragraph_open'
                    }, {
                        shift: 2,
                        type: 'inline',
                        content: utils.hasDelimiters('only', options)
                    }],
                    transform: function transform(tokens, i) {
                        var token = tokens[i + 2];
                        var tableOpen = utils.getMatchingOpeningToken(tokens, i);
                        var attrs = utils.getAttrs(token.content, 0, options);
                        // add attributes
                        utils.addAttrs(attrs, tableOpen);
                        // remove <p>{.c}</p>
                        tokens.splice(i + 1, 3);
                    }
                }, {
                    /**
                     * | A | B |
                     * | -- | -- |
                     * | 1 | 2 |
                     *
                     * | C | D |
                     * | -- | -- |
                     *
                     * only `| A | B |` sets the colsnum metadata
                     */
                    name: 'tables thead metadata',
                    tests: [{
                        shift: 0,
                        type: 'tr_close'
                    }, {
                        shift: 1,
                        type: 'thead_close'
                    }, {
                        shift: 2,
                        type: 'tbody_open'
                    }],
                    transform: function transform(tokens, i) {
                        var tr = utils.getMatchingOpeningToken(tokens, i);
                        var th = tokens[i - 1];
                        var colsnum = 0;
                        var n = i;
                        while (--n) {
                            if (tokens[n] === tr) {
                                tokens[n - 1].meta = Object.assign({}, tokens[n + 2].meta, {
                                    colsnum: colsnum
                                });
                                break;
                            }
                            colsnum += (tokens[n].level === th.level && tokens[n].type === th.type) >> 0;
                        }
                        tokens[i + 2].meta = Object.assign({}, tokens[i + 2].meta, {
                            colsnum: colsnum
                        });
                    }
                }, {
                    /**
                     * | A | B | C | D |
                     * | -- | -- | -- | -- |
                     * | 1 | 11 | 111 | 1111 {rowspan=3} |
                     * | 2 {colspan=2 rowspan=2} | 22 | 222 | 2222 |
                     * | 3 | 33 | 333 | 3333 |
                     */
                    name: 'tables tbody calculate',
                    tests: [{
                        shift: 0,
                        type: 'tbody_close',
                        hidden: false
                    }],
                    /**
                     * @param {number} i index of the tbody ending
                     */
                    transform: function transform(tokens, i) {
                        /** index of the tbody beginning */
                        var idx = i - 2;
                        while (idx > 0 && 'tbody_open' !== tokens[--idx].type);
                        var calc = tokens[idx].meta.colsnum >> 0;
                        if (calc < 2) {
                            return;
                        }
                        var level = tokens[i].level + 2;
                        for (var n = idx; n < i; n++) {
                            if (tokens[n].level > level) {
                                continue;
                            }
                            var token = tokens[n];
                            var rows = token.hidden ? 0 : token.attrGet('rowspan') >> 0;
                            var cols = token.hidden ? 0 : token.attrGet('colspan') >> 0;
                            if (rows > 1) {
                                var colsnum = calc - (cols > 0 ? cols : 1);
                                for (var k = n, num = rows; k < i, num > 1; k++) {
                                    if ('tr_open' == tokens[k].type) {
                                        tokens[k].meta = Object.assign({}, tokens[k].meta);
                                        if (tokens[k].meta && tokens[k].meta.colsnum) {
                                            colsnum -= 1;
                                        }
                                        tokens[k].meta.colsnum = colsnum;
                                        num--;
                                    }
                                }
                            }
                            if ('tr_open' == token.type && token.meta && token.meta.colsnum) {
                                var max = token.meta.colsnum;
                                for (var _k = n, _num = 0; _k < i; _k++) {
                                    if ('td_open' == tokens[_k].type) {
                                        _num += 1;
                                    } else if ('tr_close' == tokens[_k].type) {
                                        break;
                                    }
                                    _num > max && (tokens[_k].hidden || hidden(tokens[_k]));
                                }
                            }
                            if (cols > 1) {
                                /** @type {number[]} index of one row's children */
                                var one = [];
                                /** last index of the row's children */
                                var end = n + 3;
                                /** number of the row's children */
                                var _num2 = calc;
                                for (var _k2 = n; _k2 > idx; _k2--) {
                                    if ('tr_open' == tokens[_k2].type) {
                                        _num2 = tokens[_k2].meta && tokens[_k2].meta.colsnum || _num2;
                                        break;
                                    } else if ('td_open' === tokens[_k2].type) {
                                        one.unshift(_k2);
                                    }
                                }
                                for (var _k3 = n + 2; _k3 < i; _k3++) {
                                    if ('tr_close' == tokens[_k3].type) {
                                        end = _k3;
                                        break;
                                    } else if ('td_open' == tokens[_k3].type) {
                                        one.push(_k3);
                                    }
                                }
                                var off = one.indexOf(n);
                                var real = _num2 - off;
                                real = real > cols ? cols : real;
                                cols > real && token.attrSet('colspan', real + '');
                                for (var _k4 = one.slice(_num2 + 1 - calc - real)[0]; _k4 < end; _k4++) {
                                    tokens[_k4].hidden || hidden(tokens[_k4]);
                                }
                            }
                        }
                    }
                }, {
                    /**
                     * *emphasis*{.with attrs=1}
                     */
                    name: 'inline attributes',
                    tests: [{
                        shift: 0,
                        type: 'inline',
                        children: [{
                            shift: -1,
                            nesting: -1 // closing inline tag, </em>{.a}
                        }, {
                            shift: 0,
                            type: 'text',
                            content: utils.hasDelimiters('start', options)
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var content = token.content;
                        var attrs = utils.getAttrs(content, 0, options);
                        var openingToken = utils.getMatchingOpeningToken(tokens[i].children, j - 1);
                        utils.addAttrs(attrs, openingToken);
                        token.content = content.slice(content.indexOf(options.rightDelimiter) + options.rightDelimiter.length);
                    }
                }, {
                    /**
                     * - item
                     * {.a}
                     */
                    name: 'list softbreak',
                    tests: [{
                        shift: -2,
                        type: 'list_item_open'
                    }, {
                        shift: 0,
                        type: 'inline',
                        children: [{
                            position: -2,
                            type: 'softbreak'
                        }, {
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('only', options)
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var content = token.content;
                        var attrs = utils.getAttrs(content, 0, options);
                        var ii = i - 2;
                        while (tokens[ii - 1] && tokens[ii - 1].type !== 'ordered_list_open' && tokens[ii - 1].type !== 'bullet_list_open') {
                            ii--;
                        }
                        utils.addAttrs(attrs, tokens[ii - 1]);
                        tokens[i].children = tokens[i].children.slice(0, -2);
                    }
                }, {
                    /**
                     * - nested list
                     *   - with double \n
                     *   {.a} <-- apply to nested ul
                     *
                     * {.b} <-- apply to root <ul>
                     */
                    name: 'list double softbreak',
                    tests: [{
                        // let this token be i = 0 so that we can erase
                        // the <p>{.a}</p> tokens below
                        shift: 0,
                        type: function type(str) {
                            return str === 'bullet_list_close' || str === 'ordered_list_close';
                        }
                    }, {
                        shift: 1,
                        type: 'paragraph_open'
                    }, {
                        shift: 2,
                        type: 'inline',
                        content: utils.hasDelimiters('only', options),
                        children: function children(arr) {
                            return arr.length === 1;
                        }
                    }, {
                        shift: 3,
                        type: 'paragraph_close'
                    }],
                    transform: function transform(tokens, i) {
                        var token = tokens[i + 2];
                        var content = token.content;
                        var attrs = utils.getAttrs(content, 0, options);
                        var openingToken = utils.getMatchingOpeningToken(tokens, i);
                        utils.addAttrs(attrs, openingToken);
                        tokens.splice(i + 1, 3);
                    }
                }, {
                    /**
                     * - end of {.list-item}
                     */
                    name: 'list item end',
                    tests: [{
                        shift: -2,
                        type: 'list_item_open'
                    }, {
                        shift: 0,
                        type: 'inline',
                        children: [{
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('end', options)
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var content = token.content;
                        var attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
                        utils.addAttrs(attrs, tokens[i - 2]);
                        var trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
                        token.content = last(trimmed) !== ' ' ? trimmed : trimmed.slice(0, -1);
                    }
                }, {
                    /**
                     * something with softbreak
                     * {.cls}
                     */
                    name: '\n{.a} softbreak then curly in start',
                    tests: [{
                        shift: 0,
                        type: 'inline',
                        children: [{
                            position: -2,
                            type: 'softbreak'
                        }, {
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('only', options)
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var attrs = utils.getAttrs(token.content, 0, options);
                        // find last closing tag
                        var ii = i + 1;
                        while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) {
                            ii++;
                        }
                        var openingToken = utils.getMatchingOpeningToken(tokens, ii);
                        utils.addAttrs(attrs, openingToken);
                        tokens[i].children = tokens[i].children.slice(0, -2);
                    }
                }, {
                    /**
                     * horizontal rule --- {#id}
                     */
                    name: 'horizontal rule',
                    tests: [{
                        shift: 0,
                        type: 'paragraph_open'
                    }, {
                        shift: 1,
                        type: 'inline',
                        children: function children(arr) {
                            return arr.length === 1;
                        },
                        content: function content(str) {
                            return str.match(__hr) !== null;
                        }
                    }, {
                        shift: 2,
                        type: 'paragraph_close'
                    }],
                    transform: function transform(tokens, i) {
                        var token = tokens[i];
                        token.type = 'hr';
                        token.tag = 'hr';
                        token.nesting = 0;
                        var content = tokens[i + 1].content;
                        var start = content.lastIndexOf(options.leftDelimiter);
                        var attrs = utils.getAttrs(content, start, options);
                        utils.addAttrs(attrs, token);
                        token.markup = content;
                        tokens.splice(i + 1, 2);
                    }
                }, {
                    /**
                     * end of {.block}
                     */
                    name: 'end of block',
                    tests: [{
                        shift: 0,
                        type: 'inline',
                        children: [{
                            position: -1,
                            content: utils.hasDelimiters('end', options),
                            type: function type(t) {
                                return t !== 'code_inline' && t !== 'math_inline';
                            }
                        }]
                    }],
                    /**
                     * @param {!number} j
                     */
                    transform: function transform(tokens, i, j) {
                        var token = tokens[i].children[j];
                        var content = token.content;
                        var attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
                        var ii = i + 1;
                        do
                            if (tokens[ii] && tokens[ii].nesting === -1) {
                                break;
                            } while (ii++ < tokens.length);
                        var openingToken = utils.getMatchingOpeningToken(tokens, ii);
                        utils.addAttrs(attrs, openingToken);
                        var trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
                        token.content = last(trimmed) !== ' ' ? trimmed : trimmed.slice(0, -1);
                    }
                }];
            };

            // get last element of array or string
            function last(arr) {
                return arr.slice(-1)[0];
            }

            /**
             * Hidden table's cells and them inline children,
             * specially cast inline's content as empty
             * to prevent that escapes the table's box model
             * @see https://github.com/janus/janus/issues/639
             * @param {import('.').Token} token
             */
            function hidden(token) {
                token.hidden = true;
                token.children && token.children.forEach(function(t) {
                    return t.content = '', hidden(t), undefined;
                });
            }

        }, {
            "./utils.js": 3
        }],
        3: [function(require, module, exports) {
            "use strict";

            /**
             * @typedef {import('.').Token} Token
             * @typedef {import('.').Options} Options
             * @typedef {import('.').AttributePair} AttributePair
             * @typedef {import('.').AllowedAttribute} AllowedAttribute
             * @typedef {import('.').DetectingStrRule} DetectingStrRule
             */
            /**
             * parse {.class #id key=val} strings
             * @param {string} str: string to parse
             * @param {number} start: where to start parsing (including {)
             * @param {Options} options
             * @returns {AttributePair[]}: [['key', 'val'], ['class', 'red']]
             */
            exports.getAttrs = function(str, start, options) {
                // not tab, line feed, form feed, space, solidus, greater than sign, quotation mark, apostrophe and equals sign
                var allowedKeyChars = /[^\t\n\f />"'=]/;
                var pairSeparator = ' ';
                var keySeparator = '=';
                var classChar = '.';
                var idChar = '#';
                var attrs = [];
                var key = '';
                var value = '';
                var parsingKey = true;
                var valueInsideQuotes = false;

                // read inside {}
                // start + left delimiter length to avoid beginning {
                // breaks when } is found or end of string
                for (var i = start + options.leftDelimiter.length; i < str.length; i++) {
                    if (str.slice(i, i + options.rightDelimiter.length) === options.rightDelimiter) {
                        if (key !== '') {
                            attrs.push([key, value]);
                        }
                        break;
                    }
                    var char_ = str.charAt(i);

                    // switch to reading value if equal sign
                    if (char_ === keySeparator && parsingKey) {
                        parsingKey = false;
                        continue;
                    }

                    // {.class} {..css-module}
                    if (char_ === classChar && key === '') {
                        if (str.charAt(i + 1) === classChar) {
                            key = 'css-module';
                            i += 1;
                        } else {
                            key = 'class';
                        }
                        parsingKey = false;
                        continue;
                    }

                    // {#id}
                    if (char_ === idChar && key === '') {
                        key = 'id';
                        parsingKey = false;
                        continue;
                    }

                    // {value="inside quotes"}
                    if (char_ === '"' && value === '' && !valueInsideQuotes) {
                        valueInsideQuotes = true;
                        continue;
                    }
                    if (char_ === '"' && valueInsideQuotes) {
                        valueInsideQuotes = false;
                        continue;
                    }

                    // read next key/value pair
                    if (char_ === pairSeparator && !valueInsideQuotes) {
                        if (key === '') {
                            // beginning or ending space: { .red } vs {.red}
                            continue;
                        }
                        attrs.push([key, value]);
                        key = '';
                        value = '';
                        parsingKey = true;
                        continue;
                    }

                    // continue if character not allowed
                    if (parsingKey && char_.search(allowedKeyChars) === -1) {
                        continue;
                    }

                    // no other conditions met; append to key/value
                    if (parsingKey) {
                        key += char_;
                        continue;
                    }
                    value += char_;
                }
                if (options.allowedAttributes && options.allowedAttributes.length) {
                    var allowedAttributes = options.allowedAttributes;
                    return attrs.filter(function(attrPair) {
                        var attr = attrPair[0];

                        /**
                         * @param {AllowedAttribute} allowedAttribute
                         */
                        function isAllowedAttribute(allowedAttribute) {
                            return attr === allowedAttribute || allowedAttribute instanceof RegExp && allowedAttribute.test(attr);
                        }
                        return allowedAttributes.some(isAllowedAttribute);
                    });
                }
                return attrs;
            };

            /**
             * add attributes from [['key', 'val']] list
             * @param {AttributePair[]} attrs: [['key', 'val']]
             * @param {Token} token: which token to add attributes
             * @returns token
             */
            exports.addAttrs = function(attrs, token) {
                for (var j = 0, l = attrs.length; j < l; ++j) {
                    var key = attrs[j][0];
                    if (key === 'class') {
                        token.attrJoin('class', attrs[j][1]);
                    } else if (key === 'css-module') {
                        token.attrJoin('css-module', attrs[j][1]);
                    } else {
                        token.attrPush(attrs[j]);
                    }
                }
                return token;
            };

            /**
             * Does string have properly formatted curly?
             *
             * start: '{.a} asdf'
             * end: 'asdf {.a}'
             * only: '{.a}'
             *
             * @param {'start'|'end'|'only'} where to expect {} curly. start, end or only.
             * @param {Options} options
             * @return {DetectingStrRule} Function which testes if string has curly.
             */
            exports.hasDelimiters = function(where, options) {
                if (!where) {
                    throw new Error('Parameter `where` not passed. Should be "start", "end" or "only".');
                }

                /**
                 * @param {string} str
                 * @return {boolean}
                 */
                return function(str) {
                    // we need minimum three chars, for example {b}
                    var minCurlyLength = options.leftDelimiter.length + 1 + options.rightDelimiter.length;
                    if (!str || typeof str !== 'string' || str.length < minCurlyLength) {
                        return false;
                    }

                    /**
                     * @param {string} curly
                     */
                    function validCurlyLength(curly) {
                        var isClass = curly.charAt(options.leftDelimiter.length) === '.';
                        var isId = curly.charAt(options.leftDelimiter.length) === '#';
                        return isClass || isId ? curly.length >= minCurlyLength + 1 : curly.length >= minCurlyLength;
                    }
                    var start, end, slice, nextChar;
                    var rightDelimiterMinimumShift = minCurlyLength - options.rightDelimiter.length;
                    switch (where) {
                        case 'start':
                            // first char should be {, } found in char 2 or more
                            slice = str.slice(0, options.leftDelimiter.length);
                            start = slice === options.leftDelimiter ? 0 : -1;
                            end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, rightDelimiterMinimumShift);
                            // check if next character is not one of the delimiters
                            nextChar = str.charAt(end + options.rightDelimiter.length);
                            if (nextChar && options.rightDelimiter.indexOf(nextChar) !== -1) {
                                end = -1;
                            }
                            break;
                        case 'end':
                            // last char should be }
                            start = str.lastIndexOf(options.leftDelimiter);
                            end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, start + rightDelimiterMinimumShift);
                            end = end === str.length - options.rightDelimiter.length ? end : -1;
                            break;
                        case 'only':
                            // '{.a}'
                            slice = str.slice(0, options.leftDelimiter.length);
                            start = slice === options.leftDelimiter ? 0 : -1;
                            slice = str.slice(str.length - options.rightDelimiter.length);
                            end = slice === options.rightDelimiter ? str.length - options.rightDelimiter.length : -1;
                            break;
                        default:
                            throw new Error("Unexpected case ".concat(where, ", expected 'start', 'end' or 'only'"));
                    }
                    return start !== -1 && end !== -1 && validCurlyLength(str.substring(start, end + options.rightDelimiter.length));
                };
            };

            /**
             * Removes last curly from string.
             * @param {string} str
             * @param {Options} options
             */
            exports.removeDelimiter = function(str, options) {
                var start = escapeRegExp(options.leftDelimiter);
                var end = escapeRegExp(options.rightDelimiter);
                var curly = new RegExp('[ \\n]?' + start + '[^' + start + end + ']+' + end + '$');
                var pos = str.search(curly);
                return pos !== -1 ? str.slice(0, pos) : str;
            };

            /**
             * Escapes special characters in string s such that the string
             * can be used in `new RegExp`. For example "[" becomes "\\[".
             *
             * @param {string} s Regex string.
             * @return {string} Escaped string.
             */
            function escapeRegExp(s) {
                return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            }
            exports.escapeRegExp = escapeRegExp;

            /**
             * find corresponding opening block
             * @param {Token[]} tokens
             * @param {number} i
             */
            exports.getMatchingOpeningToken = function(tokens, i) {
                if (tokens[i].type === 'softbreak') {
                    return false;
                }
                // non closing blocks, example img
                if (tokens[i].nesting === 0) {
                    return tokens[i];
                }
                var level = tokens[i].level;
                var type = tokens[i].type.replace('_close', '_open');
                for (; i >= 0; --i) {
                    if (tokens[i].type === type && tokens[i].level === level) {
                        return tokens[i];
                    }
                }
                return false;
            };

            /**
             * from https://github.com/janus/janus/blob/master/lib/common/utils.js
             */
            var HTML_ESCAPE_TEST_RE = /[&<>"]/;
            var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
            var HTML_REPLACEMENTS = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            };

            /**
             * @param {string} ch
             * @returns {string}
             */
            function replaceUnsafeChar(ch) {
                return HTML_REPLACEMENTS[ch];
            }

            /**
             * @param {string} str
             * @returns {string}
             */
            exports.escapeHtml = function(str) {
                if (HTML_ESCAPE_TEST_RE.test(str)) {
                    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
                }
                return str;
            };

        }, {}]
    }, {}, [1])(1)
});

(function(global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
    global.janusAbbr = factory());
  })(this, (function() {
    "use strict";
    // Enclose abbreviations in <abbr> tags
    
      function abbr_plugin(md) {
      const escapeRE = md.utils.escapeRE;
      const arrayReplaceAt = md.utils.arrayReplaceAt;
      // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
      // you can check character classes here:
      // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
          const OTHER_CHARS = " \r\n$+<=>^`|~";
      const UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
      const UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;
      function abbr_def(state, startLine, endLine, silent) {
        let labelEnd;
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        const max = state.eMarks[startLine];
        if (pos + 2 >= max) {
          return false;
        }
        if (state.src.charCodeAt(pos++) !== 42 /* * */) {
          return false;
        }
        if (state.src.charCodeAt(pos++) !== 91 /* [ */) {
          return false;
        }
        const labelStart = pos;
        for (;pos < max; pos++) {
          const ch = state.src.charCodeAt(pos);
          if (ch === 91 /* [ */) {
            return false;
          } else if (ch === 93 /* ] */) {
            labelEnd = pos;
            break;
          } else if (ch === 92 /* \ */) {
            pos++;
          }
        }
        if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 58 /* : */) {
          return false;
        }
        if (silent) {
          return true;
        }
        const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, "$1");
        const title = state.src.slice(labelEnd + 2, max).trim();
        if (label.length === 0) {
          return false;
        }
        if (title.length === 0) {
          return false;
        }
        if (!state.env.abbreviations) {
          state.env.abbreviations = {};
        }
        // prepend ':' to avoid conflict with Object.prototype members
              if (typeof state.env.abbreviations[":" + label] === "undefined") {
          state.env.abbreviations[":" + label] = title;
        }
        state.line = startLine + 1;
        return true;
      }
      function abbr_replace(state) {
        const blockTokens = state.tokens;
        if (!state.env.abbreviations) {
          return;
        }
        const regSimple = new RegExp("(?:" + Object.keys(state.env.abbreviations).map((function(x) {
          return x.substr(1);
        })).sort((function(a, b) {
          return b.length - a.length;
        })).map(escapeRE).join("|") + ")");
        const regText = "(^|" + UNICODE_PUNCT_RE + "|" + UNICODE_SPACE_RE + "|[" + OTHER_CHARS.split("").map(escapeRE).join("") + "])" + "(" + Object.keys(state.env.abbreviations).map((function(x) {
          return x.substr(1);
        })).sort((function(a, b) {
          return b.length - a.length;
        })).map(escapeRE).join("|") + ")" + "($|" + UNICODE_PUNCT_RE + "|" + UNICODE_SPACE_RE + "|[" + OTHER_CHARS.split("").map(escapeRE).join("") + "])";
        const reg = new RegExp(regText, "g");
        for (let j = 0, l = blockTokens.length; j < l; j++) {
          if (blockTokens[j].type !== "inline") {
            continue;
          }
          let tokens = blockTokens[j].children;
          // We scan from the end, to keep position when new tags added.
                  for (let i = tokens.length - 1; i >= 0; i--) {
            const currentToken = tokens[i];
            if (currentToken.type !== "text") {
              continue;
            }
            let pos = 0;
            const text = currentToken.content;
            reg.lastIndex = 0;
            const nodes = [];
            // fast regexp run to determine whether there are any abbreviated words
            // in the current token
                      if (!regSimple.test(text)) {
              continue;
            }
            let m;
            while (m = reg.exec(text)) {
              if (m.index > 0 || m[1].length > 0) {
                const token = new state.Token("text", "", 0);
                token.content = text.slice(pos, m.index + m[1].length);
                nodes.push(token);
              }
              const token_o = new state.Token("abbr_open", "abbr", 1);
              token_o.attrs = [ [ "title", state.env.abbreviations[":" + m[2]] ] ];
              nodes.push(token_o);
              const token_t = new state.Token("text", "", 0);
              token_t.content = m[2];
              nodes.push(token_t);
              const token_c = new state.Token("abbr_close", "abbr", -1);
              nodes.push(token_c);
              reg.lastIndex -= m[3].length;
              pos = reg.lastIndex;
            }
            if (!nodes.length) {
              continue;
            }
            if (pos < text.length) {
              const token = new state.Token("text", "", 0);
              token.content = text.slice(pos);
              nodes.push(token);
            }
            // replace current node
                      blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
          }
        }
      }
      md.block.ruler.before("reference", "abbr_def", abbr_def, {
        alt: [ "paragraph", "reference" ]
      });
      md.core.ruler.after("linkify", "abbr_replace", abbr_replace);
    }
    return abbr_plugin;
  }));

/*! janus-abbr 1.0.4-29 https://github.com//GerHobbelt/janus-abbr @license MIT */

// Enclose abbreviations in <abbr> tags
//

/**
* @param {*} md The janus plugin instance.
* @param {Object=} abbrDefList A list of abbreviations and their definitions
*   {"HTML": "Hyper Text Markup Language", "W3C": "World Wide Web Consortium"}.
*   It will be merged with the reference style abbreviation definitions like `*[HTML]: Hyper Text Markup Language`
*   inside the janus files (file definitions overwrite existing list definitions by default).
* @param {boolean=} [listPriorsFile=false] If false (default) definitions inside the janus file overwrite
*   existing list definitions. If true list definitions overwrite existing definitions in the janus file.
*/
function sub_plugin(md, abbrDefList, listPriorsFile) {
    const escapeRE = md.utils.escapeRE;
    const arrayReplaceAt = md.utils.arrayReplaceAt; // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
    // you can check character classes here:
    // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
  
    const OTHER_CHARS = ' \r\n$+<=>^`|~';
    const UNICODE_PUNCT_RE = md.utils.ucmicro.P.source;
    const UNICODE_SPACE_RE = md.utils.ucmicro.Z.source;
  
    if (abbrDefList) {
      // prepend ':' to avoid conflict with Object.prototype members
      Object.keys(abbrDefList).forEach(key => {
        if (!key.startsWith(':')) {
          Object.defineProperty(abbrDefList, ':' + key, Object.getOwnPropertyDescriptor(abbrDefList, key));
          delete abbrDefList[key];
        }
      });
    }
  
    function abbr_def(state, startLine, endLine, silent) {
      let label,
          title,
          ch,
          labelStart,
          labelEnd,
          pos = state.bMarks[startLine] + state.tShift[startLine],
          max = state.eMarks[startLine];
  
      if (pos + 2 >= max) {
        return false;
      }
  
      if (state.src.charCodeAt(pos++) !== 0x2A
      /* * */
      ) {
          return false;
        }
  
      if (state.src.charCodeAt(pos++) !== 0x5B
      /* [ */
      ) {
          return false;
        }
  
      labelStart = pos;
  
      for (; pos < max; pos++) {
        ch = state.src.charCodeAt(pos);
  
        if (ch === 0x5B
        /* [ */
        ) {
            return false;
          } else if (ch === 0x5D
        /* ] */
        ) {
            labelEnd = pos;
            break;
          } else if (ch === 0x5C
        /* \ */
        ) {
            pos++;
          }
      }
  
      if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A
      /* : */
      ) {
          return false;
        }
  
      if (silent) {
        return true;
      }
  
      label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
      title = state.src.slice(labelEnd + 2, max).trim();
  
      if (label.length === 0) {
        return false;
      }
  
      if (title.length === 0) {
        return false;
      }
  
      if (!state.env.abbreviations) {
        state.env.abbreviations = {};
      } // prepend ':' to avoid conflict with Object.prototype members
  
  
      if (typeof state.env.abbreviations[':' + label] === 'undefined') {
        state.env.abbreviations[':' + label] = title;
      }
  
      state.line = startLine + 1;
      return true;
    }
  
    function abbr_replace(state) {
      let i,
          j,
          l,
          tokens,
          token,
          text,
          nodes,
          pos,
          reg,
          m,
          regText,
          regSimple,
          currentToken,
          blockTokens = state.tokens;
  
      if (!state.env.abbreviations && !abbrDefList) {
        // no defs at all
        return;
      } else if (!state.env.abbreviations && abbrDefList) {
        // use specified list
        state.env.abbreviations = abbrDefList;
      } else if (state.env.abbreviations && abbrDefList) {
        // merge file defs with list defs based on priority
        state.env.abbreviations = listPriorsFile ? Object.assign(state.env.abbreviations, abbrDefList) // list defs prior file defs
        : Object.assign(abbrDefList, state.env.abbreviations); // file defs prior list defs
      }
  
      regSimple = new RegExp('(?:' + Object.keys(state.env.abbreviations).map(function (x) {
        return x.substr(1);
      }).sort(function (a, b) {
        return b.length - a.length;
      }).map(escapeRE).join('|') + ')');
      regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE + '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])' + '(' + Object.keys(state.env.abbreviations).map(function (x) {
        return x.substr(1); // eslint-disable-line
      }).sort(function (a, b) {
        // eslint-disable-line
        return b.length - a.length; // eslint-disable-line
      }).map(escapeRE).join('|') + ')' // eslint-disable-line
      + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE + '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';
      reg = new RegExp(regText, 'g');
  
      for (j = 0, l = blockTokens.length; j < l; j++) {
        if (blockTokens[j].type !== 'inline') {
          continue;
        }
  
        tokens = blockTokens[j].children; // We scan from the end, to keep position when new tags added.
  
        for (i = tokens.length - 1; i >= 0; i--) {
          currentToken = tokens[i];
  
          if (currentToken.type !== 'text') {
            continue;
          }
  
          pos = 0;
          text = currentToken.content;
          reg.lastIndex = 0;
          nodes = []; // fast regexp run to determine whether there are any abbreviated words
          // in the current token
  
          if (!regSimple.test(text)) {
            continue;
          }
  
          while ((m = reg.exec(text)) !== null) {
            if (m.index > 0 || m[1].length > 0) {
              token = new state.Token('text', '', 0);
              token.content = text.slice(pos, m.index + m[1].length);
              nodes.push(token);
            }
  
            token = new state.Token('abbr_open', 'abbr', 1);
            token.attrs = [['title', state.env.abbreviations[':' + m[2]]]];
            nodes.push(token);
            token = new state.Token('text', '', 0);
            token.content = m[2];
            nodes.push(token);
            token = new state.Token('abbr_close', 'abbr', -1);
            nodes.push(token);
            reg.lastIndex -= m[3].length;
  
            if (m.index === reg.lastIndex) {
              reg.lastIndex++;
            }
  
            pos = reg.lastIndex;
          }
  
          if (!nodes.length) {
            continue;
          }
  
          if (pos < text.length) {
            token = new state.Token('text', '', 0);
            token.content = text.slice(pos);
            nodes.push(token);
          } // replace current node
  
  
          blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
        }
      }
    }
  
    md.block.ruler.before('reference', 'abbr_def', abbr_def, {
      alt: ['paragraph', 'reference']
    });
    md.core.ruler.before('replacements', 'abbr_replace', abbr_replace);
  }

  'use strict';

(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, 
  global.janusContainer = factory());
})(this, (function() {
  "use strict";
  // Process block-level custom containers
  
    function container_plugin(md, name, options) {
    // Second param may be useful if you decide
    // to increase minimal allowed marker length
    function validateDefault(params /*, markup */) {
      return params.trim().split(" ", 2)[0] === name;
    }
    function renderDefault(tokens, idx, _options, env, slf) {
      // add a class to the opening tag
      if (tokens[idx].nesting === 1) {
        tokens[idx].attrJoin("class", name);
      }
      return slf.renderToken(tokens, idx, _options, env, slf);
    }
    options = options || {};
    const min_markers = 3;
    const marker_str = options.marker || ":";
    const marker_char = marker_str.charCodeAt(0);
    const marker_len = marker_str.length;
    const validate = options.validate || validateDefault;
    const render = options.render || renderDefault;
    function container(state, startLine, endLine, silent) {
      let pos;
      let auto_closed = false;
      let start = state.bMarks[startLine] + state.tShift[startLine];
      let max = state.eMarks[startLine];
      // Check out the first character quickly,
      // this should filter out most of non-containers
      
            if (marker_char !== state.src.charCodeAt(start)) {
        return false;
      }
      // Check out the rest of the marker string
      
            for (pos = start + 1; pos <= max; pos++) {
        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
          break;
        }
      }
      const marker_count = Math.floor((pos - start) / marker_len);
      if (marker_count < min_markers) {
        return false;
      }
      pos -= (pos - start) % marker_len;
      const markup = state.src.slice(start, pos);
      const params = state.src.slice(pos, max);
      if (!validate(params, markup)) {
        return false;
      }
      // Since start is found, we can report success here in validation mode
      
            if (silent) {
        return true;
      }
      // Search for the end of the block
      
            let nextLine = startLine;
      for (;;) {
        nextLine++;
        if (nextLine >= endLine) {
          // unclosed block should be autoclosed by end of document.
          // also block seems to be autoclosed by end of parent
          break;
        }
        start = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        if (start < max && state.sCount[nextLine] < state.blkIndent) {
          // non-empty line with negative indent should stop the list:
          // - ```
          //  test
          break;
        }
        if (marker_char !== state.src.charCodeAt(start)) {
          continue;
        }
        if (state.sCount[nextLine] - state.blkIndent >= 4) {
          // closing fence should be indented less than 4 spaces
          continue;
        }
        for (pos = start + 1; pos <= max; pos++) {
          if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
            break;
          }
        }
        // closing code fence must be at least as long as the opening one
                if (Math.floor((pos - start) / marker_len) < marker_count) {
          continue;
        }
        // make sure tail has spaces only
                pos -= (pos - start) % marker_len;
        pos = state.skipSpaces(pos);
        if (pos < max) {
          continue;
        }
        // found!
                auto_closed = true;
        break;
      }
      const old_parent = state.parentType;
      const old_line_max = state.lineMax;
      state.parentType = "container";
      // this will prevent lazy continuations from ever going past our end marker
            state.lineMax = nextLine;
      const token_o = state.push("container_" + name + "_open", "div", 1);
      token_o.markup = markup;
      token_o.block = true;
      token_o.info = params;
      token_o.map = [ startLine, nextLine ];
      state.md.block.tokenize(state, startLine + 1, nextLine);
      const token_c = state.push("container_" + name + "_close", "div", -1);
      token_c.markup = state.src.slice(start, pos);
      token_c.block = true;
      state.parentType = old_parent;
      state.lineMax = old_line_max;
      state.line = nextLine + (auto_closed ? 1 : 0);
      return true;
    }
    md.block.ruler.before("fence", "container_" + name, container, {
      alt: [ "paragraph", "reference", "blockquote", "list" ]
    });
    md.renderer.rules["container_" + name + "_open"] = render;
    md.renderer.rules["container_" + name + "_close"] = render;
  }
  return container_plugin;
}));

(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object") module.exports = factory();
    else if (typeof define === "function" && define.amd) define(factory);
    else if (typeof exports === "object") exports["janus-imsize.js"] = factory();
    else root["janus-imsize.js"] = factory()
})(this, function() {
    return function(modules) {
        var installedModules = {};

        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = "";
        return __webpack_require__(0)
    }([function(module, exports, __webpack_require__) {
        "use strict";
        var sizeOf = __webpack_require__(2);
        var parseImageSize = __webpack_require__(1);

        function image_with_size(md, options) {
            return function(state, silent) {
                var attrs, code, label, labelEnd, labelStart, pos, ref, res, title, width = "",
                    height = "",
                    token, tokens, start, href = "",
                    oldPos = state.pos,
                    max = state.posMax;
                if (state.src.charCodeAt(state.pos) !== 33) {
                    return false
                }
                if (state.src.charCodeAt(state.pos + 1) !== 91) {
                    return false
                }
                labelStart = state.pos + 2;
                labelEnd = md.helpers.parseLinkLabel(state, state.pos + 1, false);
                if (labelEnd < 0) {
                    return false
                }
                pos = labelEnd + 1;
                if (pos < max && state.src.charCodeAt(pos) === 40) {
                    pos++;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (code !== 32 && code !== 10) {
                            break
                        }
                    }
                    if (pos >= max) {
                        return false
                    }
                    start = pos;
                    res = md.helpers.parseLinkDestination(state.src, pos, state.posMax);
                    if (res.ok) {
                        href = state.md.normalizeLink(res.str);
                        if (state.md.validateLink(href)) {
                            pos = res.pos
                        } else {
                            href = ""
                        }
                    }
                    start = pos;
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (code !== 32 && code !== 10) {
                            break
                        }
                    }
                    res = md.helpers.parseLinkTitle(state.src, pos, state.posMax);
                    if (pos < max && start !== pos && res.ok) {
                        title = res.str;
                        pos = res.pos;
                        for (; pos < max; pos++) {
                            code = state.src.charCodeAt(pos);
                            if (code !== 32 && code !== 10) {
                                break
                            }
                        }
                    } else {
                        title = ""
                    }
                    if (pos - 1 >= 0) {
                        code = state.src.charCodeAt(pos - 1);
                        if (code === 32) {
                            res = parseImageSize(state.src, pos, state.posMax);
                            if (res.ok) {
                                width = res.width;
                                height = res.height;
                                pos = res.pos;
                                for (; pos < max; pos++) {
                                    code = state.src.charCodeAt(pos);
                                    if (code !== 32 && code !== 10) {
                                        break
                                    }
                                }
                            }
                        }
                    }
                    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
                        state.pos = oldPos;
                        return false
                    }
                    pos++
                } else {
                    if (typeof state.env.references === "undefined") {
                        return false
                    }
                    for (; pos < max; pos++) {
                        code = state.src.charCodeAt(pos);
                        if (code !== 32 && code !== 10) {
                            break
                        }
                    }
                    if (pos < max && state.src.charCodeAt(pos) === 91) {
                        start = pos + 1;
                        pos = md.helpers.parseLinkLabel(state, pos);
                        if (pos >= 0) {
                            label = state.src.slice(start, pos++)
                        } else {
                            pos = labelEnd + 1
                        }
                    } else {
                        pos = labelEnd + 1
                    }
                    if (!label) {
                        label = state.src.slice(labelStart, labelEnd)
                    }
                    ref = state.env.references[md.utils.normalizeReference(label)];
                    if (!ref) {
                        state.pos = oldPos;
                        return false
                    }
                    href = ref.href;
                    title = ref.title
                }
                if (!silent) {
                    state.pos = labelStart;
                    state.posMax = labelEnd;
                    var newState = new state.md.inline.State(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens = []);
                    newState.md.inline.tokenize(newState);
                    if (options) {
                        if (options.autofill && width === "" && height === "") {
                            try {
                                var dimensions = sizeOf(href);
                                width = dimensions.width;
                                height = dimensions.height
                            } catch (e) {}
                        }
                    }
                    token = state.push("image", "img", 0);
                    token.attrs = attrs = [
                        ["src", href],
                        ["alt", ""]
                    ];
                    token.children = tokens;
                    if (title) {
                        attrs.push(["title", title])
                    }
                    if (width !== "") {
                        attrs.push(["width", width])
                    }
                    if (height !== "") {
                        attrs.push(["height", height])
                    }
                }
                state.pos = pos;
                state.posMax = max;
                return true
            }
        }
        module.exports = function imsize_plugin(md, options) {
            md.inline.ruler.before("emphasis", "image", image_with_size(md, options))
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";

        function parseNextNumber(str, pos, max) {
            var code, start = pos,
                result = {
                    ok: false,
                    pos: pos,
                    value: ""
                };
            code = str.charCodeAt(pos);
            while (pos < max && (code >= 48 && code <= 57) || code === 37) {
                code = str.charCodeAt(++pos)
            }
            result.ok = true;
            result.pos = pos;
            result.value = str.slice(start, pos);
            return result
        }
        module.exports = function parseImageSize(str, pos, max) {
            var code, result = {
                ok: false,
                pos: 0,
                width: "",
                height: ""
            };
            if (pos >= max) {
                return result
            }
            code = str.charCodeAt(pos);
            if (code !== 61) {
                return result
            }
            pos++;
            code = str.charCodeAt(pos);
            if (code !== 120 && (code < 48 || code > 57)) {
                return result
            }
            var resultW = parseNextNumber(str, pos, max);
            pos = resultW.pos;
            code = str.charCodeAt(pos);
            if (code !== 120) {
                return result
            }
            pos++;
            var resultH = parseNextNumber(str, pos, max);
            pos = resultH.pos;
            result.width = resultW.value;
            result.height = resultH.value;
            result.pos = pos;
            result.ok = true;
            return result
        }
    }, function(module, exports, __webpack_require__) {
        (function(Buffer) {
            "use strict";
            var fs = __webpack_require__(16);
            var path = __webpack_require__(6);
            var detector = __webpack_require__(3);
            var handlers = {};
            var types = __webpack_require__(5);
            types.forEach(function(type) {
                handlers[type] = __webpack_require__(4)("./" + type)
            });
            var MaxBufferSize = 128 * 1024;

            function lookup(buffer, filepath) {
                var type = detector(buffer, filepath);
                if (type in handlers) {
                    var size = handlers[type].calculate(buffer, filepath);
                    if (size !== false) {
                        size.type = type;
                        return size
                    }
                }
                throw new TypeError("Unsupported file type")
            }

            function asyncFileToBuffer(filepath, callback) {
                fs.open(filepath, "r", function(err0, descriptor) {
                    if (err0) {
                        return callback(err0)
                    }
                    var size = fs.fstatSync(descriptor).size;
                    var bufferSize = Math.min(size, MaxBufferSize);
                    var buffer = new Buffer(bufferSize);
                    fs.read(descriptor, buffer, 0, bufferSize, 0, function(err1) {
                        if (err1) {
                            return callback(err1)
                        }
                        fs.close(descriptor, function(err2) {
                            callback(err2, buffer)
                        })
                    })
                })
            }

            function syncFileToBuffer(filepath) {
                var descriptor = fs.openSync(filepath, "r");
                var size = fs.fstatSync(descriptor).size;
                var bufferSize = Math.min(size, MaxBufferSize);
                var buffer = new Buffer(bufferSize);
                fs.readSync(descriptor, buffer, 0, bufferSize, 0);
                fs.closeSync(descriptor);
                return buffer
            }
            module.exports = function(input, callback) {
                if (typeof input !== "string") {
                    throw new TypeError("Input must be file name")
                }
                var filepath = path.resolve(input);
                if (typeof callback === "function") {
                    asyncFileToBuffer(filepath, function(err, buffer) {
                        if (err) {
                            return callback(err)
                        }
                        var dimensions;
                        try {
                            dimensions = lookup(buffer, filepath)
                        } catch (e) {
                            err = e
                        }
                        callback(err, dimensions)
                    })
                } else {
                    var buffer = syncFileToBuffer(filepath);
                    return lookup(buffer, filepath)
                }
            }
        }).call(exports, __webpack_require__(7).Buffer)
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var typeMap = {};
        var types = __webpack_require__(5);
        types.forEach(function(type) {
            typeMap[type] = __webpack_require__(4)("./" + type).detect
        });
        module.exports = function(buffer, filepath) {
            var type, result;
            for (type in typeMap) {
                if (type in typeMap) {
                    result = typeMap[type](buffer, filepath);
                    if (result) {
                        return type
                    }
                }
            }
            throw new TypeError("Unsupported type")
        }
    }, function(module, exports, __webpack_require__) {
        var map = {
            "./bmp": 8,
            "./bmp.js": 8,
            "./gif": 9,
            "./gif.js": 9,
            "./jpg": 10,
            "./jpg.js": 10,
            "./png": 11,
            "./png.js": 11,
            "./psd": 12,
            "./psd.js": 12,
            "./svg": 13,
            "./svg.js": 13,
            "./tiff": 14,
            "./tiff.js": 14,
            "./webp": 15,
            "./webp.js": 15
        };

        function webpackContext(req) {
            return __webpack_require__(webpackContextResolve(req))
        }

        function webpackContextResolve(req) {
            return map[req] || function() {
                throw new Error("Cannot find module '" + req + "'.")
            }()
        }
        webpackContext.keys = function webpackContextKeys() {
            return Object.keys(map)
        };
        webpackContext.resolve = webpackContextResolve;
        module.exports = webpackContext;
        webpackContext.id = 4
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = ["bmp", "gif", "jpg", "png", "tiff"]
    }, function(module, exports, __webpack_require__) {
        (function(process) {
            function normalizeArray(parts, allowAboveRoot) {
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                    var last = parts[i];
                    if (last === ".") {
                        parts.splice(i, 1)
                    } else if (last === "..") {
                        parts.splice(i, 1);
                        up++
                    } else if (up) {
                        parts.splice(i, 1);
                        up--
                    }
                }
                if (allowAboveRoot) {
                    for (; up--; up) {
                        parts.unshift("..")
                    }
                }
                return parts
            }
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            var splitPath = function(filename) {
                return splitPathRe.exec(filename).slice(1)
            };
            exports.resolve = function() {
                var resolvedPath = "",
                    resolvedAbsolute = false;
                for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                    var path = i >= 0 ? arguments[i] : process.cwd();
                    if (typeof path !== "string") {
                        throw new TypeError("Arguments to path.resolve must be strings")
                    } else if (!path) {
                        continue
                    }
                    resolvedPath = path + "/" + resolvedPath;
                    resolvedAbsolute = path.charAt(0) === "/"
                }
                resolvedPath = normalizeArray(filter(resolvedPath.split("/"), function(p) {
                    return !!p
                }), !resolvedAbsolute).join("/");
                return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
            };
            exports.normalize = function(path) {
                var isAbsolute = exports.isAbsolute(path),
                    trailingSlash = substr(path, -1) === "/";
                path = normalizeArray(filter(path.split("/"), function(p) {
                    return !!p
                }), !isAbsolute).join("/");
                if (!path && !isAbsolute) {
                    path = "."
                }
                if (path && trailingSlash) {
                    path += "/"
                }
                return (isAbsolute ? "/" : "") + path
            };
            exports.isAbsolute = function(path) {
                return path.charAt(0) === "/"
            };
            exports.join = function() {
                var paths = Array.prototype.slice.call(arguments, 0);
                return exports.normalize(filter(paths, function(p, index) {
                    if (typeof p !== "string") {
                        throw new TypeError("Arguments to path.join must be strings")
                    }
                    return p
                }).join("/"))
            };
            exports.relative = function(from, to) {
                from = exports.resolve(from).substr(1);
                to = exports.resolve(to).substr(1);

                function trim(arr) {
                    var start = 0;
                    for (; start < arr.length; start++) {
                        if (arr[start] !== "") break
                    }
                    var end = arr.length - 1;
                    for (; end >= 0; end--) {
                        if (arr[end] !== "") break
                    }
                    if (start > end) return [];
                    return arr.slice(start, end - start + 1)
                }
                var fromParts = trim(from.split("/"));
                var toParts = trim(to.split("/"));
                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                    if (fromParts[i] !== toParts[i]) {
                        samePartsLength = i;
                        break
                    }
                }
                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                    outputParts.push("..")
                }
                outputParts = outputParts.concat(toParts.slice(samePartsLength));
                return outputParts.join("/")
            };
            exports.sep = "/";
            exports.delimiter = ":";
            exports.dirname = function(path) {
                var result = splitPath(path),
                    root = result[0],
                    dir = result[1];
                if (!root && !dir) {
                    return "."
                }
                if (dir) {
                    dir = dir.substr(0, dir.length - 1)
                }
                return root + dir
            };
            exports.basename = function(path, ext) {
                var f = splitPath(path)[2];
                if (ext && f.substr(-1 * ext.length) === ext) {
                    f = f.substr(0, f.length - ext.length)
                }
                return f
            };
            exports.extname = function(path) {
                return splitPath(path)[3]
            };

            function filter(xs, f) {
                if (xs.filter) return xs.filter(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    if (f(xs[i], i, xs)) res.push(xs[i])
                }
                return res
            }
            var substr = "ab".substr(-1) === "b" ? function(str, start, len) {
                return str.substr(start, len)
            } : function(str, start, len) {
                if (start < 0) start = str.length + start;
                return str.substr(start, len)
            }
        }).call(exports, __webpack_require__(18))
    }, function(module, exports, __webpack_require__) {
        (function(Buffer) {
            var base64 = __webpack_require__(21);
            var ieee754 = __webpack_require__(19);
            var isArray = __webpack_require__(20);
            exports.Buffer = Buffer;
            exports.SlowBuffer = SlowBuffer;
            exports.INSPECT_MAX_BYTES = 50;
            Buffer.poolSize = 8192;
            var kMaxLength = 1073741823;
            var rootParent = {};
            Buffer.TYPED_ARRAY_SUPPORT = function() {
                try {
                    var buf = new ArrayBuffer(0);
                    var arr = new Uint8Array(buf);
                    arr.foo = function() {
                        return 42
                    };
                    return arr.foo() === 42 && typeof arr.subarray === "function" && new Uint8Array(1).subarray(1, 1).byteLength === 0
                } catch (e) {
                    return false
                }
            }();

            function Buffer(subject, encoding) {
                var self = this;
                if (!(self instanceof Buffer)) return new Buffer(subject, encoding);
                var type = typeof subject;
                var length;
                if (type === "number") {
                    length = +subject
                } else if (type === "string") {
                    length = Buffer.byteLength(subject, encoding)
                } else if (type === "object" && subject !== null) {
                    if (subject.type === "Buffer" && isArray(subject.data)) subject = subject.data;
                    length = +subject.length
                } else {
                    throw new TypeError("must start with number, buffer, array or string")
                }
                if (length > kMaxLength) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength.toString(16) + " bytes")
                }
                if (length < 0) length = 0;
                else length >>>= 0;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    self = Buffer._augment(new Uint8Array(length))
                } else {
                    self.length = length;
                    self._isBuffer = true
                }
                var i;
                if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === "number") {
                    self._set(subject)
                } else if (isArrayish(subject)) {
                    if (Buffer.isBuffer(subject)) {
                        for (i = 0; i < length; i++) {
                            self[i] = subject.readUInt8(i)
                        }
                    } else {
                        for (i = 0; i < length; i++) {
                            self[i] = (subject[i] % 256 + 256) % 256
                        }
                    }
                } else if (type === "string") {
                    self.write(subject, 0, encoding)
                } else if (type === "number" && !Buffer.TYPED_ARRAY_SUPPORT) {
                    for (i = 0; i < length; i++) {
                        self[i] = 0
                    }
                }
                if (length > 0 && length <= Buffer.poolSize) self.parent = rootParent;
                return self
            }

            function SlowBuffer(subject, encoding) {
                if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);
                var buf = new Buffer(subject, encoding);
                delete buf.parent;
                return buf
            }
            Buffer.isBuffer = function isBuffer(b) {
                return !!(b != null && b._isBuffer)
            };
            Buffer.compare = function compare(a, b) {
                if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                    throw new TypeError("Arguments must be Buffers")
                }
                if (a === b) return 0;
                var x = a.length;
                var y = b.length;
                for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
                if (i !== len) {
                    x = a[i];
                    y = b[i]
                }
                if (x < y) return -1;
                if (y < x) return 1;
                return 0
            };
            Buffer.isEncoding = function isEncoding(encoding) {
                switch (String(encoding).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "binary":
                    case "base64":
                    case "raw":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return true;
                    default:
                        return false
                }
            };
            Buffer.concat = function concat(list, totalLength) {
                if (!isArray(list)) throw new TypeError("list argument must be an Array of Buffers.");
                if (list.length === 0) {
                    return new Buffer(0)
                } else if (list.length === 1) {
                    return list[0]
                }
                var i;
                if (totalLength === undefined) {
                    totalLength = 0;
                    for (i = 0; i < list.length; i++) {
                        totalLength += list[i].length
                    }
                }
                var buf = new Buffer(totalLength);
                var pos = 0;
                for (i = 0; i < list.length; i++) {
                    var item = list[i];
                    item.copy(buf, pos);
                    pos += item.length
                }
                return buf
            };
            Buffer.byteLength = function byteLength(str, encoding) {
                var ret;
                str = str + "";
                switch (encoding || "utf8") {
                    case "ascii":
                    case "binary":
                    case "raw":
                        ret = str.length;
                        break;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        ret = str.length * 2;
                        break;
                    case "hex":
                        ret = str.length >>> 1;
                        break;
                    case "utf8":
                    case "utf-8":
                        ret = utf8ToBytes(str).length;
                        break;
                    case "base64":
                        ret = base64ToBytes(str).length;
                        break;
                    default:
                        ret = str.length
                }
                return ret
            };
            Buffer.prototype.length = undefined;
            Buffer.prototype.parent = undefined;
            Buffer.prototype.toString = function toString(encoding, start, end) {
                var loweredCase = false;
                start = start >>> 0;
                end = end === undefined || end === Infinity ? this.length : end >>> 0;
                if (!encoding) encoding = "utf8";
                if (start < 0) start = 0;
                if (end > this.length) end = this.length;
                if (end <= start) return "";
                while (true) {
                    switch (encoding) {
                        case "hex":
                            return hexSlice(this, start, end);
                        case "utf8":
                        case "utf-8":
                            return utf8Slice(this, start, end);
                        case "ascii":
                            return asciiSlice(this, start, end);
                        case "binary":
                            return binarySlice(this, start, end);
                        case "base64":
                            return base64Slice(this, start, end);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return utf16leSlice(this, start, end);
                        default:
                            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                            encoding = (encoding + "").toLowerCase();
                            loweredCase = true
                    }
                }
            };
            Buffer.prototype.equals = function equals(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return true;
                return Buffer.compare(this, b) === 0
            };
            Buffer.prototype.inspect = function inspect() {
                var str = "";
                var max = exports.INSPECT_MAX_BYTES;
                if (this.length > 0) {
                    str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                    if (this.length > max) str += " ... "
                }
                return "<Buffer " + str + ">"
            };
            Buffer.prototype.compare = function compare(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return 0;
                return Buffer.compare(this, b)
            };
            Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
                if (byteOffset > 2147483647) byteOffset = 2147483647;
                else if (byteOffset < -2147483648) byteOffset = -2147483648;
                byteOffset >>= 0;
                if (this.length === 0) return -1;
                if (byteOffset >= this.length) return -1;
                if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);
                if (typeof val === "string") {
                    if (val.length === 0) return -1;
                    return String.prototype.indexOf.call(this, val, byteOffset)
                }
                if (Buffer.isBuffer(val)) {
                    return arrayIndexOf(this, val, byteOffset)
                }
                if (typeof val === "number") {
                    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === "function") {
                        return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
                    }
                    return arrayIndexOf(this, [val], byteOffset)
                }

                function arrayIndexOf(arr, val, byteOffset) {
                    var foundIndex = -1;
                    for (var i = 0; byteOffset + i < arr.length; i++) {
                        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                            if (foundIndex === -1) foundIndex = i;
                            if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
                        } else {
                            foundIndex = -1
                        }
                    }
                    return -1
                }
                throw new TypeError("val must be string, number or Buffer")
            };
            Buffer.prototype.get = function get(offset) {
                console.log(".get() is deprecated. Access using array indexes instead.");
                return this.readUInt8(offset)
            };
            Buffer.prototype.set = function set(v, offset) {
                console.log(".set() is deprecated. Access using array indexes instead.");
                return this.writeUInt8(v, offset)
            };

            function hexWrite(buf, string, offset, length) {
                offset = Number(offset) || 0;
                var remaining = buf.length - offset;
                if (!length) {
                    length = remaining
                } else {
                    length = Number(length);
                    if (length > remaining) {
                        length = remaining
                    }
                }
                var strLen = string.length;
                if (strLen % 2 !== 0) throw new Error("Invalid hex string");
                if (length > strLen / 2) {
                    length = strLen / 2
                }
                for (var i = 0; i < length; i++) {
                    var parsed = parseInt(string.substr(i * 2, 2), 16);
                    if (isNaN(parsed)) throw new Error("Invalid hex string");
                    buf[offset + i] = parsed
                }
                return i
            }

            function utf8Write(buf, string, offset, length) {
                var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
                return charsWritten
            }

            function asciiWrite(buf, string, offset, length) {
                var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length);
                return charsWritten
            }

            function binaryWrite(buf, string, offset, length) {
                return asciiWrite(buf, string, offset, length)
            }

            function base64Write(buf, string, offset, length) {
                var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length);
                return charsWritten
            }

            function utf16leWrite(buf, string, offset, length) {
                var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
                return charsWritten
            }
            Buffer.prototype.write = function write(string, offset, length, encoding) {
                if (isFinite(offset)) {
                    if (!isFinite(length)) {
                        encoding = length;
                        length = undefined
                    }
                } else {
                    var swap = encoding;
                    encoding = offset;
                    offset = length;
                    length = swap
                }
                offset = Number(offset) || 0;
                if (length < 0 || offset < 0 || offset > this.length) {
                    throw new RangeError("attempt to write outside buffer bounds")
                }
                var remaining = this.length - offset;
                if (!length) {
                    length = remaining
                } else {
                    length = Number(length);
                    if (length > remaining) {
                        length = remaining
                    }
                }
                encoding = String(encoding || "utf8").toLowerCase();
                var ret;
                switch (encoding) {
                    case "hex":
                        ret = hexWrite(this, string, offset, length);
                        break;
                    case "utf8":
                    case "utf-8":
                        ret = utf8Write(this, string, offset, length);
                        break;
                    case "ascii":
                        ret = asciiWrite(this, string, offset, length);
                        break;
                    case "binary":
                        ret = binaryWrite(this, string, offset, length);
                        break;
                    case "base64":
                        ret = base64Write(this, string, offset, length);
                        break;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        ret = utf16leWrite(this, string, offset, length);
                        break;
                    default:
                        throw new TypeError("Unknown encoding: " + encoding)
                }
                return ret
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                }
            };

            function base64Slice(buf, start, end) {
                if (start === 0 && end === buf.length) {
                    return base64.fromByteArray(buf)
                } else {
                    return base64.fromByteArray(buf.slice(start, end))
                }
            }

            function utf8Slice(buf, start, end) {
                var res = "";
                var tmp = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    if (buf[i] <= 127) {
                        res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                        tmp = ""
                    } else {
                        tmp += "%" + buf[i].toString(16)
                    }
                }
                return res + decodeUtf8Char(tmp)
            }

            function asciiSlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i] & 127)
                }
                return ret
            }

            function binarySlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i])
                }
                return ret
            }

            function hexSlice(buf, start, end) {
                var len = buf.length;
                if (!start || start < 0) start = 0;
                if (!end || end < 0 || end > len) end = len;
                var out = "";
                for (var i = start; i < end; i++) {
                    out += toHex(buf[i])
                }
                return out
            }

            function utf16leSlice(buf, start, end) {
                var bytes = buf.slice(start, end);
                var res = "";
                for (var i = 0; i < bytes.length; i += 2) {
                    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
                }
                return res
            }
            Buffer.prototype.slice = function slice(start, end) {
                var len = this.length;
                start = ~~start;
                end = end === undefined ? len : ~~end;
                if (start < 0) {
                    start += len;
                    if (start < 0) start = 0
                } else if (start > len) {
                    start = len
                }
                if (end < 0) {
                    end += len;
                    if (end < 0) end = 0
                } else if (end > len) {
                    end = len
                }
                if (end < start) end = start;
                var newBuf;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    newBuf = Buffer._augment(this.subarray(start, end))
                } else {
                    var sliceLen = end - start;
                    newBuf = new Buffer(sliceLen, undefined);
                    for (var i = 0; i < sliceLen; i++) {
                        newBuf[i] = this[i + start]
                    }
                }
                if (newBuf.length) newBuf.parent = this.parent || this;
                return newBuf
            };

            function checkOffset(offset, ext, length) {
                if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length")
            }
            Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul
                }
                return val
            };
            Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) {
                    checkOffset(offset, byteLength, this.length)
                }
                var val = this[offset + --byteLength];
                var mul = 1;
                while (byteLength > 0 && (mul *= 256)) {
                    val += this[offset + --byteLength] * mul
                }
                return val
            };
            Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                return this[offset]
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] | this[offset + 1] << 8
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] << 8 | this[offset + 1]
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3])
            };
            Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val
            };
            Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var i = byteLength;
                var mul = 1;
                var val = this[offset + --i];
                while (i > 0 && (mul *= 256)) {
                    val += this[offset + --i] * mul
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val
            };
            Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                if (!(this[offset] & 128)) return this[offset];
                return (255 - this[offset] + 1) * -1
            };
            Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset] | this[offset + 1] << 8;
                return val & 32768 ? val | 4294901760 : val
            };
            Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset + 1] | this[offset] << 8;
                return val & 32768 ? val | 4294901760 : val
            };
            Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24
            };
            Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]
            };
            Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, true, 23, 4)
            };
            Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, false, 23, 4)
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, true, 52, 8)
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, false, 52, 8)
            };

            function checkInt(buf, value, offset, ext, max, min) {
                if (!Buffer.isBuffer(buf)) throw new TypeError("buffer must be a Buffer instance");
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range")
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var mul = 1;
                var i = 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = value / mul >>> 0 & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                byteLength = byteLength >>> 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var i = byteLength - 1;
                var mul = 1;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = value / mul >>> 0 & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                this[offset] = value;
                return offset + 1
            };

            function objectWriteUInt16(buf, value, offset, littleEndian) {
                if (value < 0) value = 65535 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
                    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8
                }
            }
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8
                } else {
                    objectWriteUInt16(this, value, offset, true)
                }
                return offset + 2
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value
                } else {
                    objectWriteUInt16(this, value, offset, false)
                }
                return offset + 2
            };

            function objectWriteUInt32(buf, value, offset, littleEndian) {
                if (value < 0) value = 4294967295 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
                    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255
                }
            }
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset + 3] = value >>> 24;
                    this[offset + 2] = value >>> 16;
                    this[offset + 1] = value >>> 8;
                    this[offset] = value
                } else {
                    objectWriteUInt32(this, value, offset, true)
                }
                return offset + 4
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value
                } else {
                    objectWriteUInt32(this, value, offset, false)
                }
                return offset + 4
            };
            Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength - 1) - 1, -Math.pow(2, 8 * byteLength - 1))
                }
                var i = 0;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) {
                    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength - 1) - 1, -Math.pow(2, 8 * byteLength - 1))
                }
                var i = byteLength - 1;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                if (value < 0) value = 255 + value + 1;
                this[offset] = value;
                return offset + 1
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8
                } else {
                    objectWriteUInt16(this, value, offset, true)
                }
                return offset + 2
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value
                } else {
                    objectWriteUInt16(this, value, offset, false)
                }
                return offset + 2
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8;
                    this[offset + 2] = value >>> 16;
                    this[offset + 3] = value >>> 24
                } else {
                    objectWriteUInt32(this, value, offset, true)
                }
                return offset + 4
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset >>> 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (value < 0) value = 4294967295 + value + 1;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value
                } else {
                    objectWriteUInt32(this, value, offset, false)
                }
                return offset + 4
            };

            function checkIEEE754(buf, value, offset, ext, max, min) {
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range");
                if (offset < 0) throw new RangeError("index out of range")
            }

            function writeFloat(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38)
                }
                ieee754.write(buf, value, offset, littleEndian, 23, 4);
                return offset + 4
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                return writeFloat(this, value, offset, true, noAssert)
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308)
                }
                ieee754.write(buf, value, offset, littleEndian, 52, 8);
                return offset + 8
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                return writeDouble(this, value, offset, true, noAssert)
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                return writeDouble(this, value, offset, false, noAssert)
            };
            Buffer.prototype.copy = function copy(target, target_start, start, end) {
                if (!start) start = 0;
                if (!end && end !== 0) end = this.length;
                if (target_start >= target.length) target_start = target.length;
                if (!target_start) target_start = 0;
                if (end > 0 && end < start) end = start;
                if (end === start) return 0;
                if (target.length === 0 || this.length === 0) return 0;
                if (target_start < 0) {
                    throw new RangeError("targetStart out of bounds")
                }
                if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                if (end < 0) throw new RangeError("sourceEnd out of bounds");
                if (end > this.length) end = this.length;
                if (target.length - target_start < end - start) {
                    end = target.length - target_start + start
                }
                var len = end - start;
                if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
                    for (var i = 0; i < len; i++) {
                        target[i + target_start] = this[i + start]
                    }
                } else {
                    target._set(this.subarray(start, start + len), target_start)
                }
                return len
            };
            Buffer.prototype.fill = function fill(value, start, end) {
                if (!value) value = 0;
                if (!start) start = 0;
                if (!end) end = this.length;
                if (end < start) throw new RangeError("end < start");
                if (end === start) return;
                if (this.length === 0) return;
                if (start < 0 || start >= this.length) throw new RangeError("start out of bounds");
                if (end < 0 || end > this.length) throw new RangeError("end out of bounds");
                var i;
                if (typeof value === "number") {
                    for (i = start; i < end; i++) {
                        this[i] = value
                    }
                } else {
                    var bytes = utf8ToBytes(value.toString());
                    var len = bytes.length;
                    for (i = start; i < end; i++) {
                        this[i] = bytes[i % len]
                    }
                }
                return this
            };
            Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
                if (typeof Uint8Array !== "undefined") {
                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        return new Buffer(this).buffer
                    } else {
                        var buf = new Uint8Array(this.length);
                        for (var i = 0, len = buf.length; i < len; i += 1) {
                            buf[i] = this[i]
                        }
                        return buf.buffer
                    }
                } else {
                    throw new TypeError("Buffer.toArrayBuffer not supported in this browser")
                }
            };
            var BP = Buffer.prototype;
            Buffer._augment = function _augment(arr) {
                arr.constructor = Buffer;
                arr._isBuffer = true;
                arr._set = arr.set;
                arr.get = BP.get;
                arr.set = BP.set;
                arr.write = BP.write;
                arr.toString = BP.toString;
                arr.toLocaleString = BP.toString;
                arr.toJSON = BP.toJSON;
                arr.equals = BP.equals;
                arr.compare = BP.compare;
                arr.indexOf = BP.indexOf;
                arr.copy = BP.copy;
                arr.slice = BP.slice;
                arr.readUIntLE = BP.readUIntLE;
                arr.readUIntBE = BP.readUIntBE;
                arr.readUInt8 = BP.readUInt8;
                arr.readUInt16LE = BP.readUInt16LE;
                arr.readUInt16BE = BP.readUInt16BE;
                arr.readUInt32LE = BP.readUInt32LE;
                arr.readUInt32BE = BP.readUInt32BE;
                arr.readIntLE = BP.readIntLE;
                arr.readIntBE = BP.readIntBE;
                arr.readInt8 = BP.readInt8;
                arr.readInt16LE = BP.readInt16LE;
                arr.readInt16BE = BP.readInt16BE;
                arr.readInt32LE = BP.readInt32LE;
                arr.readInt32BE = BP.readInt32BE;
                arr.readFloatLE = BP.readFloatLE;
                arr.readFloatBE = BP.readFloatBE;
                arr.readDoubleLE = BP.readDoubleLE;
                arr.readDoubleBE = BP.readDoubleBE;
                arr.writeUInt8 = BP.writeUInt8;
                arr.writeUIntLE = BP.writeUIntLE;
                arr.writeUIntBE = BP.writeUIntBE;
                arr.writeUInt16LE = BP.writeUInt16LE;
                arr.writeUInt16BE = BP.writeUInt16BE;
                arr.writeUInt32LE = BP.writeUInt32LE;
                arr.writeUInt32BE = BP.writeUInt32BE;
                arr.writeIntLE = BP.writeIntLE;
                arr.writeIntBE = BP.writeIntBE;
                arr.writeInt8 = BP.writeInt8;
                arr.writeInt16LE = BP.writeInt16LE;
                arr.writeInt16BE = BP.writeInt16BE;
                arr.writeInt32LE = BP.writeInt32LE;
                arr.writeInt32BE = BP.writeInt32BE;
                arr.writeFloatLE = BP.writeFloatLE;
                arr.writeFloatBE = BP.writeFloatBE;
                arr.writeDoubleLE = BP.writeDoubleLE;
                arr.writeDoubleBE = BP.writeDoubleBE;
                arr.fill = BP.fill;
                arr.inspect = BP.inspect;
                arr.toArrayBuffer = BP.toArrayBuffer;
                return arr
            };
            var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;

            function base64clean(str) {
                str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                if (str.length < 2) return "";
                while (str.length % 4 !== 0) {
                    str = str + "="
                }
                return str
            }

            function stringtrim(str) {
                if (str.trim) return str.trim();
                return str.replace(/^\s+|\s+$/g, "")
            }

            function isArrayish(subject) {
                return isArray(subject) || Buffer.isBuffer(subject) || subject && typeof subject === "object" && typeof subject.length === "number"
            }

            function toHex(n) {
                if (n < 16) return "0" + n.toString(16);
                return n.toString(16)
            }

            function utf8ToBytes(string, units) {
                units = units || Infinity;
                var codePoint;
                var length = string.length;
                var leadSurrogate = null;
                var bytes = [];
                var i = 0;
                for (; i < length; i++) {
                    codePoint = string.charCodeAt(i);
                    if (codePoint > 55295 && codePoint < 57344) {
                        if (leadSurrogate) {
                            if (codePoint < 56320) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                leadSurrogate = codePoint;
                                continue
                            } else {
                                codePoint = leadSurrogate - 55296 << 10 | codePoint - 56320 | 65536;
                                leadSurrogate = null
                            }
                        } else {
                            if (codePoint > 56319) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue
                            } else if (i + 1 === length) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue
                            } else {
                                leadSurrogate = codePoint;
                                continue
                            }
                        }
                    } else if (leadSurrogate) {
                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                        leadSurrogate = null
                    }
                    if (codePoint < 128) {
                        if ((units -= 1) < 0) break;
                        bytes.push(codePoint)
                    } else if (codePoint < 2048) {
                        if ((units -= 2) < 0) break;
                        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128)
                    } else if (codePoint < 65536) {
                        if ((units -= 3) < 0) break;
                        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                    } else if (codePoint < 2097152) {
                        if ((units -= 4) < 0) break;
                        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                    } else {
                        throw new Error("Invalid code point")
                    }
                }
                return bytes
            }

            function asciiToBytes(str) {
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    byteArray.push(str.charCodeAt(i) & 255)
                }
                return byteArray
            }

            function utf16leToBytes(str, units) {
                var c, hi, lo;
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    if ((units -= 2) < 0) break;
                    c = str.charCodeAt(i);
                    hi = c >> 8;
                    lo = c % 256;
                    byteArray.push(lo);
                    byteArray.push(hi)
                }
                return byteArray
            }

            function base64ToBytes(str) {
                return base64.toByteArray(base64clean(str))
            }

            function blitBuffer(src, dst, offset, length) {
                for (var i = 0; i < length; i++) {
                    if (i + offset >= dst.length || i >= src.length) break;
                    dst[i + offset] = src[i]
                }
                return i
            }

            function decodeUtf8Char(str) {
                try {
                    return decodeURIComponent(str)
                } catch (err) {
                    return String.fromCharCode(65533)
                }
            }
        }).call(exports, __webpack_require__(7).Buffer)
    }, function(module, exports, __webpack_require__) {
        "use strict";

        function isBMP(buffer) {
            return "BM" === buffer.toString("ascii", 0, 2)
        }

        function calculate(buffer) {
            return {
                width: buffer.readUInt32LE(18),
                height: buffer.readUInt32LE(22)
            }
        }
        module.exports = {
            detect: isBMP,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var gifRegexp = /^GIF8[7,9]a/;

        function isGIF(buffer) {
            var signature = buffer.toString("ascii", 0, 6);
            return gifRegexp.test(signature)
        }

        function calculate(buffer) {
            return {
                width: buffer.readUInt16LE(6),
                height: buffer.readUInt16LE(8)
            }
        }
        module.exports = {
            detect: isGIF,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var validJFIFMarkers = {
            ffdb: "0001010101",
            ffe0: "4a46494600",
            ffe1: "4578696600",
            ffe2: "4943435f50",
            ffe3: "",
            ffe8: "5350494646",
            ffec: "4475636b79",
            ffed: "50686f746f",
            ffee: "41646f6265"
        };
        var red = ["[31m", "[39m"];

        function isJPG(buffer) {
            var SOIMarker = buffer.toString("hex", 0, 2);
            var JFIFMarker = buffer.toString("hex", 2, 4);
            if ("ffd8" !== SOIMarker) {
                return false
            }
            var got = buffer.toString("hex", 6, 11);
            var expected = JFIFMarker && validJFIFMarkers[JFIFMarker];
            if (expected === "") {
                console.warn(red[0] + "this looks like a unrecognised jpeg\n" + "please report the issue here\n" + red[1], "	https://github.com/netroy/image-size/issues/new\n");
                return false
            }
            return got === expected || JFIFMarker === "ffdb"
        }

        function extractSize(buffer, i) {
            return {
                height: buffer.readUInt16BE(i),
                width: buffer.readUInt16BE(i + 2)
            }
        }

        function validateBuffer(buffer, i) {
            if (i > buffer.length) {
                throw new TypeError("Corrupt JPG, exceeded buffer limits")
            }
            if (buffer[i] !== 255) {
                throw new TypeError("Invalid JPG, marker table corrupted")
            }
        }

        function calculate(buffer) {
            buffer = buffer.slice(4);
            var i, next;
            while (buffer.length) {
                i = buffer.readUInt16BE(0);
                validateBuffer(buffer, i);
                next = buffer[i + 1];
                if (next === 192 || next === 194) {
                    return extractSize(buffer, i + 5)
                }
                buffer = buffer.slice(i + 2)
            }
            throw new TypeError("Invalid JPG, no size found")
        }
        module.exports = {
            detect: isJPG,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var pngSignature = "PNG\r\n\n";

        function isPNG(buffer) {
            if (pngSignature === buffer.toString("ascii", 1, 8)) {
                if ("IHDR" !== buffer.toString("ascii", 12, 16)) {
                    throw new TypeError("invalid png")
                }
                return true
            }
        }

        function calculate(buffer) {
            return {
                width: buffer.readUInt32BE(16),
                height: buffer.readUInt32BE(20)
            }
        }
        module.exports = {
            detect: isPNG,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";

        function isPSD(buffer) {
            return "8BPS" === buffer.toString("ascii", 0, 4)
        }

        function calculate(buffer) {
            return {
                width: buffer.readUInt32BE(18),
                height: buffer.readUInt32BE(14)
            }
        }
        module.exports = {
            detect: isPSD,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var svgReg = /<svg[^>]+[^>]*>/;

        function isSVG(buffer) {
            return svgReg.test(buffer)
        }
        var extractorRegExps = {
            root: /<svg [^>]+>/,
            width: /(^|\s)width\s*=\s*"(.+?)"/i,
            height: /(^|\s)height\s*=\s*"(.+?)"/i,
            viewbox: /(^|\s)viewbox\s*=\s*"(.+?)"/i
        };

        function getRatio(viewbox) {
            var ratio = 1;
            if (viewbox && viewbox[2]) {
                var dim = viewbox[2].split(/\s/g);
                if (dim.length === 4) {
                    dim = dim.map(function(i) {
                        return parseInt(i, 10)
                    });
                    ratio = (dim[2] - dim[0]) / (dim[3] - dim[1])
                }
            }
            return ratio
        }

        function parse(buffer) {
            var body = buffer.toString().replace(/[\r\n\s]+/g, " ");
            var section = body.match(extractorRegExps.root);
            var root = section && section[0];
            if (root) {
                var width = root.match(extractorRegExps.width);
                var height = root.match(extractorRegExps.height);
                var viewbox = root.match(extractorRegExps.viewbox);
                var ratio = getRatio(viewbox);
                return {
                    width: parseInt(width && width[2], 10) || 0,
                    height: parseInt(height && height[2], 10) || 0,
                    ratio: ratio
                }
            }
        }

        function calculate(buffer) {
            var parsed = parse(buffer);
            var width = parsed.width;
            var height = parsed.height;
            var ratio = parsed.ratio;
            if (width && height) {
                return {
                    width: width,
                    height: height
                }
            } else {
                if (width) {
                    return {
                        width: width,
                        height: Math.floor(width / ratio)
                    }
                } else if (height) {
                    return {
                        width: Math.floor(height * ratio),
                        height: height
                    }
                } else {
                    throw new TypeError("invalid svg")
                }
            }
        }
        module.exports = {
            detect: isSVG,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {
        (function(Buffer) {
            "use strict";
            var fs = __webpack_require__(16);
            var readUInt = __webpack_require__(17);

            function isTIFF(buffer) {
                var hex4 = buffer.toString("hex", 0, 4);
                return "49492a00" === hex4 || "4d4d002a" === hex4
            }

            function readIFD(buffer, filepath, isBigEndian) {
                var ifdOffset = readUInt(buffer, 32, 4, isBigEndian);
                var bufferSize = 1024;
                var fileSize = fs.statSync(filepath).size;
                if (ifdOffset + bufferSize > fileSize) {
                    bufferSize = fileSize - ifdOffset - 10
                }
                var endBuffer = new Buffer(bufferSize);
                var descriptor = fs.openSync(filepath, "r");
                fs.readSync(descriptor, endBuffer, 0, bufferSize, ifdOffset);
                var ifdBuffer = endBuffer.slice(2);
                return ifdBuffer
            }

            function readValue(buffer, isBigEndian) {
                var low = readUInt(buffer, 16, 8, isBigEndian);
                var high = readUInt(buffer, 16, 10, isBigEndian);
                return (high << 16) + low
            }

            function nextTag(buffer) {
                if (buffer.length > 24) {
                    return buffer.slice(12)
                }
            }

            function extractTags(buffer, isBigEndian) {
                var tags = {};
                var code, type, length;
                while (buffer && buffer.length) {
                    code = readUInt(buffer, 16, 0, isBigEndian);
                    type = readUInt(buffer, 16, 2, isBigEndian);
                    length = readUInt(buffer, 32, 4, isBigEndian);
                    if (code === 0) {
                        break
                    } else {
                        if (length === 1 && type === 3) {
                            tags[code] = readValue(buffer, isBigEndian)
                        }
                        buffer = nextTag(buffer)
                    }
                }
                return tags
            }

            function determineEndianness(buffer) {
                var signature = buffer.toString("ascii", 0, 2);
                if ("II" === signature) {
                    return "LE"
                } else if ("MM" === signature) {
                    return "BE"
                }
            }

            function calculate(buffer, filepath) {
                if (!filepath) {
                    throw new TypeError("Tiff doesn't support buffer")
                }
                var isBigEndian = determineEndianness(buffer) === "BE";
                var ifdBuffer = readIFD(buffer, filepath, isBigEndian);
                var tags = extractTags(ifdBuffer, isBigEndian);
                var width = tags[256];
                var height = tags[257];
                if (!width || !height) {
                    throw new TypeError("Invalid Tiff, missing tags")
                }
                return {
                    width: width,
                    height: height
                }
            }
            module.exports = {
                detect: isTIFF,
                calculate: calculate
            }
        }).call(exports, __webpack_require__(7).Buffer)
    }, function(module, exports, __webpack_require__) {
        "use strict";

        function isWebP(buffer) {
            var riffHeader = "RIFF" === buffer.toString("ascii", 0, 4);
            var webpHeader = "WEBP" === buffer.toString("ascii", 8, 12);
            var vp8Header = "VP8" === buffer.toString("ascii", 12, 15);
            return riffHeader && webpHeader && vp8Header
        }

        function calculate(buffer) {
            var chunkHeader = buffer.toString("ascii", 12, 16);
            buffer = buffer.slice(20, 30);
            if (chunkHeader === "VP8 " && buffer[0] !== 47) {
                return calculateLossy(buffer)
            }
            var signature = buffer.toString("hex", 3, 6);
            if (chunkHeader === "VP8L" && signature !== "9d012a") {
                return calculateLossless(buffer)
            }
            return false
        }

        function calculateLossless(buffer) {
            return {
                width: 1 + ((buffer[2] & 63) << 8 | buffer[1]),
                height: 1 + ((buffer[4] & 15) << 10 | buffer[3] << 2 | (buffer[2] & 192) >> 6)
            }
        }

        function calculateLossy(buffer) {
            return {
                width: buffer.readInt16LE(6) & 16383,
                height: buffer.readInt16LE(8) & 16383
            }
        }
        module.exports = {
            detect: isWebP,
            calculate: calculate
        }
    }, function(module, exports, __webpack_require__) {}, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = function(buffer, bits, offset, isBigEndian) {
            offset = offset || 0;
            var endian = !!isBigEndian ? "BE" : "LE";
            var method = buffer["readUInt" + bits + endian];
            return method.call(buffer, offset)
        }
    }, function(module, exports, __webpack_require__) {
        var process = module.exports = {};
        var queue = [];
        var draining = false;

        function drainQueue() {
            if (draining) {
                return
            }
            draining = true;
            var currentQueue;
            var len = queue.length;
            while (len) {
                currentQueue = queue;
                queue = [];
                var i = -1;
                while (++i < len) {
                    currentQueue[i]()
                }
                len = queue.length
            }
            draining = false
        }
        process.nextTick = function(fun) {
            queue.push(fun);
            if (!draining) {
                setTimeout(drainQueue, 0)
            }
        };
        process.title = "browser";
        process.browser = true;
        process.env = {};
        process.argv = [];
        process.version = "";
        process.versions = {};

        function noop() {}
        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;
        process.binding = function(name) {
            throw new Error("process.binding is not supported")
        };
        process.cwd = function() {
            return "/"
        };
        process.chdir = function(dir) {
            throw new Error("process.chdir is not supported")
        };
        process.umask = function() {
            return 0
        }
    }, function(module, exports, __webpack_require__) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
            var e, m, eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                nBits = -7,
                i = isLE ? nBytes - 1 : 0,
                d = isLE ? -1 : 1,
                s = buffer[offset + i];
            i += d;
            e = s & (1 << -nBits) - 1;
            s >>= -nBits;
            nBits += eLen;
            for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
            m = e & (1 << -nBits) - 1;
            e >>= -nBits;
            nBits += mLen;
            for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
            if (e === 0) {
                e = 1 - eBias
            } else if (e === eMax) {
                return m ? NaN : (s ? -1 : 1) * Infinity
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        };
        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c, eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                i = isLE ? 0 : nBytes - 1,
                d = isLE ? 1 : -1,
                s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
            value = Math.abs(value);
            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2
                }
                if (e + eBias >= 1) {
                    value += rt / c
                } else {
                    value += rt * Math.pow(2, 1 - eBias)
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2
                }
                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen);
                    e = e + eBias
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0
                }
            }
            for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8);
            e = e << mLen | m;
            eLen += mLen;
            for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8);
            buffer[offset + i - d] |= s * 128
        }
    }, function(module, exports, __webpack_require__) {
        var isArray = Array.isArray;
        var str = Object.prototype.toString;
        module.exports = isArray || function(val) {
            return !!val && "[object Array]" == str.call(val)
        }
    }, function(module, exports, __webpack_require__) {
        var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        (function(exports) {
            "use strict";
            var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var PLUS = "+".charCodeAt(0);
            var SLASH = "/".charCodeAt(0);
            var NUMBER = "0".charCodeAt(0);
            var LOWER = "a".charCodeAt(0);
            var UPPER = "A".charCodeAt(0);
            var PLUS_URL_SAFE = "-".charCodeAt(0);
            var SLASH_URL_SAFE = "_".charCodeAt(0);

            function decode(elt) {
                var code = elt.charCodeAt(0);
                if (code === PLUS || code === PLUS_URL_SAFE) return 62;
                if (code === SLASH || code === SLASH_URL_SAFE) return 63;
                if (code < NUMBER) return -1;
                if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
                if (code < UPPER + 26) return code - UPPER;
                if (code < LOWER + 26) return code - LOWER + 26
            }

            function b64ToByteArray(b64) {
                var i, j, l, tmp, placeHolders, arr;
                if (b64.length % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4")
                }
                var len = b64.length;
                placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
                arr = new Arr(b64.length * 3 / 4 - placeHolders);
                l = placeHolders > 0 ? b64.length - 4 : b64.length;
                var L = 0;

                function push(v) {
                    arr[L++] = v
                }
                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
                    push((tmp & 16711680) >> 16);
                    push((tmp & 65280) >> 8);
                    push(tmp & 255)
                }
                if (placeHolders === 2) {
                    tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
                    push(tmp & 255)
                } else if (placeHolders === 1) {
                    tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
                    push(tmp >> 8 & 255);
                    push(tmp & 255)
                }
                return arr
            }

            function uint8ToBase64(uint8) {
                var i, extraBytes = uint8.length % 3,
                    output = "",
                    temp, length;

                function encode(num) {
                    return lookup.charAt(num)
                }

                function tripletToBase64(num) {
                    return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63)
                }
                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                    output += tripletToBase64(temp)
                }
                switch (extraBytes) {
                    case 1:
                        temp = uint8[uint8.length - 1];
                        output += encode(temp >> 2);
                        output += encode(temp << 4 & 63);
                        output += "==";
                        break;
                    case 2:
                        temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                        output += encode(temp >> 10);
                        output += encode(temp >> 4 & 63);
                        output += encode(temp << 2 & 63);
                        output += "=";
                        break
                }
                return output
            }
            exports.toByteArray = b64ToByteArray;
            exports.fromByteArray = uint8ToBase64
        })(false ? this.base64js = {} : exports)
    }])
});

