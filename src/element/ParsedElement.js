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
      enumerale: true,
      writable: false,
      configurable: false
    });
    this.setAll({
      'nodeType': param.nodeType || 'element',
      'attributes': param.attributes || {},
      'parent': param.parent || null,
      'children': param.children || []
    }, false);

    this.on('change', (field, value, oldValue) => {
      // Do update stuff on element
      if ( field === 'parent' ) {
        this.parent.emit('propagate-update', this.referenceeId);
      }
      else {
        this.update();
      }
    });

    // propagate a change event upwards
    this.on('update', () => {
      if ( this.parent ) {
        this.parent.emit('propagate-update', this.referenceId)
      }
    });

    // Update the element when receiving an update from a child
    this.on('propagate-update', (referenceId) => {
      this.update();
    });
  }

  update(emit = true) {
    if ( emit ) {
      this.emit('update');
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
        for ( let j = 0; j < a.length; ++j ) {
          list.push(a);
        }
      }
    }
    return list;
  }

  stringify() {
    return '';
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
      this.set(key, o[key], false);
    }
    if ( emit ) {
      this.emit('change', o);
    }
  }
}

module.exports = ParsedElement;
