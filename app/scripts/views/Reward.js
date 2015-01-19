
LSCP.View.Reward = Backbone.View.extend({

    id: 'reward',
    images: [],
    previous_image_id: null,

    initialize: function() {
        console.log('LSCP.View.Reward initialized!');

        for (var i = 0; i < 9; i++) {
            this.images.push(LSCP.Locations.Images + "rewards/" + i + ".jpg");
        }

        this.hide();
    },

    template: Handlebars.compile('<img src="{{image}}" />'),

	render: function() {
        console.log('LSCP.View.Reward.render');

        var available_images = this.images.slice();

        if (this.previous_image_id !== null) {
            available_images.splice(this.previous_image_id, 1);
        }

        var id = _.random(0, _.size(available_images) - 1);
        this.$el.css('background-image', 'url(' + available_images[id] + ')').hide();
        this.previous_image_id = id;
        return this;
	},

    show: function() {
      this.render();
      this.$el.show().on('touchstart click', this.onClick.bind(this));
      return this;
    },

    hide: function() {
      this.$el.hide().off('touchstart click');
      return this;
    },

    onClick: function(e){
      e.stopPropagation(); e.preventDefault();
      this.trigger('end');
    }

});
