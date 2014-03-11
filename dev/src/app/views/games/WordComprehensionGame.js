LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

    current_level: null,
    current_stage: null,
    layers: {},
    objects: {},
    $character: null,

	initialize: function(){
        LSCP.View.Game.prototype.initialize.apply(this, arguments);

        log('LSCP.View.WordComprehensionGame initialized!');

        // Preload assets
        var objects_to_preload = [
            ['character', LSCP.Locations.Images + "character.png"],
            ['slot', LSCP.Locations.Images + "trunk.png"]
        ];

        // Objects
        _.each(this.game_session.get('assets').objects, function(objects, objects_family){
            _.each(objects, function(object){
                objects_to_preload.push([objects_family + "_" + object, LSCP.Locations.Images + "objects/" + objects_family + "/" + object + ".png"]);
            });
        });

        // Backgrounds
        _.each(this.game_session.get('assets').backgrounds, function(background){
            objects_to_preload.push(["background_" + background, LSCP.Locations.Images + "backgrounds/" + background + ".jpg"]);
        });

        this.preloadImages(_.object(objects_to_preload));

        /*
         TODO
         - set the game data
         - create new game session
         - start
         */
	},

    getCurrentLevel: function(){
        return this.game_session.get('levels').at(this.current_level);
    },

    getCurrentStage: function(){
        return this.getCurrentLevel().get('stages').at(this.current_stage);
    },

    render: function(){
        LSCP.View.Game.prototype.render.apply(this, arguments);
        log('LSCP.View.WordComprehensionGame.render');


        // Background

        this.layers.background = new collie.Layer(this.layersSize);


        // Object slots

        this.layers.slots = new collie.Layer({
            x: 20,
            y: 20,
            width: this.layersSize.width - 40,
            height: this.layersSize.height - 40
        });


        // Character

        this.layers.character = new collie.Layer(this.layersSize);
        this.objects.overlay = new collie.DisplayObject({
            backgroundColor: '#222',
            height: 768,
            width: 1024,
            opacity: 1
        }).addTo(this.layers.character);
        this.objects.character = new collie.DisplayObject({
            x: "center",
            y: 800,
            backgroundImage: "character",
            height: 400,
            width: 400
        }).addTo(this.layers.character);


        // HUD

        this.layers.hud = new collie.Layer(this.layersSize);
        this.objects.hud_text = new collie.Text({
            x: "center",
            y: 10,
            fontColor: "#000",
            fontSize: 12,
            textAlign: 'center',
            width: this.layersSize.width,
            height: 100,
            visible: false
        }).addTo(this.layers.hud);
        this.objects.subtitles = new collie.Text({
            x: "center",
            y: this.layersSize.height - 50,
            fontColor: "#FFF",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: 'center',
            width: this.layersSize.width,
            height: 50
        }).addTo(this.layers.hud);


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
        log('LSCP.View.WordComprehensionGame starts!');

        this.current_level = 0;
        this.current_stage = 0;

        this.onIteration();
    },

    nextStage: function(){

        var level = this.getCurrentLevel();

        this.current_stage += 1;

        if (this.current_stage > level.get('stages').length - 1) {
            this.reward.show().on('end', function(){
                this.reward.hide().off('end');
                this.current_level += 1;
                this.current_stage = 0;
                log("NEXT STAGE: level ", this.current_level, "stage", this.current_stage);
                this.onIteration();
            }.bind(this));
            return;
        }

        if (this.current_level > this.game_session.get('levels').length - 1) {
            this.end();
            return;
        }

        log("NEXT STAGE: level ", this.current_level, "stage", this.current_stage);

        this.onIteration();
    },

    retryStage: function(){

        log("RETRY STAGE: level ", this.current_level, "stage", this.current_stage);

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

        log('onIteration', this.current_level, this.current_stage);

        var level = this.getCurrentLevel();
        var stage = this.getCurrentStage();

        // Progress
        if (this.current_stage === 0) this.game_session.set({progress: 0});


        // Background
        if (this.objects.background) this.layers.background.removeChild(this.objects.background);
        this.objects.background = new collie.DisplayObject({
            x: "center",
            y: "center",
            backgroundImage: "background_" + level.get('background'),
            height: 768,
            width: 1024,
            opacity: 1
        }).addTo(this.layers.background);


        // Object slots
        this.objects.slots = [];

        // "Tutorial" mode when only one object
        var introduce_objects = true;
//        var show_character = true;
//        if (stage.get("objects").length == 1) {
//            introduce_objects = true;
//            show_character = false;
//        }

        // Override objects positions
        var objects_positions = [];
        if (stage.get("objects_positions") == 'NATURAL') {
            objects_positions = this.pos['FOR_' + stage.get("objects").length];
        } else if (_.isArray(stage.get("objects_positions"))) {
            objects_positions = _.map(stage.get("objects_positions"), function(pos) {
                return this.pos[pos];
            }, this);
        } else {
            throw 'Wrong value for "objects_positions" on level '+this.current_level+' stage '+this.current_stage;
        }

        _.each(stage.get("objects"), function(object, i){
            var slot = new collie.DisplayObject({
                backgroundColor: 'rgba(255,255,255,0)',
                backgroundImage: stage.get("objects_family") + "_" + object,
                opacity: 0
            }).set(objects_positions[i]).addTo(this.layers.slots);
            this.objects.slots.push(slot);
        }, this);


        // HUD

        this.objects.hud_text.text('LEVEL: ' + level.get('name'));


        // Display queue

        collie.Timer.queue().

            delay(function(){
                this.objects.hud_text.set({visible: true});
            }.bind(this), 1000 / this.speed).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 1,
                to: 0,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                if (introduce_objects) {
                    this.introduceObject(this.objects.slots[0], 0);
                }
                else this.onObjectsIntroduced();
            }.bind(this), 0)

        ;

    },

    introduceObject: function(slot, i){
        var stage = this.getCurrentStage();

        collie.Timer.queue().

            transition(slot, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.objects.subtitles.set({visible: true}).text("♫ This is " + stage.get('objects')[i]);

                slot.set({backgroundColor: 'rgba(255,255,255,0.2)'})
                    .attach({
                        mousedown: function () {
                            var currentY = slot.get('y');
                            collie.Timer.transition(slot, 400 / this.speed, {
                                to: currentY - 100,
                                set: "y",
                                effect: collie.Effect.wave(2, 0.25)
                            });

                            this.objects.subtitles.set({visible: false});

                            _.invoke(this.objects.slots, 'set', {backgroundColor: 'rgba(255,255,255,0)'});
                            _.invoke(this.objects.slots, 'detachAll');

                            setTimeout(function(){
                                if (i < stage.get("objects").length - 1) {
                                    i++;
                                    this.introduceObject(this.objects.slots[i], i);
                                } else {
                                    this.onObjectsIntroduced();
                                }
                            }.bind(this), 2000 / this.speed);
                        }.bind(this)
                    });
            }.bind(this), 0)

        ;

    },

    onCorrectAnswer: function(slot){
        LSCP.View.Game.prototype.onCorrectAnswer.apply(this, arguments);

        // Success sound
        this.objects.subtitles.set({visible: true}).text("♫ BRAVO!");

        // Progress
        var level = this.getCurrentLevel();
        var progress = 100 / level.get('stages').length * (this.current_stage+1);
//        log('PROGRESS:', progress, " = 100 / " + level.get('stages').length + "* (" + this.current_stage + "+1)");
        this.game_session.set({progress: Math.floor(progress)});

        // Display queue

        var currentY = slot.get('y');
        collie.Timer.queue().

            transition(slot, 400 / this.speed, {
                to: currentY - 100,
                set: "y",
                effect: collie.Effect.wave(2, 0.25)
            }).

            delay(function(){}, 2000 / this.speed).

            delay(function(){
                this.objects.subtitles.set({visible: false});
            }.bind(this), 50 / this.speed).

            transition(this.objects.character, 1000 / this.speed, {
                to: 800,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.layers.slots.removeChildren(this.objects.slots);
                this.nextStage();
            }.bind(this), 2000 / this.speed)

        ;

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

        // Failure sound
        this.objects.subtitles.set({visible: true}).text("♫ NO, YOU'RE WRONG");


        // Display queue

        collie.Timer.queue().

            delay(function(){}, 2000 / this.speed).

            delay(function(){
                this.objects.subtitles.set({visible: false});
            }.bind(this), 0).

            transition(this.objects.character, 1000 / this.speed, {
                to: 800,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.layers.slots.removeChildren(this.objects.slots);
                this.retryStage();
            }.bind(this), 2000 / this.speed)

        ;

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
    },

    onObjectsIntroduced: function(){

        collie.Timer.queue().

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0,
                to: 0.9,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            transition(this.objects.character, 1000 / this.speed, {
                to: 200,
                set: "y",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                this.objects.character.set({backgroundColor: 'rgba(255,255,255,0.1)'})
                    .attach({
                        mousedown: function () {
                            this.objects.character.set({backgroundColor: 'rgba(255,255,255,0)'});
                            this.objects.character.detachAll();

                            this.onTouchCharacter();
                        }.bind(this)
                    });
            }.bind(this), 0)

        ;
    },

    onTouchCharacter: function(){
        var stage = this.getCurrentStage();

        collie.Timer.queue().

            delay(function(){
                this.objects.subtitles.set({visible: true}).text("♫ Where is the " + stage.get('ask_for') + "?");
            }.bind(this), 500 / this.speed).

            delay(function(){}.bind(this), 3000 / this.speed).

            transition(this.objects.overlay, 1000 / this.speed, {
                from: 0.9,
                to: 0,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
            }).

            delay(function(){
                _.each(this.objects.slots, function(slot, i){
                    slot.set({backgroundColor: 'rgba(255,255,255,0.2)'})
                        .attach({
                            mousedown: function () {
                                this.game_session.saveAction('touch', 'slot#'+i);

                                _.invoke(this.objects.slots, 'set', {backgroundColor: 'rgba(255,255,255,0)'});
                                _.invoke(this.objects.slots, 'detachAll');

                                if (stage.get("objects")[i] == stage.get("ask_for"))
                                    this.onCorrectAnswer(slot);
                                else
                                    this.onWrongAnswer();
                            }.bind(this)
                        });
                }, this);
            }.bind(this), 0)

        ;

    }


});