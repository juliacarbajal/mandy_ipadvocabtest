LSCP.Model.GameSession = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            started_at: new Date()
        });

        this.levels = new LSCP.Collection.LevelCollection([]);
        this.actions = new LSCP.Collection.ActionCollection([]);
    },

    saveAction: function(action, value){

        log('saveAction');

        this.actions.add(new LSCP.Model.Action({
            action: action,
            value: value
        }));

        log('actions:', this.actions);

    }

    /*
    TODO:
    - handle game session data (config + results)
    - enforce time limit
    - give access to levels and stages
    - give final reward
     */

});