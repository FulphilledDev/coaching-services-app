import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { 
    getDoc, 
    doc,
    updateDoc,
    addDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    limit , 
    startAfter,
    serverTimestamp 
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import { FaCheck } from 'react-icons/fa'
import { FaShareAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
// import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
// import starIcon from '../assets/svg/starIcon.svg'
import starHalfIcon from '../assets/svg/starHalfIcon.svg'
import starFillIcon from '../assets/svg/starFillIcon.svg'

function Service() {
    const [service, setService] = useState(null)
    // const [ lastFetchedReview, setLastFetchedReview ] = useState(null)
    const [ toggle, setToggle ] = useState('closed')
    const [ className, setClassName ] = useState('primaryButton')
    

    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const auth = getAuth()
    const navigate = useNavigate()
    const params = useParams()
    // const isMounted = useRef(true)
    

    ///////////////////////

    // review Data structure

    ///////////////////////
    const [ reviewData, setReviewData ] = useState({
        name: "",
        onlineCoaching: false,
        inPersonCoaching: false,
        yearly: false,
        subscription: false,
        monthsWorkedWith: 0,
        rating: 0,
        message: ""
    })

    const {
        name,
        onlineCoaching,
        inPersonCoaching,
        yearly, 
        subscription,
        monthsWorkedWith,
        rating,
        message
    } = reviewData

    ///////////////////////////////

    // Set service to view by "serviceId"

    ////////////////////////////////
    useEffect(() => {
        const fetchService = async () => {
            const docRef = doc(db, 'coachingServices', params.serviceId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                console.log(docSnap.data())
                setService( docSnap.data())
                setLoading(false)
            }
        }

        fetchService()
    }, [navigate, params.serviceId])


    /////////////////////////////////

    // Get all reviews for serviceId

    ////////////////////////////////

    //////////////////////////

    // Fetch More Reviews
    // (Pagination / Load More)

    ///////////////////////////

    /////////////////////////////////
    // Pop up error if current user is trying to leave a comment on own service
    /////////////////////////////////
    const onToggle = () => {
        if ((toggle === 'closed') && (className === 'primaryButton')) {
            setToggle('open')
            setClassName('reviewActiveButton')
        } else {
            setToggle('closed')
            setClassName('primaryButton')
        }
    }

    const yearlyToggle = () => {
        if (reviewData.yearly === false) {
            setReviewData({...reviewData,
            yearly: true})
        } else {
            setReviewData({...reviewData,
            yearly: false})
        }
    }

    const subscriptionToggle = () => {
        if (reviewData.subscription === false) {
            setReviewData({...reviewData,
            subscription: true})
        } else {
            setReviewData({...reviewData,
            subscription: false})
        }
    }

    const inPersonToggle = () => {
        if (reviewData.inPersonCoaching === false) {
            setReviewData({...reviewData,
            inPersonCoaching: true})
        } else {
            setReviewData({...reviewData,
            inPersonCoaching: false})
        }
    }

    const onlineToggle = () => {
        if (reviewData.onlineCoaching === false) {
            setReviewData({...reviewData,
            onlineCoaching: true})
        } else {
            setReviewData({...reviewData,
            onlineCoaching: false})
        }
    }

    const onChange = (e) => setReviewData(e.target.value)

    /////////////////////////////////

    // On Submit

    //////////////////////////////////

    const onSubmit = async (e) => {
        e.preventDefault()
        //console.log(formData)

        setLoading(true)

        // Must enter name and email 
        if (!name && !rating) {
          setLoading(false)
          toast.error('Please enter your name and email')
          return
        }

        // Make sure yearly price is more than subscription price
        if (!yearly && !subscription) {
          setLoading(false)
          toast.error('Please select one payment type.')
          return
        }

        if (yearly && subscription) {
          setLoading(false)
          toast.error('Please select one payment type.')
          return
        }

        // Must select inPerson or Online Coaching
        if (!inPersonCoaching && !onlineCoaching) {
          setLoading(false)
          toast.error('Must select either Online or In Person Coaching')
          return
        }


        const setService = {
        ...service,
        reviewData,
        timestamp: serverTimestamp(),
        }

        delete setService.images
        delete setService.businessLocation
        !setService.location && delete setService.location
        !setService.yearly && delete setService.yearlyPrice
        !setService.subscription && delete setService.subscriptionPrice

        const docRef = await addDoc(collection(db, 'coachingServices'), reviewData)
        setLoading(false)
        toast.success('Rating saved')
        navigate(`/category/${reviewData.category}/${docRef.id}`)

        // setLoading(false)
    }

    //////////////////////////////////

    // On Mutate

    //////////////////////////////////

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
      setService((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setService((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }))
    }

  }

    //////////////////////

    // Spinner

    //////////////////////

    if(loading) {
        return <Spinner />
    }

    return (
        <>
        <li className='categoryListing'>
            <div
                className='shareIconDiv'
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setShareLinkCopied(true)
                    setTimeout(() => {
                        setShareLinkCopied(false)
                    }, 2000)
                }}
            >
                <FaShareAlt />
            </div>

            {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}
        
            <img src={service.imgUrls[0]} alt={service.name} className='categoryListingImg' />
            <div className='categoryListingDetails'>
                <p className="categoryListingName">
                     {service.name ? service.name : <></> }
                </p>
                <p className='categoryListingPrice'> 
                    {service.yearly 
                        ? service.yearlyPrice
                            .toString()
                            .padStart(service.yearlyPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Year')
                        : <></> }
                    {service.yearly && service.subscription ? ' or ' : <></>}
                    {service.subscription 
                        ? service.subscriptionPrice
                            .toString()
                            .padStart(service.subscriptionPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Month')
                        : <></> }
                </p>
                <p className='listingType'>
                    {service.category}
                </p>
                {service.yearly && (
                <p className='discountPrice'>
                    Save ${((service.subscriptionPrice)*12) - service.yearlyPrice} / Year
                </p>
                )}
                <ul className='listingDetailsList'>
                    <li>
                        {service.minCommit >= 1
                            ? `${service.minCommit} Month Minimum Commitment`
                            : '1 Month Commitment'}
                        {service.minCommit === 0
                            ? 'No Commitments'
                            : <></>}
                    </li>
                    <li>{service.inPersonCoaching && 
                        <><FaCheck 
                            className='listingDetailsFaCheck'/> In Person Coaching Available
                        </>}
                    </li>
                    <li>{service.onlineCoaching && 
                        <><FaCheck 
                            className='listingDetailsFaCheck'/> Online Coaching Available
                        </>}
                    </li>
                </ul>
            </div>
        </li>

        { !service.email 
            ? <></> 
            : <>
                <p className="serviceListingLocation">Information</p>
                <p className="categoryListingAddress">
                    {service.email}
                </p>
                </>
            }
        
        <br />


        { !service.location ? (<p className="categoryListingAddress"> No business location available. Provides stricly online coaching</p>) : <></>}
        <br />

        { service.location && (
            <>
            <p className="serviceListingLocation">Business Location</p>
            <p className="categoryListingAddress">
                {service.location}
            </p>
            <div className='serviceMapDiv'>
                <div className='leafletContainer'>
                    <MapContainer
                        style={{ height: '100%', width: '100%' }}
                        center={[service.geolocation.lat, service.geolocation.lng]}
                        zoom={13}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
                        />

                        <Marker
                            position={[service.geolocation.lat, service.geolocation.lng]}
                        >
                            <Popup>{service.location}</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
            </>
        )}

        {auth.currentUser?.uid !== service.userRef && (
            <>
            <Link
                to={`/contact/${service.userRef}?coachName=${service.name}`}
                className='primaryButton'
            >
                Contact Coach
            </Link>
            </>
        )}
        
        {/* { review.length === 0 ? (
            <div className='loadMoreDiv'>
                <p 
                    className='loadMore' 
                    // onClick={<ReviewItem />}
                >
                        Leave a Review
                </p>
                </div>
        ) : <></>} */}
        <br />

        <div onClick={onToggle} className={className === 'primaryButton' ? 'primaryButton' : 'reviewActiveButton'}>Leave a Review</div>
        { toggle === "open" 
        ? (<>
            <form onSubmit={onSubmit} className='serviceReviewForm'>
                {/* make this autofill */}
                <div className="serviceReviewFormDiv">
                <label className='formLabel'>Name</label>
                <input
                    className='formInputName'
                    type='text'
                    id='name'
                    value={name}
                    onChange={onMutate}
                    maxLength='50'
                    minLength='5'
                    required={name}
                />
                </div>

                <div className="serviceReviewFormDiv">
                <label className='formLabel'>Type of Coaching</label>
                <div className='reviewFormButtons'>
                    <button
                        className={inPersonCoaching ? 'reviewFormButtonActive' : 'reviewFormButton'}
                        type='button'
                        id='inPersonCoaching'
                        value={true}
                        onClick={inPersonToggle}
                    >
                        In-Person Coaching
                    </button>
                    <button
                        className={onlineCoaching ? 'reviewFormButtonActive' : 'reviewFormButton'}
                        type='button'
                        id='onlineCoaching'
                        value={true}
                        onClick={onlineToggle}
                    >
                        Online Coaching
                    </button>
                </div>
                </div>

                <div className="serviceReviewFormDiv">
                <label className='formLabel'>Payments</label>
                <div className='reviewFormButtons'>
                    <button
                        className={yearly ? 'reviewFormButtonActive' : 'reviewFormButton'}
                        type='button'
                        id='yearly'
                        value={true}
                        onClick={yearlyToggle}
                    >
                        Yearly
                    </button>
                    <button
                        className={subscription ? 'reviewFormButtonActive' : 'reviewFormButton'}
                        type='button'
                        id='subscription'
                        value={true}
                        onClick={subscriptionToggle}
                    >
                        Subscription
                    </button>
                </div>
                </div>

                <div className="serviceReviewFormDiv">
                    <label className='formLabel'>Time Worked Together</label>
                    <input
                        className='reviewTimeInputSmall'
                        type='number'
                        id='monthsWorkedWith'
                        value={monthsWorkedWith}
                        onChange={onMutate}
                        min='10'
                        max='100'
                        required={monthsWorkedWith}
                    />
                </div>


                {/* Add conditional for "avgRating" and "numberOfClients" (still need to add to reviewData profile, database, Review form for clients? (Maybe just comment section with option to select stars), etc) */}
                <div className="serviceReviewFormDiv">
                    <label className='formLabel'>Rating <span className='starReviews'>(1 - 10)</span></label>
                    
                    <div className="serviceStarRatingText">  
                        <p className='starRatings'>
                            <input
                                className='reviewInputSmall'
                                type='number'
                                id='rating'
                                value={rating}
                                onChange={onMutate}
                                min='1'
                                max='10'
                                required={rating}
                            />
                            {/* <img src={starFillIcon} alt="star rating" className='starIcon starIconOne'/> */}
                        </p>
                    </div>
                </div>
                
                <div className="serviceReviewFormDiv">
                <div className='serviceReviewMessageDiv'>
                <textarea
                        name='message'
                        id='message'
                        className='textarea'
                        value={message}
                        onChange={onChange}
                    ></textarea>
                </div>
                </div>

                <button type='submit' className='primaryButton createReviewButton'>
                    Submit Review
                </button>
            </form>
            <br />
            <br />
            <br />
            <br />
            <br />
            </>
            )
            
        : (<></>)}
        {/* { review && review.length > 0 ? (
            <>
            <main>
                <ul className="categoryListings">
                    {review.map((review) => (
                        <ReviewItem 
                            review={review.data} 
                            id={review.id}
                            key={review.id} 
                        />
                    ))}
                </ul>
            </main>

             {review.length > 4 && lastFetchedReview ? (
                <div className='loadMoreDiv'>
                <p className='loadMore' onClick={onFetchMoreReviews}>
                    Load More
                </p>
                </div>
            ): <><p>No more reviews are available at this time.</p></>}

            <br />
            <br />
            </>
            ) : ( 
                <p>No reviews yet.</p>
        )} */}

        
        </>  
    )
}


export default Service

// https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat