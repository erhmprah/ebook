//index script.............................................

// const book = document.querySelectorAll(".indexbook");

// book.forEach((book) => {
//   book.addEventListener("click", function () {
//     location.href = "bookdetails";
//   });
// });

// Fetch books from API

const spinner = document.querySelector(".loading");
const mainContainer = document.getElementById("bookContainer");
mainContainer.style.display = "none";

async function fetchBooks(category) {
  try {
    const response = await fetch(
      `https://ebookmemo.vercel.app/indexFetch/?category=${encodeURIComponent(
        category
      )}`
    );
    if (!response.ok) {
      throw new Error(`Cannot fetch category: ${category}`);
    }
    if (response.ok) {
      setTimeout(() => {
        spinner.style.display = "none";
        mainContainer.style.display = "block";
      }, 1000);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching books in category "${category}":`, error);
    return null;
  }
}

async function fetchAllBooks() {
  try {
    const categories = ["novels", "Text book", "%%"];
    const requests = categories.map((category) => fetchBooks(category));
    const results = await Promise.all(requests);

    const [readingRockstars, bookWorms, bookShelf] = results;

    renderBookwormsBooks(bookWorms), renderDiscoveryBooks(bookShelf);
    renderRockStarBooks(readingRockstars);
    console.log(readingRockstars);
  } catch (error) {
    console.error("Error fetching all books:", error);
  }
}

//get reading rockstar container and its inner element

const readingRockstarContainer = document.querySelector(
  "#readingrockstars .indexbook-category"
);
const rockStarBookTemplate =
  readingRockstarContainer.querySelector(".indexbook");
readingRockstarContainer.innerHTML = "";
function renderRockStarBooks(readingRockstars) {
  // loop reading rocktstars in its container

  readingRockstars.forEach((book) => {
    const clonedTemplate = rockStarBookTemplate.cloneNode(true);
    clonedTemplate.querySelector("#image").src = `${book.image}`;
    clonedTemplate.querySelector("#title").innerText = `${book.title}`;
    clonedTemplate.querySelector("#author").innerText = `${book.author}`;
    readingRockstarContainer.appendChild(clonedTemplate);
    clonedTemplate.querySelector("button").addEventListener("click", () => {
      getBookId(book.idbooks);
    });
  });
}

//get bookwormsdelight container and its inner element
const bookwormsContainer = document.querySelector(
  "#bookwormsdelight .indexbook-category"
);
const bookwormTemplate = bookwormsContainer.querySelector(".indexbook");
bookwormsContainer.innerHTML = "";
function renderBookwormsBooks(bookWorms) {
  // loop reading rocktstars in its container

  bookWorms.forEach((book) => {
    //set display of original template to null
    const clonedTemplate = bookwormTemplate.cloneNode(true);
    clonedTemplate.querySelector("#image").src = `${book.image}`;
    clonedTemplate.querySelector("#title").innerText = `${book.title}`;
    clonedTemplate.querySelector("#author").innerText = `${book.author}`;
    bookwormsContainer.appendChild(clonedTemplate);
    clonedTemplate.querySelector("button").addEventListener("click", () => {
      getBookId(book.idbooks);
    });
  });
}

//get bookwormsdelight container and its inner element
const discoveryContainer = document.querySelector(
  "#bookshelfdiscovery .indexbook-category"
);
const discoveryTemplate = discoveryContainer.querySelector(".indexbook");
discoveryContainer.innerHTML = "";
function renderDiscoveryBooks(bookShelf) {
  // loop reading rocktstars in its container

  bookShelf.forEach((book) => {
    //set display of original template to null

    const clonedTemplate = discoveryTemplate.cloneNode(true);

    clonedTemplate.querySelector("#image").src = `${book.image}`;
    clonedTemplate.querySelector("#title").innerText = `${book.title}`;
    clonedTemplate.querySelector("#author").innerText = `${book.author}`;
    discoveryContainer.appendChild(clonedTemplate);
    clonedTemplate.querySelector("button").addEventListener("click", () => {
      getBookId(book.idbooks);
    });
  });
}

//see more category clicked
function getSeeMoreCat(category) {
  const seeMoreCategory = category;
  sessionStorage.setItem("category", seeMoreCategory);
  location.href = "category";
}

//book clicked id to bookdetails
function getBookId(bookID) {
  sessionStorage.setItem("selectedBook", bookID);
  console.log(bookID);
  window.location.href = "bookdetails";
}

fetchAllBooks();
