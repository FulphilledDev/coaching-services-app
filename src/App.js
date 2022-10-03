import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';


function App() {
  return (
    <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          {/*<Route path='/profile' element={<PrivateRoute />}> */}
            <Route path='/profile' element={<SignIn />} />
          {/* </Route> */}
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          {/* <Route path='/create-listing' element={<CreateListing />} /> */}
        </Routes>
        <Navbar />
      </Router>
  );
}

export default App;
