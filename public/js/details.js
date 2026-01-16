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

  container.querySelector(".price").innerText = `₵${book[0].price}.00`;
  container.querySelector(".discription").innerText = book[0].Discription;

  container.querySelector(".excerpt").innerText = book[0].excerpt;
  // container.querySelector(".publisher").innerText = `not created in database`;
  container.querySelector("img").src = book[0].image;
  console.log(status);
  if (status.toLowerCase() == "free") {
    container.querySelector("#buy").style.display = "none";
  } else {
    container.querySelector("#getBook").style.display = "none";

    // Add click event listener to buy button
    const buyButton = container.querySelector("#buy");
    if (buyButton) {
      // Clear any existing event listeners
      buyButton.onclick = null;

      buyButton.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Buy button clicked for book:", book[0].title);
        console.log("Book price:", book[0].price);
        console.log("Book status:", status);

        // Store book details for payment form
        sessionStorage.setItem("bookPrice", book[0].price);
        sessionStorage.setItem("bookTitle", book[0].title);
        sessionStorage.setItem("bookId", bookId);

        console.log("Redirecting to payment method selection...");
        window.location.href = "/choosePayment";
      });

      console.log("Buy button event listener attached successfully");
      console.log("Button visibility:", buyButton.style.display);
      console.log("Button text:", buyButton.textContent);

      // Add a visual indicator that the button is clickable
      buyButton.style.cursor = "pointer";
      buyButton.title = "Click to proceed to payment";
    } else {
      console.error("Buy button element not found in container!");
      console.log("Available buttons:", container.querySelectorAll("button"));
    }
  }

  container.querySelector("#getBook").addEventListener("click", () => {
    sessionStorage.setItem("book", book[0].book);
    window.location.href = "read";
  });
};

window.addEventListener("load", () => {
   fetchBook();
 });

// Also add a global event listener for buy button clicks (more reliable)
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "buy") {
    console.log("Buy button clicked (global listener)");
    e.preventDefault();

    // Get book details from the current page
    const titleElement = document.querySelector(".title");
    const priceElement = document.querySelector(".price");
    const bookId = sessionStorage.getItem("selectedBook");

    if (titleElement && priceElement) {
      const title = titleElement.innerText.replace("Title: ", "");
      const priceText = priceElement.innerText;
      const price = priceText.replace("₵", "").replace(".00", "");

      console.log("Storing book details:", { title, price, bookId });

      // Store book details for payment form
      sessionStorage.setItem("bookPrice", price);
      sessionStorage.setItem("bookTitle", title);
      sessionStorage.setItem("bookId", bookId);

      // Navigate to payment method selection
      window.location.href = "/choosePayment";
        }
      }
    });
    
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
