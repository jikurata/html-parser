const ParsedHTMLElement = require('./ParsedHTMLElement.js');

class ParsedVoidElement extends ParsedHTMLElement {
  constructor(document, id, param = {}) {
    super(document, id, param);
    this.update(false);
  }

  update(emit = true) {
    const content = this.stringify();
    this.map.textContent = content;
    this.map.outerHTML = content;
    this.map.innerHTML = content;
    if ( emit ) {
      this.emit('update');
    }
  }

  stringify() {
    let s = `<${this.tagName} `;

    const attributes = Object.keys(this.attributes);
    for ( let i = 0; i < attributes.length; ++i ) {
      const attr = attributes[i];
      s += `${attr}="${this.attributes[attr]}" `;
    }
    s += '/>';

    return s;
  }
}

module.exports = ParsedVoidElement;
