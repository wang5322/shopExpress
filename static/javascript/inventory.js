var available = 1;
var sellerId = 1;

$(document).ready(function () {
  window.onload = (event) => {
    console.log("page is fully loaded");
    refreshInventoryList();
  };
});

function refreshInventoryList() {
  $.ajax({
    url: "/api/products?available",
  });


  
  $("inventoryList");
}
