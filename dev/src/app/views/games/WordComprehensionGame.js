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