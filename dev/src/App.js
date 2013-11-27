
// Create Namespace
var LSCP = window.LSCP || {};

/* EVENT MANAGER */
LSCP.EventManager = LSCP.EventManager || $({});

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

/*
 * EVENTS
 */
LSCP.Events = {
	APP_LOADING : "APP_LOADING",
    SHOW_HOME : "SHOW_HOME"
};

$(window).ready(function(){
	
	LSCP.AppRouter = new LSCP.Router();
	Backbone.history.start({ pushState : true });

});