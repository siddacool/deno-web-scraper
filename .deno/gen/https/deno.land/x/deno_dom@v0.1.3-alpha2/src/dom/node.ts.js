import { getLock, setLock } from "../constructor-lock.ts";
import { NodeList, nodeListMutatorSym } from "./node-list.ts";
import { HTMLCollection, HTMLCollectionMutatorSym } from "./html-collection.ts";
export class EventTarget {
    addEventListener() {
        // TODO
    }
    removeEventListener() {
        // TODO
    }
    dispatchEvent() {
        // TODO
    }
}
export var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
    NodeType[NodeType["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
    NodeType[NodeType["ENTITY_NODE"] = 6] = "ENTITY_NODE";
    NodeType[NodeType["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
    NodeType[NodeType["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
    NodeType[NodeType["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
    NodeType[NodeType["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
    NodeType[NodeType["NOTATION_NODE"] = 12] = "NOTATION_NODE";
})(NodeType || (NodeType = {}));
const nodesAndTextNodes = (nodes, parentNode) => {
    return nodes.map(n => {
        let node = n;
        if (!(n instanceof Node)) {
            node = new Text("" + n);
        }
        node.parentNode = node.parentElement = parentNode;
        return node;
    });
};
export class Node extends EventTarget {
    constructor(nodeName, nodeType, parentNode) {
        super();
        this.nodeName = nodeName;
        this.nodeType = nodeType;
        this.parentNode = parentNode;
        this.#ownerDocument = null;
        if (getLock()) {
            throw new TypeError("Illegal constructor");
        }
        this.nodeValue = null;
        this.childNodes = new NodeList();
        this.#childNodesMutator = this.childNodes[nodeListMutatorSym]();
        this.parentElement = parentNode;
        if (parentNode) {
            parentNode.appendChild(this);
        }
    }
    #childNodesMutator;
    #ownerDocument;
    _getChildNodesMutator() {
        return this.#childNodesMutator;
    }
    _setOwnerDocument(document) {
        if (this.#ownerDocument !== document) {
            this.#ownerDocument = document;
            for (const child of this.childNodes) {
                child._setOwnerDocument(document);
            }
        }
    }
    get ownerDocument() {
        return this.#ownerDocument;
    }
    get textContent() {
        let out = "";
        for (const child of this.childNodes) {
            switch (child.nodeType) {
                case NodeType.TEXT_NODE:
                    out += child.nodeValue;
                    break;
                case NodeType.ELEMENT_NODE:
                    out += child.textContent;
                    break;
            }
        }
        return out;
    }
    set textContent(content) {
        for (const child of this.childNodes) {
            child.parentNode = child.parentElement = null;
        }
        this._getChildNodesMutator().splice(0, this.childNodes.length);
        this.appendChild(new Text(content));
    }
    cloneNode() {
        // TODO
    }
    remove() {
        const parent = this.parentNode;
        if (parent) {
            const nodeList = parent._getChildNodesMutator();
            const idx = nodeList.indexOf(this);
            nodeList.splice(idx, 1);
            this.parentNode = this.parentElement = null;
        }
    }
    appendChild(child) {
        const oldParentNode = child.parentNode;
        // Check if we already own this child
        if (oldParentNode === this) {
            if (this.#childNodesMutator.indexOf(child) !== -1) {
                return;
            }
        }
        else if (oldParentNode) {
            child.remove();
        }
        child.parentNode = this;
        // If this a document node or another non-element node
        // then parentElement should be set to null
        if (this.nodeType === NodeType.ELEMENT_NODE) {
            child.parentElement = this;
        }
        else {
            child.parentElement = null;
        }
        child._setOwnerDocument(this.#ownerDocument);
        this.#childNodesMutator.push(child);
    }
    removeChild(child) {
        // TODO
    }
    replaceChild(newChild, oldChild) {
        if (oldChild.parentNode !== this) {
            throw new Error("Old child's parent is not the current node.");
        }
        oldChild.replaceWith(newChild);
        return oldChild;
    }
    insertBeforeAfter(nodes, side) {
        const parentNode = this.parentNode;
        const mutator = parentNode._getChildNodesMutator();
        const index = mutator.indexOf(this);
        nodes = nodesAndTextNodes(nodes, parentNode);
        mutator.splice(index + side, 0, ...nodes);
    }
    before(...nodes) {
        if (this.parentNode) {
            this.insertBeforeAfter(nodes, 0);
        }
    }
    after(...nodes) {
        if (this.parentNode) {
            this.insertBeforeAfter(nodes, 1);
        }
    }
    replaceWith(...nodes) {
        if (this.parentNode) {
            const parentNode = this.parentNode;
            const mutator = parentNode._getChildNodesMutator();
            const index = mutator.indexOf(this);
            nodes = nodesAndTextNodes(nodes, parentNode);
            mutator.splice(index, 1, ...nodes);
            this.parentNode = this.parentElement = null;
        }
    }
    get children() {
        const collection = new HTMLCollection();
        const mutator = collection[HTMLCollectionMutatorSym]();
        for (const child of this.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                mutator.push(child);
            }
        }
        return collection;
    }
    get nextSibling() {
        const parent = this.parentNode;
        if (!parent) {
            return null;
        }
        const index = parent._getChildNodesMutator().indexOf(this);
        let next = this.childNodes[index + 1] || null;
        return next;
    }
    get previousSibling() {
        const parent = this.parentNode;
        if (!parent) {
            return null;
        }
        const index = parent._getChildNodesMutator().indexOf(this);
        let prev = this.childNodes[index - 1] || null;
        return prev;
    }
}
export class CharacterData extends Node {
    constructor(data, nodeName, nodeType, parentNode) {
        super(nodeName, nodeType, parentNode);
        this.data = data;
        if (getLock()) {
            throw new TypeError("Illegal constructor");
        }
        this.nodeValue = data;
    }
    get length() {
        return this.data.length;
    }
}
export class Text extends CharacterData {
    constructor(text = "") {
        let oldLock = getLock();
        setLock(false);
        super(text, "#text", NodeType.TEXT_NODE, null);
        this.nodeValue = text;
        setLock(oldLock);
    }
    get textContent() {
        return this.nodeValue;
    }
}
export class Comment extends CharacterData {
    constructor(text = "") {
        let oldLock = getLock();
        setLock(false);
        super(text, "#comment", NodeType.COMMENT_NODE, null);
        this.nodeValue = text;
        setLock(oldLock);
    }
    get textContent() {
        return this.nodeValue;
    }
}
//# sourceMappingURL=file:///home/runner/deno-web-scraper/.deno/gen/https/deno.land/x/deno_dom@v0.1.3-alpha2/src/dom/node.ts.js.map