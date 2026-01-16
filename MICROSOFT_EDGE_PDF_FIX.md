# Microsoft Edge PDF Display Fix

## Issue: "blocked page has been blocked by Microsoft Edge"

Microsoft Edge has strict security policies that can block iframe content from local development servers or cross-origin requests.

## Solutions

### 1. **Enable Local File Access in Edge**
1. Open Microsoft Edge
2. Navigate to: `edge://flags/`
3. Search for "Allow invalid certificates for resources loaded from localhost"
4. Enable this flag
5. Restart Edge

### 2. **Use HTTP Instead of HTTPS**
Make sure your application is running on HTTP (not HTTPS):
- Current URL: `http://localhost:4000` ✅
- Avoid: `https://localhost:4000` ❌

### 3. **Disable Enhanced Security (Temporary)**
1. Go to Edge Settings: `edge://settings/`
2. Navigate to "Privacy, search, and services"
3. Under "Security", turn OFF "Enhanced security mode"
4. Restart Edge

### 4. **Configure PDF Headers for Edge Compatibility**
Update the PDF serving headers in `routes/pdf.js`:

```javascript
// Enhanced headers for Microsoft Edge compatibility
router.get("/:filename", async (req, res) => {
  // ... existing code ...
  
  // Edge-compatible headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Add CORS header
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Security header
  
  // Remove Edge-blocking headers
  res.removeHeader('X-Frame-Options'); // This was blocking Edge
  
  // ... rest of code ...
});
```

### 5. **Alternative PDF Display Method**
If iframe continues to be blocked, use a new window approach:

```javascript
// In bookDisplay.js, replace iframe loading with:
function openPDFInNewWindow(url) {
  const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  if (!newWindow) {
    showError('Please allow pop-ups for this site to view the PDF');
  }
}
```

### 6. **Update Iframe Sandbox Attributes**
Modify the iframe in `bookDisplay.html`:

```html
<iframe class="holder" id="pdfFrame" 
  style="display: none;" 
  allowfullscreen 
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
</iframe>
```

### 7. **Browser Testing Recommendations**
For development, consider using:
- **Chrome** (most permissive for local development)
- **Firefox** (good middle ground)
- **Edge Chromium** (requires additional flags)

## Quick Fix for Edge Users

**Most Effective Solution**: Add this to your PDF route to disable the blocking header:

```javascript
// In routes/pdf.js, replace line 33:
// OLD: res.setHeader('X-Frame-Options', 'SAMEORIGIN');
// NEW: res.setHeader('X-Frame-Options', 'ALLOWALL');
```

This specifically targets the X-Frame-Options header that Microsoft Edge uses to block iframe content.

## Testing Steps

1. **Apply the header fix** to `routes/pdf.js`
2. **Restart your server**: `node index.js`  
3. **Clear Edge cache**: Ctrl+Shift+R (hard refresh)
4. **Test PDF display** in Edge
5. **If still blocked**, try the new window approach as fallback

The main culprit is the `X-Frame-Options: SAMEORIGIN` header which Edge interprets more strictly than other browsers.