import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit , 
    startAfter
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ServiceItem from '../components/ServiceItem'

function Category() {
    const [ coachingServices, setCoachingServices ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ lastFetchedService, setLastFetchedService ] = useState(null)

    const params = useParams()

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Get Reference (to collection, not Doc)
                const servicesRef = collection(db, 'coachingServices')

                // Create a query
                const q = query(
                    servicesRef, 
                    where('category', '==', params.categoryName), // There is no "type", instead "category"
                    orderBy('timestamp', 'desc'), 
                    limit(3)
                )

                // Execute a query
                const querySnap = await getDocs(q)

                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchedService(lastVisible)

                const categoryServices = []

                querySnap.forEach((doc) => {
                    // This says we successfully have the data...
                    // console.log(doc.data())
                    return categoryServices.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })

                // We are setting Coaching Services to specific categoryName services in a new array of category Services that will be displayed on the specific category page
                setCoachingServices(categoryServices)
                setLoading(false)
            } catch (error) {
                toast.error('Could not get coaching services')
            }
        }

        fetchServices()
        console.log(params)
        
    }, [params.categoryName])

    // Pagination / Load More
    const onFetchMoreServices = async () => {
        try {
            // Get reference
            const servicesRef = collection(db, 'coachingServices')

            // Create a query
            const q = query(
                servicesRef,
                where('category', '==', params.categoryName),
                orderBy('timestamp', 'desc'),
                startAfter(lastFetchedService),
                limit(10)
            )

            // Execute query
            const querySnap = await getDocs(q)

            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchedService(lastVisible)

            const services = []

            querySnap.forEach((doc) => {
                return services.push({
                    id: doc.id,
                    data: doc.data(),
                })
            })
            
            setCoachingServices((prevState) => [...prevState, ...services])
            setLoading(false)   
        } catch (error) {
            toast.error('Could not fetch services')
        }
    }

//  Modify classNames here and in CSS
  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
                {params.categoryName.replace((/(^\w)|([-\s]\w)/g), match => match.toUpperCase())}
            </p>
        </header>

        { loading ? (
            <Spinner />
        ) : coachingServices && coachingServices.length > 0 ? (
            <>
            <main>
                <ul className="categoryListings">
                    {coachingServices.map((service) => (
                        <ServiceItem 
                            service={service.data} 
                            id={service.id}
                            key={service.id} 
                        />
                    ))}
                </ul>
            </main>

            <br />
            <br />
            {coachingServices.length > 2 && lastFetchedService ? (
                <div className='loadMoreDiv'>
                <p className='loadMore' onClick={onFetchMoreServices}>
                    Load More
                </p>
                </div>
            ): <></>}
            </>
            ) : ( 
                <p>No Services are available at this time.</p>
            )}
        </div>
    )
}

export default Category