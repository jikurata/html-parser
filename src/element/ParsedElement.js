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
      'nodeType': param.nodeType || 'element',
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

  stringify() {
    return this.content || '';
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
