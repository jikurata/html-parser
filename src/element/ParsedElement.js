'use strict';
const ParsedNode = require('../ParsedNode.js');
const config = require('../Config.js');

class ParsedElement extends ParsedNode {
  constructor(id, param = {}) {
    super(id);
    this._setAll({
      'tagName': null,
      'nodeType': 'element',
      'mode': null,
      'attributes': {},
      'content': ''
    }, false);
    this._setAll(param, false);

    // Emit update event when the element's model mutates
    this.on('content', () => {
      this.emit('propagate-update');
    });

    // Pass an update event to a parent element
    this.on('propagate-update', (id) => {
      this._set('content', this.stringify(), false);
      if ( this.parent ) {
        this.parent.emit('propagate-update');
      }
    });
  }

  /**
   * Find an element with the attribute id
   * @param {String} id
   * @returns {ParsedElement}
   */
  getElementById(id) {
    const descendants = this.getDescendants();
    for ( let i = 0; i < descendants.length; ++i ) {
      const e = descendants[i];
      const attributeId = e.getAttribute('id');
      if ( attributeId === id ) {
        return e;
      }
    }
  }

  /**
   * Find all elements with the tag name
   * @param {String} tag
   * @returns {Array<ParsedElement>}
   */
  getElementsByTagName(tag) {
    const descendants = this.getDescendants();
    const list = [];
    for ( let i = 0; i < descendants.length; ++i ) {
      const e = descendants[i];
      if ( tag === e.tagName ) {
        list.push(e);
      }
    }
    return list;
  }

  /**
   * Find all elements with the class name
   * @param {String} className
   * @returns {Array<ParsedElement>}
   */
  getElementsByClassName(className) {
    const descendants = this.getDescendants();
    const list = [];
    for ( let i = 0; i < descendants.length; ++i ) {
      const e = descendants[i];
      if ( e.attributes.class ) {
        const classes = e.attributes.class.split(' ');
        for ( let j = 0; j < classes.length; ++j ) {
          if ( className === classes[j] ) {
            list.push(e);
          }
        }
      }
    }
    return list;
  }

  stringify() {
    let closingContent = ''
    if ( this.mode === 'closed' ) {
      closingContent += '>';
      closingContent += this.stringifyChildren();
      closingContent += `</${this.tagName}>`;
    }
    else if ( this.mode === 'void' ) {
      closingContent += ' />';
    }
    else {
      return (config.trimWhitespace) ? this.trim(this.content) : this.content;
    }
    
    // Append opening tag
    let content = `<${this.tagName}`;
    const attributes = Object.keys(this.attributes);
    for ( let i = 0; i < attributes.length; ++i ) {
      const attr = attributes[i];
      const value = this.attributes[attr];
      // a null value means the attribute is an implicit attribute
      if ( value === null ) {
        content += ` ${attr}`;
      }
      else {
        content += ` ${attr}="${value}"`;
      }
    }
    content += closingContent;
    return (config.trimWhitespace) ? this.trim(content) : content;
  }
  
  stringifyChildren() {
    let content = '';
    if ( this.mode === 'closed' ) {
      // Append stringified child elements
      for ( let i = 0; i < this.children.length; ++i ) {
        const child = this.children[i];
        content += child.stringify();
      }
    }
    return (config.trimWhitespace) ? this.trim(content) : content;
  }

  trim(content) {
    return content.replace(/\n+|\r+/, ' ').replace(/\s+/, ' ').trim();
  }

  hasAttribute(attr) {
    return this.attributes.hasOwnProperty(attr);
  }

  getAttribute(attr) {
    return this.attributes[attr];
  }

  setAttribute(attr, value) {
    if ( this.attributes[attr] !== value ) {
      const oldValue = this.attributes[attr];
      this.attributes[attr] = value;
      this.emit(attr, value, oldValue);
    }
  }

  get id() {
    return this.getAttribute('id');
  }

  set id(id) {
    this.setAttribute('id', id);
  }

  get className() {
    return this.getAttribute('class');
  }

  set className(className) {
    this.setAttribute('class', className);
  }

  get classList() {
    return this.className.split(' ');
  }
}

module.exports = ParsedElement;
