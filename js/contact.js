"use strict";

$("#contactForm").on("submit", function(e) {
  e.preventDefault();

  const $button = $(this).find("button");
  $button.prop("disabled", true).text("送信中…");

  const formData = $(this).serialize();

  $.ajax({
    url: "https://formspree.io/f/xeelezov",
    method: "POST",
    data: formData,
    dataType: "json",
    success: function() {
      window.location.href = "/contact/thanks.html";
    },
    error: function() {
    $button.prop("disabled", false).text("送信する");
    window.location.href = "/contact/error.html";
    }

  });
});
