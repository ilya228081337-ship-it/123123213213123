/*
  # Create Online Bookstore Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique, category name)
      - `description` (text, category description)
      - `created_at` (timestamptz, creation timestamp)
    
    - `authors`
      - `id` (uuid, primary key)
      - `name` (text, author name)
      - `bio` (text, author biography)
      - `country` (text, author's country)
      - `created_at` (timestamptz, creation timestamp)
    
    - `books`
      - `id` (uuid, primary key)
      - `title` (text, book title)
      - `category_id` (uuid, foreign key to categories)
      - `description` (text, book description)
      - `price` (numeric, book price)
      - `stock` (integer, available stock)
      - `isbn` (text, unique, ISBN number)
      - `published_year` (integer, publication year)
      - `cover_image` (text, cover image URL)
      - `created_at` (timestamptz, creation timestamp)
    
    - `book_authors`
      - `book_id` (uuid, foreign key to books)
      - `author_id` (uuid, foreign key to authors)
      - Primary key on (book_id, author_id)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `user_name` (text, reviewer name)
      - `rating` (integer, rating 1-5)
      - `comment` (text, review comment)
      - `created_at` (timestamptz, creation timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text, customer name)
      - `customer_email` (text, customer email)
      - `book_id` (uuid, foreign key to books)
      - `quantity` (integer, quantity ordered)
      - `total_price` (numeric, total order price)
      - `status` (text, order status)
      - `created_at` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read authors"
  ON authors FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert authors"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update authors"
  ON authors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete authors"
  ON authors FOR DELETE
  TO authenticated
  USING (true);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  price numeric(10, 2) DEFAULT 0,
  stock integer DEFAULT 0,
  isbn text UNIQUE,
  published_year integer,
  cover_image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- Create book_authors junction table
CREATE TABLE IF NOT EXISTS book_authors (
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  author_id uuid REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read book_authors"
  ON book_authors FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert book_authors"
  ON book_authors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update book_authors"
  ON book_authors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete book_authors"
  ON book_authors FOR DELETE
  TO authenticated
  USING (true);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1,
  total_price numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);