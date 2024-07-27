// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Fetch your Supabase URL and Key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
