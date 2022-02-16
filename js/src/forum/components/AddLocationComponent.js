import app from 'flarum/forum/app';
import Component from 'flarum/Component';

export default class AddLocationComponent extends Component {
  oninit(vnode) {
    super.oninit(vnode);

    this.search_country = app.session.user.location_country() || 'France';
    this.search_city = ((app.session.user.location_postcode() || '') + ' ' + (app.session.user.location_city() || '')).trim();
  }

  view(vnode) {
    return (
      <fieldset className="Settings-theme">
        <legend>{app.translator.trans('justoverclock-users-map-location.forum.location')}</legend>
        <p className="location-description">{app.translator.trans('justoverclock-users-map-location.forum.locationDescription')}</p>
        <input type="text" className="FormControl search-country" id="search-country" name="search-country" value={this.search_country} onblur={this.countryChanged.bind(this)} />
        <input type="text" className="FormControl search-city" id="search-city" name="search-city" value={this.search_city} onblur={this.cityChanged.bind(this)} />
      </fieldset>
    );
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
    if(this.search_country == '' || this.search_city == '')
      return;
    
    let postcodeRegexps = [  
      '([0-9]{5})',
      '([0-9]{2} [0-9]{3})'
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
    
    //console.log(query);
    fetch('https://nominatim.openstreetmap.org/search?' + query + '&format=json&addressdetails=1')
      .then((responseText) => responseText.json())
      .then((response) => {
        console.log('search reuslts:');
        console.log(response);
        
        let foundResult = false;
        for(let idx = 0; idx < response.length; ++idx) {
          let result = response[idx];
          if((result.class=='place' && result.type=='postcode') || (result.class=='boundary' && result.type=='administrative')) {
            console.log('found valid result:');
            console.log(result);
            foundResult = true;
            
            const user = app.session.user;
            let attributes = {
              location_country: result.address.country,
              location_countrycode: result.address.country_code,
              location_postcode: result.address.postcode,
              location_city: result.address.village || result.address.town || result.address.city,
              location_latitude: result.lat,
              location_longitude: result.lon
            };
            user.save(attributes)
            .then(() => {
              this.search_country = attributes.location_country || 'France';
              this.search_city = ((attributes.location_postcode || '') + ' ' + (attributes.location_city || '')).trim();
              app.alerts.show({ type: 'success' }, app.translator.trans('justoverclock-users-map-location.forum.locationSaved'))
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
