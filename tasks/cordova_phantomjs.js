/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
    path = require('path');

module.exports = function (grunt) {
  grunt.registerMultiTask('cordova_phantomjs', 'Generate a cordova file for PhantomJS', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      cordovaPath: __dirname + '/../node_modules/cordova/bin/'
    });

    var outputFolder = path.join(options.buildFolder, 'steroids', 'etc', 'www');
    grunt.file.mkdir(outputFolder);
    var outputFile = path.join(outputFolder, 'cordova.js');

    grunt.log.writeln('Generating cordova.js file');
    var collectFiles = require('cordova-js/tasks/lib/collect-files');
    var copyProps = require('cordova-js/tasks/lib/copy-props');
    var writeModule  = require('cordova-js/tasks/lib/write-module');
    var writeScript  = require('cordova-js/tasks/lib/write-script');

    var modules = collectFiles(path.join(__dirname, '..', 'node_modules', 'cordova-js', 'src', 'common'));
    var scripts = collectFiles(path.join(__dirname, '..', 'node_modules', 'cordova-js', 'src', 'scripts'));
    modules[''] = path.join(__dirname, '..', 'node_modules', 'cordova-js', 'src', 'cordova.js');
    copyProps(modules, collectFiles(path.join(__dirname, '..', 'etc', 'phantomjs')));

    var output = [];

    output.push("// Platform: phantomjs");
    output.push("// 0.0.0");

    // write header
    output.push(';(function() {');
    output.push("var CORDOVA_JS_BUILD_LABEL = '0.0.0';");

    // write initial scripts
    if (!scripts.require) {
      throw new Error("didn't find a script for 'require'");
    }

    writeScript(output, scripts.require, false);

    // write modules
    var moduleIds = Object.keys(modules);
    moduleIds.sort();

    for (var i = 0; i < moduleIds.length; i++) {
      var moduleId = moduleIds[i];
      writeModule(output, modules[moduleId], moduleId, false);
    }

    output.push("window.cordova = require('cordova');");

    // write final scripts
    if (!scripts.bootstrap) {
      throw new Error("didn't find a script for 'bootstrap'");
    }

    writeScript(output, scripts.bootstrap, false);

    // write trailer
    output.push('})();');

    fs.writeFileSync(outputFile, output.join('\n'), 'utf8');
  });
};
