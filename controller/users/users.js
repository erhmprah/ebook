const path = require("path");

function index(req, res) {
  try {
    // Check for Passport authentication (Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.sendFile(path.join(__dirname, "..", "..", "views", "index.html"));
    } else if (req.session && req.session.login) {
      // Fallback for legacy session-based authentication
      res.sendFile(path.join(__dirname, "..", "..", "views", "index.html"));
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in index controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function bookDetails(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "bookdetails.html"));
  } catch (error) {
    console.error("Error in bookDetails controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function category(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "category.html"));
  } catch (error) {
    console.error("Error in category controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function categoryStats(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "category-stats.html"));
  } catch (error) {
    console.error("Error in categoryStats controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function login(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "auth", "login.html"));
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function signupSuccess(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "signupSuccess.html"));
  } catch (error) {
    console.error("Error in signupSuccess controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function signupFailure(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "signupFailure.ejs"));
  } catch (error) {
    console.error("Error in signupFailure controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function quiz(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "quiz.html"));
  } catch (error) {
    console.error("Error in quiz controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function choosePayment(req, res) {
  try {
    res.sendFile(
      path.join(__dirname, "..", "..", "views", "payment", "paymentMethod.html")
    );
  } catch (error) {
    console.error("Error in choosePayment controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function makePayments(req, res) {
  try {
    res.sendFile(
      path.join(__dirname, "..", "..", "views", "payment", "paymentContact.html")
    );
  } catch (error) {
    console.error("Error in makePayments controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Process payment submission with real Paystack integration
async function processPayment(req, res) {
  try {
    const { email, phone, provider, bookId, bookTitle } = req.body;

    // If a bookId is provided, fetch authoritative price from DB and use it
    let amount = req.body.amount || req.session.bookPrice;
    if (bookId) {
      try {
        const book = await fetchBookPrice(bookId);
        if (!book || typeof book.price === 'undefined') {
          return res.status(400).json({ success: false, message: 'Book not found' });
        }
        amount = parseFloat(book.price);
      } catch (dbErr) {
        console.error('Error fetching book price:', dbErr);
        return res.status(500).json({ success: false, message: 'Error fetching book price' });
      }
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Book price not found. Please go back and try again."
      });
    }

    // Ensure amount is a valid number
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid book price. Please try again."
      });
    }

    // Validate required fields
    if (!email || !phone || !provider) {
      return res.status(400).json({
        success: false,
        message: "Email, phone, and provider are required."
      });
    }

    console.log("Processing payment with Paystack:", {
      email,
      amount: parseFloat(amount),
      phone,
      provider,
      bookId,
      bookTitle
    });

    // Use the existing Paystack module to charge mobile money
  const { chargeMobileMoney } = require("../../apis/paystack/pay");

    try {
      // Initialize the mobile money charge
      const chargeResult = await chargeMobileMoney(
        parseFloat(amount),
        email,
        phone,
        provider
      );

      console.log("Paystack charge result:", chargeResult);

      if (chargeResult.status) {
        // Store payment reference in session for verification
        req.session.paymentReference = chargeResult.data.reference;

        res.json({
          success: true,
          message: "Payment initialized successfully",
          paymentData: {
            email,
            amount: parseFloat(amount),
            phone,
            provider,
            bookId,
            bookTitle,
            reference: chargeResult.data.reference,
            access_code: chargeResult.data.access_code
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: chargeResult.message || "Payment initialization failed"
        });
      }

    } catch (chargeError) {
      console.error("Paystack charge error:", chargeError);
      res.status(400).json({
        success: false,
        message: "Payment initialization failed: " + chargeError.message
      });
    }

  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed. Please try again."
    });
  }
}

// Initialize payment with Paystack (alternative method)
async function initializePayment(req, res) {
  try {
    const { email, amount: bodyAmount, phone, provider, bookId } = req.body;

    // Use DB price when bookId provided
    let amount = bodyAmount;
    if (bookId) {
      try {
        const book = await fetchBookPrice(bookId);
        if (!book || typeof book.price === 'undefined') {
          return res.status(400).json({ success: false, message: 'Book not found' });
        }
        amount = parseFloat(book.price);
      } catch (dbErr) {
        console.error('Error fetching book price:', dbErr);
        return res.status(500).json({ success: false, message: 'Error fetching book price' });
      }
    }

    console.log("Initializing payment with Paystack:", {
      email,
      amount: parseFloat(amount),
      phone,
      provider,
      bookId
    });

    // Validate required fields
    if (!email || !amount || !phone || !provider) {
      return res.status(400).json({
        success: false,
        message: "Email, amount, phone, and provider are required."
      });
    }

    // Use the existing Paystack module to charge mobile money
  const { chargeMobileMoney } = require("../../apis/paystack/pay");

    try {
      const chargeResult = await chargeMobileMoney(
        parseFloat(amount),
        email,
        phone,
        provider
      );

      if (chargeResult.status) {
        res.json({
          success: true,
          message: "Payment initialized successfully",
          paymentData: {
            email,
            amount: parseFloat(amount),
            phone,
            provider,
            reference: chargeResult.data.reference,
            access_code: chargeResult.data.access_code
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: chargeResult.message || "Payment initialization failed"
        });
      }

    } catch (chargeError) {
      console.error("Paystack charge error:", chargeError);
      res.status(400).json({
        success: false,
        message: "Payment initialization failed: " + chargeError.message
      });
    }

  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed"
    });
  }
}

// Payment success callback
function paymentSuccess(req, res) {
  try {
    const { reference, provider } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required"
      });
    }

    console.log("Verifying payment:", { reference, provider });

    // Use the existing Paystack module to verify payment
  const { verifyPayment } = require("../../apis/paystack/pay");

    // Verify payment with Paystack
    verifyPayment(reference).then((verification) => {
      console.log("Payment verification result:", verification);

      if (verification.status === 'success') {
        // Clear payment session data
        if (req.session) {
          req.session.paymentReference = null;
          req.session.bookPrice = null;
          req.session.bookTitle = null;
          req.session.bookId = null;
        }

        res.json({
          success: true,
          message: "Payment verified successfully",
          reference: reference,
          provider: provider,
          data: verification.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
          reference: reference,
          provider: provider
        });
      }
    }).catch((error) => {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification error: " + error.message
      });
    });

  } catch (error) {
    console.error("Error in payment success:", error);
    res.status(500).json({
      success: false,
      message: "Error processing payment success"
    });
  }
}

