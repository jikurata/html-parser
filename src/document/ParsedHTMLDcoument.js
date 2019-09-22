'use strict';
const ParsedElement = require('./ParsedElement.js');
const ParsedHTMLElement = require('./ParsedHTMLElement.js');

class ParsedHTMLDocument extends ParsedElement {
  constructor() {
    super({
      tagName: '#document',
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
   *  children: {ParsedElement},
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
      source: options.source || null
    };

    if ( !options.children && options.childrenRefIds ) {
      for ( let i = 0; i < options.childrenRefIds.length; ++i ) {
        const id = options.childrenRefIds[i];
        const e = this.getElementByReferenceId(id);
        o.children.push(e);
      }
    }
    if ( !options.parent && options.parentRefId ) {
      o.parent = this.getElementByReferenceId(options.parentRefId);
    }
    if ( !o.nodeType ) {
      // Determine the node type based on tag name
    }

    const e = new ParsedHTMLElement(this.children.length, o);
    this.children.push(e);
    return e;
  }

  getElementByReferenceId(id) {
    if ( typeof id === 'number' && id > -1 ) {
      return this.children[id];
    }
    return null;
  }
}

module.exports = ParsedHTMLDocument;
