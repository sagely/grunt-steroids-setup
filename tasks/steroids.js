/*
 * grunt-steroids-setup
 * https://github.com/juzaun/grunt-steroids-setup
 *
 * Copyright (c) 2014 Justin Zaun
 * Licensed under the MIT license.
 */

'use strict';

var spawn = require('child_process').spawn,
    byline = require('byline'),
    async = require('async');

module.exports = function(grunt) {

  grunt.registerMultiTask('steroids-setup', 'Script the creation of a steroids build', function() {
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


  grunt.registerMultiTask('steroids-simulate', 'Run the current build in the simulator', function() {
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

    if (!grunt.file.exists(options.buildFolder + 'steroids')) {
      grunt.log.writeln('Steroids build directory does not exist');
      done();
      return;
    }

    grunt.util.spawn({
      cmd: 'osascript',
      args: ['-e', 'tell app "iPhone Simulator" to quit']
    }, function () {
      console.log('Starting steroids...');
      var steroids = spawn('steroids', ['connect', '--no-qrcode'], {
        cwd: options.buildFolder + 'steroids'
      });

      var running = false;
      steroids.stdout.on('data', function (data) {
        if (data && data.toString().indexOf('Hit [enter]') > -1 && !running) {
          running = true;

          console.log('Starting simulator...');
          steroids.stdin.write('simulator\n');
        }
        if (data && data.toString().indexOf('Number of clients connected') > 0 && running) {
          setTimeout(function() {
            steroids.stdin.write('exit');
            steroids.kill('SIGKILL');
            done();
          }, 2000);
        }
      });

      setTimeout(function() {
        console.log('Steroids is taking to long... Killing it.');
        steroids.kill('SIGKILL');
        done();
      }, 60000);
    });
  });


  grunt.registerMultiTask('steroids-device', 'Run the current build on a device', function() {
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

    if (!grunt.file.exists(options.buildFolder + 'steroids')) {
      grunt.log.writeln('Steroids build directory does not exist');
      done();
      return;
    }

    console.log('Starting steroids...');
    var steroids = spawn('steroids', ['connect', '--terminal-qrcode'], {
      cwd: options.buildFolder + 'steroids'
    });

    var running = false;
    byline(steroids.stdout).on('data', function (data) {
      if (data && data.toString().length > 100)  {
        console.log(data.toString());
      }
      if (data && data.toString().indexOf('Hit [enter]') > -1 && !running) {
        running = true;

        console.log('\n\n... Waiting for user to scan QR code ...');
      }
      if (data && data.toString().indexOf('Number of clients connected') > 0 && running) {
        setTimeout(function() {
          steroids.stdin.write('exit');
          steroids.kill('SIGKILL');
          done();
        }, 2000);
      }
    });

    setTimeout(function() {
      console.log('User is taking to long... Killing it.');
      steroids.kill('SIGKILL');
      done();
    }, 90000);
  });


  grunt.registerMultiTask('cordova-plugin', 'Add plugins', function() {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      buildFolder: './build',
      cordovaPath: '',
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

    console.log('Installing Cordova plugins:');
    async.eachSeries(options.plugins, function (pluginID, nextPlugin) {
      console.log('  ' + pluginID);
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
    }, function () {
      console.log('Finished installing Cordova plugins');
      done();
    });
  });
};
