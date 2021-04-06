'use strict';
const geosimplify = require('../geosimplify'),
    tape = require('tape'),
    fs = require('fs');

const geosimplifyByRef = geosimplify.byRef;

const singapore = JSON.parse(fs.readFileSync('./test/fixtures/singapore.geojson'));
const svalbard = JSON.parse(fs.readFileSync('./test/fixtures/svalbard.geojson'));

function simplify(t) {
    return (points, ...rest) => {
        const vals = geosimplify(points, ...rest),
            indices = geosimplifyByRef(points, ...rest);

        t.deepEqual(vals, indices.map(i => points[i]));

        return vals;
    };
}

tape('Basic fixture tests - larger threshold = more points removed', (t) => {
    const gs = simplify(t);

    let result = gs(singapore.features[0].geometry.coordinates, 50, 1000);
    t.equal(result.length, 3, 'Reduced to 9 coords');
    result = gs(singapore.features[0].geometry.coordinates, 5, 1000);
    t.equal(result.length, 9, 'Reduced to 9 coords');
    result = gs(singapore.features[0].geometry.coordinates, 1, 1000);
    t.equal(result.length, 15, 'Reduced to 15 coords');
    result = gs(singapore.features[0].geometry.coordinates, 0, 1000);
    t.equal(result.length, singapore.features[0].geometry.coordinates.length, 'Removed no coordinates');

    // Svalbard
    result = gs(svalbard.features[0].geometry.coordinates, 50, 1000);
    t.equal(result.length, 5, 'Reduced to 5 coords');
    result = gs(svalbard.features[0].geometry.coordinates, 5, 1000);
    t.equal(result.length, 11, 'Reduced to 11 coords');
    result = gs(svalbard.features[0].geometry.coordinates, 1, 1000);
    t.equal(result.length, 25, 'Reduced to 25 coords');
    result = gs(svalbard.features[0].geometry.coordinates, 0, 1000);
    t.equal(result.length, svalbard.features[0].geometry.coordinates.length, 'Removed no coordinates');

    t.end();
});

tape('Latitude-sensitive removal', (t) => {
    const gs = simplify(t);

    // 100m line with a 4.45m kink in the middle
    const equator_latitude_5m_offset = [[0, 0], [0.0005, 0.00004], [0.001, 0]];
    let result = gs(equator_latitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = gs(equator_latitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    const arctic_latitude_5m_offset = [[0, 67], [0.0005, 67.00004], [0.001, 67]];
    result = gs(arctic_latitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = gs(arctic_latitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    const equator_longitude_5m_offset = [[0, 0], [0.00004, 0.0005], [0, 0.001]];
    result = gs(equator_longitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = gs(equator_longitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    // Note the middle longitude here - this is 4.45m at 67 latitude
    const arctic_longitude_5m_offset = [[0, 67], [0.0001024, 67.0005], [0, 67.001]];
    result = gs(arctic_longitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = gs(arctic_longitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    t.end();
});
