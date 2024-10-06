import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'softjobs',
  allowExitOnIdle: true
});

const registrarUsuario = async (usuario) => {
  const { email, password, rol, lenguage } = usuario;
  const salt = bcrypt.genSaltSync(10);
  const passwordEncriptada = bcrypt.hashSync(password, salt);
  const values = [email, passwordEncriptada, rol, lenguage];
  const consulta = 'INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)';
  await pool.query(consulta, values);
};

const verificarCredenciales = async (email, password) => {
  const consulta = 'SELECT password FROM usuarios WHERE email = $1';
  const { rows } = await pool.query(consulta, [email]);
  if (rows.length === 0) throw { code: 401, message: 'Email o contraseña incorrecta' };
  const { password: passwordEncriptada } = rows[0];
  const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada);
  if (!passwordEsCorrecta) throw { code: 401, message: 'Email o contraseña incorrecta' };
};

const obtenerUsuarioPorEmail = async (email) => {
  const consulta = 'SELECT * FROM usuarios WHERE email = $1';
  const { rows } = await pool.query(consulta, [email]);
  return rows[0];
};

export { verificarCredenciales, registrarUsuario, obtenerUsuarioPorEmail };