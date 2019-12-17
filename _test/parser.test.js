'use strict';
const Taste = require('@jikurata/taste');
const ParsedElement = require('../src/element/ParsedElement.js');
const parse = require('../index.js');

Taste('implicit attributes get parsed with the value of null')
.test(profile => {
  const doc = parse('<div implicit></div>');
  const el = doc.getElementsByTagName('div')[0];
  profile.value = el.getAttribute('implicit');
})
.expect('value').toEqual(null);

Taste('Parses void elements')
.test(profile => {
  const content = `
    <section id="closed">This is in a closed tag</section>
    <input id="void" value="this is a void tag">
    <img id="voidWithClosed" src="" />
  `;
  const document = parse(content);
  profile.void = document.getElementById('void');
  profile.voidWithClosed = document.getElementById('voidWithClosed');
})
.expect('void').toBeInstanceOf(ParsedElement)
.expect('voidWithClosed').toBeInstanceOf(ParsedElement);

Taste('Nested Elements')
.test(profile => {
  const content = `
    <section id="root">
      this is a nested text node
      <p id="uniqueParagraph" class="nested-p">this is a nested p< /p>
      <div id="level1">
        This is nested
        <span id="level2">This is deep nested</span>
      </div>
    </section>
  `;
  const document = parse(content);
  profile.rootHasUniqueParagraph = document.getElementById('uniqueParagraph');
  profile.level1HasLevel2 = document.getElementById('level2');
})
.expect('rootHasUniqueParagraph').toBeInstanceOf(ParsedElement)
.expect('level1HasLevel2').toBeInstanceOf(ParsedElement);

Taste('Parsing a full document')
.test(profile => {
  const content = `
    <!DOCTYPE html>
    <head>
      <title>test</title>
    </head>
    <body>
      String
      <p>foobar</p>
      <div></div>
    </body>
  `;
  const document = parse(content);
  profile.doctype = document.getElementsByTagName('!DOCTYPE').length;
  profile.head = document.getElementsByTagName('head').length;
  profile.title = document.getElementsByTagName('title').length;
  profile.body = document.getElementsByTagName('body').length;
  profile.p = document.getElementsByTagName('p').length;
})
.expect('doctype').toEqual(1)
.expect('head').toEqual(1)
.expect('title').toEqual(1)
.expect('body').toEqual(1)
.expect('p').toEqual(1);

module.exports = Taste;
