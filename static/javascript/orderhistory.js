let ifLoggedIn;
let username, password, role;
$(document).ready(function () {
  ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
  username = sessionStorage.getItem("username");
  password = sessionStorage.getItem("password");
  role = sessionStorage.getItem("role");

  if (ifLoggedIn !== "true") {
    alert("Access Forbidden: you are not logged in!");
    window.location.href = "index.html";
  } else {
    refreshProductList();
  }

  // confirm button
  $(document).on("click", '[id^="confirm-button-"]', function () {
    const orderId = this.id.split("-")[2];

    //status switch to BuyerConfirmed
    $.ajax({
      url: `api/orders/${orderId}`,
      type: "PATCH",
      data: {
        status: "BuyerConfirmed", // TODO: finish the ajax , now the patch controller not finished
      },
    });
  });

  // pay button

  //received-button
});

function refreshProductList() {
  // get orders by username
  $.ajax({
    url: `/api/orders/buyfrom`,
    // url: `/api/orders/?username=${username}`,
    type: "GET",
    headers: {
      "x-auth-username": username,
      "x-auth-password": password,
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
          "x-auth-username": username,
          "x-auth-password": password,
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
          if (order.status === "unSubmitted") {
            orderCard += `<div style="display: flex; align-items: center;">
                              <span class="fw-normal" id="productName">${item.productName}</span>
                              <span class="fw-normal" id="amountLabel" style="margin-left: 10px;">Amount:</span>
                              <select id="productAmount" name="productAmount" style="margin-left: 10px;">`;

            // Populate select options from 1 to 30
            for (let i = 1; i <= 30; i++) {
              if (i === item.amount) {
                // If current count equals to the amount, make it selected
                orderCard += `<option value="${i}" selected>${i}</option>`;
              } else {
                orderCard += `<option value="${i}">${i}</option>`;
              }
            }
            orderCard += `</select>
                          <button id="modify-amount-${item.id}" class="btn btn-outline-primary" type="button" style="margin-left: 10px;">Modify Amount</button>
                        </div>`;
          } else {
            orderCard += `<div style="display: flex; align-items: center;">
                              <span class="fw-normal" id="productName">${item.productName}</span>
                              <span class="fw-normal" id="amountLabel" style="margin-left: 10px;">Amount:</span>
                              <span class="fw-normal" id="productAmount" style="margin-left: 10px;">${item.amount}</span>
                          </div>`;
          }
        }
        //dynamic button
        let buttonType;
        let buttonId;
        switch (order.status) {
          case "unSubmitted":
            buttonType = "Confirm";
            buttonId = `confirm-button-${order.id}`;
            break;
          case "BuyerConfirmed":
            buttonType = "Pay";
            buttonId = `pay-button-${order.id}`;
            break;
          default:
            buttonType = "Received";
            buttonId = `received-button-${order.id}`;
            break;
        }

        // orderCard += `<div>
        //                 <button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button>
        //               </div>`;

        orderCard += `</div>
        <div class="d-flex flex-column justify-content-between">
          <span class="fw-normal pt-5" id="Order summary">Order summary</span>
          <span class="fw-normal small pt-4" id="Order summary">Item(s) Subtotal: ${order.totalPrice}</span>
          <span class="fw-normal small" id="Order summary">Shipping Fee: ${order.shippingFee}</span>
          <span class="fw-normal small" id="Order summary">Taxes: ${order.taxes}</span>
          <span class="fw-normal small" id="Order summary">Grand Total: ${order.finalTotalPay}</span>
        </div>`;

        // add cancel order button according to order.status
        if (
          order.status === "unSubmitted" ||
          order.status === "BuyerConfirmed"
        ) {
          orderCard += `<div>
          <button id="cancel-button-${order.id}" class="btn btn-outline-primary" type="button">Cancel order</button>
        </div>`;
        }

        orderCard += `<div>
      <button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button>
    </div>
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

        $("#ordercards").html(orderCard);
      });
    }
  });
}

$("#signout").click(function () {
  ifLoggedIn = "false";
  sessionStorage.clear();
  window.open("index.html");
});
