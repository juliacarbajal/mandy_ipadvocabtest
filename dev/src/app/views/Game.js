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