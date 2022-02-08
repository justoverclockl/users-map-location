import app from 'flarum/admin/app';
import { extend } from 'flarum/common/extend';
import UserListPage from 'flarum/admin/components/UserListPage';

app.initializers.add('justoverclock/users-map-location', () => {
  app.extensionData.for('justoverclock-users-map-location').registerSetting({
    setting: 'justoverclock-users-map-location.mapBox-api-key',
    name: 'justoverclock-users-map-location.mapBox-api-key',
    type: 'text',
    label: app.translator.trans('justoverclock-users-map-location.admin.mapBox-api-key'),
    help: app.translator.trans('justoverclock-users-map-location.admin.mapBox-api-key-help'),
  });
  extend(UserListPage.prototype, 'columns', function (items) {
    items.add(
      'location',
      {
        name: app.translator.trans('justoverclock-users-map-location.admin.adminLocationField'),
        content: (user) => {

          return <div>{user.data.attributes.location}</div>;
        },
      },
      -50
    );
  });
});
