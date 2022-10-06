import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import { FaCheck } from 'react-icons/fa'
import { FaShareAlt } from 'react-icons/fa'

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
        <br />


        { !service.location ? (<p className="categoryListingAddress"> No business location available. Provides stricly online coaching</p>) : <></>}

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
            <Link
                to={`/contact/${service.userRef}?coachName=${service.name}`}
                className='primaryButton'
            >
                Contact Coach
            </Link>
        )}
        </>  
    )
}

export default Service

// https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat