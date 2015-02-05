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
  },

  downloadAssets: function() {
    var dowloadedAssets = [];
    var self = this;
    var deferred = $.Deferred();

    console.log('downloadAssets', self.size(), self.models);

    self.each(function(model){
      dowloadedAssets.push(model.downloadAssets());
    });

    $.when.apply($, dowloadedAssets).then(function(){
      console.log('All assets files downloaded!', self.size(), self.count(), self.models);
      deferred.resolve();
    });

    return deferred;
  }

});