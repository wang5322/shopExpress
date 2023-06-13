let available = 1;
let sessionUsername = sessionStorage.getItem("username");
let sessionPassword = sessionStorage.getItem("password");
let sellerId = sessionStorage.getItem("id");
let role = sessionStorage.getItem("role");

ifLoggedIn = sessionStorage.getItem("ifLoggedIn");

$(document).ready(function () {
  ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
  if (ifLoggedIn !== "true") {
    $("#myModalBody").html("Access Forbidden: you are not logged in!");
    $("#myModal").modal("show");
    // alert("Access Forbidden: you are not logged in!");
    setTimeout(function () {
      $(".modal-body").html("");
      window.location.href = "index.html";
    }, 3000);
  } else {
    refreshInventoryList();
    refreshOrderList();
    console.log("page is fully loaded");
    console.log(sellerId);

    // $("#alert").hide(); // error message alert

    $("#add").on("click", function () {
      var productObj = createObject();
      if (!isValidProduct(productObj)) {
        return;
      }

      $.ajax({
        url: "/api/products",
        type: "POST",
        headers: {
          "x-auth-username": sessionUsername,
          "x-auth-password": sessionPassword,
        },
        dataType: "json",
        data: productObj,
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText);
        },
      }).done(function (data) {
        console.log(productObj);
        console.log(data);
        $("#myModalBody").html("Products added successfully");
        $("#myModal").modal("show");
        // alert("Products added successfully");
        refreshInventoryList();
      });
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
      isValidProduct(product);

      $.ajax({
        url: "/api/products/" + id,
        type: "PUT",
        headers: {
          "x-auth-username": sessionUsername,
          "x-auth-password": sessionPassword,
        },
        dataType: "json",
        data: product,
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText);
        },
      }).done(function () {
        $("#myModalBody").html("Product updated succesfully");
        $("#myModal").modal("show");
        // alert("Product updated succesfully");
        refreshInventoryList();
      });
    });

    $("#archieve").on("click", function () {
      var id = $("#id").html();
      console.log(id);
      $.ajax({
        url: "/api/products/" + id,
        type: "PATCH",
        headers: {
          "x-auth-username": sessionUsername,
          "x-auth-password": sessionPassword,
          "x-auth-role": role,
        },
        data: { stockNum: 0, available: 0 },
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText);
        },
      }).done(function () {
        $("#myModalBody").html("Products archieved successfully");
        $("#myModal").modal("show");
        // alert("Products archieved successfully");
        refreshInventoryList();
      });
    });

    $("#addImage").click(function () {
      // add or update
      let titleVal = $("input[name=imageTitle]").val();
      console.log($("input[name=uploadImage]").prop("files"));
      let file = $("input[name=uploadImage]").prop("files")[0];
      let productIdVal = $("input[name=productId]").val();

      // Validation
      if (!file) {
        $("#myModalBody").html("Please select an image file.");
        $("#myModal").modal("show");
        // alert("Please select an image file.");
        return;
      }

      if (titleVal.trim() === "" || productIdVal.trim() === "") {
        $("#myModalBody").html("Please fill in all the fields.");
        $("#myModal").modal("show");
        // alert("Please fill in all the fields.");
        return;
      }

      let mimeTypeVal = file.type;
      const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validMimeTypes.includes(mimeTypeVal)) {
        $("#myModalBody").html(
          "Invalid file type. Only jpeg and png images are allowed."
        );
        $("#myModal").modal("show");
        // alert("Invalid file type. Only jpeg and png images are allowed.");
        return;
      }

      // // https://javascript.info/file  (about FileReader, see readAsDataURL )
      let reader = new FileReader();
      reader.onload = function () {
        // console.log(reader.result); // careful, may print out hundreds of lines of binary
        // magically "reader.result" hold the contents of the selected file, btoa() encodes it to base64
        docObj = {
          title: titleVal,
          mimeType: mimeTypeVal,
          data: btoa(reader.result),
          productId: productIdVal,
        };

        $.ajax({
          url: "/api/images",
          type: "POST",
          headers: {
            "x-auth-username": sessionUsername,
            "x-auth-password": sessionPassword,
            "x-auth-role": role,
          },
          dataType: "json",
          data: docObj,
          error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText);
          },
        }).done(function () {
          alert("upload successful");
        });
      };
      reader.onerror = function () {
        console.log(reader.error);
        alert(reader.error);
      };
      //reader.readAsDataURL(file); // read file and trigger one of the above handlers
      reader.readAsBinaryString(file);

      return;
    });

    // Handle click events for each type of button
    $(document).on("click", '[id^="confirm-button-"]', function () {
      const orderId = this.id.split("-")[2];
      updateOrderStatus(orderId, "SellerConfirmed");
    });

    $(document).on("click", '[id^="transport-button-"]', function () {
      const orderId = this.id.split("-")[2];
      updateOrderStatus(orderId, "Transporting");
    });

    $(document).on("click", '[id^="cancel-button-"]', function () {
      const orderId = this.id.split("-")[2];
      updateOrderStatus(orderId, "Canceled");
    });
  }
});
function refreshInventoryList() {
  $.ajax({
    url: `/api/products/?userName=${sessionUsername}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      // console.log("userName is : " + sessionUsername);
      var result = "";
      // console.log(response);

      // loop the info of products
      for (let i = 0; i < response.length; i++) {
        var product = response[i];
        // console.log(product);
        var imagepath;
        var imageId = product.image_id;
        if (imageId) {
          imagepath = `api/images/${imageId}`;
          // existProductId.push(product.id);
        } else {
          // Handle case when no images are returned
          imagepath = "api/images/38";
        }
        // console.log(existProductId);
        // insert to the DOM
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
        <img id="imageCursor" onclick="selectImage('` +
          imageId +
          `')" src="` +
          imagepath +
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
          `</p><em class="card-text">ProductId:` +
          product.id +
          ` </em>
              
          <p class="card-text"><small class="text-body-secondary">Stock: ` +
          product.stockNum +
          ` items</small></p>
        </div>
      </div>
    </div>
    </div>`;

        $("#productList").html(result);
      }
      // $("#productList").html(result);

      // $('input[type="checkbox"]').on("change", function () {
      //   $('input[name="' + this.name + '"]')
      //     .not(this)
      //     .prop("checked", false);
      // });
    },
    error: function (error) {
      console.log("Error: ", error);
    },
  });
}

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

