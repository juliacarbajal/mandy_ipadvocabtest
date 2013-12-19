
LSCP.View.Reward = Backbone.View.extend({

    id: 'reward',

    initialize: function() {
        log('LSCP.View.Reward initialized!');
        this.render();

//        this.model.bind('change', _.bind(this.render, this));
    },

    template: Handlebars.compile('<h1>REWARD!</h1>(click to continue)'),

	render: function() {
        log('LSCP.View.Reward.render');
        this.$el.html(this.template()).hide();
        return this;
	},

    show: function() {
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
