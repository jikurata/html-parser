# html-parser v0.0.2
Synchronously parse html into a HTML Document object
---
## Install
---
```
npm install @jikurata/html-parser
```
## Usage
---
```
const parser = require('@jikurata/html-parser');

const html = `
    <section id="sampleDoc">
        <header class="text">This is a sample</header>
        <div>
            <p>With a nested Element</p>
            And text node support
            <div>Another div</div>
        </div>
    </section>
`;

const doc = parser(html); // Returns a ParsedHTMLDocument object

    // Returns a ParsedElement containing information about the section tag
    const sectionElement = doc.getElementById('sampleDoc')

    // Search an element's children. Returns a ParsedElement for the header tag
    const header = sectionElement.getElementsByClassName('text')[0]
    
    // Search a document. Returns two ParsedElements for the div tags
    const divs = doc.getElementsByTagName('div') 
```
Modify the ParsedHTMLDocument or any of its ParsedElements with familiar methods
```
    sectionElement.setAttribute('data-attr', 'foo');
    header.innerHTML += ' and a header too';
    doc.removeChildren(divs);

    const modifiedHtml = doc.stringify()

    console.log(modifiedHtml); 
    // <section id="sampleDoc" data-attr="foo">
    //    <header class="text">This is a sample and a header too</header>
    // </section>
```
## Documentation
---
### class **ParsedElement**
constructor(options)
- options {ParsedElementOptions}
#### Properties
- referenceId {String}
#### Methods
- getElementById(id)
    - id {String}
- getElementsByTagName(tag)
    - tag {String}
- getElementsByClassName(name)
    - name {String}
- hasAttribute(attr)
    - attr {String}
- getAttribute(attr)
    - attr {String}
- setAttribute(attr, value) 
    - attr {String}
    - value {String}
- replaceChild(child, elements)
    - child {ParsedElement}
    - elements {ParsedElement|Array[ParsedElement]}
- remove()
- removeChildren(elements)
    - elements {ParsedElement|Array[ParsedElement]}
- getDescendants()
- stringify()

### class **ParsedHTMLDocument** extends ParsedElement
constructor(options)
- options {ConfigOptions}
#### Properties
- fragment {ParsedFragmentElement}
#### Methods
- config(options)
    - options {ConfigOptions}
- createElement(options)
    - options {ParsedElementOptions}
- createTextElement(text)
    - text {String}
- deleteElement(elements)
    - elements {ParsedElement|Array[ParsedElement]}
- parse(content)
    - content {String}

### class **ParsedHTMLElement** extends ParsedElement
constructor(options)
- options {ParsedElementOptions}
#### Properties
- textContent {String}
- innerHTML {String}
- outerHTML {String}
#### Methods
- appendChild(element)
    - element {ParsedElement}
- prependChild(element)
    - element {ParsedElement}
- stringifyChildren()

### object **ConfigOptions**
- voidTags {Array}
- trimWhitespace {Boolean}

### object **ParsedElementOptions**
- tagName: {String}
- nodeType: {String},
- mode: {String}
- attributes {Object},
- content: {String},
- parent: {ParsedElement},
- children: {Array[ParsedElement]}

## Version Log
---
**v0.0.2**
- Implement replaceChild method for ParsedElement
- Fixed outerHTML setter to properly overwrite the parent element's children

**v0.0.1**
- ParsedElement emits update events and propagate the updates to its ancestors
- Implement textContent, innerHTML, outerHTML
- The document or any section of a document can be converted back into a string with the stringify() method
- Fixed a bug that caused the parser to miss an element's closing tag when the element has no content

**v0.0.0**
- Plans:
    - Expand upon available methods for ParsedElement and its derivatives
