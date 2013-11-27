
LSCP.Router = Backbone.Router.extend({
	
	/*
	 * controller
	 * @private
	 */
	controller : null,

	/*
	 * initialize
	 * @private
	 */
	initialize : function() {

		this.controller = new LSCP.Controller();
	},

	/*
	 * routes
	 */
	routes : {
		"*actions" : "_defaultAction"
	},
	
	/*
	 * defaultAction
	 * @private
	 */
	_defaultAction : function () {
		this.controller.displayPage( LSCP.Events.SHOW_HOME, true );
	}

});
