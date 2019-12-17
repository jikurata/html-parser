'use strict';
const ParsedElement = require('./ParsedElement.js');
const ParsedHTMLElement = require('./ParsedHTMLElement.js');
const ParsedFragmentElement = require('./ParsedFragmentElement.js');
const config = require('../Config.js');

class ParsedHTMLDocument {
  constructor(parse) {
    Object.defineProperty(this, 'fragment', {
      value: new ParsedFragmentElement(this, this.getNextId()),
      enumerable: true,
      writable: false,
      configurable: false
    });
    this._parse = parse;
    this._counter = 0;
  }

  /**
   * Find an element with the attribute id
   * @param {String} id
   * @returns {ParsedElement}
   */
  getElementById(id) {
    return this.fragment.getElementById(id);
  }

  /**
   * Find all elements with the tag name
   * @param {String} tag
   * @returns {Array<ParsedElement>}
   */
  getElementsByTagName(tag) {
    return this.fragment.getElementsByTagName(tag);
  }

  /**
   * Find all elements with the class name
   * @param {String} className
   * @returns {Array<ParsedElement>}
   */
  getElementsByClassName(className) {
    return this.fragment.getElementsByClassName(className);
  }

  /**
   * Add a node to the end of this node
   * @param {ParsedNode} node 
   */
  appendChild(node) {
    return this.fragment.appendChild(node);
  }

  /**
   * Add a node to the beginning of this node
   * @param {ParsedNode} node 
   */
  prependChild(node) {
    return this.fragment.prependChild(node);
  }

  /**
   * Replace the child with the nodes
   * @param {ParsedNode} child 
   * @param {ParsedNode|Array<ParsedNode>} nodes
   */
  replaceChild(child, nodes) {
    return this.fragment.replaceChild(child, nodes);
  }

  /**
   * Removes any matching elements from children
   * @param {ParsedNode|Array<ParsedNode>} children 
   */
  removeChild(nodes = []) {
    return this.fragment.removeChild(nodes);
  }

  hasChild(node) {
    return this.fragment.hasChild(node);
  }

  stringify() {
    return this.fragment.stringify();
  }

  getNextId() {
    return `${Date.now()}-${++this._counter}`;
  }

  getDescendants() {
    return this.fragment.getDescendants();
  }

  get children() {
    return this.fragment.children;
  }
}

module.exports = ParsedHTMLDocument;
