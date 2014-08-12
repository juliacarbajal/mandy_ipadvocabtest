
LSCP.Model.Config = Backbone.Model.extend({
	
	defaults: {
		path : ""
	},
	
	initialize: function(){
	},

	parse : function(data){
		this.path = data.path;
		return this;
	}
	
});