export default function loadShader( path, callback ) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.onload = function () {
        if (request.status < 200 || request.status > 299) {
            callback('Error: HTTP Status ' + request.status + ' on resource ' + path);
        } else {
            callback(null, request.responseText);
        }
    };
    request.send();
};