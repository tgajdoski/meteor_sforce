import {
  Template
} from 'meteor/templating';
import './main.html';

Leads = new Meteor.Collection("leads");
LeadViews = new Meteor.Collection("leadviews");

// INFO TEMPLATE HELPERS & EVENTS
Template.info.helpers({
  leads: function () {
    return Leads.find();
  },
  leadsExists: function () {
    return Leads.find().fetch().length > 0;
  },
  leadViews: function () {
    return LeadViews.find();
  },
  leadViewsExists: function () {
    return LeadViews.find().fetch().length > 0;
  },
});
Template.info.events({
  "change #leadViews": function (event, template) {
    let selectedID = template.$("#leadViews").val();
    Meteor.call("getLeadsFromListView", selectedID, (error) => {
      if (error) {
        return console.error(error);
      };
    })
  }
});

// LEAD TEMPLATE HELPERS & EVENTS
Template.lead.helpers({
  isChecked: function (lead) {
    return (lead.Lemlist__c == "true" ? 'checked' : '');
  },
});
Template.lead.events({
  'click input': function (event) {
    let x = event.currentTarget.id;
    let y = $(event.currentTarget).is(":checked");
    Meteor.call("updateAcivityEvent", x, y, (error) => {
      if (error) {
        return console.error(error);
      };
    })
  },
});

// CREATED
Template.info.created = function () {
  // clear collections 
  Meteor.call("removeAllLeads", (error, data) => {
    if (error) {
      return console.error(error);
    };
  })
  Meteor.call("removeAllLeadViews", (error, data) => {
    if (error) {
      return console.error(error);
    };
  })
  // get Lead List View
  Meteor.call("getListViews", 'Lead', (error, data) => {
    if (error) {
      return console.error(error);
    };
  })
};