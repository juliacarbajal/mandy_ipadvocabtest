var SyncService = function(){};

_.extend(SyncService.prototype, Backbone.Events);
_.extend(SyncService.prototype, {

  loadLocalConfig: function(){
    console.log('loadLocalConfig', this.getLocalConfigPath());
    return $.getJSON(this.getLocalConfigPath()).then(function(data){
      console.log('Local config file: ', data);
      LSCP.Config = data;
    }, function(err){
      console.info('loadLocalConfig error: no config');
      this.downloadConfig();
    });
  },

  getLocalConfigPath: function (version){
    if (isInBrowser) {
      // In browser, return backend URL
      console.info('Using live config from backend...');
      return LSCP.Locations.Backend + '/sync/download';
    }

    if (typeof version === 'undefined') {
      if ('lscp.idevxxi.current_subject_id' in localStorage) {
        version = localStorage['lscp.idevxxi.config_version'];
      } else {
        return false;
      }
    }
    return LSCP.Locations.Root + 'config_' + version + '.json';
  },

  downloadConfig: function(){
    var self = this;
    var deferred = $.Deferred();
    var fileSaved = $.Deferred();

    var previousVersion = localStorage['lscp.idevxxi.config_version'];
    var url = LSCP.Locations.Backend + '/sync/download';

    $.getJSON(url).then(function(data){
      console.log('Distant version: ', parseInt(data.version));
      console.log('Local version: ', parseInt(localStorage['lscp.idevxxi.config_version']));
      if (parseInt(data.version) !== parseInt(localStorage['lscp.idevxxi.config_version'])) {

        self.downloadAllObjectsAssets(data.game_objects).done(function(game_objects){
          console.log('downloadAllObjectsAssets', game_objects);
          data.game_objects = game_objects;
          var json_data = JSON.stringify(data);

          // Save config file
          window.resolveLocalFileSystemURL(LSCP.Locations.Root, function(directoryEntry){
            directoryEntry.getFile('config_' + data.version + '.json', {create: true}, function(fileEntry){
              fileEntry.createWriter(function(fileWriter){
                fileWriter.onwrite = function() {
                  // Delete previous file
                  directoryEntry.getFile('config_' + previousVersion + '.json', null, function(prevFileEntry){
                    prevFileEntry.remove(function(){
                      console.log('Previous config version ('+previousVersion+') deleted');
                    });
                  });

                  fileSaved.resolve();
                };
                fileWriter.write(json_data);
              });
            });
          }, function(err){
            console.log(err);
          });
        });

        fileSaved.then(function(){
          console.log('fileSaved');

          // Update config version
          localStorage['lscp.idevxxi.config_version'] = data.version;
          console.log('New local version: ', data.version);

          // Load new config in memory
          LSCP.Config = data;

          deferred.resolve();
        });

      } else {
        console.info('Distant and local version are the same!');
      }
    }, function(err){
      console.error('downloadConfig error', err);
    });

    return deferred;
  },

  downloadAllObjectsAssets: function(objects){
    var self = this;
    var totalObjects = objects.length;
    var downloadedObjects = [];
    var deferred = $.Deferred();

    console.log('downloadAllObjectsAssets', totalObjects);
    self.trigger('syncing', {max: totalObjects});

    _.each(objects, function(object){
      self.downloadSingleObjectAssets(object).done(function(downloadedObject){
        downloadedObjects.push(downloadedObject);
        self.trigger('syncing', {value: downloadedObjects.length});
        if (downloadedObjects.length === totalObjects) {
          console.log('All assets files downloaded!', downloadedObjects.length);
          deferred.resolve(downloadedObjects);
        }
      });
    });

    return deferred;
  },

  downloadSingleObjectAssets: function(object){
    var deferred = $.Deferred();

    var fileTransfer = new window.FileTransfer();
    var assets = {
      image: {
        url: object.image,
        local_path: LSCP.Locations.GameObjectImages + object.name + '.png',
        downloaded: $.Deferred()
      },
      sound_sprite: {
        url: object.sound_sprite,
        local_path: LSCP.Locations.GameObjectSoundSprites + object.name + '.mp3',
        downloaded: $.Deferred()
      }
    };

    $.each(assets, function(asset_type, asset){
      fileTransfer.download(asset.url, asset.local_path, function(){
        console.log(asset_type + ' DOWNLOADED for ' + object.name);
        asset.downloaded.resolve();
      }, function(error){
        console.error('ERROR: ', error);
      });
    });

    $.when(assets.image.downloaded, assets.sound_sprite.downloaded).then(function(){
      console.log('ALL DOWNLOADED for ' + object.name);
      object.image = assets.image.local_path;
      object.sound_sprite = assets.sound_sprite.local_path;
      object.downloaded = true;
      deferred.resolve(object);
    });

    return deferred;
  },

  getJSON: function(){
    return $.getJSON(LSCP.Locations.Backend + '/sync/download');
  },

  checkVersion: function(){
    var self = this;
    var deferred = $.Deferred();
    var new_config;

    self.getJSON().then(function(data){
      console.log('Distant version: ', parseInt(data.version));
      console.log('Local version: ', parseInt(localStorage['lscp.idevxxi.config_version']));
      if (parseInt(data.version) !== parseInt(localStorage['lscp.idevxxi.config_version'])) {
        new_config = {
          version: data.version,
          game_objects: data.game_objects.length,
          config_scenarios: data.config_scenarios.length,
          config_profiles: data.config_profiles.length
        };
      } else {
        console.info('Distant and local version are the same!');
        new_config = false;
      }
      deferred.resolve(new_config);
    });

    return deferred;
  }

});