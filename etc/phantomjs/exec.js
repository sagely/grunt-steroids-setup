/*
 *
 */

var cordova = require('cordova');
var execProxy = require('cordova/exec/proxy');

module.exports = function (success, fail, service, action, args) {
  if ((service === 'Device') && (action === 'getDeviceInfo')) {
    success({
      platform: 'PhantomJS',
      version: '1.9.7',
      uuid: 'BD905752-CCBB-4C35-BF7D-178E2F7930B8',
      model: ''
    });
  } else if ((service === 'NetworkStatus') && (action === 'getConnectionInfo')) {
    success('wifi');
  } else if (success) {
    success();
  }
};
