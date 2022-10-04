import { useState, useEffect, useRef } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'


function EditService() {
    const [ geolocationEnabled, setGeolocationEnabled ] = useState(true)
    const [ service, setService ] = useState(null)
    const [ loading, setLoading ] = useState(false)

    const [ formData, setFormData ] = useState({
      // Make category a dropdown menu
      name: "",
      category: "mental-performance",
      inPersonCoaching: false,
      onlineCoaching: false,
      subscription: false,
      subscriptionPrice: 0,
      minCommit: 1,
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
    const params = useParams()
    const isMounted = useRef(true)

    // Redirect if listing is not user's
    useEffect(() => {
        if (service && service.userRef !== auth.currentUser.uid) {
            toast.error('You can not edit that listing')
            navigate('/')
        }
    })

    // Fetch listing to edit
    useEffect(() => {
        setLoading(true)
        const fetchService = async () => {
            const docRef = doc(db, 'coachingServices', params.serviceId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setService(docSnap.data())
                setFormData({ ...docSnap.data(), businessLocation: docSnap.data().businessLocation })
                setLoading(false)
            } else {
                navigate('/')
                toast.error('Service does not exist')
            }
        }

        fetchService()
    }, [params.serviceId, navigate])


    // Sets userRef to logged in user
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

    const onSubmit = async (e) => {
        e.preventDefault()
        //console.log(formData)

        setLoading(true)

        if (yearlyPrice >= subscriptionPrice) {
          setLoading(false)
          toast.error('Yearly price needs to be less than subscription price')
          return
        }

        if (images.length > 1) {
          setLoading(false)
          toast.error('Max 2 images')
          return
        }

        let geolocation = {}
        let location

        if (geolocationEnabled) {
          const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${businessLocation}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
        )

        const data = await response.json()

        geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
        geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

        location =
          data.status === 'ZERO_RESULTS'
            ? undefined
            : data.results[0]?.formatted_address

        if (location === undefined || location.includes('undefined')) {
          setLoading(false)
          toast.error('Please enter a correct address')
          return
        }
      } else {
        geolocation.lat = latitude
        geolocation.lng = longitude
      }

      // Store image in firebase
      const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
          const storage = getStorage()
          const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

          const storageRef = ref(storage, 'images/' + fileName)

          const uploadTask = uploadBytesResumable(storageRef, image)

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              console.log('Upload is ' + progress + '% done')
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused')
                  break
                case 'running':
                  console.log('Upload is running')
                  break
                default:
                  break
              }
            },
            (error) => {
              reject(error)
            },
            () => {
              // Handle successful uploads on complete
              // For instance, get the download URL: https://firebasestorage.googleapis.com/...
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
              })
            }
          )
        })
      }

      // This is storing all downloadUrls into imgUrls
      const imgUrls = await Promise.all(
        [...images].map((image) => storeImage(image))
      ).catch(() => {
        setLoading(false)
        toast.error('Images not uploaded')
        return
      })

      const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      }

      formDataCopy.location = businessLocation
      delete formDataCopy.images
      delete formDataCopy.businessLocation
      !formDataCopy.yearly && delete formDataCopy.yearlyPrice

      // Update Service
      const docRef = doc(db, 'coachingServices', params.serviceId)
      await updateDoc(docRef, formDataCopy)
      setLoading(false)
      toast.success('Service saved')
      navigate(`/category/${formDataCopy.category}/${docRef.id}`)

      // setLoading(false)
    }

    const onMutate = (e) => {
        let boolean = null

    if (e.target.value === 'true') {
        boolean = true
    }
    if (e.target.value === 'false') {
        boolean = false
    }

    // Files
    if (e.target.files) {
        setFormData((prevState) => ({
            ...prevState,
            images: e.target.files,
        }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: boolean ?? e.target.value,
        }))
    }
  }

  if(loading) {
        return <Spinner />
    }


  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Edit a Service</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Category</label>
          <div className='formButtons'>
            <button
              type='button'
              className={ category === 'mental-performance' ? 'formButtonActive' : 'formButton'}
              id='category'
              value='mental-performance'
              onClick={onMutate}
            >
              Mental Performance
            </button>
            <button
              type='button'
              className={ category === 'nutrition' ? 'formButtonActive' : 'formButton'}
              id='category'
              value='nutrition'
              onClick={onMutate}
            >
              Nutrition
            </button>
            <button
              type='button'
              className={ category === 'life-performance' ? 'formButtonActive' : 'formButton'}
              id='category'
              value='life-performance'
              onClick={onMutate}
            >
              Life Performance
            </button>
          </div>

        {/* make this autofill */}
          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='5'
            required
          />

          <label className='formLabel'>In-Person Coaching</label>
          <div className='formButtons'>
            <button
              className={inPersonCoaching ? 'formButtonActive' : 'formButton'}
              type='button'
              id='inPersonCoaching'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !inPersonCoaching && inPersonCoaching !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='inPersonCoaching'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Online Coaching</label>
          <div className='formButtons'>
            <button
              className={onlineCoaching ? 'formButtonActive' : 'formButton'}
              type='button'
              id='onlineCoaching'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !onlineCoaching && onlineCoaching !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='onlineCoaching'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          {/* make this minimum commitment area */}
          {/* <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div> */}


          <label className='formLabel'>Business Location</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='businessLocation'
            value={businessLocation}
            onChange={onMutate}
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Yearly Payments</label>
          <div className='formButtons'>
            <button
              className={yearly ? 'formButtonActive' : 'formButton'}
              type='button'
              id='yearly'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !yearly && yearly !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='yearly'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Subscription Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='subscriptionPrice'
              value={subscriptionPrice}
              onChange={onMutate}
              min='10'
              max='10000'
              required
            />
            {subscription === true && <p className='formPriceText'>$ / Month</p>}
          </div>

          {yearly && (
            <>
              <label className='formLabel'>Yearly Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='yearlyPrice'
                value={yearlyPrice}
                onChange={onMutate}
                min='10'
                max='100000'
                required={yearly}
              />
            </>
          )}

          <label className='formLabel'>Service Image</label>
          <p className='imagesInfo'>
            We suggest using the same Image as your Profile.
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='1'
            accept='.jpg,.png,.jpeg'
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Edit Service
          </button>
        </form>
      </main>
    </div>
  )
}

export default EditService