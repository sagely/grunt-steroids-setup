/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('child_process').spawn;

module.exports = function (grunt) {
  grunt.registerMultiTask('steroids_simulator', 'Run the current build in the simulator', function () {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      device: 'iphone_retina_4_inch',
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

    grunt.util.spawn({
      cmd: 'osascript',
      args: ['-e', 'tell app "iPhone Simulator" to quit']
    }, function () {
      grunt.log.writeln('Starting steroids...');
      var steroids = spawn(options.steroidsPath + 'steroids', ['connect', '--no-qrcode'], {
        cwd: options.buildFolder + 'steroids'
      });

      var running = false;
      steroids.stdout.on('data', function (data) {
        if (data && data.toString().indexOf('Hit [enter]') > -1 && !running) {
          running = true;

          grunt.log.writeln('Starting simulator...');
          steroids.stdin.write('simulator ' + options.device + '\n');
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
        grunt.log.writeln('Steroids is taking to long... Killing it.');
        steroids.kill('SIGKILL');
        done();
      }, 60000);
    });
  });
};
