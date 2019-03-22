# read-exif

[![npm version](https://img.shields.io/npm/v/read-exif.svg)](https://www.npmjs.com/package/read-exif)
[![Build Status](https://travis-ci.com/shinnn/read-exif.svg?branch=master)](https://travis-ci.com/shinnn/read-exif)
[![codecov](https://codecov.io/gh/shinnn/read-exif/branch/master/graph/badge.svg)](https://codecov.io/gh/shinnn/read-exif)

A [Node.js](https://nodejs.org/) module to get Exif data from a JPEG file

```javascript
const readExif = require('read-exif');

(async () => {
  const exif = (await readExif('example.jpg')).Exif;

  // 34855: ID of the `ISOSpeedRatings` tag
  exif['33434']; //=> 250

  // 36868: ID of the `DateTimeDigitized` tag
  exif['36867']; //=> '2018:06:03 08:49:11'
})();
```

Designed to be memory and CPU efficient, as this module doesn't read entire file contents but read only a necessary part of a file.

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install read-exif
```

## API

```javascript
const readExif = require('read-exif');
```

### readExif(*path*)

*path*: `string | Buffer | Uint8Array | URL` (path to a [JPEG](https://jpeg.org/jpeg/) file)  
Return: `Object`

It reads Exif data from a file using [Piexifjs](https://github.com/hMatoba/piexifjs), and returns it as an `Object`.

```javascript
getExif(new URL('file:///Users/shinnn/example.jpg')); /*=> {
  '0th': { ... },
  '1st': { ... },
  Exif: { ... },
  GPS: { ... }
  Interop: { ... },
  thumbnail: ' ... '
} */
```

## License

[ISC License](./LICENSE) © 2019 Shinnosuke Watanabe
