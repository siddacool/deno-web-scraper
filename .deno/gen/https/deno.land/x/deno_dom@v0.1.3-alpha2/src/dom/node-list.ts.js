const NodeListFakeClass = (() => {
    return class NodeList {
        constructor() {
            throw new TypeError("Illegal constructor");
        }
        static [Symbol.hasInstance](value) {
            return value.constructor === NodeListClass;
        }
    };
})();
export const nodeListMutatorSym = Symbol();
// We define the `NodeList` inside a closure to ensure that its
// `.name === "NodeList"` property stays intact, as we need to manipulate
// its prototype and completely change its TypeScript-recognized type.
const NodeListClass = (() => {
    // @ts-ignore
    class NodeList extends Array {
        // @ts-ignore
        forEach(cb, thisArg = undefined) {
            super.forEach(cb, thisArg);
        }
        item(index) {
            return this[index] ?? null;
        }
        [nodeListMutatorSym]() {
            return {
                push: Array.prototype.push.bind(this),
                splice: Array.prototype.splice.bind(this),
                indexOf: Array.prototype.indexOf.bind(this),
            };
        }
    }
    return NodeList;
})();
for (const staticMethod of [
    "from",
    "isArray",
    "of",
]) {
    NodeListClass[staticMethod] = undefined;
}
for (const instanceMethod of [
    "concat",
    "copyWithin",
    "every",
    "fill",
    "filter",
    "find",
    "findIndex",
    "flat",
    "flatMap",
    "includes",
    "indexOf",
    "join",
    "lastIndexOf",
    "map",
    "pop",
    "push",
    "reduce",
    "reduceRight",
    "reverse",
    "shift",
    "slice",
    "some",
    "sort",
    "splice",
    "toLocaleString",
    "unshift",
]) {
    NodeListClass.prototype[instanceMethod] = undefined;
}
export const NodeList = NodeListClass;
export const NodeListPublic = NodeListFakeClass;
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/dom/node-list.ts.js.map