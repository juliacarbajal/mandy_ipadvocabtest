LSCP.View.Session = Backbone.View.extend({

  el: "#session",

  config: null,
  game_sessions: null,
  subject: null,
  current_game: null,
  current_game_view: null,

  initialize: function(){
    console.log('LSCP.View.Session initialized!');

    this.subject = new LSCP.Model.Subject();
    this.game_sessions = new LSCP.Collection.GameSessionCollection();

    this.configs = new LSCP.Collection.ConfigCollection();

    console.log(this.configs.hasCurrent());
    if (!this.configs.hasCurrent()) {
      window.alert("Vous devez d'abord sélectionner un fichier de configuration dans le dashboard.");
      this.endSession();
      return;
    }
    this.config = new LSCP.Model.Session(this.configs.getCurrentConfigContent().session);
    this.startSession();
  },

  render: function(){
      return this;
  },

  startSession: function(){

    this.current_game = this.config.games.shift();

    var now = new Date();
    var subject = new LSCP.Model.Subject();

    var game_session_data = _.extend(this.config.attributes, {
      game: this.current_game,
      config: this.configs.getCurrent(),
      subject: subject.get('anonymous_id'),
      started_at: now,
      should_end_at: new Date(now.getTime() + this.config.time_limit*1000)
    });

    this.game_sessions.create(game_session_data).then(_.bind(function(game_session){

      this.current_game.set('session', game_session);

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
    if (this.current_game_view) {this.current_game_view.remove();}
    window.location.reload(false);
  }

});
