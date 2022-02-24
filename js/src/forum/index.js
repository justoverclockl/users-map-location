import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import User from 'flarum/common/models/User';
import Model from 'flarum/common/Model';
import AddLocationComponent from './components/AddLocationComponent';
import UserCard from 'flarum/forum/components/UserCard';
import Leaflet from 'leaflet';

app.initializers.add('justoverclock/users-map-location', () => {
  User.prototype.location_country = Model.attribute('location_country');
  User.prototype.location_countrycode = Model.attribute('location_countrycode');
  User.prototype.location_postcode = Model.attribute('location_postcode');
  User.prototype.location_city = Model.attribute('location_city');
  User.prototype.location_latitude = Model.attribute('location_latitude');
  User.prototype.location_longitude = Model.attribute('location_longitude');
  
  extend(UserCard.prototype, 'infoItems', function (items) {
    const user = this.attrs.user;
    
    if(user.location_latitude()) {
      items.add('mapLocation', <div className="location-map location-map-user-profile"/>, -100);
    }
  });

  extend(UserCard.prototype, 'oncreate', function (originalResult, vnode) {
    const user = this.attrs.user;
    
    let location = user.location_latitude()
      ? {
        lat: user.location_latitude(),
        lon: user.location_longitude()
      }
      : null;

    if (!location) return;
    
    let mapElement = vnode.dom.getElementsByClassName('location-map')[0];

    const publicToken = app.forum.attribute('justoverclock-users-map-location.mapBox-api-key');
    const markerIconPath = app.forum.attribute('baseUrl') + '/assets/extensions/justoverclock-users-map-location/marker-icon.png';

    let markerIcon = L.icon({
      iconUrl: markerIconPath,
      iconSize: [25, 41], // size of the icon
      iconAnchor: [13, 40]
    });

    let map = L.map(mapElement).setView([location.lat, location.lon], 13);
    let layerUserCard = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Developed by <a href="https://flarum.it/">Marco Colia</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: publicToken,
    }).addTo(map);
  });

  extend(SettingsPage.prototype, 'settingsItems', function (items) {
    items.add('location', <AddLocationComponent />);
  });
});

export {
  AddLocationComponent
}
