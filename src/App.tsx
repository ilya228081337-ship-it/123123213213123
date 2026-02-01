import { useState } from 'react';
import BookStore from './components/BookStore';
import AdminPanel from './components/AdminPanel';
import { Settings, Store } from 'lucide-react';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen">
      <button
        onClick={() => setIsAdmin(!isAdmin)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
      >
        {isAdmin ? (
          <>
            <Store className="w-5 h-5" />
            <span>Store View</span>
          </>
        ) : (
          <>
            <Settings className="w-5 h-5" />
            <span>Admin Panel</span>
          </>
        )}
      </button>

      {isAdmin ? <AdminPanel /> : <BookStore />}
    </div>
  );
}

export default App;
