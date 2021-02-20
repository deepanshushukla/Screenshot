const  AWS = require('aws-sdk');
const credentials = {
    accessKeyId: 'AKIAU7RBOAYDXM3ZCAA6',
    secretAccessKey : 'GAQD%2FWQK8VDAd0iT6LWySE8SN%2Bk%3D'
};
AWS.config.update({credentials: credentials, region: 'us-east-1'});
var s3 = new AWS.S3();
console.log("PUT URLs");
for (i = 0; i < 10; i++) {
    var presignedPUTURL = s3.getSignedUrl('putObject', {
        Bucket: 'screen-recording-test',
        Key: 'deepanshu' + i, //filename
        ContentType: 'video/webm',
        Expires: 604800 //time to expire in seconds
    });
    console.log(presignedPUTURL);
}
// console.log("GET URLs");
// for (i = 0; i < 10; i++) {
//     var presignedPUTURL = s3.getSignedUrl('getObject', {
//         Bucket: 'screen-recording-test',
//         Key: 'deepanshu' + i, //filename
//         Expires: 604800 //time to expire in seconds
//     });
//     console.log(presignedPUTURL);