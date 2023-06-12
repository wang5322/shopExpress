let searchedUsername;
let ifLoggedIn;

$(document).ready(function () {
    ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
    if (ifLoggedIn !== "true") {
        alert("Access Forbidden: you are not logged in!");
        window.location.href = "index.html";
    } else {
        if (sessionStorage.getItem('role') !== 'admin') {
            $("body").hide();
            alert("Access Forbidden: you are not an admin!");
        } else {
            // hide or show tables
            if (sessionStorage.role === 'buyer') {
                $("#orders").show();
                $("#productManage").hide();
            }
            if (sessionStorage.role === 'seller') {
                $("#orders").hide();
                $("#productManage").show();
            }
        }
    }
});

$("#signout").click(function () {
    ifLoggedIn = "false";
    sessionStorage.clear();
    window.open("index.html");
});

$("#btnSearch").on("click", function () {
    console.log("search button is clicked");
    searchedUsername = $("#textUsername").val();

    refreshDisplay(searchedUsername);
});

function refreshDisplay(username) {
    let searchedUserObj;
    $.ajax({
        url: "/api/users/" + searchedUsername,
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
        searchedUserObj = data;
        // display the searched user infor
        var result = "<tr><td>User Id: " + searchedUserObj.id + "</td>"
            + "<td>Username: " + searchedUserObj.userName + "</td>"
            + "<td>Role: " + searchedUserObj.role + "</td></tr>"
            + "<tr><td>Email: " + searchedUserObj.email + "</td>"
            + "<td></td>"
            + '<td><button type="button" id="resetPassword">Reset password</button></td></tr>'
            + "<tr><td>Address: " + searchedUserObj.address + "</td></tr>";
        $("#tableUserinfo").html(result);

        switch (searchedUserObj.role) {
            case "buyer":
                $("#productManage").hide();
                $("#orders").show();
                //if input user is a buyer, show his orders
                refreshOrderList(searchedUsername);
                break;

            case "seller":
                //if input user is a seller, show his product list
                $("#orders").hide();
                $("#productManage").show();
                refreshProductList(searchedUserObj);
                break;

            default:
                $("#orders").hide();
                $("#productManage").hide();
                break;
        }
    });
}

function refreshOrderList(username) {
    $.ajax({
        url: "/api/orders",
        type: "GET",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        dataType: "JSON",
        data: {buyerName: username, sellerName: null},
        error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
        }
    }).done(function (data, status, xhr) {
        var orders = "<tr class='table-primary'><th><button type='button' id='deleteOrder'>Delete order</button></th><th>orderID</th><th>sellerID</th><th>status</th><th>order time</th><th>product subtotal</th><th>taxes</th><th>shipping fee</th><th>ground total</th></tr>\n";
        for (row of data) {
            orders += `<tr><td>
                                <input class="form-check-input delete-order" type="checkbox" value="" >
                            </td>
                            <td>${row.id}</td><td>${row.sellerId}</td><td>${row.status}</td>
                            <td>${row.orderTime}</td><td>${row.totalPrice}</td><td>${row.taxes}</td>
                            <td>${row.shippingFee}</td><td>${row.finalTotalPay}</td></tr>\n`;
        }
        $("#tableOrders").html(orders);
    });
}

$("#tableUserinfo").on("click", "#resetPassword", function () {
    $.ajax({
        url: "/api/users/reset/" + searchedUsername,
        type: "PATCH",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
        }
    }).done(function () {
        searchedUsername = undefined;
        location.reload();
    })
})


$("#tableUserinfo").on("click", "#deleteAccount", function () {
    $.ajax({
        url: "/api/users/" + searchedUsername,
        type: "DELETE",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
        }
    }).done(function () {
        searchedUsername = undefined;
        location.reload();
    })
});

$("#tableOrders").on("click", "#deleteOrder", function () {
    let checkedboxes = $(".delete-order:checked");
    for (box of checkedboxes) {
        let orderid = parseInt(box.parent().parent().children().eq(1).text());
        $.ajax({
            url: "/api/orders/" + orderid,
            type: "DELETE",
            headers: {
                'x-auth-username': sessionStorage.getItem('username'),
                'x-auth-password': sessionStorage.getItem('password'),
                'x-auth-role': sessionStorage.getItem('role')
            },
            error: function (jqxhr, status, errorThrown) {
                alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            }
        }).done(function () {
            refreshOrderList(searchedUsername);
        })
    }
});

function refreshProductList(searchedUser) {
    $.ajax({
        url: "/api/products?sellerId=" + searchedUser.id,
        type: "GET",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        dataType: "JSON",
        data: {buyerName: null, sellerName: searchedUser.username},
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
}

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
