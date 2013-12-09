LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

    defaults: {
        started_at: null,
        time_limit: null,
        game: null,
        levels: [],
        actions: []
    },

    relations: [
        {
            type: Backbone.One,
            key: 'game',
            relatedModel: 'LSCP.Model.Game'
        },
        {
            type: Backbone.Many,
            key: 'levels',
            collectionType: 'LSCP.Collection.LevelCollection'
        },
        {
            type: Backbone.Many,
            key: 'actions',
            collectionType: 'LSCP.Collection.ActionCollection'
        }
    ],

    initialize: function(){
        log('LSCP.Model.GameSession.initialize');

        this.set({
            started_at: new Date()
        });
    },

    saveAction: function(action, value){

        this.get("actions").add(new LSCP.Model.Action({
            action: action,
            value: value
        }));

    }

    /*
    TODO:
    - handle game session data (config + results)
    - enforce time limit
    - give access to levels and stages
    - give final reward
     */

});