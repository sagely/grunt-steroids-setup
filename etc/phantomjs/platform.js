/*
 *
 */

module.exports = {
  id: 'phantomjs',
  cordovaVersion: '1.9.7',

  bootstrap: function() {

    var moduleMapper = require('cordova/modulemapper');
    var channel = require('cordova/channel');

    moduleMapper.clobbers('cordova/exec/proxy', 'cordova.commandProxy');

    channel.onPluginsReady.subscribe(function () {
      channel.onNativeReady.fire();
    });
  }
};
