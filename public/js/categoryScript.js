let offset = 0; // Track the offset for next fetch
let isFetching = false; // Prevent multiple fetches
let showingAllBooks = false; // Track if we're showing all books

// This will load books when the user is near the bottom of the page
async function fetchCategories() {
  const category = sessionStorage.getItem("category");

  // Prevent further fetches if we're already fetching
  if (isFetching) return;

  isFetching = true; // Mark that we're fetching

  try {
    const response = await fetch(
      `http://localhost:4000/categoryFetch/?category=${encodeURIComponent(
        category
      )}&offset=${encodeURIComponent(offset)}`
    );
    if (!response.ok) {
      throw new Error(`Cannot fetch category: ${response}`);
    }
    const { books, total } = await response.json();

    renderBooks(books); // Append books to existing ones
    offset += 10; // Update the offset for the next fetch

    // If all books are loaded, stop fetching more
    if (offset >= total) {
      window.removeEventListener("scroll", handleScroll); // Stop scrolling if no more books
    }
  } catch (error) {
    console.error(error);
  } finally {
    isFetching = false; // Reset the fetching flag
  }
}

// Render books by appending them to the existing list
function renderBooks(books) {
  const container = document.querySelector(".book-category");
  const template = container.querySelector(".book");

  // Iterate over each book and add it to the container
  books.forEach((book) => {
    const clonedTemplate = template.cloneNode(true);
    clonedTemplate.style.display = "block";
    clonedTemplate.querySelector("img").src = book.image;
    clonedTemplate.querySelector(".title").innerText = book.title;
    clonedTemplate.querySelector(".author").innerText = book.author;
    clonedTemplate.querySelector("img").alt = book.title; // Add alt text for accessibility
    container.appendChild(clonedTemplate);
    clonedTemplate.querySelector("button").addEventListener("click", () => {
      getBookId(book.idbooks);
    });
  });
}

// Scroll event handler to load more content when scrolling near the bottom
function handleScroll() {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

  // If we are near the bottom, fetch more books
  if (nearBottom) {
    fetchCategories();
  }
}

// Function to fetch all books without pagination
async function fetchAllBooks() {
  const category = sessionStorage.getItem("category");
  const seeMoreBtn = document.getElementById("seeMoreBtn");

  // Disable button and show loading state
  seeMoreBtn.disabled = true;
  seeMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading All Books...';

  // Remove scroll listener temporarily
  window.removeEventListener("scroll", handleScroll);

  try {
    const response = await fetch(
      `http://localhost:4000/categoryFetch/?category=${encodeURIComponent(
        category
      )}&showAll=true`
    );
    
    if (!response.ok) {
      throw new Error(`Cannot fetch category: ${response}`);
    }
    
    const { books, total } = await response.json();

    // Clear existing books
    const container = document.querySelector(".book-category");
    const template = container.querySelector(".book");
    container.innerHTML = '';
    container.appendChild(template);

    // Render all books
    renderBooks(books);

    // Update UI
    showingAllBooks = true;
    document.getElementById("paginationContainer").style.display = 'none';
    
    // Update button
    seeMoreBtn.innerHTML = '<i class="fas fa-check"></i> Showing All Books';
    seeMoreBtn.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
    
  } catch (error) {
    console.error(error);
    
    // Reset button on error
    seeMoreBtn.disabled = false;
    seeMoreBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
    
    // Re-add scroll listener
    window.addEventListener("scroll", handleScroll);
  }
}

// Initial fetch to load books
fetchCategories();

// Add scroll event listener to detect when the user reaches near the bottom of the page
window.addEventListener("scroll", handleScroll);

const headerName = sessionStorage.getItem("category");
const categoryDisplayName = headerName == "%%" ? "Random" : headerName;

// Set header title
document.querySelector("header h1").innerText = categoryDisplayName;

// Set category header title and description
document.getElementById("categoryTitle").innerHTML = `<i class="fas fa-book"></i> ${categoryDisplayName} `;
document.getElementById("categoryDescription").textContent = `Discover amazing ${categoryDisplayName.toLowerCase()} books in this category`;
//book clicked id to bookdetails
function getBookId(bookID) {
  sessionStorage.setItem("selectedBook", bookID);
  console.log(bookID);
  window.location.href = "bookdetails";
}

// Connection monitoring for auto-refresh on reconnection
let wasOffline = false;

function setupConnectionMonitoring() {
  // Monitor online/offline status
  window.addEventListener('offline', () => {
    wasOffline = true;
    console.log('Connection lost');
    showError('Connection lost. Please check your internet connection.');
  });

  window.addEventListener('online', () => {
    if (wasOffline) {
      console.log('Connection restored, refreshing page...');
      showSuccess('Connection restored! Refreshing page...');
      // Small delay to show the success message before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    wasOffline = false;
  });

  // Check initial connection status
  if (!navigator.onLine) {
    wasOffline = true;
    showError('No internet connection detected.');
  }
}

// Notification functions
function showError(message) {
  let errorDiv = document.getElementById("appError");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "appError";
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #e53e3e;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
      z-index: 10000;
      max-width: 300px;
      font-weight: 500;
    `;
    document.body.appendChild(errorDiv);
  }

  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    if (errorDiv) errorDiv.style.display = "none";
  }, 5000);
}

function showSuccess(message) {
  let successDiv = document.getElementById("appSuccess");
  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.id = "appSuccess";
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #38a169;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
      z-index: 10000;
      max-width: 300px;
      font-weight: 500;
    `;
    document.body.appendChild(successDiv);
  }

  successDiv.textContent = message;
  successDiv.style.display = "block";

  setTimeout(() => {
    if (successDiv) successDiv.style.display = "none";
  }, 3000);
}

// Initialize connection monitoring
setupConnectionMonitoring();
