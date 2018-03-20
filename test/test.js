'use strict';
var geosimplify = require('../geosimplify'),
    tape = require('tape'),
    fs = require('fs');

var singapore = JSON.parse(fs.readFileSync('./test/fixtures/singapore.geojson'));
var svalbard = JSON.parse(fs.readFileSync('./test/fixtures/svalbard.geojson'));

tape('Basic fixture tests - larger threshold = more points removed', function (t) {
    var result = geosimplify(singapore.features[0].geometry.coordinates, 50, 1000);
    t.equal(result.length, 3, 'Reduced to 9 coords');
    result = geosimplify(singapore.features[0].geometry.coordinates, 5, 1000);
    t.equal(result.length, 9, 'Reduced to 9 coords');
    result = geosimplify(singapore.features[0].geometry.coordinates, 1, 1000);
    t.equal(result.length, 15, 'Reduced to 15 coords');
    result = geosimplify(singapore.features[0].geometry.coordinates, 0, 1000);
    t.equal(result.length, singapore.features[0].geometry.coordinates.length, 'Removed no coordinates');

    // Svalbard
    result = geosimplify(svalbard.features[0].geometry.coordinates, 50, 1000);
    t.equal(result.length, 5, 'Reduced to 5 coords');
    result = geosimplify(svalbard.features[0].geometry.coordinates, 5, 1000);
    t.equal(result.length, 11, 'Reduced to 11 coords');
    result = geosimplify(svalbard.features[0].geometry.coordinates, 1, 1000);
    t.equal(result.length, 25, 'Reduced to 25 coords');
    result = geosimplify(svalbard.features[0].geometry.coordinates, 0, 1000);
    t.equal(result.length, svalbard.features[0].geometry.coordinates.length, 'Removed no coordinates');

    t.end();
});

tape('Latitude-sensitive removal', function (t) {

    // 100m line with a 4.45m kink in the middle
    var equator_latitude_5m_offset = [[0, 0], [0.0005, 0.00004], [0.001, 0]];
    var result = geosimplify(equator_latitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = geosimplify(equator_latitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    var arctic_latitude_5m_offset = [[0, 67], [0.0005, 67.00004], [0.001, 67]];
    result = geosimplify(arctic_latitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = geosimplify(arctic_latitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    var equator_longitude_5m_offset = [[0, 0], [0.00004, 0.0005], [0, 0.001]];
    result = geosimplify(equator_longitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = geosimplify(equator_longitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    // Note the middle longitude here - this is 4.45m at 67 latitude
    var arctic_longitude_5m_offset = [[0, 67], [0.0001024, 67.0005], [0, 67.001]];
    result = geosimplify(arctic_longitude_5m_offset, 4.40, 1000);
    t.equal(result.length, 3, 'Removed no coordinates');
    result = geosimplify(arctic_longitude_5m_offset, 5.0, 1000);
    t.equal(result.length, 2, 'Removed one coordinates');

    t.end();
});
