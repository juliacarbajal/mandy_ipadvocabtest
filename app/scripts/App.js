
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

/*
 * EVENTS
 */
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

});