import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config' 
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Spinner from './Spinner'
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

function Slider() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      const servicesRef = collection(db, 'coachingServices')
      const q = query(servicesRef, orderBy('timestamp', 'desc'), limit(5))
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

    fetchServices()
  }, [])

  if (loading) {
    return <Spinner />
  }

  if (services.length === 0) {
    return <> <p className='exploreParagraphHeading'>No Recent Additions</p> </>
  }

  return (
    services.length >= 1 && (
      <>
        <p className='exploreHeading'>Most Recent Additions</p>

        <Swiper 
          slidesPerView={1} 
          pagination={{ clickable: true }}
          scrollbar={{ draggable: true}}
        >
          {services.map(({ data, id }) => (
            <SwiperSlide 
              key={id}
              onClick={() => navigate(`/category/${data.category}/${id}`)}
              >
              <li className='swiperCategoryListing'>
              <img src={data.imgUrls[0]} alt={data.name} className='swiperCategoryListingImg' />
              <div className="swiperListingDetails">
                <p className="swiperListingQuote">
                  {data.quote 
                    ? `"${data.quote}"`
                    : <></>
                  }
                </p>
                <p className="swiperListingName">
                    {data.name}
                </p>
                <p className="swiperListingPrice">
                    {data.yearly 
                        ? data.yearlyPrice
                            .toString()
                            .padStart(data.yearlyPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Year')
                        : <></> }
                    { data.yearly && data.subscription ? ' or ' : <></>}
                    {data.subscription 
                        ? data.subscriptionPrice
                            .toString()
                            .padStart(data.subscriptionPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Month')
                        : <></> }
                </p>
                <div className="listingTypeDive">
                <p className='listingType'>
                    {data.category}
                </p>
                </div>
                {/* Add conditional for "avgRating" and "numberOfClients" (still need to add to data profile, database, Review form for clients? (Maybe just comment section with option to select stars), etc) */}
              </div>
              </li>
              </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider