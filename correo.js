// Importación de dependencias
const nodemailer = require('nodemailer');
// Transporter para configurar el corro y credenciales 
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'desafio.test.2022@gmail.com', //'chileinfoclub@gmail.com',
        pass: 'desafio@test', //'2022@infoclub',
    },
});

const send = async (email, nombre) => {
    let mailOptions = {
        from: 'desafio.test.2022@gmail.com', //'chileinfoclub@gmail.comm',
        to: [email],
        subject: `¡Saludos desde la NASA!`,
        html: `<h3> ¡Hola!, ${nombre} <br> La NASA te da las gracias por subir tu foto en nuestro sistema y colaborar con nuestras investigaciones </h3>`,
    };
    await transporter.sendMail(mailOptions)
};

module.exports = send;