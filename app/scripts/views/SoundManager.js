
LSCP.SoundManager = new Object({

    sounds: {},
    playing: {},
    debug: false,
    randomSpriteRegex: /(\D+)\d+$/,

    initialize: function() {
        this.log('LSCP.SoundManager initialized!');
        _.extend(this, Backbone.Events);
        return this;
    },

    log: function() {
        if (this.debug) console.log(arguments);
    },

    addSounds: function(sounds) {
        _.each(sounds, this.addSound, this);
        return this;
    },

    addSound: function(sound, name) {
        this.log('LSCP.SoundManager.addSound', sound, name);

        this.sounds[name] = new Howl(sound);

        // Manage random sprites
        this.sounds[name].randomSprites = {};
        if (typeof sound.sprite != 'undefined') {
            _.each(sound.sprite, function(sp, id){
                var match = id.match(this.randomSpriteRegex);
                if (match) {
                    var key = match[1]+'*';
                    if (_.has(this.sounds[name].randomSprites, key))
                        this.sounds[name].randomSprites[key]++;
                    else
                        this.sounds[name].randomSprites[key] = 1;
                }
            }, this);
        }

        return this;
    },

    play: function(sound, sprite) {
        this.log('LSCP.SoundManager.play', sound, sprite);

        // Manage random sprites
        if (typeof sprite != 'undefined' && sprite.indexOf('*') != -1) {
            sprite = sprite.replace('*', this.randomFromInterval(1, this.sounds[sound].randomSprites[sprite]));
        }

        // If the sound to play is not a plop, stop currently playing mandy sounds
        if (sound !== 'plop' && _.has(this.playing, 'mandy')) {
          this.playing.mandy.stop();
        }

        // Play the sound
        this.playing[sound] = this.sounds[sound].play(sprite).on('end', _.bind(function(){
          // After the sound played, remove it from this.playing
          delete this.playing[sound];
        }, this));
        return this;
    },

    delayedPlay: function(delay, sound, sprite) {
        _.delay(this.play.bind(this), delay, sound, sprite);
    },

    randomFromInterval: function(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

});
