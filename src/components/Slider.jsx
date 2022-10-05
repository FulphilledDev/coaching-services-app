import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.config'
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
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
    return <> <p className='exploreParagraphHeading'>No Recommended Services</p> </>
  }

  return (
    services.length >= 1 && (
      <>
        <p className='exploreHeading'>Recommended</p>

        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {services.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.category}/${id}`)}
            >
              <div
                //   This is where it should display service.imgUrls
                style={{
                  background: `url(${data.imgUrls[0]}) center no-repeat`, 
                  backgroundSize: 'cover',
                }}
                className='swiperSlideDiv'
              >
                <p className='swiperSlideText'>{data.name}</p>
                <p className='swiperSlideText'>{data.category}</p>
                <p className='swiperSlidePrice'>
                  ${data.yearlyPrice ?? data.subscriptionPrice}{' '}
                  {data.subscription === true && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  )
}

export default Slider