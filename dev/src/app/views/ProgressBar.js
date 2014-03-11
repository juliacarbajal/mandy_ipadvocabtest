
LSCP.View.ProgressBar = Backbone.View.extend({

    id: 'progressbar',

    initialize: function() {
        log('LSCP.View.ProgressBar initialized!');
        this.render();
//        this.$el.hide();

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
        return this;
    },

    hide: function() {
        this.$el.hide();
        return this;
    }

});
