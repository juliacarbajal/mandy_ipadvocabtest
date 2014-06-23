
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
LSCP.Locations.Sounds = 'audio/';

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
        introduce_objects: true,
        feedback: true,
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

        // Set config default
        log('lscp.idevxxi.current_config in localStorage', ('lscp.idevxxi.current_config' in localStorage), localStorage['lscp.idevxxi.current_config']);
        if (!('lscp.idevxxi.current_config' in localStorage)) {
            localStorage['lscp.idevxxi.current_config'] = 'config/data.json';
        }
        $('.config-current').text(localStorage['lscp.idevxxi.current_config']);

//        LSCP.View.Session.init();
    },

    events: {
        "mousedown #btn-start": "start",
        "mousedown #btn-dashboard": "toggleDashboard",
        "mousedown #dashboard .close": "toggleDashboard",
        "click .config button": "changeConfig"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        LSCP.Session = null;
        window.addToHome.close();
        $('#home').hide();
        LSCP.Session = new LSCP.View.Session();
    },

    toggleDashboard: function(e){
        e.preventDefault();
        $('#home, #dashboard').toggle();
    },

	render : function() {
	},

    changeConfig: function(){
        var new_config = $('.config select[name=config-local]').val();
        log("changeConfig", new_config);
        localStorage['lscp.idevxxi.current_config'] = new_config;
        $('.config-current').text(new_config);
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
    subtitles: false,
    progressbar: null,
    reward: null,
    layersSize: {},
    idleInterval: null,
    idleTimer: 0,
    idleTime: 30, // seconds
    imagesLoaded: false,
    soundsLoaded: false,

	initialize: function(){
        log('LSCP.View.Game initialized!');

        this.game_session = this.model.get("session");

        this.progressbar = new LSCP.View.ProgressBar({model: this.game_session});
        this.reward = new LSCP.View.Reward();
        this.sound = LSCP.SoundManager.initialize();

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

    events: {
        'mousedown': 'onTouch',
        'touchstart': 'onTouch'
    },


    // Game cycle

    start: function(){
        log('LSCP.View.Game starts!');
    },

    end: function(){
        log('LSCP.View.Game ends!');
        setTimeout(function(){
            this.trigger('end');
        }.bind(this), 5000 / this.speed);
    },


    // Game iteration management

    onIteration: function(){},
    onCorrectAnswer: function(){},
    onWrongAnswer: function(){},
    onNoAnswer: function(){},
    onIdle: function(){},


    // Game interaction

    onTouch: function(){
        this.idleTimerReset();
    },


    // Idle time handling

    startWatchingIdle: function(){
        // Increment the idleTime every second
        if (this.idleInterval === null) {
            this.idleTimerReset();
            this.idleInterval = setInterval(this.idleTimerIncrement.bind(this), 1000);
        }
    },
    stopWatchingIdle: function(){
        clearInterval(this.idleInterval);
        this.idleInterval = null;
    },
    idleTimerReset: function(){
        this.idleTimer = 0;
    },
    idleTimerIncrement: function(){
        this.idleTimer = this.idleTimer + 1;
//        log('idleTimerIncrement', this.idleTimer, '(max: '+this.idleTime+')');
        if (this.idleTimer >= this.idleTime) {
            this.stopWatchingIdle();
            this.onIdle();
        }
    },


    // Game assets

    preloadImages: function(images){
        log('LSCP.View.Game is preloading images...');
        collie.ImageManager.add(images, function(){
            this.imagesLoaded = true;
            this.onLoaded();
        }.bind(this));
    },

    preloadSounds: function(sounds){
        log('LSCP.View.Game is preloading sounds...');
        this.sound.addSounds(sounds);
        this.soundsLoaded = true;
        this.onLoaded();
    },

    onLoaded: function(){
        if (this.imagesLoaded && this.soundsLoaded) this.start();
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

LSCP.Mandy = new Object({

    animations: {
        normal: {
            sprite: 'normal.png',
            values: [0],
            loop: 0
        },
        blink: {
            sprite: 'blink.png',
            values: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            loop: 0
        },
        ask: {
            sprite: 'ask.png',
            values: [0,0,0,0,1,0,2,3,4,5,6,6,7,8,8,9,10,10,6,6,8,8,8,11,12,13,14,0,0,0],
            loop: 1
        },
        happy: {
            sprite: 'happy.png',
            values: [0,1,2,3,4,4,4,4,4,5,6,7,8,9,1,10,11,12,12,12,12,12,13,6,7],
            loop: 2
        },
        hello: {
            sprite: 'hello.png',
            values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,10,11,14,15,16,17,18,19,16,17,20,21,22,23,0],
            loop: 1
        },
        sad: {
            sprite: 'sad.png',
            values: [0,1,2,3,4,5,6,6,6,6,6,6,7,8,8,8,8,8,8,8,8,8,8,9,9,9,10,11,12],
            loop: 1
        },
        bored: {
            sprite: 'bored.png',
            values: [0,1,2,3,4,5,6,7,8,7,6,7,9,10,11,12,13,12,11,12,13,12,11,14,15,16,17,18,19,20,21,20,22,23,24,23,25,26,27],
            loop: 1
        },
        idle: {
            sprite: 'idle.png',
            values: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1],
            loop: 1
        }
    },
    visible: false,
    currentAnimation: null,

    initialize: function() {
        log('LSCP.Mandy initialized!');

        _.each(this.animations, function(animation, id){
            var name = (id == 'normal') ? 'character' : 'character-' + id;
            collie.ImageManager.addImage(name, LSCP.Locations.Images + 'character/' + animation.sprite);
        });

    },

    addAnimations: function(parent) {
        var characters = {};

        _.each(this.animations, function(animation, id){
            if (id == 'normal') {
                characters.normal = new collie.DisplayObject({
                    backgroundImage: "character"
                }).addTo(parent);
            } else {
                characters[id] = new collie.DisplayObject({
                    backgroundImage: "character-" + id,
                    height: 400,
                    width: 400,
                    spriteLength: 35,
                    visible: false
                }).addTo(parent);
            }
        });

        return characters;
    },

    getTimers: function(characters){
        var timers = {};

        _.each(this.animations, function(animation, id){
            if (id == 'normal') return;

            timers[id] = collie.Timer.cycle(characters[id], "15fps", {
                loop: animation.loop,
                useAutoStart : false,
                valueSet: animation.values,
                onStart: function(){
                    _.each(characters, function(v){v.set('visible', false);});
                    characters[id].set('visible', true);
                    this.currentAnimation = id;
                }.bind(this),
                onComplete : function () {
                    if (this.currentAnimation != id) {return;}
                    characters[id].set('visible', false);
                    characters.normal.set('visible', true);
                    this.currentAnimation = null;
                }.bind(this)
            });
        });

        return timers;
    }

});

LSCP.View.ProgressBar = Backbone.View.extend({

    id: 'progressbar',

    initialize: function() {
//        log('LSCP.View.ProgressBar initialized!');
        this.render();
//        this.$el.hide();

        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<div class="bar" title="{{progress}}%"></div>'),

	render: function() {
//        log('LSCP.View.ProgressBar.render');
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
    images: [],
    previous_image_id: null,

    initialize: function() {
        log('LSCP.View.Reward initialized!');

        for (var i = 0; i < 9; i++) {
            this.images.push(LSCP.Locations.Images + "rewards/" + i + ".jpg");
        }

        this.hide();
    },

    template: Handlebars.compile('<img src="{{image}}" />'),

	render: function() {
        log('LSCP.View.Reward.render');

        var available_images = this.images.slice();

        if (this.previous_image_id !== null) {
            available_images.splice(this.previous_image_id, 1);
        }

        var id = _.random(0, _.size(available_images) - 1);
        this.$el.css('background-image', 'url(' + available_images[id] + ')').hide();
        this.previous_image_id = id;
        return this;
	},

    show: function() {
        this.render();
        this.$el.show().on('mousedown', this.onClick.bind(this));
        return this;
    },

    hide: function() {
        this.$el.hide().off('mousedown');
        return this;
    },

    onClick: function(){
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
        $.getJSON(localStorage['lscp.idevxxi.current_config'], this.onConfigLoaded.bind(this));
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

        this.listenToOnce(this.current_game_view, 'end', this.endSession);

//        this.current_game_view.start();

    },

    endSession: function(){
        this.config = null;
        this.current_game = null;
        this.current_game_session = null;
        this.current_game_view.remove();
//        this.$el.empty();
//        $('#home').show(); // TODO: temp
        window.location.reload(false);
    }

});

LSCP.SoundManager = new Object({

    sounds: {},
    debug: false,
    randomSpriteRegex: /(\D+)\d+$/,

    initialize: function() {
        this.log('LSCP.SoundManager initialized!');
        _.extend(this, Backbone.Events);
        return this;
    },

    log: function() {
        if (this.debug) log(arguments);
    },

    addSounds: function(sounds) {
        _.each(sounds, this.addSound, this);
        return this;
    },

    addSound: function(sound, name) {
        this.log('LSCP.SoundManager.addSound', sound, name);

        // Add prefix to URLs
        sound.urls = _.map(sound.urls, function(u){ return LSCP.Locations.Sounds + u; });

        this.sounds[name] = new Howl(sound);

        // Manage random sprites
        this.sounds[name].randomSprites = {};
        if (typeof sound.sprite != 'undefined') {
            _.each(sound.sprite, function(sp, id){
                var match = id.match(this.randomSpriteRegex);
                if (match) {
                    var key = match[1]+'*';
                    if (_.has(this.sounds[name].randomSprites, key))
                        this.sounds[name].randomSprites[key]++;
                    else
                        this.sounds[name].randomSprites[key] = 1;
                }
            }, this);
        }

        return this;
    },

    play: function(sound, sprite) {
        this.log('LSCP.SoundManager.play', sound, sprite);

        // Manage random sprites
        if (typeof sprite != 'undefined' && sprite.indexOf('*') != -1) {
            sprite = sprite.replace('*', this.randomFromInterval(1, this.sounds[sound].randomSprites[sprite]));
        }

        this.sounds[sound].play(sprite);
        return this;
    },

    delayedPlay: function(delay, sound, sprite) {
        _.delay(this.play.bind(this), delay, sound, sprite);
    },

    randomFromInterval: function(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

});

LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    current_level: null,
    current_stage: null,
    layers: {},
    objects: {},
    timers: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        log('LSCP.View.WordComprehensionGame initialized!');

        // Preload assets
        var images = [
            ['star',         LSCP.Locations.Images + "star.png"],
            ['slot',         LSCP.Locations.Images + "slot-bg.png"],
            ['slot-correct', LSCP.Locations.Images + "slot-correct-bg.png"],
            ['slot-wrong',   LSCP.Locations.Images + "slot-wrong-bg.png"]
        ];
        var sounds = [
            ['mandy', {
                urls: ['mandy/sprite.mp3'],
                sprite: {
                    intro:    [0, 3700],
                    hello1:   [4000, 800],
                    hello2:   [5000, 700],
                    hello3:   [6000, 800],
                    hello4:   [7000, 1200],
                    hello5:   [9000, 600],
                    right1:   [10000, 1200],
                    right2:   [12000, 1900],
                    right3:   [14000, 1800],
                    right4:   [16000, 1400],
                    right5:   [18000, 1100],
                    right6:   [20000, 1500],
                    wrong1:   [30000, 1500],
                    wrong2:   [32000, 1200],
                    wrong3:   [34000, 2100],
                    wrong4:   [37000, 2100],
                    wrong5:   [40000, 1300],
                    idle1:    [50000, 900],
                    idle2:    [51000, 900],
                    idle3:    [52000, 900],
                    idle4:    [53000, 1600],
                    idle5:    [55000, 2000],
                    idle6:    [57000, 1500],
                    invite1:  [60000, 1300],
                    invite2:  [62000, 1100],
                    invite3:  [64000, 1200],
                    invite4:  [66000, 800],
                    invite5:  [67000, 1200],
                    bye1:     [70000, 1200],
                    bye2:     [72000, 1200],
                    bye3:     [74000, 1200],
                    bye4:     [76000, 1200]
                }
            }],
            ['plop', {urls: ['plop.mp3']}]
        ];

        // Objects
        _.each(this.game_session.get('assets').objects, function(objects, family){
            _.each(objects, function(object){
                images.push(['object_' + object, LSCP.Locations.Images + "objects/" + family + "/" + object + ".png"]);
                sounds.push(['object_' + object, {
                    urls: ['objects/' + family + '/' + object + '-sprite.mp3'],
                    sprite: {
                        ask:   [0, 2000],
                        intro: [3000, 2000]
                    }
                }]);
            });
        });

        // Backgrounds
        _.each(this.game_session.get('assets').backgrounds, function(background){
            images.push(["background_" + background, LSCP.Locations.Images + "backgrounds/" + background + ".jpg"]);
        });

        this.preloadImages(_.object(images));
        images = null;

        this.preloadSounds(_.object(sounds));
        sounds = null;

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
            x: 40,
            y: 40,
            width: this.layersSize.width - 80,
            height: this.layersSize.height - 80
        });


        // Character

        this.layers.character = new collie.Layer(this.layersSize);
        this.objects.overlay = new collie.DisplayObject({
            backgroundColor: '#000',
            height: 768,
            width: 1024,
            opacity: 1
        }).addTo(this.layers.character);
        this.objects.character = new collie.DisplayObject({
            x: "center",
            y: 800,
            height: 400,
            width: 400
        }).addTo(this.layers.character);

        LSCP.Mandy.initialize();
        this.objects.characters = LSCP.Mandy.addAnimations(this.objects.character);
        this.timers.characters = LSCP.Mandy.getTimers(this.objects.characters);


        // HUD

        this.layers.hud = new collie.Layer(this.layersSize);
        this.objects.hud_text = new collie.Text({
            x: "center",
            y: "bottom",
            fontColor: "#000",
            fontSize: 12,
            textAlign: 'center',
            width: this.layersSize.width,
            height: 100,
            visible: false
        }).addTo(this.layers.hud);
        if (this.subtitles) this.objects.subtitles = new collie.Text({
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

        if (this.current_stage > level.get('stages').size() - 1) {
            this.reward.show().on('end', function(){
                this.reward.hide().off('end');
                this.current_level += 1;
                this.current_stage = 0;

                if (this.current_level > this.game_session.get('levels').size() - 1) {
                    this.end();
                } else {
                    this.onIteration();
                }
            }.bind(this));
            return;
        }

        this.onIteration();
    },

    retryStage: function(){

        log("RETRY STAGE: level ", this.current_level, "stage", this.current_stage);

        this.onIteration();
    },

    end: function(){
        LSCP.View.Game.prototype.end.apply(this, arguments);
        collie.Renderer.removeAllLayer();
        collie.Renderer.unload();
        /* TODO
        - save game session
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

        // Set idle time for the current stage
        this.idleTime = stage.get('time_idle');

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
//        var introduce_objects = true;
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
                backgroundImage: 'object_' + object
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
                if (level.get('introduce_objects') === true) {
                    this.introduceObject(this.objects.slots[0], 0);
                }
                else {
                    _.each(this.objects.slots, function(slot, i){
                        setTimeout(function(){
                            collie.Timer.transition(this.objects.slots[i], 1000 / this.speed, {
                                from: 0,
                                to: 1,
                                set: "opacity",
                                effect: collie.Effect.easeOutQuint
                            });
                            if (i === stage.get("objects").length - 1) {
                                setTimeout(this.onObjectsIntroduced.bind(this), 2000 / this.speed);
                            }
                        }.bind(this), 1500 * i / this.speed);
                    }.bind(this));
                }
            }.bind(this), 0)

        ;

    },

    introduceObject: function(slot, i){
        var stage = this.getCurrentStage();

        this.sound.play('object_' + stage.get('objects')[i], 'intro');

        collie.Timer.queue().

            transition(slot, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ This is " + stage.get('objects')[i]);

                this.startWatchingIdle();

                slot.attach({
                        mousedown: function () {
                            this.sound.play('plop');
                            var currentY = slot.get('y');
                            collie.Timer.transition(slot, 400 / this.speed, {
                                to: currentY - 50,
                                set: "y",
                                effect: collie.Effect.wave(2, 0.25)
                            });

                            this.stopWatchingIdle();

                            if (this.subtitles) this.objects.subtitles.set({visible: false});

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

        var level = this.getCurrentLevel();

        // Idle
        this.stopWatchingIdle();

        if (level.get('feedback') === true) {
            // Animation
            this.timers.characters.happy.start();

            // Sound
            this.sound.play('mandy', 'right*');
            if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ BRAVO!");
        }

        // Progress
        var progress = 100 / level.get('stages').length * (this.current_stage+1);
        this.game_session.set({progress: Math.floor(progress)});

        // Display queue

        collie.Timer.queue().

            delay(function(){
                slot.set('backgroundImage', 'slot-correct');
            }.bind(this), 0).

            delay(function(){
                if (this.subtitles) this.objects.subtitles.set({visible: false});
            }.bind(this), 0).

            delay(function(){

                collie.Timer.transition(this.objects.overlay, 800 / this.speed, {
                    from: 0,
                    to: 1,
                    set: "opacity",
                    effect: collie.Effect.easeOutQuint
                });
                collie.Timer.transition(this.objects.character, 1000 / this.speed, {
                    from: 1,
                    to: 0,
                    set: "opacity",
                    effect: collie.Effect.easeOutQuint
                });

            }.bind(this), 3000 / this.speed).

            delay(function(){
                LSCP.Mandy.visible = false;
                this.objects.character.set({
                    opacity: 1,
                    y: 800
                });
                this.layers.slots.removeChildren(this.objects.slots);
                this.nextStage();
            }.bind(this), 2000 / this.speed)

        ;
    },

    onWrongAnswer: function(slot){
        LSCP.View.Game.prototype.onWrongAnswer.apply(this, arguments);

        var level = this.getCurrentLevel();

        // Idle
        this.stopWatchingIdle();

        if (level.get('feedback') === true) {
            // Animation
            this.timers.characters.sad.start();

            // Sound
            this.sound.play('mandy', 'wrong*');
            if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ NO, YOU'RE WRONG");

            // Slot
            slot.set('backgroundImage', 'slot-wrong');
        } else {
            slot.set('backgroundImage', 'slot-correct');
        }

        // Display queue

        collie.Timer.queue().

            delay(function(){
                if (this.subtitles) this.objects.subtitles.set({visible: false});
            }.bind(this), 0).

            delay(function(){

                collie.Timer.transition(this.objects.overlay, 800 / this.speed, {
                    from: 0,
                    to: 1,
                    set: "opacity",
                    effect: collie.Effect.easeOutQuint
                });
                collie.Timer.transition(this.objects.character, 1000 / this.speed, {
                    from: 1,
                    to: 0,
                    set: "opacity",
                    effect: collie.Effect.easeOutQuint
                });

            }.bind(this), 3000 / this.speed).

            delay(function(){
                LSCP.Mandy.visible = false;
                this.objects.character.set({
                    opacity: 1,
                    y: 800
                });
                this.layers.slots.removeChildren(this.objects.slots);

                switch (level.get('on_failure')) {
                    // Handling of different possible behaviors in case of failure

                    case 'REPEAT_STAGE':
                        this.retryStage();
                        break;

                    case 'CONTINUE':
                        // Progress
                        var progress = 100 / level.get('stages').length * (this.current_stage+1);
                        this.game_session.set({progress: Math.floor(progress)});

                        this.nextStage();
                        break;
                }

            }.bind(this), 2000 / this.speed)

        ;
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

        if (LSCP.Mandy.visible) {
            this.sound.play('mandy', 'idle*');
            this.timers.characters.bored.start();
        } else {
            this.sound.play('mandy', 'idle*');
        }

        /* TODO
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
                this.startWatchingIdle();
                LSCP.Mandy.visible = true;
                this.timers.characters.hello.start();
                this.sound.delayedPlay(600, 'mandy', 'hello*');

                this.objects.character.set({backgroundColor: 'rgba(255,255,255,0.1)'})
                    .attach({
                        mousedown: function () {
                            this.objects.character.set({backgroundColor: 'rgba(255,255,255,0)'});
                            this.objects.character.detachAll();

                            this.stopWatchingIdle();
                            this.onTouchCharacter();
                        }.bind(this)
                    });
            }.bind(this), 0)

        ;
    },

    onTouchCharacter: function(){
        this.sound.play('plop');
        var stage = this.getCurrentStage();

        collie.Timer.queue().

            delay(function(){
                this.timers.characters.ask.start();
                this.sound.delayedPlay(500, 'object_' + stage.get('ask_for'), 'ask');
                if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ Where is the " + stage.get('ask_for') + "?");
            }.bind(this), 500 / this.speed).

            delay(function(){
                _.each(this.objects.slots, function(slot, i){
                    slot.attach({
                            mousedown: function () {
                                this.sound.play('plop');
                                this.game_session.saveAction('touch', 'slot#'+i);

                                _.invoke(this.objects.slots, 'detachAll');

                                var currentY = slot.get('y');
                                var slots_to_hide = _.reject(this.objects.slots, function(s){return s === slot;});

                                collie.Timer.queue().

                                    transition(slot, 400 / this.speed, {
                                        to: currentY - 50,
                                        set: "y",
                                        effect: collie.Effect.wave(2, 0.25)
                                    }).

                                    transition(slots_to_hide, 400 / this.speed, {
                                        from: 1,
                                        to: 0,
                                        set: "opacity"
                                    }).

                                    delay(function(){
                                        if (stage.get("objects")[i] == stage.get("ask_for"))
                                            this.onCorrectAnswer(slot);
                                        else
                                            this.onWrongAnswer(slot);
                                    }.bind(this), 500 / this.speed);

                            }.bind(this)
                        });
                }, this);

                this.startWatchingIdle();
            }.bind(this), 2000 / this.speed).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0.9,
                to: 0,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            })

        ;

    }


});