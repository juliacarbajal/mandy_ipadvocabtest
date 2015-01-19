
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
      console.log('LSCP.View.Base initialized!');
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
      console.log('openDashboard');
      e.stopPropagation(); e.preventDefault();
      var password = window.prompt('Tapez le mot de passe administrateur.');
      if (password !== LSCP.Auth.dashboard_password) {return;}
      $('#home').hide();
      this.dashboard = new LSCP.View.Dashboard();
    },

	render : function() {
	}

});
