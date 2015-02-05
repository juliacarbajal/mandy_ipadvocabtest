/* The Data Access Object (DAO) ----------------------------------------------------
This class functions as an access point to the database.  In the constructor, it accept a function returned from persistence.define which define a schema and how to access the table created from the schema. In our case, it is stuff notes. The Backbone.sync function that we override called the DAO object to create, read, update and delete record in the table associate with our Backbone.Models. */

var DAO = function() {
  this.db = persistence;
};

_.extend(DAO.prototype, {

  // Fetches all the records in our table and returns the results to the callback function
  findAll: function(model) {
    console.log("DAO findAll models");
    var deferred = $.Deferred();

    var all = model.persistableEntity.all();

    all.list(function(results){
      deferred.resolve(results);
    });

    return deferred;
  },

  // Count all the records in our table and returns the number to the callback function
  count: function(model) {
    console.log("DAO count models");
    var deferred = $.Deferred();

    var all = model.persistableEntity.all();

    all.count(function(results){
      deferred.resolve(results);
    });

    return deferred;
  },

  //Gets a record based on the id, returns the results to the callback function
  findById: function(model, id) {
    console.log("DAO findById", id);
    var deferred = $.Deferred();

    model.persistableEntity.load(id, _.bind(function(persisted_model) {
      console.log(persisted_model);
      deferred.resolve(persisted_model);
    }, this));

    return deferred;
  },

  // Gets a record based on a field, returns the results to the callback function
//  findBy: function(property, value, callback) {
//    console.log("getting a model information by the property '"+property+"' with value "+value);
//    if (typeof property === 'undefined') return;
//    if (typeof value === 'undefined') return;
//
//    this.db.findBy(property, value, callback(results));
//
//    // TODO
//  },

  // Creates a new record in the table based on the passed Model
  create: function(models) {
    console.log("DAO create models", models);
    var globalDeferred = $.Deferred();
    var deferreds = [];
    var ids = [];

    if (!(models instanceof Array)) {
      models = [models];
    }

    _.each(models, function(model){

      var deferred = $.Deferred();
      deferreds.push(deferred);

      var persisted_model = model.persistable();
      this.db.add(persisted_model);

      this.db.flush(function(){
        ids.push(persisted_model.id);
        deferred.resolve();
      });

    }, this);

    $.when.apply($, deferreds).then(function(){
      globalDeferred.resolve(ids);
    });

    return globalDeferred;
  },

  // Update a record in the table identified by the model's id
  update: function (models, attributes_to_update) {
    console.log("DAO update models", models, attributes_to_update);
    var globalDeferred = $.Deferred();
    var deferreds = [];

    if (!(models instanceof Array)) {
      models = [models];
    }

    _.each(models, function(model){
      var deferred = $.Deferred();
      deferreds.push(deferred);

      var id = model.id;
      model.persistableEntity.load(id, _.bind(function(persisted_model) {
        _.each(attributes_to_update, function(attr){
          persisted_model[attr] = model.get(attr);
        });
      }, this));

      this.db.flush(function(){
        deferred.resolve();
      });

    }, this);

    $.when.apply($, deferreds).then(function(){
      globalDeferred.resolve();
    });

    return globalDeferred;
  },

  //Removes a record from the table identified by the model's id
  delete: function (models) {
    console.log("DAO delete model");
    var globalDeferred = $.Deferred();
    var deferreds = [];

    if (!(models instanceof Array)) {
      models = [models];
    }

    _.each(models, function(model){
      var deferred = $.Deferred();
      deferreds.push(deferred);

      var id = model.id;
      model.persistableEntity.load(id, _.bind(function(persisted_model) {
        this.db.remove(persisted_model);
        this.db.flush(function(){
          deferred.resolve();
        });
      }, this));

    }, this);

    return globalDeferred;
  }

});
