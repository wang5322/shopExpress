var available = 1;
// var sellerId = "";
// var deletId;
var sessionUsername = sessionStorage.getItem("username");
var sessionPassword = sessionStorage.getItem("password");
var sellerId = sessionStorage.getItem("id");
$(document).ready(function () {
  // $.ajax({
  //   url: "/api/users/" + sessionUsername,
  //   type: "GET",
  //   headers: {
  //     "x-auth-username": sessionUsername,
  //     "x-auth-password": sessionPassword,
  //   },
  //   dataType: "json",
  //   error: function (jqxhr, status, errorThrown) {
  //     alert("AJAX error: " + jqxhr.responseText);
  //   },
  // }).done(function (user) {
  //   sessionStorage.setItem("id", user.id);
  //   var sellerId = sessionStorage.getItem("id");
  //   console.log(user);
  //   // sellerId = user.id;
  //   console.log(sellerId);
  //   refreshInventoryList();
  // });

  console.log(sellerId);
  refreshInventoryList();
  console.log("page is fully loaded");

  // $("#alert").hide(); // error message alert

  $("#add").on("click", function () {
    var productObj = creatObject();
    $.ajax({
      url: "/api/products",
      type: "POST",
      dataType: "json",
      data: productObj,
      error: function (jqxhr, status, errorThrown) {
        alert("AJAX error: " + jqxhr.responseText);
      },
    }).done(function () {
      console.log(productObj);
      alert("Products added successfully");
      refreshInventoryList();
    });
    // $(".close").alert("close");
  });

  // $('input[type="checkbox"]').on("change", function () {
  //   $('input[name="' + this.name + '"]')
  //     .not(this)
  //     .prop("checked", false);
  // });

  $("#deselectAll").on("click", function () {
    $(".form-check-input").prop("checked", false);
  });

  $("#clear").on("click", function () {
    $("#id").html("");
    $("input[name=productCode]").val("");
    $("input[name=productName]").val("");
    $("textarea[name=productDesc]").val("");
    $("input[name=category]").val("");
    $("input[name=stockNum]").val("");
    $("input[name=price]").val("");
    $("input[name=imageUrl]").val("");
  });

  $("#update").on("click", function () {
    var id = $("#id").html();
    console.log(id);
    var product = creatObject();
    $.ajax({
      url: "/api/products/" + id,
      type: "PUT",
      dataType: "json",
      data: product,
      error: function (jqxhr, status, errorThrown) {
        alert("AJAX error: " + jqxhr.responseText);
      },
    }).done(function () {
      alert("Product updated succesfully");
      refreshInventoryList();
    });
  });

  $("#archieve").on("click", function () {
    var id = $("#id").html();
    console.log(id);
    $.ajax({
      url: "/api/products/" + id,
      type: "PATCH",
      data: { stockNum: 0, available: 0 },
      error: function (jqxhr, status, errorThrown) {
        alert("AJAX error: " + jqxhr.responseText);
      },
    }).done(function () {
      alert("Products archieved successfully");
      refreshInventoryList();
    });
  });

  // $("#delete").on("click", function () {
  //   var id = $("#id").html();
  //   $.ajax({
  //     url: "api/products/" + id,
  //     type: "DELETE",
  //     error: function (jqxhr, status, errorThrown) {
  //       alert("AJAX error: " + jqxhr.responseText);
  //     },
  //   }).done(function () {
  //     alert("Product archieved succesfully");
  //     refreshInventoryList();
  //   });
  // });
});

function refreshInventoryList() {
  $.ajax({
    url: `/api/products/?sellerId=${sellerId}`,
    type: "GET",
    // headers: {
    //   "x-auth-username": sessionUsername,
    //   "x-auth-password": sessionPassword,
    // },
    dataType: "json",
    success: function (response) {
      console.log("sellerId is : " + sellerId);
      var result = "";
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        var product = response[i];
        result +=
          `<div class="card mb-3" style="max-width: 800px; max-height:300px;">
          <div class="form-check">
  <input class="form-check-input " type="checkbox" value="" name="group1[]"/>
  <label class="form-check-label" >
    Select this product
  </label>
</div>
<div class="row g-0">
  <div class="col-md-4 ">
    <img src="` +
          product.imageUrl +
          `" class="img-fluid rounded-start cropped" alt="` +
          product.productName +
          `" style="height: 100%; object-fit: cover;" >
  </div>
  <div class="col-md-8">
    <div class="card-body">
      <h5 class="card-title" onclick="selectItem('` +
          product.id +
          `')">` +
          product.productName +
          `</h5><h4>Price:` +
          product.price +
          `</h4>
      <p class="card-text">` +
          product.productDesc +
          `</p>
          
      <p class="card-text"><small class="text-body-secondary">Stock: ` +
          product.stockNum +
          ` items</small></p>
    </div>
  </div>
</div>
</div>`;
      }
      $("#productList").html(result);

      $('input[type="checkbox"]').on("change", function () {
        $('input[name="' + this.name + '"]')
          .not(this)
          .prop("checked", false);
      });
    },
    error: function (error) {
      console.log("Error: ", error);
    },
  });
}

// `<div class="card mb-3" style="max-width: 540px;">
//   <div class="row g-0">
//     <div class="col-md-4">
//       <img src=` +
//   product.imageUrl +
//   ` class="img-fluid rounded-start" alt="...">
//     </div>
//     <div class="col-md-8">
//       <div class="card-body">
//         <h5 class="card-title">` +
//   product.productName +
//   `</h5>
//         <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
//         <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
//       </div>
//     </div>
//   </div>
// </div>`;

function selectItem(Id) {
  $.ajax({
    url: "/api/products/" + Id,
    type: "GET",
    dataType: "json",
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText);
    },
  }).done(function (product) {
    console.log(Id);
    console.log(product);
    $("#id").html(product.id);
    $("input[name=productCode]").val(product.productCode);
    $("input[name=productName]").val(product.productName);
    $("textarea[name=productDesc]").val(product.productDesc);
    $("input[name=category]").val(product.category);
    $("input[name=stockNum]").val(product.stockNum);
    $("input[name=price]").val(product.price);
    $("input[name=imageUrl]").val(product.imageUrl);
  });
}

function creatObject() {
  var categoryVal = $("input[name=category]").val();
  var sellerIdVal = sellerId;
  var productCodeVal = $("input[name=productCode]").val();
  var productNameVal = $("input[name=productName]").val();
  var productDescVal = $("textarea[name=productDesc]").val();
  var priceVal = $("input[name=price]").val();
  var stockNumVal = $("input[name=stockNum]").val();
  var imageUrlVal = $("input[name=imageUrl]").val();

  if (stockNumVal) {
    var availableVal = 1;
  } else availableVal = 0;

  var productObj = {
    category: categoryVal,
    sellerId: sellerIdVal,
    productCode: productCodeVal,
    productName: productNameVal,
    productDesc: productDescVal,
    price: priceVal,
    stockNum: stockNumVal,
    imageUrl: imageUrlVal,
    available: availableVal,
  };
  return productObj;
}
