'use strict';
const Taste = require('@jikurata/taste');
const ParsedNode = require('../src/ParsedNode.js');

Taste('ParsedNode Properties')
.test(profile => {
  profile.node = new ParsedNode('1');
})
.expect('node').toHaveProperty('_id')
.expect('node').toHaveProperty('parent')
.expect('node').toHaveProperty('children');

Taste('Check if a node has a child')
.test(profile => {
  const parent = new ParsedNode('0');
  const child = new ParsedNode('1');
  const notChild = new ParsedNode('2');
  parent.appendChild(child);

  profile.hasChild = parent.hasChild(child);
  profile.notChild = parent.hasChild(notChild);
})
.expect('hasChild').toBeTruthy()
.expect('notChild').toBeFalsy();

Taste('Add child to the end')
.test(profile => {
  const parent = new ParsedNode('0');
  parent.appendChild(new ParsedNode('1'));
  parent.appendChild(new ParsedNode('2'));
  profile.lastNodeId = parent.children[parent.children.length - 1]._id;
})
.expect('lastNodeId').toEqual('2');

Taste('Add child to the beginning')
.test(profile => {
  const parent = new ParsedNode('0');
  parent.prependChild(new ParsedNode('1'));
  parent.prependChild(new ParsedNode('2'));
  profile.firstNodeId = parent.children[0]._id;
})
.expect('firstNodeId').toEqual('2');

Taste('Replace a child with another node')
.test(profile => {
  const parent = new ParsedNode('0');
  const child = new ParsedNode('3');
  const replacement = new ParsedNode('6');

  parent.appendChild(new ParsedNode('1'));
  parent.appendChild(new ParsedNode('2'));
  parent.appendChild(child);
  parent.appendChild(new ParsedNode('4'));
  parent.appendChild(new ParsedNode('5'));

  parent.replaceChild(child, replacement);
  profile.hasReplacement = parent.hasChild(replacement);

  for ( let i = 0; i < parent.children.length; ++i ) {
    if ( replacement._id === parent.children[i]._id ) {
      profile.index = i;
      break;
    }
  }
})
.expect('hasReplacement').toBeTruthy()
.expect('index').toEqual(2);

Taste('Remove a child')
.test(profile => {
  const parent = new ParsedNode('0');
  const child = new ParsedNode('3');

  parent.appendChild(new ParsedNode('1'));
  parent.appendChild(new ParsedNode('2'));
  parent.appendChild(child);
  parent.appendChild(new ParsedNode('4'));
  parent.appendChild(new ParsedNode('5'));

  parent.removeChild(child);
  profile.hasChild = parent.hasChild(child);
})
.expect('hasChild').toBeFalsy();

Taste('Retrieve a deep list of children')
.test(profile => {
  const parent = new ParsedNode('0');
  const child = new ParsedNode('1');
  const grandchild = new ParsedNode('2');

  child.appendChild(grandchild);
  parent.appendChild(child);

  const descendants = parent.getDescendants();
  profile.length = descendants.length;
})
.expect('length').toEqual(2);

module.exports = Taste;
