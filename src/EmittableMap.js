'use strict';
const EventEmitter = require('events');

class EmittableMap extends EventEmitter {
  constructor(o = {}) {
    super();
    this._map = {};
    this._setAll(o, false);
  }

  /**
   * Retrieves a property from the map
   * Returns null if the property does not exist
   * @param {String} property
   * @returns {*}
   */
  _get(property) {
    if ( this._map.hasOwnProperty(property) ) {
      return this._map[property];
    }
    return null;
  }

  /**
   * Add a property to the EmittableMap instance
   * @param {String} property 
   * @param {*} value
   * @param {Boolean} emit Emits any changes when true
   */
  _set(property, value, emit = true) {
    // Create getter and setter in the EmittableMap instance for the property
    if ( !this._map.hasOwnProperty(property) ) {
      Object.defineProperty(this, property, {
        enumerable: true,
        get: () => { return this._get(property); },
        set: (v) => { this._set(property, v); }
      });
    }

    // Change its value if its current value is different from the new one
    if ( value !== this._map[property] ) {
      const oldValue = this._map[property];
      this._map[property] = value;
      if ( emit ) {
        this.emit(property, value, oldValue);
      }
    }
  }

  /**
   * Add key-value pairs from an object to the EmittableMap instance
   * @param {Object} o 
   * @param {Boolean} emit Emits any changes when true
   */
  _setAll(o, emit = true) {
    if ( !o || typeof o !== 'object' ) {
      throw new TypeError(`Expected an object as an argument`);
    }
    const keys = Object.keys(o);
    for ( let i = 0; i < keys.length; ++i ) {
      const key = keys[i];
      this._set(key, o[key], emit);
    }
  }
}

module.exports = EmittableMap;