// Helper function to fetch book price from DB
const conn = require("../../connection");
async function fetchBookPrice(bookId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT price, title FROM books WHERE idbooks = ? LIMIT 1";
    conn.query(query, [bookId], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      // Ensure price is a number
      const row = results[0];
      const price = row.price !== null ? parseFloat(row.price) : null;
      resolve({ price, title: row.title });
    });
  });
}

function setPassword(req, res) {
  try {
    if (req.user) {
      res.render(
        path.join(__dirname, "..", "..", "views", "auth", "set-password.ejs"),
        { profile: req.user }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error in setPassword controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function read(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "bookDisplay.html"));
  } catch (error) {
    console.error("Error in read controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function profile(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "profile.html"));
  } catch (error) {
    console.error("Error in profile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function editProfile(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "edit-profile.html"));
  } catch (error) {
    console.error("Error in editProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function settings(req, res) {
  try {
    res.sendFile(path.join(__dirname, "..", "..", "views", "settings.html"));
  } catch (error) {
    console.error("Error in settings controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // Check session-based authentication as fallback
    if (req.session && req.session.login) {
      return next();
    }

    res.redirect("/login");
  } catch (error) {
    console.error("Error in ensureAuthenticated middleware:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

module.exports = {
  index,
  bookDetails,
  category,
  categoryStats,
  read,
  profile,
  editProfile,
  settings,
  login,
  setPassword,
  ensureAuthenticated,
  signupSuccess,
  signupFailure,
  quiz,
  choosePayment,
  makePayments,
  processPayment,
  initializePayment,
  paymentSuccess,
};
