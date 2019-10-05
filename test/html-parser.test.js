'use strict';
const Taste = require('@jikurata/taste');
const ParsedHTMLDocument = require('../src/ParsedHTMLDocument.js');
const ParsedElement = require('../src/element/ParsedElement.js');

// Html Parsing Tests
  Taste.flavor('Retrieving tag position')
  .describe('Finds the start and end index of the next html tag, using String.substring rules for indexes')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
    const content = `<div>This is a test</div>`;
    const tag1 = doc.findTagPosition(content);
    const tag2 = doc.findTagPosition(content, tag1[1]);
    profile.tag1Start = tag1[0];
    profile.tag1End = tag1[1];
    profile.tag2Start = tag2[0];
    profile.tag2End = tag2[1];
  })
  .expect('tag1Start').toEqual(0)
  .expect('tag1End').toEqual(5)
  .expect('tag2Start').toEqual(19)
  .expect('tag2End').toEqual(25);

  Taste.flavor('Parsing html tags')
  .describe('Returns attributes, mode and tag name')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
    const content = `<div id="test" class="some class" data-foo="bar" hidden>`;
    const tag = doc.parseTagAttributes(content);
    profile.tagName = tag.tagName;
    profile.id = tag.attributes.id;
    profile.class= tag.attributes.class;
    profile.foo = tag.attributes['data-foo'];
    profile.hidden = tag.attributes.hidden;
  })
  .expect('tagName').toEqual('div')
  .expect('id').toEqual('test')
  .expect('class').toEqual('some class')
  .expect('foo').toEqual('bar')
  .expect('hidden').toBeTruthy();

  Taste.flavor('Parsing a ParsedHTMLDocument')
  .describe('Converts a string into a ParsedHTMLDocument')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
    const content = `
    <div></div>
    `;
    profile.document = doc.parse(content);
  })
  .expect('document').isInstanceOf(ParsedHTMLDocument);

  Taste.flavor('Parsing ParsedElements')
  .describe('Parses a string into ParsedElements')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
    const content = `
    <div id="test" class="some class"data-foo="bar" data-bar="baz">foobar</div>
    `;
    const document = doc.parse(content);
    const element = document.getElementsByTagName('div')[0];
    profile.element = element
    profile.id = element.id;
    profile.className = element.className;
    profile.dataFoo = element.getAttribute('data-foo');
    profile.dataBar = element.getAttribute('data-bar');
  })
  .expect('element').isInstanceOf(ParsedElement)
  .expect('id').toEqual('test')
  .expect('className').toEqual('some class')
  .expect('dataFoo').toEqual('bar')
  .expect('dataBar').toEqual('baz');

  Taste.flavor('Handle voided elements')
  .describe('Account for non-closed tags')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
    const content = `
      <section id="closed">This is in a closed tag</section>
      <input id="void" value="this is a void tag">
      <img id="voidWithClosed" src="" />
    `;
    const document = doc.parse(content);
    profile.void = document.getElementById('void');
    profile.voidWithClosed = document.getElementById('voidWithClosed');
  })
  .expect('void').isInstanceOf(ParsedElement)
  .expect('voidWithClosed').isInstanceOf(ParsedElement);

  Taste.flavor('Nested Elements')
  .describe('Account for nested elements')
  .test(profile => {
    const doc = new ParsedHTMLDocument();
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
    const document = doc.parse(content);
    profile.rootHasUniqueParagraph = document.getElementById('uniqueParagraph');
    profile.level1HasLevel2 = document.getElementById('level2');
  })
  .expect('rootHasUniqueParagraph').isInstanceOf(ParsedElement)
  .expect('level1HasLevel2').isInstanceOf(ParsedElement);

Taste.flavor('Full document')
.describe('Parses a full document')
.test(profile => {
  const doc = new ParsedHTMLDocument();
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
  const document = doc.parse(content);
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

Taste.flavor('Modify and Stringify a document')
.describe('Change the contents of a document and convert it back to a string')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const html = `
  <section id="sampleDoc">
      <header class="text">This is a sample</header>
      <div>
          <p>With a nested Element</p>
          And text node support
          <div>Another div</div>
      </div>
  </section>`;
  const document = doc.parse(html); 
  const sectionElement = document.getElementById('sampleDoc')
  const header = sectionElement.getElementsByClassName('text')[0]

  sectionElement.setAttribute('data-attr', 'foo');
  header.innerHTML += ' and a header too';

  profile.modifiedHeader = header.stringify();
})
.expect('modifiedHeader').toMatch(`<header class="text">This is a sample and a header too</header>`);

Taste.flavor('Trim html of excess whitespaces')
.describe('Remove extra whitespaces when true')
.test(profile => {
  const doc = new ParsedHTMLDocument();
  const html = `
      <section>

    foo
    bar
  </section>`;
  doc.config({trimWhitespace: true});
  const document = doc.parse(html);
  profile.trimmedHtml = document.stringify();
})
.expect('trimmedHtml').toMatch(`<section>foo bar</section>`);
