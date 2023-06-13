let searchedUsername;
let searchedRole;
let ifLoggedIn;

$(document).ready(function () {
    ifLoggedIn = sessionStorage.getItem("ifLoggedIn");
    if (ifLoggedIn !== "true") {
        $(".modal-body").html("Access Forbidden: you are not logged in!");
        $("#AlertModal").modal("show");
        setTimeout(function () {
            $(".modal-body").html("");
            window.location.href = "loginregister.html?register=0";
        }, 5000);
    } else {
        if (sessionStorage.getItem('role') !== 'admin') {
            $("body").hide();
            $(".modal-body").html("Access Forbidden: you are not an admin!");
            $("#AlertModal").modal("show");
            setTimeout(function () {
                $(".modal-body").html("");
                window.location.href = "index.html";
            }, 5000);
        } else {
            $("#orders").show();
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
            $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            $("#AlertModal").modal("show");
        }
    }).done(function (data, status, xhr) {
        searchedUserObj = data;
        searchedRole = searchedUserObj.role;
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
            case "admin":
                $("#orders").hide();
                break;

            default:
                $("#orders").show();
                refreshOrderList(searchedUsername, searchedUserObj.role);
                break;
        }
    });
}

function refreshOrderList(username, role) {
    let buyerName = (role === 'buyer') ? username : "";
    let sellerName = (role === 'seller') ? username : "";
    $.ajax({
        url: `/api/orders/${buyerName}/buyfrom/${sellerName}`,
        type: "GET",
        headers: {
            'x-auth-username': sessionStorage.getItem('username'),
            'x-auth-password': sessionStorage.getItem('password'),
            'x-auth-role': sessionStorage.getItem('role')
        },
        error: function (jqxhr, status, errorThrown) {
            $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            $("#AlertModal").modal("show");
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
            $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            $("#AlertModal").modal("show");
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
            $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
            $("#AlertModal").modal("show");
        }
    }).done(function () {
        searchedUsername = undefined;
        location.reload();
    })
});

$("#tableOrders").on("click", "#deleteOrder", function () {
    console.log("delete order is clicked")
    let checkedboxes = $(".delete-order:checked");
    checkedboxes.each(function (index) {
        let orderid = parseInt($(this).parent().parent().children().eq(1).text());
        $.ajax({
            url: "/api/orders/" + orderid,
            type: "DELETE",
            headers: {
                'x-auth-username': sessionStorage.getItem('username'),
                'x-auth-password': sessionStorage.getItem('password'),
                'x-auth-role': sessionStorage.getItem('role')
            },
            error: function (jqxhr, status, errorThrown) {
                $(".modal-body").html("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);
                $("#AlertModal").modal("show");
            }
        }).done(function () {
            refreshOrderList(searchedUsername, searchedRole);
        })
    })

});