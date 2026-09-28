import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Edit3, Trash2, MapPin, Info } from 'lucide-react';

import {
  fetchHotelById,
  deleteHotel,
  clearCurrentHotel,
  closeDeleteSuccessPopup,
} from '../features/hotelSlice';
import HotelMap from '../components/HotelMap';
import { DeleteConfirmModal, SuccessToast } from '../components/ConfirmModal';

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentHotel, detailLoading, error, deleteSuccessPopup } = useSelector(
    (state) => state.hotels
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => {
      dispatch(clearCurrentHotel());
    };
  }, [dispatch, id]);

  const handleConfirmDelete = async () => {
    if (!currentHotel) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteHotel(currentHotel.id)).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (detailLoading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner" role="status" aria-label="Loading hotel details" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading hotel information…</p>
      </div>
    );
  }

  if (error || !currentHotel) {
    return (
      <div className="empty-state">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Hotel Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {error || 'The requested hotel could not be found or has been removed.'}
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Hotel Catalog</span>
        </Link>
      </div>
    );
  }

  const formattedPrice = Number(currentHotel.price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <main className="detail-container">
      <Helmet>
        <title>{`${currentHotel.title} | StayHaven`}</title>
        <meta
          name="description"
          content={currentHotel.description.slice(0, 160)}
        />
        <meta property="og:title" content={`${currentHotel.title} | StayHaven`} />
        <meta
          property="og:description"
          content={currentHotel.description.slice(0, 200)}
        />
        <meta property="og:image" content={currentHotel.image_url} />
        <meta property="og:type" content="place" />
      </Helmet>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Hotels</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to={`/hotels/${currentHotel.id}/edit`} className="btn btn-outline btn-sm">
            <Edit3 size={15} />
            <span>Edit Details</span>
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <article className="detail-card">
        <div className="detail-banner-wrap">
          <img
            src={currentHotel.image_url}
            alt={`Panoramic view of ${currentHotel.title}`}
            className="detail-banner-img"
          />
          <div className="detail-header-overlay">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={18} color="#93c5fd" />
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>
                  {Number(currentHotel.latitude).toFixed(4)}°, {Number(currentHotel.longitude).toFixed(4)}°
                </span>
              </div>
              <h1 className="detail-title">{currentHotel.title}</h1>
            </div>

            <div className="detail-price-box">
              <div className="detail-price-value">{formattedPrice}</div>
              <div className="detail-price-sub">per night + taxes</div>
            </div>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-grid">
            <div>
              <h2 className="detail-section-title">
                <Info size={20} color="var(--primary)" />
                <span>About this Stay</span>
              </h2>
              <p className="detail-description-text">
                {currentHotel.description}
              </p>
            </div>

            <div>
              <h2 className="detail-section-title">
                <MapPin size={20} color="var(--primary)" />
                <span>Location &amp; Map</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Explore the property location on the interactive map below or calculate distance from your current position.
              </p>

              <HotelMap
                latitude={currentHotel.latitude}
                longitude={currentHotel.longitude}
                title={currentHotel.title}
                price={currentHotel.price}
              />
            </div>
          </div>
        </div>
      </article>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        hotelTitle={currentHotel.title}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <SuccessToast
        show={deleteSuccessPopup.show}
        message={`Hotel "${deleteSuccessPopup.hotelTitle}" was successfully deleted.`}
        onClose={() => dispatch(closeDeleteSuccessPopup())}
      />
    </main>
  );
};

export default HotelDetailPage;
