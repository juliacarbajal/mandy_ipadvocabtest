LSCP.Model.Subject = Backbone.AssociatedModel.extend({

  defaults: {
    anonymous_id: '0'
  },

	initialize: function(){

    if (!('lscp.idevxxi.current_subject_id' in localStorage)) {
      localStorage['lscp.idevxxi.current_subject_id'] = this.get('anonymous_id');
    }

    this.set('anonymous_id', localStorage['lscp.idevxxi.current_subject_id']);

    this.on('change:anonymous_id', this.onChangeAnonymousId);

  },

  onChangeAnonymousId: function(subject, id){
    localStorage['lscp.idevxxi.current_subject_id'] = id;
  }

});