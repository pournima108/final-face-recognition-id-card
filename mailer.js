const nodemailer = require('nodemailer');

class Mailer{

    constructor(){

        console.log("INITIALIZING MAILING SERVICE");

    }

    Sendmail(receivers,ccReceivers){


        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });


        let mailOptions = {
            from: '"SELF SERVICE" <htlp002@gmail.com>', // sender address for TELE2
            to: receivers, // list of receivers for TELE2
            subject: 'TEMPORARY ID', // Subject line for TELE2
            cc:ccReceivers,
            
            html: 'TEST MAIL',
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            console.log(error);
            }else{
                console.log('Message %s sent: %s', info.messageId, info.response);
            }
        });
          

    }

}

module.exports = Mailer;

// new Mailer().Sendmail(["abhishekda@hexaware.com","lohitkumarB@hexaware.com"],["pourabk@hexaware.com"]);