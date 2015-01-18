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
    timeLimitInterval: null,
    imagesLoaded: $.Deferred(),
    soundsLoaded: $.Deferred(),

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
            TOP_LEFT:      {x: 0,        y: 40},
            TOP_RIGHT:     {x: 'right',  y: 40},
            BOTTOM_RIGHT:  {x: 'right',  y: this.layersSize.height - (300 + 40 + 50)},
            BOTTOM_LEFT:   {x: 0,        y: this.layersSize.height - (300 + 40 + 50)}
        };
        this.pos = _.extend({
            FOR_1: [this.pos.CENTER_CENTER],
            FOR_2: [this.pos.CENTER_LEFT, this.pos.CENTER_RIGHT],
            FOR_4: [this.pos.TOP_LEFT, this.pos.TOP_RIGHT, this.pos.BOTTOM_RIGHT, this.pos.BOTTOM_LEFT]
        }, this.pos);

        $.when(this.imagesLoaded, this.soundsLoaded).then(this.start.bind(this));
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
        this.startCheckingTimeLimit();
    },

    end: function(){
        log('LSCP.View.Game ends!');
        this.stopWatchingIdle();
        this.stopCheckingTimeLimit();
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

    onTouch: function(e){
      e.stopPropagation(); e.preventDefault();
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


    // Time limit handling

    startCheckingTimeLimit: function(){
      if (this.timeLimitInterval === null) {
        this.timeLimitInterval = setInterval(this.checkTimeLimit.bind(this), 10000);
      }
    },
    stopCheckingTimeLimit: function(){
      clearInterval(this.timeLimitInterval);
      this.timeLimitInterval = null;
    },
    checkTimeLimit: function(){
      if (this.game_session.isTimeLimitOver()) {
        this.endGracefully();
      }
    },
    endGracefully: function(){
      log('endGracefully');
      this.stopWatchingIdle();

      this.game_session.saveEvent('end_gracefully');

      this.reward.show().on('end', function(){
        this.reward.hide().off('end');
        this.end();
      }.bind(this));
    },


    // Game assets

    preloadImages: function(images){
        log('LSCP.View.Game is preloading images...');
        collie.ImageManager.add(images, function(){
            this.imagesLoaded.resolve();
        }.bind(this));
    },

    preloadSounds: function(sounds){
        log('LSCP.View.Game is preloading sounds...');
        this.sound.addSounds(sounds);
        this.soundsLoaded.resolve();
    }


});