
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
LSCP.SessionController = LSCP.SessionController || {

    current_session: null,
    current_game: null,
    current_game_view: null,

    init: function(){
        log('LSCP.SessionController initialized!');
    },

    startSession: function(){

        this.current_session = new LSCP.Model.Session({
            duration: 15 * 60
        });

        log('startSession', this.current_session.attributes);

        this.current_game = this.current_session.games.shift();

        switch (this.current_game.get('type')) {

            case 'WordComprehensionGame':
                this.current_game_view = new LSCP.View.WordComprehensionGame({
                    model: this.current_game
                });

        }

        $(this.current_game_view);

    }
};

LSCP.Model.Config = Backbone.Model.extend({
	
	defaults: {
		id : 0,
		title : "",
		version : ""
	},
	
	initialize: function(){
	},

	parse : function(data){
		this.id = data.id;
		this.title = data.title;
		this.version = data.version;

		return this;
	}
	
});

LSCP.Model.Device = Backbone.Model.extend({
	
	defaults: {
        name: "Device",
        uuid: "unavailable",
        os_version: "unavailable",
        device_name: "Device name"
	},
	
	initialize: function(){
        this.name = 'My Device';
        this.uuid = '0123456789';
        this.os_version = 'v7.0';
        this.device_name = 'iPad de Etamin Studio';

        log('LSCP.Model.Device initialized!', JSON.stringify(this));

        this.on('change', function(){
            console.log('LSCP.Model.Device changed');
        });

        // TODO: send it to server if online
        // TODO: retrieve assigned config if online and available
	}

});
LSCP.Model.Game = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            name: 'Word and sentence comprehension',
            type: 'WordComprehensionGame',
            difficulty: {
                stages: 10,
                trunks: 4
            },
            settings: {
                timeout_no_answer: 5, // seconds
                timeout_end_on_idle: 20 // seconds
            }
        });

        log('LSCP.Model.Game initialized!', JSON.stringify(this));
	}

});
LSCP.Model.Session = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            started_at: new Date()
        });

        // TODO: logic to determine which games to play
        var game = new LSCP.Model.Game();
        this.games = new LSCP.Collection.GameCollection([game]);
    }

});
LSCP.Collection.GameCollection = Backbone.Collection.extend({

    model : LSCP.Model.Game,

    initialize : function() {
    }

});

LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');
//        LSCP.View.Session.init();
    },

    events: {
        "click #start-btn": "start"
    },

    start: function(){
//        LSCP.SessionController.render();
        new LSCP.View.Session();
    },

	render : function() {
	}

});

LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	path: "dashboard.html",

//    template: _.template($('#treesListTemplate').html()),

    initialize: function() {
        this.params.config = this.model;
    },

    render: function(){
//        var that = this;
//        LSCP.TemplateManager.get(this.template, function (tmp) {
//            var html = tmp(that.model.toJSON());
//            that.$el.html(html);
//        });
        return this;
    },

    close: function() {
        this.remove();
        this.unbind();
    }
	
});
LSCP.View.Game = Backbone.View.extend({

    id : "game",
	
	initialize: function(){
        log('LSCP.View.Game initialized!');
	},

    render: function(){

    },


    // Game cycle

    start: function(){
        log('LSCP.View.Game starts!');
    },

    end: function(){
        log('LSCP.View.Game ends!');
    },


    // Game iteration management

    onIteration: function(){
    },

    onCorrectAnswer: function(){
    },

    onWrongAnswer: function(){
    },

    onNoAnswer: function(){
    },

    onIdle: function(){
    },


    // Game interaction

    onTouch: function(){
    }


});
LSCP.View.Home = Backbone.View.extend({

	id : "home",
	path : "home.html",
	
	initialize : function() {
	},

    events: {
        'click #dashboard-btn': 'dashboardClicked'
    },

    dashboardClicked: function () {
        log('Open Dashboard');
        return false;
    }
	
});
LSCP.View.Loading = Backbone.View.extend({

	id : "loading",
	path : "loading.html"
	
});
LSCP.View.Session = Backbone.View.extend({

    el: "#session",

    current_session: null,
    current_game: null,
    current_game_view: null,

    initialize: function(){
        log('LSCP.View.Session initialized!');
        this.render();
    },

    render: function(){
        this.$el.html('SESSION');
        return this;
    },

    startSession: function(){

        this.current_session = new LSCP.Model.Session({
            duration: 15 * 60
        });

        log('startSession', this.current_session.attributes);

        this.current_game = this.current_session.games.shift();

        switch (this.current_game.get('type')) {

            case 'WordComprehensionGame':
                this.current_game_view = new LSCP.View.WordComprehensionGame({
                    model: this.current_game
                });

        }

        $(this.current_game_view);

    }
});
LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);
        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},


    // Game cycle

    start: function(){
        LSCP.View.Game.prototype.start.apply(this, arguments);
        /*
        TODO
        - black screen
        - go to first iteration
        */
    },

    end: function(){
        LSCP.View.Game.prototype.end.apply(this, arguments);
        /* TODO
        - save game session
        - send GAME_END to controller
        */
    },


    // Game iteration management

    onIteration: function(){
        LSCP.View.Game.prototype.onIteration.apply(this, arguments);
        /* TODO
        - the character arrives and asks for an object
        - display the background and the objects
        */
    },

    onCorrectAnswer: function(){
        LSCP.View.Game.prototype.onCorrectAnswer.apply(this, arguments);
        /* TODO
        - animate object and character
        - success sound
        - character leaves
        - fade to black
        - next iteration
        */
    },

    onWrongAnswer: function(){
        LSCP.View.Game.prototype.onWrongAnswer.apply(this, arguments);
        /* TODO
         - animate object and character
         - failure sound
         - character leaves
         - fade to black
         - next iteration
         */
    },

    onNoAnswer: function(){
        LSCP.View.Game.prototype.onNoAnswer.apply(this, arguments);
        /* TODO
         - wait 5 seconds
         - character leaves
         - fade to black
         - next iteration
         */
    },

    onIdle: function(){
        LSCP.View.Game.prototype.onIdle.apply(this, arguments);
        /* TODO
         - character talks
         - idle sound
         - after 3 times, end session
         */
    },


    // Game interaction

    onTouch: function(){
        LSCP.View.Game.prototype.onTouch.apply(this, arguments);
        /* TODO */
    }


});