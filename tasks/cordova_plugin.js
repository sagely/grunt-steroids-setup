/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');

module.exports = function (grunt) {
  grunt.registerMultiTask('cordova_plugin', 'Add plugins', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      cordovaPath: __dirname + '/../node_modules/cordova/bin/',
      plugins: []
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

    grunt.log.writeln('Installing Cordova plugins:');
    async.eachSeries(options.plugins, function (pluginID, nextPlugin) {
      if (!grunt.file.exists(options.buildFolder + 'steroids/plugins/' + pluginID)) {
        grunt.log.writeln('  ' + pluginID);
        grunt.util.spawn({
          cmd: options.cordovaPath + 'cordova',
          opts: {
            cwd: options.buildFolder + 'steroids'
          },
          args: ['plugin', 'add', pluginID]
        }, function (error, result, code) {
          if (error) {
            grunt.fail.warn('Cordova plugin install failed: ' + error, code);
            nextPlugin('error');
            return;
          } else {
            nextPlugin();
          }
        });
      } else {
        grunt.log.writeln('  ' + pluginID + ' (skipped)');
        nextPlugin();
      }
    }, function () {
      grunt.log.writeln('Finished installing Cordova plugins');
      done();
    });
  });
};
