LSCP.Collection.ConfigCollection = Backbone.Collection.extend({

    model: LSCP.Model.Config,
    url: '/temp',

    initialize : function() {
      this.populateFromDatabase();
    },

    setDefault: function() {
      if (!('lscp.idevxxi.current_config' in localStorage)) {
        localStorage['lscp.idevxxi.current_config'] = this.first().get('path');
      }
    },

    use: function(c) {
      localStorage['lscp.idevxxi.current_config'] = c;
      this.trigger('change');
    },

    getCurrent: function() {
      return localStorage['lscp.idevxxi.current_config'];
    },

    populateFromDatabase: function() {
      console.log('populateFromDatabase');
      this.sync('read', new this.model).then(_.bind(function(e){
        console.log('populateFromDatabase DONE');
        this.add(e);
        this.trigger('change');
      }, this));
    },

    populateFromLocalFiles: function() {
      var loadFilesList = $.getJSON('data/config_files_list.json');
      var localFiles = [];

      loadFilesList.then(_.bind(function(data){
        console.log('Loaded config files list: ' + _.size(data.files) + ' files');

        this.reset();

        _.each(data.files, _.bind(function(file){

          var model = this.add({
            path: 'data/' + file,
            current: false
          });

          localFiles.push(model.loadDataFromFile());

        }, this));

        $.when.apply($, localFiles).then(function(){
          console.log('All config files loaded!');
          console.log(this.toJSON());

          this.sync('create', this.models).then(function(){
            console.log('CREATE DONE!');
          });

        }.bind(this));
      }, this));
    },

    loadCurrentConfig: function(callback) {
      if (!('lscp.idevxxi.current_config' in localStorage)) {
        localStorage['lscp.idevxxi.current_config'] = 'data/config/default.json';
      }
      $.getJSON(this.getCurrent(), callback);
    }


});