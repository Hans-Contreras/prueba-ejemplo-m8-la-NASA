//Importación de dependencias
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload")
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "Shhhh";
const PORT = 3000;

const { nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario } = require('./consultas');
const send = require('./correo');

// Conexión al servidor
app.listen(PORT, () => console.log(`Server ON, PORT ${PORT}`));

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: 'El tamaño de la imagen supera el limite permitido',
    })
);

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.engine(
    'handlebars',
    exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);

app.set('view engine', 'handlebars');

// Disponibiliza ruta raiz
app.get('/', (req, res) => {
    res.render('Home')
});

// Disponibiliza ruta para agregar usuario
app.post('/usuarios', async (req, res) => {
    const { email, nombre, password } = req.body;
    try {
        const usuario = await nuevoUsuario(email, nombre, password);
        res.status(201).send(usuario);
    } catch (error) {
        res.status(500).send({
            error: `Algo salió mal... ${error}`,
            code: 500,
        })
    }
});

// Disponibiliza ruta ver estado de usuario
app.put('/usuarios', async (req, res) => {
    const { id, auth } = req.body;
    try {
        const usuario = await setUsuarioStatus(id, auth);
        res.status(200).send(usuario);
    } catch (error) {
        res.status(500).send({
            error: `Algo salió mal...${error}`,
            code: 500,
        })
    }
});


// Disponibiliza ruta admin para habilitar o deshabilitar permisos de usuario 
app.get('/Admin', async (req, res) => {

    try {
        const usuarios = await getUsuarios();
        res.render('Admin', { usuarios });
    } catch (error) {
        res.status(500).send({
            error: `Algo salió mal... ${error}`,
            code: 500,
        })
    }
});

// Disponibiliza ruta para inicio de sesión
app.get('/Login', (req, res) => {
    res.render('Login');
});

// Disponibiliza ruta para verificación de usuarios
app.post('/verify', async (req, res) => {
    const { email, password } = req.body;
    const user = await getUsuario(email, password);
    if (user) {
        if (user.auth) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 180,  
                    data: user,
                },
                secretKey
            );
            res.send(token);
        } else {
            res.status(401).send({
                error: 'Este usuario aún no ha sido validado para subir imágenes',
                code: 401,
            });
        }
    } else {
        res.status(404).send({
            error: 'Este usuario aún no esta registrado en la base de datos',
            code: 404,
        });
    }
});


// Disponibiliza ruta para autorización de usuarios
app.get('/Evidencias', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => { 
        const { data } = decoded
        const { nombre, email } = data
        err
            ? res.status(401).send(
                res.send({
                    error: '401 Unauthorized',
                    messeage: 'Usted no está autorizado para esta aquí',
                    token_error: err.message,
                })
            )       
            : res.render('Evidencias', { nombre, email });

    });
});


// Disponibiliza ruta upload para cargar archivo y generar correo de notificación
app.post('/upload', (req, res) => {
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No se encontró ningún archivo en la consulta');
    }
    const { files } = req
    const { foto } = files;
    const { name } = foto;
    const { email, nombre } = req.body
    console.log(req.body)
    console.log(nombre);
    console.log(email);
    foto.mv(`${__dirname}/public/uploads/${name}.jpg`, async (err) => {
        if (err) return res.status(500).send({
            error: `Algo salió mal... ${err}`,
            code: 500,
        })
        await send(email, nombre)
        res.send(`Foto cargada con éxito\n <a href="/login"> <p> Ir a Login </p> </a>
        \n <a href="/"> <p> Ir a la página de Inicio </p> </a>`);
    });
});

