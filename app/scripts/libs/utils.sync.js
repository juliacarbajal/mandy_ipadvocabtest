var SyncService = function(){};

_.extend(SyncService.prototype, Backbone.Events);
_.extend(SyncService.prototype, {

  updates: {},
  syncing: {
    value: 0,
    total: 0
  },

  loadLocalConfig: function(){
    return $.getJSON(this.getLocalConfigPath()).then(function(data){
      console.log(data);
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
      version = localStorage['lscp.idevxxi.config_version'];
    }
    return LSCP.Locations.Root + 'config_' + version + '.json';
  },

  downloadConfig: function(){
    var self = this;
    var deferred = $.Deferred();
    var fileSaved = $.Deferred();

    var fileTransfer = new window.FileTransfer();

    var previousVersion = localStorage['lscp.idevxxi.config_version'];
    var url = LSCP.Locations.Backend + '/sync/download';

    $.getJSON(url).then(function(data){
      console.log('Distant version: ', data.version);
      console.log('Local version: ', localStorage['lscp.idevxxi.config_version']);
      if (data.version !== localStorage['lscp.idevxxi.config_version']) {

        self.downloadAllObjectsAssets(data.game_objects).done(function(game_objects){
          console.log('downloadAllObjectsAssets', game_objects);
          data.game_objects = game_objects;
          var json_data = JSON.stringify(data);

          // Save config file
          console.log(self.getLocalConfigPath(data.version));
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
    var totalObjects = objects.length;
    var downloadedObjects = [];
    var deferred = $.Deferred();

    console.log('downloadAllObjectsAssets', totalObjects);

    _.each(objects, function(object){
      this.downloadSingleObjectAssets(object).done(function(downloadedObject){
        downloadedObjects.push(downloadedObject);
        if (downloadedObjects.length === totalObjects) {
          console.log('All assets files downloaded!', downloadedObjects.length);
          deferred.resolve(downloadedObjects);
        }
      });
    }, this);

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

  checkUpdates: function(){
    var self = this;
    var deferred = $.Deferred();
    var updates;

    self.getJSON().then(function(data){
      updates = {
        game_objects: !self.isUpToDate('game_objects_updated_at', data),
        config_scenarios: !self.isUpToDate('config_scenarios_updated_at', data),
        config_profiles: !self.isUpToDate('config_profiles_updated_at', data)
      };
      self.updates = updates;
      deferred.resolve(updates);
    });

    return deferred;
  },

  downloadAll: function(){
    var self = this;
    var deferred = $.Deferred();
    self.syncing = {
      value: 0,
      total: 0
    };
    self.trigger('syncing');
    self.getJSON().then(function(data){
      console.log('DOWNLOADED', data);

      // Save game objects
      console.log('Save game objects'); // TODO
      var game_objects = new LSCP.Collection.GameObjectCollection();
      console.log(game_objects.count());
      self.syncing.total = game_objects.count();
      if (self.isUpToDate('game_objects_updated_at', data)) {
        console.log('game objects are already up-to-date');
      } else {
        console.log('there are ' + data.game_objects.length + ' game objects');
        game_objects.emptyDatabase()
            .done(function(){
              console.log('database emptied');
              game_objects.add(data.game_objects);
              self.syncing.value = game_objects.count();

              game_objects.on('change', function(){
                self.syncing.value = 50;
                self.trigger('syncing', self.syncing);
              });

              game_objects.downloadAssets().done(function(){
                console.log(game_objects.count() + ' added to the collection');
                // self.saveUpdatedAt('game_objects_updated_at', data.game_objects_updated_at);
              });
            });
      }

      console.log('TODO: save config_scenarios'); // TODO
      console.log('TODO: save config_profiles'); // TODO

      // Save date of last update
//      self.saveUpdatedAt('config_scenarios_updated_at', data.config_scenarios_updated_at);
//      self.saveUpdatedAt('config_profiles_updated_at', data.config_profiles_updated_at);

      deferred.resolve();
    });
    return deferred;
  },

  getUpdatedAt: function (key){
    return localStorage['lscp.idevxxi.' + key] || false;
  },

  isUpToDate: function (key, data){
    return (this.getUpdatedAt(key) === data[key]);
  },

  saveUpdatedAt: function (key, last_updated_at){
    localStorage['lscp.idevxxi.' + key] = last_updated_at;
  }

});