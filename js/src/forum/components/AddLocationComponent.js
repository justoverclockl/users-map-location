import app from 'flarum/forum/app';
import Component from 'flarum/Component';

export default class AddLocationComponent extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.location = app.session.user.location();
  }

  view(vnode) {
    return (
      <fieldset className="Settings-theme">
        <legend>{app.translator.trans('justoverclock-users-map-location.forum.location')}</legend>
        <p className="location-description">{app.translator.trans('justoverclock-users-map-location.forum.locationDescription')}</p>
        <input type="text" className="FormControl location" id="location" name="location" value={this.location} onblur={this.saveValue.bind(this)} />
      </fieldset>
    );
  }

  saveValue(e) {
    const user = app.session.user;
    user.save({
      location: e.target.value,
    })
      .then(app.alerts.show({type: 'success'}, app.translator.trans('justoverclock-users-map-location.forum.locationSaved')));
  }
}
