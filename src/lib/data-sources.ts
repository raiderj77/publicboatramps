export const FWC_INVENTORY_URL =
  'https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/layers';
export const FWC_METADATA_URL =
  'https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/info/metadata';
export const FWC_ACCESS_URL = 'https://myfwc.com/boating/boat-ramps-access/';
export const USGS_BOAT_RAMPS_URL =
  'https://www.usgs.gov/data/boat-ramp-locations-united-states-america';
export const OSM_COPYRIGHT_URL = 'https://www.openstreetmap.org/copyright';

export type DataSourceKind = 'fwc' | 'usgs' | 'osm' | 'unknown';

export interface DataSourceAttribution {
  kind: DataSourceKind;
  label: string;
  url: string;
  note: string;
  allowsCoordinateDirections: boolean;
}

export function getDataSourceAttribution(dataSource: unknown): DataSourceAttribution {
  if (dataSource === 'FWC_FL') {
    return {
      kind: 'fwc',
      label: 'FWC Florida Boat Ramp Inventory',
      url: FWC_INVENTORY_URL,
      note:
        'Source record from the public-domain FWC Florida Boat Ramp Inventory. The original metadata prohibits claiming proprietary rights in the dataset, expects acknowledgment of the Florida Fish and Wildlife Conservation Commission, Fish and Wildlife Research Institute (FWC-FWRI), and states that the data is not for navigation. Coordinates are shown only as source-reference fields.',
      allowsCoordinateDirections: false,
    };
  }

  if (dataSource === 'USGS') {
    return {
      kind: 'usgs',
      label: 'U.S. Geological Survey Boat Ramp Locations',
      url: USGS_BOAT_RAMPS_URL,
      note:
        'Source record from the U.S. Geological Survey Boat Ramp Locations in the United States of America dataset, released under CC0 1.0.',
      allowsCoordinateDirections: true,
    };
  }

  if (dataSource === 'OSM' || dataSource === null || dataSource === undefined || dataSource === '') {
    return {
      kind: 'osm',
      label: 'OpenStreetMap contributors',
      url: OSM_COPYRIGHT_URL,
      note: 'Source record from OpenStreetMap contributors, licensed under the Open Data Commons Open Database License (ODbL).',
      allowsCoordinateDirections: true,
    };
  }

  return {
    kind: 'unknown',
    label: 'Unclassified source record',
    url: '/about',
    note: 'This record has an unrecognized source identifier. Coordinate-based directions are disabled until its source terms are reviewed.',
    allowsCoordinateDirections: false,
  };
}
