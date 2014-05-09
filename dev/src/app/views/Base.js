
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');
//        LSCP.View.Session.init();
    },

    events: {
        "mousedown #btn-start": "start"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        LSCP.Session = null;
        window.addToHome.close();
        $('#home').hide();
        LSCP.Session = new LSCP.View.Session();
    },

	render : function() {
	}

});
