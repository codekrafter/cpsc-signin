//'use strict';

//import Cropper from './cropper/cropper.esm.js';

var cropper;

var croppedImage;
var previewed;
var svg;

var generateSVG;
var reset;

var svgParams = {};

// Program state fake enum
var ProgramStateEnum = Object.freeze({ "HOME_SCREEN": 0, "SIGN_OUT": 1, "IMG_CAPTURE": 2, "IMG_PREVIEW": 3, "IMG_CROP": 4, "ID_PREVIEW": 5, "PRINTED": 6 })

var CurrentState = ProgramStateEnum.HOME_SCREEN;

// Pre-Authenticate on Boot to save time when uploading image
function auth() {
  $.getJSON("priv_service_account.json", function (json) {
    gapi.auth(json.client_email, "https://www.googleapis.com/auth/cloudprint https://www.googleapis.com/auth/drive", json.private_key, (success) => {
      console.log("Authenticated");
    });
  });
}


$().ready(() => {
  auth();

  const constraints = {
    video: true,
  }

  // Attach the video stream to the video element and autoplay.
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      player.srcObject = stream;
    });
})

$("#signout").click(() => {
  $("#signout-modal")[0].showModal();

  CurrentState = ProgramStateEnum.SIGN_OUT;

  $("#webview").attr('width', $("#signout-modal .modal-content").innerWidth());
});

$("input[type=radio]").click(() => {
  $(".radio-error").removeClass("radio-error");
});

$("#submit").click(() => {
  $("mdl-textfield").removeClass("is-invalid");
  $(".radio-error").removeClass("radio-error");

  var invalids = [];

  var reason = $('input[type=radio][name=reason]').filter(':checked').val();
  if (!reason) {
    $("#radios, #reason-head").addClass("radio-error");
    invalids.push("a reason for your visit");
  }

  if (!$("input[name=name]").val()) {
    $(".txt-name").addClass("is-invalid")
    invalids.push("a name");
  }

  if (!$("input[name=dest]").val()) {
    $(".txt-dest").addClass("is-invalid")

    invalids.push("a destination");
  }

  // Display toast with concatenated message
  if (invalids.length > 0) {
    var msg = "Please provide ";
    let last = invalids.length - 1;
    if (invalids.length > 1) {
      invalids.forEach((field, i) => {
        if (i == last) {
          msg += "and " + field.trim();
        }
        else {
          msg += field.trim() + ", ";
        }
      })
    } else {
      msg += invalids[0];
    }
    var data = { message: msg };
    $("#snack")[0].MaterialSnackbar.showSnackbar(data);
    return false;
  }

  if(!$("#main-modal").attr("open")) {
  $("#main-modal")[0].showModal();
  }
  CurrentState = ProgramStateEnum.IMG_CAPTURE;

  $("#main-canvas").attr("width", $("#player").width());
  $("#main-canvas").attr("height", $("#player").height());
});

$('body').on('click', '.close', function () {
  console.log(this.classList + ", is executing a close/goback");
  reset();
  $(this).parents("dialog")[0].close();
  CurrentState = ProgramStateEnum.HOME_SCREEN;
})

$("dialog").click(function (event) {
  if (event.target == this) {
    reset();
    this.close();
    CurrentState = ProgramStateEnum.HOME_SCREEN;
  }
});

$(document).on('keypress', function (e) {
  if (e.which == 13) {
    if ($(e.target).parents("#form")) {
      $("#submit").click();
    } else {
      e.target.click();
    }

    //console.log("Handling Enter Press (" + CurrentState + ")");
    /*switch (CurrentState) {
      case ProgramStateEnum.HOME_SCREEN:
        $("#submit").click();
        break;
      case ProgramStateEnum.IMG_CAPTURE:
      case ProgramStateEnum.IMG_PREVIEW:
      case ProgramStateEnum.IMG_CROP:
      case ProgramStateEnum.ID_PREVIEW:
        $("#btn-pri").click();
        break;
      case ProgramStateEnum.PRINTED:
        break;
      case ProgramStateEnum.SIGN_OUT:
        break;
      default:
        console.error("ON ENTER PRESS: UNKNOWN PROGRAM STATE " + CurrentState);
        break;
    }*/
  }
});

reset = function () {
  $("input[type=text]").val("");
  $('input[type="radio"]').prop('checked', false).parent().removeClass('is-checked');

  $("#player").removeClass("hidden");
  $("#main-canvas").addClass("hidden");
  $("#flash-blocker").addClass("hidden").css({ opacity: 1 });

  $("#btn-pri").addClass("capture").removeClass("crop").removeClass("btn-preview").removeClass("print").text("Capture");
}

