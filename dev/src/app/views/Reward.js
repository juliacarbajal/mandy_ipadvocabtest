
LSCP.View.Reward = Backbone.View.extend({

    id: 'reward',
    images: [],

    initialize: function() {
        log('LSCP.View.Reward initialized!');

        for (var i = 0; i < 9; i++) {
            this.images.push(LSCP.Locations.Images + "rewards/" + i + ".jpg");
        }

        this.hide();
    },

    template: Handlebars.compile('<img src="{{image}}" />'),

	render: function() {
        log('LSCP.View.Reward.render');
        var url = this.images[_.random(0, _.size(this.images) - 1)];
        this.$el.css('background-image', 'url(' + url + ')').hide();
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
        this.trigger('end');
    }

});
