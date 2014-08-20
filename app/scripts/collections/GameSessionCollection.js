LSCP.Collection.GameSessionCollection = Backbone.Collection.extend({

  model : LSCP.Model.GameSession,
//  store: new Backbone.WebSQL(db, 'game_sessions'),

  initialize : function() {
    log('LSCP.Collection.GameSessionCollection.initialize');
  }

});