const player = $("#player")[0];
const canvas = $("#canvas")[0];
const context = canvas.getContext('2d');

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
    console.log(stream.getVideoTracks()[0].getConstraints());
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
  $(this).parents().each(() => {console.log(this.tagName)})     //.addClass("hidden");
});

$(".modal").click(function(){
  $(this).addClass("hidden");
}).children().click(function(e) {
  return false;
});

$("#submit").click(() => {
  $("#video-modal").removeClass("hidden");
});

$("#capture").click(() => {
  context.drawImage(player, 0, 0, canvas.width, canvas.height);

  $("#video-modal").addClass("hidden");
  $("#preview-modal").removeClass("hidden");
});