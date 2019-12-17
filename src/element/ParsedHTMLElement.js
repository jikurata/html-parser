'use strict';
const config = require('../Config.js');
const ParsedElement = require('./ParsedElement.js');

class ParsedHTMLElement extends ParsedElement {
  constructor(fragment, id, param = {}) {
    super(id, param);
    this._fragment = fragment;
    this._set('content', this.stringify(), false);
  }

  get textContent() {
    let content = '';
    if ( this.mode === 'closed') {
      content = this.stringifyChildren();
    }
    else {
      content = this.content;
    }
    return (config.trimWhitespace) ? this.trim(content) : content;
  }

  get innerHTML() {
    return this.textContent;
  }

  get outerHTML() {
    return this.content;
  }

  set textContent(content) {
    if ( config.trimWhitespace ) {
      content = this.trim(content);
    }
    if ( this.mode === 'closed' ) {
      // Create a text element with provided content
      const element = this._fragment.createTextNode(content);
      this.children = [element];
    }
    else if ( this.mode === 'text' ) {
      this.content = content;
    }
  }

  set innerHTML(content) {
    if ( config.trimWhitespace ) {
      content = this.trim(content);
    }
    if ( this.mode === 'closed' ) {
      const partial = this._fragment._parse(content);
      this.children = partial.children;
    }
    else {
      this.content = content;
    }
  }

  set outerHTML(content) {
    if ( config.trimWhitespace ) {
      content = this.trim(content);
    }
    // Overwrite the children of this element's parent
    if ( this.parent ) {
      const partial = this._fragment._parse(content);
      this.parent.replaceChild(this, partial.children);
    }
  }
}

module.exports = ParsedHTMLElement;
