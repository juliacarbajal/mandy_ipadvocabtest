
LSCP.Model.GameSessionPersist = persistence.define('GameSession', {
  started_at: 'DATE',
  ended_at: 'DATE',
  time_limit: 'INT',
  levels: 'JSON',
  trials: 'JSON',
  events: 'JSON',
  config: 'INT',
  subject: 'TEXT',
  progress: 'INT',
  synced: 'BOOL'
});

LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

  persistableEntity: LSCP.Model.GameSessionPersist,

  defaults: {
    started_at: null,
    should_end_at: null,
    ended_at: null,
    time_limit: null,
    game: null,
    trials: [],
    events: [],
    config: null,
    subject: null,
    progress: 0,
    synced: false
  },

  relations: [
    {
      type: Backbone.One,
      key: 'game',
      relatedModel: 'LSCP.Model.Game'
    },
    {
      type: Backbone.Many,
      key: 'levels',
      collectionType: 'LSCP.Collection.LevelCollection'
    }
  ],

  validate: function(attributes){
    if(attributes.progress < 0 || attributes.progress > 100){
      return "Invalid progress (should be between 0 and 100)";
    }
  },

  initialize: function(){
    this.on("invalid", function(model, error){
      console.log('GameSession validation error:', error);
    });
    this.on('change:progress', function(){
      console.log('New progress:', this.get('progress'));
    });

    // Init trials counter
    this.trial_number = 0;
  },

  saveEvent: function(event, value){
    var e = {
      event: event,
      at: new Date()
    };
    if (typeof value !== 'undefined') e.value = value;
    this.set('events', this.get('events').concat(e));
    this.sync('update', this, ['events']).then(_.bind(function(){
      this.trigger('change');
    }, this));
  },

  hasCurrentTrial: function(){
    return (typeof this.current_trial !== 'undefined');
  },

  initTrial: function(){
    this.trial_number += 1;
    this.current_trial = {
      number: this.trial_number,
      started_at: new Date(),
      repetition: 0
    };
    console.log('initTrial', this.current_trial);
  },

  addTrialData: function(data){
    this.current_trial = _.extend(this.current_trial, data);
  },

  addTrialValue: function(key, value){
    this.current_trial[key] = value;
  },

  saveTrial: function(){
    if (!this.hasCurrentTrial()) return;
    this.set('trials', this.get('trials').concat(this.current_trial));
    this.sync('update', this, ['trials']).then(_.bind(function(){
      this.trigger('change');
    }, this));
  },

  isTimeLimitOver: function(){
    var now = new Date();
    var is_over = now > this.get('should_end_at');

    console.log('should_end_at', this.get('should_end_at'), 'now', now, 'is_over', is_over);

    return is_over;
  },

  setAsSynced: function(){
    this.set('synced', true);
    this.sync('update', this, ['synced']).then(_.bind(function(){
      this.trigger('change');
    }, this));
  },

  persistable_attributes: function(){
    var attr = _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'trials', 'events', 'config', 'subject', 'progress', 'synced']);
    attr.levels = this.get('levels').dump();
    return attr;
  },

  persistable: function(){
    var data = this.persistable_attributes();
    return new this.persistableEntity(data);
  },

  syncable_attributes: function(){
    return _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'levels', 'trials', 'events', 'config', 'subject']);
  }

});
