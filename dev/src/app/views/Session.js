LSCP.View.Session = Backbone.View.extend({

    el: "#session",

    config: null,
    current_game: null,
    current_game_session: null,
    current_game_view: null,

    initialize: function(){
        log('LSCP.View.Session initialized!');

        new LSCP.Collection.ConfigCollection().loadCurrentConfig(this.onConfigLoaded.bind(this));
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