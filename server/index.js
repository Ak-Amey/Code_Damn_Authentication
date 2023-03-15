// MERN = Mongo + Express + React + Node

// Development = Node.js server + React server

// MEN

// E - Express

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const session = require('express-session');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
  
}))
app.use(express.json())
app.use(session({
	secret: 'secret123',
	resave: false,
	saveUninitialized: false
  }));

mongoose.connect('mongodb://localhost:27017/full-mern-stack-video',{
	newUrlParser:true,
	useUnifiedTopology: true
})

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization;
  
	if (!token) {
	  return res.status(401).json({ message: 'Authentication required' });
	}
  
	try {
	  const decoded = jwt.verify(token, 'secret123');
	  req.user = decoded;
	  next();
	} catch (err) {
	  return res.status(401).json({ message: 'Invalid token' });
	}
  };

app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/api/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return { status: 'error', error: 'Invalid login' }
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})

app.post('/api/logout',async (req, res) => {
	// Clear the user's session and log them out
	req.session.destroy((err) => {
	  if (err) {
		console.error('Failed to destroy session', err);
		res.status(500).json({ error: 'Internal server error' });
	  } else {
		res.clearCookie('sessionID');
		
		res.status(200).json({ message: 'Logged out successfully' });
	  }
	});
  });
  



app.post('/api/quote',verifyToken, async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		await User.updateOne(
			{ email: email },
			{ $set: { quote: req.body.quote } }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.listen(1337, () => {
	console.log('Server started on 1337')
})
