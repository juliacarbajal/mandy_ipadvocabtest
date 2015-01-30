
LSCP.Model.ConfigPersist = persistence.define('Config', {
  name: 'TEXT',
  path: 'TEXT',
  content: 'JSON'
});


LSCP.Model.Config = Backbone.Model.extend({

  persistableEntity: LSCP.Model.ConfigPersist,

  defaults: {
    name: "",
    path: "",
    content: null
  },

  initialize: function(){
  },

  persistable: function(){
    return new this.persistableEntity(this.attributes);
  }

});