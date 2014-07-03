/*
 *
 */

var modulemapper = require('cordova/modulemapper');
var channel = require('cordova/channel');

exports.load = function (callback) {

  channel.onPluginsReady.subscribe(function () {
    // Loop through all the plugins and then through their clobbers and merges.
    var moduleList = require("cordova/plugin_list");
    for (var i = 0; i < moduleList.length; i++) {
      var module = moduleList[i];
      if (module.clobbers && module.clobbers.length) {
        for (var j = 0; j < module.clobbers.length; j++) {
          modulemapper.clobbers(module.id, module.clobbers[j]);
        }
      }

      if (module.merges && module.merges.length) {
        for (var k = 0; k < module.merges.length; k++) {
          modulemapper.merges(module.id, module.merges[k]);
        }
      }

      // Finally, if runs is truthy we want to simply require() the module.
      if (module.runs) {
        modulemapper.runs(module.id);
      }
    }
    callback();
  });
};
