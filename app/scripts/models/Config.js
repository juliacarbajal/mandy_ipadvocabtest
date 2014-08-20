
LSCP.Model.ConfigPersist = persistence.define('Config', {
  path: 'TEXT',
  current: 'BOOL',
  data: 'JSON'
});
LSCP.Model.ConfigPersist.index(['path'],{unique:true});

LSCP.Model.Config = Backbone.Model.extend({
	
	defaults: {
		path: "",
		current: false,
    data: null
	},
	
	initialize: function(){
	},

  loadDataFromFile: function(){
    var addData = function(e){
      this.set('data', e);
    };

    return $.getJSON(this.get('path')).then(addData.bind(this));
  },

  persistable: function(){
    return new LSCP.Model.ConfigPersist(this.attributes);
  }
	
});