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
    


// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   console.log("Request received for login");

//   try {
//     // Sign in with Supabase
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     console.log("Supabase response data:", data);
//         console.log("Supabase response error:", error);

//     if (error) {
//         console.log("error",error)
//       return res.status(400).json({ error: error.message });
//     }

//     const { user } = data;

//     console.log(user,"user")

//     // Fetch the user from MongoDB
//     const dbUser = await User.findOne({ email });

//     if (!dbUser) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Verify password
//     const isMatch = await bcrypt.compare(password, dbUser.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid dd credentials' });
//     }

//     // Store session information
//     req.session.userId = user.id;
//     req.session.username = dbUser.username;
//     req.session.role = dbUser.role;

//     // Save session in MongoDB
//     const userSession = new Session({
//         user: dbUser._id,
//         loginTime: new Date(),
//         ipAddress: req.ip,
//       });
  
//       await userSession.save();
  

//     res.json({ message: 'Logged in successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Request received for login");
  
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
      console.log("Supabase response data:", data);
      console.log("Supabase response error:", error);
  
      if (error) {
        return res.status(400).json({ error: error.message });
      }
  
      const { user } = data;
  
      // Fetch the user from MongoDB
      const dbUser = await User.findOne({ email });
  
      if (!dbUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip

      console.log(ipAddress,"Ip")
  
      const token = data.session.access_token;

      console.log(token,"token issssssssssssssssssssssssss")
  
      req.session.userId = user.id;
      req.session.username = dbUser.username;
      req.session.role = dbUser.role;
  
      // Save session in MongoDB
      const userSession = new Session({
        user: dbUser._id,
        loginTime: new Date(),
        ipAddress: ipAddress,
        token, // Save token for future validation
      });
  
      await userSession.save();
  
      res.json({ message: 'Logged in successfully', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
//   const storeSession = async (req, res) => {
//     const { token } = req.body;

//     console.log("Request received for StoreSession");
//     console.log("Token received:", token); // Log token to ensure it's correct
  
//     try {
//         // Verify token with Supabase
//         const { data, error } = await supabase.auth.getSession(token);

//         console.log("Supabase response data sess:", data);
//         console.log("Supabase response error sess:", error);
  
//         if (error || !data.session) {
//             return res.status(401).json({ error: 'Invalid or expired token' });
//         }
  
//         const { user } = data.session;
  
//         // Create a new session record in MongoDB
//         const newSession = new Session({
//             user: user.id,
//             loginTime: new Date(),
//             token,
//             ipAddress: req.ip,
//         });
  
//         await newSession.save();
  
//         res.json({ message: 'Session stored successfully' });
//     } catch (error) {
//         console.error('Error storing session:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };


const logoutUser = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(500).json({ error: 'Failed to log out from Supabase' });
        }

        // Optionally, remove the session record from MongoDB if needed
        await Session.findOneAndUpdate(
            { token },
            { logoutTime: new Date() }
        );

        res.json({ message: 'User logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
