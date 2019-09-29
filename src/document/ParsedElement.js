'use strict';

class ParsedElement {
  constructor(options) {
    this.tagName = options.tagName || null;
    this.nodeType = options.nodeType || 'element';
    this.attributes = options.attributes || {};
    this.children = options.children || [];
    this.parent = options.parent || null;
    this.source = options.source || null;
  }

  getElementById(id) {
    for ( let i = 0; i < this.children.length; ++i ) {
      const e = this.children[i];
      if ( e.attributes.id && e.attributes.id === id ) {
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

  setAttribute(attr, value) {
    this.attributes[attr] = value;
  }

  get id() {
    return this.attributes.id;
  }

  set id(id) {
    this.attributes.id = id;
  }

  get className() {
    return this.attributes.class;
  }

  set className(className) {
    this.attributes.class = className;
  }
}

module.exports = ParsedElement;
