import { listFormatData } from './data.js';

// http://cldr.unicode.org/development/development-process/design-proposals/list-formatting

function getStyle({ type, style }) {
  if (!type) {
    return 'regular';
  }
  if (['regular', 'duration'].indexOf(type) < 0) {
    throw new RangeError('Not a valid style: ' + JSON.stringify(style));
  }
  if (type === 'regular') {
    return 'regular';
  }
  return `duration-${style}`;
}

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

function constructParts(pattern, list) {
  if (list.length === 1) {
    return [{type: 'element', value: list[0]}];
  }

  const elem0 = typeof list[0] === 'string' ?
    {type: 'element', value: list[0]} : list[0];

  let elem1;

  if (list.length === 2) {
    if (typeof list[1] === 'string') {
      elem1 = {type: 'element', value: list[1]}; 
    } else {
      elem1 = list[1];
    }
  } else {
    elem1 = constructParts(pattern, list.slice(1));
  }

  return deconstructPattern(pattern, {
    '0': elem0,
    '1': elem1
  });
}

function FormatToParts(templates, list) {
  if (!Array.isArray(list)) {
    return [
      {type: 'element', value: list}
    ];
  }

  const length = list.length;

  if (length === 0) {
    return [
      {type: 'element', value: ''}
    ];
  }

  if (length === 1) {
    return [
      {type: 'element', value: list[0]}
    ];
  }

  if (length === 2) {
    return constructParts(templates['2'], list);
  }

  let parts = constructParts(templates['start'], [
    list[0],
    constructParts(templates['middle'], list.slice(1, -1))
  ]);

  parts = constructParts(templates['end'], [
    parts, 
    list[list.length - 1]
  ]);

  return parts;
}

export default class ListFormat {
  constructor(locales, options = {}) {
    this.locale = locales ? locales[0] : 'en-US';
    this.style = getStyle(options);

    this._templates = listFormatData[this.locale][this.style];
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
    return FormatToParts(this._templates, list).reduce(
      (string, part) => string + part.value, '');
  },
  formatToParts(list) {
    return FormatToParts(this._templates, list);
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

