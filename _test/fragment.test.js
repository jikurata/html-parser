'use strict';
const Taste = require('@jikurata/taste');
const parse = require('../src/Parser.js');
const ParsedFragmentElement = require('../src/element/ParsedFragmentElement.js');
const ParsedElement = require('../src/element/ParsedElement.js');

Taste('Creating ParsedElements')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const e = doc.createElement('div');
  doc.appendChild(e);
  profile.element = e;
  profile.length = doc.children.length;
})
.expect('element').toBeInstanceOf(ParsedElement)
.expect('length').toEqual(1);

Taste('Element retrieval')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const e = doc.createElement('div');
  e.id = 'test';
  e.className = 'a class name';
  const e2 = doc.createElement('p');
  e2.className = 'name';
  doc.createElement('div');

  doc.appendChild(e);
  doc.appendChild(e2);

  profile.findById = doc.getElementById('test');
  profile.findByClass = doc.getElementsByClassName('name').length;
  profile.findByTagName = doc.getElementsByTagName('div').length;
})
.expect('findById').toBeInstanceOf(ParsedElement)
.expect('findByClass').toEqual(2)
.expect('findByTagName').toEqual(1);

Taste('Update event propagation')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const element = doc.createElement('div');
  doc.appendChild(element);
  doc.on('propagate-update', () => {
    profile.eventPropagation = true;
  });
  element.emit('propagate-update');
})
.expect('eventPropagation').toBeTruthy();

Taste('Stringify ParsedElement')
.test('Converts a ParsedElement into a string',
profile => {
  const doc = new ParsedFragmentElement(parse);
  const element = doc.createElement('input');
  doc.appendChild(element);
  element.setAttribute('type', 'text');
  profile.elementAsString = element.stringify();
})
.expect('elementAsString').toMatch('<input type="text" />')

Taste('Stringify ParsedElement with innerHTML')
.test('Converts a ParsedElement to a string',
profile => {
  const doc = new ParsedFragmentElement(parse);
  const element = doc.createElement('p');
  doc.appendChild(element);
  element.innerHTML = 'test';
  profile.elementAsString = element.stringify();
})
.expect('elementAsString').toMatch('<p>test</p>');

Taste('Stringify ParsedElement with outerHTML')
.test('Converts a ParsedElement to a string',
profile => {
  const doc = new ParsedFragmentElement(parse);
  const element = doc.createElement('p');
  doc.appendChild(element);
  element.outerHTML = '<div id="foo">hi</div>';
  profile.elementAsString = doc.stringify();
})
.expect('elementAsString').toMatch('<div id="foo">hi</div>');

Taste('Stringify ParsedElement with outerHTML')
.test('Converts a ParsedElement to a string',
profile => {
  const content = `
    <header></header>
    <section></section>
  `
  const document = parse(content);
  const element = document.getElementsByTagName('section')[0];
  element.outerHTML = '<div id="foo">hi</div>';
  profile.elementAsString = document.stringify();
})
.expect('elementAsString').toMatch('<header></header><div id="foo">hi</div>');

Taste('Stringify ParsedElement with textContent')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const element = doc.createElement('p');
  doc.appendChild(element);
  element.textContent = '<div>Tags ignored because this is just text</div><p>ignored</p>';
  profile.elementAsString = element.stringify();
  profile.childrenCount = element.children.length;
})
.expect('elementAsString').toMatch('<p><div>Tags ignored because this is just text</div><p>ignored</p></p>')
.expect('childrenCount').toEqual(1);

Taste('Stringify ParsedElement with textContent')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const text = doc.createTextNode('foo');
  doc.appendChild(text);
  text.textContent = 'bar';
  profile.elementAsString = text.stringify();
})
.expect('elementAsString').toMatch('bar');

Taste('Modify and Stringify a document')
.test(profile => {
  const html = `
  <section id="sampleDoc">
      <header class="text">This is a sample</header>
      <div>
          <p>With a nested Element</p>
          And text node support
          <div>Another div</div>
      </div>
  </section>`;
  const document = parse(html); 
  const sectionElement = document.getElementById('sampleDoc')
  const header = sectionElement.getElementsByClassName('text')[0]

  sectionElement.setAttribute('data-attr', 'foo');
  header.innerHTML += ' and a header too';

  profile.modifiedHeader = header.stringify();
})
.expect('modifiedHeader').toMatch(`<header class="text">This is a sample and a header too</header>`);

Taste('Child replacement')
.test(profile => {
  const doc = new ParsedFragmentElement(parse);
  const child = doc.createElement('p');
  const replacement = doc.createElement('span');
  doc.appendChild(child);
  doc.replaceChild(child, replacement);
  profile.replacedHTML = doc.stringify();
})
.expect('replacedHTML').toEqual('<span></span>');

Taste('Child replacement')
.test('Replace a child element with an array of elements',
profile => {
  const content = `
    <div>
      <p>foo</p>
    </div>
    <div>
      bar
    </div>
  `;
  const doc = new ParsedFragmentElement(parse);
  const child = doc.createElement('p');
  const replacement = parse(content).children;
  doc.appendChild(child);
  doc.replaceChild(child, replacement);
  profile.replacedHTML = doc.stringify();
})
.expect('replacedHTML').toMatch('<div><p>foo</p></div><div>bar</div>');

Taste('Trim html of excess whitespaces')
.test(profile => {
  const html = `
      <section>

    foo
    bar
  </section>`;
  const document = parse(html);
  profile.trimmedHtml = document.stringify();
})
.expect('trimmedHtml').toMatch(`<section>foo bar</section>`);

module.exports = Taste;
