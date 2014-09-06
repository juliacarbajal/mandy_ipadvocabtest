LSCP.Collection.GameSessionCollection = Backbone.Collection.extend({

  model : LSCP.Model.GameSession,

  initialize : function() {
  },

  create: function(data){
    console.log('Creating GameSession...', data);
    var model = this.add(data);

    this.sync('create', model).then(function(){
      console.log('GameSession created!');
    });

    return model;
  },

  populateFromDatabase: function(){
    this.sync('read', new this.model()).then(_.bind(function(e){
      this.add(e);
      this.trigger('change');
    }, this));
    return this;
  },

  count: function(filter){
    if (typeof filter === 'undefined') {
      return this.length;
    } else {
      return this.where(filter).length;
    }
  },

  dump: function(filter){
    var models;
    if (typeof filter === 'undefined') {
      models = this.models;
    } else {
      models = this.where(filter);
    }
    models = models.map(function(m){
      return {uuid: m.get('id'), data: m.syncable_attributes()};
    });
    return models;
  }

//  count: function(){
//    this.sync('count', new this.model()).then(_.bind(function(e){
//      this.persisted_length = e;
//      this.trigger('change');
//    }, this));
//    return this.persisted_length;
//  }

});