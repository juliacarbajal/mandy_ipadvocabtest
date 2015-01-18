
LSCP.View.ProgressBar = Backbone.View.extend({

    id: 'progressbar',

    initialize: function() {
        this.render();
        this.model.bind('change:progress', _.bind(this.render, this));
    },

    template: Handlebars.compile('<div class="bar" title="{{progress}}%"></div>'),

	  render: function() {
      var $bar = this.$el.find('.bar');
      if ($bar.length === 0) {
        $bar = this.$el.html(this.template(this.model.attributes)).find('.bar');
      }
      $bar.css('width', this.model.get('progress') + '%');
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
