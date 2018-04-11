
/**
 * Check URL for any get values.
 * 
 * Code from https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
 */
function GetURLParameter(param) {
    var pageURL = decodeURIComponent(window.location.search.substring(1)),
        urlVariables = pageURL.split('&'),
        paramName,
        i;

    for (i = 0; i < urlVariables.length; i++) {
        paramName = urlVariables[i].split('=');

        if (paramName[0] === param) {
            return paramName[1] === undefined ? true : paramName[1];
        }
    }
};

/**
 * Merge two or more arrays.
 * 
 * Code from https://codegolf.stackexchange.com/a/17129
 */
function MergeArrays() {
    var args = arguments;
    var hash = {};
    var arr = [];
    for (var i = 0; i < args.length; i++) {
        for (var j = 0; j < args[i].length; j++) {
            if (hash[args[i][j]] !== true) {
                arr[arr.length] = args[i][j];
                hash[args[i][j]] = true;
            }
        }
    }

    return arr;
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    GetURLParameter,
    MergeArrays
}