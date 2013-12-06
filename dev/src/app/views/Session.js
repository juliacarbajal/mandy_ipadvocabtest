LSCP.View.Session = Backbone.View.extend({

    el: "#session",

    current_session: null,
    current_game: null,
    current_game_view: null,

    initialize: function(){
        log('LSCP.View.Session initialized!');

        $.getJSON('data/config.json', this.onConfigLoaded.bind(this));
    },

    render: function(){
        return this;
    },

    onConfigLoaded: function(data){
        this.current_session = new LSCP.Model.Session(data);
        this.startSession();
    },

    startSession: function(){

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