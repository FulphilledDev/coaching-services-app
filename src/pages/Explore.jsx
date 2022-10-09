import { Link } from 'react-router-dom'
import Slider from '../components/Slider'
import goForIt from '../assets/jpg/goForIt.jpg'
import inLifting from '../assets/jpg/inLifting.jpg'
import yesWeCan from '../assets/jpg/yesWeCan.jpg'

function Explore() {
  return (
    <>
    <div className='Explore'>

        <main>
          <header>
            <p className="exploreHeader">Explore</p>
          </header>
          <Slider />

          <p className="exploreCategoryHeading">Categories</p>
          <div className="exploreCategories">
            <Link to='/category/life-performance'>
              <img 
                src={goForIt} 
                alt="life-performance" 
                className='exploreCategoryImg' 
              />
              <p className="exploreCategoryName">Life-Performance</p>
            </Link>
            <Link to='/category/nutrition'>
              <img 
                src={inLifting} 
                alt="nutrition" 
                className='exploreCategoryImg' 
              />
              <p className="exploreCategoryName">Nutrition</p>
            </Link>
            <Link to='/category/mental-performance'>
              <img 
                src={yesWeCan} 
                alt="mental-performance" 
                className='exploreCategoryImg' 
              />
              <p className="exploreCategoryName">Mental-Performance</p>
            </Link>
          </div>
        </main>
    </div>
    </>
  )
}

export default Explore