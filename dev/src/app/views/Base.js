
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');
//        LSCP.View.Session.init();
    },

    events: {
        "click #btn-start": "start"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        window.addToHome.close();
        $('#home').hide();
        new LSCP.View.Session();
    },

	render : function() {
	}

});
