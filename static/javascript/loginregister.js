let ifLoggedIn;

$(document).ready(function () {
  ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
  if (ifLoggedIn === "true") {
    $(".modal-body").html("Access Forbidden: you are already logged in!");
    $("#AlertModal").modal("show");
    setTimeout(function () {
      $(".modal-body").html("");
      window.location.href = "index.html";
    }, 3000);
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get("register");

    if (myParam === "1") {
      $("#registerPanel").show();
      $("#loginPanel").hide();
    } else {
      //hide register form
      $("#registerPanel").hide();
    }
  }
});

$("#hrefRegisterHere").click(function () {
  $("#registerPanel").show();
  $("#loginPanel").hide();
});

$("#btnLogin").on("click", function () {
  // get username and password from input text fields, use jQuery
  let username = $("input[name=username]").val();
  let password = $("input[name=password]").val();
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("password", password);

  // open AJAX httpRequst, send username and password with AJAX req.header to authenticator
  $.ajax({
    url: "/api/users/login",
    type: "POST",
    headers: {
      "x-auth-username": sessionStorage.getItem("username"),
      "x-auth-password": sessionStorage.getItem("password"),
    },
    dataType: "json",
    error: function (jqxhr, status, errorThrown) {
      $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
      $("#AlertModal").modal("show");
      loginFailedHandler();
    },
  }).done(function (data) {
    sessionStorage.setItem("id", data.id);
    sessionStorage.setItem("role", data.role);
    sessionStorage.setItem("ifLoggedIn", "true");
    switch (data.role) {
      case "seller":
        window.open("inventory.html", "_self");
        break;

      case "buyer":
        window.open("orderhistory.html", "_self");
        break;

      case "admin":
        window.open("admin.html", "_self");
        break;

      default:
        window.open("loginregister.html", "_self");
        break;
    }
  });
});

$("#btnRegister").on("click", function () {
  // get username and password from input text fields, use jQuery
  let username = $("input[name=newUsername]").val();
  let password = $("input[name=newPassword]").val();
  let address = $("input[name=newAddress]").val();
  let email = $("input[name=newEmail]").val();
  let role = $("select[name=newRole]").val();

  sessionStorage.setItem("username", username);
  sessionStorage.setItem("password", password);
  sessionStorage.setItem("role", role);

  let newUserObj = {
    username: username,
    password: password,
    role: role,
    address: address,
    email: email,
  };

  $.ajax({
    url: "/api/users/",
    type: "POST",
    dataType: "json",
    data: newUserObj,
    error: function (jqxhr, status, errorThrown) {
      $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
      $("#AlertModal").modal("show");
    },
  }).done(function (data) {
    sessionStorage.setItem("ifLoggedIn", "true");
    switch (role) {
      case "seller":
        window.open("inventory.html", "_self");
        break;

      case "buyer":
        window.open("orderhistory.html", "_self");
        break;

      case "admin":
        window.open("admin.html", "_self");
        break;

      default:
        window.open("loginregister.html", "_self");
        break;
    }
  });
});

function loginFailedHandler() {
  $(".modal-body").html("Authentication failed");
  $("#AlertModal").modal("show");
  $("input[name=username]").val("");
  $("input[name=password]").val("");
  sessionStorage.clear();
}
