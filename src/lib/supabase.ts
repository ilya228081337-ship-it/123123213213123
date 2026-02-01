import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log('Supabase client initialized successfully');

export type Database = {
  categories: {
    id: string;
    name: string;
    description: string;
    created_at: string;
  };
  authors: {
    id: string;
    name: string;
    bio: string;
    country: string;
    created_at: string;
  };
  books: {
    id: string;
    title: string;
    category_id: string;
    description: string;
    price: number;
    stock: number;
    isbn: string;
    published_year: number;
    cover_image: string;
    created_at: string;
  };
  reviews: {
    id: string;
    book_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
  };
  orders: {
    id: string;
    customer_name: string;
    customer_email: string;
    book_id: string;
    quantity: number;
    total_price: number;
    status: string;
    created_at: string;
  };
};
