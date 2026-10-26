// A finite viewing envelope that grows with loaded map data, not repeating worlds.
export function getViewingBounds({ places = [], geometry = null } = {}) {
  let south = 39.86, west = -75.30, north = 40.15, east = -74.95;
  const extend = point => {
    if (!Array.isArray(point)) return;
    const [lon, lat] = point;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 85.05112878) return;
    south = Math.min(south, lat); north = Math.max(north, lat);
    west = Math.min(west, lon); east = Math.max(east, lon);
  };
  const coordinates = value => {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === 'number') extend(value);
    else value.forEach(coordinates);
  };
  const visit = value => {
    if (!value) return;
    if (value.type === 'FeatureCollection') value.features?.forEach(visit);
    else if (value.type === 'Feature') visit(value.geometry);
    else if (value.type === 'GeometryCollection') value.geometries?.forEach(visit);
    else coordinates(value.coordinates);
  };
  places.forEach(place => {
    if (!place) return;
    extend(place.centroid ?? [place.lon, place.lat]);
    coordinates(place.polygon);
  });
  visit(geometry);
  const latPadding = (north - south) * 0.05;
  const lonPadding = (east - west) * 0.05;
  return [
    [Math.max(-85.05112878, south - latPadding), Math.max(-180, west - lonPadding)],
    [Math.min(85.05112878, north + latPadding), Math.min(180, east + lonPadding)],
  ];
}