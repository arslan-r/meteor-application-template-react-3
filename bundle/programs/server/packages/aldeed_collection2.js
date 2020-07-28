(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var EJSON = Package.ejson.EJSON;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Collection2;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:collection2":{"collection2.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/aldeed_collection2/collection2.js                                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EventEmitter;
module.link("meteor/raix:eventemitter", {
  EventEmitter(v) {
    EventEmitter = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);
let checkNpmVersions;
module.link("meteor/tmeasday:check-npm-versions", {
  checkNpmVersions(v) {
    checkNpmVersions = v;
  }

}, 3);
let clone;
module.link("clone", {
  default(v) {
    clone = v;
  }

}, 4);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 5);
let isEmpty;
module.link("lodash.isempty", {
  default(v) {
    isEmpty = v;
  }

}, 6);
let isEqual;
module.link("lodash.isequal", {
  default(v) {
    isEqual = v;
  }

}, 7);
let isObject;
module.link("lodash.isobject", {
  default(v) {
    isObject = v;
  }

}, 8);
let flattenSelector;
module.link("./lib", {
  flattenSelector(v) {
    flattenSelector = v;
  }

}, 9);
checkNpmVersions({
  'simpl-schema': '>=0.0.0'
}, 'aldeed:collection2');

const SimpleSchema = require('simpl-schema').default; // Exported only for listening to events


const Collection2 = new EventEmitter();
const defaultCleanOptions = {
  filter: true,
  autoConvert: true,
  removeEmptyStrings: true,
  trimStrings: true,
  removeNullsFromArrays: false
};
/**
 * Mongo.Collection.prototype.attachSchema
 * @param {SimpleSchema|Object} ss - SimpleSchema instance or a schema definition object
 *    from which to create a new SimpleSchema instance
 * @param {Object} [options]
 * @param {Boolean} [options.transform=false] Set to `true` if your document must be passed
 *    through the collection's transform to properly validate.
 * @param {Boolean} [options.replace=false] Set to `true` to replace any existing schema instead of combining
 * @return {undefined}
 *
 * Use this method to attach a schema to a collection created by another package,
 * such as Meteor.users. It is most likely unsafe to call this method more than
 * once for a single collection, or to call this for a collection that had a
 * schema object passed to its constructor.
 */

Mongo.Collection.prototype.attachSchema = function c2AttachSchema(ss, options) {
  options = options || {}; // Allow passing just the schema object

  if (!SimpleSchema.isSimpleSchema(ss)) {
    ss = new SimpleSchema(ss);
  }

  this._c2 = this._c2 || {}; // If we've already attached one schema, we combine both into a new schema unless options.replace is `true`

  if (this._c2._simpleSchema && options.replace !== true) {
    if (ss.version >= 2) {
      var newSS = new SimpleSchema(this._c2._simpleSchema);
      newSS.extend(ss);
      ss = newSS;
    } else {
      ss = new SimpleSchema([this._c2._simpleSchema, ss]);
    }
  }

  var selector = options.selector;

  function attachTo(obj) {
    if (typeof selector === "object") {
      // Index of existing schema with identical selector
      var schemaIndex = -1; // we need an array to hold multiple schemas

      obj._c2._simpleSchemas = obj._c2._simpleSchemas || []; // Loop through existing schemas with selectors

      obj._c2._simpleSchemas.forEach((schema, index) => {
        // if we find a schema with an identical selector, save it's index
        if (isEqual(schema.selector, selector)) {
          schemaIndex = index;
        }
      });

      if (schemaIndex === -1) {
        // We didn't find the schema in our array - push it into the array
        obj._c2._simpleSchemas.push({
          schema: SimpleSchema.isSimpleSchema(ss) ? ss : new SimpleSchema(ss),
          selector: selector
        });
      } else {
        // We found a schema with an identical selector in our array,
        if (options.replace !== true) {
          // Merge with existing schema unless options.replace is `true`
          if (obj._c2._simpleSchemas[schemaIndex].schema.version >= 2) {
            obj._c2._simpleSchemas[schemaIndex].schema.extend(ss);
          } else {
            obj._c2._simpleSchemas[schemaIndex].schema = new SimpleSchema([obj._c2._simpleSchemas[schemaIndex].schema, ss]);
          }
        } else {
          // If options.replace is `true` replace existing schema with new schema
          obj._c2._simpleSchemas[schemaIndex].schema = ss;
        }
      } // Remove existing schemas without selector


      delete obj._c2._simpleSchema;
    } else {
      // Track the schema in the collection
      obj._c2._simpleSchema = ss; // Remove existing schemas with selector

      delete obj._c2._simpleSchemas;
    }
  }

  attachTo(this); // Attach the schema to the underlying LocalCollection, too

  if (this._collection instanceof LocalCollection) {
    this._collection._c2 = this._collection._c2 || {};
    attachTo(this._collection);
  }

  defineDeny(this, options);
  keepInsecure(this);
  Collection2.emit('schema.attached', this, ss, options);
};

[Mongo.Collection, LocalCollection].forEach(obj => {
  /**
   * simpleSchema
   * @description function detect the correct schema by given params. If it
   * detect multi-schema presence in the collection, then it made an attempt to find a
   * `selector` in args
   * @param {Object} doc - It could be <update> on update/upsert or document
   * itself on insert/remove
   * @param {Object} [options] - It could be <update> on update/upsert etc
   * @param {Object} [query] - it could be <query> on update/upsert
   * @return {Object} Schema
   */
  obj.prototype.simpleSchema = function (doc, options, query) {
    if (!this._c2) return null;
    if (this._c2._simpleSchema) return this._c2._simpleSchema;
    var schemas = this._c2._simpleSchemas;

    if (schemas && schemas.length > 0) {
      if (!doc) throw new Error('collection.simpleSchema() requires doc argument when there are multiple schemas');
      var schema, selector, target;

      for (var i = 0; i < schemas.length; i++) {
        schema = schemas[i];
        selector = Object.keys(schema.selector)[0]; // We will set this to undefined because in theory you might want to select
        // on a null value.

        target = undefined; // here we are looking for selector in different places
        // $set should have more priority here

        if (doc.$set && typeof doc.$set[selector] !== 'undefined') {
          target = doc.$set[selector];
        } else if (typeof doc[selector] !== 'undefined') {
          target = doc[selector];
        } else if (options && options.selector) {
          target = options.selector[selector];
        } else if (query && query[selector]) {
          // on upsert/update operations
          target = query[selector];
        } // we need to compare given selector with doc property or option to
        // find right schema


        if (target !== undefined && target === schema.selector[selector]) {
          return schema.schema;
        }
      }
    }

    return null;
  };
}); // Wrap DB write operation methods

['insert', 'update'].forEach(methodName => {
  const _super = Mongo.Collection.prototype[methodName];

  Mongo.Collection.prototype[methodName] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    let options = methodName === "insert" ? args[1] : args[2]; // Support missing options arg

    if (!options || typeof options === "function") {
      options = {};
    }

    if (this._c2 && options.bypassCollection2 !== true) {
      var userId = null;

      try {
        // https://github.com/aldeed/meteor-collection2/issues/175
        userId = Meteor.userId();
      } catch (err) {}

      args = doValidate(this, methodName, args, Meteor.isServer || this._connection === null, // getAutoValues
      userId, Meteor.isServer // isFromTrustedCode
      );

      if (!args) {
        // doValidate already called the callback or threw the error so we're done.
        // But insert should always return an ID to match core behavior.
        return methodName === "insert" ? this._makeNewID() : undefined;
      }
    } else {
      // We still need to adjust args because insert does not take options
      if (methodName === "insert" && typeof args[1] !== 'function') args.splice(1, 1);
    }

    return _super.apply(this, args);
  };
});
/*
 * Private
 */

function doValidate(collection, type, args, getAutoValues, userId, isFromTrustedCode) {
  var doc, callback, error, options, isUpsert, selector, last, hasCallback;

  if (!args.length) {
    throw new Error(type + " requires an argument");
  } // Gather arguments and cache the selector


  if (type === "insert") {
    doc = args[0];
    options = args[1];
    callback = args[2]; // The real insert doesn't take options

    if (typeof options === "function") {
      args = [doc, options];
    } else if (typeof callback === "function") {
      args = [doc, callback];
    } else {
      args = [doc];
    }
  } else if (type === "update") {
    selector = args[0];
    doc = args[1];
    options = args[2];
    callback = args[3];
  } else {
    throw new Error("invalid type argument");
  }

  var validatedObjectWasInitiallyEmpty = isEmpty(doc); // Support missing options arg

  if (!callback && typeof options === "function") {
    callback = options;
    options = {};
  }

  options = options || {};
  last = args.length - 1;
  hasCallback = typeof args[last] === 'function'; // If update was called with upsert:true, flag as an upsert

  isUpsert = type === "update" && options.upsert === true; // we need to pass `doc` and `options` to `simpleSchema` method, that's why
  // schema declaration moved here

  var schema = collection.simpleSchema(doc, options, selector);
  var isLocalCollection = collection._connection === null; // On the server and for local collections, we allow passing `getAutoValues: false` to disable autoValue functions

  if ((Meteor.isServer || isLocalCollection) && options.getAutoValues === false) {
    getAutoValues = false;
  } // Determine validation context


  var validationContext = options.validationContext;

  if (validationContext) {
    if (typeof validationContext === 'string') {
      validationContext = schema.namedContext(validationContext);
    }
  } else {
    validationContext = schema.namedContext();
  } // Add a default callback function if we're on the client and no callback was given


  if (Meteor.isClient && !callback) {
    // Client can't block, so it can't report errors by exception,
    // only by callback. If they forget the callback, give them a
    // default one that logs the error, so they aren't totally
    // baffled if their writes don't work because their database is
    // down.
    callback = function (err) {
      if (err) {
        Meteor._debug(type + " failed: " + (err.reason || err.stack));
      }
    };
  } // If client validation is fine or is skipped but then something
  // is found to be invalid on the server, we get that error back
  // as a special Meteor.Error that we need to parse.


  if (Meteor.isClient && hasCallback) {
    callback = args[last] = wrapCallbackForParsingServerErrors(validationContext, callback);
  }

  var schemaAllowsId = schema.allowsKey("_id");

  if (type === "insert" && !doc._id && schemaAllowsId) {
    doc._id = collection._makeNewID();
  } // Get the docId for passing in the autoValue/custom context


  var docId;

  if (type === 'insert') {
    docId = doc._id; // might be undefined
  } else if (type === "update" && selector) {
    docId = typeof selector === 'string' || selector instanceof Mongo.ObjectID ? selector : selector._id;
  } // If _id has already been added, remove it temporarily if it's
  // not explicitly defined in the schema.


  var cachedId;

  if (doc._id && !schemaAllowsId) {
    cachedId = doc._id;
    delete doc._id;
  }

  const autoValueContext = {
    isInsert: type === "insert",
    isUpdate: type === "update" && options.upsert !== true,
    isUpsert,
    userId,
    isFromTrustedCode,
    docId,
    isLocalCollection
  };

  const extendAutoValueContext = _objectSpread({}, (schema._cleanOptions || {}).extendAutoValueContext || {}, {}, autoValueContext, {}, options.extendAutoValueContext);

  const cleanOptionsForThisOperation = {};
  ["autoConvert", "filter", "removeEmptyStrings", "removeNullsFromArrays", "trimStrings"].forEach(prop => {
    if (typeof options[prop] === "boolean") {
      cleanOptionsForThisOperation[prop] = options[prop];
    }
  }); // Preliminary cleaning on both client and server. On the server and for local
  // collections, automatic values will also be set at this point.

  schema.clean(doc, _objectSpread({
    mutate: true,
    // Clean the doc/modifier in place
    isModifier: type !== "insert"
  }, defaultCleanOptions, {}, schema._cleanOptions || {}, {}, cleanOptionsForThisOperation, {
    extendAutoValueContext,
    // This was extended separately above
    getAutoValues // Force this override

  })); // We clone before validating because in some cases we need to adjust the
  // object a bit before validating it. If we adjusted `doc` itself, our
  // changes would persist into the database.

  var docToValidate = {};

  for (var prop in doc) {
    // We omit prototype properties when cloning because they will not be valid
    // and mongo omits them when saving to the database anyway.
    if (Object.prototype.hasOwnProperty.call(doc, prop)) {
      docToValidate[prop] = doc[prop];
    }
  } // On the server, upserts are possible; SimpleSchema handles upserts pretty
  // well by default, but it will not know about the fields in the selector,
  // which are also stored in the database if an insert is performed. So we
  // will allow these fields to be considered for validation by adding them
  // to the $set in the modifier, while stripping out query selectors as these
  // don't make it into the upserted document and break validation. 
  // This is no doubt prone to errors, but there probably isn't any better way
  // right now.


  if (Meteor.isServer && isUpsert && isObject(selector)) {
    var set = docToValidate.$set || {};
    docToValidate.$set = flattenSelector(selector);
    if (!schemaAllowsId) delete docToValidate.$set._id;
    Object.assign(docToValidate.$set, set);
  } // Set automatic values for validation on the client.
  // On the server, we already updated doc with auto values, but on the client,
  // we will add them to docToValidate for validation purposes only.
  // This is because we want all actual values generated on the server.


  if (Meteor.isClient && !isLocalCollection) {
    schema.clean(docToValidate, {
      autoConvert: false,
      extendAutoValueContext,
      filter: false,
      getAutoValues: true,
      isModifier: type !== "insert",
      mutate: true,
      // Clean the doc/modifier in place
      removeEmptyStrings: false,
      removeNullsFromArrays: false,
      trimStrings: false
    });
  } // XXX Maybe move this into SimpleSchema


  if (!validatedObjectWasInitiallyEmpty && isEmpty(docToValidate)) {
    throw new Error('After filtering out keys not in the schema, your ' + (type === 'update' ? 'modifier' : 'object') + ' is now empty');
  } // Validate doc


  var isValid;

  if (options.validate === false) {
    isValid = true;
  } else {
    isValid = validationContext.validate(docToValidate, {
      modifier: type === "update" || type === "upsert",
      upsert: isUpsert,
      extendedCustomContext: _objectSpread({
        isInsert: type === "insert",
        isUpdate: type === "update" && options.upsert !== true,
        isUpsert,
        userId,
        isFromTrustedCode,
        docId,
        isLocalCollection
      }, options.extendedCustomContext || {})
    });
  }

  if (isValid) {
    // Add the ID back
    if (cachedId) {
      doc._id = cachedId;
    } // Update the args to reflect the cleaned doc
    // XXX not sure this is necessary since we mutate


    if (type === "insert") {
      args[0] = doc;
    } else {
      args[1] = doc;
    } // If callback, set invalidKey when we get a mongo unique error


    if (Meteor.isServer && hasCallback) {
      args[last] = wrapCallbackForParsingMongoValidationErrors(validationContext, args[last]);
    }

    return args;
  } else {
    error = getErrorObject(validationContext, "in ".concat(collection._name, " ").concat(type));

    if (callback) {
      // insert/update/upsert pass `false` when there's an error, so we do that
      callback(error, false);
    } else {
      throw error;
    }
  }
}

function getErrorObject(context) {
  let appendToMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let message;
  const invalidKeys = typeof context.validationErrors === 'function' ? context.validationErrors() : context.invalidKeys();

  if (invalidKeys.length) {
    const firstErrorKey = invalidKeys[0].name;
    const firstErrorMessage = context.keyErrorMessage(firstErrorKey); // If the error is in a nested key, add the full key to the error message
    // to be more helpful.

    if (firstErrorKey.indexOf('.') === -1) {
      message = firstErrorMessage;
    } else {
      message = "".concat(firstErrorMessage, " (").concat(firstErrorKey, ")");
    }
  } else {
    message = "Failed validation";
  }

  message = "".concat(message, " ").concat(appendToMessage).trim();
  const error = new Error(message);
  error.invalidKeys = invalidKeys;
  error.validationContext = context; // If on the server, we add a sanitized error, too, in case we're
  // called from a method.

  if (Meteor.isServer) {
    error.sanitizedError = new Meteor.Error(400, message, EJSON.stringify(error.invalidKeys));
  }

  return error;
}

function addUniqueError(context, errorMessage) {
  var name = errorMessage.split('c2_')[1].split(' ')[0];
  var val = errorMessage.split('dup key:')[1].split('"')[1];
  var addValidationErrorsPropName = typeof context.addValidationErrors === 'function' ? 'addValidationErrors' : 'addInvalidKeys';
  context[addValidationErrorsPropName]([{
    name: name,
    type: 'notUnique',
    value: val
  }]);
}

function wrapCallbackForParsingMongoValidationErrors(validationContext, cb) {
  return function wrappedCallbackForParsingMongoValidationErrors() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    const error = args[0];

    if (error && (error.name === "MongoError" && error.code === 11001 || error.message.indexOf('MongoError: E11000' !== -1)) && error.message.indexOf('c2_') !== -1) {
      addUniqueError(validationContext, error.message);
      args[0] = getErrorObject(validationContext);
    }

    return cb.apply(this, args);
  };
}

