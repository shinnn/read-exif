'use strict';

const {join} = require('path');
const {mkdir, writeFile} = require('fs').promises;
const {pathToFileURL} = require('url');

const {dump, TagValues: {ExifIFD: {Sharpness}, ImageIFD: {Make}}, insert} = require('piexifjs');
const readExif = require('.');
const smallestJpeg = require('smallest-jpeg');
const test = require('tape');

const fixture = insert(dump({
	Exif: {
		[Sharpness]: 777
	}
}), smallestJpeg.toString('binary'));
const fixtureLarge = insert(dump({
	'0th': {
		[Make]: '0'.repeat(65500)
	}
}), smallestJpeg.toString('binary'));
const tmp = join(__dirname, 'tmp');

test('readExif()', async t => {
	await mkdir(tmp, {recursive: true});
	await Promise.all([
		writeFile(join(tmp, 'fixture.jpg'), fixture, 'binary'),
		writeFile(join(tmp, 'fixture-large.jpg'), fixtureLarge, 'binary'),
		writeFile(join(tmp, 'fixture-non-jpeg'), Buffer.alloc(107)),
		writeFile(join(tmp, 'fixture-small'), fixture.slice(0, 106), 'binary'),
		writeFile(join(tmp, 'fixture-empty'), Buffer.alloc(0))
	]);

	t.equal(
		(await readExif(join(tmp, 'fixture.jpg'))).Exif[Sharpness],
		777,
		'should read a file and parse its Exif data.'
	);

	t.equal(
		(await readExif(Buffer.from(join(tmp, 'fixture-large.jpg'))))['0th'][Make],
		'0'.repeat(65500),
		'should support large files.'
	);

	try {
		await readExif(pathToFileURL(join(tmp, 'fixture-non-jpeg')));
		t.fail('Unexpectedly succeeded.');
	} catch ({code}) {
		t.equal(
			code,
			'ERR_DATA_NOT_SUPPORTED',
			'should fail when it reads a non-JPEG file.'
		);
	}

	try {
		await readExif(join(tmp, 'fixture-small'));
		t.fail('Unexpectedly succeeded.');
	} catch ({code}) {
		t.equal(
			code,
			'ERR_INSUFFICIENT_DATA_SIZE',
			'should fail when it reads a too small file.'
		);
	}

	try {
		await readExif(join(tmp, 'fixture-empty'));
		t.fail('Unexpectedly succeeded.');
	} catch ({passedSize}) {
		t.equal(
			passedSize,
			0,
			'should fail when it reads an empty file.'
		);
	}

	try {
		await readExif(join(tmp, 'this-file-does-not-exist'));
		t.fail('Unexpectedly succeeded.');
	} catch ({code}) {
		t.equal(
			code,
			'ENOENT',
			'should fail when it cannot read a file.'
		);
	}

	t.end();
});

test('Argument validation', async t => {
	try {
		await readExif(new Int32Array());
		t.fail('Unexpectedly succeeded.');
	} catch ({code}) {
		t.equal(
			code,
			'ERR_INVALID_ARG_TYPE',
			'should fail when the argument is not a path.'
		);
	}

	try {
		await readExif();
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (<string|Buffer|Uint8Array|URL>), but got no arguments.',
			'should fail when it takes no arguments.'
		);
	}

	try {
		await readExif('_', '_');
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 1 argument (<string|Buffer|Uint8Array|URL>), but got 2 arguments.',
			'should fail when it takes too many arguments.'
		);
	}

	t.end();
});
