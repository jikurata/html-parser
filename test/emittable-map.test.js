'use strict';
const Taste = require('@jikurata/taste');
const EmittableMap = require('../src/EmittableMap.js');

Taste.flavor('Creating a key-value pair')
.describe('Define a k-v pair in the map')
.test(profile => {
  const map = new EmittableMap();
  map.set('foo', 'bar');
  profile.fooValue = map.foo;
})
.expect('fooValue').toEqual('bar');

Taste.flavor('Changing a key-value pair')
.describe('Setter updates the key value pair')
.test(profile => {
  const map = new EmittableMap();
  map.set('foo', 'bar');
  map.foo = 'baz';
  profile.changedValue = map.foo;
})
.expect('changedValue').toEqual('baz');

Taste.flavor('Change event')
.describe('Emits a change event when a key value pair changes')
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
