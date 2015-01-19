
LSCP.Model.GameObjectPersist = persistence.define('GameObject', {
  name: 'TEXT',
  image: 'TEXT',
  sound_sprite: 'TEXT',
  downloaded: 'BOOL'
});
LSCP.Model.GameObjectPersist.index(['name'],{unique:true});


LSCP.Model.GameObject = Backbone.Model.extend({
  /*global cordova:false */

  persistableEntity: LSCP.Model.GameObjectPersist,

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
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, _.bind(function(){

      var fileTransfer = new window.FileTransfer();
      var assets = {
        image: {
          url: this.get('image'),
          local_path: LSCP.Locations.GameObjectImages + this.get('name') + '.png',
          downloaded: $.Deferred()
        },
        sound_sprite: {
          url: this.get('sound_sprite'),
          local_path: LSCP.Locations.GameObjectSoundSprites + this.get('name') + '.mp3',
          downloaded: $.Deferred()
        }
      };
      $.each(assets, _.bind(function(id, asset){
        fileTransfer.download(asset.url, asset.local_path, _.bind(function(){
          this.set(id, asset.local_path);
          this.set('downloaded', true);
          asset.downloaded.resolve();
        }, this), function(error){
          console.log('ERROR: ', error);
        });
      }, this));

      $.when(assets.image.downloaded, assets.sound_sprite.downloaded).then(function(){
        deferred.resolve();
      });

    }, this));
    return deferred;
  },

  persistable: function(){
    return new this.persistableEntity(this.attributes);
  }

});