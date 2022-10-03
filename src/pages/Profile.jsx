import { useState, useEffect } from 'react'
import { getAuth } from 'firebase/auth'

function Profile() {
  const auth = getAuth()

  const [ formData, setFormData ] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  useEffect(() => {
    console.log(auth.currentUser)
  }, [])

  return (
    <h1>{name}</h1>
  )
}

export default Profile