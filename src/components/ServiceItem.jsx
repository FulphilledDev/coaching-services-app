import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
// Add other icons: 

function ServiceItem({ service, id }) {
  return (
    <li className='categoryListing'>
      <Link to={`/category/${service.category}/${id}`} className='categoryListingLink'>
        <img src={service.imgUrls[0]} alt={service.name} className='categoryListingImg' />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">
              {service.businessLocation}
          </p>
          <p className="categoryListingName">
              {service.name}
          </p>
          <p className="categoryListingPrice">
              ${service.yearly 
                  ? service.yearlyPrice
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : service.subscriptionPrice
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              <span> - </span>
              ${service.subscription 
                  ? service.subscriptionPrice
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : 'No Subscriptions'}
              {service.subscription === true && ' / Month'}
          </p>
            {/* <div className="categoryListingInfoDiv">
                <img src={bedIcon} alt="bed" />
                <p className="categoryListingInfoText">
                    {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : '1 Bedroom'}
                </p>
                <img src={bathtubIcon} alt="bath" />
                <p className="categoryListingInfoText">
                    {listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : '1 Bathroom'}
                </p>
            </div> */}
        </div>
      </Link>
    </li>
  )
}

export default ServiceItem