import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project URL and Anon/Public Key from your Supabase dashboard
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://zyjtgzvyyoiaeygyayxu.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "sb_publishable_V0le8_X9iItkJErzas45CQ_ynn7bcOc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);