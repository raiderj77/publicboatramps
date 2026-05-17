export function isIndexable(loc: Record<string, any>): boolean {
  const mandatory = [loc.name, loc.lat, loc.lng, loc.city, loc.state];
  if (mandatory.some(v => v === null || v === undefined || v === '')) return false;

  const optionalFields = [
    loc.description,
    loc.rampType,
    loc.rampSurface,
    loc.totalLanes,
    loc.dockType,
    loc.restroomType,
    loc.waterBodyName,
    loc.parkingSurface,
    loc.hours,
    loc.isFeeRequired,
  ];

  const populated = optionalFields.filter(v => {
    if (v === null || v === undefined || v === '') return false;
    if (v === 'Unknown' || v === 'N/A' || v === 'None' || v === 'No Toilet') return false;
    if (typeof v === 'number' && v === 0) return false;
    return true;
  }).length;

  return populated >= 4;
}
