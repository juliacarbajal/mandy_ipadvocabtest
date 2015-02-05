var LSCP = window.LSCP || {};
LSCP.randomFromInterval = function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var isInBrowser = document.URL.match(/^https?:/);

if (isInBrowser) {
  // Polyfill for Phonegap Device plugin
  window.device = {
    cordova:  '0.0',
    phonegap: '0.0',
    model:    'MODEL',
    name:     'NAME',
    platform: 'PLATFORM',
    uuid:     'UUID',
    version:  'VERSION'
  };

  // Polyfill for Phonegap File & FileTransfer plugins
  window.cordova = {
    file: {dataDirectory: '//POLYFILL_DATA_DIRECTORY/'}
  };
  if (typeof window.FileTransfer === 'undefined') {
    window.FileTransfer = function(){};
    window.FileTransfer.prototype.download = function(url, path, callback){
      console.log('FileTransfer: downloading ' + url + ' to ' + path);
      callback();
    };
  }
  if (typeof window.resolveLocalFileSystemURL === 'undefined') {
    window.resolveLocalFileSystemURL = function(dataDirectory, callback){
      var fileSystem = {
        nativeURL: '//POLYFILL_NATIVE_URL/'
      };
      callback(fileSystem);
    };
  }
}

// Shuffle array
window.shuffleArray = function(array) {
  for (var i, tmp, n = array.length; n--; i = Math.floor(Math.random() * n), tmp = array[i], array[i] = array[n], array[n] = tmp);
  return array;
}