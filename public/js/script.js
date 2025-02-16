//index script.............................................

const book = document.querySelectorAll(".book");

book.forEach((book) => {
  book.addEventListener("click", function () {
    location.href = "bookdetails";
  });
});

let fetchedBooks;

// Fetch books from API
async function fetchBook() {
  try {
    const response = await fetch(
      `http://localhost:4000/indexFetch/?category=${encodeURIComponent(
        "Text book"
      )}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error("cannot fetch");
    }

    fetchedBooks = data;
    console.log(data);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

fetchBook();
