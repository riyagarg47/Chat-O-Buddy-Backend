const nodeMailer = require('nodemailer');


//nodeMailer.createTestAccount((err, account) => {
let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth:{
        user: 'chatobuddy@gmail.com',
        pass: 'riya123@'
    }
});

let mailOptions = {
    from: 'chatobuddy@gmail.com',
    to: '',
    subject: 'Greetings from Chat-O-Buddy!!',
   // text: 'Welcome the GroupChat Application with node.js and REST API',
    html:""
};
//});
let autoEmail = (reciever, message) =>{

    mailOptions.to = reciever;

    mailOptions.html = message;
    //console.log(mailOptions);

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err);
        }else{
            console.log('Email Sent' + info.response);
        }
    });

}//end autoEmail

module.exports = {
    autoEmail: autoEmail
}
