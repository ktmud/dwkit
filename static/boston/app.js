(function() {
  var $ = function(selector) {
    return document.querySelectorAll(selector)
  }
  var infobox = $('#infobox .info')[0]
  var layer = $('#layer')[0]
  var opacity = $('#opacity')[0]
  var map;
  var cache = {};
	var LOADER = '<span class="loading">Loading...</span>';

  function loadLayer() {
    if (!map) return;
    var key = layer.value
    // clean all layers data
		map.data.forEach(function(feature) {
			map.data.remove(feature);
		});
    if (cache[key]) {
      cache[key].forEach(function(feature) {
        map.data.add(feature)
      });
    } else {
      start();
      map.data.loadGeoJson('./shapes/' + key + '.json', null, function(data) {
        cache[key] = data
        done();
      })
    }

    var t = 0;
    function start() {
      clearTimeout(t);
      t = setTimeout(function() {
        infobox.innerHTML = LOADER;
      }, 100)
    }
    function done() {
      setTimeout(function() {
				infobox.innerHTML = '';
      }, 400);
    }
  }

  function setStyle() {
    if (!map) return;
    map.data.setStyle(function(feature) {
      var alpha = opacity.value / 100
      if (feature.getProperty("isSelected")) {
				var alpha2 = Math.min(alpha + 0.2, 1)
        return {
          fillColor: '#f33',
          fillOpacity: alpha2,
          strokeColor: '#933',
          strokeWeight: 1,
          strokeOpacity: alpha2
        }
      }
      return {
        fillColor: '#fcc',
        fillOpacity: alpha,
        strokeColor: '#000',
        strokeWeight: 1,
        strokeOpacity: alpha / 3
      }
    })
  }

  layer.addEventListener('change', function(e) {
    loadLayer()
  })
  opacity.addEventListener('change', function(e) {
    setStyle()
  })
  opacity.addEventListener('input', function(e) {
    $('.opacity-value')[0].innerHTML = this.value + '%';
  })

  function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 42.321, lng: -71.089773
      },
      scrollwheel: false,
      zoom: 12
    });

    loadLayer();
    setStyle();

    var lastText = '';
    var keys = [
      'ISD_Nbhd', 'BRA_PD', 'NSA_NAME',
      'CT_ID_10', 'BG_ID_10', 'Blk_ID_10',
      'ZIPCODE', 'ALAND10', 'AWATER10'
    ]
    var names = {
      PWD: 'PubWork Distr',
      ALAND10: 'Land Area',
      AWATER10: 'Water Area'
    }
    var getInfo = function(feature) {
      return '<ul>' + keys.map(function(key) {
        var val = feature.getProperty(key)
        var name = names[key] || key
        if (val) return '<li><b>' + name + '</b>' + val
      }).filter(function(item) { return item }).join('') + '<ul>'
    }
    map.data.addListener('click', function(event) {
      // toggle selected status
      if (event.feature.getProperty('isSelected')) {
        event.feature.setProperty('isSelected', false)
        lastText = ''
      } else {
        event.feature.setProperty('isSelected', true)
        lastText = getInfo(event.feature)
      }
    })
    map.data.addListener('mouseover', function(event) {
      map.data.revertStyle()
      map.data.overrideStyle(event.feature, {
        strokeColor: "#e00",
        strokeOpacity: 0.5,
        strokeWeight: 2
      })
      infobox.innerHTML = getInfo(event.feature)
    })
    map.data.addListener('mouseout', function(event) {
      map.data.revertStyle()
      infobox.innerHTML = lastText
    })
  }

  window.initMap = initMap;
})();

