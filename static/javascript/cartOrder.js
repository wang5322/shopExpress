$(document).ready(() => {

    let cartOrOrder = window.location.search.substring(1).split("=")[1];
    refresh(cartOrOrder);
$("#showCarts").on("click", function ()  {
    refresh("carts");
});
$("#showOrders").on("click", function () {
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
        };
            
        
    }
    alert(pane);
}
