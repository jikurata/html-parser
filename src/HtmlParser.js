'use strict';
const ParsedHTMLDocument = require('./ParsedHTMLDocument.js');


const doc = new ParsedHTMLDocument();

module.exports = doc.parse;
module.exports.config = doc.config;
module.exports.ParsedHTMLDocument = ParsedHTMLDocument;
