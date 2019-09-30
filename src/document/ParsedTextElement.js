const ParsedElement = require('./ParsedElement.js');

class ParsedTextElement extends ParsedElement {
  constructor(id, param = {}) {
    super(id, param);
    this.setAll({
      'textContent': param.textContent || ''
    });
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

  toString() {
    return this.textContent;
  }
}

module.exports = ParsedTextElement;
