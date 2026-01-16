// Enhanced Book Display with Improved URL Handling and Error Recovery
document.addEventListener('DOMContentLoaded', function() {
  const bookSrc = sessionStorage.getItem("book");
  const iframe = document.getElementById("pdfFrame");
  const loadingDiv = document.getElementById('loading');

  console.log("=== BOOK DISPLAY DEBUG ===");
  console.log("BookDisplay script loaded");
  console.log("Book source from sessionStorage:", bookSrc);
  console.log("SessionStorage contents:", {
    book: sessionStorage.getItem("book"),
    selectedBook: sessionStorage.getItem("selectedBook")
  });

  if (!bookSrc) {
    console.error("No book source found in sessionStorage");
    showError("No book selected. Please go back and select a book to read.");
    return;
  }

  if (!iframe) {
    console.error("Iframe element not found");
    showError("Display error. Please refresh the page and try again.");
    return;
  }

  // Enhanced URL processing to handle Windows paths and various formats
  const processedUrl = processBookUrlEnhanced(bookSrc);
  console.log("=== BOOK LOADING DEBUG ===");
  console.log("Original URL from database:", bookSrc);
  console.log("Processed URL for iframe:", processedUrl);

  // Show loading state
  if (loadingDiv) {
    loadingDiv.style.display = 'flex';
  }

  // Detect Microsoft Edge and use alternative method
  if (isMicrosoftEdge()) {
    console.log("Microsoft Edge detected, using alternative PDF display method");
    displayPDFInEdge(bookSrc, processedUrl);
    return;
  }

  // Test PDF accessibility before loading for other browsers
  testPdfAccessibility(processedUrl).then(accessible => {
    if (!accessible) {
      console.error("PDF is not accessible at:", processedUrl);
      showError(`Cannot access the book file. Please check if the file exists.`);
      return;
    }

    // Set up enhanced iframe load handler
    iframe.onload = function() {
      console.log("Book loaded successfully");
      
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
      iframe.style.display = 'block';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      
      // Clear any error states
      const errorDiv = document.getElementById('bookError');
      if (errorDiv) {
        errorDiv.remove();
      }
      
      // Show success message
      showSuccess("Book loaded successfully!");
    };

    // Enhanced error handler with fallback options
    iframe.onerror = function() {
      console.error("Failed to load book iframe");
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
      iframe.style.display = 'none';
      
      // Show error with fallback options
      showErrorWithFallback(`Failed to load the book in iframe. This might be due to browser security restrictions. 
        
URL: ${processedUrl}

Would you like to try opening the book in a new window instead?`, processedUrl);
    };

    // Set a timeout in case the book takes too long to load
    const loadTimeout = setTimeout(() => {
      console.warn("Book loading timeout");
      if (loadingDiv && loadingDiv.style.display !== 'none') {
        loadingDiv.innerHTML = `
          <div class="spinner"></div>
          <div class="loading-text">
            <p>Loading book... This might take a moment for large files.</p>
            <button onclick="retryLoadingEnhanced()" style="
              background: rgba(102, 126, 234, 0.1);
              border: 2px solid #667eea;
              color: #667eea;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              cursor: pointer;
              margin-top: 1rem;
              font-weight: 500;
            ">Retry Loading</button>
          </div>
        `;
      }
    }, 8000);

    // Override the onload to clear the timeout
    const originalOnload = iframe.onload;
    iframe.onload = function() {
      clearTimeout(loadTimeout);
      if (originalOnload) originalOnload.call(this);
    };

    // Set the source with error handling
    try {
      console.log("Setting iframe src to:", processedUrl);
      iframe.src = processedUrl;
      console.log("PDF URL set successfully");
      
    } catch (error) {
      console.error("Error setting iframe source:", error);
      clearTimeout(loadTimeout);
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
      iframe.style.display = 'none';
      showError("Error loading book. Please try again.");
    }
  }).catch(error => {
    console.error("Error testing PDF accessibility:", error);
    showError("Error checking book availability. Please try again.");
  });
});

