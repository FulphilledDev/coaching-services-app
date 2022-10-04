import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
// Swiper is grabbing service object but not displaying images...
// Also getting Swiper destroyed: true in console
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
SwiperCore.use([ Navigation, Pagination, Scrollbar, A11y])

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
        <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            onSwiper={(swiper) => console.log(swiper)}
            onSlideChange={() => console.log('slide change')}
        >
            {service.imgUrls.map((url, index) => (
                <SwiperSlide key={index}>
                    <div 
                        style={{ background: `url(${service.imgUrls[index]}) center no-repeat`,
                        backgroundSize: 'cover'}} 
                        className="swiperSlideDiv"></div>
                </SwiperSlide>
            ))}
        </Swiper>
        
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
                    <Popup>{service.businessLocation}</Popup>
                </Marker>
            </MapContainer>
        </div>

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

// https://stackoverflow.com/questions/67552020/how-to-fix-error-failed-to-compile-node-modules-react-leaflet-core-esm-pat