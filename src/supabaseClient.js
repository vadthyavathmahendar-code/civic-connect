import { createClient } from '@supabase/supabase-js'

// Replace these with your actual details from the Supabase Dashboard
const supabaseUrl = 'https://twofkoqxtievknvamvgb.supabase.co'
const supabaseKey = 'sb_publishable_FaaDJGr_1Tt8QwB0FFXyGA_T_2O-lrX'

export const supabase = createClient(supabaseUrl, supabaseKey)