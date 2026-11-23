var express = require("express")
var path = require("path")
var app = express()
var crypto = require("crypto")
var fs = require("fs")

//used to store session info! Might have to re-tackle
var session = require('express-session')
app.use(session({
    secret:'Secret',
    resave: false,
    saveUninitialized: false
}))
//
var htmls = path.join(__dirname,'htmls')

var listUsers = []

//need function to preserve users!
function readInUsers(){
    try{
        var read = fs.readFileSync('all_users.txt',{'encoding':'utf8'})
        var lines = read.split('\n')
        var previousUsers = []
        for (var i = 0; i < lines.length - 1; i++){ // length-1 for no new line!
            var line = lines[i].split(',')
            previousUsers.push({'username': line[0],'password':line[1],'usertype':line[2]})
        }
        return previousUsers
    }catch(err){
        console.log(err)
        return []
    }
}

function validLogin(username,password){
    for (var i = 0; i < listUsers.length;i++){
        if (listUsers[i].username == username && listUsers[i].password == password){
            return true
        }
    }
    return false
}

function isAdmin(username){
    for (var i = 0; i < listUsers.length; i ++){
        if (listUsers[i].username == username && listUsers[i].usertype == "admin"){
            return true
        }
    }
    return false
}

/*app.get("/home", (req,res)=>res.sendFile(path.join(htmls, 'home.html')))*/
app.get("/style.css", (req,res)=>res.sendFile(path.join(htmls,'style.css')))
app.get("/project_source.js", (req,res)=>res.sendFile(path.join(htmls,'project_source.js')))

//check this
/*app.post("/home", (req,res)=>{
    var hash = crypto.createHash('sha256')
    var hashed_password = hash.update(req.body.password).digest('hex')
    if (validLogin(req.body.username,hashed_password) && !(isAdmin(req.body.username))){
        res.sendFile(path.join(htmls,'home_poster.html'))
    }else if (validLogin(req.body.username,hashed_password) && isAdmin(req.body.username)){
        res.sendFile(path.join(htmls,'home_admin.html'))
    }
})*/
// changed to get
/*app.get("/home", (req,res)=>{
    if (isAdmin(req.session.username)){
        res.sendFile(path.join(htmls,'home_poster.html'))
    }else if (isAdmin(req.session.username)){
        res.sendFile(path.join(htmls,'home_admin.html'))
    }
})*/

app.get("/home", (req,res)=>{
    var username = req.session.username
    if (username == null){
        res.sendFile(path.join(htmls,'home.html'))
    }
    else if (isAdmin(username)){
        res.sendFile(path.join(htmls,'home_admin.html'))
    }
    else{
        res.sendFile(path.join(htmls,'home_poster.html'))
    }
})

/*
app.get("/posts", (req,res)=>{
        if (isAdmin(req.body.username)){
            res.sendFile(path.join(htmls,"posts_admin.html"))
        }else{
            res.sendFile(path.join(htmls,"posts.html"))
        }
    }
)*/

app.get("/posts", (req,res)=>{
    var username = req.session.username
    if (isAdmin(username)){
        res.sendFile(path.join(htmls,'posts_admin.html'))
    }
    else{
        res.sendFile(path.join(htmls,'posts.html'))
    }
})

app.get("/create", express.json() ,(req,res)=>res.sendFile(path.join(htmls,"create.html")))
app.post("/create_user_action", express.urlencoded(), (req,res)=>{
    var hash = crypto.createHash('sha256')
    var hashed_password = hash.update(req.body.password).digest('hex')
    listUsers.push({'username':req.body.username,'password':hashed_password,'usertype':req.body.usertype})
    // check for list size!
    // need to store information!
    try{
        var user = `${req.body.username},${hashed_password},${req.body.usertype}\n`
        fs.appendFileSync('all_users.txt',user,{'encoding':'utf8'})
    }
    catch(err){
        console.log(err)
    }
    res.sendFile(path.join(htmls,"creation_action.html"))
})

//finish login action!
app.get("/login", express.json(), (req,res)=>res.sendFile(path.join(htmls,"login.html")))
app.post("/lgn_action",express.urlencoded(), (req,res)=>{
    var hash = crypto.createHash('sha256')
    var hashed_password = hash.update(req.body.password).digest('hex')
    if (validLogin(req.body.username,hashed_password)){
        // added for session
        req.session.username = req.body.username
        //
        res.sendFile(path.join(htmls,"login_action.html"))
    }else{
        res.sendFile(path.join(htmls,"failed_login_action.html"))
    }
})
//do we want an individual search page? Left here just in case and this will be adressed on Tuesday
app.get("/search", express.json(), (req,res)=>res.sendFile(path.join(htmls,"search.html")))
//work to be done

app.listen(8080, ()=>{
    console.log("server started...")
    listUsers = readInUsers()
})