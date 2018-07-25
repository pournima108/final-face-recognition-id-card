// var twilio =require('twilio')
class Messenger{

    

    sendSms(callback){
        console.log("inside sms module");
        var accountSid = 'AC6e3271328851d586d7f996e6fb97189d'; // Your Account SID from www.twilio.com/console
        var authToken = 'ed69c1fded03992a4b57715bababbff7';   // Your Auth Token from www.twilio.com/console
        var msg="Onetime password (OTP) for your TPIN request over google assitant is 546700. this is usable once & valid for 15 mins from the request.PLEASE DO NOT SHARE WITH ANYONE."
        const client = require ('twilio')(accountSid,authToken);
        client.messages.create({
            to: '+918788511027',  // Text this number
            from: '+19312728292', // From a valid Twilio number
            body: msg
        })
        .catch(function(err) {
            console.log(err);
        })
        .then((message) =>{
            console.log(message.sid,message.status);
            // console.log("Message sent")
            callback(message);
        })
      
    }
}


module.exports = Messenger;
