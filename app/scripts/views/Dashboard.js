LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
      var self = this;

      self.game_sessions = new LSCP.Collection.GameSessionCollection();
      self.subject = new LSCP.Model.Subject();
      self.game_objects = new LSCP.Collection.GameObjectCollection();
      self.config_profiles = new LSCP.Collection.ConfigCollection();

      $.get(self.template_path, function(template) {
        self.template = _.template(template);

        LSCP.Sync.checkVersion().done(function(new_config){
          self.new_config = new_config;
          self.render();
        });

        self.listenTo(self.game_sessions, "change", _.throttle(self.render, 250));
        self.listenTo(self.subject, "change", self.render);
        self.listenTo(self.config_profiles, "change", _.throttle(self.render, 250));

        self.render();
      });
    },

    events: {
      "touchstart .close": "close",
      "touchstart #changeConfig": "changeConfig",
      "touchstart #syncUpload": "syncUpload",
      "touchstart #syncDownload": "syncDownload",
      "touchstart #changeSubjectId": "changeSubjectId",

      "mousedown .close": "close",
      "mousedown #changeConfig": "changeConfig",
      "mousedown #syncUpload": "syncUpload",
      "mousedown #syncDownload": "syncDownload",
      "mousedown #changeSubjectId": "changeSubjectId"
    },

    render: function(){
      this.data = {
        new_config: this.new_config || false,
        current_config_profile: this.config_profiles.getCurrent(),
        config_profiles: this.config_profiles,
        current_subject_id: this.subject.get('anonymous_id'),
        game_sessions: this.game_sessions,
        game_objects: this.game_objects
      };

      console.log('render', this.data);
      var html = this.template(this.data);
      this.$el.html(html);
      if ($('#'+this.id).length === 0) {$('#app').append(this.$el);}
    },

    close: function(e) {
      e.stopPropagation(); e.preventDefault();
      this.remove();
      this.unbind();
      $('#home').show();
    },

    changeConfig: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_config_profile = $('.config select[name=config-local]').val();
      console.log("changeConfig", new_config_profile);
      this.config_profiles.setCurrent(new_config_profile);
    },

    changeSubjectId: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_subject_id = $('.subject input[name=subject-id]').val();
      if (new_subject_id === '') return;
      console.log("changeSubjectId", new_subject_id);
      this.subject.setAnonymousId(new_subject_id);
    },

    syncUpload: function(e){
      e.stopPropagation(); e.preventDefault();
      this.game_sessions.sendToBackend();
    },

    syncDownload: function(e){
      e.stopPropagation(); e.preventDefault();
      var self = this;
      $('.modal-layer').show();

      LSCP.Sync.on('syncing', function(progress){
        $('.modal progress').attr(progress);
      });

      LSCP.Sync.downloadConfig().done(function(){
        $('.modal-layer').hide();
        self.new_config = false;

        self.game_objects = new LSCP.Collection.GameObjectCollection();
        self.config_profiles = new LSCP.Collection.ConfigCollection();
        self.listenTo(self.config_profiles, "change", _.throttle(self.render, 250));

        self.render();

        // Reload, so the new config is taken into account
//        window.location.reload(false);
      });
    }

});