$(document).ready(function () {
    // hide or show tables
       
    if (sessionStorage.role === 'buyer') {
        $("#orders").show();
        $("#productManage").hide();
    }
    if (sessionStorage.role === 'seller') {
        $("#orders").hide();
        $("#productManage").show();
    }
});

$("#loginHere").click(function () {
    window.open("loginregister.html");
});

$("#btnSearch").on("click", function () {
    console.log("search button is clicked");
    let username = $("#textUsername").val();
    let searchedUser;
    console.log(username);
    $.ajax({
        url: "/api/users/" + username,
        type: "GET",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
        }
    }).done(function (data, status, xhr) {
        searchedUser = data;
        // display the searched user infor
        var result = "<tr><td>User Id: " + searchedUser.id + "</td>"
            + "<td>Username: " + searchedUser.userName + "</td>"
            + "<td>Role: " + searchedUser.role + "</td></tr>"
            + "<tr><td>Email: " + searchedUser.email + "</td>"
            + "<td></td>"
            + '<td><a href="#!" style="color: #393f81;" id="deleteAccount">Delete Account</a></td></tr>'
            + "<tr><td>Address: " + searchedUser.address + "</td></tr>";
        $("#tableUserinfo").html(result);

        switch (searchedUser.role) {
            case "buyer":
                $("#productManage").hide();
                //if input user is a buyer, show his orders
                $.ajax({
                    url: "/api/orders",
                    type: "GET",
                    headers: {
                        'x-auth-username': sessionStorage.getItem('username'),
                        'x-auth-password': sessionStorage.getItem('password'),
                        'x-auth-role': sessionStorage.getItem('role')
                    },
                    dataType: "JSON",
                    data: { buyerName: username, sellerName: null },
                    error: function (jqxhr, status, errorThrown) {
                        alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
                    }
                }).done(function (data, status, xhr) {
                    var orders = "<tr class='table-primary'><th><a href='#!'' style='color: #393f81;' id='deleteAccount'>Delete order</a></th><th>orderID</th><th>sellerID</th><th>status</th><th>order time</th><th>product subtotal</th><th>taxes</th><th>shipping fee</th><th>ground total</th></tr>\n";
                    for (row of data) {
                        orders += `
                <tr><td><div class="form-check">
                <input class="form-check-input" type="checkbox" value="" >
                <label class="form-check-label"></td><td>${row.id}</td><td>${row.sellerId}</td><td>${row.status}</td><td>${row.orderTime}</td><td>${row.totalPrice}</td><td>${row.taxes}</td><td>${row.shippingFee}</td><td>${row.finalTotalPay}</td></tr>
                 </label>
                 </div>\n`;
                    }
                    $("#tableOrders").html(orders);
                });
                break;

            case "seller":
                //if input user is a seller, show his product list
                $("#orders").hide();
                $.ajax({
                    url: "/api/products?sellerId=" + searchedUser.id,
                    type: "GET",
                    headers: {
                        'x-auth-username': sessionStorage.getItem('username'),
                        'x-auth-password': sessionStorage.getItem('password'),
                        'x-auth-role': sessionStorage.getItem('role')
                    },
                    dataType: "JSON",
                    data: { buyerName: null, sellerName: username },
                    error: function (jqxhr, status, errorThrown) {
                        alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
                    }
                }).done(function (data, status, xhr) {
                    var products = "<tr class='table-primary'><th>Product ID</th><th>Category</th><th>Seller ID</th><th>Product Code</th><th>Product Name</th><th>Product Desc</th><th>Price</th><th>Stock Num</th><th>Available</th></tr>\n";
                    for (row of data) {
                        products += `<tr><td>${row.id}</td><td>${row.category}</td><td>${row.sellerId}</td><td>${row.productCode}</td><td>${row.productName}</td><td>${row.productDesc}</td><td>${row.price}</td><td>${row.stockNum}</td><td>${row.available}</td></tr>\n`;
                    }
                    $("#tableProducts").html(products);
                });
                break;

            default:
                $("#orders").hide();
                $("#productManage").hide();
                break;
        }
    });
});

// $("#delectAccount").on("click", function () {
//     let username = $("textUsername").val();
//     $.ajax({
//         url: "/api/users"+ username,
//         type: "DELETE",
//         dataType: "json",
//         error: function (jqxhr, status, errorThrown) {
//             alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
//         }
//     }).done(function (data) {
//         //after delete, return?
//     })
// })
