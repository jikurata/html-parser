'use strict';
const ParsedElement = require('./element/ParsedElement.js');
const ParsedHTMLElement = require('./element/ParsedHTMLElement.js');
const ParsedClosedElement = require('./element/ParsedClosedElement.js');
const ParsedVoidElement = require('./element/ParsedVoidElement.js');
const ParsedTextElement = require('./element/ParsedTextElement.js');

class ParsedHTMLDocument extends ParsedElement {
  constructor() {
    super('document', {
      nodeType: 'document'
    });
    Object.defineProperty(this, 'voidTags', {
      value: [
        'doctype',
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
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'fragment', {
      value: new ParsedClosedElement(this, this.getNextId(), {
        'tagName': 'fragment'
      }),
      enumerable: true,
      writable: false,
      configurable: false
    });
    this.fragment.on('update', () => {
    });
  }

  /**
   * Parser Configuration
   * @param {Object} options 
   */
  config(options = {}) {
    if ( options.voidTags ) {
      for ( let i = 0; i < options.voidTags.length; ++i ) {
        const tag = options.voidTags[i];
        if ( this.voidTags.indexOf(tag) === -1 ) {
          this.voidTags.push(tag);
        }
      }
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
      nodeType: options.type || null,
      attributes: options.attributes || {},
      parent: options.parent || null,
      children: options.children || [],
      mode: options.mode || 'closed'
    };

    if ( options.tagName ) {
      o.tagName = options.tagName;
      if ( this.voidTags.indexOf(o.tagName) > -1 ) {
        options.mode = 'void';
      }
    }
    if ( !o.nodeType ) {
      // Determine the node type based on tag name
    }
    if ( options.textContent ) {
      o.textContent = options.textContent;
    }

    let e = null;
    if ( options.mode === 'text' ) {
      e = new ParsedTextElement(this, this.getNextId(), o);
    }
    else if ( options.mode === 'void' ) {
      e = new ParsedVoidElement(this, this.getNextId(), o)
    }
    else {
      e = new ParsedClosedElement(this, this.getNextId(), o);
    }

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
      mode: 'text'
    };
    return this.createElement(o);
  }

  getNextId() {
    return `${Date.now()}${this.children.length}`;
  }

  stringify() {
    // Convert each element into a string
    let content = '';
    for ( let i = 0; i < this.fragment.children.length; ++i ) {
      const child = this.fragment.children[i];
      content += child.stringify();
    }
    return content;
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
  
    let i = 0;
    while ( i < length ) {
      const pos = this.findTagPosition(content, i);
      if ( pos ) {
        // Check if there are characters between the i position and start position
        if ( i !== pos[0] ) {
          // Create a string element representing the untagged characters
          const element = document.createTextElement({
            'textContent': content.substring(i, pos[0]),
            'parent': currentElement
          });
  
          // if currentElement, add the new element as a child
          if ( currentElement ) {
            currentElement.appendChild(element);
          }
  
          i = pos[0] - 1;
        }
        const tagString = content.substring(pos[0], pos[1]);
        const tagInfo = this.parseTagAttributes(tagString);
        if ( tagInfo.mode === 'closed' ) {
          if ( !currentElement ) {
            throw new Error(`No open tag to match with ${tagInfo.tagName}`);
          }
          
          //currentElement.source.endIndex = pos[1];
  
          // Throw if the closing tag does not match the last opened tag
          if ( tagInfo.tagName !== currentElement.tagName ) {
            throw new Error(`Mismatching tag pair. Expected ${currentElement.tagName} but received ${tagInfo.tagName}`);
          }
          
          // append the resulting content
          // currentElement.content = content.substring(currentElement.source.startIndex, currentElement.source.endIndex);
          
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
          'textContent': content.substring(i, length),
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
    if ( this.voidTags.includes(obj.tagName.toLowerCase()) ) {
      obj.mode = 'void';
    }
  
    return obj;
  }
}

module.exports = ParsedHTMLDocument;
