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
    res.render('index');
})

app.get('/getdata',(req,res)=>{
    res.render('index_old')
})


// app.post('/fillData',(req,res)=>{
//     console.log("fill data page")
//     res.render('fillData',{
//         details:req.body
//     })
// })

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
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();
            today = dd + '/' + mm + '/' + yyyy;
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
    res.render('fillData',{
        image:image
    })
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
    //console.log(img)
    var data=req.body.imageData
    //console.log(data)
    var subjectid=JSON.stringify(req.body.employeeid);
    // console.log(subjectid)
    var subject_id=req.body.employeeid;
    // console.log(subject_id)
    //console.log(subjectid);
    var i;
    var data1 = [];
    
    for (i=0;i<detailsArray.employeeDetails.length;i++){
        data1.push(detailsArray.employeeDetails[i].employeeid)
        // console.log(data1)

    }
    
    // console.log(detailsArray.employeeDetails[i].employeeid)
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
    //   else if(error.status ==5000 || error.status ==5001 || error.status ==5002 || error.status ==5003 || error.status ==5004){
    //       res.render('index_old',{
    //         msg: 'Face not recognized .Please start again ',
    //         vis: 'visible',
    //       })

    //   }
    //   else if(error.status ==1000 || error.status ==1001 || error.status ==1002 || error.status ==1003 || error.status ==1004){
    //     res.render('index',{
    //       msg: 'Face not recognized .Please start again ',
    //       vis: 'visible',
    //     })

    // }
    // else if(error.status ==3000 || error.status ==3001 || error.status ==3002 || error.status ==3003 || error.status ==3004){
    //     res.render('index',{
    //       msg: 'Face not recognized .Please start again ',
    //       vis: 'visible',
    //     })

    // }
        else if(JSON.parse(body).images[0].transaction.subject_id != null) {
            var subjectid=JSON.parse(body).images[0].transaction.subject_id 
            // console.log(data)
            // console.log(subjectid)
            if(data1.includes(subjectid)){
                detailsArray.employeeDetails.forEach((element) =>{
                    if(element.employeeid == subject_id){
                        var today = new Date();
                        var dd = today.getDate();
                        var mm = today.getMonth()+1; //January is 0!
                        var yyyy = today.getFullYear();
                        today = dd + '/' + mm + '/' + yyyy;
                        res.render('fillingConfirmation',{
                            details:element,
                            image:data
                        })
                    }
                 
                })      
            }
            else{
                var subject =subject_id;
                // console.log(subject)
                console.log("no subject id matched")
                res.render('noDetailsAvailable',{
                    subject:subject,
                    image:data
                })
            }
          
        }

    })

}
)  


app.post('/upload', (req, res) => {
    //res.render('index')
    // console.log(JSON.stringify(req.body) + "hello");
    console.log("upload page" )
    var data = JSON.stringify(req.body.myImage);
    var img = req.body.myImage;
    // console.log(data)

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

    //console.log("Options Body : " + options.body);

    request(options, function (error, response, body) {
        // if (error) throw new Error(error);
        //body = JSON.parse(body);
        // console.log("Array check");
        // console.log(body.images instanceof Array);
        // console.log(Array.isArray(JSON.parse(body).images));

        // console.log("Response Body : " + JSON.stringify(body));
        // console.log(JSON.stringify(body.images[0].transaction.message));
        if (JSON.parse(body) === "Authentication failed") {
            res.render('frontpage')
        } else if(JSON.parse(body).hasOwnProperty('Errors')) {
            res.render('index_old', {
                msg: 'Face not recognized. Please try again',
                vis: 'visible'
            })
        // } else if(body.images[0].transaction.message == 'no match found'){
        }
    //     else if(error.status ==5000 || error.status ==5001 || error.status ==5002 || error.status ==5003 || error.status ==5004){
    //         res.render('index_old',{
    //           msg: 'Face not recognized .Please start again ',
    //           vis: 'visible',
    //         })
  
    //     }
    //     else if(error.status ==1000 || error.status ==1001 || error.status ==1002 || error.status ==1003 || error.status ==1004){
    //       res.render('index',{
    //         msg: 'Face not recognized .Please start again ',
    //         vis: 'visible',
    //       })
  
    //   }
    //   else if(error.status ==3000 || error.status ==3001 || error.status ==3002 || error.status ==3003 || error.status ==3004){
    //       res.render('index',{
    //         msg: 'Face not recognized .Please start again ',
    //         vis: 'visible',
    //       })
  
    //   }
         else if(Array.isArray(JSON.parse(body).images) && JSON.parse(body).images[0].transaction.message === "no match found"){
            res.render('fillData',{
                msg: 'Face not recognized .Please fill the data',
                vis: 'visible',
                details:req.body,
                image :img
            })
        }
     else {
            // console.log(JSON.stringify(body) + "Response");
            // console.log(JSON.parse(body).images[0].transaction.subject_id);
            subject_id = JSON.parse(body).images[0].transaction.subject_id;
            detailsArray.employeeDetails.forEach((element) => {
                if(element.employeeid == subject_id) {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; //January is 0!
                    var yyyy = today.getFullYear();
                    today = dd + '/' + mm + '/' + yyyy;
                    // var img = new Buffer(data, 'base64');
                    res.render('welcomeCard',{
                        details:element,
                        image:img
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
