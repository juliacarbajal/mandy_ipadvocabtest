
LSCP.View.Reward = Backbone.View.extend({

    id: 'reward',
    images: [],

    initialize: function() {
        log('LSCP.View.Reward initialized!');

        for (var i = 1; i < 10; i++) {
            this.images.push(LSCP.Locations.Images + "rewards/" + i + ".jpg");
        }

        this.hide();

        log(this.images);
//        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<img src="{{image}}" />'),

	render: function() {
        log('LSCP.View.Reward.render');
        this.$el.css('background-image', 'url(' + this.images[_.random(0, _.size(this.images))] + ')').hide();
        return this;
	},

    show: function() {
        this.render();
        this.$el.show().on('mousedown', this.onClick.bind(this));
        return this;
    },

    hide: function() {
        this.$el.hide().off('mousedown');
        return this;
    },

    onClick: function(){
        log('onClick');
        this.trigger('end');
    }

});
