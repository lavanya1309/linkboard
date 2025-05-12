const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));

const users = [
  {
    email: 'admin@example.com',
    password: bcrypt.hashSync('password123', 10)
  }
];

// Routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`<h1>Welcome, ${req.session.user.email}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { errorMessage: 'Invalid email or password' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// ✅ Chatbot route
app.post('/chat', (req, res) => {
  const message = req.body.message;

  let response;
  if (message.toLowerCase().includes('hello')) {
    response = 'Hi there! How can I help you today?';
  } else if (message.toLowerCase().includes('help')) {
    response = 'Sure! I can help you with login or signup.';
  } else {
    response = `You said: "${message}"`;
  }

  res.json({ response });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
