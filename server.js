const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// In-memory user store (temporary)
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

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// ROUTES

// Home - requires login
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { email: req.session.user });
});

// Signup - form
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Signup - logic
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.send('User already exists. Please <a href="/login">login</a>.');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  res.redirect('/login');
});

// Login - form
app.get('/login', (req, res) => {
  res.render('login');
});

// Login - logic
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = email;
    res.redirect('/');
  } else {
    res.send('Invalid email or password. Please <a href="/login">try again</a>.');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Room route
app.get('/room/:roomId', isAuthenticated, (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

// Socket.IO for video conferencing
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

// Start server
server.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:3000');
});
