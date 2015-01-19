LSCP.View.Home = Backbone.View.extend({

	id : "home",
	path : "home.html",
	
	initialize : function() {
	},

    events: {
        'click #dashboard-btn': 'dashboardClicked'
    },

    dashboardClicked: function () {
        console.log('Open Dashboard');
        return false;
    }
	
});