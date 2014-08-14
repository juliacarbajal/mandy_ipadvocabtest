LSCP.Model.GameSession = Backbone.AssociatedModel.extend({

  defaults: {
    started_at: null,
    should_end_at: null,
    ended_at: null,
    time_limit: null,
    game: null,
    levels: [],
    actions: [],
    progress: 0
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
    log('LSCP.Model.GameSession.initialize');

    this.on("invalid", function(model, error){
      log('GameSession validation error:', error);
    });
    this.on('change:progress', function(){
      log('New progress:', this.get('progress'));
    });

    var now = new Date();
    log('time_limit', this.get('time_limit'));
    this.set({
      started_at: now,
      should_end_at: new Date(now.getTime() + this.get('time_limit')*1000)
    });
    log('started_at', this.get('started_at'));
    log('should_end_at', this.get('should_end_at'));

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
  }

  /*
   TODO:
   - handle game session data (config + results)
   - give access to levels and stages
   - give final reward
   */

});