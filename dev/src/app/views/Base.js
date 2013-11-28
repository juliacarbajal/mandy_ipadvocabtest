
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');
//        LSCP.View.Session.init();
    },

    events: {
        "click #start-btn": "start"
    },

    start: function(){
//        LSCP.SessionController.render();
        $('#home').hide();
        var session = new LSCP.View.Session();
        session.startSession();
    },

	render : function() {
	}

});
