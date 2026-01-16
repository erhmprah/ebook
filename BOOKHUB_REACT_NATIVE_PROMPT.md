# BookHub React Native App Development Prompt

## 🎯 Project Overview
Build a comprehensive React Native mobile application for **BookHub**, a modern e-learning platform that provides access to digital books, educational quizzes, and interactive reading experiences. The app should seamlessly integrate with the existing Node.js/Express backend API and provide a native mobile experience for users.

---

## 📱 Core Application Features

### 1. Authentication System
**Google OAuth 2.0 Integration**
- Primary authentication method using Google Sign-In
- Automatic profile creation from Google account data
- Session management with secure token handling
- Fallback email/password authentication
- User onboarding flow for new Google OAuth users

### 2. User Profile Management
**Complete Profile System**
- View and edit user profile information
- Avatar upload with automatic resizing (thumb, medium, large)
- User settings management (notifications, themes, preferences)
- Activity log tracking
- Session management (view/terminate active sessions)
- Account deletion functionality
- Profile visibility settings (public, friends, private)

### 3. Book Catalog & Browsing
**Multi-Category Book Library**
- **Categories**: Textbooks, Storybooks, Folktale Books, Fable Books, Poetry Books, Picture Books, Non-Fiction, Biography Books, Comprehension Books, Religious/Moral Storybooks
- Infinite scroll pagination for book lists
- Featured books section
- Category-based filtering and browsing
- Search functionality across all books
- Book rating and review system
- Recently viewed books

### 4. Book Reading Experience
**Digital Reader**
- Native PDF reader with zoom, pan, and navigation
- Bookmark functionality for favorite pages
- Reading progress tracking
- Text size and font customization
- Dark/light reading modes
- Offline reading capabilities for purchased books
- Table of contents navigation
- Search within books

### 5. Purchase & Payment System
**Mobile Money Integration**
- **Payment Providers**: MTN Mobile Money, AirtelTigo Money, Telecel Cash
- Paystack payment gateway integration
- Secure payment processing
- Purchase history and receipts
- Gift book functionality
- Subscription management
- Free book downloads

### 6. Admin Features
**Content Management**
- Admin dashboard for book management
- Add new books with cover images and PDFs
- Category management
- User statistics and analytics
- Sales and revenue tracking
- Content moderation tools

### 7. Quiz & Learning System
**Educational Quizzes**
- Interactive quiz functionality
- Multiple question types (multiple choice, true/false, fill-in-blank)
- Score tracking and leaderboards
- Quiz history and progress
- Educational content integration
- Timed quizzes

---

## 🛠 Technical Requirements

### Frontend Architecture
**React Native Framework**
- React Native 0.72+ with TypeScript
- Navigation: React Navigation v6
- State Management: Redux Toolkit or Zustand
- API Client: Axios with interceptors
- Offline Storage: AsyncStorage + SQLite
- Image Handling: React Native Image Picker/Camera
- PDF Rendering: react-native-pdf
- Authentication: @react-native-google-signin/google-signin

### Backend Integration
**API Connection**
- Base URL: Configure via environment variables
- Session-based authentication with cookie handling
- File upload capabilities for avatars
- Image caching and optimization
- Error handling and retry logic
- Real-time updates where applicable

### UI/UX Design
**Modern Mobile Design**
- Material Design 3 principles
- Dark/Light theme support
- Responsive design for all screen sizes
- Smooth animations and transitions
- Accessibility features (screen reader support)
- Intuitive navigation patterns
- Loading states and skeleton screens

---

## 📊 Database Schema Integration

### User Tables
```
user_profiles: id, user_id, full_name, email, bio, phone, location, avatar_url, account_type, last_login
user_settings: user_id, email_notifications, push_notifications, profile_visibility, theme, font_size
user_sessions: session_token, ip_address, device_info, is_active, expires_at
user_activity_log: activity_type, activity_description, created_at
```

### Book Tables
```
books: idbooks, title, author, description, excerpt, category, price, image, book_file, status
categories: Multiple category support with hierarchical structure
```

---

## 🔗 API Endpoints Integration

### Authentication Endpoints
```javascript
POST /auth/google        // Google OAuth authentication
POST /register          // User registration
POST /login             // Email/password login
GET /logout             // User logout
```

### Book Management
```javascript
GET /indexFetch?category=%                    // Fetch random books by category
GET /categoryFetch?category=%&offset=0&limit=10  // Category-based pagination
GET /detailsFetch?id=1                      // Book details
```

### Profile Management
```javascript
GET /api/profile              // Get user profile + settings
PUT /api/profile              // Update profile information
POST /api/profile/avatar      // Upload avatar
GET /api/profile/sessions     // Get active sessions
DELETE /api/profile/account   // Delete user account
```

### Admin Operations
```javascript
POST /admin/insertbook        // Add new book (admin only)
```

---

## 🚀 Key Features Implementation

### 1. Authentication Flow
```javascript
// Google OAuth Integration
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
  offlineAccess: true,
});

// Authentication methods
const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  // Send to backend for session creation
};
```

### 2. Book Reading Component
```javascript
// PDF Reader Integration
import Pdf from 'react-native-pdf';

const BookReader = ({ bookUri, onBookmark, onProgress }) => {
  return (
    <Pdf
      source={{ uri: bookUri }}
      onLoadComplete={(numberOfPages, filePath) => {
        console.log(`Number of pages: ${numberOfPages}`);
      }}
      onPageChanged={(page, numberOfPages) => {
        onProgress(page / numberOfPages);
      }}
      style={styles.pdf}
    />
  );
};
```

