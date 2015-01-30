LSCP.Collection.GameObjectCollection = Backbone.Collection.extend({

  model: LSCP.Model.GameObject,
  url: LSCP.Locations.Backend + '/sync/game_objects',

  initialize: function() {

  },

  populateFromDatabase: function() {
    this.sync('find', new this.model()).then(_.bind(function(e){
      this.add(e);
      this.trigger('change');
    }, this));
    return this;
  },

  populateFromBackend: function() {
    var deferred = $.Deferred();
    $.getJSON(this.url).then(_.bind(function(data){
      this.reset();
      this.add(data);
      this.trigger('change');
      deferred.resolve();
    }, this));
    return deferred;
  },

  count: function(filter){
    if (typeof filter === 'undefined') {
      return this.length;
    } else {
      return this.where(filter).length;
    }
  },

  downloadAssets: function() {
    var dowloadedAssets = [];
    this.populateFromBackend().done(_.bind(function(){
      this.each(function(model){
        dowloadedAssets.push(model.downloadAssets());
      });

      $.when.apply($, dowloadedAssets).then(_.bind(function(){
        console.log('All assets files downloaded!');

        this.sync('create', this.models).then(function(){
          console.log('All objects saved to DB!');
        });
      }, this));
    }, this));
  }

});