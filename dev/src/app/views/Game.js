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
        this.progressbar = new LSCP.View.ProgressBar({
            model: this.game_session
        });
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