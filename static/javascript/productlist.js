var myParam = "";
// var searchFor = "";

let sessionUsername = sessionStorage.getItem("username");
let sessionPassword = sessionStorage.getItem("password");
let sellerId = sessionStorage.getItem("id");
let role = sessionStorage.getItem("role");
let ifLoggedIn = sessionStorage.getItem("ifLoggedIn");

$(document).ready(function () {
  ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
  if (ifLoggedIn === "true") {
    $("#anchorLogin a").text("Sign Out");
    $("#anchorRegister").hide();
  } else {
    // ifLoggedIn = false;
    $("anchorLogin a").text("Hello, Sign In");
    $("#anchorRegister").show();
  }

  $("#anchorLogin a").click(function () {
    if (ifLoggedIn === "true") {
      ifLoggedIn = "false";
      sessionStorage.clear();
      window.open("index.html");
    } else {
      window.location.replace("loginregister.html?register=0");
    }
  });

  var urlParams = new URLSearchParams(window.location.search);
  myParam = urlParams.get("category");
  // searchFor = urlParams.get("searchFor");

  // myParam2 = urlParams.get("searchFor");
  console.log(myParam);
  // console.log(searchFor);
  refreshProductList();
  // if (myParam && searchFor) {
  //   var getUrl = `/api/products/?category=${myParam}&searchFor=${searchFor}`;
  // } else if (searchFor) {
  //   getUrl = `/api/products/?searchFor=${searchFor}`;
  // } else if (myParam) {
  //   getUrl = `/api/products/?category=${myParam}`;
  // }

  function refreshProductList() {
    $.ajax({
      url: `/api/products/?category=${myParam}`,
      type: "GET",
      dataType: "json",
      error: function (jqxhr, status, errorThrown) {
        alert("AJAX error: " + jqxhr.responseText);
      },
      success: function (response) {
        console.log("category is : " + myParam);
        console.log(response);
        // loop the info of products
        for (let i = 0; i < response.length; i++) {
          var product = response[i];
          console.log(product);
          var imagepath;
          var imageId = product.image_id;
          if (imageId) {
            imagepath = `api/images/${imageId}`;
          } else {
            // Handle case when no images are returned
            imagepath = "api/images/38";
          }

          // insert to the DOM
          var result = `<div class="col mb-5">
          <div class="card h-100">
            <img class="card-img-top" src="${imagepath}" alt="product image" style="height:200px;object-fit: cover; object-position: center;" />
            <div class="card-body p-4">
              <div class="text-center">
                <h5 class="fw-bolder">${product.productName}</h5>
                <div id="price">$${product.price}</div>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" href="productdetail.html?productId=${product.id}">
                  View details
                </a><select id="quantitySelect-${product.id}" class="form-control text-center me-3" style="width: 60px; display: inline;">
                </select><button id="addToCart-${product.id}" data-product-id="${product.id}" class="btn btn-dark mt-1">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>`;

          $("#productListPane").append(result);

          for (let i = 1; i <= 30; i++) {
            $(`#quantitySelect-${product.id}`).append(new Option(i, i));
          }

          $("#formSearch").submit(function (event) {
            event.preventDefault();
            var searchFor = $('#formSearch :input').val();
            window.location.href = `productlist.html?category=${searchFor}`;
          });

          // add events to addToCart button
          $(`#addToCart-${product.id}`).click(function () {
            var selectedQuantity = $(`#quantitySelect-${product.id}`).val();

            console.log(
              "Product ID",
              product.id,
              "Selected Quantity: ",
              selectedQuantity
            );
            var productId = $(this).data("product-id");
            $.ajax({
              url: `/api/carts`,
              type: "POST",
              headers: {
                "x-auth-username": sessionUsername,
                "x-auth-password": sessionPassword,
                "x-auth-role": role,
              },
              data: {
                amount: selectedQuantity,
                id: productId,
              },
              success: function (response) {
                $("#myModalBody").html("Product added to cart successfully!");
                $("#myModal").modal("show");
                console.log("Product added to cart successfully!");
              },
              error: function (error) {
                $("#myModalBody").html(
                  "Error adding product to cart. Please login first!"
                );
                $("#myModal").modal("show");
                setTimeout(function () {
                  $("#myModalBody").html("");
                  window.location.href = "loginregister.html?register=0";
                }, 3000);
                console.log("Error adding product to cart:", error);
              },
            });
          }); // add to carts event ends here
        }
      },
    });
  } // refreshProductList ends here

  $("#formSearch").submit(function (event) {
    event.preventDefault();
    var searchFor = $('#formSearch :input').val();
    window.location.href = `productlist.html?category=${searchFor}`;
  });
});
