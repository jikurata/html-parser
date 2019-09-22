'use strict';
const Taste = require('@jikurata/taste');
const ParsedHTMLDocument = require('../src/document/ParsedHTMLDcoument.js');
const ParsedElement = require('../src/document/ParsedElement.js');

Taste.flavor('Creating ParsedElements')
.describe('Creates a ParsedElement and adds it to children')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const e = doc.createElement('div');
  profile.element = e;
  profile.length = doc.children.length;
})
.expect('element').isInstanceOf(ParsedElement)
.expect('length').toEqual(1);

Taste.flavor('Element retrieval')
.describe('Retrieves elements using familiar dom search methods')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const e = doc.createElement('div');
  e.id = 'test';
  e.className = 'a class name';
  const e2 = doc.createElement('p')
  e2.className = 'name';
  doc.createElement('div');

  profile.findById = doc.getElementById('test');
  profile.findByClass = doc.getElementsByClassName('name').length;
  profile.findByTagName = doc.getElementsByTagName('div').length;
})
.expect('findById').isInstanceOf(ParsedElement)
.expect('findByClass').toEqual(2)
.expect('findByTagName').toEqual(2);
