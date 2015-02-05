LSCP.Collection.GameObjectCollection = Backbone.Collection.extend({

  model: LSCP.Model.GameObject,
  url: LSCP.Locations.Backend + '/sync/game_objects',

  initialize: function() {
    this.add(LSCP.Config.game_objects);
  },

  count: function(filter){
    if (typeof filter === 'undefined') {
      return this.size();
    } else {
      return _.size(this.where(filter));
    }
  }

});