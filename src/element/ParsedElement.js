'use strict';
const EmittableMap = require('../EmittableMap.js');

class ParsedElement extends EmittableMap {
  constructor(id, param = {}) {
    super();
    Object.defineProperty(this, 'referenceId', {
      value: id,
      enumerable: true,
      writable: false,
      configurable: false
    });

    this.setAll({
      'tagName': param.tagName || null,
      'nodeType': param.nodeType || 'element',
      'mode': param.mode || null,
      'attributes': param.attributes || {},
      'content': param.content || '',
      'parent': param.parent || null,
      'children': param.children || []
    }, false);
    this.setAll(param, false);


    // Emit update event when the element's model mutates
    this.on('change', (property, value, oldValue) => {
      this.emit('propagate-update', this.referenceId);
    });

    // Pass an update event to a parent element
    this.on('propagate-update', (referenceId) => {
      this.set('content', this.stringify(), false);
      if ( this.parent ) {
        this.parent.emit('propagate-update', referenceId)
      }
    });
  }

  getElementById(id) {
    for ( let i = 0; i < this.children.length; ++i ) {
      const e = this.children[i];
      const attributeId = e.getAttribute('id');
      if ( attributeId === id ) {
        return e;
      }
    }
  }

  getElementsByTagName(tag) {
    const list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      const e = this.children[i];
      if ( tag === e.tagName ) {
        list.push(e);
      }
    }
    return list;
  }

  getElementsByClassName(className) {
    const list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      const e = this.children[i];
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

  hasAttribute(attr) {
    return this.attributes.hasOwnProperty(attr);
  }

  getAttribute(attr) {
    return this.attributes[attr];
  }

  setAttribute(attr, value, emit = true) {
    if ( this.attributes[attr] !== value ) {
      const oldValue = this.attributes[attr];
      this.attributes[attr] = value;
      if ( emit ) {
        this.emit('change', attr, value, oldValue);
      }
    }
  }

  appendChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    element.set('parent', this, false);
    this.children.push(element);
    element.emit('propagate-update', element.referenceId);
  }

  prependChild(element) {
    if ( !(element instanceof ParsedElement) ) {
      throw new TypeError(`Expected argument to be instance of ParsedElement`);
    }
    this.children.push(element);
    element.set('parent', this, false);
    element.emit('propagate-update', element.referenceId);
  }

  /**
   * Replace the child with the elements
   * @param {ParsedElement} child 
   * @param {ParsedElement|Array[ParsedElements]} elements
   */
  replaceChild(child, elements) {
    if ( this.hasElement(child) ) {
      if ( elements instanceof ParsedElement ) {
        elements = [elements];
      }
  
      const ids = [];
      const list = [];
  
      for ( let i = 0; i < elements.length; ++i ) {
        ids.push(elements[i].referenceId);
      }
  
      // Find child in parent's children
      for ( let i = 0; i < this.children.length; ++i ) {
        const element = this.children[i];
        const id = element.referenceId;
        // push the element back into the list if it does not match the original child or replacements
        if ( id !== child.referenceId && ids.indexOf(id) === -1 ) {
          list.push(element);
        }
        else {
          // Replace this index with the elements
          for ( let j = 0; j < elements.length; ++j ) {
            elements[j].parent = this;
            list.push(elements[j]);
          }
          child.parent = null;
        }
      }

      this.children = list;
    }
  }

  /**
   * Remove this element from the document
   */
  remove() {
    if ( this.parent ) {
      this.parent.removeChildren([this]);
    }
  }

  /**
   * Removes any matching elements from children
   * @param {ParsedElement|Array[ParsedElement]} children 
   */
  removeChildren(children = null) {
    if ( children instanceof ParsedElement ) {
      children = [children];
    }
    if ( Array.isArray(children) ) {
      const ids = [];
      for ( let i = 0; i < children.length; ++i ) {
        ids.push(children[i].referenceId);
      }

      const list = [];
      for ( let i = 0; i < this.children.length; ++i ) {
        const child = this.children[i];

        // Keep children that do not have matching ids
        if ( ids.indexOf(child.referenceId) === -1 ) {
          list.push(child);
        }
      }
      // Emits a change event
      this.children = list;
    }
  }

  getChildrenRefIds() {
    const list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      list.push(this.children[i].referenceId);
    }
    return list;
  }

  /**
   * Returns a list of all elements nested within this element
   * @returns {Array[ParsedElement]}
   */
  getDescendants() {
    const list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      const child = this.children[i];
      list.push(child);
      if ( child.children.length ) {
        const a = child.getDescendants();
        list.push(...a);
      }
    }
    return list;
  }

  /**
   * Checks if the element owns the child
   * @param {ParsedElement} element 
   * @returns {Boolean}
   */
  hasElement(element) {
    const id = element.referenceId;
    for ( let i = 0; i < this.children.length; ++i ) {
      const child = this.children[i];
      if ( id === child.referenceId ) {
        return true;
      }
    }
    return false;
  }

  stringify() {
    const content = this.content || '';
    return (this.document.trimWhitespace) ? this.trim(content) : content;
  }

  trim(content) {
    return content.replace(/\n+|\r+/, ' ').replace(/\s+/, ' ').trim();
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
}

module.exports = ParsedElement;
