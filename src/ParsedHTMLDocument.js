'use strict';
const ParsedElement = require('./element/ParsedElement.js');
const ParsedHTMLElement = require('./element/ParsedHTMLElement.js');
const ParsedFragmentElement = require('./element/ParsedFragmentElement.js');

class ParsedHTMLDocument extends ParsedElement {
  constructor(options = {}) {
    super('document', {
      nodeType: 'document'
    });
    Object.defineProperty(this, 'fragment', {
      value: new ParsedFragmentElement(this, this.getNextId()),
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, '_config', {
      value: {
        voidTags: [
          '!doctype',
          'area',
          'base',
          'br',
          'col',
          'embed',
          'hr',
          'img',
          'input',
          'link',
          'meta',
          'param',
          'source',
          'track',
          'wbr'
        ],
        trimWhitespace: false
      },
      enumerable: true,
      writable: false,
      configurable: false
    });
    this.config(options.config || {});
    
    // When an element updates, check for new elements to add to the document
    this.fragment.on('propagate-update', (id) => {
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
   * Parser Configuration
   * @param {Object} options 
   */
  config(options = {}) {
    // Add void tag name
    if ( options.voidTags ) {
      for ( let i = 0; i < options.voidTags.length; ++i ) {
        const tag = options.voidTags[i];
        if ( this._config.voidTags.indexOf(tag) === -1 ) {
          this._config.voidTags.push(tag);
        }
      }
    }
    // Toggle excess whitespace trimming
    if ( options.hasOwnProperty('trimWhitespace') ) {
      this._config.trimWhitespace = options.trimWhitespace;
    }
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
    if ( this._config.voidTags.indexOf(o.tagName) > -1 ) {
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
    this.fragment.appendChild(element);
  }

  prependChild(element) {
    this.fragment.prependChild(element);
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

      const descendants = this.fragment.getDescendants();
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

  /**
   * Parses a string into a parsed HTML Document
   * @param {String} content
   * @returns {ParsedHTMLDocument}
   */
  parse(content) {
    const document = new ParsedHTMLDocument();
    const length = content.length;
    const stack = [];
    let currentElement = document.fragment;

    document.config(this._config);

    let i = 0;
    while ( i < length ) {
      const pos = this.findTagPosition(content, i);
      if ( pos ) {
        // Check if there are characters between the i position and start position
        if ( i !== pos[0] ) {
          // Create a string element representing the untagged characters
          const element = document.createTextElement({
            'content': content.substring(i, pos[0]),
            'parent': currentElement
          });
  
          // if currentElement, add the new element as a child
          if ( currentElement ) {
            currentElement.appendChild(element);
          }
  
          i = pos[0] - 1;
        }

        const tagInfo = this.parseTagAttributes(content.substring(pos[0], pos[1]));
        if ( tagInfo.mode === 'closed' ) {
          if ( !currentElement ) {
            throw new Error(`No open tag to match with ${tagInfo.tagName}`);
          }
        
  
          // Throw if the closing tag does not match the last opened tag
          if ( tagInfo.tagName !== currentElement.tagName ) {
            throw new Error(`Mismatching tag pair. Expected ${currentElement.tagName} but received ${tagInfo.tagName}`);
          }
          
          // Set the current scope to the next id in the stack
          currentElement = stack.pop() || null;
        }
        else {
          const element = document.createElement({
            'tagName': tagInfo.tagName, 
            'nodeType': 'element',
            'attributes': tagInfo.attributes,
            'parent': currentElement,
            'mode': (tagInfo.mode === 'void') ? 'void' : 'closed'
          });
  
          // if currentElement, add the new element as a child
          if ( currentElement ) {
            currentElement.appendChild(element);
          }
          if ( tagInfo.mode === 'open' ) {
            // Push the current scope into the stack
            if ( currentElement ) {
              stack.push(currentElement);
            }
            // Set the current scope to the new open tag
            currentElement = element;
          }
        }
  
        // Push the iterator to the end pos of the tag
        i = pos[1] - 1;
      }
      else {
        // If no new tag can be found, assume the rest of the content is a string
        const element = document.createTextElement({
          'content': content.substring(i, length),
          'parent': currentElement
        });
  
        // if currentElement, add the new element as a child
        if ( currentElement ) {
          currentElement.appendChild(element);
        }
  
        // Move iterator to the end
        i = length;
      }
  
      ++i;
    }
  
    return document;
  }
  
  /**
   * Returns the start and end position of the first html tag 
   * it can find in content
   * Returns null if it cannot find a position set
   * @param {String} content 
   * @param {Number} start start index to search
   * @param {Number} end  end index to search
   * @returns {Array} [startndex, endIndex]
   */
  findTagPosition(content, start, end) {
    if ( !start ) start = 0;
    if ( !end ) end = content.length;
  
    const leftBracketIndex = content.indexOf('<', start);
    const rightBracketIndex = (leftBracketIndex > -1 ) ? content.indexOf('>', leftBracketIndex) : -1;
    
    return (rightBracketIndex > -1) ? [leftBracketIndex, rightBracketIndex + 1] : null;
  }
  
  /**
   * Parses a html tag string into various details about the tag
   * @param {String} content 
   * @returns {Object} {
   *  tag: {String} tag name
   *  type: {String} The node type based on: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
   *  state: 'open'|'closed'|'void'
   *  attributes: {Object} all the attributes attached to the tag in key-value pair
   * }
   */
  parseTagAttributes(content) {
    content = content.replace(/<|>/g, '') // remove the brackets from the tag
      .replace(/\s+/g, ' ') // Remove excess spaces
      .trim()
    const length = content.length;
    const obj = {
      tagName: null,
      mode: null,
      attributes: {}
    };
    // Parse as a closing tag
    if ( content[0] === '/' ) {
      obj.mode = 'closed'
      obj.tagName = content.substring(1, length).replace(/\s+/g, ''); // Remove any spaces
    }
    // Parse as opening tag
    else {
      obj.mode = 'open'
  
      // If there is a space, then check for additional attributes
      const tagIndex = content.indexOf(' ');
      if ( tagIndex > 0 ) {
        obj.tagName = content.substring(0, tagIndex);
        let attribute = [];
        for ( let i = tagIndex + 1; i < length; ++i ) {
          // Handle attributes with explicit values
          if ( content[i] === '=' ) {
            const indexOfFirstQuote = content.indexOf('"', i);
            const indexOfSecondQuote = (indexOfFirstQuote > -1) ? content.indexOf('"', indexOfFirstQuote + 1) : -1;
  
            if ( indexOfSecondQuote > -1 ) {
              const s = content.substring(indexOfFirstQuote + 1, indexOfSecondQuote);
              const attributeName = attribute.join('');
              obj.attributes[attributeName] = s;
            }
  
            // Move iterator to position of the closing quote
            i = indexOfSecondQuote;
            attribute.length = 0;
          }
          // Handle attributes without values
          else if ( content[i] === ' ' ) {
            const attributeName = attribute.join('');
            if ( attributeName ) {
              obj.attributes[attributeName] = true;
            }
            attribute.length = 0;
          }
          else {
            attribute.push(content[i]);
          }
        }
  
        // If attribute contains characters, then there was an attribute at the end
        if ( attribute.length ) {
          const attributeName = attribute.join('').replace('/', '');
          if ( attributeName ) {
            obj.attributes[attributeName] = true;
          }
        }
      }
      else {
        obj.tagName = content.replace(/\s+/g, '');
      }
    }
  
    // Override type as void if it is a void tag
    if ( this._config.voidTags.indexOf(obj.tagName.toLowerCase()) > -1 ) {
      obj.mode = 'void';
    }
  
    return obj;
  }

  getNextId() {
    return `${Date.now()}${this.children.length}`;
  }

  stringify() {
    let content = this.fragment.stringify();
    if ( this.trimWhitespace ) {
      content = this.trim(content);
    }
    return content;
  }


  get voidTags() {
    return ( this._config ) ? this._config.voidTags : [];
  }

  get trimWhitespace() {
    return ( this._config ) ? this._config.trimWhitespace : false;
  }
}

module.exports = ParsedHTMLDocument;
