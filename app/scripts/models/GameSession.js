
LSCP.Model.GameSessionPersist = persistence.define('GameSession', {
  started_at: 'DATE',
  ended_at: 'DATE',
  time_limit: 'INT',
  actions: 'JSON',
  progress: 'INT',
  synced: 'BOOL'
});
//LSCP.Model.GameSessionPersist.index(['uuid'],{unique:true});

LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

  persistableEntity: LSCP.Model.GameSessionPersist,

  defaults: {
    started_at: null,
    should_end_at: null,
    ended_at: null,
    time_limit: null,
    game: null,
    levels: [],
    actions: [],
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
    },
    {
      type: Backbone.Many,
      key: 'actions',
      collectionType: 'LSCP.Collection.ActionCollection'
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

  saveAction: function(action, value){
    this.get("actions").add(new LSCP.Model.Action({
      action: action,
      value: value
    }));
  },

  isTimeLimitOver: function(){
    var now = new Date();
    var is_over = now > this.get('should_end_at');

    log('should_end_at', this.get('should_end_at'));
    log('now', now);
    log('is_over', is_over);

    return is_over;
  },

  setAsSynced: function(){
    this.set('synced', true);
    this.sync('update',this).then(_.bind(function(e){
      this.trigger('change');
    }, this));
  },

  // TODO move this as a mixin?
  persistable_attributes: function(){
    return _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'actions', 'progress', 'synced']);
  },

  persistable: function(){
    var data = this.persistable_attributes();
    return new this.persistableEntity(data);
  },

  syncable_attributes: function(){
    return _.pick(this.attributes, ['started_at', 'ended_at', 'time_limit', 'actions']);
  }

});