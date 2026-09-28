import { useState, useEffect, useRef } from 'react';
import { Upload, X, MapPin } from 'lucide-react';

const HotelForm = ({
  initialData = null,
  onSubmit,
  isSubmitting = false,
  serverErrors = null,
  onCancel,
}) => {
  const isEditMode = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    latitude: '',
    longitude: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
      });
      if (initialData.image_url) {
        setPreviewUrl(initialData.image_url);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (serverErrors) {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
    }
  }, [serverErrors]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please upload a valid image (JPEG, PNG, WEBP, GIF, SVG).',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image size should not exceed 5MB.',
      }));
      return;
    }

    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setGeoLocating(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 3000);
        setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
      },
      (err) => {
        setGeoLocating(false);
        alert(`Failed to retrieve location: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Hotel title is required.';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Hotel description is required.';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters.';
    }

    const priceNum = parseFloat(formData.price);
    if (formData.price === '' || isNaN(priceNum)) {
      newErrors.price = 'Price is required and must be a valid number.';
    } else if (priceNum <= 0) {
      newErrors.price = 'Price must be greater than zero.';
    }

    const latNum = parseFloat(formData.latitude);
    if (formData.latitude === '' || isNaN(latNum)) {
      newErrors.latitude = 'Latitude is required.';
    } else if (latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90.';
    }

    const lngNum = parseFloat(formData.longitude);
    if (formData.longitude === '' || isNaN(lngNum)) {
      newErrors.longitude = 'Longitude is required.';
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180.';
    }

    if (!isEditMode && !imageFile && !previewUrl) {
      newErrors.image = 'Hotel image is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('price', formData.price);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);

    if (imageFile) {
      data.append('image', imageFile);
    } else if (isEditMode && previewUrl) {
      data.append('image_url', previewUrl);
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" noValidate>
      <div className="form-group image-upload-wrapper">
        <label className="form-label">
          Hotel Image <span style={{ color: 'var(--danger)' }}>*</span>
        </label>

        {previewUrl ? (
          <div className="preview-container">
            <img
              src={previewUrl}
              alt="Uploaded hotel preview"
              className="preview-img"
            />
            <div className="preview-overlay">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ background: '#ffffff', boxShadow: 'var(--shadow-md)' }}
                onClick={() => fileInputRef.current?.click()}
                title="Change Image"
              >
                Change Image
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ background: '#ffffff', boxShadow: 'var(--shadow-md)' }}
                onClick={handleRemoveImage}
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`image-dropzone ${errors.image ? 'error' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            role="button"
            tabIndex={0}
          >
            <Upload size={32} color="var(--primary)" />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Click to browse or drag and drop image here
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Supports JPEG, PNG, WEBP, SVG (Max 5MB)
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
        />

        {errors.image && <p className="error-text">{errors.image}</p>}
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="title" className="form-label">
          Hotel Title <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder="e.g. Marina Bay Haven Suites"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="description" className="form-label">
          Description <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          placeholder="Detailed description of amenities, room features, neighborhood, etc."
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <p className="error-text">{errors.description}</p>}
      </div>

      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="price" className="form-label">
          Price per Night ($ USD) <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          className={`form-input ${errors.price ? 'error' : ''}`}
          placeholder="e.g. 199.00"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <p className="error-text">{errors.price}</p>}
      </div>

      <div className="form-two-cols" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group">
          <label htmlFor="latitude" className="form-label">
            Latitude <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            className={`form-input ${errors.latitude ? 'error' : ''}`}
            placeholder="e.g. 48.858844"
            value={formData.latitude}
            onChange={handleChange}
          />
          {errors.latitude && <p className="error-text">{errors.latitude}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="longitude" className="form-label">
            Longitude <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            className={`form-input ${errors.longitude ? 'error' : ''}`}
            placeholder="e.g. 2.294351"
            value={formData.longitude}
            onChange={handleChange}
          />
          {errors.longitude && <p className="error-text">{errors.longitude}</p>}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleGetCurrentLocation}
          disabled={geoLocating}
        >
          <MapPin size={15} />
          <span>
            {geoLocating ? 'Detecting Coordinates…' : 'Autofill with My Current Location'}
          </span>
        </button>
        {geoSuccess && (
          <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: 'var(--success)' }}>
            ✓ Coordinates detected!
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Saving Hotel…</span>
          ) : (
            <span>{isEditMode ? 'Update Hotel' : 'Create Hotel'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default HotelForm;
