
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

LSCP.Controller = function() {

	var
		eventHandlers = [],

		currentView = null,

		loadingView = null,
		homeView = null,
		
		/*
		 * init
		 * @private
		 */
		init = function() {

			_initEventHandlers();
			_initNav();
		},

		/*
		 * init event handler
		 * @private
		 */
		_initEventHandlers = function() {

			_.each( LSCP.Events, function(customEvent) {
				eventHandlers[customEvent] = _show;
			});
			
			LSCP.EventManager.bind(eventHandlers);
		},
		
		/*
		 * init navigation links
		 * @private
		 */
		_initNav = function() {

			$("body").delegate('a[rel=nav], nav a:not(.external)', "click", function(e){
				e.preventDefault();
				LSCP.AppRouter.navigate($(this).attr("href"), true);
			});
		},
		
		/*
		 * display Page
		 * @private
		 */
		displayPage = function ( callbackEvent, slug, hideFirst ) {

			if ( currentView && hideFirst ) {
				
				currentView.hide( function() {
					displayPage(callbackEvent, slug, false);
				});

			} else {

				LSCP.EventManager.trigger( LSCP.Events.APP_LOADING );
				LSCP.DataManager.check( callbackEvent, slug );
			}
		},

		/*
		 * show the page
		 * @private
		 */
		_show = function ( e /*, slug*/ ) {

			var view;
			
			switch ( e.type ) {
				
				case LSCP.Events.APP_LOADING :
					if ( !loadingView ) loadingView = new LSCP.View.Loading();
					view = loadingView;
				break;
				
				case LSCP.Events.SHOW_HOME :
					if ( !homeView ) {
						homeView = new LSCP.View.Home({
							items : LSCP.Data.Item
						});
					}
					view = homeView;
				break;

			}
			
			view.render();
			currentView = view;

		};

	init();
	return {
		displayPage : displayPage
	};
};


LSCP.DataManager = LSCP.DataManager || {

	currentEvent : null,
	currentSlug : null,

	itemsLoaded : false,

	check : function ( e, slug ) {

		var self = this;
		self.currentEvent = e;
		self.currentSlug = slug;

		switch ( self.currentEvent ) {
			
			case LSCP.Events.SHOW_HOME :

				if ( !self.itemsLoaded ) {
					self.getItems();
				} else {
					LSCP.EventManager.trigger( self.currentEvent, self.currentSlug );
				}
			break;

		}
	},

	getItems : function ( ) {

		var self = this;
		LSCP.Data.Item = new LSCP.Collection.ItemCollection();
		LSCP.Data.Item.fetch({
			success : function() {
				self.itemsLoaded = true;
				self.check( self.currentEvent, self.currentSlug );
			}
		});
	}
};


// From http://jsondata.tumblr.com/post/30043887057/backbone-5

LSCP.TemplateManager = LSCP.TemplateManager || {

    templates : {},
    get : function (id, path, callback) {

        if (this.templates[id]) {
            return callback(this.templates[id]);
        }

        var 
            url = LSCP.Locations.Templates + path,
            promise = $.trafficCop(url),
            that = this;

        promise.done(function (template) {
            
            var tmp = _.template(template);
            that.templates[id] = tmp;
            callback(tmp);
        });
    }
};

LSCP.Router = Backbone.Router.extend({
	
	/*
	 * controller
	 * @private
	 */
	controller : null,

	/*
	 * initialize
	 * @private
	 */
	initialize : function() {

		this.controller = new LSCP.Controller();
	},

	/*
	 * routes
	 */
	routes : {
		"*actions" : "_defaultAction"
	},
	
	/*
	 * defaultAction
	 * @private
	 */
	_defaultAction : function () {
		this.controller.displayPage( LSCP.Events.SHOW_HOME, true );
	}

});


LSCP.Model.Item = Backbone.Model.extend({
	
	defaults: {
		id : 0,
		title : "",
		slug : ""
	},
	
	initialize: function(){

	},

	parse : function(data){
		
		this.id = data.id;
		this.title = data.title;
		this.slug = data.slug;

		return this;
	}
	
});

LSCP.Collection.ItemCollection = Backbone.Collection.extend({
	
	model : LSCP.Model.Item,
	url : "/data/items.json",
	
	initialize : function() {
		
	},

	parse : function(data){
		return data.items;
	}
	
});

LSCP.View.Base = Backbone.View.extend({

	id : "",
	path : "",
	el : ".main-content",
	tpl : null,
	collection : null,
	slug : "",
	params : {},

	hide : function ( callback ) {

		var $el = $(this.el);
		$el.hide();

		if (callback) {
			callback();
		}
	},
	
	render : function() {

		this.params.models = this.collection ? this.collection.models : null;
		this.params.slug = this.slug;
		
		var self = this;
		LSCP.TemplateManager.get( self.id, self.path, function(tpl) {
			self.tpl = tpl;
			self._display();
		});
	},
	
	_display : function() {

		var self = this;
		
		$("body").attr("class", "").addClass(self.id);
		$(this.el).html( this.tpl(this.params) ).show({
			complete : self._displayComplete
		});
	},

	_displayComplete : function () {
		// TODO Overwrite
	}
});


LSCP.View.Home = LSCP.View.Base.extend({

	id : "home",
	path : "home.html",
	
	initialize : function(data) {
		this.params.items = data.items.models;
	}
	
});

LSCP.View.Loading = LSCP.View.Base.extend({

	id : "loading",
	path : "loading.html"
	
});