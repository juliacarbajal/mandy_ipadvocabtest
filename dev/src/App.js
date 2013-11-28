
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
LSCP.Locations.Images = 'img/';

/*
 * EVENTS
 */
LSCP.Events = {
	APP_LOADING : "APP_LOADING"
};

$(window).ready(function(){

    LSCP.App = new LSCP.View.Base();
//	LSCP.AppRouter = new LSCP.Router();

});