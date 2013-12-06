LSCP.Model.GameSession = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            started_at: new Date()
        });

        this.levels = new LSCP.Collection.LevelCollection([]);
    }

});