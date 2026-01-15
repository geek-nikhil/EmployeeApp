
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/employee')
  }
}
