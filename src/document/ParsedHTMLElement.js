const ParsedElement = require('./ParsedElement.js');

class ParsedHTMLElement extends ParsedElement {
  constructor(id, options = {}) {
    super(options);
    this.referenceId = id;
    this.content = options.content || '';
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
