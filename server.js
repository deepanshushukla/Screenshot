(
    function() {
        "use strict";
        let express = require('express');
        let screenRecordingInterval ;
        let app = express();
        const bodyParser = require("body-parser");
        const STARTED='STARTED';
        const STOPPED='STOPPED';
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.post('/startScreenRecording', function(req, res) {
            console.log(req.body);
            screenRecordingInterval = setInterval( () => {
                getScreenShot();
            }, 10000);
            res.send(STARTED);
        });
        app.get('/stopScreenRecording', function(req, res) {
            console.log('stop screenshot');
           if(screenRecordingInterval) {
               clearInterval(screenRecordingInterval);
           }
            res.send(STOPPED);
        });
        let server = app.listen(1790, function () {
            console.log('Express server listening on port ' + server.address().port);
        });
        module.exports = app;
    }()
);