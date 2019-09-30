const ParsedElement = require('./ParsedElement.js');

class ParsedHTMLElement extends ParsedElement {
  constructor(id, param = {}) {
    super(id, param);
    this.setAll({
      'tagName': param.tagName || null
    });
  }

  appendChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    this.children.push(element);
    element.parent = this;
  }

  prependChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    this.children.unshift(element);
    element.parent = this;
  }
}

module.exports = ParsedHTMLElement;
