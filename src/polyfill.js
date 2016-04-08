import { listFormatData } from './data.js';

// http://cldr.unicode.org/development/development-process/design-proposals/list-formatting

function getType({ type }) {
  if (!type) {
    return 'regular';
  }
  if (['regular', 'unit'].indexOf(type) < 0) {
    throw new RangeError('Not a valid type: ' + JSON.stringify(type));
  }
  return type;
}

function getStyle({ style }) {
  if (!style) {
    return 'long';
  }
  if (['long', 'short', 'narrow'].indexOf(style) < 0) {
    throw new RangeError('Not a valid style: ' + JSON.stringify(style));
  }
  return style;
}

// @pattern - 'AA{xx}BB{yy}CC'
// @placeables {xx: 'value1', yy: 'value2'}
//
// returns a list of parts, like:
// [
//   {type: 'literal', value: 'AA'},
//   {type: 'element', value: 'value1'},
//   {type: 'literal', value: 'BB'},
//   {type: 'element', value: 'value2'},
//   {type: 'literal', value: 'CC'}
// ]
function deconstructPattern(pattern, placeables) {
  const parts = pattern.split(/\{([^\}]+)\}/);
  const result = [];

  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      if (part.length > 0) {
        result.push({type: 'literal', value: part});
      }
    } else {
      const subst = placeables[part];
      if (!subst) {
        throw new Error(`Missing placeable: "${part}"`);
      }
      if (Array.isArray(subst)) {
        result.push(...subst);
      } else {
        result.push(subst);
      }
    }
  });
  return result;
}

function CreatePartsFromList(templates, list) {
  if (!Array.isArray(list)) {
    return [];
  }

  const len = list.length;

  if (len === 0) {
    return [];
  }

  if (len === 1) {
    return [
      {type: 'element', value: list[0]}
    ];
  }

  if (len === 2) {
    return deconstructPattern(templates['2'], {
      '0': {type: 'element', value: list[0]},
      '1': {type: 'element', value: list[1]}
    });
  }

  // See: http://cldr.unicode.org/development/development-process/design-proposals/list-formatting
  let parts = {type: 'element', value: list[len - 1]};

  for (let i = len - 2; i > -1; i--) {
    let type = 
      i === len - 2 ?
        'end' :
        i === 0 ? 'start' : 'middle';

    parts = deconstructPattern(templates[type], {
      '0': {type: 'element', value: list[i]},
      '1': parts
    });
  }

  return parts;
}

export default class ListFormat {
  constructor(locales, options = {}) {
    this.locale = locales ? locales[0] : 'en-US';
    this.type = getType(options);
    this.style = getStyle(options);

    this._templates = listFormatData[this.locale][this.type][this.style];
  }

  static supportedLocalesOf(locales, options = {}) {
  }

  resolvedOptions() {
    return {
      locale: this.locale,
      style: this.style
    };
  }

  format(list) {
    return CreatePartsFromList(this._templates, list).reduce(
      (string, part) => string + part.value, '');
  }

  formatToParts(list) {
    return CreatePartsFromList(this._templates, list);
  }
};

/*global ClobberIntlLocale:false */

if (typeof Intl === 'undefined') {
    if (typeof global !== 'undefined') {
        global.Intl = { ListFormat };
    } else if (typeof window !== 'undefined') {
        window.Intl = { ListFormat };
    } else {
        this.Intl = { ListFormat };
    }
} else if (!Intl.ListFormat || (typeof ClobberIntlListFormat !== 'undefined' &&
      ClobberIntlListFormat)) {
    Intl.ListFormat = ListFormat;
} else if (typeof console !== 'undefined') {
    console.warn('Intl.ListFormat already exists, and has NOT been replaced by this polyfill');
    console.log('To force, set a global ClobberIntlListFormat = true');
}

