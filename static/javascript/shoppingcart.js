let ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
    // initiate page-scope variables
    // these varaibles resets when page reloads
    let cartItems = [];
    let carts = [];

    $(document).ready(function () {
      // retrieve session data
      ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
      username = sessionStorage.getItem("username");
      password = sessionStorage.getItem('password');
      role = sessionStorage.getItem('role');

      // reset page-scoped variables
      cartItems = [];
      carts = [];

      if (ifLoggedIn !== "true") {
        $(".modal-body").html("Access Forbidden: you are not logged in!");
        $("#AlertModal").modal("show");
        setTimeout(function () {
            $(".modal-body").html("");
            window.location.href = "loginregister.html?register=0";
        }, 3000);
      } else {
        refreshCart()
      }
    });

    function refreshCart() {
      // get cart id by buyerId (user id)
      $.ajax({
        url: "/api/carts/",
        type: "GET",
        headers: {
          'x-auth-username': username,
          'x-auth-password': password,
          'x-auth-role': role
        },
        error: function (jqxhr, status, errorThrown) {
          alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
        }
      }).done(function (data, status, xhr) {
        carts = data;
        // get item details of each cart
        for (cart of carts) {
          $.ajax({
            url: "/api/cartItem/" + cart.id,
            type: "GET",
            headers: {
              'x-auth-username': username,
              'x-auth-password': password,
              'x-auth-role': role
            },
            error: function (jqxhr, status, errorThrown) {
              alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            }
          }).done(function (data, status, xhr) {
            let cartCard = "";
            cartItems = cartItems.concat(data);

            for (cartItem of data) {
              $.ajax({
                url: "/api/products/" + cartItem.productId,
                type: "GET",
                headers: {
                  'x-auth-username': username,
                  'x-auth-password': password,
                  'x-auth-role': role
                },
                error: function (jqxhr, status, errorThrown) {
                  alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
                }
              }).done(function (product, status, xhr) {
                // get image info
                $.ajax({
                  url: "/api/images/?productId=" + product.id,
                  type: "GET",
                  headers: {
                    'x-auth-username': username,
                    'x-auth-password': password,
                    'x-auth-role': role
                  },
                  error: function (jqxhr, status, errorThrown) {
                    alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
                  }
                }).done(function (allImages, status, xhr) {
                  let image = allImages[0];
                  cartCard += `<div class="card mb-3" style="max-width: 800px; max-height:300px;">
                                <div class="form-check">
                                  <input id="${cartItem.id}" class="form-check-input " type="checkbox" value=""/>
                                </div>
                                <div class="row g-0">
                                  <div class="col-md-4 ">
                                    <img id="${(image) ? image.id : 38}"
                                    class="img-fluid rounded-start cropped"
                                    src="api/images/${(image) ? image.id : 38}" 
                                    alt="${product.productName}"
                                    style="height: 100%; object-fit: cover;">
                                  </div>
                                  <div class="col-md-8">
                                    <div class="card-body">
                                      <h5 class="card-title">
                                        ${cartItem.productName} </h5>
                                      <h4>Price: ${cartItem.price}</h4>
                                        <p class="card-text">ProductId: ${cartItem.productCode}</p>                                      
                                      <input class="input-amout" type="number" min="0" value="${cartItem.amount}">
                                      <button id="delete" type="button" class="btn btn-secondary btn-sm">Delete</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>`;
                  $("#container-carts").append(cartCard);
                })
              });
            }
          })
        }
      })
    }

    $('#container-carts').on("click", '#delete', function () {
      let checkeds = $(".form-check-input:checked");
      checkeds.each(function (index) {
        let i = $(this).id;
        $.ajax({
          url: "/api/cartItem/",
          type: "DELETE",
          dataType: "JSON",
          data: cartItems.find(x => x.id == i),
          headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
          },
          error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
          }
        }).done(function () {
          // remove this cart item from front-end array
          cartItems.splice(i, 1);
          refreshCart();
        })
      }
      )
    });

    $("#placeOrder").on("click", function () {
      let checkeds = $(".form-check-input:checked");
      checkeds.each(function (index) {
        let i = $(this).id;
        let cartItem = cartItems.find(x => x.id == i);
        let order = {
          id: i,
          productId: cartItem.productId,
          amount: cartItem.amount
        };
        // add order to order table
        $.ajax({
          url: "/api/order/",
          type: "POST",
          dataType: "JSON",
          data: order,
          headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
          },
          error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
          }
        }).done(function () {
          refreshCart();
        })
      })
      window.location.href = "orderhistory.html";
    })


    $("#container-carts").on("change", ".form-check-input", function () {
      calculateSubTotal();
    })

    $("#container-carts").on("change", ".input-amout", function () {
      calculateSubTotal();
    })



    function calculateSubTotal() {
      let checkeds = $(".form-check-input:checked");
      let subtotal = 0;
      checkeds.each(function (index) {
        let price = parseFloat($(this).parent().parent().children().eq(1).children().eq(1).children().eq(0).children().eq(1).text().substring(7));
        let amount = parseInt($(this).parent().parent().children().eq(1).children().eq(1).children().eq(0).children().eq(3).val());
        subtotal += price * amount;
      })
      $("#subtotalSpan").text(subtotal);
    }

    $("#container-carts").on("click", "img", function () {
      // not required for now
      // let id = $(this).id;
    })

    $("#signout").click(function () {
      ifLoggedIn = "false";
      sessionStorage.clear();
      window.open("index.html");
    });

    $("#formSearch").submit(function (event) {
      event.preventDefault();
      var searchFor = $('#formSearch :input').val();
      window.location.href = `productlist.html?category=${searchFor}`;
    });