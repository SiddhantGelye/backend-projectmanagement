import Mailgen from "mailgen";

const emailVerificationMailGenContent = async(username, verificationURL)=>{
    return {
        body:{
            name : username,
            intro : "Welcome to our app we are exited to have you on board",
            action : {
                instructions:"To verify your email please click the button below",
                button: {
                    color : "#aaa",
                    text : " Verify My Account",
                    link: verificationURL
                }
            } ,
            outro: "Need Help or questions ?  Just reply to this email we'd love to help"
        }
    }

}

const forgotPasswordMailGenContent = async(username, passwordChangeURL)=>{
    return {
        body:{
            name : username,
            intro : "Password change request",
            action : {
                instructions:"To reset the password , please click the button below.",
                button: {
                    color : "#22bc66",
                    text : " Reset Password",
                    link: passwordChangeURL
                }
            } ,
            outro: "Need Help or questions ?  Just reply to this email we'd love to help"
        }
    }

}


const sendEmail = async(options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options?.mailgenContent);

    const emailHTML = mailGenerator.generate(options?.mailgenContent);
    
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email,
        subject : options.subject,
        text: emailTextual,
        html: emailHTML
    }
    
    try{
        await transporter.sendMail(mail)
    }
    catch(err){
        console.error("Email sending service failed")
        console.error("Error", err)
    }
}

export { emailVerificationMailGenContent,
         forgotPasswordMailGenContent, 
         sendEmail
       }