LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    layers: {},
    objects: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        this.setImages({
            background: LSCP.Locations.Images + "background.jpg",
            character: LSCP.Locations.Images + "character.png",
            trunk: LSCP.Locations.Images + "trunk.png"
        });

        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},

    template: '{{difficulty.trunks}} TRUNKS + CHARACTER',

    render: function(){
        log('LSCP.View.WordComprehensionGame.render');
//        var template = Handlebars.compile(this.template);
//        this.$el.html(template(this.model.attributes));

        // Background

        this.layers.background = new collie.Layer(this.layersSize);
        this.objects.background = new collie.DisplayObject({
            x: "center",
            y: "center",
            backgroundImage: "background",
            height: 908,
            width: 1155,
            opacity: 0
        }).addTo(this.layers.background);


        // Character

        this.layers.character = new collie.Layer(this.layersSize);
        this.objects.character = new collie.DisplayObject({
            x: "center",
            y: 800,
            backgroundImage: "character",
            height: 341,
            width: 250
        }).addTo(this.layers.character);


        // Trunks

        this.layers.trunks = new collie.Layer(this.layersSize);
        this.objects.trunks = [];
        _.times(this.model.attributes.difficulty.trunks, function(){
            this.objects.trunks.push(new collie.DisplayObject({
                backgroundImage: "trunk",
                height: 239,
                width: 160,
                opacity: 0
            }));
        }, this);

        this.objects.trunks[0].set({x: 20, y: 20});
        this.objects.trunks[1].set({x: 844, y: 20});
        this.objects.trunks[2].set({x: 844, y: 509});
        this.objects.trunks[3].set({x: 20, y: 509});

        _.each(this.objects.trunks, function(trunk, i){
            trunk.addTo(this.layers.trunks);
            trunk.attach({
                mousedown: function () {
                    log('You touched trunk #'+i);
                    var currentY = trunk.get('y');
                    collie.Timer.transition(trunk, 400, {
                        to: currentY - 100,
                        set: "y",
                        effect: collie.Effect.wave(2, 0.25)
                    });
                }
            });
        }, this);


        // Rendering

        _.each(this.layers, function(l){
            collie.Renderer.addLayer(l);
        });
        collie.Renderer.load(this.el);
        collie.Renderer.start();

        return this;
    },


    // Game cycle

    start: function(){
        LSCP.View.Game.prototype.start.apply(this, arguments);
        this.onIteration();
    },

    end: function(){
        LSCP.View.Game.prototype.end.apply(this, arguments);
        /* TODO
        - save game session
        - send GAME_END to controller
        */
    },


    // Game iteration management

    onIteration: function(){
        LSCP.View.Game.prototype.onIteration.apply(this, arguments);

        collie.Timer.delay(function() {
            collie.Timer.transition(this.objects.character, 1000, {
                to: 200,
                set: "y",
                effect: collie.Effect.easeOutQuint
            });
        }.bind(this), 3000 / this.speed);
        collie.Timer.delay(function() {
            collie.Timer.transition(this.objects.background, 1000, {
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
            collie.Timer.transition(this.objects.trunks, 1000, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            });
        }.bind(this), 6000 / this.speed);
//        this.$character.delay(3000)
//            .queue(function() {
//                $(this).addClass('shown').dequeue();
//            });
        /* TODO
        - the character arrives and asks for an object
        - display the background and the objects
        */
    },

    onCorrectAnswer: function(){
        LSCP.View.Game.prototype.onCorrectAnswer.apply(this, arguments);
        /* TODO
        - animate object and character
        - success sound
        - character leaves
        - fade to black
        - next iteration
        */
    },

    onWrongAnswer: function(){
        LSCP.View.Game.prototype.onWrongAnswer.apply(this, arguments);
        /* TODO
         - animate object and character
         - failure sound
         - character leaves
         - fade to black
         - next iteration
         */
    },

    onNoAnswer: function(){
        LSCP.View.Game.prototype.onNoAnswer.apply(this, arguments);
        /* TODO
         - wait 5 seconds
         - character leaves
         - fade to black
         - next iteration
         */
    },

    onIdle: function(){
        LSCP.View.Game.prototype.onIdle.apply(this, arguments);
        /* TODO
         - character talks
         - idle sound
         - after 3 times, end session
         */
    },


    // Game interaction

    onTouch: function(){
        LSCP.View.Game.prototype.onTouch.apply(this, arguments);
        /* TODO */
    }


});