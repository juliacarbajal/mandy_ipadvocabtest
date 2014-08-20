LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
      this.config_files = new LSCP.Collection.ConfigCollection();
      this.listenTo(this.config_files, "change", this.render);

      this.subject = new LSCP.Model.Subject();
      this.listenTo(this.subject, "change", this.render);

      $.get(this.template_path, function(template) {
        this.template = template;
        $(document).on("online", this.onOnline);
        $(document).on("offline", this.onOffline);
        this.render();
      }.bind(this));
    },

    events: {
      "touchstart .close": "close",
      "touchstart #changeConfig": "changeConfig",
      "touchstart #syncConfig": "syncConfig",
      "touchstart .sync button": "syncNow",
      "touchstart .subject button": "changeSubjectId",

      "mousedown .close": "close",
      "mousedown #changeConfig": "changeConfig",
      "mousedown #syncConfig": "syncConfig",
      "mousedown .sync button": "syncNow",
      "mousedown .subject button": "changeSubjectId"
    },

    render: function(){
      console.log('LSCP.View.Dashboard.render');
        var html = _.template(this.template, {
          'current_config_file': this.config_files.getCurrent(),
          'config_files': this.config_files.models,
          'current_subject_id': this.subject.get('anonymous_id')
        });
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
      log("changeConfig", new_config);
      this.config_files.use(new_config);
    },

    syncConfig: function(e){
      e.stopPropagation(); e.preventDefault();

      // Load local files in DB
      this.config_files.populateFromLocalFiles();

//      Backbone.sync('read', this.config_files);
    },

    changeSubjectId: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_subject_id = $('.subject input[name=subject-id]').val();
      if (new_subject_id === '') return;
      log("changeSubjectId", new_subject_id);
      this.subject.set('anonymous_id', new_subject_id);
    },

    syncNow: function(e){
      e.stopPropagation(); e.preventDefault();
      log("syncNow");
      // TODO
      var device = window.device;
      var data = {
          device: {
              uuid: device.uuid,
              os_version: device.version,
              model: device.model
          },
          subject: this.subject.get('anonymous_id'),
          sessions: [
              {uuid: 'UUID', data: 'DATA'},
              {uuid: 'UUID', data: 'DATA'}
          ]
      };
      log(data);
      var url = 'http://idevxxi.acristia.org/sync/update';
//        var url = 'http://lscp.dev:3000/sync/update';
      $.ajax({
          type: 'POST',
          url: url,
          dataType: 'json',
          contentType: "application/json",
          data: JSON.stringify(data),
          processData: false,
          success: function(data, textStatus){
              log('data has been successfully sent!', data, textStatus);
          },
          error: function(jqXHT, textStatus, errorThrown){
              log('error during sync!', textStatus, errorThrown);
          }
      });
    },

    onOnline: function(){
      $('#syncNow').show();
    },

    onOffline: function(){
      $('#syncNow').hide();
    }

});