LSCP.Collection.ConfigCollection = Backbone.Collection.extend({

    model: LSCP.Model.Config,
    url: LSCP.Locations.Backend + '/sync/config_profiles',
    comparator: 'name',

    initialize : function() {
      this.populateFromDatabase();
    },

    hasCurrent: function() {
      return (typeof this.getCurrent().id !== 'undefined');
    },

    setCurrent: function(c) {
      localStorage['lscp.idevxxi.current_config'] = c;
      this.trigger('change');
    },

    getCurrent: function() {
      var id = localStorage['lscp.idevxxi.current_config'];
      return this.get(id) || new this.model({name: 'non défini'});
    },

    getCurrentConfigContent: function() {
      if (!('lscp.idevxxi.current_config' in localStorage)) {
        throw "Please select a config profile.";
      }
      return JSON.parse(this.getCurrent().get('content'));
    },

    populateFromDatabase: function() {
      console.log('ConfigCollection.populateFromDatabase');
      this.sync('find', new this.model()).then(_.bind(function(e){
        console.log('populateFromDatabase DONE');
        this.add(e);
        this.trigger('change');
        this.trigger('populatedFromDatabase');
      }, this));
    },

    emptyDatabase: function() {
      var deferred = $.Deferred();
      this.sync('delete', this.models).then(_.bind(function(){
        console.log('emptyDatabase DONE');
        deferred.resolve();
      }, this));
      return deferred;
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

    downloadFromBackend: function() {
      console.log('downloadFromBackend', this.size());
      this.emptyDatabase()
          .done(this.populateFromBackend()
              .done(_.bind(function(){
                this.sync('create', this.models).then(function(){
                  console.log('All config profiles saved to DB!');
                });
      }, this)));
    }


});