/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  grunt.registerMultiTask('steroids_create', 'Script the creation of a steroids build', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      steroidsPath: ''
    });

    // Make sure the paths have a trailing slash
    if (options.buildFolder.substr(-1) !== '/') {
      options.buildFolder += '/';
    }
    if (options.steroidsPath.length > 0 && options.steroidsPath.substr(-1) !== '/') {
      options.steroidsPath += '/';
    }

    if (grunt.file.exists(options.buildFolder + 'steroids')) {
      grunt.log.writeln('Steroids build directory exists');
      done();
      return;
    }

    // Create the basic steroids template inside the build folder
    grunt.util.spawn({
      cmd: options.steroidsPath + 'steroids',
      args: ['create', options.buildFolder + 'steroids']
    }, function (error, result, code) {
      if (error) {
        grunt.fail.warn('Steroids create failed: ' + error, code);
        done();
        return;
      } else {

        // Remove the contents of the www folder
        grunt.file.delete(options.buildFolder + 'steroids/www');
        grunt.file.mkdir(options.buildFolder + 'steroids/www');

        done();
      }
    });
  });
};
