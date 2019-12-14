'use strict';
const EmittableMap = require('./EmittableMap.js');

class ParsedNode extends EmittableMap {
  constructor(id) {
    super();
    Object.defineProperty(this, '_id', {
      value: id,
      enumerable: true,
      writable: false,
      configurable: false
    });
    this._setAll({
      'parent': null,
      'children': []
    });
  }

  /**
   * Add a node to the end of this node
   * @param {ParsedNode} node 
   */
  appendChild(node) {
    if ( node instanceof ParsedNode ) {
      const list = this.children;
      node._set('parent', this, false);
      list.push(node);
      this.children = list;
    }
    else {
      throw new TypeError(`Expected argument to be instance of ParsedNode`);
    }
  }

  /**
   * Add a node to the beginning of this node
   * @param {ParsedNode} node 
   */
  prependChild(node) {
    if ( node instanceof ParsedNode ) {
      const list = this.children;
      node._set('parent', this, false);
      list.unshift(node);
      this.children = list;
    }
    else {
      throw new TypeError(`Expected argument to be instance of ParsedNode`);
    }
  }

  /**
   * Replace the child with the nodes
   * @param {ParsedNode} child 
   * @param {ParsedNode} node
   */
  replaceChild(child, node) {
    if ( this.hasChild(child) ) {
      const list = [];

      // Find child in parent's children
      for ( let i = 0; i < this.children.length; ++i ) {
        const current = this.children[i];

        // push the node back into the list if it does not match the original child or replacement
        if ( current._id !== child._id && current._id !== node._id ) {
          list.push(current);
        }
        else {
          // Replace the node at the current index with the replacement node
          node.parent = this;
          list.push(node);
          child.parent = null;
        }
      }

      this.children = list;
    }
  }

  /**
   * Removes any matching elements from children
   * @param {ParsedNode|Array<ParsedNode>} children 
   */
  removeChild(nodes = []) {
    if ( nodes instanceof ParsedNode ) {
      nodes = [nodes];
    }

    if ( Array.isArray(nodes) ) {
      const ids = [];
      for ( let i = 0; i < nodes.length; ++i ) {
        ids.push(nodes[i]._id);
      }

      if ( ids.length ) {
        const list = [];
        for ( let i = 0; i < this.children.length; ++i ) {
          const child = this.children[i];
  
          // Keep children that do not have matching ids
          if ( ids.indexOf(child._id) === -1 ) {
            list.push(child);
          }
        }
  
        // Emits a change event
        this.children = list;
      }
    }
  }

  /**
   * Remove this element from the document
   */
  remove() {
    if ( this.parent ) {
      this.parent.removeChild([this]);
    }
  }

  /**
   * Checks if this node's immediate children contains the node
   * @param {ParsedNode} node
   * @returns {Boolean}
   */
  hasChild(node) {
    if ( this.children.length ) {
      for ( let i = 0; i < this.children.length; ++i ) {
        const current = this.children[i];
        if ( node._id === current._id ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Retrieves the id of each immediate child
   * @returns {Array<String>}
   */
  getChildrenRefIds() {
    const list = [];
    for ( let i = 0; i < this.children.length; ++i ) {
      list.push(this.children[i]._id);
    }
    return list;
  }

  /**
   * Returns a list of all elements nested within this element
   * @returns {Array<ParsedNode>}
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

  get firstChild() {
    return this.children[0];
  }
}

module.exports = ParsedNode;
