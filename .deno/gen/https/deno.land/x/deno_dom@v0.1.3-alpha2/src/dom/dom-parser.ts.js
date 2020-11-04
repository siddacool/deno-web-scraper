import { setLock } from "../constructor-lock.ts";
import { nodesFromString } from "../deserialize.ts";
import { HTMLDocument, DocumentType } from "./document.ts";
export class DOMParser {
    parseFromString(source, mimeType) {
        if (mimeType !== "text/html") {
            throw new Error(`DOMParser: "${mimeType}" unimplemented`); // TODO
        }
        setLock(false);
        const doc = new HTMLDocument();
        setLock(false);
        const docType = new DocumentType("html", "", "");
        doc.appendChild(docType);
        const fakeDoc = nodesFromString(source);
        let htmlNode = null;
        for (const child of fakeDoc.childNodes) {
            doc.appendChild(child);
            if (child.nodeName === "HTML") {
                htmlNode = child;
            }
        }
        setLock(true);
        if (htmlNode) {
            for (const child of htmlNode.childNodes) {
                switch (child.tagName) {
                    case "HEAD":
                        doc.head = child;
                        break;
                    case "BODY":
                        doc.body = child;
                        break;
                }
            }
        }
        return doc;
    }
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/dom/dom-parser.ts.js.map