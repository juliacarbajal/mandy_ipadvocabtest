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