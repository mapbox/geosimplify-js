/*
 (c) 2017, Mapbox

 Based on simplify-js (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/
'use strict';
const cheapRuler = require('cheap-ruler');

const rulerCache = {};

function getRuler(latitude) {
// Cache rulers every 0.00001 degrees of latitude
    const roundedLatitude = Math.round(latitude * 100000);
    if (rulerCache[roundedLatitude] === undefined) {
        rulerCache[roundedLatitude] = cheapRuler(latitude, 'meters');
    }
    return rulerCache[roundedLatitude];
}

// Distance between two points in metres
function getDist(p1, p2) {
    getRuler(p1[1]).distance(p1, p2);
}

// Distance from a point to a segment (line between two points) in metres
function getSegDist(p, p1, p2) {
    const ruler = getRuler(p[1]);
    const pointOnLine = ruler.pointOnLine([p1, p2], p).point;
    return ruler.distance(p, pointOnLine);
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, offsetTolerance, gapTolerance, save) {
    const last = points.length - 1;
    save(0);
    simplifyDPStep(0, last);
    save(last);

    function simplifyDPStep(first, last) {
        let maxDistanceFound = offsetTolerance,
            index;

        for (let i = first + 1; i < last; i++) {
            const distance = getSegDist(points[i], points[first], points[last]);

            if (distance > maxDistanceFound) {
                index = i;
                maxDistanceFound = distance;
            }
        }

        // Don't remove a point if it would create a segment longer
        // than gapTolerance
        const firstLastDist = getDist(points[first], points[last]);

        if (maxDistanceFound > offsetTolerance || firstLastDist > gapTolerance) {
            if (index - first > 1) simplifyDPStep(first, index);
            save(index);
            if (last - index > 1) simplifyDPStep(index, last);
        }
    }
}

function simplify(points, offsetTolerance, gapTolerance) {
    if (points.length <= 2) return points;
    const simplified = [];
    simplifyDouglasPeucker(points, offsetTolerance, gapTolerance, save);
    return simplified;

    function save(index) {
        simplified.push(points[index]);
    }
}

function simplifyByRef(points, offsetTolerance, gapTolerance) {
    if (points.length <= 2)
        return points.map((_, i) => i);
    const simplified = [];
    simplifyDouglasPeucker(points, offsetTolerance, gapTolerance, save);
    return simplified;

    function save(index) {
        simplified.push(index);
    }
}

module.exports = simplify;
module.exports.byRef = simplifyByRef;
