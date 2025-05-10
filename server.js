const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if using HTTPS
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Sample user data
const users = [
  { email: 'soma@example.com', password: 'password123' }
];

// Simulated chatbot responses
const chatbotResponses = {
  "hi": "Hello! How can I assist you today?",
  "what is your good name": "What is your good name?",
  "soma": "Hi Soma, can you send your email id?",
  "default": "Sorry, I didn't understand that. Can you please rephrase?"
};

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.ejs'));
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = user;
    return res.redirect('/dashboard');
  } else {
    return res.render('login.ejs', { errorMessage: 'Invalid email or password!' });
  }
});

// Serve the dashboard page after successful login
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'dashboard.html')); // Change to your actual dashboard file
});

// Handle the chatbot message requests
app.post('/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const sessionId = req.body.sessionId;

  // Choose a response based on the user's message
  let response = chatbotResponses[userMessage] || chatbotResponses['default'];

  // Send the response back to the client
  res.json({ response: response });
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
