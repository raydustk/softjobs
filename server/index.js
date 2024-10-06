import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { registrarUsuario, verificarCredenciales, obtenerUsuarioPorEmail } from './consultas.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(bodyParser.json());

app.listen(3000, console.log('Server ON'));

//ruta para el registro de usuarios
app.post("/usuarios", async (req, res) => {
    try {
        const usuario = req.body;
        await registrarUsuario(usuario);
        res.status(201).send("Usuario creado con éxito");
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

//ruta para el login de usuarios
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        await verificarCredenciales(email, password);
        const token = jwt.sign({ email }, "az_AZ", { expiresIn: '1h' });
        log(token)
        res.status(200).json({ token });
    } catch (error) {
        res.status(error.code || 500).send({ error: error.message });
    }
});

//ruta para obtener datos de un usuario autenticado
app.get("/usuarios", async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, "az_AZ");
        const email = decoded.email;
        const usuario = await obtenerUsuarioPorEmail(email);
        if (!usuario) {
            return res.status(404).send("Usuario no encontrado");
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(401).send("Acceso no autorizado");
    }
});
