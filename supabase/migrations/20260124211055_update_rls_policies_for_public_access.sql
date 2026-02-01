/*
  # Update RLS Policies for Public Access

  Update all RLS policies to allow full public access to all tables
  for easier management through admin panel without requiring authentication.
  
  IMPORTANT: In production, implement proper authentication and restrict access.
*/

-- Drop existing policies for categories table
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Create new public policies for categories
CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Public insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete categories"
  ON categories FOR DELETE
  USING (true);

-- Drop existing policies for authors table
DROP POLICY IF EXISTS "Anyone can read authors" ON authors;
DROP POLICY IF EXISTS "Authenticated users can insert authors" ON authors;
DROP POLICY IF EXISTS "Authenticated users can update authors" ON authors;
DROP POLICY IF EXISTS "Authenticated users can delete authors" ON authors;

-- Create new public policies for authors
CREATE POLICY "Public read authors"
  ON authors FOR SELECT
  USING (true);

CREATE POLICY "Public insert authors"
  ON authors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update authors"
  ON authors FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete authors"
  ON authors FOR DELETE
  USING (true);

-- Drop existing policies for books table
DROP POLICY IF EXISTS "Anyone can read books" ON books;
DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON books;
DROP POLICY IF EXISTS "Authenticated users can delete books" ON books;

-- Create new public policies for books
CREATE POLICY "Public read books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Public insert books"
  ON books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update books"
  ON books FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete books"
  ON books FOR DELETE
  USING (true);

-- Drop existing policies for book_authors table
DROP POLICY IF EXISTS "Anyone can read book_authors" ON book_authors;
DROP POLICY IF EXISTS "Authenticated users can insert book_authors" ON book_authors;
DROP POLICY IF EXISTS "Authenticated users can update book_authors" ON book_authors;
DROP POLICY IF EXISTS "Authenticated users can delete book_authors" ON book_authors;

-- Create new public policies for book_authors
CREATE POLICY "Public read book_authors"
  ON book_authors FOR SELECT
  USING (true);

CREATE POLICY "Public insert book_authors"
  ON book_authors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update book_authors"
  ON book_authors FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete book_authors"
  ON book_authors FOR DELETE
  USING (true);

-- Drop existing policies for reviews table
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON reviews;

-- Create new public policies for reviews
CREATE POLICY "Public read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Public insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update reviews"
  ON reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete reviews"
  ON reviews FOR DELETE
  USING (true);

-- Drop existing policies for orders table
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

-- Create new public policies for orders
CREATE POLICY "Public read orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete orders"
  ON orders FOR DELETE
  USING (true);
