var available = 1;
var sessionUsername = sessionStorage.getItem("username");
var sessionPassword = sessionStorage.getItem("password");
var sellerId = sessionStorage.getItem("id");
let ifLoggedIn;

$(document).ready(function () {
  ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
  if (ifLoggedIn !== "true") {
    alert("Access Forbidden: you are not logged in!");
    window.location.href = "index.html";
  } else {
    refreshInventoryList();
    console.log("page is fully loaded");
    console.log(sellerId);

    // $("#alert").hide(); // error message alert

    $("#add").on("click", function () {
      var productObj = creatObject();

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

    // $("#deselectAll").on("click", function () {
    //   $(".form-check-input").prop("checked", false);
    // });

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
        headers: {
          "x-auth-username": sessionUsername,
          "x-auth-password": sessionPassword,
        },
        data: { stockNum: 0, available: 0 },
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText);
        },
      }).done(function () {
        alert("Products archieved successfully");
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
        alert("Please select an image file.");
        return;
      }

      if (titleVal.trim() === "" || productIdVal.trim() === "") {
        alert("Please fill in all the fields.");
        return;
      }

      console.log(existProductId);
      if (existProductId.includes(productIdVal)) {
        alert("This productId already has the image.");
        return;
      }
      let mimeTypeVal = file.type;
      const validMimeTypes = ["image/jpeg", "image/png"];
      if (!validMimeTypes.includes(mimeTypeVal)) {
        alert("Invalid file type. Only jpeg and png images are allowed.");
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
  }
});

function refreshInventoryList() {
  $.ajax({
    url: `/api/products/?userName=${sessionUsername}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      console.log("userName is : " + sessionUsername);
      var result = "";
      console.log(response);

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
    alert(
      "Category needs to be Fashion, Home, Beauty, Books, Electronic or Baby"
    );
    return false;
  }
  if (object.productCode.length < 1 || object.productCode.length > 45) {
    alert("Product Code needs to be 1-45 characters");
    return false;
  }
  if (!object.sellerId) {
    alert("No sellerId provided. Please login first");
    return false;
  }
  if (isNaN(object.price)) {
    alert("Price needs to be a number");
    return false;
  }
  let splitPrice = object.price.toString().split(".");
  if (splitPrice.length > 1) {
    if (splitPrice[1].length > 2) {
      alert("Price can have only two decimals");
      return false;
    }
  }
  if (splitPrice[0].length > 8) {
    alert("Price exceeds site limit");
    return false;
  }
  if (isNaN(object.stockNum)) {
    alert("Stock number needs to be a number");
    return false;
  }
  return true;
}
