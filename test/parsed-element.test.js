'use strict';
const Taste = require('@jikurata/taste');
const ParsedElement = require('../src/element/ParsedElement.js');
const ParsedHTMLElement = require('../src/element/ParsedHTMLElement.js');

Taste.flavor('ParsedElement properties')
.describe('Ensure any instance of ParsedElement has specific properties')
.test(profile => {
  const el = new ParsedElement(0);
  profile.hasReferenceId = el.hasOwnProperty('referenceId');
  profile.hasAttributes = el.hasOwnProperty('attributes');
  profile.hasTagName = el.hasOwnProperty('tagName');
  profile.hasNodeType = el.hasOwnProperty('nodeType');
  profile.hasMode = el.hasOwnProperty('mode');
  profile.hasContent = el.hasOwnProperty('content');
  profile.hasParent = el.hasOwnProperty('parent');
  profile.hasChildren = el.hasOwnProperty('children');
})
.expect('hasReferenceId').toBeTruthy()
.expect('hasAttributes').toBeTruthy()
.expect('hasTagName').toBeTruthy()
.expect('hasNodeType').toBeTruthy()
.expect('hasMode').toBeTruthy()
.expect('hasContent').toBeTruthy()
.expect('hasParent').toBeTruthy()
.expect('hasChildren').toBeTruthy();
