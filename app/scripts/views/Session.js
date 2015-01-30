LSCP.View.Session = Backbone.View.extend({

    el: "#session",

    config: null,
    game_sessions: null,
    subject: null,
    current_game: null,
    current_game_session: null,
    current_game_view: null,

    initialize: function(){
      console.log('LSCP.View.Session initialized!');

      this.subject = new LSCP.Model.Subject();
      this.game_sessions = new LSCP.Collection.GameSessionCollection();

      this.configs = new LSCP.Collection.ConfigCollection();
      this.configs.loadCurrentConfig(this.onConfigLoaded.bind(this));
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

    var subject = new LSCP.Model.Subject();

    var game_session_data = _.extend(this.config.get("session"), {
      game: this.current_game,
      config: this.configs.getCurrent(),
      subject: subject.get('anonymous_id')
    });
    console.log(game_session_data);
    this.game_sessions.create(game_session_data).then(_.bind(function(gs){
          this.current_game_session = gs;

          this.current_game.set('session', this.current_game_session);

          this.current_game_view = new LSCP.View.WordComprehensionGame({
            model: this.current_game
          });

          this.$el.append(this.current_game_view.render().el);

          this.listenToOnce(this.current_game_view, 'end', this.endSession);

        }, this));

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