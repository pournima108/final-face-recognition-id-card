var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();
var request = require("request");
var ejs = require("ejs");
var messenger= require('./func')
var checkDefaulter =require('./tracker')
var detailsArray = require('./emp.json');
require('dotenv').config()
// var route = require('./api/routes')

// EJS
app.set('view engine', 'ejs');

new checkDefaulter().createRegister();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname));

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
    res.render('index');
})

app.get('/getdata',(req,res)=>{
    res.render('index_old')
})



app.post('/response',(req,res)=>{
    var image=req.body.imageData;
    //console.log(img);
    console.log("response page");
    var subjectid = req.body.employeeid;
    console.log(subjectid)
    detailsArray.employeeDetails.forEach((element) => {
        if(element.employeeid == subjectid) {
            //console.log(element.employeeid)
            var today = new Date();
            var formatted = moment(today).format('DD.MMMM.YYYY');
            today =formatted
            console.log("response page");
            res.render('response', {
            msg:'response page',
            details:element,
            date:today,
            image:image
        });
    }   
    })
})


app.post('/smsHandler',(req,res)=>{
    var imageData=req.body.imageData;
    var employeeid=req.body.employeeid;
    
    new messenger().sendSms((message)=>{
        // console.log(message)
        // console.log(message.status)
        if(message.status == "queued"){
            res.render('otpPage',{
                imageData:imageData,
                employeeid:employeeid,
                message:message
            })     
        }

    })
    
})

app.post('/otpHandler',(req,res)=>{
    var otp=req.body.otp;
    var image =req.body.imageData;
    var subject_id=req.body.employeeid
    if (otp==546700){
        detailsArray.employeeDetails.forEach((element) => {
            if(element.employeeid == subject_id) {
                var today = new Date();
                var formatted = moment(today).format('DD.MMMM.YYYY');
                today =formatted
        res.render('response',{
            image:image,
            details:element,
            date:today

        })
    }
    })
}})

app.post('/detrain',(req,res)=>{
    console.log("inside detrain")
    var subjectid=JSON.stringify(req.body.employeeData)
    // console.log(subjectid)
    console.log("inside detrain")
    var options2 ={
        method:'POST',
        url: 'https://api.kairos.com/gallery/remove_subject',
        headers:{
            "Content-Type": "application/json",
            app_key: process.env.API_KEY,
            app_id: process.env.API_ID
        },
        body: '{"subject_id": '+ subjectid +', "gallery_name":"MyGallery"}'
    };
    request(options2,function(error,response,body) {
        console.log("Response Body : " + JSON.stringify(body));
        if(error){
            console.log("error")
        }
        else{
            console.log("sucessfull")
            res.render('index')
        }
    })
})


app.post('/fillData',(req,res)=>{
    var image=req.body.imageData;
    console.log("filldata page")
    new messenger().sendSms((message)=>{       
        if(message.status == "queued"){
            res.render('fillData',{
                image:image
            })
        }
    })
    
})



