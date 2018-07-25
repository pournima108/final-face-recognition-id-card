var fs = require("fs");
var moment = require("moment");

class Tracker{

    constructor(){

        console.log("Defaulter tracker initialized");
        
        if (!fs.existsSync("trace")) {
            fs.mkdirSync("trace");
            
            fs.writeFile('trace/trace.json',"[]",(err)=>{
                if(err){
                        console.log("error in initializing defaulter list");
                    }else{
                        console.log("file created");
                    }
            });

          }

    }

    

    recordDefaulter(data){
        
        fs.readFile("trace/trace.json",(err,fileData)=>{
           var defaulterList = JSON.parse(fileData.toString());
        //    console.log(defaulterList);
           defaulterList.push(data);
        //    console.log(defaulterList);
            fs.writeFile('trace/trace.json',JSON.stringify(defaulterList),(err)=>{
                if(err){
                        console.log("error in writing defaulter list");
                    }else{
                        console.log("recorded");
                    }
            });
        });
        
    }


    filterRegularDefaulter(empid,callback){

        fs.readFile("trace/trace.json",(err,fileData)=>{

            if(err){
                console.log("Error in reading file while scanning deafulter");
                callback(err,null);
            
            }else{

                var traceRecord=JSON.parse(fileData.toString());
                
                for(var ele=0; ele < traceRecord.length; ele++){

                    if(empid== traceRecord[ele].empid){

                        if(moment(moment(new Date)).diff(moment(traceRecord[ele].date, "DD.MM.YYYY"),"day")==1){
                            console.log("lost yesterday");

                            callback(null,"yes");
                            break;
                        }
                    }

                }
                
            }

        })

    }

}

// var lostdate = moment("23.07.2018", "DD.MM.YYYY").format("DD.MM.YYYY");
// console.log(lostdate);

// var currentdate = moment(new Date).format("DD.MM.YYYY");
// console.log(currentdate);

data={
    empid:"36022",
    date:moment("24.07.2018", "DD.MM.YYYY").format("DD.MM.YYYY")
}
// dd + '/' + mm + '/' + yyyy;
// console.log(data);
var trac = new  Tracker();
// console.log(data.date);
// trac.recordDefaulter(data); 

// trac.filterRegularDefaulter(36022,(err,data)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log(data);
//     }
// });
// module.exports = Tracker;