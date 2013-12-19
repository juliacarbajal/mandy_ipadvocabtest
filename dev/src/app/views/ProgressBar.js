
LSCP.View.ProgressBar = Backbone.View.extend({

    id: 'progressbar',

    initialize: function() {
        log('LSCP.View.ProgressBar initialized!');
        this.render();

        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<div class="bar" title="{{progress}}%"></div>'),

	render: function() {
        log('LSCP.View.ProgressBar.render');
        this.$el.html(this.template(this.model.attributes))
                .find('.bar').css('width', this.model.get('progress') + '%');
        return this;
	},

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    }

});
