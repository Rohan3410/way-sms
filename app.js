var accountSid='ACd25dcbc5dfc34134afdd054865dea0a5';
var authToken="a9fb0767734b2ff19aca0b504c2cf1be";

var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var mongoose = require('mongoose');
var mongoDB=require('mongodb');
var session =require('express-session');
var cookieParser =require('cookie-parser');
var client=require('twilio')(accountSid,authToken);


app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

var count=0;
var result=undefined;
//profile page url
app.get('/profile',function(req,res){
   res.render('profile.ejs',{result:result});
});
//welcome page url
app.get('/welcome',function(req,res){
   res.render("welcome");
})
//setting urls
app.get('/',function(req,res,next){

	    if(req.session.User){
        res.render('dashboard');
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.User);
       res.render("home");  //Error, trying to access unauthorized page!
    }
});

//draft url
app.get('/draft',function(req,res){
    var userAllDrafts={
		user_id:result._id
	}

  userDraft.find(userAllDrafts,function(err,data){
     if (err) {
     	console.error(err);
     }else{
     	console.log(data);
     	res.render("draft.ejs",{data:data});
     }
  });
});
//dashboard url
app.get('/dash',function(req,res,next){
   res.render('dashboard');
});
//msg url
app.get('/msg',function(req,res,next){
      var userAllCon={
		user_id:result._id
	}

  userCon.find(userAllCon,function(err,data){
     if (err) {
     	console.error(err);
     }else{
     	//console.log(data);
     	res.render("msg",{data:data});
     }
  });
});
//contacts url
app.get('/contacts',function(req,res,next){
   var userAllCon={
		user_id:result._id
	}

  userCon.find(userAllCon,function(err,data){
     if (err) {
     	console.error(err);
     }else{
     	console.log(data);
     	res.render("contacts.ejs",{data:data});
     }
  });
});

//welcome page url
app.get('welcome',function(req,res,next){
   res.render('welcome');
});

//connection with database using mongoose
var dbUrl='mongodb://localhost:27017/way2sms';
mongoose.connect(dbUrl,{
    useMongoClient:true
});

//creating mongodb Registration schema
var rgsSchema=mongoose.Schema({
	firstName:"String",
	lastName:"String",
	email:"String",
	password:"String"
},{collection:'UserDetails'});
var user=mongoose.model('UserDetails',rgsSchema);

//registration
app.post('/registration',function(req,res,next){

var newUser=new user({
    firstName:req.body.fname,
    lastName:req.body.lname,
    email:req.body.email,
    password:req.body.pwd
  });
	newUser.save(function(error){
    console.log("user is added");
    if (error) {
    	console.error(error);
    }
    res.send("<h3>registered successfully...<a href='/'>login</a></h3>");
	});
});//registration post

//login
app.post('/login',function(req,res,next){
	var loginData={
		email:req.body.email,
		password:req.body.password
	}

  user.findOne(loginData,function(err,data){
     if (err) {
     	console.error(err);
     }else{
     	console.log(loginData);
     	console.log(data);
     	if (data) {
     	req.session.User=req.body.email;
     	userId=data._id;
     	result=data;
     	res.render("dashboard.ejs",{result:result});
     	console.log(req.session.User);
     	console.log(userId);
     }else{
     	res.send("login failed!!!");
     }
    }
  });
});//login post

//logout operation
app.get('/logout',function(req,res,next){
   req.session.destroy(function(){
   	console.log('logout successfully');
   	result=null;
   });
   res.render('home');
});

/*//checking login
function checkLogin(req, res,next){
    if(req.session.User){
        console.log("Second"+ req.session.User);
        next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.User);
       res.render("home");  //Error, trying to access unauthorized page!
    }
 }
*/
 //sending sms using twilio
 app.post('/send',function(req,res,next){
 	number="+91"+req.body.add;
 	console.log(number);
		 	client.messages.create({
					to:"+919511998983",
					from:'+12405585496',
					body:req.body.textsms
				},function(err,message){
						if (err) {
							console.log(err);
						}else{
							console.log('sms sent !!!!');
							res.send("SMS Delivered Successfully.....<a></a>");
						}
				});
 });

//creating mongodb Add Contacts Schema
var addConSchema=mongoose.Schema({
 user_id:'String',
 name:'String',
 number:'Number'
},{collection:'UserContacts'});
var userCon=mongoose.model('UserContacts',addConSchema);

//adding contacts
app.post('/add',function(req,res,next){
   
   var contact=new userCon({
    user_id:result._id,
    name:req.body.name,
    number:req.body.num 
   });
   contact.save(function(err){
     if (err) {
     	console.log(err);
     }
     res.redirect('/contacts');
     console.log('contact added successfully..');
   });
});

//remove contacts
app.post('/rmv',function(req,res,next){
   if (req.body.number) {
   var number = {
   	number:req.body.number
   };
   userCon.remove(number,function(err,obj){
  if (err) throw err;
    console.log(" document(s) deleted");
    res.redirect('/contacts');
   })
   console.log(number);	 
   }else{
   	var number={
   		number:req.body.number
   	}
   }  
});

//creating mongodb Add Contacts Schema
var userDraftSchema=mongoose.Schema({
 user_id:'String',
 sms:'String',
 number:'Number'
},{collection:'UserDraft'});
var userDraft=mongoose.model('UserDraft',userDraftSchema);

//Save in Draft
app.get('/addDraft',function(req,res){
	console.log(result._id+"===="+req.body.textsms+"===="+req.body.number);
	var draft=new userDraft({
    user_id:result._id,
    sms:req.body.textsms,
    number:req.body.number
	});
	console.log(draft);
	 draft.save(function(err){
     if (err) {
     	console.log(err);
     }
     res.redirect('/msg');
     console.log('sms added into draft successfully..');
   });
}); 

//updating profile 
app.post('/updateProfile',function(req,res){
   var myquery = {_id:result._id };
   var newvalues = {
	   firstName:req.body.fname,
	   lastName:req.body.lname,
	   password:req.body.pwd 
   };
  user.updateOne(myquery, newvalues, function(err, ans) {
    if (err) throw err;
    console.log("1 document updated");
    res.render('dashboard',{result:result});
  });
});
//server
app.listen(8080,function () {
	console.log("server listening 8080....");
});