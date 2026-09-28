import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Plus, Hotel as HotelIcon, AlertCircle } from 'lucide-react';

import {
  fetchHotels,
  deleteHotel,
  setPage,
  setFilters,
  resetFilters,
  closeDeleteSuccessPopup,
} from '../features/hotelSlice';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';
import { DeleteConfirmModal, SuccessToast } from '../components/ConfirmModal';
import SearchFilter from '../components/SearchFilter';

const HotelListPage = () => {
  const dispatch = useDispatch();

  const {
    items,
    total,
    page,
    totalPages,
    limit,
    filters,
    loading,
    error,
    deleteSuccessPopup,
  } = useSelector((state) => state.hotels);

  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  const filteredItems = items.filter((hotel) => {
    if (!search.trim()) return true;
    const searchLower = search.trim().toLowerCase();
    return (
      hotel.title.toLowerCase().includes(searchLower) ||
      (hotel.description &&
        hotel.description.toLowerCase().includes(searchLower))
    );
  });

  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(
      fetchHotels({
        page,
        limit,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      })
    );
  }, [dispatch, page, limit, filters.minPrice, filters.maxPrice]);

  const handleSearchChange = (value) => {
    setSearch(value);
    if (page !== 1) dispatch(setPage(1));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setSearch(newFilters.search || '');
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setSearch('');
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePrompt = (hotel) => {
    setHotelToDelete(hotel);
  };

  const handleConfirmDelete = async () => {
    if (!hotelToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      if (items.length === 1 && page > 1) {
        dispatch(setPage(page - 1));
      } else {
        dispatch(
          fetchHotels({
            page,
            limit,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          })
        );
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setHotelToDelete(null);
    }
  };

  return (
    <main>
      <Helmet>
        <title>Explore Luxury & Budget Hotels | HLS</title>
        <meta
          name="description"
          content="Find the best handpicked hotels, boutique stays, and luxury resorts around the world. Filter by price and search by name."
        />
        <meta property="og:title" content="Explore Luxury & Budget Hotels | StayHaven" />
        <meta
          property="og:description"
          content="Find the best handpicked hotels, boutique stays, and luxury resorts around the world."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="page-header">
        <h1 className="page-title">Discover Your Perfect Stay in Algeria</h1>
        <p className="page-subtitle">
          Browse luxury villas, boutique inns, and comfortable urban retreats around the world.
        </p>
      </div>

      <SearchFilter
        initialFilters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {error && (
        <div
          style={{
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner" role="status" aria-label="Loading hotels" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <HotelIcon className="empty-icon" />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No hotels found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {search || filters.minPrice !== '' || filters.maxPrice !== ''
              ? 'Try adjusting your search criteria or price filters to see more results.'
              : 'There are currently no hotel records in the catalog.'}
          </p>
          <Link to="/hotels/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add the First Hotel</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="hotel-grid">
            {filteredItems.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onDeleteClick={handleDeletePrompt}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <DeleteConfirmModal
        isOpen={Boolean(hotelToDelete)}
        hotelTitle={hotelToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHotelToDelete(null)}
      />

      <SuccessToast
        show={deleteSuccessPopup.show}
        message={`Hotel "${deleteSuccessPopup.hotelTitle}" was successfully deleted.`}
        onClose={() => dispatch(closeDeleteSuccessPopup())}
      />
    </main>
  );
};

export default HotelListPage;