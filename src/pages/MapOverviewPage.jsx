import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePlace, choosePlace } from '../hooks/usePlace';
import CensusPanel from '../components/UI/CensusPanel';
import { useMapStore } from '../store/useMapStore';
import { getViewingBounds } from '../utils/mapBounds';

// Initial fallback while map data loads; the viewing envelope is updated below.
const PHILADELPHIA_BOUNDS = L.latLngBounds([39.86, -75.30], [40.15, -74.95]);

const locationKeyItems = [
  {
    title: 'Place',
    summary: 'Philadelphia, PA',
    preview: 'Current neighborhood context and on-map reference points.',
    details: 'This view centers the live map on Philadelphia and keeps the selected place highlighted in the map metadata. It is designed to surface key context before drill-down details break out into more complete records.',
    status: 'Live',
    tags: ['local', 'place', 'map'],
  },
  {
    title: 'Area context',
    summary: 'Census and model context',
    preview: 'Tract-level comparisons, surrounding activity, and nearby indicators.',
    details: 'The area context card pulls the selected geography and nearby model values into a compact summary so users can quickly scan whether an area is a strong match, an opportunity gap, or a local anchor zone.',
    status: 'Context',
    tags: ['tracts', 'profile', 'indicators'],
  },
  {
    title: 'Selected tract',
    summary: 'Opportunity match focus',
    preview: 'Highlights the dataset being inspected and its key geographies.',
    details: 'The selected tract remains emphasized in the spatial view, giving the user a single reference point while the map and supporting details can show broader context around it.',
    status: 'Selected',
    tags: ['highlighted', 'focus', 'selection'],
  },
  {
    title: 'Data history',
    summary: 'Source lineage',
    preview: 'Tracks whether the view is using live, bundled, or model-derived data.',
    details: 'The data history card records whether values are coming from OpenStreetMap, Census geometry, local bundled snapshots, or synthetic model outputs so the user knows what is authoritative and what is illustrative.',
    status: 'Source',
    tags: ['lineage', 'source', 'audit'],
  },
];

