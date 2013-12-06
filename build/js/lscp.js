
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
LSCP.SessionController = LSCP.SessionController || {

    current_session: null,
    current_game: null,
    current_game_view: null,

    init: function(){
        log('LSCP.SessionController initialized!');
    },

    startSession: function(){

//        this.current_session = new LSCP.Model.Session({
//            duration: 15 * 60
//        });
//
//        log('startSession', this.current_session.attributes);
//
//        this.current_game = this.current_session.games.shift();
//
//        switch (this.current_game.get('type')) {
//
//            case 'WordComprehensionGame':
//                this.current_game_view = new LSCP.View.WordComprehensionGame({
//                    model: this.current_game
//                });
//
//        }
//
//        $(this.current_game_view);

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
LSCP.Model.GameSession = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            started_at: new Date()
        });

        this.levels = new LSCP.Collection.LevelCollection([]);
    }

});
LSCP.Model.Level = Backbone.Model.extend({
	
	initialize: function(){
        this.stages = new LSCP.Collection.StageCollection([]);
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
LSCP.Model.Stage = Backbone.Model.extend({
	
	initialize: function(){
    }

});
LSCP.Collection.GameCollection = Backbone.Collection.extend({

    model : LSCP.Model.Game,

    initialize : function() {
    }

});
LSCP.Collection.LevelCollection = Backbone.Collection.extend({

    model : LSCP.Model.Level,

    initialize : function() {
    }

});
LSCP.Collection.StageCollection = Backbone.Collection.extend({

    model : LSCP.Model.Stage,

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
        $('#home').hide();
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
    speed: 1,
    layersSize: {},

	initialize: function(){
        log('LSCP.View.Game initialized!');

        this.speed = 3;

        this.layersSize = {
            width: 1024,
            height: 768
        };
	},

    render: function(){
        log('LSCP.View.Game.render');
        this.$el.html('GAME');
        return this;
    },


    // Game cycle

    start: function(){
        log('LSCP.View.Game starts!');
        $('body').addClass('ingame');
    },

    end: function(){
        log('LSCP.View.Game ends!');
        $('body').removeClass('ingame');
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
    },


    // Game assets

    setImages: function(images){
        collie.ImageManager.add(images);
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

        $.getJSON('data/config.json', this.onConfigLoaded.bind(this));
    },

    render: function(){
        return this;
    },

    onConfigLoaded: function(data){
        this.current_session = new LSCP.Model.Session(data);
        this.startSession();
    },

    startSession: function(){

        this.current_game = this.current_session.games.shift();

        switch (this.current_game.get('type')) {

            case 'WordComprehensionGame':
                this.current_game_view = new LSCP.View.WordComprehensionGame({
                    model: this.current_game
                });

        }

        this.$el.append(this.current_game_view.render().el);

        this.current_game_view.start();

    }
});
LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    layers: {},
    objects: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        this.setImages({
            background: LSCP.Locations.Images + "background.jpg",
            character: LSCP.Locations.Images + "character.png",
            trunk: LSCP.Locations.Images + "trunk.png"
        });

        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},

    template: '{{difficulty.trunks}} TRUNKS + CHARACTER',

    render: function(){
        log('LSCP.View.WordComprehensionGame.render');
//        var template = Handlebars.compile(this.template);
//        this.$el.html(template(this.model.attributes));

        // Background

        this.layers.background = new collie.Layer(this.layersSize);
        this.objects.background = new collie.DisplayObject({
            x: "center",
            y: "center",
            backgroundImage: "background",
            height: 908,
            width: 1155,
            opacity: 0
        }).addTo(this.layers.background);


        // Character

        this.layers.character = new collie.Layer(this.layersSize);
        this.objects.character = new collie.DisplayObject({
            x: "center",
            y: 800,
            backgroundImage: "character",
            height: 341,
            width: 250
        }).addTo(this.layers.character);


        // Trunks

        this.layers.trunks = new collie.Layer(this.layersSize);
        this.objects.trunks = [];
        _.times(this.model.attributes.difficulty.trunks, function(){
            this.objects.trunks.push(new collie.DisplayObject({
                backgroundImage: "trunk",
                height: 239,
                width: 160,
                opacity: 0
            }));
        }, this);

        this.objects.trunks[0].set({x: 20, y: 20});
        this.objects.trunks[1].set({x: 844, y: 20});
        this.objects.trunks[2].set({x: 844, y: 509});
        this.objects.trunks[3].set({x: 20, y: 509});

        _.each(this.objects.trunks, function(trunk, i){
            trunk.addTo(this.layers.trunks);
            trunk.attach({
                mousedown: function () {
                    log('You touched trunk #'+i);
                    var currentY = trunk.get('y');
                    collie.Timer.transition(trunk, 400, {
                        to: currentY - 100,
                        set: "y",
                        effect: collie.Effect.wave(2, 0.25)
                    });
                }
            });
        }, this);


        // Rendering

        _.each(this.layers, function(l){
            collie.Renderer.addLayer(l);
        });
        collie.Renderer.load(this.el);
        collie.Renderer.start();

        return this;
    },


    // Game cycle

    start: function(){
        LSCP.View.Game.prototype.start.apply(this, arguments);
        this.onIteration();
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

        collie.Timer.delay(function() {
            collie.Timer.transition(this.objects.character, 1000, {
                to: 200,
                set: "y",
                effect: collie.Effect.easeOutQuint
            });
            this.objects.character_text = new collie.Text({
                x: "center",
                y: 180,
                fontColor: "#FFF",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: 'center',
                width: 250,
                height: 100
            }).text("BRAINS! BRAAAINS!!!").addTo(this.layers.character);
        }.bind(this), 3000 / this.speed);
        collie.Timer.delay(function() {
            collie.Timer.transition(this.objects.background, 1000, {
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
            collie.Timer.transition(this.objects.trunks, 1000, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
        }.bind(this), 6000 / this.speed);
//        this.$character.delay(3000)
//            .queue(function() {
//                $(this).addClass('shown').dequeue();
//            });
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