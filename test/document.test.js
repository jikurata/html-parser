'use strict';
const Taste = require('@jikurata/taste');
const ParsedHTMLDocument = require('../src/ParsedHTMLDocument.js');
const ParsedElement = require('../src/element/ParsedElement.js');

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

Taste.flavor('Update event propagation')
.describe('ParsedElements signal their parent to emit an update event')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const element = doc.createElement('div');
  doc.fragment.appendChild(element);
  doc.fragment.on('update', () => {
    profile.eventPropagation = true;
  });
  element.emit('update');
})
.expect('eventPropagation').toBeTruthy();

Taste.flavor('Stringify ParsedClosedElement with innerHTML')
.describe('Converts a ParsedElement to a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const element = doc.createElement('p');
  doc.fragment.appendChild(element);
  element.innerHTML = 'test';
  profile.elementAsString = element.stringify();
})
.expect('elementAsString').toMatch('<p>test</p>');

Taste.flavor('Stringify ParsedClosedElement with outerHTML')
.describe('Converts a ParsedElement to a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const element = doc.createElement('p');
  doc.fragment.appendChild(element);
  element.outerHTML = '<div id="foo">hi</div>';
  profile.elementAsString = element.stringify();
})
.expect('elementAsString').toMatch('<div id="foo">hi</div>');

Taste.flavor('Stringify ParsedClosedElement with textContent')
.describe('Converts a ParsedElement to a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const element = doc.createElement('p');
  doc.fragment.appendChild(element);
  element.textContent = '<div>Tags ignored because this is just text</div><p>ignored</p>';
  profile.elementAsString = element.stringify();
  profile.childrenCount = element.children.length;
})
.expect('elementAsString').toMatch('<p><div>Tags ignored because this is just text</div><p>ignored</p></p>')
.expect('childrenCount').toEqual(1);

Taste.flavor('Stringify ParsedVoidElement')
.describe('Converts a ParsedElement into a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const element = doc.createElement('input');
  doc.fragment.appendChild(element);
  element.setAttribute('type', 'text');
  profile.elementAsString = element.stringify();
})
.expect('elementAsString').toMatch('<input type="text" />')

Taste.flavor('Stringify ParsedTextElement with textContent')
.describe('Converts a ParsedElement into a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const text = doc.createTextElement('foo');
  doc.fragment.appendChild(text);
  text.textContent = 'bar';
  profile.elementAsString = text.stringify();
})
.expect('elementAsString').toMatch('bar');
