export default function MiniMapPreview({ title = '2D Map Renderer', subtitle = 'Philadelphia' }) {
  return (
    <section className="map-preview-card" aria-label={title}>
      <div className="map-preview-header">
        <span className="map-preview-label">{title}</span>
        <span className="map-preview-tag">{subtitle}</span>
      </div>

      <div className="mini-map-surface">
        <div className="mini-map-toolbar" />
        <div className="mini-map-grid">
          <div className="mini-map-block large dark" />
          <div className="mini-map-block medium light" />
          <div className="mini-map-block medium dark" />
          <div className="mini-map-block small light" />
          <div className="mini-map-block small dark" />
          <div className="mini-map-block small orange" />
          <div className="mini-map-block small light" />
          <div className="mini-map-block large orange" />
          <div className="mini-map-block medium light" />
        </div>

        <div className="mini-map-overlay">
          <span>Location</span>
          <span>Data</span>
          <span>Sources</span>
        </div>
      </div>
    </section>
  );
}
