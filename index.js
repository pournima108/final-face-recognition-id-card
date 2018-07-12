var express = require('express');
var fs = require('fs');
// var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var request = require("request");
var ejs = require("ejs");

var detailsArray = require('./emp.json');
require('dotenv').config()
// var route = require('./api/routes')

// EJS
app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;

app.use(express.static(__dirname));
// var accessLogStream = fs.createWriteStream(__dirname + '/api/logs/access.log', {flags: 'a'});
// app.use(morgan('common'));
//app.use(morgan('common', {stream: accessLogStream})) //SWITCH LOG  SAVE

/**
 * To support JSON-encoded bodies.
 */
app.use(bodyParser.json());
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));

/**
 * Routing to routes.js file
 */
// app.use('/', route);
app.get('/', (req, res) => {
    res.render('frontpage');
})

app.get('/getdata',(req,res)=>{
    res.render('index')
})


// app.post('/fillData',(req,res)=>{
//     console.log("fill data page")
//     res.render('fillData',{
//         details:req.body
//     })
// })

app.get('/response',(req,res)=>{
    console.log("response page")
    res.render('response')
})

// app.post('/welcomeCard',(req,res)=>{
// res.render('welcomeCard',{
//     details:req.body
// })
// })

app.post('/enroll',(req,res)=> {
    console.log("enroll data")
    //var data = JSON.stringify(req.body.imageData);
    //console.log(imageData)
    var img = JSON.stringify(req.body.imageData);
    console.log(img)    
    var subjectid=JSON.stringify(req.body.employeeid);
    console.log(subjectid);
    var options1 ={
        method:'POST',
        url: 'https://api.kairos.com/enroll',
        headers:{
            "Content-Type": "application/json",
            app_key: process.env.API_KEY,
            app_id: process.env.API_ID
        },
        body: '{"image":' + img + ',"subject_id": '+ subjectid +', "gallery_name":"MyGallery"}'
    };
    request(options1,function(error,response,body) {

 JSON.parse(body)
        if(error){
            res.render('index', {
                msg: 'Face not recognized. Please try again',
                vis: 'visible'
            })
        }else{
            //console.log(body.images[0].transaction.subject_id);
            detailsArray.employeeDetails.forEach((element) => {
                if(element.employeeid == subjectid) {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    today = dd + '/' + mm + '/' + yyyy;
                    res.render('fillingConfirmation.ejs',{
                        details:element

                    })
         
        }
    })

}
})
})


app.post('/upload', (req, res) => {
    //res.render('index')
    // console.log(JSON.stringify(req.body) + "hello");
    console.log("upload page" )
    var data = JSON.stringify(req.body.mydata);
    var img = req.body.mydata;

    var options = {
        method: 'POST',
        url: 'https://api.kairos.com/recognize',
        headers: {
            "Content-Type": "application/json",
            app_key: process.env.API_KEY,
            app_id: process.env.API_ID
        },
        body: '{"image":' + data + ',"gallery_name":"MyGallery"}'
    };
    request(options, function (error, response, body) {
        // if (error) throw new Error(error);
        body = JSON.parse(body);
        // console.log(JSON.stringify(body.images[0].transaction.message));
        if(body.hasOwnProperty('Errors')) {
            res.render('index', {
                msg: 'Face not recognized. Please try again',
                vis: 'visible'
            })
        } else if(body.images[0].transaction.message == 'no match found'){
            res.render('FillData',{
                msg: 'Face not recognized .Please fill the data',
                vis: 'visible',
                details:req.body,
                image :img
            })
        }     
       else {
        // console.log(JSON.stringify(body) + "Response");
        console.log(body.images[0].transaction.subject_id);
        subject_id = body.images[0].transaction.subject_id;
        detailsArray.employeeDetails.forEach((element) => {
            if(element.employeeid == subject_id) {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1; //January is 0!
                var yyyy = today.getFullYear();
                today = dd + '/' + mm + '/' + yyyy;
                // var img = new Buffer(data, 'base64');
                res.render('welcomeCard',{
                    details:element
                });
            }
        })
    }
        // res.end("saved");
    });
    // res.end("submitted");
})



app.post('/printCard', (req, res) => {
    console.log("PRINTID CARD PAGE")
    res.render('printIdCard', {
        details: req.body
    })
})



app.listen(port);
console.log("Server Running Successfully at port " + port);

module.exports = app;