// BookHub - Professional E-Book Platform
// Enhanced script with proper error handling and user feedback

class BookHubApp {
  constructor() {
    this.spinner = document.querySelector(".loading");
    this.mainContainer = document.getElementById("bookContainer");
    this.categories = [
      "Textbooks",
      "Storybooks",
      "Folktale Books",
      "Fable Books",
      "Poetry Books",
      "Picture Books",
      "Informational / Non-Fiction Books",
      "Biography Books",
      "Comprehension and Reading Practice Books",
      "Religious or Moral Storybooks"
    ];
    this.templates = {
      textbooks: null,
      storybooks: null,
      featured: null,
      poetry: null,
      nonfiction: null
    };
    this.wasOffline = false;

    this.init();
  }

  init() {
    this.showLoading();
    this.initializeTemplates();
    this.fetchAllBooks();
    this.bindEvents();
    this.setupConnectionMonitoring();
  }

  showLoading() {
    if (this.spinner) this.spinner.style.display = "flex";
    if (this.mainContainer) this.mainContainer.style.display = "none";
  }

  hideLoading() {
    if (this.spinner) this.spinner.style.display = "none";
    if (this.mainContainer) this.mainContainer.style.display = "block";
  }

  showError(message) {
    // Create error notification if it doesn't exist
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

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorDiv) errorDiv.style.display = "none";
    }, 5000);
  }

  showSuccess(message) {
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

  initializeTemplates() {
    try {
      // Initialize templates for each section
      const textbooksContainer = document.querySelector("#textbooks .indexbook-category");
      const storybooksContainer = document.querySelector("#storybooks .indexbook-category");
      const featuredContainer = document.querySelector("#featured .indexbook-category");
      const poetryContainer = document.querySelector("#poetry .indexbook-category");
      const nonfictionContainer = document.querySelector("#nonfiction .indexbook-category");

      if (textbooksContainer) {
        this.templates.textbooks = textbooksContainer.querySelector(".indexbook");
        textbooksContainer.innerHTML = "";
      }

      if (storybooksContainer) {
        this.templates.storybooks = storybooksContainer.querySelector(".indexbook");
        storybooksContainer.innerHTML = "";
      }

      if (featuredContainer) {
        this.templates.featured = featuredContainer.querySelector(".indexbook");
        featuredContainer.innerHTML = "";
      }

      if (poetryContainer) {
        this.templates.poetry = poetryContainer.querySelector(".indexbook");
        poetryContainer.innerHTML = "";
      }

      if (nonfictionContainer) {
        this.templates.nonfiction = nonfictionContainer.querySelector(".indexbook");
        nonfictionContainer.innerHTML = "";
      }
    } catch (error) {
      console.error("Error initializing templates:", error);
      this.showError("Failed to initialize book templates");
    }
  }

  async fetchBooks(category) {
    try {
      console.log(`Fetching books for category: ${category}`);
      const response = await fetch(
        `http://localhost:4000/indexFetch/?category=${encodeURIComponent(category)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${category} books (${response.status})`);
      }

      const books = await response.json();
      console.log(`Fetched ${books.length} books for category "${category}":`, books);
      this.hideLoading();
      return books;
    } catch (error) {
      console.error(`Error fetching books in category "${category}":`, error);
      this.showError(`Failed to load ${category} books. Please try again.`);
      return [];
    }
  }

  async fetchAllBooks() {
    try {
      console.log("Starting to fetch all books...");
      // Fetch books for main categories to display on homepage
      const mainCategories = ["Textbooks", "Storybooks", "%%", "Poetry Books", "Informational / Non-Fiction Books"];
      console.log("Categories to fetch:", mainCategories);
      
      const requests = mainCategories.map((category) => this.fetchBooks(category));
      const results = await Promise.all(requests);

      const [textbooks, storybooks, featured, poetry, nonfiction] = results;

      console.log("Rendering books:", {
        textbooks: textbooks.length,
        storybooks: storybooks.length,
        featured: featured.length,
        poetry: poetry.length,
        nonfiction: nonfiction.length
      });

      this.renderTextbooks(textbooks);
      this.renderStorybooks(storybooks);
      this.renderFeatured(featured);
      this.renderPoetry(poetry);
      this.renderNonFiction(nonfiction);

      const totalBooks = textbooks.length + storybooks.length + featured.length + poetry.length + nonfiction.length;
      console.log(`Total books loaded: ${totalBooks}`);
      
      if (totalBooks > 0) {
        this.showSuccess(`Loaded ${totalBooks} books successfully!`);
      } else {
        console.warn("No books were loaded");
        this.showError("No books found. Please check if books exist in the database.");
      }
    } catch (error) {
      console.error("Error fetching all books:", error);
      this.showError("Failed to load books. Please refresh the page.");
    }
  }

  renderTextbooks(books) {
    if (!this.templates.textbooks || !books) return;

    const container = document.querySelector("#textbooks .indexbook-category");

    books.forEach((book) => {
      try {
        const bookElement = this.templates.textbooks.cloneNode(true);
        bookElement.querySelector("#image").src = book.image || 'images/download.png';
        bookElement.querySelector("#image").alt = book.title || 'Textbook';
        bookElement.querySelector("#title").textContent = book.title || 'Unknown Title';
        bookElement.querySelector("#author").textContent = book.Author || 'Unknown Author';
        
        // Handle optional price field safely
        const priceElement = bookElement.querySelector("#price");
        if (priceElement) {
          priceElement.textContent = `₵${book.price || '0'}.00`;
        }

        bookElement.querySelector("button").addEventListener("click", () => {
          this.getBookId(book.idbooks);
        });

        container.appendChild(bookElement);
      } catch (error) {
        console.error("Error rendering textbook:", error);
      }
    });
  }

  renderStorybooks(books) {
    if (!this.templates.storybooks || !books) return;

    const container = document.querySelector("#storybooks .indexbook-category");

    books.forEach((book) => {
      try {
        const bookElement = this.templates.storybooks.cloneNode(true);
        bookElement.querySelector("#image").src = book.image || 'images/download.png';
        bookElement.querySelector("#image").alt = book.title || 'Storybook';
        bookElement.querySelector("#title").textContent = book.title || 'Unknown Title';
        bookElement.querySelector("#author").textContent = book.Author || 'Unknown Author';
        
        // Handle optional price field safely
        const priceElement = bookElement.querySelector("#price");
        if (priceElement) {
          priceElement.textContent = `₵${book.price || '0'}.00`;
        }

        bookElement.querySelector("button").addEventListener("click", () => {
          this.getBookId(book.idbooks);
        });

        container.appendChild(bookElement);
      } catch (error) {
        console.error("Error rendering storybook:", error);
      }
    });
  }

  renderFeatured(books) {
    if (!this.templates.featured || !books) return;

    const container = document.querySelector("#featured .indexbook-category");

    books.forEach((book) => {
      try {
        const bookElement = this.templates.featured.cloneNode(true);
        bookElement.querySelector("#image").src = book.image || 'images/download.png';
        bookElement.querySelector("#image").alt = book.title || 'Featured Book';
        bookElement.querySelector("#title").textContent = book.title || 'Unknown Title';
        bookElement.querySelector("#author").textContent = book.Author || 'Unknown Author';
        
        // Handle optional price field safely
        const priceElement = bookElement.querySelector("#price");
        if (priceElement) {
          priceElement.textContent = `₵${book.price || '0'}.00`;
        }

        bookElement.querySelector("button").addEventListener("click", () => {
          this.getBookId(book.idbooks);
        });

        container.appendChild(bookElement);
      } catch (error) {
        console.error("Error rendering featured book:", error);
      }
    });
  }

  renderPoetry(books) {
    if (!this.templates.poetry || !books) return;

    const container = document.querySelector("#poetry .indexbook-category");

    books.forEach((book) => {
      try {
        const bookElement = this.templates.poetry.cloneNode(true);
        bookElement.querySelector("#image").src = book.image || 'images/download.png';
        bookElement.querySelector("#image").alt = book.title || 'Poetry Book';
        bookElement.querySelector("#title").textContent = book.title || 'Unknown Title';
        bookElement.querySelector("#author").textContent = book.Author || 'Unknown Author';
        
        // Handle optional price field safely
        const priceElement = bookElement.querySelector("#price");
        if (priceElement) {
          priceElement.textContent = `₵${book.price || '0'}.00`;
        }

        bookElement.querySelector("button").addEventListener("click", () => {
          this.getBookId(book.idbooks);
        });

        container.appendChild(bookElement);
      } catch (error) {
        console.error("Error rendering poetry book:", error);
      }
    });
  }

  renderNonFiction(books) {
    if (!this.templates.nonfiction || !books) return;

    const container = document.querySelector("#nonfiction .indexbook-category");

    books.forEach((book) => {
      try {
        const bookElement = this.templates.nonfiction.cloneNode(true);
        bookElement.querySelector("#image").src = book.image || 'images/download.png';
        bookElement.querySelector("#image").alt = book.title || 'Non-Fiction Book';
        bookElement.querySelector("#title").textContent = book.title || 'Unknown Title';
        bookElement.querySelector("#author").textContent = book.Author || 'Unknown Author';
        
        // Handle optional price field safely
        const priceElement = bookElement.querySelector("#price");
        if (priceElement) {
          priceElement.textContent = `₵${book.price || '0'}.00`;
        }

        bookElement.querySelector("button").addEventListener("click", () => {
          this.getBookId(book.idbooks);
        });

        container.appendChild(bookElement);
      } catch (error) {
        console.error("Error rendering non-fiction book:", error);
      }
    });
  }

  getSeeMoreCat(category) {
    try {
      sessionStorage.setItem("category", category);
      window.location.href = "category";
    } catch (error) {
      console.error("Error navigating to category:", error);
      this.showError("Failed to navigate to category page");
    }
  }

  getBookId(bookID) {
    try {
      sessionStorage.setItem("selectedBook", bookID);
      window.location.href = "bookdetails";
    } catch (error) {
      console.error("Error navigating to book details:", error);
      this.showError("Failed to open book details");
    }
  }

  bindEvents() {
    // Bind see more buttons
    const seeMoreBtns = document.querySelectorAll('[onclick*="getSeeMoreCat"]');
    seeMoreBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.getSeeMoreCat(category);
      });
    });
  }

  setupConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('offline', () => {
      this.wasOffline = true;
      console.log('Connection lost');
      this.showError('Connection lost. Please check your internet connection.');
    });

    window.addEventListener('online', () => {
      if (this.wasOffline) {
        console.log('Connection restored, refreshing page...');
        this.showSuccess('Connection restored! Refreshing page...');
        // Small delay to show the success message before refresh
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      this.wasOffline = false;
    });

    // Check initial connection status
    if (!navigator.onLine) {
      this.wasOffline = true;
      this.showError('No internet connection detected.');
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bookHubApp = new BookHubApp();
});
