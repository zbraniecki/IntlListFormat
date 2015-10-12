import { listFormatData } from './data.js';

// http://cldr.unicode.org/development/development-process/design-proposals/list-formatting

function getStyle({ style }) {
  if (!style) {
    return 'regular';
  }
  if (['regular', 'duration', 'duration-short', 'duration-narrow'].indexOf(style) < 0) {
    throw new RangeError('Not a valid style: ' + JSON.stringify(style));
  }
  return style;
}


export default class ListFormat {
  constructor(locales, options = {}) {
    this.locale = locales ? locales[0] : 'en-US';
    this.style = getStyle(options);
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
    const templates = listFormatData[this.locale][this.style];

    const length = list.length;

    if (length === 0) {
      return ''; 
    }

    if (length === 1) {
      return list[0];
    }

    if (length === 2) {
      const template = templates['2'];
      return template.replace(/\{([0-9])\}/g, (m,v) => {
        return list[parseInt(v)]
      });
    }

    let string = templates['end'];
    
    string = string.replace('{1}', list[length - 1]);
    string = string.replace('{0}', list[length - 2]);

    // middles
    for (let i = length - 3; i > 0; i--) {
      string = templates['middle'].replace(/\{([0-9])\}/g, (m, v) => {
        if (v === '0') {
          return list[i];
        }
        if (v === '1') {
          return string;
        }
      });
    }

    string = templates['start'].replace(/\{([0-9])\}/g, (m, v) => {
      if (v === '0') {
        return list[0];
      }
      if (v === '1') {
        return string;
      }
    });
    return string;
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
