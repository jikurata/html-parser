'use strict';
const ParsedElement = require('./ParsedElement.js');

class ParsedHTMLElement extends ParsedElement {
  constructor(document, id, param = {}) {
    super(id, param);
    Object.defineProperty(this, 'document', {
      value: document,
      enumerable: true,
      writable: false,
      configurable: false
    });
    this.setAll({
      'tagName': param.tagName || null,
    }, false);
    this.map.textContent = param.textContent || '';
  }

  appendChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    let list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      list.push(this.children[i]);
    }
    list.push(element);
    this.map.children = list;
    element.parent = this;
  }

  prependChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    const list = [element];
    for ( let i = 0; i < this.children.length; ++i ) {
      list.push(this.children[i]);
    }
    this.map.children = list;
    element.parent = this;
  }

  parse(content) {
    return this.document.parse(content);
  }
}

module.exports = ParsedHTMLElement;
