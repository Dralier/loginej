// Armar un sistema de códigos de acceso con diferentes niveles de permisos. Tendremos 2 niveles: código básico es 1 y avanzado es 2.
// JSON de usuarios: 
// const datos = [{"codigo":"damimaster","nivel":2},
// {"codigo":"cocojunior","nivel":1}]
// Usar: Node.js, Express, Express Session y Nunjucks.
// Rutas:
// /
// Tendrá un formulario de acceso (traerlo con Nunjucks) 
// /acceso
// Verificar código y nivel. Mostrar links a página 1 y 2.
// Guardar en variables de sesión código y nivel
// /pagina1 pueden ingresar si están logueados nivel 1 o 2 (mostrar con Nunjucks)
// /pagina2 puede ingresar solo nivel 2 (mostrar con Nunjucks)
// /cerrar para cerrar sesión

const express = require("express");
const nunjucks = require("nunjucks");

const app = express();

session = require("express-session");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(
    session({
        secret:
            process.env.SECRETSESSION || "contraseña-hyper-mega-archi-secreta",
        name: "sessionId",
        proxy: true,
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 1000 },
    })
);

nunjucks.configure("views", {
    autoescape: true,
    express: app,
});

const USERS = [
    {username: "Axel", password: "123", nivel: 1},
    {username: "Asd", password: "456", nivel: 0},
    {username: "Juan", password: "789", nivel: 2},
]; 

const DATOS = [
    { codigo: "damimaster", nivel: 2 },
    { codigo: "cocojunior", nivel: 1 },
    { codigo: "pasante", nivel: 0 },
];


const level1Validator = function (req, res, next){
    if(req.session.rol && req.session.rol.nivel >= 1){
        return next();
    }
    else{
        return res.status(401).send("<h1>No tenes Permiso de acceso a esta ruta.</h1><p><a href='/login'>Regresar al login</a></p>");
    }
}

const level2Validator = function (req, res, next){
    if(req.session.rol && req.session.rol.nivel >= 2){
        return next();
    }
    else{
        return res.status(401).send("<h1>No tenes Permiso de acceso a esta ruta.</h1><p><a href='/login'>Regresar al login</a></p>");
    }
}

app.get("/", async function (req, res) {
    res.status(200).render("formulario.html");
});
app.all("/login", async function (req, res) {
    
   
    
    if (!req.body.user || !req.body.pass) {
        res.send("Login failed");
        return;
    }

    const user = USERS.find(x=> x.username.toLowerCase() === req.body.user.toLowerCase());
    if(!user || (user && user.password.trim() !== req.body.pass.trim())){
        res.send("Invalid Credentials, <p><a href='/'>Regresar al login</a></p>");
        return;
    }
   
    //si llegamos hasta aca.. el login el valido..

    req.session.user = user.username;
    req.session.rol = DATOS.find(x=> x.nivel === user.nivel);

    res.status(200).render("home.html",{
        rol: req.session.rol
    })
});
app.get("/pagina1", level1Validator, async function (req, res) {
    res.status(200).render("pagina1.html");
});

app.get("/pagina2", level2Validator, async function (req, res) {
    res.status(200).render("pagina2.html");
});
app.get("/cerrar", async function (req, res) {
    req.session.destroy();
    res.send("Sesión cerrada!");
});
app.listen(8080);
