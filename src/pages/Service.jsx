import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { 
    getDoc, 
    doc,
    updateDoc,
    serverTimestamp 
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import { FaCheck } from 'react-icons/fa'
import { FaShareAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'

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
        reviewName: "",
        reviewOnlineCoaching: false,
        reviewInPersonCoaching: false,
        reviewYearly: false,
        reviewSubscription: false,
        reviewMonthsWorkedWith: 0,
        reviewRating: 0,
        reviewMessage: ""
    })

    const {
        reviewName,
        reviewOnlineCoaching,
        reviewInPersonCoaching,
        reviewYearly, 
        reviewSubscription,
        reviewMonthsWorkedWith,
        reviewRating,
        reviewMessage
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
        if (reviewData.reviewYearly === false) {
            setReviewData({...reviewData,
            reviewYearly: true})
            setClassName('reviewFormButtonActive')
        } else {
            setReviewData({...reviewData,
            reviewYearly: false})
            setClassName('reviewFormButton')
        }
    }

    const subscriptionToggle = () => {
        if (reviewData.reviewSubscription === false) {
            setReviewData({...reviewData,
            reviewSubscription: true})
            setClassName('reviewFormButtonActive')
        } else {
            setReviewData({...reviewData,
            reviewSubscription: false})
            setClassName('reviewFormButton')
        }
        }

    const inPersonToggle = () => {
        if (reviewData.reviewInPersonCoaching === false) {
            setReviewData({...reviewData,
            reviewInPersonCoaching: true})
            setClassName('reviewFormButtonActive')
        } else {
            setReviewData({...reviewData,
            reviewInPersonCoaching: false})
            setClassName('reviewFormButton')
        }
        }

    const onlineToggle = () => {
        if (reviewData.reviewOnlineCoaching === false) {
            setReviewData({...reviewData,
            reviewOnlineCoaching: true})
            setClassName('reviewFormButtonActive')
        } else {
            setReviewData({...reviewData,
            reviewOnlineCoaching: false})
            setClassName('reviewFormButton')
        }
        }

    const onNameChange = (e) => setReviewData({...reviewData, reviewName: e.target.value})
    const onTimeChange = (e) => setReviewData({...reviewData, reviewMonthsWorkedWith: e.target.value})
    const onRatingChange = (e) => setReviewData({...reviewData, reviewRating: e.target.value})
    const onMessageChange = (e) => setReviewData({...reviewData, reviewMessage: e.target.value})

    /////////////////////////////////

    // On Submit

    //////////////////////////////////

    const onSubmit = async (e) => {
        e.preventDefault()
        //console.log(formData)

        setLoading(true)

        // Must enter name and email 
        if (!reviewName && !reviewRating) {
          setLoading(false)
          toast.error('Please enter your name and a rating')
          return
        }

        // Make sure yearly price is more than subscription price
        if (!reviewYearly && !reviewSubscription) {
          setLoading(false)
          toast.error('Please select one payment type.')
          return
        }

        if (reviewYearly && reviewSubscription) {
          setLoading(false)
          toast.error('Please select one payment type.')
          return
        }

        // Must select inPerson or Online Coaching
        if (!reviewInPersonCoaching && !reviewOnlineCoaching) {
          setLoading(false)
          toast.error('Must select either Online or In Person Coaching')
          return
        }

        //////////////////////////////////////////////////////////////////
        //
        // Submit new review: Update serviceRef (serviceId doc) while keeping all previous data from current service, and add to reviews object all previous reviews , with new reviewData
        //
        //////////////////////////////////////////////////////////////////
        const serviceRef = doc(db, 'coachingServices', params.serviceId)
        await updateDoc(serviceRef, {
            ...service,
            reviews: [...service.reviews, reviewData]
        })

        setLoading(false)
        setToggle('closed')
        toast.success('Rating saved')
        navigate(`/category/${serviceRef.category}/${serviceRef.id}`)

        // setLoading(false)
    }

    //////////////////////////

    // Fetch More Reviews
    // (Pagination / Load More)

    ///////////////////////////


    //////////////////////
    //
    // Spinner
    //
    //////////////////////

    if(loading) {
        return <Spinner />
    }

    return (
        <>
            <li className='servicePageCard'>
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
            
                <img src={service.imgUrls[0]} alt={service.name} className='servicePageImg' />
                <div className='servicePageDetails'>
                    <p className="servicePageName">
                        {service.name ? service.name : <></> }
                    </p>
                    <p className='servicePagePrice'> 
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
                    <div className="servicePageTypeSavingsDiv">
                        <p className='servicePageType'>
                            {service.category}
                        </p>
                        {service.yearly && (
                        <p className='servicePageSavingsPrice'>
                            Save ${((service.subscriptionPrice)*12) - service.yearlyPrice} / Year
                        </p>
                        )}
                    </div>
                    <ul className='servicePageDetailsList'>
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
                                className='servicePageDetailsFaCheck'/> In Person Coaching Available
                            </>}
                        </li>
                        <li>{service.onlineCoaching && 
                            <><FaCheck 
                                className='servicePageDetailsFaCheck'/> Online Coaching Available
                            </>}
                        </li>
                    </ul>
                </div>
            </li>

            <div className="servicePageAdditionalDetails">

                { !service.email 
                    ? <></> 
                    : <>
                        <p className="servicePageInformation">Information</p>
                        <p className="servicePageAddress">
                            {service.email}
                        </p>
                        </>
                    }
                
                <br />


                { !service.location ? (<p className="servicePageAddress"> No business location available. Provides stricly online coaching</p>) : <></>}
                <br />

                { service.location && (
                    <>
                    <p className="servicePageLocation">Business Location</p>
                    <p className="servicePageAddress">
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

                {/* service.reviews.map((review)) */}
                { service.reviews && service.reviews.length > 0 ? (
                    <>
                    <main className='reviewMainDisplay'>
                        <p className="servicePageReviews">Reviews</p>
                        
                            {service.reviews.map((review) => (
                                <div className='reviewDisplay'>
                                    <div className="reviewDetails">
                                        <div className='reviewHeaderDiv'>
                                            <p className="reviewName">{review.reviewName}
                                            </p>
                                            <div className="reviewTypeDiv">
                                                <p className='reviewCoachingType'>
                                                    {review.reviewInPersonCoaching ? "In-Person Coaching" : "Online Coaching"}
                                                </p>
                                                <p className='reviewPriceType'>
                                                    {review.reviewSubscription ? "Subscription" : "Yearly"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="ratingDiv">
                                            <div>
                                                Rating:
                                            </div>
                                            <div className="reviewRating">
                                                {review.reviewRating}
                                            </div>
                                        </div>
                                        <div className='reviewMessage'>
                                                {review.reviewMessage}
                                        </div>
                                    </div>
                                </div>
                                
                            ))}
                        
                    </main>

                <br />
                
                    {/* {service.reviews.length > 2 && lastFetchedReview ? (
                        <div className='loadMoreDiv'>
                        <p className='loadMore' onClick={onFetchMoreReviews}>
                            Load More Reviews
                        </p>
                        </div>
                    ): <></>} */}
                    </>
                    ) : ( 
                        <p className='noReviewsPar'>No reviews have been submitted.</p>
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
                                id='reviewName'
                                value={reviewName}
                                onChange={onNameChange}
                                maxLength='50'
                                minLength='5'
                                required={reviewName}
                            />
                            </div>

                            <div className="serviceReviewFormDiv">
                            <label className='formLabel'>Type of Coaching</label>
                            <div className='reviewFormButtons'>
                                <button
                                    className={reviewInPersonCoaching === 'true' ? 'reviewFormButtonActive' : 'reviewFormButton'}
                                    type='button'
                                    id='reviewInPersonCoaching'
                                    value={true}
                                    onClick={inPersonToggle}
                                >
                                    In-Person Coaching
                                </button>
                                <button
                                    className={reviewOnlineCoaching === 'true' ? 'reviewFormButtonActive' : 'reviewFormButton'}
                                    type='button'
                                    id='reviewOnlineCoaching'
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
                                    className={reviewYearly === 'true' ? 'reviewFormButtonActive' : 'reviewFormButton'}
                                    type='button'
                                    id='reviewYearly'
                                    value={true}
                                    onClick={yearlyToggle}
                                >
                                    Yearly
                                </button>
                                <button
                                    className={reviewSubscription ? 'reviewFormButtonActive' : 'reviewFormButton'}
                                    type='button'
                                    id='reviewSubscription'
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
                                    id='reviewMonthsWorkedWith'
                                    value={reviewMonthsWorkedWith}
                                    onChange={onTimeChange}
                                    min='1'
                                    max='12'
                                    required={reviewMonthsWorkedWith}
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
                                            id='reviewRating'
                                            value={reviewRating}
                                            onChange={onRatingChange}
                                            min='1'
                                            max='10'
                                            required={reviewRating}
                                        />
                                        {/* <img src={starFillIcon} alt="star rating" className='starIcon starIconOne'/> */}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="serviceReviewFormDiv">
                            <div className='serviceReviewMessageDiv'>
                            <textarea
                                    name='reviewMessage'
                                    id='reviewMessage'
                                    className='textarea'
                                    value={reviewMessage}
                                    onChange={onMessageChange}
                                ></textarea>
                            </div>
                            </div>

                            <button type='submit' className='primaryButton createReviewButton'>
                                Submit Review
                            </button>
                        </form>
                        
                        </>)
                        
                    : (<></>)
                    }

            </div>
        </>  
    )
}


export default Service

// https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat