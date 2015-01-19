/*global cordova:false */

// Create Namespace
var LSCP = window.LSCP || {};

/* AUTH */
LSCP.Auth = {
  username: 'idevxxi',
  password: 'YuY4TLztg8WycUR9CrcN82n7nwWmxfne',
  dashboard_password: 'abc123'
};
$.ajaxSetup({
  headers: { 'Authorization': "Basic " + btoa(LSCP.Auth.username  + ":" + LSCP.Auth.password) }
});

/* COLLECTIONS */
LSCP.Collection = LSCP.Collection || {};

/* MODELS */
LSCP.Model = LSCP.Model || {};

/* VIEWS */
LSCP.View = LSCP.View || {};

/* DATA */
LSCP.Data = LSCP.Data || {};

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

  LSCP.App = new LSCP.View.Base();
  persistence.store.websql.config(persistence, 'idevxxi', 'Local database for iDevXXI', 25 * 1024 * 1024);
  persistence.schemaSync();

  /* SYNC */
  Backbone.sync = function (method, models, options) {
    var dao = new DAO();
    switch (method) {
      case 'read':
        console.log('sync read');
        if (models.id) {
          console.log('sync read one [TODO] [NOT IMPLEMENTED]');
//          return dao.findById(models.id, function(data) {
//            options.success(data);
//          });
        } else {
          console.log('sync read all');
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

  window.resolveLocalFileSystemURL(cordova.file.dataDirectory, _.bind(function(fileSystem){
    var store = fileSystem.nativeURL;
    LSCP.Locations.GameObjectImages = store + 'game_objects/images/';
    LSCP.Locations.GameObjectSoundSprites = store + 'game_objects/sound_sprites/';
  }, this));
});