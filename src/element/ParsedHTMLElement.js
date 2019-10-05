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
      'mode': param.mode || null 
    }, false);

    this.set('content', this.stringify(), false);
  }

  appendChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    this.children.push(element);
    element.set('parent', this, false);
    element.emit('propagate-update', element.referenceId);
  }

  prependChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    this.children.push(element);
    element.set('parent', this, false);
    element.emit('propagate-update', element.referenceId);
  }

  parse(content) {
    return this.document.parse(content);
  }

  stringify() {
    // Append opening tag
    let content = '';
    if ( this.mode === 'closed' ) {
      content = `<${this.tagName}`;
      const attributes = Object.keys(this.attributes);
      for ( let i = 0; i < attributes.length; ++i ) {
        const attr = attributes[i];
        content += ` ${attr}="${this.attributes[attr]}"`;
      }
      content += '>';
      content += this.stringifyChildren();
      content += `</${this.tagName}>`;
    }
    else if ( this.mode === 'void' ) {
      content = `<${this.tagName}`;
      const attributes = Object.keys(this.attributes);
      for ( let i = 0; i < attributes.length; ++i ) {
        const attr = attributes[i];
        content += ` ${attr}="${this.attributes[attr]}"`;
      }
      content += ' />';
    }
    else {
      content = this.content || '';
    }
    return (this.document.trimWhitespace) ? this.trim(content) : content;
  }
  
  stringifyChildren() {
    let content = '';
    if ( this.mode === 'closed' ) {
      // Append stringified child elements
      for ( let i = 0; i < this.children.length; ++i ) {
        const child = this.children[i];
        content += child.stringify();
      }
    }
    return (this.document.trimWhitespace) ? this.trim(content) : content;
  }

  get textContent() {
    if ( this.mode === 'closed') {
      const opentag = this.document.findTagPosition(this.content);
      const closedtag = (opentag) ? this.document.findTagPosition(this.content, opentag[1]) : null;
      if ( closedtag ) {
        return this.content.substring(opentag[1], closedtag[0]);
      }
    }
    return this.content;
  }

  get innerHTML() {
    return this.textContent;
  }

  get outerHTML() {
    return this.content;
  }

  set textContent(content) {
    if ( this.document.trimWhitespace ) {
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
    if ( this.document.trimWhitespace ) {
      content = this.trim(content);
    }
    if ( this.mode === 'closed' ) {
      const partial = this.parse(content);
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
    if ( this.document.trimWhitespace ) {
      content = this.trim(content);
    }
    // Overwrite the children of this element's parent
    if ( this.parent ) {
      this.parent.innerHTML = content;
    }
  }
}

module.exports = ParsedHTMLElement;
