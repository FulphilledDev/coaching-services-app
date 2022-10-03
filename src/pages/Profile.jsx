import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import clipboard2Fill from '../assets/svg/clipboard2Fill.svg'

function Profile() {
  const auth = getAuth()
  // setting changeDetails to false means we DONT want to change anything, YET.
  const [ changeDetails, setChangeDetails ] = useState(false)

  const [ formData, setFormData ] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  // useEffect(() => {
  //   console.log(auth.currentUser)
  // }, [])

  const navigate = useNavigate()

  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }

  const onSubmit = async () => {

    try {
      if(auth.currentUser.displayName !== name) {
        // Update Display Name in Firebase
        // (Add update email in firebase)
        await updateProfile(auth.currentUser, {
          displayName: name
        })

        // Update a document in Firestore
        // (Add email)
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          name,
        })
      }
    } catch (error) {
      toast.error('Failed to Update Profile Details')
    }
  }

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  return (
    <div>
      <header className="profileHeader">
          <p className="pageHeader">My Profile</p>
          <button 
            type='button' 
            className="logOut"
            onClick={onLogout}
          >
            Logout
          </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p className="changePersonalDetails" onClick={() => {
            changeDetails && onSubmit()
            setChangeDetails((prevState) => !prevState)
          }}>
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className="profileCard">
          <form>
            <input 
              type="text" 
              id="name" 
              value={name}
              className={!changeDetails ? 'profileName' : 'profileNameActive'} 
              disabled={!changeDetails}
              onChange={onChange}
            />
            <input 
              type="text" 
              id="email" 
              value={email}
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} 
              disabled={!changeDetails}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to='/create-service' className='createListing'>
          <img src={clipboard2Fill} alt="pen and paper" />
          <p>Create a New Service</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>
      </main>
    </div>
  )
}

export default Profile