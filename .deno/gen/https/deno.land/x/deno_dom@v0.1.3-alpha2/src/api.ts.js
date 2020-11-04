export { nodesFromString } from "./deserialize.ts";
export * from "./dom/node.ts";
export * from "./dom/element.ts";
export * from "./dom/document.ts";
export * from "./dom/dom-parser.ts";
export { NodeListPublic as NodeList } from "./dom/node-list.ts";
export { HTMLCollectionPublic as HTMLCollection } from "./dom/html-collection.ts";
import { NodeList } from "./dom/node-list.ts";
import { HTMLCollection } from "./dom/html-collection.ts";
// Prevent childNodes and HTMLCollections from being seen as an arrays
const oldHasInstance = Array[Symbol.hasInstance];
Object.defineProperty(Array, Symbol.hasInstance, {
    value: (value) => {
        switch (value?.constructor) {
            case HTMLCollection:
            case NodeList:
                return false;
            default:
                return oldHasInstance.call(Array, value);
        }
    },
});
const oldIsArray = Array.isArray;
Object.defineProperty(Array, "isArray", {
    value: (value) => {
        switch (value?.constructor) {
            case HTMLCollection:
            case NodeList:
                return false;
            default:
                return oldIsArray.call(Array, value);
        }
    },
});
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/api.ts.js.map