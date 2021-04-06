## geosimplify-js

This module simplifies sequences of [longitude,latitude] pairs using
geography-aware measurement thresholds.

Based on https://github.com/mourner/simplify-js, `geosimplify-js`
fixes the problem that the simple pythagorean measure used in `simplify-js`
changes size if you simply give it longitude/latitude sequences to
simplify.

Usage:

```javascript
simplify([[lon,lat],[lon,lat],[lon,lat]], offsetThresholdInMetres, gapThresholdInMetres);
```

**path** - an array of `longitude,latitude` pairs

**offsetThreshold** - how far outside the straight line a point needs to be for it to be "kept"

**gapThreshold** - if removing a point would create a segment longer than this, do not remove it

Example:

```javascript
var geosimplify = require('@mapbox/geosimplify-js');
var coords = [ [ 15.603332, 78.227070 ],
               [ 15.606422, 78.226824 ],
               [ 15.608782, 78.226667 ],
               [ 15.610799, 78.226535 ] ];
var result = geosimplify(coords, 5, 50);
```

Alternate API:

```javascript
var geosimplifyByRef = require('@mapbox/geosimplify-js').byRef;
var coords = [ [ 15.603332, 78.227070 ],
               [ 15.606422, 78.226824 ],
               [ 15.608782, 78.226667 ],
               [ 15.610799, 78.226535 ] ];
var result = geosimplifyByRef(coords, 5, 50);
```

In this API, `result` contains an array of indices into the `coords` array instead of points themselves.
