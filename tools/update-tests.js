/**
 * @fileoverview A simple script to update existing tests to reflect new
 *      parser changes.
 * @author Nicholas C. Zakas

"use strict";

/*
 * Usage:
 *      node tools/update-tests.js
 *
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { find, cat } from "shelljs";
import { parse } from "../espree";
import { getRaw } from "../tests/lib/tester";
import { resolve, dirname } from "path";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function getExpectedResult(code, config) {
    try {
        return getRaw(parse(code, config));
    } catch (ex) {
        var raw = getRaw(ex);
        raw.message = ex.message;
        return raw;
    }
}

function getTestFilenames(directory) {
    return find(directory).filter(function(filename) {
        return filename.indexOf(".src.js") > -1;
    }).map(function(filename) {
        return filename.substring(directory.length - 1, filename.length - 7);  // strip off ".src.js"
    });
}

function getLibraryFilenames(directory) {
    return find(directory).filter(function(filename) {
        return filename.indexOf(".js") > -1 && filename.indexOf(".result.js") === -1;
    }).map(function(filename) {
        return filename.substring(directory.length - 1);  // strip off directory
    });
}

function outputResult(result, testResultFilename) {
    ("module.exports = " + JSON.stringify(result, null, "    ") + ";").to(testResultFilename);
}

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

var FIXTURES_DIR = "./tests/fixtures/ecma-features",
    FIXTURES_VERSION_DIR = "./tests/fixtures/ecma-version",
    LIBRARIES_DIR = "./tests/fixtures/libraries";

var testFiles = getTestFilenames(FIXTURES_DIR),
    versionFiles = getTestFilenames(FIXTURES_VERSION_DIR),
    libraryFiles = getLibraryFilenames(LIBRARIES_DIR);

libraryFiles.forEach(function(filename) {
    var testResultFilename = resolve(__dirname, "..", LIBRARIES_DIR, filename) + ".result.json",
        code = cat(resolve(LIBRARIES_DIR, filename)),
        result = getExpectedResult(code, {
            loc: true,
            range: true,
            tokens: true
        });
    JSON.stringify(result).to(testResultFilename);
    result = null;
});

// update all tests in ecma-features
testFiles.forEach(function(filename) {

    var feature = dirname(filename),
        code = cat(resolve(FIXTURES_DIR, filename) + ".src.js"),
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaVersion: 6,
            ecmaFeatures: {}
        };

    config.ecmaFeatures[feature] = true;
    var testResultFilename = resolve(__dirname, "..", FIXTURES_DIR, filename) + ".result.js";
    var result = getExpectedResult(code, config);

    outputResult(result, testResultFilename);
});

versionFiles.forEach(function(filename) {

    var version = Number(filename.substring(0, filename.indexOf("/"))),
        code = cat(resolve(FIXTURES_VERSION_DIR, filename) + ".src.js"),
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaVersion: version
        };

    var testResultFilename = resolve(__dirname, "..", FIXTURES_VERSION_DIR, filename) + ".result.js",
        result = getExpectedResult(code, config);

    outputResult(result, testResultFilename);
});
