# html-parser v0.0.1
Synchronously parse html into a pseudo document object
---
## Install
---
```
npm install @jikurata/html-parser
```
## Usage
---
```
const HtmlParser = require('@jikurata/html-parser');

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

const parser = new HtmlParser();
const doc = parser.parse(html); // Returns a ParsedHTMLDocument object

    // Returns a ParsedElement containing information about the section tag
    const element = doc.getElementById('sampleDoc')

    // Search an element's children. Returns a ParsedElement for the header tag
    element.getElementsByClassName('text') 
    
    // Search a document. Returns two ParsedElements for the div tags
    doc.getElementsByTagName('div') 
```
## Version Log
---
**v0.0.1**
- Fixed a bug that caused the parser to miss an element's closing tag when the element has no content

**v0.0.0**
- Plans:
    - Expand upon available methods for ParsedElement and its derivatives
