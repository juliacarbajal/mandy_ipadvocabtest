LSCP.Model.Action = Backbone.AssociatedModel.extend({

    defaults: {
        at: null
    },

	initialize: function(){
        this.set({
            at: new Date()
        });

    }

});