function wrapCallbackForParsingServerErrors(validationContext, cb) {
  var addValidationErrorsPropName = typeof validationContext.addValidationErrors === 'function' ? 'addValidationErrors' : 'addInvalidKeys';
  return function wrappedCallbackForParsingServerErrors() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const error = args[0]; // Handle our own validation errors

    if (error instanceof Meteor.Error && error.error === 400 && error.reason === "INVALID" && typeof error.details === "string") {
      var invalidKeysFromServer = EJSON.parse(error.details);
      validationContext[addValidationErrorsPropName](invalidKeysFromServer);
      args[0] = getErrorObject(validationContext);
    } // Handle Mongo unique index errors, which are forwarded to the client as 409 errors
    else if (error instanceof Meteor.Error && error.error === 409 && error.reason && error.reason.indexOf('E11000') !== -1 && error.reason.indexOf('c2_') !== -1) {
        addUniqueError(validationContext, error.reason);
        args[0] = getErrorObject(validationContext);
      }

    return cb.apply(this, args);
  };
}

var alreadyInsecure = {};

function keepInsecure(c) {
  // If insecure package is in use, we need to add allow rules that return
  // true. Otherwise, it would seemingly turn off insecure mode.
  if (Package && Package.insecure && !alreadyInsecure[c._name]) {
    c.allow({
      insert: function () {
        return true;
      },
      update: function () {
        return true;
      },
      remove: function () {
        return true;
      },
      fetch: [],
      transform: null
    });
    alreadyInsecure[c._name] = true;
  } // If insecure package is NOT in use, then adding the two deny functions
  // does not have any effect on the main app's security paradigm. The
  // user will still be required to add at least one allow function of her
  // own for each operation for this collection. And the user may still add
  // additional deny functions, but does not have to.

}

var alreadyDefined = {};

function defineDeny(c, options) {
  if (!alreadyDefined[c._name]) {
    var isLocalCollection = c._connection === null; // First define deny functions to extend doc with the results of clean
    // and auto-values. This must be done with "transform: null" or we would be
    // extending a clone of doc and therefore have no effect.

    c.deny({
      insert: function (userId, doc) {
        // Referenced doc is cleaned in place
        c.simpleSchema(doc).clean(doc, {
          mutate: true,
          isModifier: false,
          // We don't do these here because they are done on the client if desired
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          trimStrings: false,
          extendAutoValueContext: {
            isInsert: true,
            isUpdate: false,
            isUpsert: false,
            userId: userId,
            isFromTrustedCode: false,
            docId: doc._id,
            isLocalCollection: isLocalCollection
          }
        });
        return false;
      },
      update: function (userId, doc, fields, modifier) {
        // Referenced modifier is cleaned in place
        c.simpleSchema(modifier).clean(modifier, {
          mutate: true,
          isModifier: true,
          // We don't do these here because they are done on the client if desired
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          trimStrings: false,
          extendAutoValueContext: {
            isInsert: false,
            isUpdate: true,
            isUpsert: false,
            userId: userId,
            isFromTrustedCode: false,
            docId: doc && doc._id,
            isLocalCollection: isLocalCollection
          }
        });
        return false;
      },
      fetch: ['_id'],
      transform: null
    }); // Second define deny functions to validate again on the server
    // for client-initiated inserts and updates. These should be
    // called after the clean/auto-value functions since we're adding
    // them after. These must *not* have "transform: null" if options.transform is true because
    // we need to pass the doc through any transforms to be sure
    // that custom types are properly recognized for type validation.

    c.deny(_objectSpread({
      insert: function (userId, doc) {
        // We pass the false options because we will have done them on client if desired
        doValidate(c, "insert", [doc, {
          trimStrings: false,
          removeEmptyStrings: false,
          filter: false,
          autoConvert: false
        }, function (error) {
          if (error) {
            throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));
          }
        }], false, // getAutoValues
        userId, false // isFromTrustedCode
        );
        return false;
      },
      update: function (userId, doc, fields, modifier) {
        // NOTE: This will never be an upsert because client-side upserts
        // are not allowed once you define allow/deny functions.
        // We pass the false options because we will have done them on client if desired
        doValidate(c, "update", [{
          _id: doc && doc._id
        }, modifier, {
          trimStrings: false,
          removeEmptyStrings: false,
          filter: false,
          autoConvert: false
        }, function (error) {
          if (error) {
            throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));
          }
        }], false, // getAutoValues
        userId, false // isFromTrustedCode
        );
        return false;
      },
      fetch: ['_id']
    }, options.transform === true ? {} : {
      transform: null
    })); // note that we've already done this collection so that we don't do it again
    // if attachSchema is called again

    alreadyDefined[c._name] = true;
  }
}

module.exportDefault(Collection2);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/aldeed_collection2/lib.js                                                                               //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.export({
  flattenSelector: () => flattenSelector
});

function flattenSelector(selector) {
  // If selector uses $and format, convert to plain object selector
  if (Array.isArray(selector.$and)) {
    selector.$and.forEach(sel => {
      Object.assign(selector, flattenSelector(sel));
    });
    delete selector.$and;
  }

  const obj = {};
  Object.entries(selector).forEach((_ref) => {
    let [key, value] = _ref;

    // Ignoring logical selectors (https://docs.mongodb.com/manual/reference/operator/query/#logical)
    if (!key.startsWith("$")) {
      if (typeof value === 'object' && value !== null) {
        if (value.$eq !== undefined) {
          obj[key] = value.$eq;
        } else if (Array.isArray(value.$in) && value.$in.length === 1) {
          obj[key] = value.$in[0];
        } else if (Object.keys(value).every(v => !(typeof v === "string" && v.startsWith("$")))) {
          obj[key] = value;
        }
      } else {
        obj[key] = value;
      }
    }
  });
  return obj;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"clone":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/clone/package.json                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "clone",
  "version": "2.1.1",
  "main": "clone.js"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"clone.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/clone/clone.js                                               //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isempty":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isempty/package.json                                  //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isempty/index.js                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isequal":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isequal/package.json                                  //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "lodash.isequal",
  "version": "4.5.0"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isequal/index.js                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isobject/package.json                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isobject/index.js                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/aldeed:collection2/collection2.js");

/* Exports */
Package._define("aldeed:collection2", exports, {
  Collection2: Collection2
});

})();

