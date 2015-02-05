
LSCP.Model.GameObject = Backbone.Model.extend({

  defaults: {
    name: null,
    image: null,
    sound_sprite: null,
    downloaded: false
  },
	
	initialize: function(){
	},

  downloadAssets: function(){
    var deferred = $.Deferred();
    var self = this;

    var fileTransfer = new window.FileTransfer();
    var assets = {
      image: {
        url: self.get('image'),
        local_path: LSCP.Locations.GameObjectImages + self.get('name') + '.png',
        downloaded: $.Deferred()
      },
      sound_sprite: {
        url: self.get('sound_sprite'),
        local_path: LSCP.Locations.GameObjectSoundSprites + self.get('name') + '.mp3',
        downloaded: $.Deferred()
      }
    };

    $.each(assets, function(asset_type, asset){
      fileTransfer.download(asset.url, asset.local_path, function(){
//        console.log('DOWNLOADED: ', asset.local_path, 'FROM', asset.url);
        console.log(asset_type + ' DOWNLOADED for ' + self.get('name'));
        self.set(asset_type, asset.local_path);
        asset.downloaded.resolve();
      }, function(error){
        console.log('ERROR: ', error);
      });
    });

    $.when(assets.image.downloaded, assets.sound_sprite.downloaded).then(function(){
      console.log('ALL DOWNLOADED for ' + self.get('name'));
      self.set('downloaded', true);
      deferred.resolve();
    });

    return deferred;
  }

});