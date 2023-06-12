var myParam = "";
// var myParam2 = "";

$(document).ready(function () {
  var urlParams = new URLSearchParams(window.location.search);
  myParam = urlParams.get("category");
  // myParam2 = urlParams.get("searchFor");
  console.log(myParam);
  refreshProductList();

  $;
});

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
              </select><button id="addToCart-${product.id}" class="btn btn-dark mt-1">
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
      }
    },
  });
}
