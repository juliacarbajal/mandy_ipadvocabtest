LSCP.Model.Level = Backbone.Model.extend({
	
	initialize: function(){
        this.stages = new LSCP.Collection.StageCollection([]);
    }

});