export default function MapOverviewPage() {
  const { tract, building, tracts, buildings } = usePlace();
  const selected = building ?? tract;
  const host = useRef(null), map = useRef(null), markers = useRef(null);
  const tileLayer = useRef(null), extentBorder = useRef(null), previousBounds = useRef(null);
  const [layer, setLayer] = useState('Location');
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [geometry, setGeometry] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  const extent = useMemo(
    () => getViewingBounds({ places: [...buildings, ...tracts, selected], geometry }),
    [buildings, tracts, selected, geometry],
  );
  const [[south, west], [north, east]] = extent;
  const viewingBounds = useMemo(() => L.latLngBounds([south, west], [north, east]), [south, west, north, east]);

  useEffect(() => {
    let active = true;
    fetch('/data/census_tracts/philadelphia_tracts.geojson')
      .then((response) => {
        if (!response.ok) throw Error();
        return response.json();
      })
      .then((geojson) => {
        if (active) setGeometry(geojson);
      })
      .catch(() => {
        if (active) setGeoError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const m = L.map(host.current, {
      scrollWheelZoom: false,
      maxBounds: PHILADELPHIA_BOUNDS,
      maxBoundsViscosity: 1,
      maxZoom: 19,
    }).fitBounds(PHILADELPHIA_BOUNDS, { padding: [12, 12] });
    m.setMinZoom(m.getZoom());
    map.current = m;
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      noWrap: true,
      bounds: PHILADELPHIA_BOUNDS,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    tileLayer.current = tiles;
    tiles.on('tileerror', () => setFailed(true));
    extentBorder.current = L.rectangle(PHILADELPHIA_BOUNDS, {
      color: 'var(--map-border)', weight: 2, dashArray: '6 4', fill: false, interactive: false,
    }).addTo(m);
    markers.current = L.layerGroup().addTo(m);

    return () => {
      m.remove();
      map.current = null;
      tileLayer.current = null;
      extentBorder.current = null;
      previousBounds.current = null;
    };
  }, [retry]);
  // Keep panning, tile requests, the visible border and Reset view on one extent.
  // Changes inside the existing area leave the user's zoom and position intact.
  useEffect(() => {
    const m = map.current;
    if (!m || !tileLayer.current || !extentBorder.current) return;
    const expanded = !previousBounds.current || !previousBounds.current.contains(viewingBounds);
    m.setMaxBounds(viewingBounds);
    m.setMinZoom(0);
    m.setMinZoom(m.getBoundsZoom(viewingBounds, false, L.point(24, 24)));
    extentBorder.current.setBounds(viewingBounds);
    tileLayer.current.options.bounds = viewingBounds;
    tileLayer.current.redraw();
    if (expanded) m.fitBounds(viewingBounds, { padding: [12, 12], animate: false });
    previousBounds.current = viewingBounds;
  }, [viewingBounds, retry]);

  useEffect(() => {
    if (!map.current || layer !== 'Data' || !geometry) return;

    const geo = L.geoJSON(geometry, {
      style: (feature) => {
        const active = tract?.officialGeometry && (feature.properties.GEOID ?? feature.properties.id) === tract.id;
        return { color: active ? 'var(--map-selected)' : 'var(--map-region)', weight: active ? 3 : 1, fillOpacity: active ? 0.3 : 0.12 };
      },
      onEachFeature: (feature, polygon) => {
        const props = feature.properties;
        const id = props.GEOID ?? props.id;
        polygon.bindTooltip(`Census tract ${id}`);
        polygon.on('click', () => {
          const centerPoint = polygon.getBounds().getCenter();
          useMapStore.setState({
            philaSelectedGeography: {
              id,
              name: `Census tract ${id}`,
              neighborhood: 'Philadelphia',
              centroid: [centerPoint.lng, centerPoint.lat],
              officialGeometry: true,
            },
            philaSelectedBuilding: null,
          });
        });
      },
    }).addTo(map.current);

    return () => {
      geo.remove();
    };
  }, [layer, geometry, retry, tract?.id, tract?.officialGeometry]);

  useEffect(() => {
    if (!map.current || !markers.current) return;
    markers.current.clearLayers();

    const places = layer === 'Location' ? buildings : tracts;
    places.forEach((place) => {
      const coords = place.centroid ? [place.centroid[1], place.centroid[0]] : [place.lat, place.lon];
      if (!coords.every(Number.isFinite)) return;

      L.circleMarker(coords, {
        radius: place.id === selected?.id ? 10 : 6,
        color: place.id === selected?.id ? 'var(--map-selected)' : 'var(--map-region)',
        weight: 2,
        fillColor: 'var(--map-marker)',
        fillOpacity: 0.9,
      })
        .bindTooltip(place.name)
        .on('click', () => choosePlace(place, layer === 'Location'))
        .addTo(markers.current);
    });
  }, [layer, tracts, buildings, selected, retry]);

  const officialPlaces = (geometry?.features ?? []).map((feature) => {
    const props = feature.properties;
    return {
      id: props.GEOID ?? props.id,
      name: props.NAMELSAD ?? `Census tract ${props.GEOID ?? props.id}`,
      neighborhood: 'Philadelphia',
      centroid: [Number(props.INTPTLON), Number(props.INTPTLAT)],
      officialGeometry: true,
    };
  });

  const center = () => {
    const coords = selected?.centroid ? [selected.centroid[1], selected.centroid[0]] : [selected?.lat, selected?.lon];
    if (coords.every(Number.isFinite)) map.current?.setView(coords, 14);
  };

  const areaContextText = building
    ? `${building.lat.toFixed(4)}, ${building.lon.toFixed(4)} - approximate model location`
    : tract
      ? 'Census estimates use the selected GEOID only. Official geography is separate from synthetic 3D model metrics.'
      : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  return (
    <div className="page-stack">
      <div className="panel-header">
        <div>
          <span className="eyebrow">PHILADELPHIA / 2D</span>
          <h1>Location &amp; Data</h1>
        </div>
        <Link className="settings-button" to="/map">Open 3D Map &gt;</Link>
      </div>

      <div className="two-up">
        <aside className="panel-card location-key-panel">
          <span className="eyebrow">LOCATION KEY</span>
          <h2>Map context</h2>
          <ul className="location-key-list">
            {locationKeyItems.map((item) => (
              <li key={item.title} className="location-key-item">
                <div className="location-key-item-header">
                  <span>{item.title}</span>
                  <span className="location-key-status">{item.status}</span>
                </div>
                <strong>{item.summary}</strong>
                <p>{item.preview}</p>
                <button type="button" className="context-show-more" onClick={() => setActiveContext(item)}>
                  Show more
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel-card map-panel">
          <div className="map-overview-toolbar">
            <div className="option-group" aria-label="Map layer">
              {['Location', 'Data'].map((item) => (
                <button
                  key={item}
                  className={`option-button ${layer === item ? 'selected' : ''}`}
                  aria-pressed={layer === item}
                  onClick={() => setLayer(item)}
                  type="button"
                >
                  {item === 'Location' ? 'Building Location' : 'Census Data'}
                </button>
              ))}
            </div>
            <div className="settings-actions">
              <button className="option-button" onClick={center} type="button">Center selection</button>
              <button className="option-button" onClick={() => map.current?.fitBounds(viewingBounds, { padding: [12, 12] })} type="button">Reset view</button>
            </div>
          </div>

          <label className="place-select">
            Select a {layer === 'Location' ? 'building' : 'tract'}
            <select
              value={layer === 'Data' && tract?.officialGeometry ? `official:${tract.id}` : (layer === 'Location' ? building : tract)?.id ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                if (value.startsWith('official:')) {
                  const place = officialPlaces.find((entry) => entry.id === value.slice(9));
                  if (place) useMapStore.setState({ philaSelectedGeography: place, philaSelectedBuilding: null });
                  return;
                }

                const place = (layer === 'Location' ? buildings : tracts).find((entry) => entry.id === value);
                if (place) choosePlace(place, layer === 'Location');
              }}
            >
              <option value="" disabled>Choose a place</option>
              {layer === 'Data' && (
                <optgroup label="Official Census tracts">
                  {officialPlaces.map((place) => (
                    <option key={place.id} value={`official:${place.id}`}>
                      {place.name} - {place.id}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={layer === 'Location' ? '3D building inventory' : 'Sample tracts'}>
                {(layer === 'Location' ? buildings : tracts).map((place) => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
              </optgroup>
            </select>
          </label>

          <div ref={host} className="street-map" aria-label="Philadelphia map overview" />
          {failed && (
            <div className="map-warning">
              OpenStreetMap tiles failed to load. <button type="button" onClick={() => setRetry((current) => current + 1)}>Retry</button>
            </div>
          )}
          <p className="map-note">{areaContextText}</p>
          {geoError && <p className="map-note">Census tract geometry was not available, so the selected tract remains shown in the sample dataset.</p>}
        </section>
      </div>

      <CensusPanel />

      {activeContext && (
        <div className="dataset-modal-backdrop" onClick={() => setActiveContext(null)}>
          <div className="dataset-modal" role="dialog" aria-modal="true" aria-label={`${activeContext.title} details`} onClick={(event) => event.stopPropagation()}>
            <div className="dataset-modal-header">
              <div>
                <span className="eyebrow">{activeContext.title}</span>
                <h3>{activeContext.summary}</h3>
              </div>
              <button type="button" className="dataset-close-button" onClick={() => setActiveContext(null)}>Close</button>
            </div>
            <div className="dataset-tag-row">
              {activeContext.tags.map((tag) => (
                <span key={tag} className="pill neutral">{tag}</span>
              ))}
            </div>
            <p className="supporting-copy">{activeContext.details}</p>
          </div>
        </div>
      )}
    </div>
  );
}
