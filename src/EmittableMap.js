'use strict';
const EventEmitter = require('events');
const map = Symbol('map');

class EmittableMap extends EventEmitter {
  constructor(o = {}) {
    super();
    this[map] = {};
    this.setAll(o, false);
  }

  /**
   * Retrieves a property from the map
   * Returns null if the property does not exist
   * @param {String} property
   * @returns {*}
   */
  get(property) {
    if ( this[map].hasOwnProperty(property) ) {
      return this[map][property];
    }
    return null;
  }

  /**
   * Add a property to the EmittableMap instance
   * @param {String} property 
   * @param {*} value
   * @param {Boolean} emit Emits any changes when true
   */
  set(property, value, emit = true) {
    // Create getter and setter in the EmittableMap instance for the property
    if ( !this[map].hasOwnProperty(property) ) {
      Object.defineProperty(this, property, {
        enumerable: true,
        get: () => { return this.get(property); },
        set: (v) => { this.set(property, v); }
      });
    }

    // Change its value if its current value is different from the new one
    if ( value !== this[map][property] ) {
      const oldValue = this[map][property];
      this[map][property] = value;
      if ( emit ) {
        this.emit('change', property, value, oldValue);
      }
    }
  }

  /**
   * Add key-value pairs from an object to the EmittableMap instance
   * @param {Object} o 
   * @param {Boolean} emit Emits any changes when true
   */
  setAll(o, emit = true) {
    if ( !o || typeof o !== 'object' ) {
      throw new TypeError(`Expected an object as an argument`);
    }
    const keys = Object.keys(o);
    for ( let i = 0; i < keys.length; ++i ) {
      const key = keys[i];
      this.set(key, o[key], emit);
    }
  }
}

module.exports = EmittableMap;
