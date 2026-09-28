import { useState, useEffect } from 'react';
import { Search, DollarSign, X, Filter } from 'lucide-react';

const SearchFilter = ({ initialFilters, onSearchChange, onFilterChange, onReset }) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  useEffect(() => {
    setSearch(initialFilters.search || '');
    setMinPrice(initialFilters.minPrice || '');
    setMaxPrice(initialFilters.maxPrice || '');
  }, [initialFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({
      search: search.trim(),
      minPrice: minPrice !== '' ? Number(minPrice) : '',
      maxPrice: maxPrice !== '' ? Number(maxPrice) : '',
    });
  };

  const handleReset = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    onReset();
  };

  const hasActiveFilters = Boolean(search || minPrice !== '' || maxPrice !== '');

  return (
    <section className="filter-card" aria-label="Search and Filter Hotels">
      <form onSubmit={handleSubmit} className="filter-grid">
        <div className="form-group">
          <label htmlFor="search-title" className="form-label">
            Search Hotel Name
          </label>
          <div className="input-with-icon">
            <Search size={18} />
            <input
              id="search-title"
              type="text"
              className="form-input"
              placeholder="e.g. Palace, Resort, Inn..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                onSearchChange?.(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="filter-min-price" className="form-label">
            Min Price ($)
          </label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="10"
              className="form-input"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="filter-max-price" className="form-label">
            Max Price ($)
          </label>
          <div className="input-with-icon">
            <DollarSign size={16} />
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="10"
              className="form-input"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            <Filter size={16} />
            <span>Apply</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              title="Reset all filters"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default SearchFilter;