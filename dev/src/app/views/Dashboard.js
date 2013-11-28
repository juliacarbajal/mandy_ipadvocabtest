LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	path: "dashboard.html",

//    template: _.template($('#treesListTemplate').html()),

    initialize: function() {
        this.params.config = this.model;
    },

    render: function(){
//        var that = this;
//        LSCP.TemplateManager.get(this.template, function (tmp) {
//            var html = tmp(that.model.toJSON());
//            that.$el.html(html);
//        });
        return this;
    },

    close: function() {
        this.remove();
        this.unbind();
    }
	
});