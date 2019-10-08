'use strict';
const ParsedHTMLDocument = require('./src/ParsedHTMLDocument.js');

const doc = new ParsedHTMLDocument();

function parse(content) {
  return doc.parse(content);
}

/**
 * Update the parser configurations
 * @param {Object} options {
 *  voidTags: {Array[String]} Add other tags to the list of void tags (non-closed tag names)
 * }
 */
function config(options) {
  return doc.config(options);
}

function findTagPosition(content, start, end) {
  return doc.findTagPosition(content, start, end);
}

function parseTagAttributes(content) {
  return doc.parseTagAttributes(content);
}

module.exports = parse;
module.exports.config = config;
module.exports.findTagPosition = findTagPosition;
module.exports.parseTagAttributes = parseTagAttributes;
module.exports.ParsedHTMLDocument = ParsedHTMLDocument;
