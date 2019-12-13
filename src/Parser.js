'use strict';
const ParsedHTMLDocument = require('./ParsedHTMLDocument.js');
const config = require('./Config.js');

/**
 * Parses a string into a ParsedHTMLDocument
 * @param {String} content
 * @returns {ParsedHTMLDocument}
 */
function parse(content) {
  const document = new ParsedHTMLDocument();
  const length = content.length;
  const stack = [];
  let currentElement = document.fragment;

  let i = 0;
  while ( i < length ) {
    const pos = findTagPosition(content, i);
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

      const tagInfo = parseTag(content.substring(pos[0], pos[1]));
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
function findTagPosition(content, start, end) {
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
function parseTag(content) {
  // remove the brackets from the tag
  content = content.substring(1, content.length -1);

  // Remove excess spaces
  content = content.replace(/\s+/g, ' ').trim();

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
    return obj;
  }

  // Parse as opening tag
  obj.mode = 'open'

  // If there is a space after the tag name, then check for additional attributes
  const tagIndex = content.indexOf(' ');
  if ( tagIndex > 0 ) {
    obj.tagName = content.substring(0, tagIndex);
    obj.attributes = mapAttributes(content.substring(tagIndex + 1, length));
  }
  else {
    obj.tagName = content.replace(/\s+/g, '');
  }

  // Override type as void if it is a void tag
  if ( config.voidTags.indexOf(obj.tagName.toLowerCase()) > -1 ) {
    obj.mode = 'void';
  }

  return obj;
}


/**
 * Extract and map out attribute-value pairs from the inner content of an open tag
 * @param {String} content 
 */
function mapAttributes(content) {
  const map = {};
  let attrBuffer = [];
  for ( let i = 0; i < content.length; ++i ) {
    // Handle attributes with explicit values
    if ( content[i] === '=' ) {
      // Get opening and closing quotes of the attribute value
      const indexOfFirstQuote = content.indexOf('"', i);
      const indexOfSecondQuote = (indexOfFirstQuote > -1) ? content.indexOf('"', indexOfFirstQuote + 1) : -1;

      if ( indexOfSecondQuote > -1 ) {
        const s = content.substring(indexOfFirstQuote + 1, indexOfSecondQuote);
        const attribute = attrBuffer.join('');
        map[attribute] = s;
      }

      // Move iterator to position of the closing quote
      i = indexOfSecondQuote;
      attrBuffer.length = 0;
    }
    // Handle attributes without values
    else if ( content[i] === ' ' ) {
      const attribute = attrBuffer.join('');
      if ( attribute ) {
        map[attribute] = null;
      }
      attrBuffer.length = 0;
    }
    else {
      attrBuffer.push(content[i]);
    }
  }

  // If attribute contains characters, then there was an implicit attribute at the end
  if ( attrBuffer.length ) {
    const attribute = attrBuffer.join('').replace('/', '');
    if ( attribute ) {
      map[attribute] = null;
    }
  }

  return map;
}

module.exports = parse;
module.exports.findTagPosition = findTagPosition;
