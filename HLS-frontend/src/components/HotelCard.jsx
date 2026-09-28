import { useNavigate } from 'react-router-dom';
import { MapPin, Edit3, Trash2, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel, onDeleteClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/hotels/${hotel.id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/hotels/${hotel.id}/edit`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDeleteClick(hotel);
  };

  const formattedPrice = Number(hotel.price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <article className="hotel-card" onClick={handleCardClick} role="button" tabIndex={0}>
      <div className="card-image-wrap">
        <img
          src={hotel.image_url}
          alt={`Exterior or suite of ${hotel.title}`}
          className="card-image"
          loading="lazy"
        />
        <div className="price-pill">
          {formattedPrice} <span>/ night</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title" title={hotel.title}>
          {hotel.title}
        </h3>

        <div className="card-location">
          <MapPin size={14} className="text-muted" />
          <span>
            {Number(hotel.latitude).toFixed(3)}°, {Number(hotel.longitude).toFixed(3)}°
          </span>
        </div>

        <p className="card-snippet">
          {hotel.description}
        </p>

        <div className="card-footer">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleCardClick}
            aria-label={`View details for ${hotel.title}`}
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </button>

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleEditClick}
              aria-label={`Edit ${hotel.title}`}
              title="Edit Hotel"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleDeleteClick}
              aria-label={`Delete ${hotel.title}`}
              title="Delete Hotel"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
