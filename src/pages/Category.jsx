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
                    where('type', '==', params.categoryName), 
                    orderBy('timestamp', 'desc'), 
                    limit(5)
                )

                // Execute a query
                const querySnap = await getDocs(q)

                const categoryServices = []

                querySnap.forEach((doc) => {
                    console.log(doc.data())
                    // return categoryServices.push({
                    //     id: doc.id,
                    //     data: doc.data()
                    // })
                })

                // setCoachingServices(services)
                // setLoading(false)
            } catch (error) {
                // toast.error('Could not fetch coaching services')
            }
        }

        fetchServices()
    },)

//  Modify classNames here and in CSS
  return (
    <div className='category'>
        <header>
            <p className="pageHeader">
                {/* Add conditional for Life Performance and Nutrition */}
                {params.categoryName === 'mental-performance' ? 'Mental Performance' : 'Nutrition'}
            </p>
        </header>

        {coachingServices && coachingServices.length > 0 ? (
            <>
            </>
            ) : ( 
            <p>No Services for {params.categoryName}</p>
        )}
    </div>
  )
}

export default Category