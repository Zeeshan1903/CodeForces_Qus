const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: false }));

const { MongoClient } = require('mongodb');
const uri= 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectToDb() {
    await client.connect();
}
connectToDb();

const bcrypt = require('bcrypt');
const { type } = require('os');


async function hashPassword(password){
    const salt = 10;
    const hashesPassword = bcrypt.hash(password,salt);
    return hashesPassword;
}

async function verifyPassword(password,hashesPassword){
    const match = bcrypt.compare(password,hashesPassword);
    return match;
}

app.get('/', (req, res) => {
    try {
        res.set( { 'Content-type': 'text/html' });
        const indexHtml = path.join(__dirname, 'index.html');
        res.sendFile(indexHtml);
        
    }   
    catch(err){
        res.status(500).send('Internal Server Error while loading the form page');
        return;
    }
})


var currentUser = null;
var currentUserEntry = true;

try{
    var db = client.db('codeforces');
    var collection = db.collection('login_data');
}
catch(err){
    console.log('Internal server error while connecting to the database');
    return err;
}



app.post('/formData',async(req,res)=>{


    const changePass = await hashPassword(req.body.password);

    var user = {
        name : req.body.name,
        handle_name : req.body.handle_name,
        email : req.body.email,
        password: changePass
    }
    var password_empty = false;
    if(req.body.password == ""){
        password_empty = true;
    }

    var checkUser = await collection.findOne({'email':req.body.email});
    currentUser = req.body.email;

    try{
        if(checkUser){
            var pass= req.body.password;       
            var checkPassword = await verifyPassword(pass,String(checkUser.password));
            console.log('%^^^^^^^^^^^^');
            if(checkPassword){
                console.log('User already exist ');
                console.log('It does not added to the database');
                return ;
            }
            else{
                currentUserEntry = false;
                console.log('Wrong password');
                res.send('Wrong Password Entered. Please try again');
                return;
            }
        }
        else{
            if(password_empty){
                res.send('You did not enter the password try again at \n http://localhost:8200/');
                return;
            }
            console.log('User was unique. So added to the database');
            const result = await collection.insertOne(user);
        }

    }
    catch(err){
        console.log('Error occur while checking for the user in the database');
        console.log('The error is '+err);
        return ;
    }
    const homeHtml = path.join(__dirname,'../home_page/home.html');
    res.sendFile(homeHtml);
})
app.get('/getFormData',async (req,res)=>{
    
    try{
    
        if(currentUserEntry == true){
            console.log(currentUser);

            var user_login = await collection.findOne({'email':currentUser});  

            var user_data ={ 
                user_name : user_login.name,
                user_handle_name : user_login.handle_name
            };

            res.json(user_data);
        
        }
        else{
            res.json('User Entered the wrong Password So please try again later');
        }
    }
    catch(err){
        res.json(err);
    }
})

app.get('/backend.js',(req,res)=>{
    try{
        res.set({'Content-type':'application/javascript'});
        const backendJs = path.join(__dirname,'../home_page/backend.js');
        res.sendFile(backendJs);
        
    }
    catch(err){
        res.writeHead(500,{'Content-type':'text/html'});
        res.write('Internal server error while loading the js file');
        console.log(err);
        res.end();
    }
})

app.listen(8200,()=>{
    console.log(`Server started at port No. : 8200`);
})
