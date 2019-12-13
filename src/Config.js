'use strict';

const config = {
  'trimWhitespace': true,
  'voidTags': [
    '!doctype',
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ]
}

/**
 * Modify the parser configuration
 * @param {Object} param 
 * @returns {Object}
 */
function configure(param = {}) {
  // Add void tag values to the list
  if ( param.voidTags ) {
    for ( let i = 0; i < param.voidTags.length; ++i ) {
      const tag = param.voidTags[i];
      if ( config.voidTags.indexOf(tag) === -1 ) {
        config.voidTags.push(tag);
      }
    }
  }
  // Toggle excess whitespace trimming
  if ( param.hasOwnProperty('trimWhitespace') ) {
    config.trimWhitespace = !!param.trimWhitespace;
  }

  return config;
}

module.exports = config;
module.exports.configure = configure;
