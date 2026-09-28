import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

import { fetchHotelById, updateHotel } from '../features/hotelSlice';
import HotelForm from '../components/HotelForm';

const EditHotelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentHotel, detailLoading, submitting, validationErrors, error } = useSelector(
    (state) => state.hotels
  );

  useEffect(() => {
    if (!currentHotel || String(currentHotel.id) !== String(id)) {
      dispatch(fetchHotelById(id));
    }
  }, [dispatch, id, currentHotel]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(updateHotel({ id, formData })).unwrap();
      navigate(`/hotels/${id}`);
    } catch (err) {
      console.error('Failed to update hotel:', err);
    }
  };

  if (detailLoading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner" role="status" aria-label="Loading hotel data" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading hotel information…</p>
      </div>
    );
  }

  if (!currentHotel) {
    return (
      <div className="empty-state">
        <h2>Hotel Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
          Could not find hotel to edit.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Hotels
        </Link>
      </div>
    );
  }

  return (
    <main>
      <Helmet>
        <title>{`Edit ${currentHotel.title} | StayHaven`}</title>
        <meta
          name="description"
          content={`Update details for ${currentHotel.title}.`}
        />
      </Helmet>

      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
        <Link to={`/hotels/${id}`} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Hotel Details</span>
        </Link>
      </div>

      <div className="page-header" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <h1 className="page-title">Edit Hotel Details</h1>
        <p className="page-subtitle">
          Modify pricing, description, coordinates, or upload a new image.
        </p>
      </div>

      {error && (
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto 1.5rem',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </div>
      )}

      <HotelForm
        initialData={currentHotel}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        serverErrors={validationErrors}
        onCancel={() => navigate(`/hotels/${id}`)}
      />
    </main>
  );
};

export default EditHotelPage;
