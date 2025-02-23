let offset = 0; // Track the offset for next fetch
let isFetching = false; // Prevent multiple fetches

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
    clonedTemplate.querySelector(".image").src = book.image;
    clonedTemplate.querySelector(".title").innerText = book.title;
    clonedTemplate.querySelector(".author").innerText = book.author;
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

// Initial fetch to load books
fetchCategories();

// Add scroll event listener to detect when the user reaches near the bottom of the page
window.addEventListener("scroll", handleScroll);

const headerName = sessionStorage.getItem("category");
document.querySelector("header h1").innerText =
  headerName == "%%" ? "Random" : headerName;
//book clicked id to bookdetails
function getBookId(bookID) {
  sessionStorage.setItem("selectedBook", bookID);
  console.log(bookID);
  window.location.href = "bookdetails";
}
