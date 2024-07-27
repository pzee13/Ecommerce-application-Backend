const supabase = require('../config/supabaseClient');
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const Session = require('../models/SessionModel');
const { Error } = require('mongoose');


// const registerUser = async (req, res) => {
//     console.log("Request received for registration");

//     const { email, password, username } = req.body;
//     console.log("Request body:", { email, password, username });
//     const userEmail = email;
//     const userPassword = password;

//     // Validate Password
//     if (userPassword.length < 6) {
//         console.log("err")
//         return res.status(400).json({ error: 'Password must be at least 6 characters long.' });

        
//     }

//     try {
//         // Sign up the user with Supabase
//         const { data, error: supabaseError } =await supabase.auth.signUp({
//             email: userEmail,
//             password: userPassword,
//           })

//         console.log("Supabase response data:", data);
//         console.log("Supabase response error:", supabaseError);

//         if (supabaseError) {
//             // Handle Supabase rate limit error
//             if (supabaseError.code === 'over_email_send_rate_limit') {
//                 return res.status(429).json({ error: 'Too many registration attempts, please try again later.' });
//             }
//             return res.status(400).json({ error: supabaseError.message });
//         }

//         // Hash the password for local storage
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         // Create a new user document in your database
//         const newUser = new User({
//             username,
//             email,
//             password: hashedPassword, // Store the hashed password
//             supabaseId: data.user.id,  // Store the Supabase user ID
//         });

//         await newUser.save();

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         console.error('Server error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };
  

const registerUser = async (req, res) => {
    console.log("Request received for registration");

    const { email, password, username } = req.body;
    console.log("Request body:", { email, password, username });

    const userEmail = email;
    const userPassword = password;

    // Validate the email and password
    if (!userEmail || !userPassword || !username) {
        return res.status(400).json({ error: 'Email, password, and username are required.' });
    }

    if (userPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        // Sign up the user with Supabase
        const { data, error: supabaseError } = await supabase.auth.signUp({
            email: userEmail,
            password: userPassword,
        });

        console.log("Supabase response data:", data);
        console.log("Supabase response error:", supabaseError);

        // Check for Supabase sign-up errors
        if (supabaseError) {
            // Handle Supabase-specific errors
            if (supabaseError.status === 400 && supabaseError.message.includes('User already registered')) {
                return res.status(400).json({ error: 'User already registered with this email.' });
            }

            if (supabaseError.code === 'over_email_send_rate_limit') {
                return res.status(429).json({ error: 'Too many registration attempts, please try again later.' });
            }

            return res.status(400).json({ error: supabaseError.message });
        }

        // Check if user creation was successful
        if (!data || !data.user) {
            return res.status(500).json({ error: 'Failed to create user in Supabase.' });
        }

        // Hash the password for local storage
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

        // Create a new user document in your MongoDB database
        const newUser = new User({
            username,
            email: userEmail,
            password: hashedPassword, // Store the hashed password
            supabaseId: data.user.id,  // Store the Supabase user ID
        });

        await newUser.save();

        // Optionally create a session if needed
        // await Session.create({ userId: newUser._id, sessionData: { /* session details */ } });

        res.status(201).json({ message: 'User registered successfully. Please verify your email to log in.' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
    


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Request received for login");

  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.log("error",error)
      return res.status(400).json({ error: error.message });
    }

    const { user } = data;

    console.log(user,"user")

    // Fetch the user from MongoDB
    const dbUser = await User.findOne({ email });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid dd credentials' });
    }

    // Store session information
    req.session.userId = user.id;
    req.session.username = dbUser.username;
    req.session.role = dbUser.role;

    // Save session in MongoDB
    const userSession = new Session({
        user: user._id,
        loginTime: new Date(),
        ipAddress: req.ip,
      });
  
      await userSession.save();
  

    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const logoutUser = async (req, res) => {
    const { userId } = req.session;
  
    try {
      // Update the session with logout time
      await Session.findOneAndUpdate(
        { user: userId, logoutTime: null },
        { logoutTime: new Date() }
      );
  
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Could not log out user' });
        }
  
        res.json({ message: 'User logged out successfully' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};