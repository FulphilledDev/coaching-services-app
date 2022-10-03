import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit 
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'

function Category() {
    const [ coachingServices, setCoachingServices ] = useState(null)
    const [ loading, setLoading ] = useState(true)

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
                    limit(5)
                )

                // Execute a query
                const querySnap = await getDocs(q)

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
    }, [])

//  Modify classNames here and in CSS
  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
                {/* Add conditional for Life Performance and Nutrition */}
                {params.categoryName === 'mental-performance' ? 'Mental Performance' : 'Nutrition'}
            </p>
        </header>

        { loading ? (
            <Spinner />
        ) : coachingServices && coachingServices.length > 0 ? (
            <>
            </>
            ) : ( 
            <p>No Services for {params.categoryName}</p>
        )}
    </div>
  )
}

export default Category