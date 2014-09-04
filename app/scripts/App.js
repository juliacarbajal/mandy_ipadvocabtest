
// Create Namespace
var LSCP = window.LSCP || {};

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
  Backbone.sync = function (method, model, options) {
    var dao = new DAO(model.persist);
    switch (method) {
      case 'read':
        console.log("sync read");
        if (model.id) {
          console.log("sync read one");
          dao.findById(model.id, function(data) {
            options.success(data);
          });
        } else {
          console.log("sync read all");
          return dao.findAll(model);
        }
        break;

      case "create":
        console.log("sync create");
        return dao.create(model);

      case "update":
        console.log("sync update");
        dao.update(model, function (data) {
          options.success(data);
        });
        break;

      case "delete":
        console.log("sync delete");
        dao.delete(model, function () {
          options.success();
        });
        break;
    }
  };

});