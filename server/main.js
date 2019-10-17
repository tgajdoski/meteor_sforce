import {
  Meteor
} from 'meteor/meteor';
import connectionHandler from './connectionHandler';

Leads = new Meteor.Collection("leads");
LeadViews = new Meteor.Collection("leadviews");

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  async removeAllLeads() {
    return await Leads.remove({});
  },
  async removeAllLeadViews() {
    return await LeadViews.remove({});
  },
  async getListViews(type) {
    await Meteor.call('removeAllLeadViews');
    let conn = await connectionHandler.getInstance();
    let records = await conn.sobject(type).listviews((err, ret) => {
      if (err) {
        return console.error(err);
      }
      return ret;
    });
    LeadViews.rawCollection().insert(records.listviews);
  },
  async getLeadsFromListView(id) {
    await Meteor.call('removeAllLeads');
    let conn = await connectionHandler.getInstance();
    let records = await conn.sobject("Lead").listview(id).results((err, result) => {
      if (err) {
        return console.error(err);
      }
      return result;
    });

    // convert ListViewResultInfo to lead - mapping fields to JSON
    // http://jsforce.github.io/jsforce/doc/ListView.html
    // other way: extract leadID in array of ids and go fetch lead objects by [ids]
    let columnsArray = records.records.map(r => {
      return r.columns;
    });

    let leads = [];
    columnsArray.map(r => {
      var jsonData = {};
      r.map(ir => {
        // Mongo key must not contain '.'; replace . with _
        let columnName = ir.fieldNameOrPath.replace('.', '_');;
        jsonData[columnName] = ir.value;
        return jsonData;
      });
      leads.push(jsonData);
    });
    Leads.rawCollection().insert(leads);
  },
  async updateAcivityEvent(id, val) {
    let conn = await connectionHandler.getInstance();
    // get Lead
    let rowLead = await conn.sobject('Lead')
      .findOne({
        'Id': id
      });

    // create activity event
    let subject = `lead ${rowLead.Name} opened the email ${rowLead.Email} `
    let event = {
      'OwnerId': conn.userInfo.id,
      'Subject': subject,
      'WhoId': id,
      'StartDateTime': new Date(),
      'EndDateTime': new Date(),
      'Description': 'processed with Lemlist'
    }

    await conn.sobject("Event").create(event, function (err, ret) {
      if (err || !ret.success) {
        return console.error(err, JSON.stringify(ret))
      }
    });

    // no needed - update example
    await Meteor.call('persistProcessedLeadCheckbox', id, val);
  },

  // just for demo checkbox to stay checked
  async persistProcessedLeadCheckbox(id, val) {
    let conn = await connectionHandler.getInstance();
    await conn.sobject('Lead').find({
      'Id': id
    }).update({
      'Lemlist__c': val
    }, function (err, ret) {
      if (err || !ret.success) {
        return console.error(err, JSON.stringify(ret))
      }
    });

    let localDoc = Leads.findOne({
      Id: id
    });

    Leads.update({
      _id: localDoc._id
    }, {
      $set: {
        "Lemlist__c": val
      }
    });

  }
});