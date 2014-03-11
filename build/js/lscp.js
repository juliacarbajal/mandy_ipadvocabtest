
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
        actions: [],
        progress: 0
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

    validate: function(attributes){
        if(attributes.progress < 0 || attributes.progress > 100){
            return "Invalid progress (should be between 0 and 100)";
        }
    },

    initialize: function(){
        log('LSCP.Model.GameSession.initialize');

        this.on("invalid", function(model, error){
            log('GameSession validation error:', error);
        });
        this.on('change:progress', function(){
            log('New progress:', this.get('progress'));
        });

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
        background: null,
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
//        log('LSCP.Model.Level.initialize');
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
        "mousedown #btn-start": "start"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        window.addToHome.close();
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
    game_session: null,
    speed: 1,
    progressbar: null,
    reward: null,
    layersSize: {},

	initialize: function(){
        log('LSCP.View.Game initialized!');

        this.game_session = this.model.get("session");

        this.speed = 2;

        this.progressbar = new LSCP.View.ProgressBar({model: this.game_session});
        this.reward = new LSCP.View.Reward();

        this.layersSize = {
            width: 1024,
            height: 768
        };

        this.pos = {
            CENTER_CENTER: {x: 'center', y: 'center'},
            CENTER_LEFT:   {x: 0,        y: 'center'},
            CENTER_RIGHT:  {x: 'right',  y: 'center'},
            TOP_LEFT:      {x: 0,        y: 0},
            TOP_RIGHT:     {x: 'right',  y: 0},
            BOTTOM_RIGHT:  {x: 'right',  y: 'bottom'},
            BOTTOM_LEFT:   {x: 0,        y: 'bottom'}
        };
        this.pos = _.extend({
            FOR_1: [this.pos.CENTER_CENTER],
            FOR_2: [this.pos.CENTER_LEFT, this.pos.CENTER_RIGHT],
            FOR_4: [this.pos.TOP_LEFT, this.pos.TOP_RIGHT, this.pos.BOTTOM_RIGHT, this.pos.BOTTOM_LEFT]
        }, this.pos);
	},

    render: function(){
        log('LSCP.View.Game.render');

        this.$el.html('').prepend(this.progressbar.el).append(this.reward.el);

        return this;
    },


    // Game cycle

    start: function(){
        log('LSCP.View.Game starts!');
    },

    end: function(){
        log('LSCP.View.Game ends!');
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
        log('LSCP.View.Game is preloading images...');
        collie.ImageManager.add(images, this.start.bind(this));
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

LSCP.View.ProgressBar = Backbone.View.extend({

    id: 'progressbar',

    initialize: function() {
        log('LSCP.View.ProgressBar initialized!');
        this.render();
//        this.$el.hide();

        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<div class="bar" title="{{progress}}%"></div>'),

	render: function() {
        log('LSCP.View.ProgressBar.render');
        this.$el.html(this.template(this.model.attributes))
                .find('.bar').css('width', this.model.get('progress') + '%');
        return this;
	},

    show: function() {
        this.$el.show();
        return this;
    },

    hide: function() {
        this.$el.hide();
        return this;
    }

});


LSCP.View.Reward = Backbone.View.extend({

    id: 'reward',

    initialize: function() {
        log('LSCP.View.Reward initialized!');
        this.render();

//        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<h1>REWARD!</h1>(click to continue)'),

	render: function() {
        log('LSCP.View.Reward.render');
        this.$el.html(this.template()).hide();
        return this;
	},

    show: function() {
        this.$el.show().on('mousedown', this.onClick.bind(this));
        return this;
    },

    hide: function() {
        this.$el.hide().off('mousedown');
        return this;
    },

    onClick: function(){
        log('onClick');
        this.trigger('end');
    }

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

//        this.current_game_view.start();

    }
});
LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    current_level: null,
    current_stage: null,
    layers: {},
    objects: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        log('LSCP.View.WordComprehensionGame initialized!');

        // Preload assets
        var objects_to_preload = [
            ['character', LSCP.Locations.Images + "character.png"],
            ['slot', LSCP.Locations.Images + "slot-bg.png"],
            ['slot-correct', LSCP.Locations.Images + "slot-correct-bg.png"]
        ];

        // Objects
        _.each(this.game_session.get('assets').objects, function(objects, objects_family){
            _.each(objects, function(object){
                objects_to_preload.push([objects_family + "_" + object, LSCP.Locations.Images + "objects/" + objects_family + "/" + object + ".png"]);
            });
        });

        // Backgrounds
        _.each(this.game_session.get('assets').backgrounds, function(background){
            objects_to_preload.push(["background_" + background, LSCP.Locations.Images + "backgrounds/" + background + ".jpg"]);
        });

        this.preloadImages(_.object(objects_to_preload));

        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},

    getCurrentLevel: function(){
        return this.game_session.get('levels').at(this.current_level);
    },

    getCurrentStage: function(){
        return this.getCurrentLevel().get('stages').at(this.current_stage);
    },

    render: function(){
        LSCP.View.Game.prototype.render.apply(this, arguments);
        log('LSCP.View.WordComprehensionGame.render');


        // Background

        this.layers.background = new collie.Layer(this.layersSize);


        // Object slots

        this.layers.slots = new collie.Layer({
            x: 20,
            y: 20,
            width: this.layersSize.width - 40,
            height: this.layersSize.height - 40
        });


        // Character

        this.layers.character = new collie.Layer(this.layersSize);
        this.objects.overlay = new collie.DisplayObject({
            backgroundColor: '#222',
            height: 768,
            width: 1024,
            opacity: 1
        }).addTo(this.layers.character);
        this.objects.character = new collie.DisplayObject({
            x: "center",
            y: 800,
            backgroundImage: "character",
            height: 400,
            width: 400
        }).addTo(this.layers.character);


        // HUD

        this.layers.hud = new collie.Layer(this.layersSize);
        this.objects.hud_text = new collie.Text({
            x: "center",
            y: 10,
            fontColor: "#000",
            fontSize: 12,
            textAlign: 'center',
            width: this.layersSize.width,
            height: 100,
            visible: false
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
        log('LSCP.View.WordComprehensionGame starts!');

        this.current_level = 0;
        this.current_stage = 0;

        this.onIteration();
    },

    nextStage: function(){

        var level = this.getCurrentLevel();

        this.current_stage += 1;

        if (this.current_stage > level.get('stages').length - 1) {
            this.reward.show().on('end', function(){
                this.reward.hide().off('end');
                this.current_level += 1;
                this.current_stage = 0;
                log("NEXT STAGE: level ", this.current_level, "stage", this.current_stage);
                this.onIteration();
            }.bind(this));
            return;
        }

        if (this.current_level > this.game_session.get('levels').length - 1) {
            this.end();
            return;
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

        var level = this.getCurrentLevel();
        var stage = this.getCurrentStage();

        // Progress
        if (this.current_stage === 0) this.game_session.set({progress: 0});


        // Background
        if (this.objects.background) this.layers.background.removeChild(this.objects.background);
        this.objects.background = new collie.DisplayObject({
            x: "center",
            y: "center",
            backgroundImage: "background_" + level.get('background'),
            height: 768,
            width: 1024,
            opacity: 1
        }).addTo(this.layers.background);


        // Object slots
        this.objects.slots = [];

        // "Tutorial" mode when only one object
        var introduce_objects = true;
//        var show_character = true;
//        if (stage.get("objects").length == 1) {
//            introduce_objects = true;
//            show_character = false;
//        }

        // Override objects positions
        var objects_positions = [];
        if (stage.get("objects_positions") == 'NATURAL') {
            objects_positions = this.pos['FOR_' + stage.get("objects").length];
        } else if (_.isArray(stage.get("objects_positions"))) {
            objects_positions = _.map(stage.get("objects_positions"), function(pos) {
                if (typeof this.pos[pos] == 'undefined') throw 'Wrong value "'+pos+'" for "objects_positions" on level '+this.current_level+' stage '+this.current_stage;
                return this.pos[pos];
            }, this);
        } else {
            throw 'Wrong value for "objects_positions" on level '+this.current_level+' stage '+this.current_stage;
        }

        // Create slots
        _.each(stage.get("objects"), function(object, i){
            var slot = new collie.DisplayObject({
                backgroundImage: "slot",
                opacity: 0
            }).set(objects_positions[i]).addTo(this.layers.slots);
            new collie.DisplayObject({
                backgroundImage: stage.get("objects_family") + "_" + object
            }).addTo(slot).align('center', 'center', slot);
            this.objects.slots.push(slot);
        }, this);


        // HUD

        this.objects.hud_text.text('LEVEL: ' + level.get('name'));


        // Display queue

        collie.Timer.queue().

            delay(function(){
                this.objects.hud_text.set({visible: true});
            }.bind(this), 1000 / this.speed).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 1,
                to: 0,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                if (introduce_objects) {
                    this.introduceObject(this.objects.slots[0], 0);
                }
                else this.onObjectsIntroduced();
            }.bind(this), 0)

        ;

    },

    introduceObject: function(slot, i){
        var stage = this.getCurrentStage();

        collie.Timer.queue().

            transition(slot, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.objects.subtitles.set({visible: true}).text("♫ This is " + stage.get('objects')[i]);

                slot.set({backgroundColor: 'rgba(255,255,255,0.2)'})
                    .attach({
                        mousedown: function () {
                            var currentY = slot.get('y');
                            collie.Timer.transition(slot, 400 / this.speed, {
                                to: currentY - 100,
                                set: "y",
                                effect: collie.Effect.wave(2, 0.25)
                            });

                            this.objects.subtitles.set({visible: false});

                            _.invoke(this.objects.slots, 'set', {backgroundColor: 'rgba(255,255,255,0)'});
                            _.invoke(this.objects.slots, 'detachAll');

                            setTimeout(function(){
                                if (i < stage.get("objects").length - 1) {
                                    i++;
                                    this.introduceObject(this.objects.slots[i], i);
                                } else {
                                    this.onObjectsIntroduced();
                                }
                            }.bind(this), 2000 / this.speed);
                        }.bind(this)
                    });
            }.bind(this), 0)

        ;

    },

    onCorrectAnswer: function(slot){
        LSCP.View.Game.prototype.onCorrectAnswer.apply(this, arguments);

        // Success sound
        this.objects.subtitles.set({visible: true}).text("♫ BRAVO!");

        // Progress
        var level = this.getCurrentLevel();
        var progress = 100 / level.get('stages').length * (this.current_stage+1);
//        log('PROGRESS:', progress, " = 100 / " + level.get('stages').length + "* (" + this.current_stage + "+1)");
        this.game_session.set({progress: Math.floor(progress)});

        // Display queue

        var currentY = slot.get('y');
        slot.set({backgroundImage: 'slot-correct'});
        collie.Timer.queue().

            transition(slot, 400 / this.speed, {
                to: currentY - 100,
                set: "y",
                effect: collie.Effect.wave(2, 0.25)
            }).

            delay(function(){}, 2000 / this.speed).

            delay(function(){
                this.objects.subtitles.set({visible: false});
            }.bind(this), 50 / this.speed).

            transition(this.objects.character, 1000 / this.speed, {
                to: 800,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.layers.slots.removeChildren(this.objects.slots);
                this.nextStage();
            }.bind(this), 2000 / this.speed)

        ;

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
        this.objects.subtitles.set({visible: true}).text("♫ NO, YOU'RE WRONG");


        // Display queue

        collie.Timer.queue().

            delay(function(){}, 2000 / this.speed).

            delay(function(){
                this.objects.subtitles.set({visible: false});
            }.bind(this), 0).

            transition(this.objects.character, 1000 / this.speed, {
                to: 800,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.layers.slots.removeChildren(this.objects.slots);
                this.retryStage();
            }.bind(this), 2000 / this.speed)

        ;

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
    },

    onObjectsIntroduced: function(){

        collie.Timer.queue().

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 0.9,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.character, 1000 / this.speed, {
                to: 200,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.objects.character.set({backgroundColor: 'rgba(255,255,255,0.1)'})
                    .attach({
                        mousedown: function () {
                            this.objects.character.set({backgroundColor: 'rgba(255,255,255,0)'});
                            this.objects.character.detachAll();

                            this.onTouchCharacter();
                        }.bind(this)
                    });
            }.bind(this), 0)

        ;
    },

    onTouchCharacter: function(){
        var stage = this.getCurrentStage();

        collie.Timer.queue().

            delay(function(){
                this.objects.subtitles.set({visible: true}).text("♫ Where is the " + stage.get('ask_for') + "?");
            }.bind(this), 500 / this.speed).

            delay(function(){}.bind(this), 3000 / this.speed).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0.9,
                to: 0,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                _.each(this.objects.slots, function(slot, i){
                    slot.set({backgroundColor: 'rgba(255,255,255,0.2)'})
                        .attach({
                            mousedown: function () {
                                this.game_session.saveAction('touch', 'slot#'+i);

                                _.invoke(this.objects.slots, 'set', {backgroundColor: 'rgba(255,255,255,0)'});
                                _.invoke(this.objects.slots, 'detachAll');

                                if (stage.get("objects")[i] == stage.get("ask_for"))
                                    this.onCorrectAnswer(slot);
                                else
                                    this.onWrongAnswer();
                            }.bind(this)
                        });
                }, this);
            }.bind(this), 0)

        ;

    }


});