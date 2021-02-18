import Mailer from "nodemailer"


async function sendEmail(emailData) {
   const SMTP = process.env.EMAIL_SMTP;

   const SENDER = Mailer.createTransport({
      host: SMTP,
      port: 465,
      secure: true,
      auth: {
         user: process.env.EMAIL_SENDER,
         pass: process.env.EMAIL_SENDER_PASSWORD
      },
      tls: {
         ignoreTLS: true
      }
   });

   const RECEIVER = {
      from: process.env.EMAIL_SENDER,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html
   };

   SENDER.sendMail(RECEIVER, function (error) {
      if (error) {
         console.log(error);
      } else {
         console.log("Email enviado com sucesso");
      }
   });

   await SENDER.verify(function (err, success) {
      console.log({ err, success });
   })
}

function validateEmail(props) {
   let email = sendEmail({
      to: props.to,
      subject: "KnightsRPG || Account validation",
      text: `${process.env.FRONT_END_LINK + props.token}`,
      html: `
         <h1>KnightsRPG</h1>
         <p>Account created! You can now validate your e-mail <a href="${process.env.FRONT_END_LINK + props.token}">here</a>
         <hr />
         <p><small><a href="${process.env.FRONT_END_LINK}">KnightsRPG</a></small></p>
      `
   })

   return email;
}

export default validateEmail;
export { sendEmail };
