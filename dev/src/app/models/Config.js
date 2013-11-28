
LSCP.Model.Config = Backbone.Model.extend({
	
	defaults: {
		id : 0,
		title : "",
		version : ""
	},
	
	initialize: function(){
	},

	parse : function(data){
		this.id = data.id;
		this.title = data.title;
		this.version = data.version;

		return this;
	}
	
});