
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
LSCP.Model.Action = Backbone.AssociatedModel.extend({

    defaults: {
        at: null
    },

	initialize: function(){
        this.set({
            at: new Date()
        });

    }

});

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
LSCP.Model.Game = Backbone.AssociatedModel.extend({
	
	initialize: function(){
//        this.set({
//            name: 'Word and sentence comprehension',
//            type: 'WordComprehensionGame'
//        });

        log('LSCP.Model.Game initialized!');
	}

});
LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

    defaults: {
        started_at: null,
        time_limit: null,
        game: null,
        levels: [],
        actions: []
    },

    relations: [
        {
            type: Backbone.One,
            key: 'game',
            relatedModel: 'LSCP.Model.Game'
        },
        {
            type: Backbone.Many,
            key: 'levels',
            collectionType: 'LSCP.Collection.LevelCollection'
        },
        {
            type: Backbone.Many,
            key: 'actions',
            collectionType: 'LSCP.Collection.ActionCollection'
        }
    ],

    initialize: function(){
        log('LSCP.Model.GameSession.initialize');

        this.set({
            started_at: new Date()
        });
    },

    saveAction: function(action, value){

        this.get("actions").add(new LSCP.Model.Action({
            action: action,
            value: value
        }));

    }

    /*
    TODO:
    - handle game session data (config + results)
    - enforce time limit
    - give access to levels and stages
    - give final reward
     */

});
LSCP.Model.Level = Backbone.AssociatedModel.extend({

    defaults: {
        name: "Untitled level",
        background_image: null,
        reward: null,
        on_failure: null,
        stages: []
    },

    relations: [
        {
            type: Backbone.Many,
            key: 'stages',
            collectionType: 'LSCP.Collection.StageCollection'
        }
    ],
	
	initialize: function(){
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

    defaults: {
        objects_family: null,
        objects_order: null,
        objects: [],
        time_idle: null,
        ask_for: null
    },
	
	initialize: function(){
    }

});
LSCP.Collection.ActionCollection = Backbone.Collection.extend({

    model : LSCP.Model.Action,

    initialize : function() {
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
//        log('LSCP.Collection.LevelCollection.initialize PARENTS', this.parents);
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

    onIteration: function(){},
    onCorrectAnswer: function(){},
    onWrongAnswer: function(){},
    onNoAnswer: function(){},
    onIdle: function(){},


    // Game interaction

    onTouch: function(){},


    // Game assets

    preloadImages: function(images){
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

    config: null,
    current_game: null,
    current_game_session: null,
    current_game_view: null,

    initialize: function(){
        log('LSCP.View.Session initialized!');

        $.getJSON('data/config.json', this.onConfigLoaded.bind(this));
    },

    render: function(){
        return this;
    },

    onConfigLoaded: function(data){
        this.config = new LSCP.Model.Session(data);
        this.startSession();
    },

    startSession: function(){

        this.current_game = this.config.games.shift();

        this.current_game_session = new LSCP.Model.GameSession(_.extend(this.config.get("session"), {
            game: this.current_game
        }));

        this.current_game.set('session', this.current_game_session);

        this.current_game_view = new LSCP.View.WordComprehensionGame({
            model: this.current_game
        });

//        switch (this.current_game.get('type')) {
//
//            case 'WordComprehensionGame':
//                this.current_game_view = new LSCP.View.WordComprehensionGame({
//                    model: this.current_game
//                });
//
//        }

        this.$el.append(this.current_game_view.render().el);

        this.current_game_view.start();

    }
});
LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    game_session: null,
    current_level: null,
    current_stage: null,
    layers: {},
    objects: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        log('LSCP.View.WordComprehensionGame initialized!');

        this.game_session = this.model.get("session");

        // Preload assets
        this.preloadImages({
            background: LSCP.Locations.Images + "background.jpg",
            character: LSCP.Locations.Images + "character.png",
            slot: LSCP.Locations.Images + "trunk.png"
        });

        log(this.game_session.get('assets').objects);

        var objects_to_preload = [];
        _.each(this.game_session.get('assets').objects, function(objects, objects_family){
            _.each(objects, function(object){
                objects_to_preload.push([objects_family + "_" + object, LSCP.Locations.Images + "objects/" + objects_family + "/" + object + ".png"]);
            });
        });
        this.preloadImages(_.object(objects_to_preload));

        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},

    template: '',

    render: function(){
        log('LSCP.View.WordComprehensionGame.render');
        log('We start with the following level:', this.game_session.get('levels[0].name'));

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
            height: 350,
            width: 150
        }).addTo(this.layers.character);


        // Object slots

        this.layers.slots = new collie.Layer(this.layersSize);


        // HUD

        this.layers.hud = new collie.Layer(this.layersSize);
        this.objects.hud_text = new collie.Text({
            x: "center",
            y: 10,
            fontColor: "#000",
            fontSize: 12,
            textAlign: 'center',
            width: this.layersSize.width,
            height: 100
        }).addTo(this.layers.hud);
        this.objects.subtitles = new collie.Text({
            x: "center",
            y: this.layersSize.height - 50,
            fontColor: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: 'center',
            width: this.layersSize.width,
            height: 50
        }).addTo(this.layers.hud);


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

        this.current_level = 0;
        this.current_stage = 0;

        this.onIteration();
    },

    nextStage: function(){

        var level = this.game_session.get('levels').at(this.current_level);

        this.current_stage += 1;

        if (this.current_stage > level.get('stages').length - 1) {
            this.current_level += 1;
            this.current_stage = 0;
        }

        if (this.current_level > this.game_session.get('levels').length - 1) {
            this.end();
        }

        log("NEXT STAGE: level ", this.current_level, "stage", this.current_stage);

        this.onIteration();
    },

    retryStage: function(){

        log("RETRY STAGE: level ", this.current_level, "stage", this.current_stage);

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

        log('onIteration', this.current_level, this.current_stage);

        var level = this.game_session.get('levels').at(this.current_level);
        var stage = level.get('stages').at(this.current_stage);

        var show_character = true;
        var prefix_ask_for = "";

        // Object slots

        this.objects.slots = [];

        _.times(stage.get("objects").length, function(n){
            this.objects.slots.push(new collie.DisplayObject({
                backgroundImage: stage.get("objects_family")+"_"+stage.get("objects")[n],
                height: 250,
                width: 250,
                opacity: 0
            }));
        }, this);

        switch (stage.get("objects").length) {
            case 1:
                this.objects.slots[0].set({x: "center", y: "center"});
                show_character = false;
                prefix_ask_for = "This is: ";
                break;

            case 2:
                this.objects.slots[0].set({x: 20, y: "center"});
                this.objects.slots[1].set({x: this.layersSize.width - 270, y: "center"});
                prefix_ask_for = "I want: ";
                break;

            case 4:
                this.objects.slots[0].set({x: 20, y: 20});
                this.objects.slots[1].set({x: this.layersSize.width - 270, y: 20});
                this.objects.slots[2].set({x: this.layersSize.width - 270, y: this.layersSize.height - 270});
                this.objects.slots[3].set({x: 20, y: this.layersSize.height - 270});
                prefix_ask_for = "I want: ";
                break;
        }

        _.each(this.objects.slots, function(slot, i){
            slot.addTo(this.layers.slots);
            slot.attach({
                mousedown: function () {
                    log("You touched: "+stage.get("objects")[i]);
                    this.game_session.saveAction('touch', 'slot#'+i);

                    if (stage.get("objects")[i] == stage.get("ask_for"))
                        this.onCorrectAnswer(slot);
                    else
                        this.onWrongAnswer();
                }.bind(this)
            });
        }, this);


        // HUD

        this.objects.hud_text.text('LEVEL: ' + level.get('name'));

        collie.Timer.delay(function() {
            if (show_character) collie.Timer.transition(this.objects.character, 1000, {
                to: 200,
                set: "y",
                effect: collie.Effect.easeOutQuint
            });
            this.objects.subtitles.text("♫ " + prefix_ask_for + stage.get('ask_for'));
        }.bind(this), 3000 / this.speed);

        collie.Timer.delay(function() {
            collie.Timer.transition(this.objects.background, 1000, {
                to: 0.5,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
            collie.Timer.transition(this.objects.slots, 1000, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
        }.bind(this), 6000 / this.speed);

        /* TODO
        - the character arrives and asks for an object
        - display the background and the objects
        */
    },

    onCorrectAnswer: function(slot){
        LSCP.View.Game.prototype.onCorrectAnswer.apply(this, arguments);

        // Success sound
        this.objects.subtitles.text("♫ BRAVO!");

        // Animate object
        var currentY = slot.get('y');
        collie.Timer.transition(slot, 400, {
            to: currentY - 100,
            set: "y",
            effect: collie.Effect.wave(2, 0.25)
        });

        collie.Timer.delay(function() {
            if (!_.isUndefined(this.objects.slots)) this.layers.slots.removeChildren(this.objects.slots);
            this.nextStage();
        }.bind(this), 6000 / this.speed);

//        $('body').removeClass('ingame');

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

        // Failure sound
        this.objects.subtitles.text("♫ NO, YOU'RE WRONG");

        collie.Timer.delay(function() {
            if (!_.isUndefined(this.objects.slots)) this.layers.slots.removeChildren(this.objects.slots);
            this.retryStage();
        }.bind(this), 6000 / this.speed);

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