import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CensusPanel from '../components/UI/CensusPanel';
import { RESOURCE_CATALOG, resourcePath } from '../data/resourceCatalog';

const providers = [
  ['OpenStreetMap', 'Free street tiles for the 2D Philadelphia map. Availability depends on the tile service.', 'https://www.openstreetmap.org/copyright', 'No API key required'],
  ['Google Maps 3D Tiles', 'Optional photorealistic tiles in the 3D explorer. A configured key does not guarantee quota or access.', 'https://developers.google.com/maps/documentation/tile/3d-tiles', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Key configured - connection checked on use' : 'Key not configured'],
  ['Cesium ion', 'Optional OSM and enriched building layers in the 3D explorer.', 'https://cesium.com/platform/cesium-ion/', import.meta.env.VITE_CESIUM_ION_TOKEN ? 'Token configured - connection checked on use' : 'Token not configured'],
];

const buildDatasetCatalog = () => RESOURCE_CATALOG;

function highlightMatch(text, query) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const result = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerQuery, cursor);

  while (index !== -1) {
    if (index > cursor) {
      result.push(<span key={`text-${cursor}`}>{text.slice(cursor, index)}</span>);
    }

    const matchText = text.slice(index, index + normalizedQuery.length);
    result.push(<mark key={`match-${index}`}>{matchText}</mark>);
    cursor = index + normalizedQuery.length;
    index = lowerText.indexOf(lowerQuery, cursor);
  }

  if (cursor < text.length) {
    result.push(<span key={`text-tail-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return result.length ? result : text;
}

export default function ResourcesPage() {
  const [query, setQuery] = useState('');

  const datasets = useMemo(() => {
    const catalog = buildDatasetCatalog();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return catalog;

    return catalog.filter((dataset) => {
      const haystack = [
        dataset.name,
        dataset.origin,
        dataset.description,
        dataset.status,
        ...(dataset.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  return (
    <div className="page-stack">
      <div className="resources-layout">
        <section className="panel-card resource-side-panel">
          <div className="resource-side-header">
            <span className="resource-header-label">Search Bar</span>
          </div>
          <div className="resource-side-body">
            <input
              aria-label="Search datasets"
              className="resource-search-pill"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Bar"
            />
            <div className="resource-meta-row">
              <span>Current Time</span>
              <strong>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
            </div>
            <div className="resource-meta-row">
              <span>Until DB Refresh</span>
              <strong>Next scheduled sync</strong>
            </div>
          </div>
        </section>

        <section className="panel-card resource-main-panel">
          <div className="resource-main-header">
            <span className="eyebrow">RESOURCES</span>
            <h2>Resources We Used</h2>
          </div>

          <div className="resource-scroll-body" role="region" aria-label="Resource catalog" tabIndex={0}>
          {datasets.length ? (
            <div className="resource-cards">
              {datasets.map((dataset, index) => (
                <article className="resource-data-card" key={`${dataset.name}-${index}`}>
                  <div className="resource-card-topline">
                    <span className="resource-card-tag">{dataset.status}</span>
                    <span className="resource-card-source">{dataset.origin}</span>
                  </div>
                  <h3>{highlightMatch(dataset.name, query)}</h3>
                  <p>{highlightMatch(dataset.description, query)}</p>
                  <Link className="resource-show-more" to={resourcePath(dataset.id)}>
                    View dataset
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="resource-empty-state">No matching datasets were found for “{query}”.</div>
          )}
          </div>
        </section>
      </div>

      {providers.map(([name, description, url, status]) => (
        <article className="panel-card" key={name}>
          <div className="panel-header">
            <h2>{name}</h2>
            <span className="pill neutral">{status}</span>
          </div>
          <p className="supporting-copy">{description}</p>
          <a className="text-link" href={url} target="_blank" rel="noreferrer">
            Provider documentation &gt;
          </a>
        </article>
      ))}

      <CensusPanel />

      <section className="panel-card">
        <h2>3D model inventory</h2>
        <p className="supporting-copy">When the current Census API is unavailable, selected tract income can use the bundled ACS 2022 import snapshot. Raw Census responses and download date were not retained. Potential defaults and suppressed values are excluded; unemployment and population are not inferred from that snapshot.</p>
        <p className="supporting-copy">Buildings have approximate real-world locations. Innovation magnitudes, mobility scores, tract outcome metrics and model boundaries are synthetic. These are not official neighborhood statistics. Census estimates displayed on overview pages are fetched separately and never substituted with model values.</p>
        <Link className="settings-button" to="/map">Inspect sample layers</Link>
        <details>
          <summary>API configuration</summary>
          <p>These values are stored in environment variables and enabled only when a key is present.</p>
          <p>VITE_CESIUM_ION_TOKEN, VITE_GOOGLE_MAPS_API_KEY, VITE_CENSUS_API_KEY, and VITE_OPENDATAPHILLY_API_KEY are all optional. If you add a city data key later, it can be used in the same pattern.</p>
        </details>
      </section>

    </div>
  );
}
