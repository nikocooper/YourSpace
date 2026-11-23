function storingUsers(){
    var user = document.getElementById("username").value
    window.localStorage.setItem('username',user)
}
// need to see who's in the server!
function updatingUrls(){
    var username = window.localStorage.getItem("username")
    if (username!=null){
        var aList = document.getElementsByTagName("a")
        for (var i = 0; i < aList.length; i++){
            aList[i].href += username
        }
    }
}

function getUsers(){
    var message = document.getElementById("result")
    message.innerText = "Welcome, " + window.localStorage.getItem("username")
}