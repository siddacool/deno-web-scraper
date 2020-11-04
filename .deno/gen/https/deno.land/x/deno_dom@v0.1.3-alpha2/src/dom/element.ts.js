import { getLock } from "../constructor-lock.ts";
import { fragmentNodesFromString } from "../deserialize.ts";
import { Node, NodeType } from "./node.ts";
import { NodeList, nodeListMutatorSym } from "./node-list.ts";
export class DOMTokenList extends Set {
    contains(token) {
        return this.has(token);
    }
}
let attrLock = true;
export class Attr {
    constructor(map, name) {
        this.#namedNodeMap = null;
        this.#name = "";
        if (attrLock) {
            throw new TypeError("Illegal constructor");
        }
        this.#name = name;
        this.#namedNodeMap = map;
    }
    #namedNodeMap;
    #name;
    get name() {
        return this.#name;
    }
    get value() {
        return this.#namedNodeMap[this.#name];
    }
}
export class NamedNodeMap {
    constructor() {
        this.#attrObjCache = {};
    }
    #attrObjCache;
    newAttr(attribute) {
        attrLock = false;
        const attr = new Attr(this, attribute);
        attrLock = true;
        return attr;
    }
    getNamedItem(attribute) {
        return this.#attrObjCache[attribute] ?? (this.#attrObjCache[attribute] = this.newAttr(attribute));
    }
    setNamedItem(...args) {
        // TODO
    }
}
export class Element extends Node {
    constructor(tagName, parentNode, attributes) {
        super(tagName, NodeType.ELEMENT_NODE, parentNode);
        this.tagName = tagName;
        this.classList = new DOMTokenList();
        this.attributes = new NamedNodeMap();
        this.#currentId = "";
        if (getLock()) {
            throw new TypeError("Illegal constructor");
        }
        for (const attr of attributes) {
            this.attributes[attr[0]] = attr[1];
            switch (attr[0]) {
                case "class":
                    this.classList = new DOMTokenList(attr[1].split(/\s+/g));
                    break;
                case "id":
                    this.#currentId = attr[1];
                    break;
            }
        }
        this.tagName = this.nodeName = tagName.toUpperCase();
    }
    #currentId;
    get className() {
        return Array.from(this.classList).join(" ");
    }
    set className(className) {
        // TODO: Probably don't replace the current classList
        this.classList = new DOMTokenList(className.split(/\s+/g));
    }
    get outerHTML() {
        const tagName = this.tagName.toLowerCase();
        const attributes = this.attributes;
        let out = "<" + tagName;
        for (const attribute of Object.getOwnPropertyNames(attributes)) {
            out += ` ${attribute.toLowerCase()}`;
            if (attributes[attribute] != null) {
                out += `="${attributes[attribute]
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")}"`;
            }
        }
        // Special handling for void elements
        switch (tagName) {
            case "area":
            case "base":
            case "br":
            case "col":
            case "embed":
            case "hr":
            case "img":
            case "input":
            case "link":
            case "meta":
            case "param":
            case "source":
            case "track":
            case "wbr":
                out += ">";
                break;
            default:
                out += ">" + this.innerHTML + `</${tagName}>`;
                break;
        }
        return out;
    }
    set outerHTML(html) {
        // TODO: Someday...
    }
    get innerHTML() {
        let out = "";
        for (const child of this.childNodes) {
            switch (child.nodeType) {
                case NodeType.ELEMENT_NODE:
                    out += child.outerHTML;
                    break;
                case NodeType.TEXT_NODE:
                    out += child.data
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
                    break;
            }
        }
        return out;
    }
    set innerHTML(html) {
        // Remove all children
        for (const child of this.childNodes) {
            child.parentNode = child.parentElement = null;
        }
        const mutator = this._getChildNodesMutator();
        mutator.splice(0, this.childNodes.length);
        if (html.length) {
            const parsed = fragmentNodesFromString(html);
            mutator.push(...parsed.childNodes[0].childNodes);
            for (const child of this.childNodes) {
                child.parentNode = child.parentElement = this;
                child._setOwnerDocument(this.ownerDocument);
            }
        }
    }
    get id() {
        return this.#currentId || "";
    }
    set id(id) {
        this.setAttribute(id, this.#currentId = id);
    }
    getAttribute(name) {
        return this.attributes[name] ?? null;
    }
    setAttribute(name, value) {
        this.attributes[name] = "" + value;
        if (name === "id") {
            this.#currentId = value;
        }
    }
    hasAttribute(name) {
        return this.attributes.hasOwnProperty(name);
    }
    hasAttributeNS(_namespace, name) {
        // TODO: Use namespace
        return this.attributes.hasOwnProperty(name);
    }
    get nextElementSibling() {
        const parent = this.parentNode;
        if (!parent) {
            return null;
        }
        const index = parent._getChildNodesMutator().indexOf(this);
        const childNodes = parent.childNodes;
        let next = null;
        for (let i = index + 1; i < childNodes.length; i++) {
            const sibling = childNodes[i];
            if (sibling.nodeType === NodeType.ELEMENT_NODE) {
                next = sibling;
                break;
            }
        }
        return next;
    }
    get previousElementSibling() {
        const parent = this.parentNode;
        if (!parent) {
            return null;
        }
        const index = parent._getChildNodesMutator().indexOf(this);
        const childNodes = parent.childNodes;
        let prev = null;
        for (let i = index - 1; i >= 0; i--) {
            const sibling = childNodes[i];
            if (sibling.nodeType === NodeType.ELEMENT_NODE) {
                prev = sibling;
                break;
            }
        }
        return prev;
    }
    querySelector(selectors) {
        if (!this.ownerDocument) {
            throw new Error("Element must have an owner document");
        }
        return this.ownerDocument._nwapi.first(selectors, this);
    }
    querySelectorAll(selectors) {
        if (!this.ownerDocument) {
            throw new Error("Element must have an owner document");
        }
        const nodeList = new NodeList();
        const mutator = nodeList[nodeListMutatorSym]();
        mutator.push(...this.ownerDocument._nwapi.select(selectors, this));
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
        return this._getElementsByTagName(tagName.toUpperCase(), []);
    }
    _getElementsByTagNameWildcard(search) {
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
    getElementsByClassName(className) {
        return this._getElementsByClassName(className, []);
    }
    getElementsByTagNameNS(_namespace, localName) {
        // TODO: Use namespace
        return this.getElementsByTagName(localName);
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
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/dom/element.ts.js.map