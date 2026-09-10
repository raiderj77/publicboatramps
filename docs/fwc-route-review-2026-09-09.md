# FWC route review — September 9, 2026

## Decision

Preserve the five existing URLs as temporary-closure notices. Exclude them from directory discovery and sitemaps with `noindex,follow`; do not redirect them, label them permanently retired, or infer replacement coordinates.

The importer retains a `Temporarily Closed` FWC record only when the same source key was already published. Newly discovered closed records remain unpublished. If a retained record reopens, the normal page returns after a reviewed refresh. If it disappears or changes to a permanent/ambiguous status, the drift check still requires an explicit retirement or replacement decision.

The importer also ignores source-only bulk timestamp touches when public fields are unchanged. This keeps reviewed refreshes focused on actual additions and material field changes without hiding route removals, status changes, or user-visible edits.

## Evidence reviewed

The latest failed scheduled check was [FWC Source Drift run 34154520187](https://github.com/raiderj77/publicboatramps/actions/runs/34154520187), created September 7, 2026. On September 9, the [official FWC feature layer](https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/4) and its [five-record query](https://gis.myfwc.com/mapping/rest/services/Open_Data/FWC_Florida_Boat_Ramp_Inventory/MapServer/4/query?where=RampID%20IN%20%28%27DU70007SJ%27%2C%27GI10008QS%27%2C%27LE00046RA%27%2C%27SR00043NL%27%2C%27SR70018OO%27%29&outFields=%2A&returnGeometry=true&outSR=4326&f=pjson) still returned each source record at its existing identifier and coordinates, but with `Status = Temporarily Closed`.

| Existing route | FWC record | Current official evidence | Treatment |
| --- | --- | --- | --- |
| `/florida/st-johns-marina-downtown-jacksonville-jacksonville` | `DU70007SJ` | FWC marks the ramp temporarily closed. The [City of Jacksonville closure notice](https://www.jacksonville.gov/welcome/featured-news/coj-boat-ramp-updates) says it closed August 1 during South Bank construction and is expected to reopen in summer 2028. | Preserve the route as a temporary-closure notice. |
| `/florida/tudeen-park-boat-launch-small-boats-or-paddlecraft-only-steep-rough-access-trail-branford` | `GI10008QS` | FWC says the property is closed until further notice because of unsafe conditions and prohibits vehicle, vessel, and pedestrian access. Gilchrist County's [official improvement bid](https://gilchrist.fl.us/wp-content/uploads/Tudeen-Boat-Ramp-Bid-Advertisement.pdf) confirms planned work but does not establish reopening. | Preserve the route as a temporary-closure notice; do not infer a reopening date. |
| `/florida/mullock-creek-marina-fort-myers` | `LE00046RA` | FWC marks it temporarily closed after Lee County's purchase. The [current Lee County facility page](https://www.leegov.com/parks/boat%20Ramps/mullockcreekboatramp) says `CLOSED FOR RENOVATIONS` while interim improvements are made. | Preserve the route as a temporary-closure notice. |
| `/florida/oriole-beach-public-boat-ramp-gulf-breeze` | `SR00043NL` | FWC marks it temporarily closed. The [Santa Rosa County notice](https://www.santarosa.fl.gov/m/NewsFlash/Home/Detail/2144) says the August 24 closure supports ramp and parking improvements and, weather permitting, reopening is expected February 20, 2027. | Preserve the route as a temporary-closure notice. |
| `/florida/blackwater-river-state-forest-bear-lake-recreation-area-no-gas-motors-milton` | `SR70018OO` | FWC still marks it temporarily closed, although its comment says construction was expected to end August 27 and reopening was expected August 28. The [FDACS recreation page](https://www.fdacs.gov/Forest-Wildfire/Our-Forests/State-Forests/Blackwater-River-State-Forest/Recreation-Areas-at-Blackwater-River-State-Forest) confirms Bear Lake and its boat-ramp facility but does not confirm current reopening. | Keep the conservative temporary-closure notice until FWC or the managing agency explicitly reports reopening. |

## Unknowns

- Tudeen Park has no current reopening date in the reviewed official material.
- Mullock Creek has no current reopening date on the reviewed Lee County page.
- Bear Lake's FWC status conflicts with the expected date in its own status comment. Current reopening is therefore unknown; no route or facility details were invented.
