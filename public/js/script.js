//index script.............................................

const book = document.querySelectorAll(".book");

book.forEach((book) => {
  book.addEventListener("click", function () {
    location.href = "bookdetails";
  });
});
