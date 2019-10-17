import jsforce from 'jsforce';
import {
  Meteor
} from 'meteor/meteor';
let connection; // all requests will receive this instance
module.exports = {
  async getInstance() {
    // async singleton; 
    // only the first call to getInstance will use these options to create an instance
    if (!connection) {
      connection = new jsforce.Connection({
        loginUrl: Meteor.settings.loginURL
      });


      // // ************ uncomment to login with OAUTH ************
      // connection = new jsforce.Connection({
      //   oauth2: {
      //     // you can change loginUrl to connect to sandbox or prerelease env.
      //     loginUrl: Meteor.settings.loginURL,
      //     clientId: Meteor.settings.clientId,
      //     clientSecret: Meteor.settings.clientSecret,
      //     redirectUri: Meteor.settings.redirectUri
      //   }
      // });

      await connection.login(Meteor.settings.username, Meteor.settings.pass.concat(Meteor.settings.token), err => {
        if (err) {
          return console.error(err);
        }
      });
    }
    return connection;
  }
}