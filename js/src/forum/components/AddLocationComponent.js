import app from 'flarum/forum/app';
import Component from 'flarum/Component';
import Switch from 'flarum/common/components/Switch';

export default class AddLocationComponent extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.search_country = app.session.user.location_country() || 'France';
    this.search_city = ((app.session.user.location_postcode() || '') + ' ' + (app.session.user.location_city() || '')).trim();
    
    this.location = app.session.user.location_latitude()
      ? {
        lat: app.session.user.location_latitude(),
        lon: app.session.user.location_longitude()
      }
      : null;
    //console.log(this.location);
    
    this.enableLocation = this.location != null;
    
    this.map = null;
    this.locationMarker = null;
  }

  view(vnode) {
    return (
      <fieldset className="Settings-theme">
        <legend>{app.translator.trans('justoverclock-users-map-location.forum.location')}</legend>
        
        <Switch state={this.enableLocation} onchange={val => this.setEnableLocation(val)}>{app.translator.trans('justoverclock-users-map-location.forum.enableLocation')}</Switch>
        
        <div className="fieldset-separator"></div>
        
        { this.enableLocation ? <div>
          <label for="search-country">{app.translator.trans('justoverclock-users-map-location.forum.locationCountry')}</label>
          <input type="text" className="FormControl search-country" id="search-country" name="search-country" value={this.search_country} onblur={this.countryChanged.bind(this)} />
          
          <div className="fieldset-separator"></div>
          
          <label for="search-city">{app.translator.trans('justoverclock-users-map-location.forum.locationCity')}</label>  
          <p className="helpText">{app.translator.trans('justoverclock-users-map-location.forum.locationCityDescription')}</p>
          <input type="text" className="FormControl search-city" id="search-city" name="search-city" value={this.search_city} onblur={this.cityChanged.bind(this)} />
          
          <div className="fieldset-separator"></div>
          
          {this.location ? <div className="location-map" /> : []}
        </div> : [] }
      </fieldset>
    );
  }
  
  setEnableLocation(enable) {
    this.enableLocation = enable;
    if(this.location && !this.enableLocation) {
      this.search_country = '';
      this.search_city = '';
      this.save();
    }
  }
  
  onupdate(vnode) {
    let dom = vnode.dom;
    let mapElements = dom.getElementsByClassName('location-map');
    
    if(mapElements.length > 0) {
      if(!this.map) {
        let mapElement = mapElements[0];
        
        const publicToken = app.forum.attribute('justoverclock-users-map-location.mapBox-api-key');
        const markerIconPath = app.forum.attribute('baseUrl') + '/assets/extensions/justoverclock-users-map-location/marker-icon.png';

            let markerIcon = L.icon({
              iconUrl: markerIconPath,
              iconSize: [25, 41], // size of the icon
              iconAnchor: [13, 40]
            });
    
            this.map = L.map(mapElement);
            this.locationMarker = L.marker([this.location.lat, this.location.lon], { icon: markerIcon }).addTo(this.map);
            let layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
              attribution:
                'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                'contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>, ' +
                'Developed by <a href="https://flarum.it/">Marco Colia</a>',
              maxZoom: 18,
              id: 'mapbox/streets-v11',
              tileSize: 512,
              zoomOffset: -1,
              accessToken: publicToken,
            }).addTo(this.map);
            
            this.updateMap();
      }
    } else {
      this.map = null;
      this.locationMarker = null;
    }
  }
  
  updateMap() {
    if(this.map && this.location) {
      this.map.setView([this.location.lat, this.location.lon], 7)
      this.locationMarker.setLatLng([this.location.lat, this.location.lon]);
    }
  }

  countryChanged(e) {
    this.search_country = e.target.value.trim();
    this.save();
  }
  
  cityChanged(e) {
    this.search_city = e.target.value.trim();
    this.save();
  }
  
  save() {
    if(this.search_country == '' || this.search_city == '') {
      if(this.location) {
        const user = app.session.user;
        let attributes = {
          location_country: null,
          location_countrycode: null,
          location_postcode: null,
          location_city: null,
          location_latitude: null,
          location_longitude: null
        };
        user.save(attributes)
        .then(() => {
          this.search_country = 'France';
          this.search_city = '';
          this.location = null;
          app.alerts.show({ type: 'success' }, app.translator.trans('justoverclock-users-map-location.forum.locationCleared'))
          
          this.updateMap();
        });
      }
      
      return;
    }
    
    let postcodeRegexps = [  
      '([0-9]{5})', // used in many countries (ex: 75000)
      '([0-9]{2} [0-9]{3})', // same, but with a space (ex: 75 000)
      '([A-Z0-9]{3} [A-Z0-9]{3})', // Canada (ex: H3B 1M7)
      '([0-9]{4})', // used in a lot of small countries
    ];
    
    let postcode = '';
    let city = '';
    for(let postcodeReIdx = 0; postcodeReIdx < postcodeRegexps.length; ++postcodeReIdx) {
      let postcodeRe = postcodeRegexps[postcodeReIdx];
      for(let mode = 0; mode <= 2; ++mode) {
        let re;
        if(mode == 0) {
          re = new RegExp('^' + postcodeRe + '$');
        } else {
          re = new RegExp('^' + (mode == 1 ? postcodeRe + '[, ]+(.*)' : '(.*)[, ]+' + postcodeRe) + '$');
        }
        let match = this.search_city.match(re);
        if(match) {
          if(mode == 0) {
            postcode = match[1];
            city = '';
          } else {
            postcode = match[mode == 1 ? 1 : 2];
            city = match[mode == 1 ? 2 : 1];
          }
          break;
        }
      }
    }
    
    if(postcode == '' && city == '')
      city = this.search_city;
    
    if(postcode != '') postcode = 'postalcode='+encodeURI(postcode.split(' ').join(''));
    if(city != '') city = 'city='+encodeURI(city);
    
    let query = postcode == '' ? city : postcode + (city == '' ? '' : '&' + city);
    query += '&country=' + encodeURIComponent(this.search_country);
    
    fetch('https://nominatim.openstreetmap.org/search?' + query + '&format=json&addressdetails=1')
      .then((responseText) => responseText.json())
      .then((response) => {
        //console.log('search reuslts:');
        //console.log(response);
        
        let foundResult = false;
        for(let idx = 0; idx < response.length; ++idx) {
          let result = response[idx];
          if((result.class=='place' && result.type=='postcode') || (result.class=='boundary' && result.type=='administrative')) {
            //console.log('found valid result:');
            //console.log(result);
            foundResult = true;
            
            const user = app.session.user;
            let attributes = {
              location_country: result.address.country,
              location_countrycode: result.address.country_code,
              location_postcode: result.address.postcode,
              location_city: result.address.village || result.address.town || result.address.city || result.address.administrative,
              location_latitude: result.lat,
              location_longitude: result.lon
            };
            user.save(attributes)
            .then(() => {
              this.search_country = attributes.location_country || 'France';
              this.search_city = ((attributes.location_postcode || '') + ' ' + (attributes.location_city || '')).trim();
              this.location = {
                lat: attributes.location_latitude,
                lon: attributes.location_longitude
              };
              app.alerts.show({ type: 'success' }, app.translator.trans('justoverclock-users-map-location.forum.locationSaved'))
              
              this.updateMap();
            });
            
            break;
          }
        }
        
        if(!foundResult) {
          app.alerts.show({ type: 'error' }, app.translator.trans('justoverclock-users-map-location.forum.locationNotFound'))
        }
      });
  }
}
