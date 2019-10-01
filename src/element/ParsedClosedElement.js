const ParsedHTMLElement = require('./ParsedHTMLElement.js');

class ParsedClosedElement extends ParsedHTMLElement {
  constructor(document, id, param = {}) {
    super(document, id, param);
    this.update(false);
  }

  update(emit = true) {
    const outer = this.stringify();
    const inner = this.stringifyChildren();
    this.map.outerHTML = outer;
    // Remove this element's tags from content
    this.map.innerHTML = inner;
    this.map.textContent = inner;
    if ( emit ) {
      this.emit('update');
    }
  }

  stringifyChildren() {
    const cache = [];
    let content = '';
    // Append stringified child elements
    for ( let i = 0; i < this.children.length; ++i ) {
      const child = this.children[i];
      if ( cache.indexOf(child.referenceId) < 0 ) {
        content += child.stringify();
        index(child);
      }
    }

    return content;

    function index(element) {
      // cache current element id
      if ( cache.indexOf(element.referenceId) < 0 ) {
        cache.push(element.referenceId);
      }

      for ( let j = 0; j < element.children.length; ++j ) {
        const child = element.children[j];

        // cache child element ids
        if ( cache.indexOf(child.referenceId) < 0 ) {
          cache.push(child.referenceId);
        }
        
        // index children of children
        if ( child.children.length ) {
          index(child);
        }
      }
    }
  }

  stringify() {
    // Append opening tag
    let content = `<${this.tagName}`;
    const attributes = Object.keys(this.attributes);
    for ( let i = 0; i < attributes.length; ++i ) {
      const attr = attributes[i];
      content += ` ${attr}="${this.attributes[attr]}"`;
    }
    content += '>';

    content += this.stringifyChildren();

    // Append closing tag
    content += `</${this.tagName}>`;
    
    return content;
  }

  get textContent() {
    return this.map.textContent;
  }

  get innerHTML() {
    return this.map.innerHTML;
  }

  get outerHTML() {
    return this.map.outerHTML;
  }

  set textContent(content) {
    const element = this.document.createTextElement(content);
    element.set('parent', this, false);
    this.children = [element]; // Emits update
  }

  set innerHTML(content) {
    const document = this.parse(content);
    this.children = document.fragment.children; // Emits update
  }

  set outerHTML(content) {
    const document = this.parse(content);
    // First child will overwrite this element
    const children = document.fragment.children;
    const first = children.shift();
    // Inherit the replacing element's properties
    this.setAll(first.map); // Emits update
  }
}

module.exports = ParsedClosedElement;
