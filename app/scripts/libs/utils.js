var LSCP = window.LSCP || {};
LSCP.randomFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Polyfills for Phonegap plugins
window.device = window.device || {
  cordova:  '0.0',
  phonegap: '0.0',
  model:    'MODEL',
  name:     'NAME',
  platform: 'PLATFORM',
  uuid:     'UUID',
  version:  'VERSION'
};

// Shuffle array
Array.prototype.shuffle = function () {
  for (var i, tmp, n = this.length; n--; i = Math.floor(Math.random() * n), tmp = this[i], this[i] = this[n], this[n] = tmp);
  return this;
}