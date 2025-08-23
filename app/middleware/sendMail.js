 
 import transporter from "../config/mailConfig.js";
 const sendMail = async (receiver, subject, textWithHtml) => {
    try {
        
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: receiver,
            subject: subject,
            html: textWithHtml,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error occurred while sending email:", error);
    }
}


export default sendMail;