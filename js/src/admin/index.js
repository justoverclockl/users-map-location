import app from 'flarum/admin/app';

app.initializers.add('justoverclock/users-map-location', () => {
  app.extensionData
    .for('justoverclock-users-map-location')
    .registerSetting({
      setting: 'justoverclock-users-map-location.mapBox-api-key',
      name: 'justoverclock-users-map-location.mapBox-api-key',
      type: 'text',
      label: app.translator.trans('justoverclock-users-map-location.admin.mapBox-api-key'),
      help: app.translator.trans('justoverclock-users-map-location.admin.mapBox-api-key-help'),
    });
});
