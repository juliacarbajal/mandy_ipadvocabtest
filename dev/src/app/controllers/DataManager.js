
LSCP.DataManager = LSCP.DataManager || {

	currentEvent : null,
	currentSlug : null,

	itemsLoaded : false,

	check : function ( e, slug ) {

		var self = this;
		self.currentEvent = e;
		self.currentSlug = slug;

		switch ( self.currentEvent ) {
			
			case LSCP.Events.SHOW_HOME :

				if ( !self.itemsLoaded ) {
					self.getItems();
				} else {
					LSCP.EventManager.trigger( self.currentEvent, self.currentSlug );
				}
			break;

		}
	},

	getItems : function ( ) {

		var self = this;
		LSCP.Data.Item = new LSCP.Collection.ItemCollection();
		LSCP.Data.Item.fetch({
			success : function() {
				self.itemsLoaded = true;
				self.check( self.currentEvent, self.currentSlug );
			}
		});
	}
};

