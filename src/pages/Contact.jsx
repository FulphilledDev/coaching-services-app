import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'


function Contact() {
    const [message, setMessage] = useState('')
    const [coach, setCoach] = useState(null)
    // eslint-disable-next-line
    const [searchParams, setSearchParams] = useSearchParams()

    const params = useParams()

    useEffect(() => {
            const getCoach = async () => {
            const docRef = doc(db, 'users', params.coachId) // Not sure about this param...
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                setCoach(docSnap.data())
            } else {
                toast.error('Could not get landlord data')
            }
        }

        getCoach()
    }, [params.coachId])

    const onChange = (e) => setMessage(e.target.value)


    return (
        <div className='pageContainer'>
        <header>
            <p className='pageHeader'>Contact a Coach</p>
        </header>

        {coach !== null && (
            <main>
                <div className='contactLandlord'>
                    <p className='landlordName'>To: {coach?.name}</p>
                </div>

            <form className='messageForm'>
                <div className='messageDiv'>
                    <label htmlFor='message' className='messageLabel'>
                        Message
                    </label>
                    <textarea
                        name='message'
                        id='message'
                        className='textarea'
                        value={message}
                        onChange={onChange}
                    ></textarea>
                </div>

                <a
                    href={`mailto:${coach.email}?Subject=${searchParams.get('coachName')}&body=${message}`}
                > 
                {/* ^^ What is 'listingName' supposed to be instead...
                ... The params set in the link at the bottom of Service Page for Contact Coach Button */}
                    <button type='button' className='primaryButton'>
                        Send Message
                    </button>
                </a>
            </form>
            </main>
        )}
        </div>
    )
}

export default Contact