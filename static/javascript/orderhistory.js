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

  //add button functions here






  //button functions end







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

    //dom version
    let orderCards = $("#newordercards");
    for (let order of orders) {
      orderCards.append(`<div id="card-div1-${order.id}" class="row d-flex justify-content-center align-items-center h-100"></div>`);
      $(`#card-div1-${order.id}`).append(`<div id="card-div2-${order.id}" class="col"></div>`)
      $(`#card-div2-${order.id}`).append(`<div id="card-div3-${order.id}" class="card card-stepper" style="border-radius: 10px;"></div>`)
      $(`#card-div3-${order.id}`).append(`<div id="card-div4-${order.id}" class="card-body p-4"></div>`)
      $(`#card-div4-${order.id}`).append(`<div id="card-div5-${order.id}" class="d-flex justify-content-between align-items-center"></div>`)
      $(`#card-div5-${order.id}`).append(`<div id="card-div6-${order.id}" class="d-flex flex-column"></div>`)

      $(`#card-div6-${order.id}`).append(`<span class="text-muted small">order #${order.id}</span>`)
      $(`#card-div6-${order.id}`).append(`<span class="lead fw-normal" id="status">${order.status}</span>`)
      $(`#card-div6-${order.id}`).append(`<span class="lead fw-normal" id="sellerName">Seller: ${order.sellerName}</span>`)

      //get orderItems
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
        for (let item of orderitems) {
          if (order.status === "unSubmitted") {
            $(`#card-div6-${order.id}`).append(`<div id="itemDiv-${item.id}" style="display: flex; align-items: center;">
            <span class="fw-normal" id="item-id-${item.id}"># ${item.id}</span>
            <span class="fw-normal" id="item-productCode-${item.id}">Code: ${item.productCode}</span>
            <span class="fw-normal" id="item-productName-${item.id}">Product: ${item.productName}</span>
            <span class="fw-normal" id="item-price-${item.id}">Price: ${item.price}</span>
            <span class="fw-normal" id="item-amountLabel-${item.id}" style="margin-left: 10px;">Amount:</span>
            <input type="number" style="width:60px" id="item-amount-${item.id}" value=${item.amount}>
            <button id="item-modify-amount-${item.id}" class="btn btn-outline-primary" type="button">Modify</button>
            <button id="item-delete-${item.id}" onclick="itemDelete(${item.id})" class="btn btn-outline-primary" type="button">delete</button>
            </div>
            `)

            //match the oringinal paroduct

            //check matched , add refresh button if not matched
            $.ajax({
              url: "/api/orderItem/match/" + item.id,
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
            }).done(function (orderItmeMatched, status, xhr) {
              console.log($(`#itemDiv-${item.id}`))
              if (!(orderItmeMatched.matched)) {
                $(`#itemDiv-${item.id}`).css({ "color": "red" });
                $(`#itemDiv-${item.id}`).append(`<button id="item-refresh-${item.id}" class="btn btn-outline-primary" type="button" style="margin-left: 10px;">refresh</button>`)
              } else {
                $(`#itemDiv-${item.id}`).css({ "color": "green" });
              }
            }
            ) //match end

          } else {
            $(`#card-div6-${order.id}`).append(`<div id="itemDiv-${item.id}" style="display: flex; align-items: center;">
            <span class="fw-normal" id="item-productName-${item.id}">${item.productName}</span>
            <span class="fw-normal" id="item-amountLabel-${item.id}" style="margin-left: 10px;">Amount:</span>
            <span class="fw-normal" id="item-amount-${item.id}" style="margin-left: 10px;">${item.amount}</span>
        </div>`)
            
            
            


          }
        }
      })//orderItems end
        



      $(`#card-div5-${order.id}`).append(`<div class="d-flex flex-column justify-content-between">
      <span class="fw-normal pt-5" id="Order summary">Order summary</span>
      <span class="fw-normal small pt-4" id="Order summary">Item(s) Subtotal: ${order.totalPrice}</span>
      <span class="fw-normal small" id="Order summary">Shipping Fee: ${order.shippingFee}</span>
      <span class="fw-normal small" id="Order summary">Taxes: ${order.taxes}</span>
      <span class="fw-normal small" id="Order summary">Grand Total: ${order.finalTotalPay}</span>
      <span class="fw-normal small" id="Order summary">Deliver to: ${order.deliveryInfo}</span>
      <span class="fw-normal small" id="Order summary">Payment Info: ${order.paymentInfo}</span>
      </div>`);

      //delete order button if allowed
      if (
        order.status === "unSubmitted" ||
        order.status === "BuyerConfirmed" /*||
        order.status === "Received"*/
      ) {
        $(`#card-div5-${order.id}`).append(`<div><button id="delete-button-${order.id}" class="btn btn-outline-primary" type="button">Delete</button></div>`);
      }
      $(`#delete-button-${order.id}`).click(() => { deleteOrder(order.id) })
      //delete order button end
      
      


      //changable button
      switch (order.status) {
        case "unSubmitted":
          buttonType = "Confirm";
          buttonId = `confirm-button-${order.id}`;
          break;
        case "BuyerConfirmed":
          buttonType = "Pay";
          buttonId = `pay-button-${order.id}`;
          break;
        case "Received":
          buttonType = "unshown";
          buttonId = `unshown-button-${order.id}`;
          break;
          
        default:
          buttonType = "Received";
          buttonId = `received-button-${order.id}`;
          break;
      }
      //add button
      $(`#card-div5-${order.id}`).append(`<div><button id="${buttonId}" class="btn btn-outline-primary" type="button">${buttonType}</button></div>`)
      //add functions
      if (buttonType == "unshown") { $(`#${buttonId}`).hide() }
      switch (buttonType) {
        case "Confirm": {
          $(`#${buttonId}`).click(() => { confirmOrder(order.id) })
          break;
        }
        case "Pay": {
          $(`#${buttonId}`).click(() => { payOrder(order.id) })
          break;
        }
        case "Received": {
          $(`#${buttonId}`).click(() => { receiveOrder(order.id) })
          break;
        }
      }
      //changable button end


      $(`#card-div4-${order.id}`).append(`<div class="d-flex flex-row justify-content-between align-items-center">
      <div class="d-flex flex-column align-items-start" id="order time">
      ${order.orderTime ? `<span>${order.orderTime}</span><span>Order placed</span>` : ""}
      </div>
      </div>`)
      

      
      

    
      }//dom version end
      
    
    
    
    
    

    // string version create a string variable to store all card html of orders
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
                          <span class="lead fw-normal" id="status">${order.status}</span>
                          <span class="lead fw-normal" id="sellerName">Seller: ${order.sellerName}</span>
                          `;

        for (let item of orderitems) {
          if (order.status === "unSubmitted") {
            orderCard += `<div id="itemDiv-${item.id}" style="display: flex; align-items: center;">
                              <span class="fw-normal" id="item-id-${item.id}"># ${item.id}</span>
                              <span class="fw-normal" id="productCode-${item.id}">Code: ${item.productCode}</span>
                              <span class="fw-normal" id="productName-${item.id}">Product: ${item.productName}</span>
                              <span class="fw-normal" id="price-${item.id}">Price: ${item.price}</span>
                              <span class="fw-normal" id="amountLabel-${item.id}" style="margin-left: 10px;">Amount:</span>
                              <select id="productAmount" name="productAmount" style="margin-left: 10px;">`;
                              //get matched status                 
            //check matched , add refresh button if not matched
            $.ajax({
              url: "/api/orderItem/match/" + item.id,
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
            }).done(function (orderItmeMatched, status, xhr) {
              console.log($(`#itemDiv-${item.id}`))
              if (!(orderItmeMatched.matched)) {
                $(`#itemDiv-${item.id}`).css({ "color": "red" });
                $(`#itemDiv-${item.id}`).append(`<button id="refresh-${item.id}" class="btn btn-outline-primary" type="button" style="margin-left: 10px;">refresh</button>`)
              } else {
                $(`#itemDiv-${item.id}`).css({"color":"green"});
              }
            }
            )
            

            // Populate select options from 1 to 30
            // todo : number could be others
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
          /*case "Received":
            buttonType = "unshown";
            buttonId = `unshown-button-${order.id}`;
            style.visibility = "hidden"
            break;
            */
          default:
            buttonType = "Receive";
            buttonId = `receive-button-${order.id}`;
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
          order.status === "BuyerConfirmed" /*||
          order.status === "Received"*/
        ) {
          orderCard += `<div>
          <button id="delete-button-${order.id}" class="btn btn-outline-primary" type="button">Delete</button>
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
      })
    }
   
    //string version code end
    $("#ordercards").hide();

  });
}

$("#signout").click(function () {
  ifLoggedIn = "false";
  sessionStorage.clear();
  window.open("index.html");
})

function deleteOrder(orderId) {
  $.ajax({
    url: `/api/orders/${orderId}`,
    // url: `/api/orders/?username=${username}`,
    type: "DELETE",
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
  }).done((data, status, xhr) => {
      refreshProductList();
   })
}

function confirmOrder(orderId) {
  $.ajax({
    url: `/api/orders/${orderId}`,
    // url: `/api/orders/?username=${username}`,
    type: "PUT",
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
  }).done((data, status, xhr) => {
      refreshProductList();
   })
}

function payOrder(orderId) {
  
}

function receiveOrder(orderId) {
  $.ajax({
    url: `/api/orders/${orderId}`,
    // url: `/api/orders/?username=${username}`,
    type: "PATCH",
    headers: {
      "x-auth-username": username,
      "x-auth-password": password,
      "x-auth-role": role,
    },
    dataType: "JSON",
    data: { status:"Received" },
    error: function (jqxhr, status, errorThrown) {
      alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
    },
  }).done((data, status, xhr) => {
      refreshProductList();
   })
}

//item functions
function itemDelete(itemId) {
  alert(itemId)
}