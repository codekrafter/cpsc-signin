console.log("Started Loading App.js...")

import Cropper from './cropper/cropper.esm.js';

const player = $("#player")[0];
const canvas = $("#canvas")[0];
const context = canvas.getContext('2d');

var cropper;

var croppedImage;
var previewed;
var svg;

var generateSVG;

var svgParams = {};

function printCanvas(dataUrl) {
  var windowContent = '<!DOCTYPE html>';
  windowContent += '<html>'
  windowContent += '<head><title>Print canvas</title></head>';
  windowContent += '<body>'
  windowContent += '<img src="' + dataUrl + '">';
  windowContent += '</body>';
  windowContent += '</html>';
  var printWin = window.open('', '', 'width=340,height=260');
  printWin.document.open();
  printWin.document.write(windowContent);
  printWin.document.close();
  printWin.focus();
  printWin.print();
  printWin.close();
}

function auth() {
  $.getJSON("priv_service_account.json", function (json) {
    gapi.auth(json.client_email, "https://www.googleapis.com/auth/cloudprint https://www.googleapis.com/auth/drive", json.private_key, (success) => {
      console.log("Authenticated");
    });
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

$(document).ready(auth);

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

  $("#preview").text("Crop Picture");
  croppedImage = false;
  previewed = false;
  svg = undefined;
});

$("#retake").click(() => {
  $("#preview-modal").addClass("hidden");
  $("#video-modal").removeClass("hidden");
});

$("#canvas").click(() => {
})

$("#preview").click(() => {
  if (previewed) {
    //TODO: Print
    var params = JSON.stringify(svgParams);

    let demoSVG = `<?xml version="1.0" standalone="no"?>
<svg width="160" height="140" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <line x1="40" x2="120" y1="20" y2="20" stroke="black" stroke-width="20" stroke-linecap="butt"/>
  <line x1="40" x2="120" y1="60" y2="60" stroke="black" stroke-width="20" stroke-linecap="square"/>
  <line x1="40" x2="120" y1="100" y2="100" stroke="black" stroke-width="20" stroke-linecap="round"/>
</svg>`

    var doc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [353, 504]
    })
    doc.addSvgAsImage(demoSVG, 0, 0, 353, 504, "demoSVG", "NONE", 0)

    var pdf = doc.output('datauri', { filename: "id.pdf" });

    gapi.drive.upload("ID: " + svgParams.name, svg, "image/svg+xml", (success, id) => {
      if (!success) {
        console.error("Error on File Upload");
      } else {
        gapi.print.submit(id);
      }
    });
  } else
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

      formArray.forEach((obj) => {
        form[obj.name] = obj.value;
      });
      var name = form["name"];

      var now = new Date();
      var reason = form["reason"] + " | " + now.getMonth() + "/" + now.getDay() + "/" + now.getFullYear().toString().substr(2, 2);

      var dest = "To: " + form["dest"];

      svg = generateSVG(dest, reason, name, img);

      $("#canvas").attr("height", 353).attr("width", 504);

      context.clearRect(0, 0, canvas.width, canvas.height);
      var img = new Image();
      img.onload = function () {
        context.drawImage(img, 0, 0);
      }

      var url = 'data:image/svg+xml;base64, ' + btoa(svg);//URL.createObjectURL(blob);
      let image = document.createElement('img');
      img.src = url;

      $("#preview").text("Print");
      previewed = true;

      //TODO: Print
      //gapi.print.submit();
    }
})

// Generate an ID in the SVG format for the given name, year, title and image (in a base 64 uri)
generateSVG = function (name, year, title, image) {
  svgParams.name = name;
  svgParams.year = year;
  svgParams.title = title;
  svgParams.image = image;
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