LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
      var self = this;

      self.game_objects = new LSCP.Collection.GameObjectCollection();
      self.config_files = new LSCP.Collection.ConfigCollection();
      self.game_sessions = new LSCP.Collection.GameSessionCollection();
      self.subject = new LSCP.Model.Subject();

      $.get(self.template_path, function(template) {
        self.template = _.template(template);

        LSCP.Sync.checkUpdates().done(function(updates){
          self.updates = updates;
          self.render();
        });
        self.syncing = false;

        self.listenTo(self.game_objects, "change", _.throttle(self.render, 250));
        self.listenTo(self.config_files, "change", _.throttle(self.render, 250));
        self.listenTo(self.game_sessions, "change", _.throttle(self.render, 250));
        self.listenTo(self.subject, "change", self.render);

        LSCP.Sync.on("syncing", function(e, data){
          console.log('syncing', data);
          self.syncing = data;
          self.render();
        });
        LSCP.Sync.on("synced", function(){
          console.log('synced');
          self.syncing = false;
          self.render();
        });

        self.render();
      });
    },

    events: {
      "touchstart .close": "close",
      "touchstart #changeConfig": "changeConfig",
      "touchstart #syncUpload": "syncUpload",
      "touchstart #syncDownload": "syncDownload",
      "touchstart .subject button": "changeSubjectId",

      "mousedown .close": "close",
      "mousedown #changeConfig": "changeConfig",
      "mousedown #syncUpload": "syncUpload",
      "mousedown #syncDownload": "syncDownload",
      "mousedown .subject button": "changeSubjectId"
    },

    render: function(){
      var data = {
        current_config_file: this.config_files.getCurrent(),
        config_files: this.config_files,
        current_subject_id: this.subject.get('anonymous_id'),
        total_game_sessions: this.game_sessions.count(),
        game_sessions_to_sync: this.game_sessions.count({synced: false}),
        local_game_objects: this.game_objects.count(),
        updates: this.updates,
        syncing: this.syncing
      };
      console.log('render', data);
      var html = this.template(data);
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
      var new_config = $('.config select[name=config-local]').val();
      console.log("changeConfig", new_config);
      // TODO: this.checkObjectsAvailable();
      this.config_files.setCurrent(new_config);
    },

    changeSubjectId: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_subject_id = $('.subject input[name=subject-id]').val();
      if (new_subject_id === '') return;
      console.log("changeSubjectId", new_subject_id);
      this.subject.set('anonymous_id', new_subject_id);
    },

    syncUpload: function(e){
      e.stopPropagation(); e.preventDefault();
      this.game_sessions.sendToBackend();
    },

    syncDownload: function(e){
      e.stopPropagation(); e.preventDefault();
      var self = this;
      LSCP.Sync.downloadConfig().done(function(){
        self.render();
        // Reload, so the new config is taken into account
//        window.location.reload(false);
      });
    }

});