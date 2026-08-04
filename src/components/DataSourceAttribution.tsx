import {
  FWC_INVENTORY_URL,
  FWC_METADATA_URL,
  OSM_COPYRIGHT_URL,
  USGS_BOAT_RAMPS_URL,
} from '@/lib/data-sources';

interface Props {
  hasFwc: boolean;
  hasUsgs: boolean;
  hasOsm: boolean;
  latestSourceDate?: string;
}

function formatSourceDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function DataSourceAttribution({ hasFwc, hasUsgs, hasOsm, latestSourceDate }: Props) {
  const formattedSourceDate = formatSourceDate(latestSourceDate);
  const sources = [
    hasFwc ? <a key="fwc" href={FWC_INVENTORY_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>FWC Florida Boat Ramp Inventory</a> : null,
    hasUsgs ? <a key="usgs" href={USGS_BOAT_RAMPS_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>U.S. Geological Survey Boat Ramp Locations (CC0 1.0)</a> : null,
    hasOsm ? <a key="osm" href={OSM_COPYRIGHT_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>OpenStreetMap contributors (ODbL)</a> : null,
  ].filter(Boolean);

  return (
    <p style={{ fontSize: '0.8rem', color: 'inherit', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
      Source records on this page include{' '}
      {sources.map((source, index) => (
        <span key={index}>
          {index > 0 ? (index === sources.length - 1 ? ' and ' : ', ') : ''}
          {source}
        </span>
      ))}.
      {hasFwc && (
        <> FWC describes its dataset as public domain, prohibits proprietary claims, expects FWC-FWRI acknowledgment, and states in its <a href={FWC_METADATA_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>original metadata</a> that the data is not for navigation.</>
      )}
      {formattedSourceDate && <> Latest source-record date in this group: {formattedSourceDate}.</>}
      {' '}Records are not live operational data. Verify access, fees, closures, and conditions with the managing agency before launching.
    </p>
  );
}
