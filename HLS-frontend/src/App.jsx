import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';
import AddHotelPage from './pages/AddHotelPage';
import EditHotelPage from './pages/EditHotelPage';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hotels/new" element={<AddHotelPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/hotels/:id/edit" element={<EditHotelPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
