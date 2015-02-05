LSCP.Collection.ConfigCollection = Backbone.Collection.extend({

    model: LSCP.Model.Config,
    url: LSCP.Locations.Backend + '/sync/config_profiles',
    comparator: 'name',

    initialize : function() {
      this.add(LSCP.Config.config_profiles);
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
    }

});