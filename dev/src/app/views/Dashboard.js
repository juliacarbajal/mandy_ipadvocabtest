LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
        this.config_files = new LSCP.Collection.ConfigCollection();
        $.get(this.template_path, function(template) {
            this.template = template;
            this.render();
        }.bind(this));
    },

    events: {
        "mousedown .close": "close",
        "click .config button": "changeConfig"
    },

    render: function(){
        var html = _.template(this.template, {
            'current_config_file': this.config_files.getCurrent(),
            'config_files': this.config_files.models
        });
        this.$el.html(html);
        if ($('#'+this.id).length === 0) $('#app').append(this.$el);
    },

    close: function() {
        this.remove();
        this.unbind();
        $('#home').show();
    },

    changeConfig: function(){
        var new_config = $('.config select[name=config-local]').val();
        log("changeConfig", new_config);
        localStorage['lscp.idevxxi.current_config'] = new_config;
        this.render();
    }

});