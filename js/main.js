(function () {
  var video = document.querySelector('video');

  var trackingTask = null;

  var pictureWidth = 240;
  var pictureHeight = 180;

  function checkRequirements() {
    var deferred = new $.Deferred();

    //camera access
    if (!Modernizr.getusermedia) {
      deferred.reject('Your browser doesn\'t support getUserMedia (according to Modernizr).');
    }
    //web workers, typed arrays and file API are required by gif.js
    if (!Modernizr.webworkers) {
      deferred.reject('Your browser doesn\'t support web workers (according to Modernizr).');
    }
    if (!Modernizr.filereader) {
      deferred.reject('Your browser doesn\'t support File API (according to Modernizr).');
    }
    if (!Modernizr.typedarrays) {
      deferred.reject('Your browser doesn\'t support typed arrays (according to Modernizr).');
    }

    deferred.resolve();

    return deferred.promise();
  }

  function searchForFrontCamera() {
    var deferred = new $.Deferred();

    //MediaStreamTrack.getSources seems to be supported only by Chrome
    if (MediaStreamTrack && MediaStreamTrack.getSources) {
      MediaStreamTrack.getSources(function (sources) {
        var rearCameraIds = sources.filter(function (source) {
          return (source.kind === 'video' && source.facing === 'user');
        }).map(function (source) {
          return source.id;
        });

        if (rearCameraIds.length) {
          deferred.resolve(rearCameraIds[0]);
        } else {
          deferred.resolve(null);
        }
      });
    } else {
      deferred.resolve(null);
    }

    return deferred.promise();
  }

  function setupVideo(frontCameraId) {
    var deferred = new $.Deferred();
    var getUserMedia = Modernizr.prefixed('getUserMedia', navigator);
    var videoSettings = {
      video: {
        optional: [
          {
            width: {max: pictureWidth}
          },
          {
            height: {max: pictureHeight}
          }
        ]
      }
    };

    //if front camera is available - use it
    if (frontCameraId) {
      videoSettings.video.optional.push({
        sourceId: frontCameraId
      });
    }

    getUserMedia(videoSettings, function (stream) {
      //Setup the video stream
      video.src = window.URL.createObjectURL(stream);

      window.stream = stream;

      video.addEventListener("loadedmetadata", function (e) {
        //get video width and height as it might be different than we requested
        pictureWidth = this.videoWidth;
        pictureHeight = this.videoHeight;

        if (!pictureWidth && !pictureHeight) {
          //firefox fails to deliver info about video size on time (issue #926753), we have to wait
          var waitingForSize = setInterval(function () {
            if (video.videoWidth && video.videoHeight) {
              pictureWidth = video.videoWidth;
              pictureHeight = video.videoHeight;

              clearInterval(waitingForSize);
              deferred.resolve();
            }
          }, 100);
        } else {
          deferred.resolve();
        }
      }, false);
    }, function () {
      deferred.reject('There is no access to your camera, have you denied it?');
    });

    return deferred.promise();
  }

  function step1() {

    checkRequirements()
      .then(searchForFrontCamera)
      .then(setupVideo)
      .done(function () {
        //Hide the 'enable the camera' info
        $('#step1 figure').removeClass('not-ready');
        setupTrackingJS();
      })
      .fail(function (error) {
        showError(error);
      });
  }

  function takeSnapshot(){
    var video = document.querySelector('#camera-stream');
    var image = document.querySelector('#snap');

    var hidden_canvas = document.querySelector('#step1 canvas.hidden'),
    context = hidden_canvas.getContext('2d');

    var width = video.videoWidth,
    height = video.videoHeight;

    if (width && height) {
      
      // Setup a canvas with the same dimensions as the video.
      hidden_canvas.width = width;
      hidden_canvas.height = height;
  
      // Make a copy of the current frame in the video on the canvas.
      context.drawImage(video, 0, 0, width, height);

      // Turn the canvas image into a dataURL that can be used as a src for our photo.
      return hidden_canvas.toDataURL('image/png');
    }
  }

  function setupTrackingJS() {
    var canvas = document.querySelector('#step1 canvas.visible');
    var scaledWidth = 240, scaledHeight = Math.round((scaledWidth / pictureWidth) * pictureHeight);
    var frameCount = 0;

    //setup canvas
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    var ctx = canvas.getContext('2d');

    var tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    trackingTask = tracking.track('#step1 video', tracker);

    var call_flag = true;

    tracker.on('track', function (event) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      console.log("__"+canvas.toDataURL());

      event.data.forEach(function (rect) {
         
        console.log("Face Tracked");

        var video = document.querySelector('#camera-stream');
        var image = document.querySelector('#step1 canvas.hidden');
        
        var snap = takeSnapshot();

        // Show image. 
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Pause video playback of stream.
        video.pause();

        window.stream.getTracks()[0].stop();

        //console.log("video off")

        //console.log("SNAPSHOT DATA : " + image.toDataURL('image/jpeg'));

        trackingTask.stop();

        if(call_flag == true) {
          call_flag = false;
          console.log("Call flag")
          take_snapshot(image.toDataURL('image/jpeg'));
        }

        return true;

      });
    });
  }

  /*********************************
   * UI Stuff
   *********************************/

    //start step1 immediately
  step1();
  $('.help').popover();

  function changeStep(step) {
    if (step === 1) {
      video.play();
      trackingTask.run();
    } else {
      video.pause();
      trackingTask.stop();
    }

    hideError();
    $('body').attr('class', 'step' + step);
    $('.nav li.active').removeClass('active');
    $('.nav li:eq(' + (step - 1) + ')').removeClass('disabled').addClass('active');
  }

  function showError(text) {
    $('.alert').show().find('span').text(text);
  }

  function hideError() {
    $('.alert').hide();
  }

  $('.start-over').click(function () {
    changeStep(1);
  });

  $('.nav').on('click', 'a', function () {
    if (!$(this).parent().is('.disabled')) {
      var step = $(this).data('step');
      changeStep(step);
    }

    return false;
  });
})();
