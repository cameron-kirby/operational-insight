/**
 * Created by Xunrong Li on 8/6/15.
 * Configuration and constant values for AngularJS
 */

var origin = function () {
    // IE doesn't have window.location.origin, hence this hack
    if (!window.location.origin) {
        var port = window.location.port ? ':' + window.location.port : '';
        return window.location.protocol + "//" + window.location.hostname + port;
    } else {
        return window.location.origin;
    }
};

// on the server side, you can get host like this
// var host;
// if(process.env.VCAP_APPLICATION) {
//     host = process.env.VCAP_APPLICATION.host;
// } else {
//     host = 'http://localhost:3000';
// }

ResrcUtilApp.constant('REST_URL', {
    //hostname for bluemix
    //hostname: 'http://op-in.w3ibm.mybluemix.net',

    //hostname for local environment
    //hostname:'http://localhost:8080',

    // get it dynamically
    hostname: origin(),
    baseUrl: '/rest/v1/'
})
    .constant('IPT_URL','https://cfweb.rochny.ibm.com/ptd/projmain?ptdpage=detail&applid=')
    .constant('PROJECT_COLORS', ["#40739d", "#3fbda5", "#8494c7", "#e26f6f", "#6cc2e0", "#a2cb75", "#e2b3d3", "#edb874", "#f37e7e",
        "#a7aad6", "#67c7be", "#539ecb", "#f58e90", "#abb8de","#7ececd", "#81a9da", "#f79e8c", "#d19cc7",
        "#6cc49d", "#7ab6e3"])
    .constant('SKILL_COLORS', ["#6FA6D4", "#EDB874", "#60CDC1", "#CE97CB", "#DAE590", "#F6A08F","#40739d", "#3fbda5", "#8494c7", "#e26f6f",
        "#6cc2e0", "#a2cb75", "#e2b3d3", "#edb874", "#f37e7e", "#a7aad6", "#67c7be", "#539ecb", "#f58e90", "#abb8de",
        "#7ececd", "#81a9da", "#f79e8c", "#d19cc7", "#6cc49d", "#7ab6e3"])
    .constant('TRUE_ADMIN', ["cbcavale@us.ibm.com", "hyayi@us.ibm.com", "jawernet@us.ibm.com", "jcarroll@us.ibm.com", "nghi@us.ibm.com", "jyen@us.ibm.com", "branin@us.ibm.com"]);
