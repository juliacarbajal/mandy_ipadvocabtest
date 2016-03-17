LSCP.View.WordComprehensionGame = LSCP.View.Game.extend({

  current_level: null,
  current_stage: null,
  current_trial: null,
  layers: {},
  objects: {},
  timers: {},
  $character: null,

  initialize: function(){
    LSCP.View.Game.prototype.initialize.apply(this, arguments);

    console.log('LSCP.View.WordComprehensionGame initialized!');

    // Preload assets
    var images = [
      ['star',         LSCP.Locations.Images + "star.png"],
      ['slot',         LSCP.Locations.Images + "slot-bg.png"],
      ['slot-correct', LSCP.Locations.Images + "slot-correct-bg.png"],
      ['slot-wrong',   LSCP.Locations.Images + "slot-wrong-bg.png"]
    ];
    var sounds = [
      ['mandy', {
        urls: [LSCP.Locations.Sounds + 'mandy/sprite.mp3'],
        sprite: {
          hello1:   [900, 1600],
          hello2:   [3100, 1600],
          hello3:   [5300, 1600],
          hello4:   [7500, 1600],
          hello5:   [9700, 1600],
          right1:   [11900, 1600],
          right2:   [14100, 1600],
          right3:   [16300, 1600],
          right4:   [18500, 1600],
          right5:   [20700, 1600],
          right6:   [22900, 1600],
          wrong1:   [25100, 1600],
          wrong2:   [27300, 1600],
          wrong3:   [29500, 1600],
          wrong4:   [31700, 1600],
          wrong5:   [33900, 1600],
          idle1:    [36100, 1600],
          idle2:    [38300, 1600],
          idle3:    [40500, 1600]
       }
      }],
      ['plop', {urls: [LSCP.Locations.Sounds + 'plop.mp3']}]
    ];

    // Objects
    _.each(this.game_session.get('assets').objects, function(object){
      images.push(['object_' + object, LSCP.Locations.GameObjectImages + object + '.png']);
      sounds.push(['object_' + object, {
        urls: [LSCP.Locations.GameObjectSoundSprites + object + '.mp3'],
        sprite: {
          ask:   [0, 2000],
          intro: [3000, 2000]
        }
      }]);
    });

    // Backgrounds
    _.each(this.game_session.get('assets').backgrounds, function(background){
      images.push(["background_" + background, LSCP.Locations.Images + "backgrounds/" + background + ".jpg"]);
    });

    this.preloadImages(_.object(images));
    images = null;

    this.preloadSounds(_.object(sounds));
    sounds = null;
  },

  getCurrentLevel: function(){
    return this.game_session.get('levels').at(this.current_level);
  },

  getCurrentStage: function(){
    return this.getCurrentLevel().get('stages').at(this.current_stage);
  },

  render: function(){
    LSCP.View.Game.prototype.render.apply(this, arguments);
    console.log('LSCP.View.WordComprehensionGame.render');


    // Background

    this.layers.background = new collie.Layer(this.layersSize);


    // Object slots

    this.layers.slots = new collie.Layer({
      x: 40,
      y: 40,
      width: this.layersSize.width - 80,
      height: this.layersSize.height - 80
    });


    // Character

    this.layers.character = new collie.Layer(this.layersSize);
    this.objects.overlay = new collie.DisplayObject({
      backgroundColor: '#000',
      height: 768,
      width: 1024,
      opacity: 1
    }).addTo(this.layers.character);
    this.objects.character = new collie.DisplayObject({
      x: "center",
      y: 800,
      height: 400,
      width: 400
    }).addTo(this.layers.character);

    LSCP.Mandy.initialize();
    this.objects.characters = LSCP.Mandy.addAnimations(this.objects.character);
    this.timers.characters = LSCP.Mandy.getTimers(this.objects.characters);


    // HUD

    this.layers.hud = new collie.Layer(this.layersSize);
    this.objects.hud_text = new collie.Text({
      x: "center",
      y: "bottom",
      fontColor: "#000",
      fontSize: 12,
      textAlign: 'center',
      width: this.layersSize.width,
      height: 100,
      visible: false
    }).addTo(this.layers.hud);
    if (this.subtitles) this.objects.subtitles = new collie.Text({
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
    console.log('LSCP.View.WordComprehensionGame starts!');

    this.current_level = 0;
    this.current_stage = 0;

    this.game_session.saveEvent('start');

    this.onIteration();
  },

  nextStage: function(){

    var level = this.getCurrentLevel();

    this.current_stage += 1;

    if (this.current_stage > level.get('stages').size() - 1) {
      this.game_session.saveEvent('show_reward');
      this.reward.show().on('end', function(){
        this.reward.hide().off('end');
        this.current_level += 1;
        this.current_stage = 0;

        this.game_session.saveEvent('touch_reward');

        if (this.current_level > this.game_session.get('levels').size() - 1) {
          this.end();
        } else {
          this.onIteration();
        }
      }.bind(this));
      return;
    }

    this.onIteration();
  },

  retryStage: function(){

    console.log("RETRY STAGE: level ", this.current_level, "stage", this.current_stage);

    this.game_session.addTrialValue('repetition', 1);

    this.onIteration();
  },

  end: function(){
    console.log('LSCP.View.WordComprehensionGame ends!');

    // Trial management
    this.game_session.saveTrial();

    LSCP.View.Game.prototype.end.apply(this, arguments);
    collie.Renderer.removeAllLayer();
    collie.Renderer.unload();
  },


  // Game iteration management

  onIteration: function(){
    LSCP.View.Game.prototype.onIteration.apply(this, arguments);

    console.log('onIteration', this.current_level, this.current_stage);

    var level = this.getCurrentLevel();
    var stage = this.getCurrentStage();

    // Trial management
    this.game_session.saveTrial();
    this.game_session.initTrial();
    this.game_session.addTrialData({
      level_number: this.current_level + 1,
      level_name: level.get('name'),
      level_background: level.get('background'),
      stage_number: this.current_stage + 1,
      objects_count: stage.get("objects").length
    });

    // Progress
    if (this.current_stage === 0) this.game_session.set({progress: 0});

    // Set idle time for the current stage
    this.idleTime = stage.get('time_idle');

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
//        var introduce_objects = true;
//        var show_character = true;
//        if (stage.get("objects").length == 1) {
//            introduce_objects = true;
//            show_character = false;
//        }

    // Override objects positions
    this.objects_positions = [];
    if (stage.get("objects_positions") === 'NATURAL') {
      this.objects_positions = this.pos['FOR_' + stage.get("objects").length];
    } else if (stage.get("objects_positions") === 'RANDOM') {
      this.objects_positions = window.shuffleArray(this.pos['FOR_' + stage.get("objects").length]);
    } else if (_.isArray(stage.get("objects_positions"))) {
      this.objects_positions = stage.get("objects_positions");
    } else {
      throw 'Wrong value for "objects_positions" on level '+this.current_level+' stage '+this.current_stage;
    }

    // Create slots
    if (stage.get("objects_positions") === 'RANDOM') {
      stage.set("objects", window.shuffleArray(stage.get("objects")));
    }
    _.each(stage.get("objects"), function(object, i){
      var position = this.objects_positions[i];
      if (typeof this.pos[position] === 'undefined') throw 'Wrong value "'+position+'" for "objects_positions" on level '+this.current_level+' stage '+this.current_stage;
      var slot = new collie.DisplayObject({
        backgroundImage: "slot",
        opacity: 0
      }).set(this.pos[position]).addTo(this.layers.slots);
      new collie.DisplayObject({
        backgroundImage: 'object_' + object
      }).addTo(slot).align('center', 'center', slot);
      this.objects.slots.push(slot);
      this.game_session.addTrialValue("object"+(i+1)+"_name", object);

      if (stage.get("ask_for") === object) {
        this.game_session.addTrialData({
          object_asked: stage.get('ask_for'),
          object_asked_position: position
        });
      }
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
        if (level.get('introduce_objects') === true) {
          this.introduceObject(this.objects.slots[0], 0);
        }
        else {
          _.each(this.objects.slots, function(slot, i){
            setTimeout(function(){
              collie.Timer.transition(this.objects.slots[i], 1000 / this.speed, {
                from: 0,
                to: 1,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
              });
              if (i === stage.get("objects").length - 1) {
                setTimeout(this.onObjectsIntroduced.bind(this), 2000 / this.speed);
              }
            }.bind(this), 1500 * i / this.speed);
          }.bind(this));
        }
      }.bind(this), 0)

    ;

  },

  introduceObject: function(slot, i){
    var stage = this.getCurrentStage();
    this.startMeasuringDiff();

    this.sound.play('object_' + stage.get('objects')[i], 'intro');

    collie.Timer.queue().

      transition(slot, 1000 / this.speed, {
        from: 0,
        to: 1,
        set: "opacity",
        effect: collie.Effect.easeOutQuint
      }).

      delay(function(){
        if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ This is " + stage.get('objects')[i]);

        this.startWatchingIdle();

        slot.attach({
          mousedown: function () {
            var diff_time = this.stopMeasuringDiff();

            this.sound.play('plop');
            var currentY = slot.get('y');
            collie.Timer.transition(slot, 400 / this.speed, {
              to: currentY - 40,
              set: "y",
              effect: collie.Effect.wave(2, 0.25)
            });

            this.stopWatchingIdle();

            if (this.subtitles) this.objects.subtitles.set({visible: false});

            _.invoke(this.objects.slots, 'set', {backgroundColor: 'rgba(255,255,255,0)'});
            _.invoke(this.objects.slots, 'detachAll');

            this.game_session.addTrialValue("object"+(i+1)+"_touch_diff_time", diff_time);
            this.game_session.saveEvent('touch_object', stage.get('objects')[i]);

            setTimeout(function(){
              collie.Timer.transition(this.objects.slots[i], 200 / this.speed, {
                from: 1,
                to: 0.3,
                set: "opacity",
                effect: collie.Effect.easeOutQuint
              });

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

    var level = this.getCurrentLevel();
    this.game_session.addTrialValue('correct', 1);

    // Idle
    this.stopWatchingIdle();

    if (level.get('feedback') === true) {
      // Animation
      this.timers.characters.happy.start();

      // Sound
      this.sound.play('mandy', 'right*');
      if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ BRAVO!");

      this.game_session.addTrialValue('feedback', 1);
    } else {
      this.game_session.addTrialValue('feedback', 0);
    }

    // Progress
    var progress = 100 / level.get('stages').length * (this.current_stage+1);
    this.game_session.set({progress: Math.floor(progress)});

    // Display queue

    collie.Timer.queue().

      delay(function(){
        slot.set('backgroundImage', 'slot-correct');
      }.bind(this), 0).

      delay(function(){
        if (this.subtitles) this.objects.subtitles.set({visible: false});
      }.bind(this), 0).

      delay(function(){

        collie.Timer.transition(this.objects.overlay, 800 / this.speed, {
          from: 0,
          to: 1,
          set: "opacity",
          effect: collie.Effect.easeOutQuint
        });
        collie.Timer.transition(this.objects.character, 1000 / this.speed, {
          from: 1,
          to: 0,
          set: "opacity",
          effect: collie.Effect.easeOutQuint
        });

      }.bind(this), 3000 / this.speed).

      delay(function(){
        LSCP.Mandy.visible = false;
        this.objects.character.set({
          opacity: 1,
          y: 800
        });
        this.layers.slots.removeChildren(this.objects.slots);
        this.nextStage();
      }.bind(this), 2000 / this.speed)

    ;
  },

  onWrongAnswer: function(slot){
    LSCP.View.Game.prototype.onWrongAnswer.apply(this, arguments);

    var level = this.getCurrentLevel();
    this.game_session.addTrialValue('correct', 0);

    // Idle
    this.stopWatchingIdle();

    if (level.get('feedback') === true) {
      // Animation
      this.timers.characters.sad.start();

      // Sound
      this.sound.play('mandy', 'wrong*');
      if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ NO, YOU'RE WRONG");

      // Slot
      slot.set('backgroundImage', 'slot-wrong');

      this.game_session.addTrialValue('feedback', 1);
    } else {
      slot.set('backgroundImage', 'slot-correct');

      this.game_session.addTrialValue('feedback', 0);
    }

    // Display queue

    collie.Timer.queue().

      delay(function(){
        if (this.subtitles) this.objects.subtitles.set({visible: false});
      }.bind(this), 0).

      delay(function(){

        collie.Timer.transition(this.objects.overlay, 800 / this.speed, {
          from: 0,
          to: 1,
          set: "opacity",
          effect: collie.Effect.easeOutQuint
        });
        collie.Timer.transition(this.objects.character, 1000 / this.speed, {
          from: 1,
          to: 0,
          set: "opacity",
          effect: collie.Effect.easeOutQuint
        });

      }.bind(this), 3000 / this.speed).

      delay(function(){
        LSCP.Mandy.visible = false;
        this.objects.character.set({
          opacity: 1,
          y: 800
        });
        this.layers.slots.removeChildren(this.objects.slots);

        switch (level.get('on_failure')) {
          // Handling of different possible behaviors in case of failure

          case 'REPEAT_STAGE':
            this.retryStage();
            break;

          case 'CONTINUE':
            // Progress
            var progress = 100 / level.get('stages').length * (this.current_stage+1);
            this.game_session.set({progress: Math.floor(progress)});

            this.nextStage();
            break;
        }

      }.bind(this), 2000 / this.speed)

    ;
  },

  onNoAnswer: function(){
    LSCP.View.Game.prototype.onNoAnswer.apply(this, arguments);
  },

  onIdle: function(){
    LSCP.View.Game.prototype.onIdle.apply(this, arguments);

    if (LSCP.Mandy.visible) {
      this.sound.play('mandy', 'idle*');
      this.timers.characters.bored.start();
    } else {
      this.sound.play('mandy', 'idle*');
    }
  },


  // Game interaction

  onTouch: function(){
    LSCP.View.Game.prototype.onTouch.apply(this, arguments);
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
        this.startMeasuringDiff();
        this.startWatchingIdle();
        LSCP.Mandy.visible = true;
        this.timers.characters.hello.start();
        this.sound.delayedPlay(600, 'mandy', 'hello*');

        this.objects.character.set({backgroundColor: 'rgba(255,255,255,0.1)'})
          .attach({
            mousedown: function () {
              this.objects.character.set({backgroundColor: 'rgba(255,255,255,0)'});
              this.objects.character.detachAll();

              this.game_session.addTrialValue("mandy_touch_diff_time", this.stopMeasuringDiff());
              this.stopWatchingIdle();
              this.onTouchCharacter();
            }.bind(this)
          });
      }.bind(this), 0)

    ;
  },

  onTouchCharacter: function(){
    this.sound.play('plop');
    var stage = this.getCurrentStage();
    var started_asking_at;

    this.game_session.saveEvent('touch_mandy');

    collie.Timer.queue().

      delay(function(){
        this.timers.characters.ask.start();
        this.sound.delayedPlay(500, 'object_' + stage.get('ask_for'), 'ask');
        started_asking_at = +new Date() + 500;
        if (this.subtitles) this.objects.subtitles.set({visible: true}).text("♫ Where is the " + stage.get('ask_for') + "?");
      }.bind(this), 500 / this.speed).

      delay(function(){
        _.each(this.objects.slots, function(slot, i){
          slot.set({opacity: 1});
          slot.attach({
            mousedown: function () {
              this.sound.play('plop');
              this.game_session.saveEvent('touch_object', stage.get("objects")[i]);
              var object_touched_at = +new Date() - started_asking_at;
              this.game_session.addTrialData({
                object_touched: stage.get("objects")[i],
                object_touched_position: this.objects_positions[i],
                object_touched_at: object_touched_at,
                stage_end: 'touch_object'
              });

              _.invoke(this.objects.slots, 'detachAll');

              var currentY = slot.get('y');
              var slots_to_hide = _.reject(this.objects.slots, function(s){return s === slot;});

              collie.Timer.queue().

                transition(slot, 400 / this.speed, {
                  to: currentY - 40,
                  set: "y",
                  effect: collie.Effect.wave(2, 0.25)
                }).

                transition(slots_to_hide, 400 / this.speed, {
                  from: 1,
                  to: 0,
                  set: "opacity"
                }).

                delay(function(){
                  if (stage.get("objects")[i] == stage.get("ask_for"))
                    this.onCorrectAnswer(slot);
                  else
                    this.onWrongAnswer(slot);
                }.bind(this), 500 / this.speed);

            }.bind(this)
          });
        }, this);

        this.startWatchingIdle();
      }.bind(this), 2000 / this.speed).

      transition(this.objects.overlay, 1000 / this.speed, {
        from: 0.9,
        to: 0,
        set: "opacity",
        effect: collie.Effect.easeOutQuint
      })

    ;

  }


});
