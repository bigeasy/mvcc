require('./proof')(1, function (step, serialize, deepEqual, Strata, tmp) {
    var mvcc = require('../..')
    var comparator = {
        versioned: function (a, b) {
            if (a.value == b.value) {
                return a.version - b.version
            } else {
                return a.value < b.value ? -1 : 1
            }
        },
        unversioned: function (a, b) {
            return a < b ? -1 : a > b ? 1 : 0
        }
    }
    var strata = new Strata({
        comparator: comparator.versioned,
        leafSize: 3, branchSize: 3,
        directory: tmp
    })
    step(function () {
        serialize(__dirname + '/fixtures/nine.json', tmp, step())
    }, function () {
        strata.open(step())
    }, function () {
        mvcc.reverse(strata, comparator.unversioned, { 0: true }, 'i', step())
    }, function (iterator) {
        var records = []
        step(function () {
            step(function () {
                iterator.next(step())
            }, function (record) {
                if (record) records.push(record.value)
                else step(null, records)
            })()
        }, function () {
            iterator.unlock()
            strata.close(step())
        }, function () {
            return records
        })
    }, function (records) {
        deepEqual(records, [ 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a' ], 'records')
    })
})
