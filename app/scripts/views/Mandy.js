
LSCP.Mandy = new Object({

    animations: {
        normal: {
            sprite: 'normal.png',
            values: [0],
            loop: 0
        },
        blink: {
            sprite: 'blink.png',
            values: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            loop: 0
        },
        ask: {
            sprite: 'ask.png',
            values: [0,0,0,0,1,0,2,3,4,5,6,6,7,8,8,9,10,10,6,6,8,8,8,11,12,13,14,0,0,0],
            loop: 1
        },
        happy: {
            sprite: 'happy.png',
            values: [0,1,2,3,4,4,4,4,4,5,6,7,8,9,1,10,11,12,12,12,12,12,13,6,7],
            loop: 2
        },
        hello: {
            sprite: 'hello.png',
            values: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,10,11,14,15,16,17,18,19,16,17,20,21,22,23,0],
            loop: 1
        },
        sad: {
            sprite: 'sad.png',
            values: [0,1,2,3,4,5,6,6,6,6,6,6,7,8,8,8,8,8,8,8,8,8,8,9,9,9,10,11,12],
            loop: 1
        },
        bored: {
            sprite: 'bored.png',
            values: [0,1,2,3,4,5,6,7,8,7,6,7,9,10,11,12,13,12,11,12,13,12,11,14,15,16,17,18,19,20,21,20,22,23,24,23,25,26,27],
            loop: 1
        },
        idle: {
            sprite: 'idle.png',
            values: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1],
            loop: 1
        }
    },
    visible: false,
    currentAnimation: null,

    initialize: function() {
        console.log('LSCP.Mandy initialized!');

        _.each(this.animations, function(animation, id){
            var name = (id == 'normal') ? 'character' : 'character-' + id;
            collie.ImageManager.addImage(name, LSCP.Locations.Images + 'character/' + animation.sprite);
        });

    },

    addAnimations: function(parent) {
        var characters = {};

        _.each(this.animations, function(animation, id){
            if (id == 'normal') {
                characters.normal = new collie.DisplayObject({
                    backgroundImage: "character"
                }).addTo(parent);
            } else {
                characters[id] = new collie.DisplayObject({
                    backgroundImage: "character-" + id,
                    height: 400,
                    width: 400,
                    spriteLength: 35,
                    visible: false
                }).addTo(parent);
            }
        });

        return characters;
    },

    getTimers: function(characters){
        var timers = {};

        _.each(this.animations, function(animation, id){
            if (id == 'normal') return;

            timers[id] = collie.Timer.cycle(characters[id], "15fps", {
                loop: animation.loop,
                useAutoStart : false,
                valueSet: animation.values,
                onStart: function(){
                    _.each(characters, function(v){v.set('visible', false);});
                    characters[id].set('visible', true);
                    this.currentAnimation = id;
                }.bind(this),
                onComplete : function () {
                    if (this.currentAnimation != id) {return;}
                    characters[id].set('visible', false);
                    characters.normal.set('visible', true);
                    this.currentAnimation = null;
                }.bind(this)
            });
        });

        return timers;
    }

});