// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async options =>{

    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        secure:false,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD,
        }
    });

    //Define email options 
    const mailOptions={
        from:'Tanishq Salkar <tanishqsalkar@getMaxListeners.com>',
        to: options.email,
        subject:options.subject,
        text:options.message
    };

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
