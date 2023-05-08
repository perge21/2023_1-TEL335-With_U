const Koa = require("koa");
const Router = require("koa-router");
const mongoose = require("mongoose");
const bodyParser = require("koa-bodyparser");

// Crea una nueva aplicación de Koa
const app = new Koa();
const router = new Router();

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
const User = mongoose.model("User", userSchema);
app.use(bodyParser());

// Agrega un usuario
router.post("/usuarios", async (ctx, next) => {
  // Extrae los datos del cuerpo de la solicitud
  const { nombre, edad, notificacion } = ctx.request.body;

  // Crea un nuevo usuario con los datos proporcionados

  try {
    // Guarda el usuario en la base de datos
    const result = users_c.insertOne({
      nombre: nombre,
      edad: edad,
      notificacion: notificacion,
    });
    ctx.status = 201;
    ctx.body = `Usuario insertado con éxito con el id ${result.insertedId}`;
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

router.get("/", async (ctx) => {
  try {
    ctx.body = "¡Hola, Mundo!";
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: err.message };
  }
});

// Agrega las rutas al enrutador de Koa
app.use(router.routes()).use(router.allowedMethods());

// Inicia la aplicación en el puerto 3000
app.listen(3000, () =>
  console.log("La aplicación está corriendo en el puerto 3000")
);
