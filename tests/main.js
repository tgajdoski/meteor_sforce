import {
  assert
} from "chai";
import {
  resetDatabase
} from 'meteor/xolvio:cleaner';
import {
  getLeads
} from '../server/main';


import connectionHandler from '../server/connectionHandler';

describe("meteor_jsforce", function () {
  beforeEach(function () {
    resetDatabase();
  });

  it("package.json has correct name", async function () {
    const {
      name
    } = await import("../package.json");
    assert.strictEqual(name, "meteor_jsforce");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }
});

describe("jsforce methods, login, getLeads... ", function () {
  beforeEach(function () {
    getLeads = Meteor.server.method_handlers.getLeads;
    setLemlistFlag = Meteor.server.method_handlers.setLemlistFlag;
  });

  let conn;
  it("should login by username and password", async function (done) {
    conn = await connectionHandler.getInstance();
    assert.isString(conn.accessToken);
    assert.isString(conn.userInfo.id);
    assert.isString(conn.userInfo.organizationId);
    assert.isString(conn.instanceUrl);
    assert.equal(conn.instanceUrl, "https://eu29.salesforce.com");
    done();
  });

  it('can call get leads and return array', async function () {
    resetDatabase();
    await getLeads.apply();
    let res = Leads.find().fetch();
    assert.isArray(res);
  });

  it('can call set flag', async function () {
    // TODO: change acctual call to salseforce with mock call
    let res = Leads.find().fetch();
    let id = res[0].Id;
    let oldFlag = res[0].Lemlist__c;
    let oposite = !oldFlag;
    await setLemlistFlag(id, oposite);
    res = Leads.find().fetch();
    let newFlag = res[0].Lemlist__c;
    assert.equal(oldFlag, !newFlag);
  });

});