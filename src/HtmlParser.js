'use strict';
const ParsedHTMLDocument = require('./document/ParsedHTMLDocument.js');

class HtmlParser {
  constructor(options = {}) {
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

    // Append any other void tags
    if ( options.voidTags && Array.isArray(options.voidTags) ) {
      for ( let i = 0; i < options.voidTags.length; ++i ) {
        const tag = options.voidTags[i];
        if ( !this.voidTags.includes(tag) ) {
          this.voidTags.push(tag);
        }
      }
    }
  }

  /**
   * Parses a string into a pseudo HTML Document
   * @param {String} content
   * @returns {ParsedHTMLDocument}
   */
  parse(content) {
    const length = content.length;
    const document = new ParsedHTMLDocument();
    const stack = [];
    let currentElement = null;

    let i = 0;
    while ( i < length ) {
      const pos = this.findTagPosition(content, i);
      if ( pos ) {
        // Check if there are characters between the i position and start position
        if ( i !== pos[0] ) {
          // Create a string element representing the untagged characters
          const element = document.createTextElement({
            'textContent': content.substring(i, pos[0]),
            'parent': currentElement,
            'source': {
              'content': content,
              'startIndex': i,
              'endIndex': pos[0]
            }
          });

          i = pos[0] - 1;
        }
        const tagString = content.substring(pos[0], pos[1]);
        const tagInfo = this.parseTagAttributes(tagString);
        if ( tagInfo.mode === 'closed' ) {
          if ( !currentElement ) {
            throw new Error(`No open tag to match with ${tagInfo.tagName}`);
          }
          
          currentElement.source.endIndex = pos[1];

          // Throw if the closing tag does not match the last opened tag
          if ( tagInfo.tagName !== currentElement.tagName ) {
            throw new Error(`Mismatching tag pair. Expected ${currentElement.tagName} but received ${tagInfo.tagName}`);
          }
          
          // append the resulting content
          currentElement.content = content.substring(currentElement.source.startIndex, currentElement.source.endIndex);
          
          // Set the current scope to the next id in the stack
          currentElement = stack.pop() || null;
        }
        else {
          const element = document.createElement({
            'tagName': tagInfo.tagName, 
            'nodeType': 'element',
            'attributes': tagInfo.attributes,
            'parent': currentElement,
            'source': {
              'content': content,
              'startIndex': pos[0]
            }
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
          'parent': currentElement,
          'source': {
            'content': content,
            'startIndex': i,
            'endIndex': length
          }
        });

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

  outerContent() {

  }

  innerContent() {

  }
}

module.exports = HtmlParser;
