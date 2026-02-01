import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Star, BookOpen, Filter } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  published_year: number;
  cover_image: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function BookStore() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMap, setCategoryMap] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    console.log('BookStore component mounted, loading data...');
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Fetching categories...');
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) {
        console.error('Error loading categories:', catError);
        alert(`Error loading categories: ${catError.message}`);
      } else {
        console.log('Categories loaded:', categoriesData?.length);
      }
      setCategories(categoriesData || []);

      const map: { [key: string]: string } = {};
      (categoriesData || []).forEach(cat => {
        map[cat.id] = cat.name;
      });
      setCategoryMap(map);

      console.log('Fetching books...');
      let query = supabase
        .from('books')
        .select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: booksData, error: booksError } = await query.order('created_at', { ascending: false });

      if (booksError) {
        console.error('Error loading books:', booksError);
        alert(`Error loading books: ${booksError.message}`);
      } else {
        console.log('Books loaded:', booksData?.length);
      }

      setBooks(booksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      alert(`Critical error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (bookId: string) => {
    setCart(prev => ({
      ...prev,
      [bookId]: (prev[bookId] || 0) + 1
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BookHub</h1>
                <p className="text-sm text-gray-600">Your Digital Library</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">{getTotalItems()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Books
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No books found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={book.cover_image || 'https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {book.stock < 10 && book.stock > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Only {book.stock} left
                    </div>
                  )}
                  {book.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {categoryMap[book.category_id as string] || 'Uncategorized'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {book.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {book.description}
                  </p>

                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">(4.5)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${book.price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">USD</span>
                    </div>

                    <button
                      onClick={() => addToCart(book.id)}
                      disabled={book.stock === 0}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        book.stock > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {cart[book.id] ? `Added (${cart[book.id]})` : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {getTotalItems() > 0 && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-4 rounded-full shadow-2xl">
          <p className="font-semibold">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in cart
          </p>
        </div>
      )}
    </div>
  );
}
