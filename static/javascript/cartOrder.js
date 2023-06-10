$(document).ready(() => {

    let cartOrOrder = window.location.search.substring(1).split("=")[1];
    refresh(cartOrOrder);
    $("#showCarts").on("click",  ()=> {
        refresh("carts");
    });
    $("#showOrders").on("click",  ()=> {
        refresh("orders");
    });

})



function refresh(pane) {
    switch (pane) {
        case "carts": {
            $("#ordersPane").hide();
            $("#cartsPane").show();
            break;
        };
        case "orders": {
            $("#ordersPane").show();
            $("#cartsPane").hide();
            break;
        };
        default: {
            $("#ordersPane").hide();
            $("#cartsPane").hide();
            return;
        };
    };
    console.log(sessionStorage);
    $.ajax({
        url: "/api/"+pane,
        type: "GET",
        headers: { 'x-auth-username': sessionStorage.getItem('username'), 
                    'x-auth-password': sessionStorage.getItem('password')
                },
        dataType: "json",
        error: function (jqxhr, status, errorThrown) {
            alert("AJAX error: " + jqxhr.responseText);
        }
    }).done((data)=>{
          console.log(data);
      });


    

}
