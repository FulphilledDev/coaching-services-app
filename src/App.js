import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Explore from './pages/Explore';
import Category from './pages/Category';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Service from './pages/Service';
import Contact from './pages/Contact';




function App() {
  return (
    <>
    <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/category/:categoryName' element={<Category />} />
          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
          </Route>
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          {/* <Route path='/create-service' element={<PrivateRoute />}> */}
            <Route path='/create-service' element={<CreateService />} />
          {/* </Route> */}
          {/* <Route path='/edit-service/:serviceId' element={<PrivateRoute />}> */}
            <Route path='/edit-service/:serviceId' element={<EditService />} />
          {/* </Route> */}
          <Route path='/category/:categoryName/:serviceId' element={<Service />} />
          <Route path='/contact/:coachId' element={<Contact />} />
        </Routes>
        <Navbar />
      </Router>

      <ToastContainer />
    </>
  );
}

export default App;