$('body').on('click', '.capture', () => {
  console.log("capturing");
  CurrentState = ProgramStateEnum.IMG_PREVIEW;

  var player = $("#player");

  var w = player.width();
  var h = player.height();

  if (w > 0 && h > 0) {
    $("#main-canvas").attr("width", w);
    $("#main-canvas").attr("height", h);
  }

  var ctx = $("#main-canvas")[0].getContext('2d');

  player.addClass("hidden");
  $("#main-canvas").removeClass("hidden");
  ctx.drawImage(player[0], 0, 0, $("#main-canvas").width(), $("#main-canvas").height());

  $("#flash-blocker").removeClass("hidden");
  $("#flash-blocker").width($("#main-canvas").outerWidth());
  $("#flash-blocker").height($("#main-canvas").outerHeight());
  var canPos = $("#main-canvas").position();
  $("#flash-blocker").css({ left: canPos.left, top: canPos.top });

  $("#flash-blocker").animate({
    opacity: 0,
  }, 500);

  $("#btn-pri").removeClass("capture").addClass("crop").text("Crop");
  $("#btn-sec").removeClass("go-back").addClass("retake").text("Retake");
});

$('body').on('click', '.retake', () => {
  console.log("Retaking...");
  CurrentState = ProgramStateEnum.IMG_CAPTURE;

  $("#main-canvas").cropper('destroy');

  $("#player").removeClass("hidden");
  $("#main-canvas").addClass("hidden");
  $("#flash-blocker").addClass("hidden").css({ opacity: 1 });

  $("#btn-pri").addClass("capture").removeClass("crop").text("Capture");
});

$('body').on('click', '.crop', () => {
  CurrentState = ProgramStateEnum.IMG_CROP;
  $("#flash-blocker").addClass("hidden");
  let factor = 1 / 3;
  var width = 1030 * factor;
  var height = 1283 * factor;

  $("#main-canvas").cropper({
    viewMode: 0,
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
    }
  });

  $("#btn-pri").removeClass("crop").addClass("btn-preview").text("Preview");
});

$('body').on('click', '.btn-preview', function () {
  CurrentState = ProgramStateEnum.ID_PREVIEW;

  var img = "";

  if ($("#main-canvas").cropper('getCroppedCanvas')) {
    img = $("#main-canvas").cropper('getCroppedCanvas').toDataURL();
    $("#main-canvas").cropper('destroy');
  }

  var reason = $('input[type=radio][name=reason]').filter(':checked').val();
  var name = $("input[name=name]").val();
  var dest = $("input[name=dest]").val()

  svg = generateSVG(dest, reason, name, img);

  $("#main-canvas").attr("height", 504).attr("width", 353);

  var ctx = $("#main-canvas")[0].getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
  }

  var url = 'data:image/svg+xml;base64, ' + btoa(svg);//URL.createObjectURL(blob);
  let image = document.createElement('img');
  img.src = url;

  $("#btn-pri").removeClass("btn-preview").addClass("print").text("Print");
  $("#btn-sec").removeClass("retake").addClass("go-back").text("Cancel");
});

$('body').on('click', '.print', function() {
  gapi.drive.upload("ID: " + svgParams.name, svg, "image/svg+xml", (success, id) => {
    if (!success) {
      console.error("Error on File Upload");
    } else {
      gapi.print.submit(id);
    }
  });
  CurrentState = ProgramStateEnum.PRINTED;
});

$("#preview").click(() => {
  if (previewed) {
    var params = JSON.stringify(svgParams);

    gapi.drive.upload("ID: " + svgParams.name, svg, "image/svg+xml", (success, id) => {
      if (!success) {
        console.error("Error on File Upload");
      } else {
        gapi.print.submit(id);
      }
    });
  } else if (!croppedImage) {
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
      strict: true,
      data: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: width,
        height: height,
        rotate: 0,
        scaleX: 1,
        scaleY: 1
      }
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
  }
})

// Generate an ID in the SVG format for the given name, year, title and image (in a base 64 uri)
generateSVG = function (name, year, title, image) {
  // Cache the parameters for future reference
  svgParams.name = name;
  svgParams.year = year;
  svgParams.title = title;
  svgParams.image = image;

  // Generate the name of the file, using the name field
  var id_name = "id_" + name.toLowerCase().replace(" ", "_") + ".svg";
  // Get the text of the template, defined in template.js
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