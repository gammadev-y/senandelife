import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

const ProfilePage = () => {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data)
        }
      }
      fetchProfile()
    }
  }, [session, supabase])

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>You must be logged in to view this page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {profile ? (
        <div>
          <p>
            <strong>Full name:</strong> {profile.full_name}
          </p>
          <p>
            <strong>Avatar URL:</strong> {profile.avatar_url}
          </p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  )
}

export default ProfilePage
