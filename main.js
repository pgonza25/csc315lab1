import {Feature, Map, Overlay, View} from 'ol/index.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Point} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const place = [-120.65, 35.29];
const sanMateo = [-122.321777, 37.553288];
const morganHill = [-121.654358, 37.12966];
const losAngeles = [-118.243103, 34.052659];

const pointSM = new Point(sanMateo);
const pointMH = new Point(morganHill);
const pointLA = new Point(losAngeles);

const map = new Map({
  target: 'map',
  view: new View({
    projection: 'EPSG:4326',
    center: place,
    zoom: 6.9,
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [new Feature(pointSM), new Feature(pointMH), new Feature(pointLA)],
      }),
      style: {
        'circle-radius': 7,
        'circle-fill-color': 'green',
      },
    }),
  ],
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  stopEvent: false,
});
map.addOverlay(popup);

function formatCoordinate(coordinate) {
  return `
    <table>
      <tbody>
        <tr><th>lon</th><td>${coordinate[0].toFixed(2)}</td></tr>
        <tr><th>lat</th><td>${coordinate[1].toFixed(2)}</td></tr>
      </tbody>
    </table>`;
}

const info = document.getElementById('info');
map.on('moveend', function () {
  const view = map.getView();
  const center = view.getCenter();
  info.innerHTML = formatCoordinate(center);
});

let popover;
map.on('click', function (event) {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
  const feature = map.getFeaturesAtPixel(event.pixel)[0];
  if (!feature) {
    return;
  }
  const coordinate = feature.getGeometry().getCoordinates();
  popup.setPosition([
    coordinate[0] + Math.round(event.coordinate[0] / 360) * 360,
    coordinate[1],
  ]);

  popover = new bootstrap.Popover(element, {
    container: element.parentElement,
    content: formatCoordinate(coordinate),
    html: true,
    offset: [0, 20],
    placement: 'top',
    sanitize: false,
  });
  popover.show();
});

map.on('pointermove', function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
  map.getViewport().style.cursor = type;
});
