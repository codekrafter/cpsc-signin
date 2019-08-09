//'use strict';

//import Cropper from './cropper/cropper.esm.js';

var cropper;

var croppedImage;
var previewed;
var svg;

var generateSVG;
var reset;

var svgParams = {};

var settingsCode = "";
var doKeypadAction;
var openSettingsCode = "";
var openSettings;

var updateTranslation;

var currentLangauge = "en";

var timeout;
var doTimeout;
let TIMEOUT_TIME = 120000;
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

  chrome.storage.local.get(['isK4'], function (result) {
    if (result.isK4) {
      $("#mode-sel-label").addClass("is-checked");
      $("#mode-sel").prop("checked", true);
    }
  });

  languative.modifyDictionary("es", {
    button_sign_in_out: "Registro de entrada y salida de estudiantes",
    button_staff_clock: "Entrada y salida del personal",
    header_sign_in: "Por favor registrese",
    label_name: "Nombre",
    button_lang: "English",
    header_reason: "Rason de su visita:",
    label_volunteer: "Voluntario",
    label_meeting: "Reunion",
    label_classroom: "Visita al aula",
    label_dest: "Destino",
    button_submit: "Enviar",
    title_sign_in_out: "Registro de enttrada y salida de estudiantes",
    title_clock_in_out: "Hora de entrada y salida",
    error_header: "Por favor proporcione",
    error_reason: "una razon para su visita",
    error_name: "un nombre",
    error_dest: "un destino",
    error_and: "y",
    button_capture: "Tome una foto",
    button_back: "hagase para atras",
    title_capture: "Sonria",
    button_crop: "Cortar",
    button_retake: "Volver a tomar",
    button_preview: "Revisar",
    button_print: "Imprimir",
    button_cancel: "Cancelar"
  });

  languative.modifyDictionary("en", {
    title_sign_in_out: "Sign In/Sign Out a Student",
    title_clock_in_out: "Clock In/Out",
    error_header: "Please provide",
    error_reason: "a reason for your visit",
    error_name: "a name",
    error_dest: "a destination",
    error_and: "and",
    button_capture: "Capture",
    button_back: "Go Back",
    title_capture: "Smile!",
    button_crop: "Crop",
    button_retake: "Retake",
    button_preview: "Preview",
    button_print: "Print",
    button_cancel: "Cancel"
  })
})

$("#signout").click(() => {
  $("#signout-modal")[0].showModal();

  CurrentState = ProgramStateEnum.SIGN_OUT;

  //$("#webview").attr('width', $("#signout-modal .modal-content").innerWidth());
  $("#signout-title").text(languative.getPhrase("title_sign_in_out"));
  $("#webview").attr('src', 'https://docs.google.com/forms/viewform?bc=transparent&embedded=true&f=%2522Open%2BSans%2522%252C%2Bsans-serif&hl=en&htc=%2523eeeeee&id=1Rhpwv-araIaZroQZoEIWZKFqTfHIbDu2Y1uixdsd6Ho&lc=%2523298cca&pli=1&tc=%2523616161&ttl=0');

  if (!timeout) {
    timeout = setTimeout(doTimeout, TIMEOUT_TIME);
  }
});

function resetDoTimeout() {
  clearTimeout(timeout);
  timeout = setTimeout(doTimeout, TIMEOUT_TIME);
}

doTimeout = function () {
  $("dialog").each(function (i, e) { e.close(); });
  reset();
}

$(document).on("keydown mousemove", resetDoTimeout);

/*$("#asp-signout").click(() => {
  $("#signout-modal")[0].showModal();

  CurrentState = ProgramStateEnum.SIGN_OUT;

  //$("#webview").attr('width', $("#signout-modal .modal-content").innerWidth());
  $("#signout-title").text("Afterschool Signout");
  $("#webview").attr('src', 'https://docs.google.com/forms/d/e/1FAIpQLSdCEurgP3AIkaaSWhHn8HbDiEzPYbUfqgBaICsI8cjktqPZ4g/viewform?usp=sf_link');
});*/

