/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('child_process').spawn,
    byline = require('byline');

module.exports = function (grunt) {
  grunt.registerMultiTask('steroids_device', 'Run the current build on a device', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      steroidsPath: __dirname + '/../node_modules/steroids/bin/'
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

    grunt.log.writeln('Starting steroids...');
    var steroids = spawn(options.steroidsPath + 'steroids', ['connect', '--terminal-qrcode'], {
      cwd: options.buildFolder + 'steroids'
    });

    var running = false;
    byline(steroids.stdout).on('data', function (data) {
      if (data && data.toString().length > 100)  {
        grunt.log.writeln(data.toString());
      }
      if (data && data.toString().indexOf('Hit [enter]') > -1 && !running) {
        running = true;

        grunt.log.writeln('\n\n... Waiting for user to scan QR code ...');
      }
      if (data && data.toString().indexOf('Number of clients connected') > 0 && running) {
        setTimeout(function () {
          steroids.stdin.write('exit');
          steroids.kill('SIGKILL');
          done();
        }, 2000);
      }
    });

    setTimeout(function () {
      grunt.log.writeln('User is taking to long... Killing it.');
      steroids.kill('SIGKILL');
      done();
    }, 90000);
  });
};
