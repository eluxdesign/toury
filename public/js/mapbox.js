export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1IjoiZWx1eGRlc2lnbiIsImEiOiJja2xtZzQ0amIwOHF6MnhubnN0eWtwams1In0.5234nJ0qoXcawdZLFr8toQ';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/eluxdesign/cklmgfm0k3dfl17qnh54k3sbh',
    scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100, 
            right: 100
        }
    });

}
