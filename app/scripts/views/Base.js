
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');

//        (new LSCP.Collection.ConfigCollection()).setDefault();

//        LSCP.View.Session.init();
    },

    events: {
        "mousedown #btn-start": "start",
        "mousedown #btn-dashboard": "openDashboard"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        LSCP.Session = null;
        $('#home').hide();
        LSCP.Session = new LSCP.View.Session();
    },

    openDashboard: function(e){
        e.preventDefault();
        $('#home').hide();
        this.dashboard = new LSCP.View.Dashboard();
    },

	render : function() {
	}

});
