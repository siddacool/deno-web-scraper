import { setLock, getLock } from "../constructor-lock.ts";
import { Node, NodeType, Text, Comment } from "./node.ts";
import { NodeList, nodeListMutatorSym } from "./node-list.ts";
import { Element } from "./element.ts";
import { DOM as NWAPI } from "./nwsapi-types.ts";
export class DOMImplementation {
    constructor() {
        if (getLock()) {
            throw new TypeError("Illegal constructor.");
        }
    }
    createDocument() {
        throw new Error("Unimplemented"); // TODO
    }
    createHTMLDocument(titleStr) {
        titleStr += "";
        // TODO: Figure out a way to make `setLock` invocations less redundant
        setLock(false);
        const doc = new HTMLDocument();
        setLock(false);
        const docType = new DocumentType("html", "", "");
        doc.appendChild(docType);
        const html = new Element("html", doc, []);
        html._setOwnerDocument(doc);
        const head = new Element("head", html, []);
        const body = new Element("body", html, []);
        const title = new Element("title", head, []);
        const titleText = new Text(titleStr);
        title.appendChild(titleText);
        doc.head = head;
        doc.body = body;
        setLock(true);
        return doc;
    }
    createDocumentType(qualifiedName, publicId, systemId) {
        setLock(false);
        const doctype = new DocumentType(qualifiedName, publicId, systemId);
        setLock(true);
        return doctype;
    }
}
export class DocumentType extends Node {
    constructor(name, publicId, systemId) {
        super("html", NodeType.DOCUMENT_TYPE_NODE, null);
        this.#qualifiedName = "";
        this.#publicId = "";
        this.#systemId = "";
        this.#qualifiedName = name;
        this.#publicId = publicId;
        this.#systemId = systemId;
    }
    #qualifiedName;
    #publicId;
    #systemId;
    get name() {
        return this.#qualifiedName;
    }
    get publicId() {
        return this.#publicId;
    }
    get systemId() {
        return this.#systemId;
    }
}
export class Document extends Node {
    constructor() {
        super((setLock(false), "#document"), NodeType.DOCUMENT_NODE, null);
        this.head = null;
        this.body = null;
        this.#lockState = false;
        this.#documentURI = "about:blank"; // TODO
        this.#title = "";
        this.#nwapi = NWAPI(this);
        setLock(false);
        this.implementation = new DOMImplementation();
        setLock(true);
    }
    #lockState;
    #documentURI; // TODO
    #title;
    #nwapi;
    // Expose the document's NWAPI for Element's access to
    // querySelector/querySelectorAll
    get _nwapi() {
        return this.#nwapi;
    }
    get documentURI() {
        return this.#documentURI;
    }
    get title() {
        return this.querySelector("title")?.textContent || "";
    }
    get cookie() {
        return ""; // TODO
    }
    set cookie(newCookie) {
        // TODO
    }
    get visibilityState() {
        return "visible";
    }
    get hidden() {
        return false;
    }
    get compatMode() {
        return "CSS1Compat";
    }
    get documentElement() {
        for (const node of this.childNodes) {
            if (node.nodeType === NodeType.ELEMENT_NODE) {
                return node;
            }
        }
        return null;
    }
    appendChild(child) {
        super.appendChild(child);
        child._setOwnerDocument(this);
    }
    createElement(tagName, options) {
        tagName = tagName.toUpperCase();
        setLock(false);
        const elm = new Element(tagName, null, []);
        elm._setOwnerDocument(this);
        setLock(true);
        return elm;
    }
    createTextNode(data) {
        return new Text(data);
    }
    createComment(data) {
        return new Comment(data);
    }
    querySelector(selectors) {
        return this.#nwapi.first(selectors, this);
    }
    querySelectorAll(selectors) {
        const nodeList = new NodeList();
        const mutator = nodeList[nodeListMutatorSym]();
        mutator.push(...this.#nwapi.select(selectors, this));
        return nodeList;
    }
    // TODO: DRY!!!
    getElementById(id) {
        for (const child of this.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                if (child.id === id) {
                    return child;
                }
                const search = child.getElementById(id);
                if (search) {
                    return search;
                }
            }
        }
        return null;
    }
    getElementsByTagName(tagName) {
        if (tagName === "*") {
            return this.documentElement
                ? this._getElementsByTagNameWildcard(this.documentElement, [])
                : [];
        }
        else {
            return this._getElementsByTagName(tagName.toUpperCase(), []);
        }
    }
    _getElementsByTagNameWildcard(node, search) {
        for (const child of this.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                search.push(child);
                child._getElementsByTagNameWildcard(search);
            }
        }
        return search;
    }
    _getElementsByTagName(tagName, search) {
        for (const child of this.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                if (child.tagName === tagName) {
                    search.push(child);
                }
                child._getElementsByTagName(tagName, search);
            }
        }
        return search;
    }
    getElementsByTagNameNS(_namespace, localName) {
        return this.getElementsByTagName(localName);
    }
    getElementsByClassName(className) {
        return this._getElementsByClassName(className, []);
    }
    _getElementsByClassName(className, search) {
        for (const child of this.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                if (child.classList.contains(className)) {
                    search.push(child);
                }
                child._getElementsByClassName(className, search);
            }
        }
        return search;
    }
    hasFocus() {
        return true;
    }
}
export class HTMLDocument extends Document {
    constructor() {
        let lock = getLock();
        super();
        if (lock) {
            throw new TypeError("Illegal constructor.");
        }
        setLock(false);
    }
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/dom/document.ts.js.map