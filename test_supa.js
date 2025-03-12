import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ulwqfzndiaomknuczazo.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsd3Fmem5kaWFvbWtudWN6YXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzE1NzQsImV4cCI6MjA1NzIwNzU3NH0.qPchQbv8RVdy_SF3ZBIcjXY8Si3m9XkpouirKAIla7Y'

export const supabase = createClient(supabaseUrl, supabaseKey)

const { data, error } = await supabase.from('puzzles').select('count')
console.log('Data:', data)
console.log('Error:', error)
