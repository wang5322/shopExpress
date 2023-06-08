var available = 1;
var sellerId = 20;

$(document).ready(function () {
  console.log("page is fully loaded");
  refreshInventoryList();
  $(".alert").hide(); // error message alert

  $("#add").on("click", function () {
    $(".alert").show();
    // $(".close").alert("close");
  });
});

function refreshInventoryList() {
  $.ajax({
    url: `/api/products/?sellerId=${sellerId}`,
    type: "GET",
    dataType: "json",
    success: function (response) {
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        var product = response[i];
        $("#productList").html(
          `<p> ${product.productName}</p><div class=\'card productImageCard\'><img src=\'${product.imageUrl}\'><div>`
        );
      }
    },
    error: function (error) {
      console.log("Error: ", error);
    },
  });
}
