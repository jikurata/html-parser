'use strict';
const ParsedElement = require('./ParsedElement.js');
const parse = require('../Parser.js');
const config = require('../Config.js');

class ParsedHTMLElement extends ParsedElement {
  constructor(document, id, param = {}) {
    super(id, param);
    Object.defineProperty(this, 'document', {
      value: document,
      enumerable: true,
      writable: false,
      configurable: false
    });
    this.set('content', this.stringify(), false);
  }

  get textContent() {
    if ( this.mode === 'closed') {
      const opentag = parse.findTagPosition(this.content);
      let closedtag = null;
      let position = opentag;
      while ( position ) {
        position = parse.findTagPosition(this.content, position[1]);
        if ( position ) {
          closedtag = position;
        }
      }
      if ( closedtag ) {
        const content = this.content.substring(opentag[1], closedtag[0]);
        return (config.trimWhitespace) ? this.trim(content) : content;
      }
    }
    return (config.trimWhitespace) ? this.trim(this.content) : this.content;
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
      const element = this.document.createTextElement(content);
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
      const partial = parse(content);
      const list = [];
      for ( let i = 0; i < partial.fragment.children.length; ++i ) {
        const element = partial.fragment.children[i];
        list.push(element);
      }
      this.children = list;
    }
    else if ( this.mode === 'text' ) {
      this.content = content;
    }
  }

  set outerHTML(content) {
    if ( config.trimWhitespace ) {
      content = this.trim(content);
    }
    // Overwrite the children of this element's parent
    if ( this.parent ) {
      const doc = parse(content);
      this.parent.replaceChild(this, doc.fragment.children);
    }
  }
}

module.exports = ParsedHTMLElement;
