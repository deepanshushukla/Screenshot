const {desktopCapturer} = require('electron');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/
var chunks = [];
var mediaRecorder;
var videoStream;
const TIMESLICE = 30000;
function fileUpload() {
    const fileContent = fs.readFileSync(path.join(__dirname,'videos', 'video_60sec_1613983482359.webm'));
    console.log('file',fileContent);
   // console.log(mime.getType(path.join(__dirname,'videos', 'video_30sec_1613751557406.webm')));

    var requestOptions = {
        method: 'PUT',
        body: fileContent,
        redirect: 'follow',
        headers: {
        },
    };

    fetch("https://screen-recording-test.s3.amazonaws.com/deepanshu0.webm?AWSAccessKeyId=AKIAU7RBOAYDXM3ZCAA6&Expires=1614589151&Signature=iGgV32ofbhQhUmqJC28i0nK6pTc%3D",
        requestOptions)
        .then(result => {
            console.log(result)

        fetch("https://screen-recording-test.s3.amazonaws.com/deepanshu0.webm?AWSAccessKeyId=AKIAU7RBOAYDXM3ZCAA6&Expires=1614589151&Signature=2sg0Nt86jYflXp3B6znPxG%2BVQ7I%3D").
        then((res)=>{
            res?.arrayBuffer().then((buff)=> {
                const data = new Uint8Array(buff);
                console.log(data);
                fs.writeFile(path.join(__dirname, 'videos', 'output.webm'), data, (fileRes) => {
                    console.log('fileres', fileRes)
                });
            }
        )
        }).catch(e=>console.log('e',e))

        })
        .catch(error => console.log('error', error));
}
function saveAfterTimeSlice () {
        const blob = new Blob(chunks, {
            type: 'video/webm; codecs=vp9'
        });


        blob.arrayBuffer().then((result)=>{
            const buffer = Buffer.from(result);
            const fileName = `video_${TIMESLICE/1000}sec_${new Date().getTime()}.webm`;
            fs.writeFile( path.join(__dirname,'videos', fileName), buffer, (err) => {
                    chunks = [];
                    if (err) {
                        console.error('Failed to save video ' + err);
                    } else {
                        setTimeout(()=>{
                            playRecordedVideo();
                        })

                    }
                }
            );

        })

}
function saveRecording (e){
    var save =  function () {
        const blob = new Blob(chunks, {
            type: 'video/webm; codecs=vp9'
        });
        blob.arrayBuffer().then((result)=>{
            const buffer = Buffer.from(result);
            console.log('buffer',buffer) // this shoiuld be saved to db

            fs.writeFile( path.join(__dirname,'videos', `example.webm`), buffer, (err) => {
                    chunks = [];
                                if (err) {
                                    console.error('Failed to save video ' + err);
                                } else {
                                    setTimeout(()=>{
                                        playRecordedVideo();
                                    })

                                }
            }
            );

        })

        // toArrayBuffer(new Blob(chunks, {type: 'video/webm; codecs=vp9'}), function (ab) {
        //     var buffer = toBuffer(ab);
        //     var file = path.join(__dirname,'videos', `example.webm`);
        //         fs.writeFile(file, buffer, function (err) {
        //             chunks = [];
        //             if (err) {
        //                 console.error('Failed to save video ' + err);
        //             } else {
        //                 console.log('Saved video: ' + file);
        //                 setTimeout(()=>{
        //                     playRecordedVideo();
        //                 })
        //
        //             }
        //         });
        // });
    }
    if(mediaRecorder){
        mediaRecorder.onstop = save;
        mediaRecorder.stop();
        videoStream.stop();
         mediaRecorder = undefined;
    }
}


function toArrayBuffer(blob, cb) {
    let fileReader = new FileReader();
    fileReader.onload = function() {
        let arrayBuffer = fileReader.result;
        cb(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
}
function playRecordedVideo (){
        var x = document.getElementById("savedVideo");
        x.src = "videos/example.webm";
        x.load();
}
function toBuffer(ab) {
    return Buffer.from(ab);
}
function fullScreenScreenshot(callback, imageFormat) {
    var _this = this;
    this.callback = callback;
    imageFormat = imageFormat || 'image/png';

    this.handleStream = (stream) => {
        videoStream = stream;
        let video = document.getElementById('screenShareVideo');

        if (typeof (video.srcObject) !== 'undefined') {

            video.srcObject = videoStream;

        }

        else {

            video.src = URL.createObjectURL(videoStream);

        }
        // Create hidden video tag

        mediaRecorder = new MediaRecorder(videoStream, {mimeType: 'video/webm; codecs=vp9'});
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
            saveAfterTimeSlice()
        };
        mediaRecorder.start(TIMESLICE);






        // video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

        // Event connected to stream
        video.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
           // video.style.height = this.videoHeight + 'px'; // videoHeight
          //  video.style.width = this.videoWidth + 'px'; // videoWidth
          //   video.style.height = 400 + 'px'; // videoHeight
          //   video.style.width = 400+ 'px'; // videoWidth
            video.play();

            // Create canvas
            // var canvas = document.createElement('canvas');
            // canvas.width = this.videoWidth;
            // canvas.height = this.videoHeight;
            // var ctx = canvas.getContext('2d');
            // // Draw video on canvas
            // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            //
            // if (_this.callback) {
            //     // Save screenshot to base64
            //     _this.callback(canvas.toDataURL(imageFormat));
            // } else {
            //     console.log('Need callback!' , canvas.toDataURL(imageFormat));
            // }

            // Remove hidden video tag
            //video.remove();
            // try {
            //     // Destroy connect to stream
            //     stream.getTracks()[0].stop();
            // } catch (e) {}
        };

        // document.body.appendChild(video);
    };

    this.handleError = function(e) {
        console.log(e);
    };

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {
            // Filter: main screen
            //console.log(sources)
            if ((source.name === "Entire Screen") && (source.name !== "Screenshot")) {
                try{
                    const stream = await navigator.mediaDevices.getUserMedia({
                        frameRate: { ideal: 10, max: 20 },
                        audio: false,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1080,
                                maxWidth: 1080,
                                minHeight: 720,
                                maxHeight: 720
                            }
                        }
                    });
                    stream.stop = function () {
                        console.log('stop called');
                        stream.getAudioTracks().forEach(function (track) {
                            track.stop();
                        });
                        stream.getVideoTracks().forEach(function (track) {
                            track.stop();
                        });
                    };
                    _this.handleStream(stream);
                } catch (e) {
                    console.log(e)
                    _this.handleError(e);
                }
            }
        }
    });
}