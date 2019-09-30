'use strict';
const ParsedElement = require('./ParsedElement.js');
const ParsedHTMLElement = require('./ParsedHTMLElement.js');
const ParsedTextElement = require('./ParsedTextElement.js');

class ParsedHTMLDocument extends ParsedElement {
  constructor() {
    super(0, {
      nodeType: 'document'
    });
  }

  /**
   * Create a ParsedElement in this document
   * @param {String|Object} options
   * Either use a string or object as an argument
   * {String} A tag name
   * {Object} {
   *  tagName: {String},
   *  nodeType: {String},
   *  attributes: {Object},
   *  content: {String},
   *  parent: {ParsedElement},
   *  children: {Array[ParsedElement]},
   *  source: {Object}
   *  childrenRefIds: {Array[Number]}
   *  parentRefId: {Number}
   * }
   * @returns {ParsedHTMLElement}
   */
  createElement(options = {}) {
    if ( typeof options === 'string' ) {
      options = { 'tagName': options }
    }
    const o = {
      tagName: options.tagName || null,
      nodeType: options.type || null,
      attributes: options.attributes || {},
      content: options.content || '',
      parent: options.parent || null,
      children: options.children || [],
      source: options.source || {}
    };

    if ( !o.nodeType ) {
      // Determine the node type based on tag name
    }

    const e = new ParsedHTMLElement(this.children.length, o);
    this.children.push(e);
    return e;
  }

  /**
   * Creates a nodeType text element
   * @param {String} text 
   * @param {Object} options
   * @returns {ParsedTextElement}
   */
  createTextElement(options) {
    if ( typeof options === 'string' ) {
      options = { textContent: options };
    }
    else if ( !options || typeof options !== 'object' ) {
      options = {};
    }
    const o = {
      nodeType: 'text',
      textContent: options.textContent || '',
      parent: options.parent || null,
      source: options.source || {}
    };
    
    const e = new ParsedTextElement(this.children.length, o);
    this.children.push(e);
    return e;
  }
}

module.exports = ParsedHTMLDocument;
