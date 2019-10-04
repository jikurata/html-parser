'use strict';
const ParsedHTMLElement = require('./ParsedHTMLElement.js');

class ParsedFragmentElement extends ParsedHTMLElement {
  constructor(document, id) {
    super(document, id, {
      'tagName': 'fragment',
      'nodeType': 'fragment',
      'mode': 'closed'
    });
  }

  stringify() {
    return this.stringifyChildren();
  }
}

module.exports = ParsedFragmentElement;
