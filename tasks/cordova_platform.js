/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var plugman = require('plugman'),
    async = require('async');

module.exports = function (grunt) {
  grunt.registerMultiTask('cordova_platform', 'Add platforms', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      cordovaPath: '',
      platforms: []
    });

    // Make sure the paths have a trailing slash
    if (options.buildFolder.substr(-1) !== '/') {
      options.buildFolder += '/';
    }

    if (!grunt.file.exists(options.buildFolder + 'steroids')) {
      grunt.log.writeln('Steroids build directory does not exist');
      done();
      return;
    }

    grunt.log.writeln('Installing Cordova platforms:');
    async.eachSeries(options.platforms, function (platformID, nextPlugin) {
      if (!grunt.file.exists(options.buildFolder + 'steroids/platforms/' + platformID)) {
        grunt.log.writeln('  ' + platformID);
        grunt.util.spawn({
          cmd: options.cordovaPath + 'cordova',
          opts: {
            cwd: options.buildFolder + 'steroids'
          },
          args: ['platform', 'add', platformID]
        }, function (error, result, code) {
          if (error) {
            grunt.fail.warn('Cordova platform install failed: ' + error, code);
            nextPlugin('error');
            return;
          } else {
            nextPlugin();
          }
        });
      } else {
        grunt.log.writeln('  ' + platformID + ' (skipped)');
        nextPlugin();
      }
    }, function () {
      grunt.log.writeln('Finished installing Cordova platforms');
      grunt.file.mkdir(options.buildFolder + 'steroids/etc/www');
      plugman.prepare(options.buildFolder + 'steroids/etc', options.platforms[0], options.buildFolder + 'steroids/plugins');
      done();
    });
  });
};
