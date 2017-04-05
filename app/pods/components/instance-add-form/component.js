import Ember from 'ember';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import {validatePresence} from 'ember-changeset-validations/validators';

const validations = {
  'slug': [
    validatePresence(true)
  ],
  'osversion': [
    validatePresence(true)
  ],
  'event_name': [
    validatePresence(true)
  ],
  'parent_domain': [
    validatePresence(true)
  ],
  'event_description': [
    validatePresence(true)
  ],
  'event_date': [
    validatePresence(true)
  ],
  'event_location': [
    validatePresence(true)
  ],
  'event_organizer': [
    validatePresence(true)
  ],
  'admin_first_name': [
    validatePresence(true)
  ],
  'admin_last_name': [
    validatePresence(true)
  ]
};

export default Ember.Component.extend({
  store: Ember.inject.service(),
  changeset: function () {
    return new Changeset(this.get('instance'), lookupValidator(validations), validations);
  }.property('instance'),

  domainOptions: function () {
    const domainOptions = Ember.A([Ember.Object.create({
      id: null,
      domain: '---',
      domainValue: null
    })]);
    return domainOptions.concat(this.get('domains').map(function (domainData) {
      return Ember.Object.create({
        id: domainData.get('id'),
        domain: domainData.get('domain'),
        domainValue: domainData.get('domain')
      });
    }));
  }.property('domains'),

  actions: {
    submit: async function (changeset) {
      await changeset.validate();

      const instanceList = await this.get('store').findAll('instance');
      let valid = true;
      const domain = `${changeset.get('slug')}.${changeset.get('parent_domain')}`;

      instanceList.forEach((existingInstance) => {
        if (existingInstance.get('id') && existingInstance.get('domain').toLowerCase() === domain.toLowerCase()) {
          changeset.addError('slug', ['already taken']);
          valid = false;
        }
      });

      if (!valid) {
        return false;
      }

      if (!changeset.get('isValid')) {
        return false;
      }

      if (!changeset.get('osversion.id')) {
        changeset.set('osversion', this.get('defaultVersion'));
      }

      const instance = await changeset.save();
      this.sendAction('saved', instance);
    }
  }
});
