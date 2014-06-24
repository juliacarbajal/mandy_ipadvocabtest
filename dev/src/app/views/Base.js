
LSCP.View.Base = Backbone.View.extend({

	el: "#app",

    initialize: function() {
        log('LSCP.View.Base initialized!');

        // Set config default
        log('lscp.idevxxi.current_config in localStorage', ('lscp.idevxxi.current_config' in localStorage), localStorage['lscp.idevxxi.current_config']);
        if (!('lscp.idevxxi.current_config' in localStorage)) {
            localStorage['lscp.idevxxi.current_config'] = 'data/config_WithRampUp.json';
        }
        $('.config-current').text(localStorage['lscp.idevxxi.current_config']);

//        LSCP.View.Session.init();
    },

    events: {
        "mousedown #btn-start": "start",
        "mousedown #btn-dashboard": "toggleDashboard",
        "mousedown #dashboard .close": "toggleDashboard",
        "click .config button": "changeConfig"
    },

    start: function(e){
//        LSCP.SessionController.render();
        e.preventDefault();
        LSCP.Session = null;
        window.addToHome.close();
        $('#home').hide();
        LSCP.Session = new LSCP.View.Session();
    },

    toggleDashboard: function(e){
        e.preventDefault();
        $('#home, #dashboard').toggle();
    },

	render : function() {
	},

    changeConfig: function(){
        var new_config = $('.config select[name=config-local]').val();
        log("changeConfig", new_config);
        localStorage['lscp.idevxxi.current_config'] = new_config;
        $('.config-current').text(new_config);
    }

});
