LSCP.Collection.GameSessionCollection = Backbone.Collection.extend({

  model: LSCP.Model.GameSession,
  url: LSCP.Locations.Backend + '/sync/update',

  initialize : function() {
    this.populateFromDatabase();
  },

  create: function(data){
    var deferred = $.Deferred();
    var game_session = this.add(data);
    console.log('Creating GameSession...', data, game_session);

    this.sync('create', game_session).then(function(ids){
      console.log('GameSession created!');
      game_session.set('id', _.first(ids));
      deferred.resolve(game_session);
    });

    return deferred;
  },

  populateFromDatabase: function(){
    console.log('GameSessionCollection.populateFromDatabase');
    this.sync('find', new this.model()).then(_.bind(function(data){
      console.log('GameSessionCollection.populateFromDatabase DONE');
      this.add(data);
      this.trigger('change');
      this.trigger('populatedFromDatabase');
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
  },

  sendToBackend: function(){
    console.log('sendToBackend');
    var device = window.device;
    var data = {
      device: {
        uuid: device.uuid,
        os_version: device.version,
        model: device.model
      },
      sessions: this.dump({synced: false})
    };
    $.ajax({
      type: 'POST',
      url: this.url,
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify(data),
      processData: false,
      success: _.bind(function(data){
        console.log('sendToBackend response', data);
        _.each(data.synced, function(uuid){
          var gs = this.get(uuid);
          gs.setAsSynced();
        }, this);
      }, this),
      error: function(jqXHT, textStatus, errorThrown){
        console.log('sendToBackend error!', errorThrown);
      }
    });
  }

//  count: function(){
//    this.sync('count', new this.model()).then(_.bind(function(e){
//      this.persisted_length = e;
//      this.trigger('change');
//    }, this));
//    return this.persisted_length;
//  }

});