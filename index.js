'use strict';
const Parser = require('./src/Parser.js');

const parser = new Parser();

module.exports = parser.parse;
module.exports.config = parser.config;