### 3. Payment Integration
```javascript
// Paystack Integration
import PaystackPay from '@react-native-paystack/paystack';

const processPayment = async (amount, email, phone) => {
  const transaction = await PaystackPay.init({
    key: 'YOUR_PAYSTACK_PUBLIC_KEY',
    email: email,
    amount: amount * 100, // Convert to kobo
    currency: 'GHS',
    reference: generateReference(),
  });
  
  return transaction;
};
```

### 4. Offline Capabilities
```javascript
// Offline Storage with SQLite
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase('BookHub.db', '1.0', 'BookHub Database', 200000);

// Store downloaded books
const saveBookOffline = (bookData, pdfData) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO downloaded_books (book_id, title, pdf_data) VALUES (?, ?, ?)',
      [bookData.id, bookData.title, pdfData]
    );
  });
};
```

---

## 🎨 UI/UX Specifications

### Design System
- **Primary Colors**: Purple gradient (#667eea to #764ba2)
- **Secondary Colors**: Green accents for payments (#28a745)
- **Typography**: Nunito font family
- **Iconography**: Font Awesome icons
- **Cards**: Glassmorphism design with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations

### Screen Structure
```
Authentication
├── LoginScreen (Google OAuth primary)
├── RegistrationScreen
└── ForgotPasswordScreen

Main Application
├── HomeScreen (Dashboard with featured books)
├── BookCategoriesScreen
├── BookListScreen (by category)
├── BookDetailScreen
├── BookReaderScreen
├── ProfileScreen
├── SettingsScreen
├── PaymentScreen
├── QuizScreen
└── AdminScreen (conditional)
```

### Navigation Structure
- Tab-based navigation for main sections
- Stack navigation for detailed views
- Modal presentations for settings and profile
- Deep linking support
- Navigation state persistence

---

## 📱 Platform-Specific Features

### iOS Integration
- Face ID/Touch ID for app unlock
- Apple Sign-In integration
- iCloud sync for reading progress
- Haptic feedback for interactions
- Native share sheet for book recommendations

### Android Integration
- Google Sign-In native SDK
- Biometric authentication
- Android Auto support for audio books
- Notification actions
- Adaptive icons and themes

---

## 🔒 Security & Privacy

### Data Protection
- End-to-end encryption for sensitive data
- Secure token storage using Keychain (iOS) and Keystore (Android)
- Certificate pinning for API communications
- Biometric authentication for app access
- Privacy controls for data sharing

### GDPR Compliance
- User consent management
- Data export functionality
- Right to deletion
- Privacy policy integration
- Cookie consent for analytics

---

## 📈 Performance & Analytics

### Performance Optimization
- Image lazy loading and caching
- Virtualized lists for large datasets
- Bundle splitting and code optimization
- Memory management for PDF rendering
- Background sync for offline content

### Analytics Integration
- User behavior tracking
- Crash reporting with Sentry
- Performance monitoring
- A/B testing capabilities
- Custom event tracking

---

## 🧪 Testing Strategy

### Unit Testing
- Jest for component testing
- React Native Testing Library
- API mocking with MSW
- Snapshot testing for UI consistency

### Integration Testing
- Detox for end-to-end testing
- API integration testing
- Payment flow testing
- Authentication flow testing

### Device Testing
- Multiple screen sizes and densities
- iOS and Android versions
- Network conditions (2G, 3G, 4G, WiFi)
- Low memory scenarios

---

## 🚀 Deployment & Distribution

### App Store Preparation
- App Store Connect setup
- Google Play Console configuration
- Privacy policy and terms of service
- App icons and screenshots
- Description and keywords optimization

### CI/CD Pipeline
- GitHub Actions or GitLab CI
- Automated testing on pull requests
- Automatic builds and deployment
- Version management
- Release notes automation

---

## 📋 Implementation Phases

### Phase 1: Core Authentication & Profile (Weeks 1-2)
- Google OAuth integration
- User profile management
- Basic navigation structure
- UI theme implementation

### Phase 2: Book Catalog & Reading (Weeks 3-4)
- Book browsing and search
- PDF reader integration
- Book details and metadata
- Reading progress tracking

### Phase 3: Payment & Purchase (Week 5)
- Payment gateway integration
- Mobile money providers
- Purchase flow implementation
- Receipt and history

### Phase 4: Advanced Features (Weeks 6-7)
- Quiz functionality
- Admin panel integration
- Offline capabilities
- Performance optimization

### Phase 5: Polish & Testing (Week 8)
- UI/UX refinements
- Comprehensive testing
- Bug fixes and optimization
- App store preparation

---

## 💡 Additional Enhancement Ideas

### Future Features
- Social reading features (comments, sharing)
- Book recommendations using AI
- Audio book support
- Collaborative reading sessions
- Gamification with reading streaks
- Multi-language support
- Accessibility improvements
- WebSocket integration for real-time features

### Technical Improvements
- GraphQL API migration consideration
- Microservices backend architecture
- Advanced caching strategies
- Machine learning for recommendations
- Blockchain integration for digital rights
- AR/VR reading experiences

---

This comprehensive prompt provides all the necessary context and specifications to build a production-ready React Native application that matches the functionality and user experience of the existing BookHub web platform while leveraging native mobile capabilities for enhanced user engagement.