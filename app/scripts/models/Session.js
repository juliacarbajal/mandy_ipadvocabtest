LSCP.Model.Session = Backbone.Model.extend({
	
	initialize: function(){
    this.set({
      started_at: new Date()
    });

    // TODO: logic to determine which games to play
    var game = new LSCP.Model.Game();
    this.games = new LSCP.Collection.GameCollection([game]);
  }

});