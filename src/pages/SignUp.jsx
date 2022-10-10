import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import OAuth from '../components/OAuth'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
// (After project finish): Add Phone Input prop for sign-up and add to formData
// import 'react-phone-number-input/style.css'
// import PhoneInput from 'react-phone-number-input'

function SignUp() {
  const [ showPassword, setShowPassword ] = useState(false)
  const [ formData, setFormData ] = useState({ 
    name: '',
    email: '',
    password: '',
  })
  const { 
    name, 
    email, 
    password 
  } = formData

  const navigate = useNavigate()

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
      // e.target.id allows us to pick either email or password, instead of needing two different key value pairs
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      // Register a new user
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      updateProfile(auth.currentUser, {
        displayName: name
      })

      // Save User to Firestore
      const formDataCopy = { ...formData}
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      await setDoc(doc(db, 'users', user.uid), formDataCopy)

      navigate('/')
    } catch (error) {
      toast.error('Whoops! Something Went Wrong.')
    }
  }



  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="signUpHeader">Welcome to Better Coaching Services!</p>
        </header>

        <form onSubmit={onSubmit}>
          <input 
            type="text" 
            className="nameInput" 
            placeholder="Name" 
            // REMEMBER: id value MUST be same as the state (the value value --> value={name})
            id="name" 
            value={name} 
            onChange={onChange} 
          />
          <input 
              type="email" 
              className="emailInput" 
              placeholder="Email" 
              id="email" 
              value={email} 
              onChange={onChange} 
          />

          <div className="passwordInputDiv">
            <input 
                type={showPassword ? 'text' : 'password'} 
                className='passwordInput' 
                placeholder='Password' 
                id='password' 
                value={password} 
                onChange={onChange} 
              />

              <img 
                src={visibilityIcon} 
                alt="show password" 
                className="showPassword" 
                onClick={() =>
                  setShowPassword((prevState) => !prevState)
                }
              />
            </div>

            <Link to='/forgot-password' className='forgotPasswordLink'>
              Forgot Password?
            </Link>

            <div className="signUpBar">
              <p className="signUpText">
                Sign Up
              </p>
              <button className="signUpButton">
                <ArrowRightIcon fill='#fff' width='34px' height='34px' />
              </button>
            </div>
        </form> 

        <OAuth />

        <Link 
          to='/sign-in'
          className='registerLink'>
            Sign-In Instead
        </Link>
      </div>
    </>
  )
}

export default SignUp