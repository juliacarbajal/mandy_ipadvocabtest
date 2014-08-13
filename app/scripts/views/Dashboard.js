LSCP.View.Dashboard = Backbone.View.extend({

	id: "dashboard",
	template_path: "templates/dashboard.html",

    initialize: function() {
        this.config_files = new LSCP.Collection.ConfigCollection();
        $.get(this.template_path, function(template) {
            this.template = template;
            $(document).on("online", this.onOnline);
            $(document).on("offline", this.onOffline);
            this.render();
        }.bind(this));
    },

    events: {
        "mousedown .close": "close",
        "click .config button": "changeConfig",
        "click .sync button": "syncNow",
        "click .log button": "eraseLog"
    },

    render: function(){
        var html = _.template(this.template, {
            'current_config_file': this.config_files.getCurrent(),
            'config_files': this.config_files.models
        });
        this.$el.html(html);
        if ($('#'+this.id).length === 0) $('#app').append(this.$el);
    },

    close: function() {
        this.remove();
        this.unbind();
        $('#home').show();
    },

    changeConfig: function(){
        var new_config = $('.config select[name=config-local]').val();
        log("changeConfig", new_config);
        this.addToLog('Config changed for ' + new_config);
        localStorage['lscp.idevxxi.current_config'] = new_config;
        this.render();
    },

    addToLog: function(line){
        $('#log').append(line);
    },

    eraseLog: function(){
        $('#log').empty();
    },

    syncNow: function(){
        log("syncNow");
        // TODO
        var device = window.device || {uuid: 'UUID', version: 'VERSION', model: 'MODEL'};
        var data = {
            device: {
                uuid: device.uuid,
                os_version: device.version,
                device_name: device.model
            },
            subject: 42,
            sessions: [
                {uuid: 'UUID'},
                {uuid: 'UUID'}
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
            success: function(e){
                log('data has been successfully sent!', e);
            },
            error: function(e){
                log('error during sync!', e);
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