$("#open-settings").click(() => openSettings());

openSettings = function () {
  console.log($("#settings-modal")[0])
  $("#settings-modal")[0].showModal();
  $("#mode-sel").prop('disabled', true);

  return false;
};


$("#clock-in-out").click(() => {
  $("#signout-modal")[0].showModal();

  CurrentState = ProgramStateEnum.SIGN_OUT;

  //$("#webview").attr('width', $("#signout-modal .modal-content").innerWidth());
  $("#signout-title").text(languative.getPhrase("title_clock_in_out"));
  $("#webview").attr('src', 'https://docs.google.com/forms/d/e/1FAIpQLScP2Le5BcySDhdsDamHABxLgnD4TCwjx1g4vQTCvmlc530uoQ/viewform');
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
    invalids.push(languative.getPhrase("error_reason"));//"a reason for your visit");
  }

  if (!$("input[name=name]").val()) {
    $(".txt-name").addClass("is-invalid")
    invalids.push(languative.getPhrase("error_name"));//"a name");
  }

  if (!$("input[name=dest]").val()) {
    $(".txt-dest").addClass("is-invalid")

    invalids.push(languative.getPhrase("error_dest"));//"a destination");
  }

  // Display toast with concatenated message
  if (invalids.length > 0) {
    var msg = languative.getPhrase("error_header") + " ";
    let last = invalids.length - 1;
    if (invalids.length > 1) {
      invalids.forEach((field, i) => {
        if (i == last) {
          msg += languative.getPhrase("error_and") + " " + field.trim();
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

  if (!$("#main-modal").attr("open")) {
    $("#btn-pri").addClass("capture").text(languative.getPhrase("button_capture"));
    $("#btn-sec").addClass("go-back").text(languative.getPhrase("button_back"));
    $("#modal-title").text(languative.getPhrase("title_capture"));
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

$(document).on('keyup', function (e) {
  if ($("#settings-modal").prop("open")) {
    if (48 <= e.which && e.which <= 57) {
      doKeypadAction(e.key);
    } else if (e.which == 8) {
      doKeypadAction("DEL");
    }
  } else if (e.which == 13) {
    if ($(e.target).parents("#form") && $(e.target).is("input")) {
      $("#submit").click();
    } else {
      $(e.target).parents("button").click();
    }
  } else {
    if (e.which == 32) {
      openSettingsCode = "";
    } else {
      openSettingsCode += e.key;
    }

    if (openSettingsCode == "huntst") {
      openSettings();
    }
  }
});

reset = function () {
  $("input[type=text]").val("");
  $('input[type="radio"]').prop('checked', false).parent().removeClass('is-checked');

  $("#player").removeClass("hidden");
  $("#main-canvas").addClass("hidden");
  $("#flash-blocker").addClass("hidden").css({ opacity: 1 });

  $("#btn-pri")/*.addClass("capture")*/.removeClass("crop").removeClass("btn-preview").removeClass("print")//.text("Capture");
  $("#btn-sec")/*.removeClass("retake")*/.addClass("go-back")//.text("Go Back");

  settingsCode = "";
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

  $("#btn-pri").removeClass("capture").addClass("crop").text(languative.getPhrase("button_crop"));
  $("#btn-sec").removeClass("go-back").addClass("retake").text(languative.getPhrase("button_retake"));
});

$('body').on('click', '.retake', () => {
  console.log("Retaking...");
  CurrentState = ProgramStateEnum.IMG_CAPTURE;

  $("#main-canvas").cropper('destroy');

  $("#player").removeClass("hidden");
  $("#main-canvas").addClass("hidden");
  $("#flash-blocker").addClass("hidden").css({ opacity: 1 });

  $("#btn-pri").addClass("capture").removeClass("crop").text(languative.getPhrase("button_capture"));
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
      x: $("#main-canvas").width() / 2,
      y: $("#main-canvas").height() / 2,
      width: width,
      height: height,
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    }
  });

  $("#btn-pri").removeClass("crop").addClass("btn-preview").text(languative.getPhrase("button_preview"));
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

  ctx.clearRect(0, 0, $("#main-canvas").width(), $("#main-canvas").height());
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
  }

  var url = 'data:image/svg+xml;base64, ' + btoa(svg);//URL.createObjectURL(blob);
  let image = document.createElement('img');
  img.src = url;

  $("#btn-pri").removeClass("btn-preview").addClass("print").text(languative.getPhrase("button_print"));
  $("#btn-sec").removeClass("retake").addClass("go-back").text(languative.getPhrase("button_cancel"));
});

$('body').on('click', '.print', function () {
  gapi.drive.upload("ID: " + svgParams.title, svg, "image/svg+xml", (success, id) => {
    if (!success) {
      console.error("Error on File Upload");
    } else {
      var email;
      if ($("#mode-sel-label").hasClass("is-checked")) {
        email = "wendyp@cpsfc.org";
      } else {
        email = "kay@cpsfc.org";
      }
      gapi.print.submit(id, svgParams.title, email);
    }
  });

  $("#main-modal")[0].close();
  reset();

  CurrentState = ProgramStateEnum.HOME_SCREEN;
});

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

$("#save-settings").click(function () {
  chrome.storage.local.set({ isK4: $("#mode-sel-label").hasClass("is-checked") }, function () { console.log("isK4 saved") });
});

function updatePIN() {
  var correct = false;
  $("#passcode").removeClass("pass-ok");
  $("#passcode").removeClass("pass-bad");
  // Hello! You can do inspect element. Thats cool. If you actually know what you are doing, talk to tech, you might be able to find some things to do. If not then just go away
  if (settingsCode === "121") {
    $("#mode-sel")[0].disabled = false;
    $("#numpad_container .mdl-switch").removeClass("is-disabled");
    $("#passcode").addClass("pass-ok");

    correct = true;
  } else {
    if (settingsCode.length == 3) {
      $("#passcode").addClass("pass-bad");
    }

    if (settingsCode.length == 4) {
      settingsCode = settingsCode[3];
    }

    $("#mode-sel")[0].disabled = true;
    $("#numpad_container .mdl-switch").addClass("is-disabled");
  }
  var pinOut = "";
  var pinNum = (correct) ? settingsCode.length : settingsCode.length - 1
  for (var i = 0; i < pinNum; i++) {
    pinOut += "*";
  }
  if (settingsCode.length > 0 && !correct) {
    pinOut = pinOut + settingsCode[settingsCode.length - 1];
  }
  $("#numpad_container input[type=text]").val(pinOut);
}

// Settings Manager
$("#numpad_container button:not(#save-settings)").click((e) => { doKeypadAction($(e.target).parents("button").text().trim()); });

doKeypadAction = function (action) {
  action = action.trim();
  if (action === "DEL") {
    if (settingsCode.length > 1) {
      settingsCode = settingsCode.substr(0, settingsCode.length - 1)
    } else {
      settingsCode = "";
    }

    updatePIN();
  } else if (action === "CLR") {
    settingsCode = "";

    updatePIN();
  } else {
    settingsCode = settingsCode + action;
    updatePIN();
  }
};

$("#lang").click(() => {
  console.log(JSON.stringify(languative.getDictionary("html")));
  if (currentLangauge == "en") {
    console.log("changing language to spanish")
    languative.changeLanguage('es');
    currentLangauge = "es";
  } else if (currentLangauge == "es") {
    console.log("changing language to english")
    languative.changeLanguage('en');
    currentLangauge = "en";
  } else {
    console.log("unknown language '" + currentLangauge + "'");
  }
});