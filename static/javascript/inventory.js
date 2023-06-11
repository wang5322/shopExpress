var available = 1;
// var sellerId = "";
// var deletId;
var sessionUsername = sessionStorage.getItem("username");
var sessionPassword = sessionStorage.getItem("password");
var sellerId = sessionStorage.getItem("id");

$(document).ready(function () {
  refreshInventoryList();
  console.log("page is fully loaded");
  console.log(sellerId);

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

  // add image
  $("#addImage").click(function () {
    // add or update
    let titleVal = $("input[name=imageTitle]").val();
    console.log($("input[name=uploadImage]").prop("files"));
    let file = $("input[name=uploadImage]").prop("files")[0];
    //let filenameVal = file.name; // not used by me, but you can use it if you like, add 'filename' column to database
    let mimeTypeVal = file.type;
    let productIdVal = $("input[name=productId]").val();
    // https://javascript.info/file  (about FileReader, see readAsDataURL )
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
        // FIXME: escape special characters using urlencode
        url: "/api/images",
        type: "POST",
        dataType: "json",
        data: docObj,
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText);
        },
      }).done(function () {
        alert("upload successful");
        // refreshList();
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
});

function refreshInventoryList() {
  $.ajax({
    url: `/api/products/?userName=${sessionUsername}`,
    type: "GET",
    async: false,
    // headers: {
    //   "x-auth-username": sessionUsername,
    //   "x-auth-password": sessionPassword,
    // },
    dataType: "json",
    success: function (response) {
      console.log("userName is : " + sessionUsername);
      var result = "";
      console.log(response);

      // loop the info of products
      for (let i = 0; i < response.length; i++) {
        var product = response[i];
        console.log(product);
        var imagepath;
        var imageId;

        $.ajax({
          // future: headers for authentication, url parameters for sorting, etc.
          url: `/api/images/?productId=${product.id}`,
          type: "GET",
          dataType: "json",
          async: false,
          error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText);
          },
        }).done(function (image) {
          if (image.length > 0) {
            imagepath = `api/images/${image[0].id}`;
            imageId = image[0].id;
            console.log(imagepath);
            console.log(image);
          } else {
            // Handle case when no images are returned
            imagepath = "api/images/38";
          }
        });

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
