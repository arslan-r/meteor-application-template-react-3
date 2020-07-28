var require = meteorInstall({"imports":{"api":{"stuff":{"Stuff.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// imports/api/stuff/Stuff.js                                                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
module.export({
  Stuffs: () => Stuffs,
  StuffSchema: () => StuffSchema
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 1);
let Tracker;
module.link("meteor/tracker", {
  Tracker(v) {
    Tracker = v;
  }

}, 2);

/** Define a Mongo collection to hold the data. */
const Stuffs = new Mongo.Collection('Stuffs');
/** Define a schema to specify the structure of each document in the collection. */

const StuffSchema = new SimpleSchema({
  name: String,
  quantity: Number,
  owner: String,
  condition: {
    type: String,
    allowedValues: ['excellent', 'good', 'fair', 'poor'],
    defaultValue: 'good'
  }
}, {
  tracker: Tracker
});
/** Attach this schema to the collection. */

Stuffs.attachSchema(StuffSchema);
/** Make the collection and schema available to other code. */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"startup":{"server":{"Accounts.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// imports/startup/server/Accounts.js                                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 1);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 2);

/* eslint-disable no-console */
function createUser(email, password, role) {
  console.log("  Creating user ".concat(email, "."));
  const userID = Accounts.createUser({
    username: email,
    email: email,
    password: password
  });

  if (role === 'admin') {
    Roles.addUsersToRoles(userID, 'admin');
  }
}
/** When running app for first time, pass a settings file to set up a default user account. */


if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.map((_ref) => {
      let {
        email,
        password,
        role
      } = _ref;
      return createUser(email, password, role);
    });
  } else {
    console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Mongo.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// imports/startup/server/Mongo.js                                                                                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Stuffs;
module.link("../../api/stuff/Stuff.js", {
  Stuffs(v) {
    Stuffs = v;
  }

}, 1);

/* eslint-disable no-console */

/** Initialize the database with a default data document. */
function addData(data) {
  console.log("  Adding: ".concat(data.name, " (").concat(data.owner, ")"));
  Stuffs.insert(data);
}
/** Initialize the collection if empty. */


if (Stuffs.find().count() === 0) {
  if (Meteor.settings.defaultData) {
    console.log('Creating default data.');
    Meteor.settings.defaultData.map(data => addData(data));
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Publications.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// imports/startup/server/Publications.js                                                                         //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Roles;
module.link("meteor/alanning:roles", {
  Roles(v) {
    Roles = v;
  }

}, 1);
let Stuffs;
module.link("../../api/stuff/Stuff", {
  Stuffs(v) {
    Stuffs = v;
  }

}, 2);

/** This subscription publishes only the documents associated with the logged in user */
Meteor.publish('Stuff', function publish() {
  if (this.userId) {
    const username = Meteor.users.findOne(this.userId).username;
    return Stuffs.find({
      owner: username
    });
  }

  return this.ready();
});
/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */

Meteor.publish('StuffAdmin', function publish() {
  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Stuffs.find();
  }

  return this.ready();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"main.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// server/main.js                                                                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
module.link("/imports/startup/server/Accounts");
module.link("/imports/startup/server/Publications");
module.link("/imports/startup/server/Mongo");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".mjs",
    ".jsx"
  ]
});

require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvc3R1ZmYvU3R1ZmYuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvQWNjb3VudHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvTW9uZ28uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvUHVibGljYXRpb25zLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJTdHVmZnMiLCJTdHVmZlNjaGVtYSIsIk1vbmdvIiwibGluayIsInYiLCJTaW1wbGVTY2hlbWEiLCJkZWZhdWx0IiwiVHJhY2tlciIsIkNvbGxlY3Rpb24iLCJuYW1lIiwiU3RyaW5nIiwicXVhbnRpdHkiLCJOdW1iZXIiLCJvd25lciIsImNvbmRpdGlvbiIsInR5cGUiLCJhbGxvd2VkVmFsdWVzIiwiZGVmYXVsdFZhbHVlIiwidHJhY2tlciIsImF0dGFjaFNjaGVtYSIsIk1ldGVvciIsIkFjY291bnRzIiwiUm9sZXMiLCJjcmVhdGVVc2VyIiwiZW1haWwiLCJwYXNzd29yZCIsInJvbGUiLCJjb25zb2xlIiwibG9nIiwidXNlcklEIiwidXNlcm5hbWUiLCJhZGRVc2Vyc1RvUm9sZXMiLCJ1c2VycyIsImZpbmQiLCJjb3VudCIsInNldHRpbmdzIiwiZGVmYXVsdEFjY291bnRzIiwibWFwIiwiYWRkRGF0YSIsImRhdGEiLCJpbnNlcnQiLCJkZWZhdWx0RGF0YSIsInB1Ymxpc2giLCJ1c2VySWQiLCJmaW5kT25lIiwicmVhZHkiLCJ1c2VySXNJblJvbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLFFBQU0sRUFBQyxNQUFJQSxNQUFaO0FBQW1CQyxhQUFXLEVBQUMsTUFBSUE7QUFBbkMsQ0FBZDtBQUErRCxJQUFJQyxLQUFK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TSxDQUFDSyxJQUFQLENBQVksa0NBQVo7QUFBZ0RMLE1BQU0sQ0FBQ0ssSUFBUCxDQUFZLHNDQUFaO0FBQW9ETCxNQUFNLENBQUNLLElBQVAsQ0FBWSwrQkFBWixFIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcclxuaW1wb3J0IHsgVHJhY2tlciB9IGZyb20gJ21ldGVvci90cmFja2VyJztcclxuXHJcbi8qKiBEZWZpbmUgYSBNb25nbyBjb2xsZWN0aW9uIHRvIGhvbGQgdGhlIGRhdGEuICovXHJcbmNvbnN0IFN0dWZmcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdTdHVmZnMnKTtcclxuXHJcbi8qKiBEZWZpbmUgYSBzY2hlbWEgdG8gc3BlY2lmeSB0aGUgc3RydWN0dXJlIG9mIGVhY2ggZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uICovXHJcbmNvbnN0IFN0dWZmU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgbmFtZTogU3RyaW5nLFxyXG4gIHF1YW50aXR5OiBOdW1iZXIsXHJcbiAgb3duZXI6IFN0cmluZyxcclxuICBjb25kaXRpb246IHtcclxuICAgIHR5cGU6IFN0cmluZyxcclxuICAgIGFsbG93ZWRWYWx1ZXM6IFsnZXhjZWxsZW50JywgJ2dvb2QnLCAnZmFpcicsICdwb29yJ10sXHJcbiAgICBkZWZhdWx0VmFsdWU6ICdnb29kJyxcclxuICB9LFxyXG59LCB7IHRyYWNrZXI6IFRyYWNrZXIgfSk7XHJcblxyXG4vKiogQXR0YWNoIHRoaXMgc2NoZW1hIHRvIHRoZSBjb2xsZWN0aW9uLiAqL1xyXG5TdHVmZnMuYXR0YWNoU2NoZW1hKFN0dWZmU2NoZW1hKTtcclxuXHJcbi8qKiBNYWtlIHRoZSBjb2xsZWN0aW9uIGFuZCBzY2hlbWEgYXZhaWxhYmxlIHRvIG90aGVyIGNvZGUuICovXHJcbmV4cG9ydCB7IFN0dWZmcywgU3R1ZmZTY2hlbWEgfTtcclxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XHJcbmltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xyXG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJ21ldGVvci9hbGFubmluZzpyb2xlcyc7XHJcblxyXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXHJcblxyXG5mdW5jdGlvbiBjcmVhdGVVc2VyKGVtYWlsLCBwYXNzd29yZCwgcm9sZSkge1xyXG4gIGNvbnNvbGUubG9nKGAgIENyZWF0aW5nIHVzZXIgJHtlbWFpbH0uYCk7XHJcbiAgY29uc3QgdXNlcklEID0gQWNjb3VudHMuY3JlYXRlVXNlcih7XHJcbiAgICB1c2VybmFtZTogZW1haWwsXHJcbiAgICBlbWFpbDogZW1haWwsXHJcbiAgICBwYXNzd29yZDogcGFzc3dvcmQsXHJcbiAgfSk7XHJcbiAgaWYgKHJvbGUgPT09ICdhZG1pbicpIHtcclxuICAgIFJvbGVzLmFkZFVzZXJzVG9Sb2xlcyh1c2VySUQsICdhZG1pbicpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFdoZW4gcnVubmluZyBhcHAgZm9yIGZpcnN0IHRpbWUsIHBhc3MgYSBzZXR0aW5ncyBmaWxlIHRvIHNldCB1cCBhIGRlZmF1bHQgdXNlciBhY2NvdW50LiAqL1xyXG5pZiAoTWV0ZW9yLnVzZXJzLmZpbmQoKS5jb3VudCgpID09PSAwKSB7XHJcbiAgaWYgKE1ldGVvci5zZXR0aW5ncy5kZWZhdWx0QWNjb3VudHMpIHtcclxuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyB0aGUgZGVmYXVsdCB1c2VyKHMpJyk7XHJcbiAgICBNZXRlb3Iuc2V0dGluZ3MuZGVmYXVsdEFjY291bnRzLm1hcCgoeyBlbWFpbCwgcGFzc3dvcmQsIHJvbGUgfSkgPT4gY3JlYXRlVXNlcihlbWFpbCwgcGFzc3dvcmQsIHJvbGUpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc29sZS5sb2coJ0Nhbm5vdCBpbml0aWFsaXplIHRoZSBkYXRhYmFzZSEgIFBsZWFzZSBpbnZva2UgbWV0ZW9yIHdpdGggYSBzZXR0aW5ncyBmaWxlLicpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHsgU3R1ZmZzIH0gZnJvbSAnLi4vLi4vYXBpL3N0dWZmL1N0dWZmLmpzJztcclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cclxuXHJcbi8qKiBJbml0aWFsaXplIHRoZSBkYXRhYmFzZSB3aXRoIGEgZGVmYXVsdCBkYXRhIGRvY3VtZW50LiAqL1xyXG5mdW5jdGlvbiBhZGREYXRhKGRhdGEpIHtcclxuICBjb25zb2xlLmxvZyhgICBBZGRpbmc6ICR7ZGF0YS5uYW1lfSAoJHtkYXRhLm93bmVyfSlgKTtcclxuICBTdHVmZnMuaW5zZXJ0KGRhdGEpO1xyXG59XHJcblxyXG4vKiogSW5pdGlhbGl6ZSB0aGUgY29sbGVjdGlvbiBpZiBlbXB0eS4gKi9cclxuaWYgKFN0dWZmcy5maW5kKCkuY291bnQoKSA9PT0gMCkge1xyXG4gIGlmIChNZXRlb3Iuc2V0dGluZ3MuZGVmYXVsdERhdGEpIHtcclxuICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBkZWZhdWx0IGRhdGEuJyk7XHJcbiAgICBNZXRlb3Iuc2V0dGluZ3MuZGVmYXVsdERhdGEubWFwKGRhdGEgPT4gYWRkRGF0YShkYXRhKSk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBSb2xlcyB9IGZyb20gJ21ldGVvci9hbGFubmluZzpyb2xlcyc7XHJcbmltcG9ydCB7IFN0dWZmcyB9IGZyb20gJy4uLy4uL2FwaS9zdHVmZi9TdHVmZic7XHJcblxyXG4vKiogVGhpcyBzdWJzY3JpcHRpb24gcHVibGlzaGVzIG9ubHkgdGhlIGRvY3VtZW50cyBhc3NvY2lhdGVkIHdpdGggdGhlIGxvZ2dlZCBpbiB1c2VyICovXHJcbk1ldGVvci5wdWJsaXNoKCdTdHVmZicsIGZ1bmN0aW9uIHB1Ymxpc2goKSB7XHJcbiAgaWYgKHRoaXMudXNlcklkKSB7XHJcbiAgICBjb25zdCB1c2VybmFtZSA9IE1ldGVvci51c2Vycy5maW5kT25lKHRoaXMudXNlcklkKS51c2VybmFtZTtcclxuICAgIHJldHVybiBTdHVmZnMuZmluZCh7IG93bmVyOiB1c2VybmFtZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRoaXMucmVhZHkoKTtcclxufSk7XHJcblxyXG4vKiogVGhpcyBzdWJzY3JpcHRpb24gcHVibGlzaGVzIGFsbCBkb2N1bWVudHMgcmVnYXJkbGVzcyBvZiB1c2VyLCBidXQgb25seSBpZiB0aGUgbG9nZ2VkIGluIHVzZXIgaXMgdGhlIEFkbWluLiAqL1xyXG5NZXRlb3IucHVibGlzaCgnU3R1ZmZBZG1pbicsIGZ1bmN0aW9uIHB1Ymxpc2goKSB7XHJcbiAgaWYgKHRoaXMudXNlcklkICYmIFJvbGVzLnVzZXJJc0luUm9sZSh0aGlzLnVzZXJJZCwgJ2FkbWluJykpIHtcclxuICAgIHJldHVybiBTdHVmZnMuZmluZCgpO1xyXG4gIH1cclxuICByZXR1cm4gdGhpcy5yZWFkeSgpO1xyXG59KTtcclxuIiwiaW1wb3J0ICcvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9BY2NvdW50cyc7XHJcbmltcG9ydCAnL2ltcG9ydHMvc3RhcnR1cC9zZXJ2ZXIvUHVibGljYXRpb25zJztcclxuaW1wb3J0ICcvaW1wb3J0cy9zdGFydHVwL3NlcnZlci9Nb25nbyc7XHJcbiJdfQ==
