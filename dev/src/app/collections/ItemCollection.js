
LSCP.Collection.ItemCollection = Backbone.Collection.extend({
	
	model : LSCP.Model.Item,
	url : "/data/items.json",
	
	initialize : function() {
		
	},

	parse : function(data){
		return data.items;
	}
	
});