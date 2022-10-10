import { Link } from 'react-router-dom'
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
import starHalfIcon from '../assets/svg/starHalfIcon.svg'
import starFillIcon from '../assets/svg/starFillIcon.svg'

function ServiceItem({ service, id, onDelete, onEdit }) {
  return (
    <li className='serviceItemCard'>
        <Link to={`/category/${service.category}/${id}`} className='categoryListingLink'>
            <img src={service.imgUrls[0]} alt={service.name} className='categoryServiceImg' />
            <div className="categoryServiceDetails">
                <p className="categoryServiceName">
                    {service.name}
                </p>
                <p className="categoryServicePrice">
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
                <p className="categoryServiceQuote">
                  {service.quote 
                    ? `"${service.quote}"`
                    : <></>
                  }
                </p>
                {/* Add conditional for "avgRating" and "numberOfClients" (still need to add to service profile, database, Review form for clients? (Maybe just comment section with option to select stars), etc) */}
                <div className="categoryServiceRatingDiv">
                    <div className="categoryServiceStarRatings">
                        {service.minCommit === 0 
                            ?  'No Ratings Yet' 
                            : ( 
                            <>
                            <div className='starIcons'>
                                <img src={starFillIcon} alt="star rating" className='starIcon starIconOne'/>
                                <img src={starFillIcon} alt="star rating" className='starIcon'/>
                                <img src={starFillIcon} alt="star rating" className='starIcon'/>
                                <img src={starHalfIcon} alt="star rating" className='starIcon'/>
                            </div>
                            <div className='categoryServiceStarReviews'>
                                {service.minCommit > 1 ? `${service.minCommit} Reviews` : '1 Review' } 
                            </div>  
                            </>    
                        )}
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