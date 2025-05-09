const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// In-memory user store (for demo purposes; use a DB in production)
const users = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'linkboard_secret_key',
  resave: false,
  saveUninitialized: false,
}));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// Routes

app.get('/', isAuthenticated, (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.send('User already exists. Please <a href="/login">login</a>.');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username;
    res.redirect('/');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/room/:roomId', isAuthenticated, (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

// Socket.IO logic (if needed)
io.on('connection', socket => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
