require('proof')(2, function (ok) {
    var mvcc = require('../..')

    var left = {
        value: {
            first: 'Abraham',
            last: 'Lincoln'
        },
        version: 1
    }

    var right = {
        value: {
            first: 'Abraham',
            last: 'Lincoln'
        },
        version: 2
    }

    function comparator (a, b) {
        var compare = a.last < b.last ? -1 : b.last < a.last ? 1 : 0
        if (compare) return compare
        return a.first < b.first ? -1 : b.first < a.first ? 1 : 0
    }

    ok((mvcc.comparator(comparator))(left, right) < 0, 'versioned')
    right.value.first = 'Mary'
    ok((mvcc.comparator(comparator))(left, right) < 0, 'record')
})
