import {
  Template
} from 'meteor/templating';
import './main.html';

Leads = new Meteor.Collection("leads");

// INFO TEMPLATE HELPERS & EVENTS
Template.info.helpers({
  leads: function () {
    return Leads.find();
  },
  leadsExists: function (){
    return Leads.find().fetch().length > 0;
  }
});

Template.info.events({
  'click button.getLeads'() {
    console.log("GETTING LEADS");
    Meteor.call("getLeads", (error) => {
      if (error) {
        return console.error(error);
      };
    })
  },
});

// LEAD TEMPLATE HELPERS & EVENTS
Template.lead.helpers({
  isChecked: function(lead) {
    return (lead.Lemlist__c === true ? 'checked' : '');
  },
});

Template.lead.events({
  'click input': function(event) {
    var x = event.currentTarget.id;
    var y =  $(event.currentTarget).is(":checked");
    Meteor.call("setLemlistFlag", x , y, (error) => {
      if (error) {
        return console.error(error);
      };
    })
    },
});