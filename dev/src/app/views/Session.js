LSCP.View.Session = Backbone.View.extend({

    el: "#session",

    current_session: null,
    current_game: null,
    current_game_view: null,

    initialize: function(){
        log('LSCP.View.Session initialized!');
    },

    render: function(){
        return this;
    },

    startSession: function(){

        this.current_session = new LSCP.Model.Session({
            duration: 15 * 60
        });

        log('startSession', this.current_session.attributes);

        this.current_game = this.current_session.games.shift();

        switch (this.current_game.get('type')) {

            case 'WordComprehensionGame':
                this.current_game_view = new LSCP.View.WordComprehensionGame({
                    model: this.current_game
                });

        }

        this.$el.append(this.current_game_view.render().el);

        this.current_game_view.start();

    }
});