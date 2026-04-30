import { createClient } from '@supabase/supabase-js'

// Tu URL real
const supabaseUrl = 'https://yiujdwitgkzttzsvxvtg.supabase.co'

// Tu clave que me acabas de pasar
const supabaseAnonKey = 'sb_publishable_eOsYC8MnLYZtRjp-3_NlPQ_n76Dncix'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)