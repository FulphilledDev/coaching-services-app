import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'

function CreateService() {
    const [ geoLocationEnabled, setGeoLocationEnabled ] = useState(true)
    const [ loading, setLoading ] = useState(false)

    const [ formData, setFormData ] = useState({
        // Make category a dropdown menu
        name: "",
        category: "mental-performance",
        inPersonCoaching: false,
        onlineCoaching: false,
        subscription: false,
        subscriptionPrice: 0,
        minCommit: 0,
        yearly: false,
        yearlyPrice: 0,
        avgRating: 3.5,
        businessLocation: "",
		latitude: 0,
		longitude: 0,
        images: {},
    })

    const {
      name,
      category,
      inPersonCoaching,
      onlineCoaching,
      minCommit,
      businessLocation,
      subscription,
      yearly,
      subscriptionPrice,
      yearlyPrice,
      avgRating,
      images,
      latitude,
      longitude,
    } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const isMounted = useRef(true)

    useEffect(() => {
        if(isMounted) {
            onAuthStateChanged(auth, (user) => {
                if(user) {
                    setFormData({...formData, userRef: user.uid})
                } else {
                    navigate('/sign-in')
                }
            })
        }

        return () => {
            isMounted.current = false
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    if(loading) {
        return <Spinner />
    }



  return (
    <div>CreateService</div>
  )
}

export default CreateService