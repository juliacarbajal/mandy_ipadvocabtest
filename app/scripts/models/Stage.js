LSCP.Model.Stage = Backbone.Model.extend({

    defaults: {
      objects: [],
      objects_positions: null,
      time_idle: null,
      ask_for: null
    },
	
	initialize: function(){
    },

  persistable_attributes: function(){
    var attr = _.pick(this.attributes, ['objects', 'objects_positions', 'time_idle', 'ask_for']);
    return attr;
  }

});