function selectImage(id) {
  $.ajax({
    url: "/api/images/" + id,
    type: "GET",
    dataType: "json",
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText);
    },
  }).done(function (image) {
    // console.log(image);
    $("#imageId").html(image.id);
    $("input[name=imageTitle]").val(image.title);
    $("input[name=imageType]").val(image.mimeType);
    $("input[name=productId]").val(image.productId);
  });
}

function createObject() {
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

$("#signout").click(function () {
  ifLoggedIn = "false";
  sessionStorage.clear();
  window.open("index.html");
});

//Validation for product input
function isValidProduct(object) {
  var categoryArray = [
    "Fashion",
    "Home",
    "Beauty",
    "Books",
    "Electronic",
    "Baby",
  ];
  if (!categoryArray.includes(object.category)) {
    $("#myModalBody").html(
      "Category needs to be Fashion, Home, Beauty, Books, Electronic or Baby"
    );
    $("#myModal").modal("show");
    // alert(
    //   "Category needs to be Fashion, Home, Beauty, Books, Electronic or Baby"
    // );
    return false;
  }
  if (object.productCode.length < 1 || object.productCode.length > 45) {
    $("#myModalBody").html("Product Code needs to be 1-45 characters");
    $("#myModal").modal("show");
    // alert("Product Code needs to be 1-45 characters");
    return false;
  }
  if (!object.sellerId) {
    $("#myModalBody").html("No sellerId provided. Please login first");
    $("#myModal").modal("show");
    // alert("No sellerId provided. Please login first");
    return false;
  }
  if (isNaN(object.price)) {
    $("#myModalBody").html("Price needs to be a number");
    $("#myModal").modal("show");
    // alert("Price needs to be a number");
    return false;
  }
  let splitPrice = object.price.toString().split(".");
  if (splitPrice.length > 1) {
    if (splitPrice[1].length > 2) {
      $("#myModalBody").html("Price can have only two decimals");
      $("#myModal").modal("show");
      // alert("Price can have only two decimals");
      return false;
    }
  }
  if (splitPrice[0].length > 8) {
    $("#myModalBody").html("Price exceeds site limit");
    $("#myModal").modal("show");
    // alert("Price exceeds site limit");
    return false;
  }
  if (isNaN(object.stockNum)) {
    $("#myModalBody").html("Stock number needs to be a number");
    $("#myModal").modal("show");
    // alert("Stock number needs to be a number");
    return false;
  }
  return true;
}

function refreshOrderList() {
  // get orders by username
  $.ajax({
    url: `/api/orders/buyfrom`,
    // url: `/api/orders/?username=${username}`,
    type: "GET",
    headers: {
      "x-auth-username": sessionUsername,
      "x-auth-password": sessionPassword,
      "x-auth-role": role,
    },
    dataType: "JSON",
    // data: { buyerName: username, sellerName: null },
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
    },
  }).done(function (orders, status, xhr) {
    // create a string variable to store all card html of orders
    let orderCard = "";

    for (let order of orders) {
      // get orderitem info from orderitems table

      $.ajax({
        url: "/api/orderItem/order/" + order.id,
        type: "GET",
        headers: {
          "x-auth-username": sessionUsername,
          "x-auth-password": sessionPassword,
          "x-auth-role": role,
        },
        error: function (jqxhr, status, errorThrown) {
          alert(
            "AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status
          );
        },
      }).done(function (orderitems, status, xhr) {
        orderCard += `<div class="row d-flex justify-content-center align-items-center h-100">
                    <div class="col">
                      <div class="card card-stepper" style="border-radius: 10px;">
                        <div class="card-body p-4">
                          <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex flex-column">
                              <span class="text-muted small">order #${order.id}</span>
                              <span class="lead fw-normal" id="status">${order.status}</span>`;

        for (let item of orderitems) {
          orderCard += `<div style="display: flex; align-items: center;">
                                  <span class="fw-normal" id="productName">${item.productName}</span>
                                  <span class="fw-normal" id="amountLabel" style="margin-left: 10px;">Amount:</span>
                                  <span class="fw-normal" id="productAmount" style="margin-left: 10px;">${item.amount}</span>
                              </div>`;
          // }
        }
        //dynamic button
        let buttonType;
        let buttonId;
        let buttonHTML = "";
        switch (order.status) {
          case "Paid":
            buttonType = "Confirm";
            buttonId = `confirm-button-${order.id}`;
            buttonHTML = `<div>
                <button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button>
              </div>`;
            break;
          case "SellerConfirmed":
            buttonType = "Ship";
            buttonId = `transport-button-${order.id}`;
            buttonHTML = `<div>
                <button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button>
              </div>`;
            break;
          case "Received":
            // buttonType = "Received";
            // buttonId = `received-button-${order.id}`;
            break;
          case "Canceled":
            // buttonType = "N/A";
            // buttonId = `N/A-button-${order.id}`;
            break;
          default:
            buttonType = "Cancel";
            buttonId = `cancel-button-${order.id}`;
            buttonHTML = `<div>
                <button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button>
              </div>`;
            break;
        }

        orderCard += `</div>
            <div class="d-flex flex-column justify-content-between">
              <span class="fw-normal pt-5" id="Order summary">Order summary</span>
              <span class="fw-normal small pt-4" id="Order summary">Item(s) Subtotal: ${order.totalPrice}</span>
              <span class="fw-normal small" id="Order summary">Shipping Fee: ${order.shippingFee}</span>
              <span class="fw-normal small" id="Order summary">Taxes: ${order.taxes}</span>
              <span class="fw-normal small" id="Order summary">Grand Total: ${order.finalTotalPay}</span>
              <span class="fw-normal small" id="Order summary">Delivery Info: ${order.deliveryInfo}</span>
            </div>`;

        orderCard +=
          buttonHTML +
          `    
        </div>
        <div class="d-flex flex-row justify-content-between align-items-center align-content-center">
        </div>
        <div class="d-flex flex-row justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start" id="order time">
            <span>${order.orderTime}</span><span>Order placed</span>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>`;

        $("#orderList").html(orderCard);
      });
    }
  });
}

// A general function to handle status updates
function updateOrderStatus(orderId, status) {
  $.ajax({
    url: `api/orders/${orderId}`,
    type: "PATCH",
    data: {
      status: status,
    },
    headers: {
      "x-auth-username": sessionUsername,
      "x-auth-password": sessionPassword,
      "x-auth-role": role,
    },
    dataType: "json",
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText);
    },
  }).done(function () {
    $("#myModalBody").html("Status updated succesfully");
    $("#myModal").modal("show");
    // alert("Status updated succesfully");
    refreshOrderList();
  });
}

$("#formSearch").submit(function (event) {
  event.preventDefault();
  var searchFor = $("#formSearch :input").val();
  window.location.href = `productlist.html?category=${searchFor}`;
});

//   }
// });
