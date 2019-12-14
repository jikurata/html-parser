'use strict';
const Taste = require('@jikurata/taste');
const ParsedElement = require('../src/element/ParsedElement.js');

Taste('ParsedElement properties')
.test(profile => {
  profile.element = new ParsedElement(0);
})
.expect('element').toHaveProperty('attributes')
.expect('element').toHaveProperty('tagName')
.expect('element').toHaveProperty('nodeType')
.expect('element').toHaveProperty('mode')
.expect('element').toHaveProperty('content');

Taste('Get/Set Attributes')
.test(profile => {
  const el = new ParsedElement(0);
  el.setAttribute('id', 'foo', false);
  profile.id = el.getAttribute('id');
})
.expect('id').toEqual('foo');

Taste('getElementById')
.test(profile => {
  const parent = new ParsedElement(0);
  const childWithId = new ParsedElement(1, {'attributes': {'id': 'foo'}});
  parent.children.push(childWithId);
  profile.foundChild = parent.getElementById('foo');
  profile.id = parent.getElementById('foo').id;
})
.expect('foundChild').toBeInstanceOf(ParsedElement)
.expect('id').toEqual('foo');

Taste('getElementsByTagName')
.test(profile => {
  const parent = new ParsedElement(0);
  const child1 = new ParsedElement(1, {'tagName': 'div', 'attributes': {'id': 'foo'}});
  const child2 = new ParsedElement(2, {'tagName': 'div'});
  parent.children.push(child1, child2);
  const found = parent.getElementsByTagName('div');
  profile.count = found.length;
  profile.foundChild1 = found[0]._id;
  profile.foundChild2 = found[1]._id;
})
.expect('count').toEqual(2)
.expect('foundChild1').toEqual(1)
.expect('foundChild2').toEqual(2);

Taste('getElementsByClassName')
.test(profile => {
  const parent = new ParsedElement(0);
  const child1 = new ParsedElement(1, {'attributes': {'class': 'foo bar'}});
  const child2 = new ParsedElement(2, {'attributes': {'class': 'foo'}});
  const child3 = new ParsedElement(3, {'attributes': {'class': 'foobar'}});
  parent.children.push(child1, child2, child3);
  const found = parent.getElementsByClassName('foo');
  profile.count = found.length;
  profile.foundChild1 = found[0]._id;
  profile.foundChild2 = found[1]._id;
})
.expect('count').toEqual(2)
.expect('foundChild1').toEqual(1)
.expect('foundChild2').toEqual(2);

module.exports = Taste;
