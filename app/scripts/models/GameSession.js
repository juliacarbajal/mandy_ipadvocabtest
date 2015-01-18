
LSCP.Model.GameSessionPersist = persistence.define('GameSession', {
  started_at: 'DATE',
  ended_at: 'DATE',
  time_limit: 'INT',
  events: 'JSON',
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
    levels: [],
    events: [],
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
      log('GameSession validation error:', error);
    });
    this.on('change:progress', function(){
      log('New progress:', this.get('progress'));
    });

    var now = new Date();
    this.set({
      started_at: now,
      should_end_at: new Date(now.getTime() + this.get('time_limit')*1000)
    });

  },

  saveEvent: function(event, value){
    var e = {
      event: event,
      at: new Date()
    };
    if (typeof value !== 'undefined') e.value = value;
    this.set('events', this.get('events').concat(e));
    this.sync('update',this).then(_.bind(function(){
      this.trigger('change');
    }, this));
  },

  isTimeLimitOver: function(){
    var now = new Date();
    var is_over = now > this.get('should_end_at');

    log('should_end_at', this.get('should_end_at'), 'now', now, 'is_over', is_over);

    return is_over;
  },

  setAsSynced: function(){
    this.set('synced', true);
    this.sync('update',this).then(_.bind(function(){
      this.trigger('change');
    }, this));
  },

  // TODO move this as a mixin?
  persistable_attributes: function(){
    return _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'events', 'progress', 'synced']);
  },

  persistable: function(){
    var data = this.persistable_attributes();
    return new this.persistableEntity(data);
  },

  syncable_attributes: function(){
    return _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'events']);
  }

});