LSCP.Model.Level = Backbone.AssociatedModel.extend({

    defaults: {
        name: "Untitled level",
        background_image: null,
        reward: null,
        on_failure: null,
        stages: []
    },

    relations: [
        {
            type: Backbone.Many,
            key: 'stages',
            collectionType: 'LSCP.Collection.StageCollection'
        }
    ],
	
	initialize: function(){
    }

});