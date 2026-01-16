BookHub API Endpoints for React Native
=========================================

Base URL: http://localhost:4000
Authentication: Session-based (handled by passport.js)

═══════════════════════════════════════════════════════════════════
AUTHENTICATION ENDPOINTS
═══════════════════════════════════════════════════════════════════

POST /register
--------------
Description: Register a new user account
Parameters:
  - email (string): User's email address
  - password (string): User's password
  - name (string): User's full name
Response: Success/Failure status

POST /login
-----------
Description: User login
Parameters:
  - email (string): User's email address  
  - password (string): User's password
Response: Session cookies + redirect to dashboard

GET /logout
-----------
Description: Logout user and destroy session
Response: Redirect to login page

GET /auth/google
----------------
Description: Google OAuth authentication
Response: Redirects to Google login

GET /auth/google/callback
-------------------------
Description: Google OAuth callback handler
Response: Redirect to set-password page

═══════════════════════════════════════════════════════════════════
BOOK API ENDPOINTS
═══════════════════════════════════════════════════════════════════

GET /indexFetch
---------------
Description: Fetch random books by category (10 books)
Parameters:
  - category (string): Book category to filter by
    - Use "%" for all categories
    - Use specific category name (e.g., "Fiction")
Response: Array of book objects
Example: /indexFetch?category=%

GET /categoryFetch
------------------
Description: Fetch books in a specific category with pagination
Parameters:
  - category (string): Book category to filter by
  - offset (number): Pagination offset (default: 0)
  - limit (number): Number of books per page (default: 10)
  - showAll (boolean): Set to "true" to fetch all books without pagination
Response: { books: Array, total: number }
Examples:
  - /categoryFetch?category=%&offset=0&limit=5
  - /categoryFetch?category=Fiction&showAll=true

GET /detailsFetch
-----------------
Description: Fetch detailed information about a specific book
Parameters:
  - id (number): Book ID
Response: Array containing single book object with full details
Example: /detailsFetch?id=1

═══════════════════════════════════════════════════════════════════
ADMIN ENDPOINTS
═══════════════════════════════════════════════════════════════════

GET /admin/addbook
------------------
Description: Admin page to add new books (requires admin auth)

POST /admin/insertbook
----------------------
Description: Insert new book into database (requires admin auth)
Parameters (multipart/form-data):
  - title (string): Book title
  - Author (string): Book author
  - Discription (string): Book description
  - excerpt (string): Book excerpt
  - category (string): Book category
  - price (number): Book price
  - image (file): Book cover image
  - book (file): Book PDF file
Response: Success/Failure status

═══════════════════════════════════════════════════════════════════
PAGE ROUTES (FOR WEBVIEW INTEGRATION)
═══════════════════════════════════════════════════════════════════

GET /
----
Description: Dashboard/Home page (requires authentication)

GET /bookdetails
----------------
Description: Book details page (requires authentication)
Usage: Use with session cookies for navigation

GET /category
-------------
Description: Category browsing page (requires authentication)
Usage: Use with session cookies for navigation

GET /read
---------
Description: PDF reading page (requires authentication)
Usage: Use with session cookies for navigation

GET /quiz
---------
Description: Quiz section page (requires authentication)

GET /set-password
-----------------
Description: Password setup page for new users (requires authentication)

GET /choosePayment
------------------
Description: Payment method selection page (requires authentication)

GET /makePayment
----------------
Description: Make payment page (requires authentication)

POST /process-payment
---------------------
Description: Process payment transaction (requires authentication)

POST /initialize-payment
------------------------
Description: Initialize payment process (requires authentication)

GET /payment-success
--------------------
Description: Payment success confirmation page (requires authentication)

═══════════════════════════════════════════════════════════════════
RESPONSE FORMATS
═══════════════════════════════════════════════════════════════════

Book Object Format:
{
  "idbooks": 1,
  "title": "Book Title",
  "author": "Author Name",
  "image": "uploads/image-filename.jpg",
  "price": 25.99,
  "Author": "Author Name",
  "Discription": "Book description...",
  "excerpt": "Book excerpt...",
  "status": "available",
  "book": "uploads/book-filename.pdf"
}

API Response Format:
- Success: JSON object with requested data
- Error: {"error": "Error message"} or 500 status code

═══════════════════════════════════════════════════════════════════
REACT NATIVE INTEGRATION NOTES
═══════════════════════════════════════════════════════════════════

1. SESSION MANAGEMENT:
   - The API uses express-session with cookies
   - Store cookies from login response
   - Include cookies in subsequent requests

2. CORS:
   - CORS is enabled, allowing cross-origin requests

3. FILE ACCESS:
   - Images: http://localhost:4000/uploads/image-filename.jpg
   - Books: http://localhost:4000/uploads/book-filename.pdf

4. AUTHENTICATION:
   - Most endpoints require authentication except login/register
   - Use WebView with cookies or implement cookie handling

5. ERROR HANDLING:
   - Always implement try-catch blocks
   - Check for network errors
   - Handle 401 (unauthorized) responses

═══════════════════════════════════════════════════════════════════
EXAMPLE REQUESTS
═══════════════════════════════════════════════════════════════════

Login Example:
fetch('http://localhost:4000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include'  // Important for session cookies
});

Fetch Books Example:
fetch('http://localhost:4000/categoryFetch?category=%&showAll=true', {
  method: 'GET',
  credentials: 'include'  // Include session cookies
});

Get Book Details Example:
fetch('http://localhost:4000/detailsFetch?id=1', {
  method: 'GET',
  credentials: 'include'  // Include session cookies
});

═══════════════════════════════════════════════════════════════════
Updated: 2025-11-12
BookHub API v1.0
═══════════════════════════════════════════════════════════════════