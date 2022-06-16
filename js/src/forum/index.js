import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import User from 'flarum/common/models/User';
import Model from 'flarum/common/Model';
import AddLocationComponent from './components/AddLocationComponent';
import UserCard from 'flarum/forum/components/UserCard';
import Leaflet from 'leaflet';

app.initializers.add('justoverclock/users-map-location', () => {
  User.prototype.location = Model.attribute('location');

  extend(UserCard.prototype, 'oncreate', function () {

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = app.forum.attribute('baseUrl') + '/assets/extensions/justoverclock-users-map-location/leaflet.edgebuffer.js'

    document.head.appendChild(script);

    const user = this.attrs.user;
    let UserLocation = user.location();
    const publicToken = app.forum.attribute('justoverclock-users-map-location.mapBox-api-key');
    const geocode = 'https://nominatim.openstreetmap.org/search?city=' + UserLocation + '&format=json';

    if (UserLocation === '') return;

    const getLatAndLon = async () => {
      try {
        const data = await fetch(geocode)
        return await data.json()
      } catch (error) {
        throw error
      }
    }

    getLatAndLon().then((coordinates) => {
        this.latitude = coordinates[0].lat;
        this.longitude = coordinates[0].lon;

        const markerIconPath = app.forum.attribute('baseUrl') + '/assets/extensions/justoverclock-users-map-location/marker-icon.png';

        let markerIcon = L.icon({
          iconUrl: markerIconPath,
          iconSize: [28, 45], // size of the icon
        });

        let map2 = L.map('map2').setView([this.latitude, this.longitude], 13);
        let marker = L.marker([this.latitude, this.longitude], { icon: markerIcon }).addTo(map2)/*.bindPopup('A pretty CSS3 popup.<br> Easily customizable.').openPopup();*/
        let layerUserCard = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, Developed by <a href="https://flarum.it/">Marco Colia</a>',
          maxZoom: 18,
          edgeBufferTiles: 1,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: publicToken,
        }).addTo(map2);
        setTimeout(() => {
          map2.invalidateSize()
        },800)

      });
  });
  extend(SettingsPage.prototype, 'oncreate', function () {
    const location = app.session.user.location();
    const publicToken = app.forum.attribute('justoverclock-users-map-location.mapBox-api-key');
    const geocode = 'https://nominatim.openstreetmap.org/search?city=' + location + '&format=json';

    if (location === '') return;

    const getLatAndLon = async () => {
      try {
        const data = await fetch(geocode)
        return await data.json()
      } catch (error) {
        throw error
      }
    }

    getLatAndLon().then((coordinates) => {
        this.latitude = coordinates[0].lat;
        this.longitude = coordinates[0].lon;

        const markerIconPath = app.forum.attribute('baseUrl') + '/assets/extensions/justoverclock-users-map-location/marker-icon.png';

        let markerIcon = L.icon({
          iconUrl: markerIconPath,
          iconSize: [28, 45], // size of the icon
        });

        let map = L.map('map').setView([this.latitude, this.longitude], 13);
        let marker = L.marker([this.latitude, this.longitude], { icon: markerIcon }).addTo(map)
        let layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
            'contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
            'Developed by <a href="https://flarum.it/">Marco Colia</a>',
          maxZoom: 18,
          edgeBufferTiles: 1,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: publicToken,
        }).addTo(map);
        map.invalidateSize()
      });
  });
  extend(SettingsPage.prototype, 'settingsItems', function (items) {
    items.add('location', <AddLocationComponent />);
    items.add('mapDiv', <div className="map-div" id="map" />);
  });
  extend(UserCard.prototype, 'infoItems', function (items) {
    const user = this.attrs.user;
    let UserLocation = user.location();
    if (UserLocation === '') return;
    items.add('mapLocation', <div className="map-div" id="map2" />, -100);
  });
});
