import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
// Add other icons: 
import starIcon from '../assets/svg/starIcon.svg'
import starHalfIcon from '../assets/svg/starHalfIcon.svg'
import starFillIcon from '../assets/svg/starFillIcon.svg'

function ServiceItem({ service, id, onDelete, onEdit }) {
  return (
    <li className='categoryListing'>
        <Link to={`/category/${service.category}/${id}`} className='categoryListingLink'>
            <img src={service.imgUrls[0]} alt={service.name} className='categoryListingImg' />
            <div className="categoryListingDetails">
                <p className="categoryListingLocation">
                    {service.location}
                </p>
                <p className="categoryListingName">
                    {service.name}
                </p>
                <p className="categoryListingPrice">
                    {service.yearly 
                        ? service.yearlyPrice
                            .toString()
                            .padStart(service.yearlyPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Year')
                        : <></> }
                    { service.yearly && service.subscription ? ' or ' : <></>}
                    {service.subscription 
                        ? service.subscriptionPrice
                            .toString()
                            .padStart(service.subscriptionPrice.length+1, '$')
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            .concat(' / Month')
                        : <></> }
                </p>
                {/* Add conditional for "avgRating" and "numberOfClients" (still need to add to service profile, database, Review form for clients? (Maybe just comment section with option to select stars), etc) */}
                <div className="categoryListingInfoDiv">
                    <div className="categoryListingInfoText">
                        {service.minCommit === 0 
                            ? 'No Ratings Yet' 
                            : <>
                                <p className='starRatings'>
                                    <img src={starFillIcon} alt="star rating" className='starIcon starIconOne'/>
                                    <img src={starFillIcon} alt="star rating" className='starIcon'/>
                                    <img src={starFillIcon} alt="star rating" className='starIcon'/>
                                    <img src={starHalfIcon} alt="star rating" className='starIcon'/>
                                    <span className='starReviews'>
                                        {service.minCommit > 1 ? `${service.minCommit} Reviews` : '1 Review' } 
                                    </span>
                                </p>
                                 
                            </>
                        }
                    </div>
                </div>
            </div>
        </Link>

      {onDelete && (
            <DeleteIcon 
                className='removeIcon' 
                fill='rgb(231, 76, 60)'
                onClick={() => onDelete(service.id, service.name)}
            />
        )}

        {onEdit && <EditIcon className='editIcon' onClick={() => onEdit(id)} />}
    </li>
  )
}

export default ServiceItem