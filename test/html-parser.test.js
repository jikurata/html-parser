'use strict';
const Taste = require('@jikurata/taste');
const HtmlParser = require('../src/HtmlParser.js');
const ParsedHTMLDocument = require('../src/document/ParsedHTMLDocument.js');
const ParsedHTMLElement = require('../src/document/ParsedHTMLElement.js');
const ParsedElement = require('../src/document/ParsedElement.js');

// Html Parsing Tests
  Taste.flavor('Retrieving tag position')
  .describe('Finds the start and end index of the next html tag, using String.substring rules for indexes')
  .test(profile => {
    const HP = new HtmlParser();
    const content = `<div>This is a test</div>`;
    const tag1 = HP.findTagPosition(content);
    const tag2 = HP.findTagPosition(content, tag1[1]);
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
    const HP = new HtmlParser();
    const content = `<div id="test" class="some class" data-foo="bar" hidden>`;
    const tag = HP.parseTagAttributes(content);
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
    const HP = new HtmlParser();
    const content = `
    <div></div>
    `;
    profile.document = HP.parse(content);
  })
  .expect('document').isInstanceOf(ParsedHTMLDocument);

  Taste.flavor('Parsing ParsedElements')
  .describe('Parses a string into ParsedElements')
  .test(profile => {
    const HP = new HtmlParser();
    const content = `
    <div id="test" class="some class"data-foo="bar" data-bar="baz">foobar</div>
    `;
    const document = HP.parse(content);
    const element = document.getElementsByTagName('div')[0];
    profile.element = element
    profile.id = element.id;
    profile.className = element.className;
    profile.dataFoo = element.getAttribute('data-foo');
    profile.dataBar = element.getAttribute('data-bar');
  })
  .expect('element').isInstanceOf(ParsedElement)
  .expect('element').isInstanceOf(ParsedHTMLElement)
  .expect('id').toEqual('test')
  .expect('className').toEqual('some class')
  .expect('dataFoo').toEqual('bar')
  .expect('dataBar').toEqual('baz');

  Taste.flavor('Handle voided elements')
  .describe('Account for non-closed tags')
  .test(profile => {
    const content = `
      <section id="closed">This is in a closed tag</section>
      <input id="void" value="this is a void tag">
      <img id="voidWithClosed" src="" />
    `;
    const HP = new HtmlParser();
    const document = HP.parse(content);
    profile.void = document.getElementById('void');
    profile.voidWithClosed = document.getElementById('voidWithClosed');
  })
  .expect('void').toBeTruthy()
  .expect('voidWithClosed').toBeTruthy();

  Taste.flavor('Nested Elements')
  .describe('Account for nested elements')
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
    const HP = new HtmlParser();
    const document = HP.parse(content);
    profile.rootHasUniqueParagraph = document.getElementById('root').getElementById('uniqueParagraph');
    profile.level1HasLevel2 = document.getElementById('level1').getElementById('level2');
  })
  .expect('rootHasUniqueParagraph').toBeTruthy()
  .expect('level1HasLevel2').toBeTruthy();

Taste.flavor('Full document')
.describe('Parses a full document')
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
  const HP = new HtmlParser();
  const document = HP.parse(content);
  profile.doctype = document.getElementsByTagName('!DOCTYPE')[0];
  profile.head = document.getElementsByTagName('head')[0];
  profile.title = document.getElementsByTagName('title')[0];
  profile.body = document.getElementsByTagName('body')[0];
  profile.p = document.getElementsByTagName('p')[0];
})
.expect('doctype').toBeTruthy()
.expect('head').toBeTruthy()
.expect('title').toBeTruthy()
.expect('body').toBeTruthy()
.expect('p').toBeTruthy();
