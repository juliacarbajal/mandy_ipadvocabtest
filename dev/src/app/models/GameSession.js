LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

    defaults: {
        started_at: null,
        time_limit: null,
        game: null,
        levels: [],
        actions: [],
        progress: 0
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

    validate: function(attributes){
        if(attributes.progress < 0 || attributes.progress > 100){
            return "Invalid progress (should be between 0 and 100)";
        }
    },

    initialize: function(){
        log('LSCP.Model.GameSession.initialize');

        this.on("invalid", function(model, error){
            log('GameSession validation error:', error);
        });
        this.on('change:progress', function(){
            log('New progress:', this.get('progress'));
        });

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