async function fetchBook() {
  const bookId = sessionStorage.getItem("selectedBook");
  const response = await fetch(
    `http://localhost:4000/detailsFetch/?id=${encodeURIComponent(bookId)}`
  );

  const book = await response.json();
  const bookStatus = book[0].status;
  displayBooks(book, bookStatus);
}

//display book ..........
const container = document.querySelector(".book-details");

const displayBooks = (book, status) => {
  container.querySelector(".title").innerText = `Title: ${book[0].title}`;
  container.querySelector(".author").innerText = `Author: ${book[0].Author}`;
  container.querySelector(".publisher").innerText = `not created in database`;
  container.querySelector(
    ".publishedDate"
  ).innerText = `not created in database`;
  container.querySelector(".discription").innerText = book[0].Discription;
  container.querySelector(".excerpt").innerText = book[0].excerpt;
  container.querySelector(".publisher").innerText = `not created in database`;
  container.querySelector("img").src = book[0].image;
  console.log(status);
  if (status.toLowerCase() == "free") {
    container.querySelector("#buy").style.display = "none";
  } else {
    container.querySelector("#getBook").style.display = "none";
  }
};

window.addEventListener("load", () => {
  fetchBook();
});