// Enhanced URL processing with better Windows path handling
function processBookUrlEnhanced(url) {
  if (!url) return '';

  console.log("Processing URL:", url);

  // Handle Windows paths with backslashes
  const normalizedUrl = url.replace(/\\/g, '/');
  console.log("Normalized URL:", normalizedUrl);

  // If it's already a full URL with /pdf/, return as is
  if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
    // If it's a direct uploads URL, convert to PDF route
    if (normalizedUrl.includes('/uploads/') && normalizedUrl.endsWith('.pdf')) {
      const filename = normalizedUrl.split('/uploads/')[1];
      return `/pdf/${filename}`;
    }
    console.log("Already a full URL:", normalizedUrl);
    return normalizedUrl;
  }

  // If it already contains uploads/, convert to PDF route
  if (normalizedUrl.includes('uploads/')) {
    const filename = normalizedUrl.replace(/^.*uploads\//, '');
    const pdfUrl = `/pdf/${filename}`;
    console.log("URL with uploads, converted to PDF route:", normalizedUrl, "→", pdfUrl);
    return pdfUrl;
  }

  // For simple filenames without path, use PDF route
  if (!normalizedUrl.includes('/') && normalizedUrl.endsWith('.pdf')) {
    const pdfUrl = `/pdf/${normalizedUrl}`;
    console.log("Simple PDF filename, added PDF route:", pdfUrl);
    return pdfUrl;
  }

  // For other relative paths, use PDF route
  const pdfUrl = `/pdf/${normalizedUrl}`;
  console.log("Other path, using PDF route:", pdfUrl);
  return pdfUrl;
}

// Test PDF accessibility before loading
async function testPdfAccessibility(url) {
  try {
    console.log("Testing PDF accessibility:", url);
    const response = await fetch(url, { method: 'HEAD' });
    const accessible = response.ok && response.headers.get('content-type') === 'application/pdf';
    console.log("PDF accessibility test result:", accessible);
    return accessible;
  } catch (error) {
    console.error("PDF accessibility test failed:", error);
    return false;
  }
}

