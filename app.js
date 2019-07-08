console.log("Started Loading App.js...")

import Cropper from './cropper/cropper.esm.js';

const player = $("#player")[0];
const canvas = $("#canvas")[0];
const context = canvas.getContext('2d');

var cropper;

var croppedImage;

var generateSVG;

function auth() {
  //if (gapi.auth == undefined)
  //  gapi.load('client', auth);

  gapi.auth.authorize({
    'client_id': '427410813651-k8tckputmdbhg890vp7fap5unh5rdlg5.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/cloudprint',
    'immediate': true
  });

}

function print() {
  var xhr = new XMLHttpRequest();
  var q = new FormData()
  q.append('xsrf', gapi.auth.getToken().access_token);
  q.append('printerid', 'b45bfeeb-46b2-2665-3169-738623ffd140');
  q.append('jobid', '');
  q.append('title', 'silentPrintTest');
  q.append('contentType', 'url');
  q.append('content', "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  q.append('ticket', '{ "version": "1.1", "print": {}}');


  xhr.open('POST', 'https://www.google.com/cloudprint/submit');
  xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  xhr.onload = function () {
    try {
      var r = JSON.parse(xhr.responseText);
      console.log(r.message)
    } catch (e) {
      console.log(xhr.responseText)
    }
  }

  xhr.send(q)

}

window.addEventListener('load', auth);

const constraints = {
  video: true,
};
/*
captureButton.click(() => {
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
  var pos = $("#canvas").position();
  $("#canvas").outerWidth($("#player").outerWidth());
  $("#canvas").outerHeight($("#player").outerHeight());
  
  $("#canvas").css({position: "absolute", top: pos.top,left: pos.left});
  
  $("#player").addClass("hidden");
});
*/

// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    player.srcObject = stream;
  });

$("#download").click(() => {
  this[0].href = $("#canvas")[0].toDataURL();
  this[0].download = "test.png";
});

$("#signout").click(() => {
  $("#signout-modal").removeClass("hidden");

  $("#webview").attr('width', $("#signout-modal .modal-content").innerWidth());
});

$(".close").click(() => {
  $(".modal").addClass("hidden");
});

$(".modal").click(function () {
  $(this).addClass("hidden");
}).children().click(function (e) {
  return false;
});

$("#submit").click(() => {
  $("#video-modal").removeClass("hidden");
});

$("#capture").click(() => {
  $("#canvas").attr("width", $("#player").width());
  $("#canvas").attr("height", $("#player").height());
  context.drawImage(player, 0, 0, canvas.width, canvas.height);

  $("#video-modal").addClass("hidden");
  $("#preview-modal").removeClass("hidden");
});

$("#retake").click(() => {
  $("#preview-modal").addClass("hidden");
  $("#video-modal").removeClass("hidden");
});

$("#canvas").click(() => {
  console.log(canvas.toDataURL());
})

$("#preview").click(() => {

  if (!croppedImage) {
    croppedImage = true;
    $("#preview").text("Preview ID");

    let factor = 1 / 3;
    var width = 1030 * factor;
    var height = 1283 * factor;

    cropper = new Cropper(canvas, {
      viewMode: 2,
      dragMode: 'move',
      aspectRatio: width / height,
      movable: false,
      rotatable: false,
      scalable: false,
      zoomable: false,
      cropBoxResizable: true,
      data: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: width,
        height: height,
        rotate: 0,
        scaleX: 1,
        scaleY: 1
      },
      crop(event) {
        console.log(event.detail.x);
        console.log(event.detail.y);
        console.log(event.detail.width);
        console.log(event.detail.height);
        console.log(event.detail.rotate);
        console.log(event.detail.scaleX);
        console.log(event.detail.scaleY);
      },
    });
  } else {
    var img;
    if (cropper) {
      img = cropper.getCroppedCanvas().toDataURL();
      cropper.destroy();
    } else {
      console.error("ERROR: Cropper Does not Exist, cannot make ID")
    }
    console.log("Generating ID...");
    var formArray = $("#form").serializeArray();
    var form = {};
    console.log(formArray);

    formArray.forEach((obj) => {
      console.log(obj);
      form[obj.name] = obj.value;
    });
    var name = form["name"];
    var reason = form["reason"];
    var dest = "To: " + form["dest"];

    var svg = generateSVG(dest, reason, name, img);

    $("#canvas").attr("height", 353).attr("width", 504);

    var url;

    context.clearRect(0, 0, canvas.width, canvas.height);
    var img = new Image();
    img.onload = function () {
      context.drawImage(img, 0, 0);

      //if (url) {
      //  URL.revokeObjectURL(url)
      //}
    }

    let blob = new Blob([svg], { type: 'image/svg+xml' });
    url = URL.createObjectURL(blob);
    let image = document.createElement('img');
    img.src = url;
  }
})

// Generate an ID in the SVG format for the given name, year, title and image (in a base 64 uri)
generateSVG = function (name, year, title, image) {
  // Generate the name of the file, using the name field
  var id_name = "id_" + name.toLowerCase().replace(" ", "_") + ".svg";
  // Get the text of the template, stored as a .txt in google drive
  var svg = TEXT_svg_template
    // Insert the name into the template
    .replace("[[NAME]]", name)
    // Insert the year into the template
    .replace("[[YEAR]]", year)
    // Insert the title into the template
    .replace("[[TITLE]]", title)
    // Insert the image into the template
    .replace("[[IMAGE]]", image);

  return svg;

}

console.log("Loaded App.js");