app.post('/enroll',(req,res)=> {
    console.log("enroll data")
    var img = JSON.stringify(req.body.imageData);
    var data=req.body.imageData
    var subjectid=JSON.stringify(req.body.employeeid);
    var subject_id=req.body.employeeid;
    var otp=req.body.otp;
    var i;
    var data1 = []; 
    for (i=0;i<detailsArray.employeeDetails.length;i++){
        data1.push(detailsArray.employeeDetails[i].employeeid)
    }
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
        // console.log("Response Body : " + JSON.stringify(body));
        // console.log(JSON.parse(body).images[0].transaction.subject_id)
        // console.log(detailsArray.employeeDetails[0].employeeid)
        console.log(JSON.parse(body))
        if (JSON.parse(body) === "Authentication failed") {
            res.render('frontpage')
        }
        // JSON.parse(body)
       else if(error){
           console.log(error)
            res.render('index', {
                msg: 'Face not recognized. Please try again',
                vis: 'visible'
            })
        }
        else if(JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5000') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5001')|| JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5002') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5003') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5004') ||JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5010')){
            res.render('index_old',{
                msg: 'Face not recognized .Please start again ',
                svis: 'visible',
            })
        }
    //   else if(JSON.parse(body).Errors[0].ErrCode ==1000 || JSON.parse(body).Errors[0].ErrCode ==1001 || JSON.parse(body).Errors[0].ErrCode ==1002 || JSON.parse(body).Errors[0].ErrCode ==1003 || JSON.parse(body).Errors[0].ErrCode ==1004){
    //     res.render('index',{
    //       msg: 'Face not recognized .Please start again ',
    //       vis: 'visible',
    //     })

    // }
    // else if(JSON.parse(body).Errors[0].ErrCode ==3000 || JSON.parse(body).Errors[0].ErrCode ==3001 || JSON.parse(body).Errors[0].ErrCode ==3002 || JSON.parse(body).Errors[0].ErrCode ==3003 || JSON.parse(body).Errors[0].ErrCode ==3004){
    //     res.render('index',{
    //       msg: 'Face not recognized .Please start again ',
    //       vis: 'visible',
    //     })

    // }
        else if(JSON.parse(body).images[0].transaction.subject_id != null) {
            var subjectid=JSON.parse(body).images[0].transaction.subject_id 
            if(data1.includes(subjectid)){
                var today = new Date();
                var formatted = moment(today).format('DD.MMMM.YYYY');
                var record = {
                    "empId" :subjectid,
                    "date" : formatted
                }
                console.log(JSON.stringify(record))
                new checkDefaulter().recordDefaulter(record);
                detailsArray.employeeDetails.forEach((element) =>{
                    if(element.employeeid == subject_id && otp=="546700"){
                        today=formatted,
                        res.render('fillingConfirmation',{
                            details:element,
                            image:data,
                            date:today
                        })               
                    }
                })   
            }
            else{
                var subject =subject_id;
                console.log("no subject id matched")
                res.render('noDetailsAvailable',{
                    subject:subject,
                    image:data
                })
            }
          
        }

    })

})


app.post('/upload', (req, res) => {
    console.log("upload page" )
    var data = JSON.stringify(req.body.myImage);
    var img = req.body.myImage;
    // var filterDefaulter =new checkDefaulter().filterRegularDefaulter();
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
        // console.log(JSON.stringify(body.images[0].transaction.message));
        if (JSON.parse(body) === "Authentication failed") {
            res.render('frontpage')
        } else if(JSON.parse(body).hasOwnProperty('Errors')) {
            res.render('index_old', {
                msg: 'Face not recognized. Please try again',
                vis: 'visible'
            })
        }
        else if(JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5000') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5001')|| JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5002') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5003') || JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5004') ||JSON.parse(body).hasOwnProperty('Errors[0].ErrCode==5010')){
            res.render('index_old',{
              msg: 'Face not recognized .Please start again ',
              vis: 'visible',
            })
        }
  
    //     else if(JSON.parse(body).Errors[0].ErrCode ==1000 || JSON.parse(body).Errors[0].ErrCode ==1001 || JSON.parse(body).Errors[0].ErrCode ==1002 || JSON.parse(body).Errors[0].ErrCode ==1003 || JSON.parse(body).Errors[0].ErrCode ==1004){
    //       res.render('index',{
    //         msg: 'Face not recognized .Please start again ',
    //         vis: 'visible',
    //       })
  
    //   }
    //   else if(JSON.parse(body).Errors[0].ErrCode ==3000 || JSON.parse(body).Errors[0].ErrCode ==3001 || JSON.parse(body).Errors[0].ErrCode ==3002 || JSON.parse(body).Errors[0].ErrCode ==3003 || JSON.parse(body).Errors[0].ErrCode ==3004){
    //       res.render('index',{
    //         msg: 'Face not recognized .Please start again ',
    //         vis: 'visible',
    //       })
  
    //   }
         else  if(Array.isArray(JSON.parse(body).images) && JSON.parse(body).images[0].transaction.message === "no match found"){
            res.render('fillData',{
                msg: 'Face not recognized .Please fill the data',
                vis: 'visible',
                details:req.body,
                image :img
            })
        }
    
     else {
            subject_id = JSON.parse(body).images[0].transaction.subject_id;
            var today = new Date();
            var formatted = moment(today).format('D MMMM YYYY');
            var record = {
                    "empId" : subject_id,
                    "date" : formatted
            }
            console.log(JSON.stringify(record))
            new checkDefaulter().recordDefaulter(record);
            
            detailsArray.employeeDetails.forEach((element) => {
                if(element.employeeid == subject_id) {
                    today =formatted
                    res.render('welcomeCard',{
                        details:element,
                        image:img,
                        date:today
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
