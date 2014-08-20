
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');
//        LSCP.View.Session.init();
    },

    events: {
        "touchstart #btn-start": "start",
        "mousedown #btn-start": "start",
        "touchstart #btn-dashboard": "openDashboard",
        "mousedown #btn-dashboard": "openDashboard"
    },

    start: function(e){
//        LSCP.SessionController.render();
      e.stopPropagation(); e.preventDefault();
      LSCP.Session = null;
      $('#home').hide();
      LSCP.Session = new LSCP.View.Session();
    },

    openDashboard: function(e){
      log('openDashboard');
      e.stopPropagation(); e.preventDefault();
      $('#home').hide();
      this.dashboard = new LSCP.View.Dashboard();
    },

	render : function() {
	}

});
