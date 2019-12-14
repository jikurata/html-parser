'use strict';
const ParsedElement = require('./element/ParsedElement.js');
const ParsedHTMLElement = require('./element/ParsedHTMLElement.js');
const ParsedFragmentElement = require('./element/ParsedFragmentElement.js');
const config = require('./Config.js');

class ParsedHTMLDocument extends ParsedElement {
  constructor() {
    super('document', {
      nodeType: 'document'
    });
    Object.defineProperty(this, 'root', {
      value: new ParsedFragmentElement(this.getNextId()),
      enumerable: true,
      writable: false,
      configurable: false
    });
    
    // When an element updates, check for new elements to add to the document
    this.root.on('propagate-update', (id) => {
      const descendants = this.getDescendants();
      const ids = this.getChildrenRefIds();
      // add any new elements to the document's children
      for ( let i = 0; i < descendants.length; ++i ) {
        const e = descendants[i];
        if ( ids.indexOf(e.referenceId) === -1 ) {
          this.children.push(e);
        }
      }
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

  appendChild(element) {
    this.root.appendChild(element);
  }

  prependChild(element) {
    this.root.prependChild(element);
  }

  replaceChild(child, elements) {
    this.root.replaceChild(child, elements);
  }

  /**
   * Removes any matching elements from the document does not delete
   * from the document's cache
   * @param {ParsedElement|Array[ParsedElement]} children 
   */
  removeChildren(elements) {
    if ( elements instanceof ParsedElement ) {
      elements = [elements];
    }
    if ( Array.isArray(elements) ) {
      const ids = [];
      for ( let i = 0; i < elements.length; ++i ) {
        ids.push(elements[i].referenceId);
      }

      const descendants = this.root.getDescendants();
      for ( let j = 0; j < descendants.length; ++j ) {
        const descendant = descendants[j];

        // remove the descendant if it has a match
        if ( ids.indexOf(descendant.referenceId) > -1 ) {
          descendant.remove();
        }
      }
    }
  }

  /**
   * Deletes elements from the document's cache
   * If an element is in the document, it is removed from there as well.
   * @param {ParsedElement|Array[ParsedElement]} element 
   */
  deleteElement(elements) {
    if ( elements instanceof ParsedElement ) {
      elements = [elements];
    }
    if ( Array.isArray(elements) ) {
      const list = [];
      const ids = [];

      // Remove references to all the elements in the document
      this.removeChildren(elements);

      for ( let i = 0; i < elements.length; ++i ) {
        ids.push(elements[i].referenceId);
      }

      for ( let i = 0; i < this.children.length; ++i ) {
        const child = this.children[i];
        // Save the element if it is not in the array of ids
        if ( ids.indexOf(child.referenceId) === -1 ) {
          list.push(child);
        }
      }

      this.children = list;
    }
  }

  getNextId() {
    return `${Date.now()}${this.children.length}`;
  }

  stringify() {
    let content = this.root.stringify();
    if ( this.trimWhitespace ) {
      content = this.trim(content);
    }
    return content;
  }
}

module.exports = ParsedHTMLDocument;
