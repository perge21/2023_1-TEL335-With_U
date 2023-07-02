const Koa = require("koa");
const Router = require("koa-router");
const mongoose = require("mongoose");
const bodyParser = require("koa-bodyparser");
const static = require('koa-static');
const render = require('koa-ejs');
const session = require('koa-session');
const path = require('path');


// Crea una nueva aplicación de Koa
const app = new Koa();
const router = new Router();

// Configurar Koa-EJS
render(app, {
  root: path.join(__dirname, 'public'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false,
});

// Define la ruta para servir archivos estáticos
const staticPath = path.join(__dirname, 'public');

// Configuración de la sesión
app.keys = ['clave-secreta']; // Clave secreta para firmar las cookies de sesión
app.use(session(app));

// Conéctate a la base de datos de MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/with_u", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conexión exitosa a MongoDB"))
  .catch((err) => console.error("Error al conectarse a MongoDB:", err));

const db = mongoose.connection;
const users_c = db.collection("users");

// Define el esquema del modelo
const userSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  notificacion: String,
});

// Crea el modelo de usuarios
app.use(bodyParser());

// Página de inicio personalizada
router.get('/home', async (ctx) => {
  const userName = ctx.session.userName || 'anónimo';
  const notificacion = ctx.session.notificacion || 'indefinido';

  await ctx.render('home', { name: userName, notificacion: notificacion });
});



// Agrega un usuario
router.post("/a_registro", async (ctx, next) => {
  // Extrae los datos del cuerpo de la solicitud
  const { nombre, edad, notificacion } = ctx.request.body;

  // Crea un nuevo usuario con los datos proporcionados
  try {
    // Guarda el usuario en la base de datos mediante insert
    const result = users_c.insertOne({
      nombre: nombre,
      edad: edad,
      notificacion: notificacion,
    });
    ctx.status = 201;
    ctx.redirect('/login');
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { error: err.message };
  }
});


router.get("/users", async (ctx) => {
  try {
    const users = await users_c.find().toArray();
    ctx.body = users;
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', async (ctx) => {
  await ctx.render('login', { invalidUser: false });
});

router.get('/perfil', async (ctx) => {
  const userName = ctx.session.userName || 'anónimo';
  const edad = ctx.session.edad || 18;
  const notificacion = ctx.session.notificacion || 'indefinido';
  await ctx.render('perfil', { name: userName, notificacion: notificacion, edad: edad, invalidUser: false });
});

router.get('/respiracion', async (ctx) => {
  const userName = ctx.session.userName || 'anónimo';
  const notificacion = ctx.session.notificacion || 'indefinido';

  await ctx.render('respiracion', { name: userName, notificacion: notificacion });
});

router.get('/registro', async (ctx) => {
  const userName = ctx.session.userName || 'anónimo';
  const notificacion = ctx.session.notificacion || 'indefinido';

  await ctx.render('registro', { name: userName, notificacion: notificacion });
});

router.post('/login', async (ctx) => {
  const { username } = ctx.request.body;

  try {
    const user = await users_c.findOne({ nombre: username });

    if (user) {
      ctx.session.userName = username;
      ctx.session.edad = user.edad;
      ctx.session.notificacion = user.notificacion;
      ctx.redirect('/home'); // Redireccionar al home después de iniciar sesión
    } else {
      await ctx.render('login', { invalidUser: true });
    }
  } catch (error) {
    console.error(error);
    ctx.redirect('/login'); // Redireccionar de vuelta al formulario de inicio de sesión
  }
});


router.get('/logout', async (ctx) => {
  // Limpiar la sesión actual
  ctx.session = null;

  // Redirigir a la página de inicio de sesión u otra página
  ctx.redirect('/home');
});


router.get("/", async (ctx) => {
  try {
    

  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});
app.use(static(staticPath));
// Agrega las rutas al enrutador de Koa
app.use(router.routes()).use(router.allowedMethods());

// Inicia la aplicación en el puerto 3000
app.listen(3000, () =>
  console.log("La aplicación está corriendo en el puerto 3000")
);
