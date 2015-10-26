Intl.ListFormat
================

A polyfill for the upcoming
[Intl.ListFormat](https://github.com/zbraniecki/intl-list-format-spec)
specification.


## Installation

```
npm install intl-listformat
```
_or_
```
git clone https://github.com/zbraniecki/IntlListFormat.git
cd IntlListFormat
npm install
make
```
_or_ download the latest release from
[here](https://github.com/zbraniecki/IntlListFormat/releases/latest)


## Usage

The package's `polyfill.js` contains an UMD wrapper, so you can include or
require it pretty much anywhere. When included, it'll set `Intl.ListFormat`
according to the spec.

This version follows the Oct 2015 spec.
