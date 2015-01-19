LSCP.Collection.LevelCollection = Backbone.Collection.extend({

    model: LSCP.Model.Level,

    initialize: function() {
    },

    dump: function(filter){
      var models;
      if (typeof filter === 'undefined') {
        models = this.models;
      } else {
        models = this.where(filter);
      }
      models = models.map(function(m){
        return m.persistable_attributes();
      });
      return models;
    }

});