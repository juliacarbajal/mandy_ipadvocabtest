LSCP.Model.Level = Backbone.AssociatedModel.extend({

    defaults: {
        name: "Untitled level",
        background: null,
        reward: null,
        introduce_objects: true,
        feedback: true,
        on_failure: null,
        stages: []
    },

    relations: [
        {
            type: Backbone.Many,
            key: 'stages',
            collectionType: 'LSCP.Collection.StageCollection'
        }
    ],
	
	initialize: function(){
//        console.log('LSCP.Model.Level.initialize');
    },

  persistable_attributes: function(){
    var attr = _.pick(this.attributes, ['name', 'background', 'introduce_objects', 'feedback', 'on_failure']);
    attr.stages = this.get('stages').dump();
    return attr;
  }



});