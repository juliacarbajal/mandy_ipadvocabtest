LSCP.Model.Game = Backbone.Model.extend({
	
	initialize: function(){
        this.set({
            name: 'Word and sentence comprehension',
            type: 'WordComprehensionGame',
            difficulty: {
                stages: 10,
                trunks: 4
            },
            settings: {
                timeout_no_answer: 5, // seconds
                timeout_end_on_idle: 20 // seconds
            }
        });

        log('LSCP.Model.Game initialized!', JSON.stringify(this));
	}

});