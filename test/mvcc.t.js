require('proof')(3, okay => {
    const mvcc = require('..')
    okay(mvcc.FORWARD, 0, 'forward')
    okay(mvcc.REVERSE, 1, 'reverse')
    okay(mvcc.MAP, 2, 'map')
})
