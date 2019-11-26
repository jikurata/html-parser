'use strict';
const Taste = require('@jikurata/taste');
const EmittableMap = require('../src/EmittableMap.js');

Taste('Creating a key-value pair')
.test(profile => {
  const map = new EmittableMap();
  map.set('foo', 'bar');
  profile.fooValue = map.foo;
})
.expect('fooValue').toEqual('bar');

Taste('Changing a key-value pair')
.test(profile => {
  const map = new EmittableMap();
  map.set('foo', 'bar');
  map.foo = 'baz';
  profile.changedValue = map.foo;
})
.expect('changedValue').toEqual('baz');

Taste('Change event')
.test(profile => {
  const map = new EmittableMap();
  map.on('change', (k, v) => {
    switch(k) {
      case 'foo': 
        if ( v === 'bar' ) {
          profile.emitChange = true;
        }
      default: return;
    }
  });
  map.set('foo', 'bar');
})
.expect('emitChange').toBeTruthy();

module.exports = Taste;
