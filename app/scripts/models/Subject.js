LSCP.Model.Subject = Backbone.AssociatedModel.extend({

  defaults: {
    anonymous_id: '0'
  },

  initialize: function(){

    if (!('lscp.idevxxi.current_subject_id' in localStorage)) {
      this.setAnonymousId(this.defaults.anonymous_id);
    } else {
      this.set('anonymous_id', localStorage['lscp.idevxxi.current_subject_id']);
    }

  },

  setAnonymousId: function(id){
    this.set('anonymous_id', id);
    localStorage['lscp.idevxxi.current_subject_id'] = id;
  }

});