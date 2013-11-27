
LSCP.View.Base = Backbone.View.extend({

	id : "",
	path : "",
	el : ".main-content",
	tpl : null,
	collection : null,
	slug : "",
	params : {},

	hide : function ( callback ) {

		var $el = $(this.el);
		$el.hide();

		if (callback) {
			callback();
		}
	},
	
	render : function() {

		this.params.models = this.collection ? this.collection.models : null;
		this.params.slug = this.slug;
		
		var self = this;
		LSCP.TemplateManager.get( self.id, self.path, function(tpl) {
			self.tpl = tpl;
			self._display();
		});
	},
	
	_display : function() {

		var self = this;
		
		$("body").attr("class", "").addClass(self.id);
		$(this.el).html( this.tpl(this.params) ).show({
			complete : self._displayComplete
		});
	},

	_displayComplete : function () {
		// TODO Overwrite
	}
});