//# sourceURL=meteor://💻app/packages/aldeed_collection2.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOmNvbGxlY3Rpb24yL2NvbGxlY3Rpb24yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6Y29sbGVjdGlvbjIvbGliLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJFdmVudEVtaXR0ZXIiLCJNZXRlb3IiLCJNb25nbyIsImNoZWNrTnBtVmVyc2lvbnMiLCJjbG9uZSIsIkVKU09OIiwiaXNFbXB0eSIsImlzRXF1YWwiLCJpc09iamVjdCIsImZsYXR0ZW5TZWxlY3RvciIsIlNpbXBsZVNjaGVtYSIsInJlcXVpcmUiLCJDb2xsZWN0aW9uMiIsImRlZmF1bHRDbGVhbk9wdGlvbnMiLCJmaWx0ZXIiLCJhdXRvQ29udmVydCIsInJlbW92ZUVtcHR5U3RyaW5ncyIsInRyaW1TdHJpbmdzIiwicmVtb3ZlTnVsbHNGcm9tQXJyYXlzIiwiQ29sbGVjdGlvbiIsInByb3RvdHlwZSIsImF0dGFjaFNjaGVtYSIsImMyQXR0YWNoU2NoZW1hIiwic3MiLCJvcHRpb25zIiwiaXNTaW1wbGVTY2hlbWEiLCJfYzIiLCJfc2ltcGxlU2NoZW1hIiwicmVwbGFjZSIsInZlcnNpb24iLCJuZXdTUyIsImV4dGVuZCIsInNlbGVjdG9yIiwiYXR0YWNoVG8iLCJvYmoiLCJzY2hlbWFJbmRleCIsIl9zaW1wbGVTY2hlbWFzIiwiZm9yRWFjaCIsInNjaGVtYSIsImluZGV4IiwicHVzaCIsIl9jb2xsZWN0aW9uIiwiTG9jYWxDb2xsZWN0aW9uIiwiZGVmaW5lRGVueSIsImtlZXBJbnNlY3VyZSIsImVtaXQiLCJzaW1wbGVTY2hlbWEiLCJkb2MiLCJxdWVyeSIsInNjaGVtYXMiLCJsZW5ndGgiLCJFcnJvciIsInRhcmdldCIsImkiLCJPYmplY3QiLCJrZXlzIiwidW5kZWZpbmVkIiwiJHNldCIsIm1ldGhvZE5hbWUiLCJfc3VwZXIiLCJhcmdzIiwiYnlwYXNzQ29sbGVjdGlvbjIiLCJ1c2VySWQiLCJlcnIiLCJkb1ZhbGlkYXRlIiwiaXNTZXJ2ZXIiLCJfY29ubmVjdGlvbiIsIl9tYWtlTmV3SUQiLCJzcGxpY2UiLCJhcHBseSIsImNvbGxlY3Rpb24iLCJ0eXBlIiwiZ2V0QXV0b1ZhbHVlcyIsImlzRnJvbVRydXN0ZWRDb2RlIiwiY2FsbGJhY2siLCJlcnJvciIsImlzVXBzZXJ0IiwibGFzdCIsImhhc0NhbGxiYWNrIiwidmFsaWRhdGVkT2JqZWN0V2FzSW5pdGlhbGx5RW1wdHkiLCJ1cHNlcnQiLCJpc0xvY2FsQ29sbGVjdGlvbiIsInZhbGlkYXRpb25Db250ZXh0IiwibmFtZWRDb250ZXh0IiwiaXNDbGllbnQiLCJfZGVidWciLCJyZWFzb24iLCJzdGFjayIsIndyYXBDYWxsYmFja0ZvclBhcnNpbmdTZXJ2ZXJFcnJvcnMiLCJzY2hlbWFBbGxvd3NJZCIsImFsbG93c0tleSIsIl9pZCIsImRvY0lkIiwiT2JqZWN0SUQiLCJjYWNoZWRJZCIsImF1dG9WYWx1ZUNvbnRleHQiLCJpc0luc2VydCIsImlzVXBkYXRlIiwiZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCIsIl9jbGVhbk9wdGlvbnMiLCJjbGVhbk9wdGlvbnNGb3JUaGlzT3BlcmF0aW9uIiwicHJvcCIsImNsZWFuIiwibXV0YXRlIiwiaXNNb2RpZmllciIsImRvY1RvVmFsaWRhdGUiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJzZXQiLCJhc3NpZ24iLCJpc1ZhbGlkIiwidmFsaWRhdGUiLCJtb2RpZmllciIsImV4dGVuZGVkQ3VzdG9tQ29udGV4dCIsIndyYXBDYWxsYmFja0ZvclBhcnNpbmdNb25nb1ZhbGlkYXRpb25FcnJvcnMiLCJnZXRFcnJvck9iamVjdCIsIl9uYW1lIiwiY29udGV4dCIsImFwcGVuZFRvTWVzc2FnZSIsIm1lc3NhZ2UiLCJpbnZhbGlkS2V5cyIsInZhbGlkYXRpb25FcnJvcnMiLCJmaXJzdEVycm9yS2V5IiwibmFtZSIsImZpcnN0RXJyb3JNZXNzYWdlIiwia2V5RXJyb3JNZXNzYWdlIiwiaW5kZXhPZiIsInRyaW0iLCJzYW5pdGl6ZWRFcnJvciIsInN0cmluZ2lmeSIsImFkZFVuaXF1ZUVycm9yIiwiZXJyb3JNZXNzYWdlIiwic3BsaXQiLCJ2YWwiLCJhZGRWYWxpZGF0aW9uRXJyb3JzUHJvcE5hbWUiLCJhZGRWYWxpZGF0aW9uRXJyb3JzIiwidmFsdWUiLCJjYiIsIndyYXBwZWRDYWxsYmFja0ZvclBhcnNpbmdNb25nb1ZhbGlkYXRpb25FcnJvcnMiLCJjb2RlIiwid3JhcHBlZENhbGxiYWNrRm9yUGFyc2luZ1NlcnZlckVycm9ycyIsImRldGFpbHMiLCJpbnZhbGlkS2V5c0Zyb21TZXJ2ZXIiLCJwYXJzZSIsImFscmVhZHlJbnNlY3VyZSIsImMiLCJQYWNrYWdlIiwiaW5zZWN1cmUiLCJhbGxvdyIsImluc2VydCIsInVwZGF0ZSIsInJlbW92ZSIsImZldGNoIiwidHJhbnNmb3JtIiwiYWxyZWFkeURlZmluZWQiLCJkZW55IiwiZmllbGRzIiwiZXhwb3J0RGVmYXVsdCIsImV4cG9ydCIsIkFycmF5IiwiaXNBcnJheSIsIiRhbmQiLCJzZWwiLCJlbnRyaWVzIiwia2V5Iiwic3RhcnRzV2l0aCIsIiRlcSIsIiRpbiIsImV2ZXJ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxhQUFKOztBQUFrQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksc0NBQVosRUFBbUQ7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osaUJBQWEsR0FBQ0ksQ0FBZDtBQUFnQjs7QUFBNUIsQ0FBbkQsRUFBaUYsQ0FBakY7QUFBbEIsSUFBSUMsWUFBSjtBQUFpQkosTUFBTSxDQUFDQyxJQUFQLENBQVksMEJBQVosRUFBdUM7QUFBQ0csY0FBWSxDQUFDRCxDQUFELEVBQUc7QUFBQ0MsZ0JBQVksR0FBQ0QsQ0FBYjtBQUFlOztBQUFoQyxDQUF2QyxFQUF5RSxDQUF6RTtBQUE0RSxJQUFJRSxNQUFKO0FBQVdMLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGVB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QUksRUFBRSxPQUFPQSxDQUFQLEtBQWEsUUFBYixJQUF5QkEsQ0FBQyxDQUFDc0ssVUFBRixDQUFhLEdBQWIsQ0FBM0IsQ0FBOUIsQ0FBSixFQUFrRjtBQUN2Rm5JLGFBQUcsQ0FBQ2tJLEdBQUQsQ0FBSCxHQUFXNUIsS0FBWDtBQUNEO0FBQ0YsT0FSRCxNQVFPO0FBQ0x0RyxXQUFHLENBQUNrSSxHQUFELENBQUgsR0FBVzVCLEtBQVg7QUFDRDtBQUNGO0FBQ0YsR0FmRDtBQWlCQSxTQUFPdEcsR0FBUDtBQUNELEMiLCJmaWxlIjoiL3BhY2thZ2VzL2FsZGVlZF9jb2xsZWN0aW9uMi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ21ldGVvci9yYWl4OmV2ZW50ZW1pdHRlcic7XG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcbmltcG9ydCB7IGNoZWNrTnBtVmVyc2lvbnMgfSBmcm9tICdtZXRlb3IvdG1lYXNkYXk6Y2hlY2stbnBtLXZlcnNpb25zJztcbmltcG9ydCBjbG9uZSBmcm9tICdjbG9uZSc7XG5pbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbic7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2guaXNlcXVhbCc7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoLmlzb2JqZWN0JztcbmltcG9ydCB7IGZsYXR0ZW5TZWxlY3RvciB9IGZyb20gJy4vbGliJztcblxuY2hlY2tOcG1WZXJzaW9ucyh7ICdzaW1wbC1zY2hlbWEnOiAnPj0wLjAuMCcgfSwgJ2FsZGVlZDpjb2xsZWN0aW9uMicpO1xuXG5jb25zdCBTaW1wbGVTY2hlbWEgPSByZXF1aXJlKCdzaW1wbC1zY2hlbWEnKS5kZWZhdWx0O1xuXG4vLyBFeHBvcnRlZCBvbmx5IGZvciBsaXN0ZW5pbmcgdG8gZXZlbnRzXG5jb25zdCBDb2xsZWN0aW9uMiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuY29uc3QgZGVmYXVsdENsZWFuT3B0aW9ucyA9IHtcbiAgZmlsdGVyOiB0cnVlLFxuICBhdXRvQ29udmVydDogdHJ1ZSxcbiAgcmVtb3ZlRW1wdHlTdHJpbmdzOiB0cnVlLFxuICB0cmltU3RyaW5nczogdHJ1ZSxcbiAgcmVtb3ZlTnVsbHNGcm9tQXJyYXlzOiBmYWxzZSxcbn07XG5cbi8qKlxuICogTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUuYXR0YWNoU2NoZW1hXG4gKiBAcGFyYW0ge1NpbXBsZVNjaGVtYXxPYmplY3R9IHNzIC0gU2ltcGxlU2NoZW1hIGluc3RhbmNlIG9yIGEgc2NoZW1hIGRlZmluaXRpb24gb2JqZWN0XG4gKiAgICBmcm9tIHdoaWNoIHRvIGNyZWF0ZSBhIG5ldyBTaW1wbGVTY2hlbWEgaW5zdGFuY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMudHJhbnNmb3JtPWZhbHNlXSBTZXQgdG8gYHRydWVgIGlmIHlvdXIgZG9jdW1lbnQgbXVzdCBiZSBwYXNzZWRcbiAqICAgIHRocm91Z2ggdGhlIGNvbGxlY3Rpb24ncyB0cmFuc2Zvcm0gdG8gcHJvcGVybHkgdmFsaWRhdGUuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnJlcGxhY2U9ZmFsc2VdIFNldCB0byBgdHJ1ZWAgdG8gcmVwbGFjZSBhbnkgZXhpc3Rpbmcgc2NoZW1hIGluc3RlYWQgb2YgY29tYmluaW5nXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKlxuICogVXNlIHRoaXMgbWV0aG9kIHRvIGF0dGFjaCBhIHNjaGVtYSB0byBhIGNvbGxlY3Rpb24gY3JlYXRlZCBieSBhbm90aGVyIHBhY2thZ2UsXG4gKiBzdWNoIGFzIE1ldGVvci51c2Vycy4gSXQgaXMgbW9zdCBsaWtlbHkgdW5zYWZlIHRvIGNhbGwgdGhpcyBtZXRob2QgbW9yZSB0aGFuXG4gKiBvbmNlIGZvciBhIHNpbmdsZSBjb2xsZWN0aW9uLCBvciB0byBjYWxsIHRoaXMgZm9yIGEgY29sbGVjdGlvbiB0aGF0IGhhZCBhXG4gKiBzY2hlbWEgb2JqZWN0IHBhc3NlZCB0byBpdHMgY29uc3RydWN0b3IuXG4gKi9cbk1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLmF0dGFjaFNjaGVtYSA9IGZ1bmN0aW9uIGMyQXR0YWNoU2NoZW1hKHNzLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIC8vIEFsbG93IHBhc3NpbmcganVzdCB0aGUgc2NoZW1hIG9iamVjdFxuICBpZiAoIVNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYShzcykpIHtcbiAgICBzcyA9IG5ldyBTaW1wbGVTY2hlbWEoc3MpO1xuICB9XG5cbiAgdGhpcy5fYzIgPSB0aGlzLl9jMiB8fCB7fTtcblxuICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGF0dGFjaGVkIG9uZSBzY2hlbWEsIHdlIGNvbWJpbmUgYm90aCBpbnRvIGEgbmV3IHNjaGVtYSB1bmxlc3Mgb3B0aW9ucy5yZXBsYWNlIGlzIGB0cnVlYFxuICBpZiAodGhpcy5fYzIuX3NpbXBsZVNjaGVtYSAmJiBvcHRpb25zLnJlcGxhY2UgIT09IHRydWUpIHtcbiAgICBpZiAoc3MudmVyc2lvbiA+PSAyKSB7XG4gICAgICB2YXIgbmV3U1MgPSBuZXcgU2ltcGxlU2NoZW1hKHRoaXMuX2MyLl9zaW1wbGVTY2hlbWEpO1xuICAgICAgbmV3U1MuZXh0ZW5kKHNzKTtcbiAgICAgIHNzID0gbmV3U1M7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNzID0gbmV3IFNpbXBsZVNjaGVtYShbdGhpcy5fYzIuX3NpbXBsZVNjaGVtYSwgc3NdKTtcbiAgICB9XG4gIH1cblxuICB2YXIgc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yO1xuXG4gIGZ1bmN0aW9uIGF0dGFjaFRvKG9iaikge1xuICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIC8vIEluZGV4IG9mIGV4aXN0aW5nIHNjaGVtYSB3aXRoIGlkZW50aWNhbCBzZWxlY3RvclxuICAgICAgdmFyIHNjaGVtYUluZGV4ID0gLTE7XG5cbiAgICAgIC8vIHdlIG5lZWQgYW4gYXJyYXkgdG8gaG9sZCBtdWx0aXBsZSBzY2hlbWFzXG4gICAgICBvYmouX2MyLl9zaW1wbGVTY2hlbWFzID0gb2JqLl9jMi5fc2ltcGxlU2NoZW1hcyB8fCBbXTtcblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGV4aXN0aW5nIHNjaGVtYXMgd2l0aCBzZWxlY3RvcnNcbiAgICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXMuZm9yRWFjaCgoc2NoZW1hLCBpbmRleCkgPT4ge1xuICAgICAgICAvLyBpZiB3ZSBmaW5kIGEgc2NoZW1hIHdpdGggYW4gaWRlbnRpY2FsIHNlbGVjdG9yLCBzYXZlIGl0J3MgaW5kZXhcbiAgICAgICAgaWYoaXNFcXVhbChzY2hlbWEuc2VsZWN0b3IsIHNlbGVjdG9yKSkge1xuICAgICAgICAgIHNjaGVtYUluZGV4ID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKHNjaGVtYUluZGV4ID09PSAtMSkge1xuICAgICAgICAvLyBXZSBkaWRuJ3QgZmluZCB0aGUgc2NoZW1hIGluIG91ciBhcnJheSAtIHB1c2ggaXQgaW50byB0aGUgYXJyYXlcbiAgICAgICAgb2JqLl9jMi5fc2ltcGxlU2NoZW1hcy5wdXNoKHtcbiAgICAgICAgICBzY2hlbWE6IFNpbXBsZVNjaGVtYS5pc1NpbXBsZVNjaGVtYShzcykgPyBzcyA6IG5ldyBTaW1wbGVTY2hlbWEoc3MpLFxuICAgICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBmb3VuZCBhIHNjaGVtYSB3aXRoIGFuIGlkZW50aWNhbCBzZWxlY3RvciBpbiBvdXIgYXJyYXksXG4gICAgICAgIGlmIChvcHRpb25zLnJlcGxhY2UgIT09IHRydWUpIHtcbiAgICAgICAgICAvLyBNZXJnZSB3aXRoIGV4aXN0aW5nIHNjaGVtYSB1bmxlc3Mgb3B0aW9ucy5yZXBsYWNlIGlzIGB0cnVlYFxuICAgICAgICAgIGlmIChvYmouX2MyLl9zaW1wbGVTY2hlbWFzW3NjaGVtYUluZGV4XS5zY2hlbWEudmVyc2lvbiA+PSAyKSB7XG4gICAgICAgICAgICBvYmouX2MyLl9zaW1wbGVTY2hlbWFzW3NjaGVtYUluZGV4XS5zY2hlbWEuZXh0ZW5kKHNzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb2JqLl9jMi5fc2ltcGxlU2NoZW1hc1tzY2hlbWFJbmRleF0uc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYShbb2JqLl9jMi5fc2ltcGxlU2NoZW1hc1tzY2hlbWFJbmRleF0uc2NoZW1hLCBzc10pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBvcHRpb25zLnJlcGxhY2UgaXMgYHRydWVgIHJlcGxhY2UgZXhpc3Rpbmcgc2NoZW1hIHdpdGggbmV3IHNjaGVtYVxuICAgICAgICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXNbc2NoZW1hSW5kZXhdLnNjaGVtYSA9IHNzO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGV4aXN0aW5nIHNjaGVtYXMgd2l0aG91dCBzZWxlY3RvclxuICAgICAgZGVsZXRlIG9iai5fYzIuX3NpbXBsZVNjaGVtYTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVHJhY2sgdGhlIHNjaGVtYSBpbiB0aGUgY29sbGVjdGlvblxuICAgICAgb2JqLl9jMi5fc2ltcGxlU2NoZW1hID0gc3M7XG5cbiAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBzY2hlbWFzIHdpdGggc2VsZWN0b3JcbiAgICAgIGRlbGV0ZSBvYmouX2MyLl9zaW1wbGVTY2hlbWFzO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaFRvKHRoaXMpO1xuICAvLyBBdHRhY2ggdGhlIHNjaGVtYSB0byB0aGUgdW5kZXJseWluZyBMb2NhbENvbGxlY3Rpb24sIHRvb1xuICBpZiAodGhpcy5fY29sbGVjdGlvbiBpbnN0YW5jZW9mIExvY2FsQ29sbGVjdGlvbikge1xuICAgIHRoaXMuX2NvbGxlY3Rpb24uX2MyID0gdGhpcy5fY29sbGVjdGlvbi5fYzIgfHwge307XG4gICAgYXR0YWNoVG8odGhpcy5fY29sbGVjdGlvbik7XG4gIH1cblxuICBkZWZpbmVEZW55KHRoaXMsIG9wdGlvbnMpO1xuICBrZWVwSW5zZWN1cmUodGhpcyk7XG5cbiAgQ29sbGVjdGlvbjIuZW1pdCgnc2NoZW1hLmF0dGFjaGVkJywgdGhpcywgc3MsIG9wdGlvbnMpO1xufTtcblxuW01vbmdvLkNvbGxlY3Rpb24sIExvY2FsQ29sbGVjdGlvbl0uZm9yRWFjaCgob2JqKSA9PiB7XG4gIC8qKlxuICAgKiBzaW1wbGVTY2hlbWFcbiAgICogQGRlc2NyaXB0aW9uIGZ1bmN0aW9uIGRldGVjdCB0aGUgY29ycmVjdCBzY2hlbWEgYnkgZ2l2ZW4gcGFyYW1zLiBJZiBpdFxuICAgKiBkZXRlY3QgbXVsdGktc2NoZW1hIHByZXNlbmNlIGluIHRoZSBjb2xsZWN0aW9uLCB0aGVuIGl0IG1hZGUgYW4gYXR0ZW1wdCB0byBmaW5kIGFcbiAgICogYHNlbGVjdG9yYCBpbiBhcmdzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgLSBJdCBjb3VsZCBiZSA8dXBkYXRlPiBvbiB1cGRhdGUvdXBzZXJ0IG9yIGRvY3VtZW50XG4gICAqIGl0c2VsZiBvbiBpbnNlcnQvcmVtb3ZlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBJdCBjb3VsZCBiZSA8dXBkYXRlPiBvbiB1cGRhdGUvdXBzZXJ0IGV0Y1xuICAgKiBAcGFyYW0ge09iamVjdH0gW3F1ZXJ5XSAtIGl0IGNvdWxkIGJlIDxxdWVyeT4gb24gdXBkYXRlL3Vwc2VydFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IFNjaGVtYVxuICAgKi9cbiAgb2JqLnByb3RvdHlwZS5zaW1wbGVTY2hlbWEgPSBmdW5jdGlvbiAoZG9jLCBvcHRpb25zLCBxdWVyeSkge1xuICAgIGlmICghdGhpcy5fYzIpIHJldHVybiBudWxsO1xuICAgIGlmICh0aGlzLl9jMi5fc2ltcGxlU2NoZW1hKSByZXR1cm4gdGhpcy5fYzIuX3NpbXBsZVNjaGVtYTtcblxuICAgIHZhciBzY2hlbWFzID0gdGhpcy5fYzIuX3NpbXBsZVNjaGVtYXM7XG4gICAgaWYgKHNjaGVtYXMgJiYgc2NoZW1hcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIWRvYykgdGhyb3cgbmV3IEVycm9yKCdjb2xsZWN0aW9uLnNpbXBsZVNjaGVtYSgpIHJlcXVpcmVzIGRvYyBhcmd1bWVudCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBzY2hlbWFzJyk7XG5cbiAgICAgIHZhciBzY2hlbWEsIHNlbGVjdG9yLCB0YXJnZXQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtYXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2NoZW1hID0gc2NoZW1hc1tpXTtcbiAgICAgICAgc2VsZWN0b3IgPSBPYmplY3Qua2V5cyhzY2hlbWEuc2VsZWN0b3IpWzBdO1xuXG4gICAgICAgIC8vIFdlIHdpbGwgc2V0IHRoaXMgdG8gdW5kZWZpbmVkIGJlY2F1c2UgaW4gdGhlb3J5IHlvdSBtaWdodCB3YW50IHRvIHNlbGVjdFxuICAgICAgICAvLyBvbiBhIG51bGwgdmFsdWUuXG4gICAgICAgIHRhcmdldCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBoZXJlIHdlIGFyZSBsb29raW5nIGZvciBzZWxlY3RvciBpbiBkaWZmZXJlbnQgcGxhY2VzXG4gICAgICAgIC8vICRzZXQgc2hvdWxkIGhhdmUgbW9yZSBwcmlvcml0eSBoZXJlXG4gICAgICAgIGlmIChkb2MuJHNldCAmJiB0eXBlb2YgZG9jLiRzZXRbc2VsZWN0b3JdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRhcmdldCA9IGRvYy4kc2V0W3NlbGVjdG9yXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jW3NlbGVjdG9yXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0YXJnZXQgPSBkb2Nbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zZWxlY3Rvcikge1xuICAgICAgICAgIHRhcmdldCA9IG9wdGlvbnMuc2VsZWN0b3Jbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICYmIHF1ZXJ5W3NlbGVjdG9yXSkgeyAvLyBvbiB1cHNlcnQvdXBkYXRlIG9wZXJhdGlvbnNcbiAgICAgICAgICB0YXJnZXQgPSBxdWVyeVtzZWxlY3Rvcl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGNvbXBhcmUgZ2l2ZW4gc2VsZWN0b3Igd2l0aCBkb2MgcHJvcGVydHkgb3Igb3B0aW9uIHRvXG4gICAgICAgIC8vIGZpbmQgcmlnaHQgc2NoZW1hXG4gICAgICAgIGlmICh0YXJnZXQgIT09IHVuZGVmaW5lZCAmJiB0YXJnZXQgPT09IHNjaGVtYS5zZWxlY3RvcltzZWxlY3Rvcl0pIHtcbiAgICAgICAgICByZXR1cm4gc2NoZW1hLnNjaGVtYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xufSk7XG5cbi8vIFdyYXAgREIgd3JpdGUgb3BlcmF0aW9uIG1ldGhvZHNcblsnaW5zZXJ0JywgJ3VwZGF0ZSddLmZvckVhY2goKG1ldGhvZE5hbWUpID0+IHtcbiAgY29uc3QgX3N1cGVyID0gTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGVbbWV0aG9kTmFtZV07XG4gIE1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlW21ldGhvZE5hbWVdID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGxldCBvcHRpb25zID0gKG1ldGhvZE5hbWUgPT09IFwiaW5zZXJ0XCIpID8gYXJnc1sxXSA6IGFyZ3NbMl07XG5cbiAgICAvLyBTdXBwb3J0IG1pc3Npbmcgb3B0aW9ucyBhcmdcbiAgICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jMiAmJiBvcHRpb25zLmJ5cGFzc0NvbGxlY3Rpb24yICE9PSB0cnVlKSB7XG4gICAgICB2YXIgdXNlcklkID0gbnVsbDtcbiAgICAgIHRyeSB7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbGRlZWQvbWV0ZW9yLWNvbGxlY3Rpb24yL2lzc3Vlcy8xNzVcbiAgICAgICAgdXNlcklkID0gTWV0ZW9yLnVzZXJJZCgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuXG4gICAgICBhcmdzID0gZG9WYWxpZGF0ZShcbiAgICAgICAgdGhpcyxcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgTWV0ZW9yLmlzU2VydmVyIHx8IHRoaXMuX2Nvbm5lY3Rpb24gPT09IG51bGwsIC8vIGdldEF1dG9WYWx1ZXNcbiAgICAgICAgdXNlcklkLFxuICAgICAgICBNZXRlb3IuaXNTZXJ2ZXIgLy8gaXNGcm9tVHJ1c3RlZENvZGVcbiAgICAgICk7XG4gICAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgLy8gZG9WYWxpZGF0ZSBhbHJlYWR5IGNhbGxlZCB0aGUgY2FsbGJhY2sgb3IgdGhyZXcgdGhlIGVycm9yIHNvIHdlJ3JlIGRvbmUuXG4gICAgICAgIC8vIEJ1dCBpbnNlcnQgc2hvdWxkIGFsd2F5cyByZXR1cm4gYW4gSUQgdG8gbWF0Y2ggY29yZSBiZWhhdmlvci5cbiAgICAgICAgcmV0dXJuIG1ldGhvZE5hbWUgPT09IFwiaW5zZXJ0XCIgPyB0aGlzLl9tYWtlTmV3SUQoKSA6IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2Ugc3RpbGwgbmVlZCB0byBhZGp1c3QgYXJncyBiZWNhdXNlIGluc2VydCBkb2VzIG5vdCB0YWtlIG9wdGlvbnNcbiAgICAgIGlmIChtZXRob2ROYW1lID09PSBcImluc2VydFwiICYmIHR5cGVvZiBhcmdzWzFdICE9PSAnZnVuY3Rpb24nKSBhcmdzLnNwbGljZSgxLCAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9O1xufSk7XG5cbi8qXG4gKiBQcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZG9WYWxpZGF0ZShjb2xsZWN0aW9uLCB0eXBlLCBhcmdzLCBnZXRBdXRvVmFsdWVzLCB1c2VySWQsIGlzRnJvbVRydXN0ZWRDb2RlKSB7XG4gIHZhciBkb2MsIGNhbGxiYWNrLCBlcnJvciwgb3B0aW9ucywgaXNVcHNlcnQsIHNlbGVjdG9yLCBsYXN0LCBoYXNDYWxsYmFjaztcblxuICBpZiAoIWFyZ3MubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHR5cGUgKyBcIiByZXF1aXJlcyBhbiBhcmd1bWVudFwiKTtcbiAgfVxuXG4gIC8vIEdhdGhlciBhcmd1bWVudHMgYW5kIGNhY2hlIHRoZSBzZWxlY3RvclxuICBpZiAodHlwZSA9PT0gXCJpbnNlcnRcIikge1xuICAgIGRvYyA9IGFyZ3NbMF07XG4gICAgb3B0aW9ucyA9IGFyZ3NbMV07XG4gICAgY2FsbGJhY2sgPSBhcmdzWzJdO1xuXG4gICAgLy8gVGhlIHJlYWwgaW5zZXJ0IGRvZXNuJ3QgdGFrZSBvcHRpb25zXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGFyZ3MgPSBbZG9jLCBvcHRpb25zXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBhcmdzID0gW2RvYywgY2FsbGJhY2tdO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzID0gW2RvY107XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09IFwidXBkYXRlXCIpIHtcbiAgICBzZWxlY3RvciA9IGFyZ3NbMF07XG4gICAgZG9jID0gYXJnc1sxXTtcbiAgICBvcHRpb25zID0gYXJnc1syXTtcbiAgICBjYWxsYmFjayA9IGFyZ3NbM107XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB0eXBlIGFyZ3VtZW50XCIpO1xuICB9XG5cbiAgdmFyIHZhbGlkYXRlZE9iamVjdFdhc0luaXRpYWxseUVtcHR5ID0gaXNFbXB0eShkb2MpO1xuXG4gIC8vIFN1cHBvcnQgbWlzc2luZyBvcHRpb25zIGFyZ1xuICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGxhc3QgPSBhcmdzLmxlbmd0aCAtIDE7XG5cbiAgaGFzQ2FsbGJhY2sgPSAodHlwZW9mIGFyZ3NbbGFzdF0gPT09ICdmdW5jdGlvbicpO1xuXG4gIC8vIElmIHVwZGF0ZSB3YXMgY2FsbGVkIHdpdGggdXBzZXJ0OnRydWUsIGZsYWcgYXMgYW4gdXBzZXJ0XG4gIGlzVXBzZXJ0ID0gKHR5cGUgPT09IFwidXBkYXRlXCIgJiYgb3B0aW9ucy51cHNlcnQgPT09IHRydWUpO1xuXG4gIC8vIHdlIG5lZWQgdG8gcGFzcyBgZG9jYCBhbmQgYG9wdGlvbnNgIHRvIGBzaW1wbGVTY2hlbWFgIG1ldGhvZCwgdGhhdCdzIHdoeVxuICAvLyBzY2hlbWEgZGVjbGFyYXRpb24gbW92ZWQgaGVyZVxuICB2YXIgc2NoZW1hID0gY29sbGVjdGlvbi5zaW1wbGVTY2hlbWEoZG9jLCBvcHRpb25zLCBzZWxlY3Rvcik7XG4gIHZhciBpc0xvY2FsQ29sbGVjdGlvbiA9IChjb2xsZWN0aW9uLl9jb25uZWN0aW9uID09PSBudWxsKTtcblxuICAvLyBPbiB0aGUgc2VydmVyIGFuZCBmb3IgbG9jYWwgY29sbGVjdGlvbnMsIHdlIGFsbG93IHBhc3NpbmcgYGdldEF1dG9WYWx1ZXM6IGZhbHNlYCB0byBkaXNhYmxlIGF1dG9WYWx1ZSBmdW5jdGlvbnNcbiAgaWYgKChNZXRlb3IuaXNTZXJ2ZXIgfHwgaXNMb2NhbENvbGxlY3Rpb24pICYmIG9wdGlvbnMuZ2V0QXV0b1ZhbHVlcyA9PT0gZmFsc2UpIHtcbiAgICBnZXRBdXRvVmFsdWVzID0gZmFsc2U7XG4gIH1cblxuICAvLyBEZXRlcm1pbmUgdmFsaWRhdGlvbiBjb250ZXh0XG4gIHZhciB2YWxpZGF0aW9uQ29udGV4dCA9IG9wdGlvbnMudmFsaWRhdGlvbkNvbnRleHQ7XG4gIGlmICh2YWxpZGF0aW9uQ29udGV4dCkge1xuICAgIGlmICh0eXBlb2YgdmFsaWRhdGlvbkNvbnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWxpZGF0aW9uQ29udGV4dCA9IHNjaGVtYS5uYW1lZENvbnRleHQodmFsaWRhdGlvbkNvbnRleHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YWxpZGF0aW9uQ29udGV4dCA9IHNjaGVtYS5uYW1lZENvbnRleHQoKTtcbiAgfVxuXG4gIC8vIEFkZCBhIGRlZmF1bHQgY2FsbGJhY2sgZnVuY3Rpb24gaWYgd2UncmUgb24gdGhlIGNsaWVudCBhbmQgbm8gY2FsbGJhY2sgd2FzIGdpdmVuXG4gIGlmIChNZXRlb3IuaXNDbGllbnQgJiYgIWNhbGxiYWNrKSB7XG4gICAgLy8gQ2xpZW50IGNhbid0IGJsb2NrLCBzbyBpdCBjYW4ndCByZXBvcnQgZXJyb3JzIGJ5IGV4Y2VwdGlvbixcbiAgICAvLyBvbmx5IGJ5IGNhbGxiYWNrLiBJZiB0aGV5IGZvcmdldCB0aGUgY2FsbGJhY2ssIGdpdmUgdGhlbSBhXG4gICAgLy8gZGVmYXVsdCBvbmUgdGhhdCBsb2dzIHRoZSBlcnJvciwgc28gdGhleSBhcmVuJ3QgdG90YWxseVxuICAgIC8vIGJhZmZsZWQgaWYgdGhlaXIgd3JpdGVzIGRvbid0IHdvcmsgYmVjYXVzZSB0aGVpciBkYXRhYmFzZSBpc1xuICAgIC8vIGRvd24uXG4gICAgY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1Zyh0eXBlICsgXCIgZmFpbGVkOiBcIiArIChlcnIucmVhc29uIHx8IGVyci5zdGFjaykpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBJZiBjbGllbnQgdmFsaWRhdGlvbiBpcyBmaW5lIG9yIGlzIHNraXBwZWQgYnV0IHRoZW4gc29tZXRoaW5nXG4gIC8vIGlzIGZvdW5kIHRvIGJlIGludmFsaWQgb24gdGhlIHNlcnZlciwgd2UgZ2V0IHRoYXQgZXJyb3IgYmFja1xuICAvLyBhcyBhIHNwZWNpYWwgTWV0ZW9yLkVycm9yIHRoYXQgd2UgbmVlZCB0byBwYXJzZS5cbiAgaWYgKE1ldGVvci5pc0NsaWVudCAmJiBoYXNDYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gYXJnc1tsYXN0XSA9IHdyYXBDYWxsYmFja0ZvclBhcnNpbmdTZXJ2ZXJFcnJvcnModmFsaWRhdGlvbkNvbnRleHQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHZhciBzY2hlbWFBbGxvd3NJZCA9IHNjaGVtYS5hbGxvd3NLZXkoXCJfaWRcIik7XG4gIGlmICh0eXBlID09PSBcImluc2VydFwiICYmICFkb2MuX2lkICYmIHNjaGVtYUFsbG93c0lkKSB7XG4gICAgZG9jLl9pZCA9IGNvbGxlY3Rpb24uX21ha2VOZXdJRCgpO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBkb2NJZCBmb3IgcGFzc2luZyBpbiB0aGUgYXV0b1ZhbHVlL2N1c3RvbSBjb250ZXh0XG4gIHZhciBkb2NJZDtcbiAgaWYgKHR5cGUgPT09ICdpbnNlcnQnKSB7XG4gICAgZG9jSWQgPSBkb2MuX2lkOyAvLyBtaWdodCBiZSB1bmRlZmluZWRcbiAgfSBlbHNlIGlmICh0eXBlID09PSBcInVwZGF0ZVwiICYmIHNlbGVjdG9yKSB7XG4gICAgZG9jSWQgPSB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQgPyBzZWxlY3RvciA6IHNlbGVjdG9yLl9pZDtcbiAgfVxuXG4gIC8vIElmIF9pZCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLCByZW1vdmUgaXQgdGVtcG9yYXJpbHkgaWYgaXQnc1xuICAvLyBub3QgZXhwbGljaXRseSBkZWZpbmVkIGluIHRoZSBzY2hlbWEuXG4gIHZhciBjYWNoZWRJZDtcbiAgaWYgKGRvYy5faWQgJiYgIXNjaGVtYUFsbG93c0lkKSB7XG4gICAgY2FjaGVkSWQgPSBkb2MuX2lkO1xuICAgIGRlbGV0ZSBkb2MuX2lkO1xuICB9XG5cbiAgY29uc3QgYXV0b1ZhbHVlQ29udGV4dCA9IHtcbiAgICBpc0luc2VydDogKHR5cGUgPT09IFwiaW5zZXJ0XCIpLFxuICAgIGlzVXBkYXRlOiAodHlwZSA9PT0gXCJ1cGRhdGVcIiAmJiBvcHRpb25zLnVwc2VydCAhPT0gdHJ1ZSksXG4gICAgaXNVcHNlcnQsXG4gICAgdXNlcklkLFxuICAgIGlzRnJvbVRydXN0ZWRDb2RlLFxuICAgIGRvY0lkLFxuICAgIGlzTG9jYWxDb2xsZWN0aW9uXG4gIH07XG5cbiAgY29uc3QgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCA9IHtcbiAgICAuLi4oKHNjaGVtYS5fY2xlYW5PcHRpb25zIHx8IHt9KS5leHRlbmRBdXRvVmFsdWVDb250ZXh0IHx8IHt9KSxcbiAgICAuLi5hdXRvVmFsdWVDb250ZXh0LFxuICAgIC4uLm9wdGlvbnMuZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCxcbiAgfTtcblxuICBjb25zdCBjbGVhbk9wdGlvbnNGb3JUaGlzT3BlcmF0aW9uID0ge307XG4gIFtcImF1dG9Db252ZXJ0XCIsIFwiZmlsdGVyXCIsIFwicmVtb3ZlRW1wdHlTdHJpbmdzXCIsIFwicmVtb3ZlTnVsbHNGcm9tQXJyYXlzXCIsIFwidHJpbVN0cmluZ3NcIl0uZm9yRWFjaChwcm9wID0+IHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnNbcHJvcF0gPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICBjbGVhbk9wdGlvbnNGb3JUaGlzT3BlcmF0aW9uW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFByZWxpbWluYXJ5IGNsZWFuaW5nIG9uIGJvdGggY2xpZW50IGFuZCBzZXJ2ZXIuIE9uIHRoZSBzZXJ2ZXIgYW5kIGZvciBsb2NhbFxuICAvLyBjb2xsZWN0aW9ucywgYXV0b21hdGljIHZhbHVlcyB3aWxsIGFsc28gYmUgc2V0IGF0IHRoaXMgcG9pbnQuXG4gIHNjaGVtYS5jbGVhbihkb2MsIHtcbiAgICBtdXRhdGU6IHRydWUsIC8vIENsZWFuIHRoZSBkb2MvbW9kaWZpZXIgaW4gcGxhY2VcbiAgICBpc01vZGlmaWVyOiAodHlwZSAhPT0gXCJpbnNlcnRcIiksXG4gICAgLy8gU3RhcnQgd2l0aCBzb21lIENvbGxlY3Rpb24yIGRlZmF1bHRzLCB3aGljaCB3aWxsIHVzdWFsbHkgYmUgb3ZlcndyaXR0ZW5cbiAgICAuLi5kZWZhdWx0Q2xlYW5PcHRpb25zLFxuICAgIC8vIFRoZSBleHRlbmQgd2l0aCB0aGUgc2NoZW1hLWxldmVsIGRlZmF1bHRzIChmcm9tIFNpbXBsZVNjaGVtYSBjb25zdHJ1Y3RvciBvcHRpb25zKVxuICAgIC4uLihzY2hlbWEuX2NsZWFuT3B0aW9ucyB8fCB7fSksXG4gICAgLy8gRmluYWxseSwgb3B0aW9ucyBmb3IgdGhpcyBzcGVjaWZpYyBvcGVyYXRpb24gc2hvdWxkIHRha2UgcHJlY2VkZW5jZVxuICAgIC4uLmNsZWFuT3B0aW9uc0ZvclRoaXNPcGVyYXRpb24sXG4gICAgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCwgLy8gVGhpcyB3YXMgZXh0ZW5kZWQgc2VwYXJhdGVseSBhYm92ZVxuICAgIGdldEF1dG9WYWx1ZXMsIC8vIEZvcmNlIHRoaXMgb3ZlcnJpZGVcbiAgfSk7XG5cbiAgLy8gV2UgY2xvbmUgYmVmb3JlIHZhbGlkYXRpbmcgYmVjYXVzZSBpbiBzb21lIGNhc2VzIHdlIG5lZWQgdG8gYWRqdXN0IHRoZVxuICAvLyBvYmplY3QgYSBiaXQgYmVmb3JlIHZhbGlkYXRpbmcgaXQuIElmIHdlIGFkanVzdGVkIGBkb2NgIGl0c2VsZiwgb3VyXG4gIC8vIGNoYW5nZXMgd291bGQgcGVyc2lzdCBpbnRvIHRoZSBkYXRhYmFzZS5cbiAgdmFyIGRvY1RvVmFsaWRhdGUgPSB7fTtcbiAgZm9yICh2YXIgcHJvcCBpbiBkb2MpIHtcbiAgICAvLyBXZSBvbWl0IHByb3RvdHlwZSBwcm9wZXJ0aWVzIHdoZW4gY2xvbmluZyBiZWNhdXNlIHRoZXkgd2lsbCBub3QgYmUgdmFsaWRcbiAgICAvLyBhbmQgbW9uZ28gb21pdHMgdGhlbSB3aGVuIHNhdmluZyB0byB0aGUgZGF0YWJhc2UgYW55d2F5LlxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZG9jLCBwcm9wKSkge1xuICAgICAgZG9jVG9WYWxpZGF0ZVtwcm9wXSA9IGRvY1twcm9wXTtcbiAgICB9XG4gIH1cblxuICAvLyBPbiB0aGUgc2VydmVyLCB1cHNlcnRzIGFyZSBwb3NzaWJsZTsgU2ltcGxlU2NoZW1hIGhhbmRsZXMgdXBzZXJ0cyBwcmV0dHlcbiAgLy8gd2VsbCBieSBkZWZhdWx0LCBidXQgaXQgd2lsbCBub3Qga25vdyBhYm91dCB0aGUgZmllbGRzIGluIHRoZSBzZWxlY3RvcixcbiAgLy8gd2hpY2ggYXJlIGFsc28gc3RvcmVkIGluIHRoZSBkYXRhYmFzZSBpZiBhbiBpbnNlcnQgaXMgcGVyZm9ybWVkLiBTbyB3ZVxuICAvLyB3aWxsIGFsbG93IHRoZXNlIGZpZWxkcyB0byBiZSBjb25zaWRlcmVkIGZvciB2YWxpZGF0aW9uIGJ5IGFkZGluZyB0aGVtXG4gIC8vIHRvIHRoZSAkc2V0IGluIHRoZSBtb2RpZmllciwgd2hpbGUgc3RyaXBwaW5nIG91dCBxdWVyeSBzZWxlY3RvcnMgYXMgdGhlc2VcbiAgLy8gZG9uJ3QgbWFrZSBpdCBpbnRvIHRoZSB1cHNlcnRlZCBkb2N1bWVudCBhbmQgYnJlYWsgdmFsaWRhdGlvbi4gXG4gIC8vIFRoaXMgaXMgbm8gZG91YnQgcHJvbmUgdG8gZXJyb3JzLCBidXQgdGhlcmUgcHJvYmFibHkgaXNuJ3QgYW55IGJldHRlciB3YXlcbiAgLy8gcmlnaHQgbm93LlxuICBpZiAoTWV0ZW9yLmlzU2VydmVyICYmIGlzVXBzZXJ0ICYmIGlzT2JqZWN0KHNlbGVjdG9yKSkge1xuICAgIHZhciBzZXQgPSBkb2NUb1ZhbGlkYXRlLiRzZXQgfHwge307XG5cbiAgICBkb2NUb1ZhbGlkYXRlLiRzZXQgPSBmbGF0dGVuU2VsZWN0b3Ioc2VsZWN0b3IpXG5cbiAgICBpZiAoIXNjaGVtYUFsbG93c0lkKSBkZWxldGUgZG9jVG9WYWxpZGF0ZS4kc2V0Ll9pZDtcbiAgICBPYmplY3QuYXNzaWduKGRvY1RvVmFsaWRhdGUuJHNldCwgc2V0KTtcbiAgfVxuICAvLyBTZXQgYXV0b21hdGljIHZhbHVlcyBmb3IgdmFsaWRhdGlvbiBvbiB0aGUgY2xpZW50LlxuICAvLyBPbiB0aGUgc2VydmVyLCB3ZSBhbHJlYWR5IHVwZGF0ZWQgZG9jIHdpdGggYXV0byB2YWx1ZXMsIGJ1dCBvbiB0aGUgY2xpZW50LFxuICAvLyB3ZSB3aWxsIGFkZCB0aGVtIHRvIGRvY1RvVmFsaWRhdGUgZm9yIHZhbGlkYXRpb24gcHVycG9zZXMgb25seS5cbiAgLy8gVGhpcyBpcyBiZWNhdXNlIHdlIHdhbnQgYWxsIGFjdHVhbCB2YWx1ZXMgZ2VuZXJhdGVkIG9uIHRoZSBzZXJ2ZXIuXG4gIGlmIChNZXRlb3IuaXNDbGllbnQgJiYgIWlzTG9jYWxDb2xsZWN0aW9uKSB7XG4gICAgc2NoZW1hLmNsZWFuKGRvY1RvVmFsaWRhdGUsIHtcbiAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZSxcbiAgICAgIGV4dGVuZEF1dG9WYWx1ZUNvbnRleHQsXG4gICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgZ2V0QXV0b1ZhbHVlczogdHJ1ZSxcbiAgICAgIGlzTW9kaWZpZXI6ICh0eXBlICE9PSBcImluc2VydFwiKSxcbiAgICAgIG11dGF0ZTogdHJ1ZSwgLy8gQ2xlYW4gdGhlIGRvYy9tb2RpZmllciBpbiBwbGFjZVxuICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgIHJlbW92ZU51bGxzRnJvbUFycmF5czogZmFsc2UsXG4gICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICAvLyBYWFggTWF5YmUgbW92ZSB0aGlzIGludG8gU2ltcGxlU2NoZW1hXG4gIGlmICghdmFsaWRhdGVkT2JqZWN0V2FzSW5pdGlhbGx5RW1wdHkgJiYgaXNFbXB0eShkb2NUb1ZhbGlkYXRlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQWZ0ZXIgZmlsdGVyaW5nIG91dCBrZXlzIG5vdCBpbiB0aGUgc2NoZW1hLCB5b3VyICcgK1xuICAgICAgKHR5cGUgPT09ICd1cGRhdGUnID8gJ21vZGlmaWVyJyA6ICdvYmplY3QnKSArXG4gICAgICAnIGlzIG5vdyBlbXB0eScpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZG9jXG4gIHZhciBpc1ZhbGlkO1xuICBpZiAob3B0aW9ucy52YWxpZGF0ZSA9PT0gZmFsc2UpIHtcbiAgICBpc1ZhbGlkID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBpc1ZhbGlkID0gdmFsaWRhdGlvbkNvbnRleHQudmFsaWRhdGUoZG9jVG9WYWxpZGF0ZSwge1xuICAgICAgbW9kaWZpZXI6ICh0eXBlID09PSBcInVwZGF0ZVwiIHx8IHR5cGUgPT09IFwidXBzZXJ0XCIpLFxuICAgICAgdXBzZXJ0OiBpc1Vwc2VydCxcbiAgICAgIGV4dGVuZGVkQ3VzdG9tQ29udGV4dDoge1xuICAgICAgICBpc0luc2VydDogKHR5cGUgPT09IFwiaW5zZXJ0XCIpLFxuICAgICAgICBpc1VwZGF0ZTogKHR5cGUgPT09IFwidXBkYXRlXCIgJiYgb3B0aW9ucy51cHNlcnQgIT09IHRydWUpLFxuICAgICAgICBpc1Vwc2VydCxcbiAgICAgICAgdXNlcklkLFxuICAgICAgICBpc0Zyb21UcnVzdGVkQ29kZSxcbiAgICAgICAgZG9jSWQsXG4gICAgICAgIGlzTG9jYWxDb2xsZWN0aW9uLFxuICAgICAgICAuLi4ob3B0aW9ucy5leHRlbmRlZEN1c3RvbUNvbnRleHQgfHwge30pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc1ZhbGlkKSB7XG4gICAgLy8gQWRkIHRoZSBJRCBiYWNrXG4gICAgaWYgKGNhY2hlZElkKSB7XG4gICAgICBkb2MuX2lkID0gY2FjaGVkSWQ7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBhcmdzIHRvIHJlZmxlY3QgdGhlIGNsZWFuZWQgZG9jXG4gICAgLy8gWFhYIG5vdCBzdXJlIHRoaXMgaXMgbmVjZXNzYXJ5IHNpbmNlIHdlIG11dGF0ZVxuICAgIGlmICh0eXBlID09PSBcImluc2VydFwiKSB7XG4gICAgICBhcmdzWzBdID0gZG9jO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzWzFdID0gZG9jO1xuICAgIH1cblxuICAgIC8vIElmIGNhbGxiYWNrLCBzZXQgaW52YWxpZEtleSB3aGVuIHdlIGdldCBhIG1vbmdvIHVuaXF1ZSBlcnJvclxuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIgJiYgaGFzQ2FsbGJhY2spIHtcbiAgICAgIGFyZ3NbbGFzdF0gPSB3cmFwQ2FsbGJhY2tGb3JQYXJzaW5nTW9uZ29WYWxpZGF0aW9uRXJyb3JzKHZhbGlkYXRpb25Db250ZXh0LCBhcmdzW2xhc3RdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJncztcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IGdldEVycm9yT2JqZWN0KHZhbGlkYXRpb25Db250ZXh0LCBgaW4gJHtjb2xsZWN0aW9uLl9uYW1lfSAke3R5cGV9YCk7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAvLyBpbnNlcnQvdXBkYXRlL3Vwc2VydCBwYXNzIGBmYWxzZWAgd2hlbiB0aGVyZSdzIGFuIGVycm9yLCBzbyB3ZSBkbyB0aGF0XG4gICAgICBjYWxsYmFjayhlcnJvciwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RXJyb3JPYmplY3QoY29udGV4dCwgYXBwZW5kVG9NZXNzYWdlID0gJycpIHtcbiAgbGV0IG1lc3NhZ2U7XG4gIGNvbnN0IGludmFsaWRLZXlzID0gKHR5cGVvZiBjb250ZXh0LnZhbGlkYXRpb25FcnJvcnMgPT09ICdmdW5jdGlvbicpID8gY29udGV4dC52YWxpZGF0aW9uRXJyb3JzKCkgOiBjb250ZXh0LmludmFsaWRLZXlzKCk7XG4gIGlmIChpbnZhbGlkS2V5cy5sZW5ndGgpIHtcbiAgICBjb25zdCBmaXJzdEVycm9yS2V5ID0gaW52YWxpZEtleXNbMF0ubmFtZTtcbiAgICBjb25zdCBmaXJzdEVycm9yTWVzc2FnZSA9IGNvbnRleHQua2V5RXJyb3JNZXNzYWdlKGZpcnN0RXJyb3JLZXkpO1xuXG4gICAgLy8gSWYgdGhlIGVycm9yIGlzIGluIGEgbmVzdGVkIGtleSwgYWRkIHRoZSBmdWxsIGtleSB0byB0aGUgZXJyb3IgbWVzc2FnZVxuICAgIC8vIHRvIGJlIG1vcmUgaGVscGZ1bC5cbiAgICBpZiAoZmlyc3RFcnJvcktleS5pbmRleE9mKCcuJykgPT09IC0xKSB7XG4gICAgICBtZXNzYWdlID0gZmlyc3RFcnJvck1lc3NhZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgPSBgJHtmaXJzdEVycm9yTWVzc2FnZX0gKCR7Zmlyc3RFcnJvcktleX0pYDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbWVzc2FnZSA9IFwiRmFpbGVkIHZhbGlkYXRpb25cIjtcbiAgfVxuICBtZXNzYWdlID0gYCR7bWVzc2FnZX0gJHthcHBlbmRUb01lc3NhZ2V9YC50cmltKCk7XG4gIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICBlcnJvci5pbnZhbGlkS2V5cyA9IGludmFsaWRLZXlzO1xuICBlcnJvci52YWxpZGF0aW9uQ29udGV4dCA9IGNvbnRleHQ7XG4gIC8vIElmIG9uIHRoZSBzZXJ2ZXIsIHdlIGFkZCBhIHNhbml0aXplZCBlcnJvciwgdG9vLCBpbiBjYXNlIHdlJ3JlXG4gIC8vIGNhbGxlZCBmcm9tIGEgbWV0aG9kLlxuICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgZXJyb3Iuc2FuaXRpemVkRXJyb3IgPSBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgbWVzc2FnZSwgRUpTT04uc3RyaW5naWZ5KGVycm9yLmludmFsaWRLZXlzKSk7XG4gIH1cbiAgcmV0dXJuIGVycm9yO1xufVxuXG5mdW5jdGlvbiBhZGRVbmlxdWVFcnJvcihjb250ZXh0LCBlcnJvck1lc3NhZ2UpIHtcbiAgdmFyIG5hbWUgPSBlcnJvck1lc3NhZ2Uuc3BsaXQoJ2MyXycpWzFdLnNwbGl0KCcgJylbMF07XG4gIHZhciB2YWwgPSBlcnJvck1lc3NhZ2Uuc3BsaXQoJ2R1cCBrZXk6JylbMV0uc3BsaXQoJ1wiJylbMV07XG5cbiAgdmFyIGFkZFZhbGlkYXRpb25FcnJvcnNQcm9wTmFtZSA9ICh0eXBlb2YgY29udGV4dC5hZGRWYWxpZGF0aW9uRXJyb3JzID09PSAnZnVuY3Rpb24nKSA/ICdhZGRWYWxpZGF0aW9uRXJyb3JzJyA6ICdhZGRJbnZhbGlkS2V5cyc7XG4gIGNvbnRleHRbYWRkVmFsaWRhdGlvbkVycm9yc1Byb3BOYW1lXShbe1xuICAgIG5hbWU6IG5hbWUsXG4gICAgdHlwZTogJ25vdFVuaXF1ZScsXG4gICAgdmFsdWU6IHZhbFxuICB9XSk7XG59XG5cbmZ1bmN0aW9uIHdyYXBDYWxsYmFja0ZvclBhcnNpbmdNb25nb1ZhbGlkYXRpb25FcnJvcnModmFsaWRhdGlvbkNvbnRleHQsIGNiKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVkQ2FsbGJhY2tGb3JQYXJzaW5nTW9uZ29WYWxpZGF0aW9uRXJyb3JzKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBlcnJvciA9IGFyZ3NbMF07XG4gICAgaWYgKGVycm9yICYmXG4gICAgICAgICgoZXJyb3IubmFtZSA9PT0gXCJNb25nb0Vycm9yXCIgJiYgZXJyb3IuY29kZSA9PT0gMTEwMDEpIHx8IGVycm9yLm1lc3NhZ2UuaW5kZXhPZignTW9uZ29FcnJvcjogRTExMDAwJyAhPT0gLTEpKSAmJlxuICAgICAgICBlcnJvci5tZXNzYWdlLmluZGV4T2YoJ2MyXycpICE9PSAtMSkge1xuICAgICAgYWRkVW5pcXVlRXJyb3IodmFsaWRhdGlvbkNvbnRleHQsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgYXJnc1swXSA9IGdldEVycm9yT2JqZWN0KHZhbGlkYXRpb25Db250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIGNiLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB3cmFwQ2FsbGJhY2tGb3JQYXJzaW5nU2VydmVyRXJyb3JzKHZhbGlkYXRpb25Db250ZXh0LCBjYikge1xuICB2YXIgYWRkVmFsaWRhdGlvbkVycm9yc1Byb3BOYW1lID0gKHR5cGVvZiB2YWxpZGF0aW9uQ29udGV4dC5hZGRWYWxpZGF0aW9uRXJyb3JzID09PSAnZnVuY3Rpb24nKSA/ICdhZGRWYWxpZGF0aW9uRXJyb3JzJyA6ICdhZGRJbnZhbGlkS2V5cyc7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVkQ2FsbGJhY2tGb3JQYXJzaW5nU2VydmVyRXJyb3JzKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBlcnJvciA9IGFyZ3NbMF07XG4gICAgLy8gSGFuZGxlIG91ciBvd24gdmFsaWRhdGlvbiBlcnJvcnNcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBNZXRlb3IuRXJyb3IgJiZcbiAgICAgICAgZXJyb3IuZXJyb3IgPT09IDQwMCAmJlxuICAgICAgICBlcnJvci5yZWFzb24gPT09IFwiSU5WQUxJRFwiICYmXG4gICAgICAgIHR5cGVvZiBlcnJvci5kZXRhaWxzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB2YXIgaW52YWxpZEtleXNGcm9tU2VydmVyID0gRUpTT04ucGFyc2UoZXJyb3IuZGV0YWlscyk7XG4gICAgICB2YWxpZGF0aW9uQ29udGV4dFthZGRWYWxpZGF0aW9uRXJyb3JzUHJvcE5hbWVdKGludmFsaWRLZXlzRnJvbVNlcnZlcik7XG4gICAgICBhcmdzWzBdID0gZ2V0RXJyb3JPYmplY3QodmFsaWRhdGlvbkNvbnRleHQpO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgTW9uZ28gdW5pcXVlIGluZGV4IGVycm9ycywgd2hpY2ggYXJlIGZvcndhcmRlZCB0byB0aGUgY2xpZW50IGFzIDQwOSBlcnJvcnNcbiAgICBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIE1ldGVvci5FcnJvciAmJlxuICAgICAgICAgICAgIGVycm9yLmVycm9yID09PSA0MDkgJiZcbiAgICAgICAgICAgICBlcnJvci5yZWFzb24gJiZcbiAgICAgICAgICAgICBlcnJvci5yZWFzb24uaW5kZXhPZignRTExMDAwJykgIT09IC0xICYmXG4gICAgICAgICAgICAgZXJyb3IucmVhc29uLmluZGV4T2YoJ2MyXycpICE9PSAtMSkge1xuICAgICAgYWRkVW5pcXVlRXJyb3IodmFsaWRhdGlvbkNvbnRleHQsIGVycm9yLnJlYXNvbik7XG4gICAgICBhcmdzWzBdID0gZ2V0RXJyb3JPYmplY3QodmFsaWRhdGlvbkNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gY2IuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG59XG5cbnZhciBhbHJlYWR5SW5zZWN1cmUgPSB7fTtcbmZ1bmN0aW9uIGtlZXBJbnNlY3VyZShjKSB7XG4gIC8vIElmIGluc2VjdXJlIHBhY2thZ2UgaXMgaW4gdXNlLCB3ZSBuZWVkIHRvIGFkZCBhbGxvdyBydWxlcyB0aGF0IHJldHVyblxuICAvLyB0cnVlLiBPdGhlcndpc2UsIGl0IHdvdWxkIHNlZW1pbmdseSB0dXJuIG9mZiBpbnNlY3VyZSBtb2RlLlxuICBpZiAoUGFja2FnZSAmJiBQYWNrYWdlLmluc2VjdXJlICYmICFhbHJlYWR5SW5zZWN1cmVbYy5fbmFtZV0pIHtcbiAgICBjLmFsbG93KHtcbiAgICAgIGluc2VydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBmZXRjaDogW10sXG4gICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICB9KTtcbiAgICBhbHJlYWR5SW5zZWN1cmVbYy5fbmFtZV0gPSB0cnVlO1xuICB9XG4gIC8vIElmIGluc2VjdXJlIHBhY2thZ2UgaXMgTk9UIGluIHVzZSwgdGhlbiBhZGRpbmcgdGhlIHR3byBkZW55IGZ1bmN0aW9uc1xuICAvLyBkb2VzIG5vdCBoYXZlIGFueSBlZmZlY3Qgb24gdGhlIG1haW4gYXBwJ3Mgc2VjdXJpdHkgcGFyYWRpZ20uIFRoZVxuICAvLyB1c2VyIHdpbGwgc3RpbGwgYmUgcmVxdWlyZWQgdG8gYWRkIGF0IGxlYXN0IG9uZSBhbGxvdyBmdW5jdGlvbiBvZiBoZXJcbiAgLy8gb3duIGZvciBlYWNoIG9wZXJhdGlvbiBmb3IgdGhpcyBjb2xsZWN0aW9uLiBBbmQgdGhlIHVzZXIgbWF5IHN0aWxsIGFkZFxuICAvLyBhZGRpdGlvbmFsIGRlbnkgZnVuY3Rpb25zLCBidXQgZG9lcyBub3QgaGF2ZSB0by5cbn1cblxudmFyIGFscmVhZHlEZWZpbmVkID0ge307XG5mdW5jdGlvbiBkZWZpbmVEZW55KGMsIG9wdGlvbnMpIHtcbiAgaWYgKCFhbHJlYWR5RGVmaW5lZFtjLl9uYW1lXSkge1xuXG4gICAgdmFyIGlzTG9jYWxDb2xsZWN0aW9uID0gKGMuX2Nvbm5lY3Rpb24gPT09IG51bGwpO1xuXG4gICAgLy8gRmlyc3QgZGVmaW5lIGRlbnkgZnVuY3Rpb25zIHRvIGV4dGVuZCBkb2Mgd2l0aCB0aGUgcmVzdWx0cyBvZiBjbGVhblxuICAgIC8vIGFuZCBhdXRvLXZhbHVlcy4gVGhpcyBtdXN0IGJlIGRvbmUgd2l0aCBcInRyYW5zZm9ybTogbnVsbFwiIG9yIHdlIHdvdWxkIGJlXG4gICAgLy8gZXh0ZW5kaW5nIGEgY2xvbmUgb2YgZG9jIGFuZCB0aGVyZWZvcmUgaGF2ZSBubyBlZmZlY3QuXG4gICAgYy5kZW55KHtcbiAgICAgIGluc2VydDogZnVuY3Rpb24odXNlcklkLCBkb2MpIHtcbiAgICAgICAgLy8gUmVmZXJlbmNlZCBkb2MgaXMgY2xlYW5lZCBpbiBwbGFjZVxuICAgICAgICBjLnNpbXBsZVNjaGVtYShkb2MpLmNsZWFuKGRvYywge1xuICAgICAgICAgIG11dGF0ZTogdHJ1ZSxcbiAgICAgICAgICBpc01vZGlmaWVyOiBmYWxzZSxcbiAgICAgICAgICAvLyBXZSBkb24ndCBkbyB0aGVzZSBoZXJlIGJlY2F1c2UgdGhleSBhcmUgZG9uZSBvbiB0aGUgY2xpZW50IGlmIGRlc2lyZWRcbiAgICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZSxcbiAgICAgICAgICByZW1vdmVFbXB0eVN0cmluZ3M6IGZhbHNlLFxuICAgICAgICAgIHRyaW1TdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICBleHRlbmRBdXRvVmFsdWVDb250ZXh0OiB7XG4gICAgICAgICAgICBpc0luc2VydDogdHJ1ZSxcbiAgICAgICAgICAgIGlzVXBkYXRlOiBmYWxzZSxcbiAgICAgICAgICAgIGlzVXBzZXJ0OiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgaXNGcm9tVHJ1c3RlZENvZGU6IGZhbHNlLFxuICAgICAgICAgICAgZG9jSWQ6IGRvYy5faWQsXG4gICAgICAgICAgICBpc0xvY2FsQ29sbGVjdGlvbjogaXNMb2NhbENvbGxlY3Rpb25cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKHVzZXJJZCwgZG9jLCBmaWVsZHMsIG1vZGlmaWVyKSB7XG4gICAgICAgIC8vIFJlZmVyZW5jZWQgbW9kaWZpZXIgaXMgY2xlYW5lZCBpbiBwbGFjZVxuICAgICAgICBjLnNpbXBsZVNjaGVtYShtb2RpZmllcikuY2xlYW4obW9kaWZpZXIsIHtcbiAgICAgICAgICBtdXRhdGU6IHRydWUsXG4gICAgICAgICAgaXNNb2RpZmllcjogdHJ1ZSxcbiAgICAgICAgICAvLyBXZSBkb24ndCBkbyB0aGVzZSBoZXJlIGJlY2F1c2UgdGhleSBhcmUgZG9uZSBvbiB0aGUgY2xpZW50IGlmIGRlc2lyZWRcbiAgICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZSxcbiAgICAgICAgICByZW1vdmVFbXB0eVN0cmluZ3M6IGZhbHNlLFxuICAgICAgICAgIHRyaW1TdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICBleHRlbmRBdXRvVmFsdWVDb250ZXh0OiB7XG4gICAgICAgICAgICBpc0luc2VydDogZmFsc2UsXG4gICAgICAgICAgICBpc1VwZGF0ZTogdHJ1ZSxcbiAgICAgICAgICAgIGlzVXBzZXJ0OiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgaXNGcm9tVHJ1c3RlZENvZGU6IGZhbHNlLFxuICAgICAgICAgICAgZG9jSWQ6IGRvYyAmJiBkb2MuX2lkLFxuICAgICAgICAgICAgaXNMb2NhbENvbGxlY3Rpb246IGlzTG9jYWxDb2xsZWN0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgZmV0Y2g6IFsnX2lkJ10sXG4gICAgICB0cmFuc2Zvcm06IG51bGxcbiAgICB9KTtcblxuICAgIC8vIFNlY29uZCBkZWZpbmUgZGVueSBmdW5jdGlvbnMgdG8gdmFsaWRhdGUgYWdhaW4gb24gdGhlIHNlcnZlclxuICAgIC8vIGZvciBjbGllbnQtaW5pdGlhdGVkIGluc2VydHMgYW5kIHVwZGF0ZXMuIFRoZXNlIHNob3VsZCBiZVxuICAgIC8vIGNhbGxlZCBhZnRlciB0aGUgY2xlYW4vYXV0by12YWx1ZSBmdW5jdGlvbnMgc2luY2Ugd2UncmUgYWRkaW5nXG4gICAgLy8gdGhlbSBhZnRlci4gVGhlc2UgbXVzdCAqbm90KiBoYXZlIFwidHJhbnNmb3JtOiBudWxsXCIgaWYgb3B0aW9ucy50cmFuc2Zvcm0gaXMgdHJ1ZSBiZWNhdXNlXG4gICAgLy8gd2UgbmVlZCB0byBwYXNzIHRoZSBkb2MgdGhyb3VnaCBhbnkgdHJhbnNmb3JtcyB0byBiZSBzdXJlXG4gICAgLy8gdGhhdCBjdXN0b20gdHlwZXMgYXJlIHByb3Blcmx5IHJlY29nbml6ZWQgZm9yIHR5cGUgdmFsaWRhdGlvbi5cbiAgICBjLmRlbnkoe1xuICAgICAgaW5zZXJ0OiBmdW5jdGlvbih1c2VySWQsIGRvYykge1xuICAgICAgICAvLyBXZSBwYXNzIHRoZSBmYWxzZSBvcHRpb25zIGJlY2F1c2Ugd2Ugd2lsbCBoYXZlIGRvbmUgdGhlbSBvbiBjbGllbnQgaWYgZGVzaXJlZFxuICAgICAgICBkb1ZhbGlkYXRlKFxuICAgICAgICAgIGMsXG4gICAgICAgICAgXCJpbnNlcnRcIixcbiAgICAgICAgICBbXG4gICAgICAgICAgICBkb2MsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRyaW1TdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgYXV0b0NvbnZlcnQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsICdJTlZBTElEJywgRUpTT04uc3RyaW5naWZ5KGVycm9yLmludmFsaWRLZXlzKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZhbHNlLCAvLyBnZXRBdXRvVmFsdWVzXG4gICAgICAgICAgdXNlcklkLFxuICAgICAgICAgIGZhbHNlIC8vIGlzRnJvbVRydXN0ZWRDb2RlXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24odXNlcklkLCBkb2MsIGZpZWxkcywgbW9kaWZpZXIpIHtcbiAgICAgICAgLy8gTk9URTogVGhpcyB3aWxsIG5ldmVyIGJlIGFuIHVwc2VydCBiZWNhdXNlIGNsaWVudC1zaWRlIHVwc2VydHNcbiAgICAgICAgLy8gYXJlIG5vdCBhbGxvd2VkIG9uY2UgeW91IGRlZmluZSBhbGxvdy9kZW55IGZ1bmN0aW9ucy5cbiAgICAgICAgLy8gV2UgcGFzcyB0aGUgZmFsc2Ugb3B0aW9ucyBiZWNhdXNlIHdlIHdpbGwgaGF2ZSBkb25lIHRoZW0gb24gY2xpZW50IGlmIGRlc2lyZWRcbiAgICAgICAgZG9WYWxpZGF0ZShcbiAgICAgICAgICBjLFxuICAgICAgICAgIFwidXBkYXRlXCIsXG4gICAgICAgICAgW1xuICAgICAgICAgICAge19pZDogZG9jICYmIGRvYy5faWR9LFxuICAgICAgICAgICAgbW9kaWZpZXIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRyaW1TdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgYXV0b0NvbnZlcnQ6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDAsICdJTlZBTElEJywgRUpTT04uc3RyaW5naWZ5KGVycm9yLmludmFsaWRLZXlzKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZhbHNlLCAvLyBnZXRBdXRvVmFsdWVzXG4gICAgICAgICAgdXNlcklkLFxuICAgICAgICAgIGZhbHNlIC8vIGlzRnJvbVRydXN0ZWRDb2RlXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGZldGNoOiBbJ19pZCddLFxuICAgICAgLi4uKG9wdGlvbnMudHJhbnNmb3JtID09PSB0cnVlID8ge30gOiB7dHJhbnNmb3JtOiBudWxsfSksXG4gICAgfSk7XG5cbiAgICAvLyBub3RlIHRoYXQgd2UndmUgYWxyZWFkeSBkb25lIHRoaXMgY29sbGVjdGlvbiBzbyB0aGF0IHdlIGRvbid0IGRvIGl0IGFnYWluXG4gICAgLy8gaWYgYXR0YWNoU2NoZW1hIGlzIGNhbGxlZCBhZ2FpblxuICAgIGFscmVhZHlEZWZpbmVkW2MuX25hbWVdID0gdHJ1ZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb2xsZWN0aW9uMjtcbiIsImV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgLy8gSWYgc2VsZWN0b3IgdXNlcyAkYW5kIGZvcm1hdCwgY29udmVydCB0byBwbGFpbiBvYmplY3Qgc2VsZWN0b3JcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IuJGFuZCkpIHtcbiAgICBzZWxlY3Rvci4kYW5kLmZvckVhY2goc2VsID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24oc2VsZWN0b3IsIGZsYXR0ZW5TZWxlY3RvcihzZWwpKTtcbiAgICB9KTtcblxuICAgIGRlbGV0ZSBzZWxlY3Rvci4kYW5kXG4gIH1cblxuICBjb25zdCBvYmogPSB7fVxuXG4gIE9iamVjdC5lbnRyaWVzKHNlbGVjdG9yKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAvLyBJZ25vcmluZyBsb2dpY2FsIHNlbGVjdG9ycyAoaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2Uvb3BlcmF0b3IvcXVlcnkvI2xvZ2ljYWwpXG4gICAgaWYgKCFrZXkuc3RhcnRzV2l0aChcIiRcIikpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIGlmICh2YWx1ZS4kZXEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG9ialtrZXldID0gdmFsdWUuJGVxXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZS4kaW4pICYmIHZhbHVlLiRpbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlLiRpblswXVxuICAgICAgICB9IGVsc2UgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5ldmVyeSh2ID0+ICEodHlwZW9mIHYgPT09IFwic3RyaW5nXCIgJiYgdi5zdGFydHNXaXRoKFwiJFwiKSkpKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgcmV0dXJuIG9ialxufVxuIl19
