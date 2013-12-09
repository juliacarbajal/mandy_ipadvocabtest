LSCP.Model.Game = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            name: 'Word and sentence comprehension',
            type: 'WordComprehensionGame'
        });

        log('LSCP.Model.Game initialized!', JSON.stringify(this));
	}

});