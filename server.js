const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // For parsing JSON requests

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
  res.render('login', { errorMessage: null });
});

// Route for Login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = email; // Store user info in session
    res.redirect('/');  // Redirect to home page
  } else {
    res.render('login', { errorMessage: 'Invalid email or password. Please try again.' });
  }
});

// Route for Signup page
app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: null });
});

// Route for Signup form submission
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const userExists = users.find(u => u.email === email);
  
  if (userExists) {
    res.render('signup', { errorMessage: 'Email already exists. Please choose another one.' });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password
    users.push({ email, password: hashedPassword }); // Store the user in the "database"
    res.redirect('/login');  // Redirect to login page after successful signup
  }
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

// Route for Chatbot (Chat interaction)
app.get('/chatbot', isAuthenticated, (req, res) => {
  res.render('chatbot', { email: req.session.user });
});

// Chatbot response route (Simple rule-based chatbot)
app.post('/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  let botResponse = '';

  // Simple rule-based responses
  if (userMessage.includes('hello')) {
    botResponse = 'Hello! How can I assist you today?';
  } else if (userMessage.includes('bye')) {
    botResponse = 'Goodbye! Have a great day!';
  } else if (userMessage.includes('help')) {
    botResponse = 'Sure! How can I help you? You can ask me about the application or meetings.';
  } else {
    botResponse = 'Sorry, I didn\'t understand that. Can you rephrase?';
  }

  res.json({ response: botResponse });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
