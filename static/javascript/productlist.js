$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const myParam = urlParams.get("category");

  $.ajax({
    url: "/api/products/?category=" + myParam,
    type: "GET",
    dataType: "json",
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText);
    },
    succuess: function (data) {
      alert("Products added successfully");
      console.log(data);
    },
  });
});

// <div class="col mb-5">
//   <div class="card h-100">
//     <img
//       class="card-img-top"
//       src="https://m.media-amazon.com/images/I/710IGhea-IL._AC_SL1500_.jpg"
//       alt="..."
//       style="height:200px;object-fit: cover; object-position: center;"
//     />

//     <div class="card-body p-4">
//       <div class="text-center">
//         <h5 class="fw-bolder">Fancy Product</h5>

//         <div id="price">$40.00 - $80.00</div>
//       </div>
//     </div>

//     <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
//       <div class="text-center">
//         <a class="btn btn-outline-dark mt-auto" href="#">
//           View details
//         </a>
//         <button id="addToCart" class="btn btn-dark mt-1">
//           Add to cart
//         </button>
//       </div>
//     </div>
//   </div>
// </div>;
