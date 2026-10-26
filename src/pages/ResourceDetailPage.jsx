import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RESOURCE_CATALOG } from '../data/resourceCatalog';
import CensusPanel from '../components/UI/CensusPanel';
import { usePlace } from '../hooks/usePlace';

export default function ResourceDetailPage() {
  const { datasetId } = useParams();
  const resource = RESOURCE_CATALOG.find(item => item.id === datasetId);
  const { tract } = usePlace();
  const heading = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [datasetId]);

  if (!resource) return (
    <section className="panel-card page-stack">
      <h1 ref={heading} tabIndex={-1}>Dataset not found</h1>
      <p>This dataset is not in the resource catalog.</p>
      <Link className="settings-button" to="/resources">Browse Resources &amp; Sources</Link>
    </section>
  );

  return (
    <div className="page-stack resource-detail-page">
      <nav className="resource-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Dashboard</Link><span aria-hidden="true">/</span>
        <Link to="/resources">Resources &amp; Sources</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{resource.name}</span>
      </nav>
      <section className="panel-card">
        <span className="eyebrow">RESOURCES &amp; SOURCES / DATASET</span>
        <h1 ref={heading} tabIndex={-1}>{resource.name}</h1>
        <span className="pill neutral">{resource.status}</span>
        <p className="supporting-copy resource-detail-intro">{resource.description}</p>
        <div className="settings-actions">
          <Link className="settings-button" to={resource.explore.to}>{resource.explore.label}</Link>
          <Link className="settings-button" to="/resources">All resources</Link>
        </div>
      </section>
      <div className="two-up">
        <section className="panel-card"><h2>Where it comes from</h2><p><strong>{resource.origin}</strong></p><p className="supporting-copy">{resource.coverage}</p><h3>Availability and date</h3><p className="supporting-copy">{resource.availability}</p></section>
        <section className="panel-card"><h2>How BlockView uses it</h2><p className="supporting-copy">{resource.usage}</p><h3>What to keep in mind</h3><p className="supporting-copy">{resource.limitations}</p></section>
      </div>
      <section className="panel-card">
        <h2>Information from this dataset</h2>
        <dl className="resource-field-list">{resource.fields.map(([name, description]) => <div key={name}><dt>{name}</dt><dd>{description}</dd></div>)}</dl>
      </section>
      {resource.id === 'census-acs' && <CensusPanel geoid={tract?.id} title={tract ? 'Selected tract estimates' : 'Philadelphia County estimates'} />}
      {resource.links.length > 0 && <section className="panel-card"><h2>Original sources and documentation</h2><ul className="resource-source-links">{resource.links.map(link => <li key={link.url}><a className="text-link" href={link.url} target="_blank" rel="noreferrer">{link.label} &gt;</a></li>)}</ul></section>}
    </div>
  );
}