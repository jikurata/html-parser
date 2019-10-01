const ParsedHTMLElement = require('./ParsedHTMLElement.js');

class ParsedTextElement extends ParsedHTMLElement {
  constructor(document, id, param = {}) {
    super(document, id, param);
    this.set('textContent', param.textContent, false);
    this.update();
  }

  stringify() {
    return this.textContent;
  }

  get innerHTML() {
    return this.textContent;
  }

  get outerHTML() {
    return this.textContent;
  }

  set innerHTML(content) {
    this.textContent = content;
  }

  set outerHTML(content) {
    this.textContent = content;
  }
}

module.exports = ParsedTextElement;