// Enhanced error display
function showError(message) {
  console.error("Showing error:", message);
  
  // Create error display if it doesn't exist
  let errorDiv = document.getElementById('bookError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'bookError';
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(229, 62, 62, 0.95);
      backdrop-filter: blur(10px);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      border: 1px solid rgba(255, 255, 255, 0.1);
      white-space: pre-line;
    `;
    document.body.appendChild(errorDiv);
  }

  errorDiv.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
      <h3 style="margin: 0 0 1rem 0; color: white;"><i class="fas fa-exclamation-triangle"></i> Viewing Error</h3>
      <p style="margin: 0 0 1.5rem 0; font-size: 0.9rem; opacity: 0.9;">${message}</p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button onclick="goBack()" style="
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        color: #e53e3e;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">Go Back to Books</button>
      <button onclick="retryLoadingEnhanced()" style="
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        color: #667eea;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">Try Again</button>
    </div>
  `;
}

// Enhanced error display with fallback option for blocked PDFs
function showErrorWithFallback(message, pdfUrl) {
  console.error("Showing error with fallback:", message);
  
  // Create error display if it doesn't exist
  let errorDiv = document.getElementById('bookError');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'bookError';
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(229, 62, 62, 0.95);
      backdrop-filter: blur(10px);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      max-width: 600px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      border: 1px solid rgba(255, 255, 255, 0.1);
      white-space: pre-line;
    `;
    document.body.appendChild(errorDiv);
  }

  errorDiv.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
      <h3 style="margin: 0 0 1rem 0; color: white;"><i class="fas fa-exclamation-triangle"></i> PDF Blocked by Browser</h3>
      <p style="margin: 0 0 1.5rem 0; font-size: 0.9rem; opacity: 0.9;">${message}</p>
      <p style="margin: 0 0 1rem 0; font-size: 0.85rem; opacity: 0.8; font-style: italic;">
        This is common with Microsoft Edge due to security restrictions. Try the options below:
      </p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button onclick="openPDFInNewWindow('${pdfUrl}')" style="
        background: rgba(56, 161, 105, 0.9);
        backdrop-filter: blur(10px);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">📖 Open in New Window</button>
      <button onclick="goBack()" style="
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        color: #e53e3e;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">Go Back</button>
      <button onclick="retryLoadingEnhanced()" style="
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        color: #667eea;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      ">Try Again</button>
    </div>
  `;
}

// Open PDF in new window as fallback
function openPDFInNewWindow(url) {
  try {
    console.log("Opening PDF in new window:", url);
    
    // Close error dialog first
    const errorDiv = document.getElementById('bookError');
    if (errorDiv) {
      errorDiv.remove();
    }
    
    // Open in new window
    const newWindow = window.open(url, '_blank', 
      'width=1000,height=800,scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes,status=yes');
    
    if (!newWindow) {
      // If popup blocked, show instructions
      showError("Please allow pop-ups for this site to open the PDF in a new window.");
      
      // Also copy URL to clipboard as fallback
      try {
        navigator.clipboard.writeText(window.location.origin + url).then(() => {
          showSuccess("PDF URL copied to clipboard! You can manually paste it in a new tab.");
        });
      } catch (clipboardError) {
        console.log("Could not copy to clipboard:", clipboardError);
      }
    } else {
      showSuccess("Opening PDF in new window...");
    }
  } catch (error) {
    console.error("Error opening PDF in new window:", error);
    showError("Could not open PDF in new window. Please try right-clicking and selecting 'Open link in new tab'.");
  }
}

// Success message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(56, 161, 105, 0.95);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
    z-index: 10000;
    font-weight: 500;
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function goBack() {
  window.history.back();
}

// Enhanced retry loading
function retryLoadingEnhanced() {
  console.log("Retrying book load with enhanced logic...");
  
  // Clear any existing error
  const errorDiv = document.getElementById('bookError');
  if (errorDiv) {
    errorDiv.remove();
  }
  
  // Reload the page to restart the process
  window.location.reload();
}

// Legacy retry function for compatibility
function retryLoading() {
  retryLoadingEnhanced();
}

// Detect Microsoft Edge browser
function isMicrosoftEdge() {
  const userAgent = navigator.userAgent;
  const isEdge = /Edg\//.test(userAgent) || 
                 /Windows.*Edge\//.test(userAgent) ||
                 (navigator.userAgentData && navigator.userAgentData.brands && 
                  navigator.userAgentData.brands.some(brand => brand.brand === 'Microsoft Edge'));
  
  console.log("Browser detection:", {
    userAgent: userAgent,
    isEdge: isEdge,
    brands: navigator.userAgentData ? navigator.userAgentData.brands : 'not available'
  });
  
  return isEdge;
}

// Alternative PDF display method for Microsoft Edge
function displayPDFInEdge(bookSrc, processedUrl) {
  console.log("Using Edge-compatible PDF display method");
  
  // Hide iframe and loading states
  const iframe = document.getElementById("pdfFrame");
  const loadingDiv = document.getElementById('loading');
  
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
  
  if (iframe) {
    iframe.style.display = 'none';
  }

  // Create Edge-specific display
  const bookContainer = document.querySelector('.book-container');
  if (bookContainer) {
    bookContainer.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100%;
        padding: 2rem;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1); 
          padding: 2rem; 
          border-radius: 16px; 
          backdrop-filter: blur(10px);
          max-width: 500px;
          width: 100%;
        ">
          <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem;">
            <i class="fab fa-microsoft" style="color: #00BCF2; margin-right: 0.5rem;"></i>
            Microsoft Edge Detected
          </h2>
          <p style="margin: 0 0 1.5rem 0; font-size: 1rem; opacity: 0.9; line-height: 1.5;">
            Microsoft Edge has security restrictions that prevent PDF viewing in iframes. 
            We've opened the book in a new window for the best experience.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem;">
            <button onclick="openPDFInNewWindow('${processedUrl}')" style="
              background: rgba(255, 255, 255, 0.9);
              color: #667eea;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 600;
              font-size: 1rem;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            ">
              <i class="fas fa-external-link-alt"></i>
              Open Book Now
            </button>
            <button onclick="goBack()" style="
              background: rgba(255, 255, 255, 0.2);
              color: white;
              border: 2px solid rgba(255, 255, 255, 0.3);
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              cursor: pointer;
              font-weight: 600;
              font-size: 1rem;
              transition: all 0.3s ease;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            ">
              <i class="fas fa-arrow-left"></i>
              Go Back
            </button>
          </div>
          <div style="
            margin-top: 1.5rem; 
            padding: 1rem; 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 8px;
            font-size: 0.9rem;
            opacity: 0.8;
          ">
            <strong>Alternative browsers:</strong><br>
            For the best experience, try Chrome or Firefox which support in-page PDF viewing.
          </div>
        </div>
      </div>
    `;
  }

  // Automatically try to open the PDF in a new window after a short delay
  setTimeout(() => {
    openPDFInNewWindow(processedUrl);
  }, 1500);
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

// Initialize connection monitoring
setupConnectionMonitoring();
