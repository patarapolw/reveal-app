var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var ToNested = /** @class */ (function () {
    function ToNested(options) {
        this.options = {
            splitBy: "/",
            key: ""
        };
        Object.assign(this.options, options);
    }
    ToNested.prototype.toNested = function (records) {
        var e_1, _a;
        var _this = this;
        var decks = Array.from(new Set(records.map(function (r) {
            return r[_this.options.key] || "";
        }))).sort();
        var deckWithSubDecks = [];
        var _loop_1 = function (d) {
            var deck = d.split("/");
            deck.forEach(function (seg, i) {
                var subDeck = deck.slice(0, i + 1).join("/");
                if (deckWithSubDecks.indexOf(subDeck) === -1) {
                    deckWithSubDecks.push(subDeck);
                }
            });
        };
        try {
            for (var decks_1 = __values(decks), decks_1_1 = decks_1.next(); !decks_1_1.done; decks_1_1 = decks_1.next()) {
                var d = decks_1_1.value;
                _loop_1(d);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (decks_1_1 && !decks_1_1.done && (_a = decks_1.return)) _a.call(decks_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var output = [];
        deckWithSubDecks.forEach(function (d) {
            var deck = d.split("/");
            _this.recurseParseData(records, output, deck);
        });
        return output;
    };
    ToNested.prototype.recurseParseData = function (data, output, deck, _depth) {
        var e_2, _a, e_3, _b;
        var _this = this;
        if (_depth === void 0) { _depth = 0; }
        var doLoop = true;
        while (_depth < deck.length - 1) {
            try {
                for (var output_1 = (e_2 = void 0, __values(output)), output_1_1 = output_1.next(); !output_1_1.done; output_1_1 = output_1.next()) {
                    var c = output_1_1.value;
                    if (c.name === deck[_depth]) {
                        c.children = c.children || [];
                        this.recurseParseData(data, c.children, deck, _depth + 1);
                        doLoop = false;
                        break;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (output_1_1 && !output_1_1.done && (_a = output_1.return)) _a.call(output_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            _depth++;
            if (!doLoop) {
                break;
            }
        }
        if (doLoop && _depth === deck.length - 1) {
            var path_1 = deck.join("/");
            try {
                for (var _c = __values(data.filter(function (d) { return (d[_this.options.key] || "") === path_1; })), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var d = _d.value;
                    output.push({
                        name: deck[_depth] || d.title,
                        path: path_1 || d.title,
                        data: d
                    });
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    };
    return ToNested;
}());
export default ToNested;
