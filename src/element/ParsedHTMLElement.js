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

    this.set('content', this.stringify(), false);
  }

  parse(content) {
    return this.document.parse(content);
  }

  stringify() {
    let closingContent = ''
    if ( this.mode === 'closed' ) {
      closingContent += '>';
      closingContent += this.stringifyChildren();
      closingContent += `</${this.tagName}>`;
    }
    else if ( this.mode === 'void' ) {
      closingContent += ' />';
    }
    else {
      return (this.document.trimWhitespace) ? this.trim(this.content) : this.content;
    }
    
    // Append opening tag
    let content = `<${this.tagName}`;
    const attributes = Object.keys(this.attributes);
    for ( let i = 0; i < attributes.length; ++i ) {
      const attr = attributes[i];
      const value = this.attributes[attr];
      // a null value means the attribute is an implicit attribute
      if ( value === null ) {
        content += ` ${attr}`;
      }
      else {
        content += ` ${attr}="${value}"`;
      }
    }
    content += closingContent;
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
      let closedtag = null;
      let position = opentag;
      while ( position ) {
        position = this.document.findTagPosition(this.content, position[1]);
        if ( position ) {
          closedtag = position;
        }
      }
      if ( closedtag ) {
        const content = this.content.substring(opentag[1], closedtag[0]);
        return (this.document.trimWhitespace) ? this.trim(content) : content;
      }
    }
    return (this.document.trimWhitespace) ? this.trim(this.content) : this.content;
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
      const doc = this.parse(content);
      this.parent.replaceChild(this, doc.fragment.children);
    }
  }
}

module.exports = ParsedHTMLElement;
