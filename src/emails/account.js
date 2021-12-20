const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//Sending an email on new user creation
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ankur@codelogicx.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}. Let me know how you get along with the app.`
    })

}

//Sending an email on deleting an user
const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ankur@codelogicx.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}. Thank you for using the app.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
