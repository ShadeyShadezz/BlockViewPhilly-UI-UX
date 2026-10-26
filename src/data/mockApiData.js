export const apiData = {
  location: {
    name: 'Philadelphia, PA',
    market: 'Innovation / community context map',
    region: 'University City + Center City',
    tractCount: 11,
    lastUpdated: '2026-10-14T12:00:00Z',
    summary:
      'This view presents place-based context for local activity, supporting data, and neighborhood information in an accessible layout.',
  },
  metrics: [
    { label: 'Project status', value: 'Ready for review', delta: 'Informational view' },
    { label: 'Map tools', value: 'Layer controls', delta: 'Available' },
    { label: 'Data context', value: 'Prepared', delta: 'Clean layout' },
    { label: 'Preferences', value: 'Theme aware', delta: 'Dark / light' },
  ],
  datasets: [
    {
      name: 'Location & Data',
      origin: 'OpenStreetMap + Census tract layer',
      status: 'Live',
      description: 'Boundaries, neighborhood labels, and demographic context for the selected area.',
    },
    {
      name: 'Company Dataset',
      origin: 'VC, university, and hospital metadata',
      status: 'Synced',
      description: 'Innovation activity grouped by location and sector.',
    },
    {
      name: 'Local Data',
      origin: 'Public and internal files',
      status: 'Queued',
      description: 'District-level background information used to provide context for the map.',
    },
    {
      name: 'Area Data',
      origin: 'Census, mobility, and opportunity models',
      status: 'Ready',
      description: 'Resident outcomes and benefit score for comparative analysis.',
    },
  ],
  pipeline: [
    {
      key: 'Map information',
      value: 'Map layers show tract geometry, building locations, and nearby activity patterns in context.',
    },
    {
      key: 'Location details',
      value: 'Neighborhood context, resident indicators, and comparison data across nearby geographies.',
    },
    {
      key: 'Search bar',
      value: 'Quick lookup for neighborhood, dataset, and source context.',
    },
    {
      key: 'Company datasets',
      value: 'Normalized inputs for venture activity, research institutions, and service organizations.',
    },
  ],
  sources: [
    'Census ACS',
    'Opportunity Atlas',
    'VC deal feeds',
    'University and hospital footprint data',
    'Internal business records',
  ],
  explanations: [
    {
      label: 'Plain language',
      text: 'This tool provides a clear overview of local activity, place context, and data layers for quick review.',
    },
    {
      label: 'Expert language',
      text: 'Spatial comparison of innovation density, resident income, unemployment, and mobility indicators by geography in a neutral informational format.',
    },
  ],
};
