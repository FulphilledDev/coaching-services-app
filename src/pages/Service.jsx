import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'

function Service() {
    const [service, setService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const params = useParams()
    const auth = getAuth()

    useEffect(() => {
        const fetchService = async () => {
            const docRef = doc(db, 'coachingServices', params.serviceId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                console.log(docSnap.data())
                setService(docSnap.data())
                setLoading(false)
            }
        }

        fetchService()
    }, [navigate, params.serviceId])

    if(loading) {
        return <Spinner />
    }

    return (
        <>
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
        <img src={shareIcon} alt='' />
        </div>

        {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

        <div className='listingDetails'>
        <p className='listingName'>
            {service.name} - $
            {service.yearly
                ? service.yearlyPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : service.subscriptionPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            <span> / Month</span>
        </p>
        <p className='listingLocation'>{service.businessLocation}</p>
        <p className='listingType'>
          {service.category}
        </p>
        {service.yearly && (
          <p className='discountPrice'>
            ${service.subscriptionPrice - service.yearlyPrice} discount
          </p>
        )}
        <ul className='listingDetailsList'>
            <li>
                {service.minCommit > 1
                    ? `${service.minCommit} Month Minimum Commitment`
                    : '1 Month Commitment'}
            </li>
            <li>{service.inPersonCoaching && 'In Person Coaching Available'}</li>
            <li>{service.onlineCoaching && 'Online Coaching Available'}</li>
        </ul>

        <p className='listingLocationTitle'>Business Location</p>

        {/* MAP */}

        {auth.currentUser?.uid !== service.userRef && (
            <Link
                to={`/contact/${service.userRef}?coachName=${service.name}`}
                className='primaryButton'
            >
                Contact Coach
            </Link>
        )}
        </div>
        </>  
    )
}

export default Service