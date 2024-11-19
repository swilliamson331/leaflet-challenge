// URL for earthquake data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson"

// magnitude function for size of markers
function Magnitude(magnitude) {
    return magnitude * 5;
}

// depth of earthquake function for color of markers
function color(depth) {
    let colorScale = d3.scaleLinear()
      .domain([0, 50, 100, 200]) // Adjust domain for your data range
      .range(['#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000']); // Blue to red gradient
    return colorScale(depth);
  }

// popups for additional information on earthquakes
function Popup(properties, depth) {
    let { mag, place } = properties;
    return `<b>Magnitude:</b> ${mag}<br><b>Location:</b> ${place}<br><b>Depth:</b> ${depth}`;
  }


// map
let myMap = L.map("map", {
    center: [46.87, -113.99], //picked missoula, MT coordinates for centar to see US and alaska earthquake activity
    zoom: 4
  });

// tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


// Adding to the map
fetch(url).then(response => response.json()).then(data => {
    let features = data.features;
    let Markers = L.geoJSON(features, {
        pointToLayer: (feature, latlng) => {
            let {properties} = feature;
            let magnitude = properties.mag;
            let depth = feature.geometry.coordinates[2]; //Using hint that depth is 3rd coordinate
            let markerRadius = Magnitude(magnitude);
        
            return L.circleMarker(latlng, {
                radius: markerRadius,
                fillColor: color(depth),
                fillOpacity: 0.5,
                color: 'black',
                weight: 1
            }).bindPopup(Popup(properties, depth));
        }
    });

    Markers.addTo(myMap);

    // legend for map
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let depthRanges = [0, 50, 100, 200]; // Define your depth ranges
        let colors = ['#00ffff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000']; // Corresponding colors
        let labels = [];

        // Loop through depth ranges and create labels
        for (let i = 0; i < depthRanges.length; i++) {
            // Create a label for each range
            labels.push(
                '<li style="background-color: ' + colors[i] + '"></li> ' +
                (depthRanges[i] ? depthRanges[i - 1] + ' - ' + depthRanges[i] + ' m' : '0 - ' + depthRanges[i] + ' m')
            );
        }

        // Add the labels to the div
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
});