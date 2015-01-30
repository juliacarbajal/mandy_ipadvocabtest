LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
      this.config_files = new LSCP.Collection.ConfigCollection();

      this.game_sessions = new LSCP.Collection.GameSessionCollection().populateFromDatabase();

      this.game_objects = new LSCP.Collection.GameObjectCollection().populateFromDatabase();

      this.subject = new LSCP.Model.Subject();

      $.get(this.template_path, function(template) {
        this.template = _.template(template);
        $(document).on("online", this.onOnline);
        $(document).on("offline", this.onOffline);

        this.listenTo(this.config_files, "change", _.throttle(this.render, 250));
        this.listenTo(this.game_sessions, "change", _.throttle(this.render, 250));
        this.listenTo(this.game_objects, "change", _.throttle(this.render, 250));
        this.listenTo(this.subject, "change", this.render);

        this.render();
      }.bind(this));
    },

    events: {
      "touchstart .close": "close",
      "touchstart #changeConfig": "changeConfig",
      "touchstart #downloadConfig": "downloadConfig",
      "touchstart .sync button": "syncNow",
      "touchstart .download_objects button": "downloadObjects",
      "touchstart .subject button": "changeSubjectId",

      "mousedown .close": "close",
      "mousedown #changeConfig": "changeConfig",
      "mousedown #downloadConfig": "downloadConfig",
      "mousedown .sync button": "syncNow",
      "mousedown .download_objects button": "downloadObjects",
      "mousedown .subject button": "changeSubjectId"
    },

    render: function(){
      var data = {
        current_config_file: this.config_files.getCurrent(),
        config_files: this.config_files,
        current_subject_id: this.subject.get('anonymous_id'),
        total_game_sessions: this.game_sessions.count(),
        game_sessions_to_sync: this.game_sessions.count({synced: false}),
        local_game_objects: this.game_objects.count({downloaded: true})
      };
      console.log('render', data);
      var html = this.template(data);
      this.$el.html(html);
      if ($('#'+this.id).length === 0) $('#app').append(this.$el);
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

    downloadConfig: function(e){
      e.stopPropagation(); e.preventDefault();
      this.config_files.downloadFromBackend();
    },

    changeSubjectId: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_subject_id = $('.subject input[name=subject-id]').val();
      if (new_subject_id === '') return;
      console.log("changeSubjectId", new_subject_id);
      this.subject.set('anonymous_id', new_subject_id);
    },

    syncNow: function(e){
      e.stopPropagation(); e.preventDefault();
      this.game_sessions.sendToBackend();
    },

    downloadObjects: function(e){
      e.stopPropagation(); e.preventDefault();
      this.game_objects.downloadAssets();
    },

    onOnline: function(){
      $('#syncNow').show();
    },

    onOffline: function(){
      $('#syncNow').hide();
    }

});