import {
  Meteor
} from 'meteor/meteor';
import connectionHandler from './connectionHandler';
import jsforce from 'jsforce';

Leads = new Meteor.Collection("leads");

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  async removeAllLeads() {
    return await Leads.remove({});
  },
  async getLeads() {
    await Meteor.call('removeAllLeads');
    let conn = await connectionHandler.getInstance();
    let records = await conn.query("SELECT Id, Name, Title, Company, Status, Lemlist__c FROM Lead", function (err, result) {
      if (err) {
        return console.error(err);
      }
      return result;
    });
    Leads.rawCollection().insert(records.records);
  },

  async getSingleLead(id) {
    let conn = await connectionHandler.getInstance();
    let rawDoc = await conn.sobject('Lead')
      .findOne({
        'Id': id
      });
    let localDoc = Leads.findOne({
      Id: id
    });

    // mongoDB changes - not to call salesforce again and refresh whole list
    Leads.update({
      _id: localDoc._id
    }, {
      $set: {
        "Lemlist__c": rawDoc.Lemlist__c,
        "Status": rawDoc.Status
      }
    });
  },

  async setLemlistFlag(id, val) {
    let conn = await connectionHandler.getInstance();
    let status = val ? 'Working - Contacted' : 'Closed - Not Converted';

    let rowLead = await conn.sobject('Lead').retrieve(id, function (err, ret) {
      if (err || !ret.success) {
        return console.error(err, JSON.stringify(ret))
      }
    });

    await conn.sobject('Lead')
      .find({
        'Id': id
      })
      .update({
        'Lemlist__c': val,
        'Status': status
      }, function (err, ret) {
        if (err || !ret.success) {
          return console.error(err, JSON.stringify(ret))
        }
      });

    // insert activity
    let subject = `lead ${rowLead.Name} opened the email ${rowLead.Email} of the campaign YYY`
    await Meteor.call('updateAcivity', subject);
    // refresh local list
    await Meteor.call('getSingleLead', id);
    // // update whole collection
    // await Meteor.call('getLeads');
  },

  async updateAcivity(subject, ) {
    let conn = await connectionHandler.getInstance();

    let task = {
      'OwnerId': conn.userInfo.id,
      'Status': "Completed",
      'Subject': subject,
      'Priority': "Normal",
      'WhatId': "7013X000000jUUTQA2",
      'ActivityDate': new Date()
    }

    await conn.sobject("Task").create(task, function (err, ret) {
      if (err || !ret.success) {
        return console.error(err, JSON.stringify(ret))
      }
    });
  },
});