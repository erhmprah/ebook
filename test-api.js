const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing BookHub API...\n');

    // Test different categories
    const categories = ['Textbooks', 'Storybooks', '%%', 'Poetry Books', 'Informational / Non-Fiction Books'];
    
    for (const category of categories) {
      console.log(`📚 Testing category: ${category}`);
      
      try {
        const response = await fetch(`http://localhost:4000/indexFetch/?category=${encodeURIComponent(category)}`);
        
        if (response.ok) {
          const books = await response.json();
          console.log(`   ✅ Success: Found ${books.length} books`);
          
          if (books.length > 0) {
            const firstBook = books[0];
            console.log(`   📖 Sample book: "${firstBook.title}" by ${firstBook.Author}`);
          }
        } else {
          console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('🎯 API Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Install node-fetch if not available
try {
  require('node-fetch');
  testAPI();
} catch (error) {
  console.log('📦 Installing node-fetch...');
  console.log('Please run: npm install node-fetch');
}