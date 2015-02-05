/*global cordova:false */
/*global SyncService:false */

// Create Namespace
var LSCP = window.LSCP || {};

/* AUTH */
LSCP.Auth = {
  username: 'idevxxi',
  password: 'YuY4TLztg8WycUR9CrcN82n7nwWmxfne',
  dashboard_password: 'abc123'
};
LSCP.Auth.headers = {
  'Authorization': "Basic " + btoa(LSCP.Auth.username + ":" + LSCP.Auth.password)
};
$.ajaxSetup({
  headers: LSCP.Auth.headers
});

/* COLLECTIONS */
LSCP.Collection = LSCP.Collection || {};

/* MODELS */
LSCP.Model = LSCP.Model || {};

/* VIEWS */
LSCP.View = LSCP.View || {};

/* CONFIG */
LSCP.Config = LSCP.Config || {};

/* LOCATIONS */
LSCP.Locations = LSCP.Locations || {};
LSCP.Locations.Backend = 'http://idevxxi.acristia.org';
LSCP.Locations.Templates = '/templates/';
LSCP.Locations.JSON = '/data/';
LSCP.Locations.Images = 'images/';
LSCP.Locations.Sounds = 'audio/';

/* EVENTS */
LSCP.Events = {
	APP_LOADING : "APP_LOADING"
};


// Wait for both jQuery and Phonegap ready events
// http://stackoverflow.com/a/10046671/1789900

var jqReady = $.Deferred();
var pgReady = $.Deferred();

var isInBrowser = document.URL.match(/^https?:/);

if (isInBrowser) {
  pgReady.resolve();
} else {
  document.addEventListener('deviceready', pgReady.resolve, false);
}

$(document).bind('ready', jqReady.resolve);

$.when(jqReady, pgReady).then(function () {

  // Disable AJAX cache
//  $.ajaxSetup({ cache: false });

  LSCP.App = new LSCP.View.Base();
  persistence.store.websql.config(persistence, 'idevxxi', 'Local database for iDevXXI', 25 * 1024 * 1024);
  persistence.schemaSync();

  /* SYNC */
  LSCP.Sync = new SyncService();

  /* LOCATIONS */
  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem){
    var base = fileSystem.nativeURL;

    LSCP.Locations.Root = base;
    LSCP.Locations.GameObjectImages = base + 'game_objects/images/';
    LSCP.Locations.GameObjectSoundSprites = base + 'game_objects/sound_sprites/';

    LSCP.Sync.loadLocalConfig();
  });

  /* SYNC */
  Backbone.sync = function (method, models, options) {
    var dao = new DAO();
    options = options || {};
    switch (method) {
      case 'find':
        console.log('sync find');
        if ('id' in options) {
          console.log('sync find one');
          return dao.findById(models, options.id);
        } else {
          console.log('sync find all');
          return dao.findAll(models);
        }
        return;

      case 'count':
        console.log('sync count');
        return dao.count(models);

      case 'create':
        console.log('sync create');
        return dao.create(models);

      case 'update':
        console.log('sync update');
        return dao.update(models, options);

      case 'delete':
        console.log('sync delete');
        return dao.delete(models);
    }
  };
});