
LSCP.Model.Device = Backbone.Model.extend({
	
	defaults: {
        name: "Device",
        uuid: "unavailable",
        os_version: "unavailable",
        device_name: "Device name"
	},
	
	initialize: function(){
        this.name = 'My Device';
        this.uuid = '0123456789';
        this.os_version = 'v7.0';
        this.device_name = 'iPad de Etamin Studio';

        console.log('LSCP.Model.Device initialized!', JSON.stringify(this));

        this.on('change', function(){
            console.log('LSCP.Model.Device changed');
        });

        // TODO: send it to server if online
        // TODO: retrieve assigned config if online and available
	}

});