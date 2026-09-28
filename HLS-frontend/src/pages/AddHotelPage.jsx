import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

import { createHotel } from '../features/hotelSlice';
import HotelForm from '../components/HotelForm';

const AddHotelPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { submitting, validationErrors, error } = useSelector((state) => state.hotels);

  const handleSubmit = async (formData) => {
    try {
      const created = await dispatch(createHotel(formData)).unwrap();
      navigate(`/hotels/${created.id}`);
    } catch (err) {
      console.error('Failed to create hotel:', err);
    }
  };

  return (
    <main>
      <Helmet>
        <title>Add New Hotel | StayHaven</title>
        <meta
          name="description"
          content="List a new hotel property with image upload, coordinates, description, and pricing."
        />
      </Helmet>

      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Hotels</span>
        </Link>
      </div>

      <div className="page-header" style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
        <h1 className="page-title">Add New Hotel</h1>
        <p className="page-subtitle">
          Fill in the property details, upload a cover image, and specify location coordinates.
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
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        serverErrors={validationErrors}
        onCancel={() => navigate('/')}
      />
    </main>
  );
};

export default AddHotelPage;
