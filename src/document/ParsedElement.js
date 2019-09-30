'use strict';
const EventEmitter = require('events');

class ParsedElement extends EventEmitter {
  constructor(id, param = {}) {
    super();
    Object.defineProperty(this, 'referenceId', {
      value: id,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'map', {
      value: {},
      enumerale: false,
      writable: false,
      configurable: false
    });
    this.setAll({
      'nodeType': param.nodeType || 'element',
      'attributes': param.attributes || {},
      'parent': param.parent || null,
      'children': param.children || [],
      'source': param.source || {}
    }, false);

    this.on('change', (field, value, oldValue) => {
      // Do update stuff on element
    });

    // propagate a change event upwards
    this.on('update', () => {
      if ( this.parent ) {
        this.parent.emit('propagate-change', this.referenceId)
      }
    })
  }

  /**
   * Add a field to the ParsedElement instance
   * @param {String} field 
   * @param {*} value 
   */
  set(field, value, emit = true) {
    if ( !this.hasOwnProperty(field) ) {
      Object.defineProperty(this, field, {
        enumerable: true,
        get: () => {
          return this.map[field];
        },
        set: (v) => {
          this.set(field, v);
        }
      });
    }
    if ( value !== this.map[field] ) {
      const oldValue = this.map[field]
      this.map[field] = value;
      // Do update stuff on the element
      if ( emit ) {
        this.emit('change', field, value, oldValue);
      }
    }
  }

  /**
   * Add key-value pairs from an object to the ParsedElement instance
   * @param {Object} o 
   */
  setAll(o = {}, emit = true) {
    const keys = Object.keys(o);
    for ( let i = 0; i < keys.length; ++i ) {
      const key = keys[i];
      this.set(key, o[key], emit);
    }
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
