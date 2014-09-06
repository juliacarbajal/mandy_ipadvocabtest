
LSCP.Model.ConfigPersist = persistence.define('Config', {
  name: 'TEXT',
  path: 'TEXT',
  current: 'BOOL',
  data: 'JSON'
});
LSCP.Model.ConfigPersist.index(['path'],{unique:true});


LSCP.Model.Config = Backbone.Model.extend({

  persistableEntity: LSCP.Model.ConfigPersist,

  defaults: {
    name: "",
    path: "",
    current: false,
    data: null
  },

  initialize: function(){
  },

  loadDataFromFile: function(){
    var addData = function(e){
      this.set({
        name: e.name,
        data: e.session
      });
    };

    return $.getJSON(this.get('path')).then(addData.bind(this));
  },

  // TODO move this as a mixin?
  persistable: function(){
    return new this.persistableEntity(this.attributes);
  }

});