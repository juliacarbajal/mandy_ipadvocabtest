
LSCP.Controller = function() {

	var
		eventHandlers = [],

		currentView = null,

		loadingView = null,
		homeView = null,
		
		/*
		 * init
		 * @private
		 */
		init = function() {

			_initEventHandlers();
			_initNav();
		},

		/*
		 * init event handler
		 * @private
		 */
		_initEventHandlers = function() {

			_.each( LSCP.Events, function(customEvent) {
				eventHandlers[customEvent] = _show;
			});
			
			LSCP.EventManager.bind(eventHandlers);
		},
		
		/*
		 * init navigation links
		 * @private
		 */
		_initNav = function() {

			$("body").delegate('a[rel=nav], nav a:not(.external)', "click", function(e){
				e.preventDefault();
				LSCP.AppRouter.navigate($(this).attr("href"), true);
			});
		},
		
		/*
		 * display Page
		 * @private
		 */
		displayPage = function ( callbackEvent, slug, hideFirst ) {

			if ( currentView && hideFirst ) {
				
				currentView.hide( function() {
					displayPage(callbackEvent, slug, false);
				});

			} else {

				LSCP.EventManager.trigger( LSCP.Events.APP_LOADING );
				LSCP.DataManager.check( callbackEvent, slug );
			}
		},

		/*
		 * show the page
		 * @private
		 */
		_show = function ( e /*, slug*/ ) {

			var view;
			
			switch ( e.type ) {
				
				case LSCP.Events.APP_LOADING :
					if ( !loadingView ) loadingView = new LSCP.View.Loading();
					view = loadingView;
				break;
				
				case LSCP.Events.SHOW_HOME :
					if ( !homeView ) {
						homeView = new LSCP.View.Home({
							items : LSCP.Data.Item
						});
					}
					view = homeView;
				break;

			}
			
			view.render();
			currentView = view;

		};

	init();
	return {
		displayPage : displayPage
	};
};
