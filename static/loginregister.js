
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

$("#btnRegister").click(function(){
    $("#registerPanel").show();
    $("#loginPanel").hide();
})