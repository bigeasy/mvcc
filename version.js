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
