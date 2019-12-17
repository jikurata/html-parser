'use strict';
const ParsedHTMLElement = require('./ParsedHTMLElement.js');
const config = require('../Config.js');

class ParsedFragmentElement extends ParsedHTMLElement {
  constructor(parse) {
    super(null, 'fragment', {
      'tagName': 'fragment',
      'nodeType': 'fragment',
      'mode': 'closed'
    });
    this._parse = parse;
    this._counter = 0;
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
      tagName: options.tagName || '',
      mode: options.mode || 'closed',
      nodeType: options.type || null,
      attributes: options.attributes || {},
      content: options.content || '',
      parent: options.parent || null,
      children: options.children || []
    };


    // Check if the element is a void element
    if ( config.voidTags.indexOf(o.tagName) > -1 ) {
      o.mode = 'void';
    }
    if ( !o.nodeType ) {
      // Determine the node type based on tag name
    }

    const e = new ParsedHTMLElement(this, this.getNextId(), o);
    return e;
  }

  /**
   * Creates a nodeType text element
   * @param {String} text 
   * @param {Object} options
   * @returns {ParsedHTMLElement}
   */
  createTextNode(options) {
    if ( typeof options === 'string' ) {
      options = { content: options };
    }
    else if ( !options || typeof options !== 'object' ) {
      options = {};
    }
    const o = {
      nodeType: 'text',
      mode: 'text',
      content: options.content || '',
      parent: options.parent || null
    };
    return this.createElement(o);
  }

  stringify() {
    let content = '';
    if ( this.mode === 'closed' ) {
      // Append stringified child elements
      for ( let i = 0; i < this.children.length; ++i ) {
        const child = this.children[i];
        content += child.content;
      }
    }
    return (config.trimWhitespace) ? this.trim(content) : content;
  }

  getNextId() {
    return `${Date.now()}-${++this._counter}`;
  }
}

module.exports = ParsedFragmentElement;
