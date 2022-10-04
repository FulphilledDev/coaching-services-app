import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ServiceItem from '../components/ServiceItem'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import clipboard2Fill from '../assets/svg/clipboard2Fill.svg'

function Profile() {
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState(null)

  // setting changeDetails to false means we DONT want to change anything, YET.
  const [ changeDetails, setChangeDetails ] = useState(false)

  const [ formData, setFormData ] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  useEffect(() => {
      const fetchUserServices = async () => {
          const servicesRef = collection(db, 'coachingServices')

          const q = query(
              servicesRef,
              where('userRef', '==', auth.currentUser.uid),
              orderBy('timestamp', 'desc')
          )

          const querySnap = await getDocs(q)

          let services = []

          querySnap.forEach((doc) => {
              return services.push({
                  id: doc.id,
                  data: doc.data(),
              })
          })

          setServices(services)
          setLoading(false)
          console.log(services)
      }

      fetchUserServices()
  }, [auth.currentUser.uid])

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

  const onDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      // Can edit this 'await' by referencing section 16 video 110 @ 10:30
      await deleteDoc(doc(db, 'coachingServices', serviceId))
      const updatedServices = services.filter(
        (service) => service.id !== serviceId
      )
      setServices(updatedServices)
      toast.success('Successfully deleted service')
    }
  }

  const onEdit = (serviceId) => navigate(`/edit-service/${serviceId}`)

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

        {!loading && services?.length > 0 && (
            <>
                <p className='listingText'>Your Services</p>
                <ul className='listingsList'>
                    {services.map((service) => (
                        <ServiceItem
                            key={service.id}
                            service={service.data}
                            id={service.id}
                            onDelete={() => onDelete(service.id)}
                            onEdit={() => onEdit(service.id)}
                        />
                    ))}
                </ul>
            </>
        )}
      </main>
    </div>
  )
}

export default Profile