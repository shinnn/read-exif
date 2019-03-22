'use strict';

const {createReadStream} = require('fs');

const getExif = require('get-exif');

const MINIMUN_JPEG_SIZE = 107;
const ERROR = 'Expected 1 argument (<string|Buffer|Uint8Array|URL>)';

module.exports = async function readExif(...args) {
	const argLen = args.length;

	if (argLen === 0) {
		const error = new RangeError(`${ERROR}, but got no arguments.`);

		error.code = 'ERR_MISSING_ARGS';
		throw error;
	}

	if (argLen !== 1) {
		const error = new RangeError(`${ERROR}, but got ${argLen} arguments.`);

		error.code = 'ERR_TOO_MANY_ARGS';
		throw error;
	}

	return new Promise((resolve, reject) => {
		const buffers = [];
		let lastErrorOrResult;

		createReadStream(args[0])
		.on('readable', function onReadable() {
			let chunk;

			while ((chunk = this.read()) !== null) {
				buffers.push(chunk);

				try {
					if (buffers.length === 1) {
						lastErrorOrResult = getExif(chunk);
					} else {
						lastErrorOrResult = getExif(Buffer.concat(buffers, this.bytesRead));
					}
				} catch (err) {
					if (this.bytesRead >= MINIMUN_JPEG_SIZE && err.code === 'ERR_DATA_NOT_SUPPORTED') {
						this.destroy(err);
						return;
					}

					lastErrorOrResult = err;
					continue;
				}

				this.destroy();
				resolve(lastErrorOrResult);
				return;
			}
		})
		.once('error', err => reject(err))
		.once('close', () => {
			if (lastErrorOrResult && lastErrorOrResult.code === 'ERR_INSUFFICIENT_DATA_SIZE') {
				reject(lastErrorOrResult);
				return;
			}

			if (buffers.length === 0) {
				try {
					getExif(Buffer.alloc(0));
				} catch (err) {
					reject(err);
				}
			}
		});
	});
};
