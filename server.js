const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'linkboard_secret_key', // You should change this to a more secure key in production
  resave: false,
  saveUninitialized: false,
}));

// In-memory "database" for simplicity (replace with real database in production)
let users = [];

// View Engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Route for Home page (only accessible after login)
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { email: req.session.user });
});

// Route for Login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Route for Login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = email; // Store user info in session
    console.log('Session created for:', req.session.user);  // Debugging line
    res.redirect('/');  // Redirect to home page
  } else {
    res.send('Invalid email or password. Please <a href="/login">try again</a>.');
  }
});

// Route for Signup page
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Route for Signup form submission
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password
  
  users.push({ email, password: hashedPassword }); // Store the user in the "database"
  
  res.send('User registered successfully. <a href="/login">Login</a>');
});

// Route for Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
