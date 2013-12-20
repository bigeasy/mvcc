var cadence = require('cadence')
var riffle = require('riffle')

function Forward (comparator, versions, iterator, next) {
    this._iterator = iterator
    this._comparator = comparator
    this._versions = versions
    this._next = next
}

function valid (versions) {
    return function (key) { return versions[key.version] }
}

Forward.prototype.next = cadence(function (step) {
    if (!this._next) return this._next
    step(function () {
        var next = this._next
        step(function () {
            this._iterator.next(valid(this._versions), step())
        }, function (candidate) {
            if (candidate && this._comparator(candidate.value, next.value) == 0) {
                next = candidate
            } else {
                this._next = candidate
                step(null, next)
            }
        })()
    })
})

Forward.prototype.unlock = function () {
    this._iterator.unlock()
}

exports.forward = cadence(function (step, strata, comparator, versions, key) {
    var composite = { value: key, version: 0 }
    step(function () {
        riffle.forward(strata, composite, step())
    }, function (iterator) {
        step (function () {
            iterator.next(valid(versions), step())
        }, function (next) {
            return new Forward(comparator, versions, iterator, next)
        })
    })
})

function Reverse (comparator, versions, iterator, next) {
    this._iterator = iterator
    this._comparator = comparator
    this._versions = versions
    this._next = next
}

Reverse.prototype.next = cadence(function (step) {
    if (!this._next) return this._next
    step(function () {
        var next = this._next
        step(function () {
            this._iterator.next(valid(this._versions), step())
        }, function (candidate) {
            if (!candidate || this._comparator(candidate.value, next.value) != 0) {
                this._next = candidate
                step(null, next)
            }
        })()
    })
})

Reverse.prototype.unlock = function () {
    this._iterator.unlock()
}

exports.reverse = cadence(function (step, strata, comparator, versions, key) {
    var composite = { value: key, version: Number.MAX_VALUE }
    step(function () {
        riffle.reverse(strata, composite, step())
    }, function (iterator) {
        step (function () {
            iterator.next(valid(versions), step())
        }, function (next) {
            return new Reverse(comparator, versions, iterator, next)
        })
    })
})

exports.extractor = function (extractor) {
    return function (record) {
        return {
            value: extractor(record),
            version: record.version
        }
    }
}

exports.comparator = function (comparator) {
    return function (a, b) {
        var compare = comparator(a.value, b.value)
        if (compare) return compare
        return a.version - b.version
    }
}
