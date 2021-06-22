# CovInce

CovInce is an an application built in React for visualising numbers and proportions of lineages for cases of SARS-CoV2. It is currently used primarily for the spatiotemporal displays at https://covid19.sanger.ac.uk/ and https://covglobe.org/.

If you would like to deploy your own version of covince and need assistance please raise an issue and we will try to help.

Demo of the code in this repository (with old static data): http://covince.vercel.app

## Configuration

### Top-level sections

* [`area_search_terms`](#area-search-terms) (optional) enable additional search terms for areas
* `charts [array]` list of [chart](#chart) definitions
* `colors [object|array]` (optional) lineages mapped to color definitions, or a list of ordered colors
* `datetime_format [string]` for e.g. data updated date [reference](https://date-fns.org/docs/format) 
* `map [object]`
  * `fade_uncertainty [{[parameter_id]: boolean}]` (optional) enable fade uncertainty for specific parameters
  * [`settings [object]`](#map-settings) (optional)
  * [`viewport [object]`](#map-viewport)
* `nomenclature [array]` (optional) list of [nomenclature](#nomenclature) definitions, the order will be reflected on the UI
* [`ontology [object]`](#ontology)
* `parameters [array]` list of [parameter](#parameter) definitions
* [`timeline [object]`](#timeline) (optional)

### Area Search Terms

* `url [string]` should load a JSON file with the following structure: `{ "search_term": "area_id", ... }`
* `mode [string]` type of search to apply to additional terms:
  * `padded-first-input-token` pads the term to the length of the input and matches against the first token of the input padded to the original length

### Chart

* `allow_stack [boolean]` (optional) enables stacking
* `default_type ['line'|'area']`
* `heading [string]` 
* `parameter [string]` should match a parameter id
* `preset ['percentage']` (optional) applies formatting rules [DEPRECATED - use [parameter](#parameter).format]
* `y_axis [object]` (optional) 

### Chart Y-Axis

* `domain [number[]]` (optional) [reference](https://recharts.org/en-US/api/YAxis#domain)
* `ticks [string[]]` (optional) [reference](https://recharts.org/en-US/api/YAxis#ticks) 
* `reference_line [number]` (optional) display a dotted line at the specified value
* `allow_data_overflow [boolean]` (optional) [reference](https://recharts.org/en-US/api/YAxis#allowDataOverflow)

### Map settings

* `default_lineage [string]` (optional) should match a lineage in lists, defaults to first lineage
* `default_color_by [string]` (optional) should match a [parameter](#parameter) id, defaults to first parameter
* `default_color_scale ['linear'|'quadratic'|{[parameter_id]: 'linear'|'quadratic'}]` (optional) can be a string for all parameters, or an object for specific parameters. Omit parameters from the object to hide the scale control.

### Map viewport

* `min_zoom [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/map/#map#setzoom)
* `default_lat [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat) 
* `default_lon [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat) 
* `default_zoom [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/map/#map#setzoom) 
* `default_zoom_mob [number]` Mobile option where proportions are different [reference](https://maplibre.org/maplibre-gl-js-docs/api/map/#map#setzoom) 
* `bounds [object]` 
  * `min_longitude [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat)
  * `max_longitude [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat)
  * `min_latitude [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat)
  * `max_latitude [number]` [reference](https://maplibre.org/maplibre-gl-js-docs/api/geography/#lnglat)

### Nomenclature

* `lineage [string]` should match a lineage in lists
* `alt_name [string]` alternative name

### Ontology

* `overview [object]`
  * `category [string]` e.g. "National Overview"
  * `heading [string]` e.g. "England"
  * `short_heading [string]` e.g. "National"
* `area [object]`
  * `category [string]` e.g. "Local authority"
  * `noun_plural [string]` e.g. "local authorities"

### Parameter

* `id [string]`
* `display [string]`
* `format ['percentage']` (optional) values should be 0-1 and are formatted as percentages
* `precision [number|object]` (optional) decimal places for values, can a number for all values or an object with the following required keys:
  * `mean [number]`
  * `range [number]`

### Timeline
* `label [string]` (optional) e.g. "timeline",
* `initial_date [string]` (optional) should be in ISO format e.g. "2021-01-01", defaults to latest date
* `date_format [string|object]` (optional) can be a string for all dates or an object with the following required keys:
  * `heading [string]` [reference](https://date-fns.org/docs/format)
  * `chart_tooltip [string]` [reference](https://date-fns.org/docs/format)
* `frame_length [number]` (optional) time in milliseconds per date when playing the timeline. Defaults to 100.

## Development

### Install dependencies

```yarn install```

### Start dev server
```yarn dev```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Build:
`npm run build` 

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/richardgoater"><img src="https://avatars.githubusercontent.com/u/1429721?v=4?s=200" width="200px;" alt=""/><br /><sub><b>Richard Goater</b></sub></a><br /><a href="https://github.com/theosanderson/covince/commits?author=richardgoater" title="Code">💻</a></td>
    <td align="center"><a href="http://theo.io/"><img src="https://avatars.githubusercontent.com/u/19732295?v=4?s=200" width="200px;" alt=""/><br /><sub><b>Theo Sanderson</b></sub></a><br /><a href="https://github.com/theosanderson/covince/commits?author=theosanderson" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/sagar87"><img src="https://avatars.githubusercontent.com/u/7542594?v=4?s=200" width="200px;" alt=""/><br /><sub><b>Harald Vöhringer</b></sub></a><br /><a href="https://github.com/theosanderson/covince/commits?author=sagar87" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

