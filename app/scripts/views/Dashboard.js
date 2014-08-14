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
      "touchstart .config button": "changeConfig",
      "touchstart .sync button": "syncNow",
      "touchstart .subject button": "changeSubjectId",
      "touchstart .log button": "eraseLog",

      "mousedown .close": "close",
      "mousedown .config button": "changeConfig",
      "mousedown .sync button": "syncNow",
      "mousedown .subject button": "changeSubjectId",
      "mousedown .log button": "eraseLog"
    },

    render: function(){
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
      this.addToLog('Config changed for ' + new_config);
      this.config_files.use(new_config);
    },

    changeSubjectId: function(e){
      e.stopPropagation(); e.preventDefault();
      var new_subject_id = $('.subject input[name=subject-id]').val();
      if (new_subject_id === '') return;
      log("changeSubjectId", new_subject_id);
      this.addToLog('Subject ID changed for ' + new_subject_id);
      this.subject.set('anonymous_id', new_subject_id);
    },

    addToLog: function(line){
      log('addToLog', line);
      this.$el.find('#log').prepend(line + "\n");
    },

    eraseLog: function(e){
      e.stopPropagation(); e.preventDefault();
      this.$el.find('#log').empty();
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
              device_name: device.model
          },
          subject: this.subject.get('anonymous_id'),
          sessions: [
              {uuid: 'UUID', data: 'DATA'},
              {uuid: 'UUID', data: 'DATA'}
          ]
      };
      this.addToLog('test uuid: ' + device.uuid);
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