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