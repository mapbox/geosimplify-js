/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { 'use strict';

var cheapRuler = require('cheap-ruler');

var rulerCache = {};

function getRuler(latitude) {
    // Cache rulers every 0.00001 degrees of latitude
    var roundedLatitude = Math.round(latitude * 100000);
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
    var ruler = getRuler(p[1]);
    var pointOnLine = ruler.pointOnLine([p1,p2], p).point;
    return ruler.distance(p, pointOnLine);
}

function simplifyDPStep(points, first, last, offsetTolerance, gapTolerance, simplified) {
    var maxDistanceFound = offsetTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var distance = getSegDist(points[i], points[first], points[last]);

        if (distance > maxDistanceFound) {
            index = i;
            maxDistanceFound = distance;
        }
    }

    // Don't remove a point if it would create a segment longer
    // than gapTolerance
    var firstLastDist = getDist(points[first], points[last]);

    if (maxDistanceFound > offsetTolerance || firstLastDist > gapTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, offsetTolerance, gapTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, offsetTolerance, gapTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, offsetTolerance, gapTolerance) {
    var last = points.length - 1;
    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, offsetTolerance, gapTolerance, simplified);
    simplified.push(points[last]);
    return simplified;
}

function simplify(points, offsetTolerance, gapTolerance) {
    if (points.length <= 2) return points;
    points = simplifyDouglasPeucker(points, offsetTolerance, gapTolerance );
    return points;
}

// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return simplify; });
else if (typeof module !== 'undefined') {
    module.exports = simplify;
    module.exports.default = simplify;
} else if (typeof self !== 'undefined') self.simplify = simplify;
else window.simplify = simplify;

})();