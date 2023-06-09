$(document).ready(function(){
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('register');

    if (myParam === '1') {
        $("#registerPanel").show();
        $("#loginPanel").hide();
    } else {
        //hide register form
        $("#registerPanel").hide();
    }
});

$("#hrefRegisterHere").click(function(){
    $("#registerPanel").show();
    $("#loginPanel").hide();
})

$("#btnLogin").on("click", function(){
    // get username and password from input text fields, use jQuery
    let username = $("input[name=username]").val();
    let password = $("input[name=password]").val();
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);

    // open AJAX httpRequst, send username and password with AJAX req.header to authenticator
    $.ajax({
        url: "/api/users/"+username,
        type:"GET",
        headers: { 'x-auth-username': sessionStorage.getItem('username'), 'x-auth-password': sessionStorage.getItem('password') },
        dataType:"json",
        error: function (jqxhr, status, errorThrown){
            alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);}        
    }).done(function(data){
        sessionStorage.setItem('role', data.role);
        switch (data.role) {
            case "seller":
                window.open("inventory.html");
                break;

            case "buyer":
                window.open("orderhistory.html");
                break;

            case "admin":
                window.open("admin.html");
                break;

            default:
                window.open("loginregister.html")
                break;
        }
    });
});

$("#btnRegister").on("click", function(){
    // get username and password from input text fields, use jQuery
    let username = $("input[name=newUsername]").val();
    let password = $("input[name=newPassword]").val();
    let address = $("input[name=newAddress]").val();
    let email = $("input[name=newEmail]").val();
    let role = $("select[name=newRole]").val();
    
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);
    sessionStorage.setItem('role', role);

    let newUserObj = {
        "username": username,
        "password": password,
        "role": role,
        "address": address,
        "email": email 
    };

        $.ajax({
            url: "/api/users/",
            type:"POST",
            dataType:"json",
            data: newUserObj,
            error: function (jqxhr, status, errorThrown){
                alert("AJAX error: " + jqxhr.responseText + ", status: " + jqxhr.status);}        
        }).done(function(data){
            switch (role) {
                case "seller":
                    window.open("inventory.html");
                    break;
    
                case "buyer":
                    window.open("orderhistory.html");
                    break;
    
                case "admin":
                    window.open("admin.html");
                    break;
    
                default:
                    window.open("loginregister.html")
                    break;
            }
        });
})