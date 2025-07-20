# Phase 2: v0 프롬프트 완전 모음집

## 🎯 목표
v0.dev에서 복사-붙여넣기로 즉시 사용 가능한 이커머스 UI 생성 프롬프트들

## 🏠 1. 메인 홈페이지 생성 프롬프트

```
Create a modern e-commerce homepage for an industrial caster company with these requirements:

LAYOUT & STRUCTURE:
- Header with logo, navigation menu (Products, About, Support, Contact), search bar, cart icon, user menu
- Hero section with compelling headline, subtitle, and CTA button
- Featured products grid (3-4 products with images, names, prices)
- Categories section with image cards for different caster types
- Company value propositions (Quality, Reliability, Innovation)
- Newsletter signup section
- Footer with company info, links, social media

DESIGN STYLE:
- Professional industrial theme with yellow/amber accent colors
- Clean, modern typography (Inter or similar)
- High-quality product photography placeholders
- Responsive grid layouts
- Subtle shadows and rounded corners
- Professional color scheme: navy blue primary, yellow accent, gray neutrals

COMPONENTS NEEDED:
- Navigation with dropdown menus
- Hero banner with background image
- Product cards with hover effects
- Category cards with overlay text
- Feature icons with descriptions
- Newsletter form with validation
- Mobile-responsive hamburger menu

CONTENT FOCUS:
- Industrial casters and wheels
- Heavy-duty, AGV, specialty casters
- B2B professional audience
- Quality and reliability messaging

Please use Tailwind CSS and create reusable components with TypeScript interfaces.
```

## 🛍️ 2. 제품 목록 페이지 프롬프트

```
Create a comprehensive product listing page for an industrial caster e-commerce site:

LAYOUT REQUIREMENTS:
- Breadcrumb navigation at top
- Left sidebar with filters (categories, price range, features, brand)
- Main content area with product grid
- Sort dropdown (price, name, popularity, newest)
- Pagination at bottom
- Results count display
- Filter tags showing active filters

PRODUCT GRID:
- Responsive grid (4 columns desktop, 2 tablet, 1 mobile)
- Product cards with:
  - High-quality product image
  - Product name and SKU
  - Price display
  - Key specifications (load capacity, wheel material)
  - Add to cart button
  - Quick view button
  - Wishlist/favorite icon
  - Stock status indicator

FILTER SIDEBAR:
- Category tree with expand/collapse
- Price range slider
- Checkbox filters for:
  - Load capacity ranges
  - Wheel materials (polyurethane, rubber, nylon)
  - Bearing types
  - Special features (brake, swivel, rigid)
- Clear all filters button

INTERACTIVE FEATURES:
- Real-time filtering without page reload
- Loading states for filter applications
- Empty states when no products match
- Search within results
- Quick preview modal
- Advanced sort options

DESIGN SPECIFICATIONS:
- Industrial theme with professional aesthetics
- Yellow/amber accent colors
- Clean typography and spacing
- Hover effects and smooth transitions
- Mobile-first responsive design
- Accessibility considerations

Use modern React with TypeScript, Tailwind CSS, and include proper loading and error states.
```

## 🔍 3. 제품 상세 페이지 프롬프트

```
Design a detailed product page for industrial caster products with these specifications:

PAGE STRUCTURE:
- Breadcrumb navigation
- Two-column layout: image gallery left, product info right
- Product image gallery with zoom functionality
- Tabbed content section below (specifications, features, reviews)
- Related products section
- Recently viewed products

LEFT COLUMN - IMAGE GALLERY:
- Main large product image with zoom on hover
- Thumbnail strip below (3-4 additional angles)
- 360-degree view option
- Image lightbox modal
- High-resolution placeholder images

RIGHT COLUMN - PRODUCT INFO:
- Product name and SKU
- Star rating and review count
- Price display with any discounts
- Stock status with quantity
- Key specifications table:
  - Load capacity
  - Wheel diameter
  - Wheel material
  - Bearing type
  - Installation method
- Quantity selector
- Add to cart button (prominent)
- Add to wishlist button
- Share product buttons
- Inquiry/quote request button

TABBED CONTENT SECTION:
1. Detailed Specifications:
   - Complete technical specifications table
   - Dimensional drawings
   - Installation diagrams
   
2. Features & Benefits:
   - Bullet point list of key features
   - Use case scenarios
   - Application examples
   
3. Documents & Downloads:
   - Technical data sheets (PDF links)
   - CAD files download
   - Installation guides
   
4. Customer Reviews:
   - Review list with ratings
   - Write review form
   - Review statistics

DESIGN REQUIREMENTS:
- Professional industrial aesthetic
- Yellow/amber accent colors for CTAs
- Clear hierarchy and readability
- Mobile-responsive design
- Fast loading considerations
- SEO-friendly structure

INTERACTIVE ELEMENTS:
- Image zoom and gallery
- Quantity increment/decrement
- Specifications toggle
- Review form validation
- Add to cart confirmation
- Stock level warnings

Create with React, TypeScript, and Tailwind CSS. Include proper loading states and error handling.
```

## 🛒 4. 장바구니 및 체크아웃 프롬프트

```
Create a complete shopping cart and checkout flow for a B2B industrial caster website:

SHOPPING CART PAGE:
- Cart items table with columns:
  - Product image thumbnail
  - Product name and SKU
  - Unit price
  - Quantity selector (with update button)
  - Line total
  - Remove item button
- Cart summary sidebar:
  - Subtotal
  - Estimated shipping
  - Tax calculation
  - Grand total
  - Promo code input
  - Proceed to checkout button
- Continue shopping link
- Save cart for later option
- Bulk quantity discount notifications

CHECKOUT PROCESS:
Multi-step checkout with progress indicator:

Step 1 - Customer Information:
- Guest checkout option vs account creation
- Business information:
  - Company name
  - Contact person
  - Business registration number
  - VAT number
- Contact details:
  - Email address
  - Phone number
  - Billing address form

Step 2 - Shipping Information:
- Same as billing checkbox
- Shipping address form
- Delivery method selection:
  - Standard shipping
  - Express shipping
  - Pickup from warehouse
- Delivery date preferences
- Special delivery instructions

Step 3 - Payment Information:
- Payment method selection:
  - Credit card
  - Bank transfer
  - Purchase order
  - Net terms (for approved accounts)
- Credit card form with validation
- Terms and conditions checkbox
- Privacy policy acceptance

Step 4 - Order Review:
- Complete order summary
- Edit links for each section
- Final total breakdown
- Place order button

ORDER CONFIRMATION:
- Order number display
- Order details summary
- Next steps information
- Email confirmation notice
- Account creation prompt (if guest)

DESIGN SPECIFICATIONS:
- Professional B2B aesthetic
- Clear progress indicators
- Form validation with error states
- Mobile-responsive design
- Security badges and trust signals
- Loading states for all interactions

FEATURES:
- Real-time cart updates
- Quantity bulk discounts
- Shipping calculator
- Address validation
- Payment processing simulation
- Order confirmation emails

Use React with TypeScript, form validation library (React Hook Form), and Tailwind CSS.
```

## 👤 5. 사용자 계정 페이지 프롬프트

```
Design a comprehensive user account dashboard for B2B customers:

ACCOUNT DASHBOARD LAYOUT:
- Sidebar navigation with sections:
  - Dashboard overview
  - Order history
  - Account details
  - Address book
  - Payment methods
  - Wishlist
  - Company settings
  - Support tickets

DASHBOARD OVERVIEW:
- Welcome message with user name
- Quick stats cards:
  - Total orders this year
  - Pending orders
  - Account credit/balance
  - Saved products count
- Recent orders table (last 5)
- Quick action buttons:
  - Reorder frequently bought items
  - Download invoices
  - Contact support
- Account status indicators

ORDER HISTORY:
- Searchable order table with:
  - Order number
  - Date
  - Status badge
  - Total amount
  - Actions (view, reorder, track, invoice)
- Advanced filters:
  - Date range picker
  - Order status
  - Amount range
- Export orders to CSV
- Detailed order view modal

ACCOUNT DETAILS:
- Editable profile form:
  - Personal information
  - Company details
  - Contact preferences
  - Notification settings
- Password change section
- Account security settings
- Delete account option

ADDRESS BOOK:
- Multiple shipping addresses
- Default billing address
- Add/edit/delete addresses
- Address validation
- Quick address selection for checkout

COMPANY SETTINGS (B2B specific):
- Company profile information
- Authorized buyers list
- Spending limits and approvals
- Purchase order settings
- Tax exemption certificates
- Credit terms and limits

WISHLIST/SAVED ITEMS:
- Saved product grid
- Add to cart from wishlist
- Share wishlist functionality
- Notes on saved items
- Price alert settings

DESIGN REQUIREMENTS:
- Clean, professional interface
- Consistent with main site theme
- Mobile-responsive sidebar
- Data tables with sorting/filtering
- Status badges and progress indicators
- Form validation and success states

Create with React, TypeScript, and modern UI patterns. Include proper loading states and empty states for all sections.
```

## 📱 6. 반응형 모바일 네비게이션 프롬프트

```
Create a comprehensive mobile-first navigation system for an industrial e-commerce site:

MOBILE HEADER:
- Logo (left side)
- Search icon (expandable search bar)
- Cart icon with item count badge
- Hamburger menu icon (right side)

HAMBURGER MENU (Slide-out):
- User profile section at top:
  - Login/Register buttons (if not logged in)
  - User avatar and name (if logged in)
  - Quick account access
- Main navigation tree:
  - Products (expandable categories)
  - About Company
  - Support & Service
  - Contact
- Secondary actions:
  - Wishlist
  - Order tracking
  - Language/Currency selector
- Footer section:
  - Social media links
  - Contact information

EXPANDABLE SEARCH:
- Full-width search bar when activated
- Search suggestions dropdown
- Recent searches
- Popular products
- Category filter chips
- Voice search option

PRODUCT CATEGORY MENU:
- Hierarchical category structure
- Visual category cards with icons
- Popular products in each category
- "View all" links
- Breadcrumb navigation

MOBILE CART DRAWER:
- Slide-up from bottom
- Cart items with thumbnails
- Quantity controls
- Subtotal display
- Checkout button
- Continue shopping link

TABLET NAVIGATION:
- Hybrid approach between mobile and desktop
- Collapsible sidebar for categories
- Visible search bar
- Tablet-optimized grid layouts

DESIGN FEATURES:
- Smooth slide animations
- Touch-friendly button sizes (44px minimum)
- Swipe gestures support
- Backdrop blur effects
- iOS and Android native feel
- Dark/light mode support

ACCESSIBILITY:
- Screen reader support
- Keyboard navigation
- Focus management
- ARIA labels
- Color contrast compliance

PERFORMANCE:
- Lazy loading for menu items
- Optimized touch interactions
- Fast animations (60fps)
- Progressive enhancement

Create with React, TypeScript, and modern mobile UI patterns. Include gesture handling and smooth animations.
```

## 🎨 7. 디자인 시스템 및 컴포넌트 프롬프트

```
Create a comprehensive design system for an industrial caster e-commerce platform:

COLOR PALETTE:
Primary Colors:
- Navy Blue: #1e3a8a (primary brand color)
- Amber/Yellow: #f59e0b (accent, CTAs, highlights)
- Deep Blue: #1e40af (links, secondary actions)

Neutral Colors:
- White: #ffffff (backgrounds)
- Light Gray: #f8fafc (section backgrounds)
- Medium Gray: #64748b (text secondary)
- Dark Gray: #1e293b (text primary)
- Border Gray: #e2e8f0

Status Colors:
- Success Green: #10b981
- Warning Orange: #f59e0b
- Error Red: #ef4444
- Info Blue: #3b82f6

TYPOGRAPHY SCALE:
- Font Family: Inter (primary), system fonts fallback
- Headings: 
  - H1: 2.5rem (40px) - Page titles
  - H2: 2rem (32px) - Section headers
  - H3: 1.5rem (24px) - Card titles
  - H4: 1.25rem (20px) - Subsections
- Body: 1rem (16px) - Regular text
- Small: 0.875rem (14px) - Captions, meta
- Tiny: 0.75rem (12px) - Labels, badges

COMPONENT LIBRARY:

Buttons:
- Primary: Solid yellow background
- Secondary: Outline style
- Tertiary: Text only
- Sizes: sm, md, lg, xl
- States: default, hover, active, disabled, loading

Cards:
- Product cards with image, title, price
- Feature cards with icons
- Stat cards with numbers
- Info cards with content

Forms:
- Input fields with labels
- Select dropdowns
- Checkboxes and radio buttons
- File upload areas
- Form validation states

Navigation:
- Breadcrumbs
- Pagination
- Tab navigation
- Step indicators
- Menu dropdowns

Data Display:
- Tables with sorting
- Badge components
- Progress indicators
- Status badges
- Rating stars

Layout:
- Container components
- Grid systems
- Sidebar layouts
- Modal overlays
- Card grids

SPACING SYSTEM:
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Consistent margin and padding

ICONS:
- Lucide React icon library
- Consistent 24px size
- Stroke width: 2
- Industrial/technical theme

RESPONSIVE BREAKPOINTS:
- Mobile: 640px and below
- Tablet: 641px - 1024px
- Desktop: 1025px and above
- Large: 1280px and above

Create reusable React components with TypeScript interfaces, proper prop types, and Tailwind CSS styling.
```

## 🏢 8. 관리자 대시보드 프롬프트

```
Design a comprehensive admin dashboard for managing an industrial caster e-commerce platform:

DASHBOARD LAYOUT:
- Sidebar navigation (collapsible)
- Top header with notifications and user menu
- Main content area with tabs/sections
- Breadcrumb navigation
- Quick actions toolbar

SIDEBAR NAVIGATION:
- Dashboard Overview
- Product Management
- Order Management
- Customer Management
- Inventory Control
- Analytics & Reports
- Content Management
- System Settings
- User Management

DASHBOARD OVERVIEW:
- KPI cards grid:
  - Total Revenue (monthly/yearly)
  - Order Count
  - Active Products
  - Registered Customers
  - Low Stock Alerts
  - Pending Orders
- Recent activity feed
- Sales chart (line/bar chart)
- Top selling products
- Customer activity map

PRODUCT MANAGEMENT:
- Product listing table with:
  - Thumbnail image
  - Name and SKU
  - Category
  - Price
  - Stock level
  - Status (published/draft)
  - Actions (edit, delete, duplicate)
- Bulk actions (publish, unpublish, delete)
- Advanced filters and search
- Add new product button
- Import/export functionality

PRODUCT EDITOR:
- Tabbed interface:
  - Basic info (name, description, price)
  - Images (upload gallery)
  - Specifications (dynamic key-value pairs)
  - Inventory (stock, SKU, tracking)
  - SEO (meta title, description)
  - Categories and tags
- Rich text editor for descriptions
- Image upload with drag-and-drop
- Save draft functionality
- Preview product button

ORDER MANAGEMENT:
- Order listing with filters
- Order status workflow
- Customer communication tools
- Shipping label generation
- Invoice creation
- Refund processing
- Order timeline view

INVENTORY CONTROL:
- Stock level overview
- Low stock alerts
- Reorder point settings
- Supplier management
- Purchase order creation
- Stock movement history

ANALYTICS SECTION:
- Sales performance charts
- Product performance metrics
- Customer behavior analytics
- Conversion rate tracking
- Revenue forecasting
- Export capabilities

DESIGN REQUIREMENTS:
- Professional admin interface
- Data-heavy layouts with tables
- Chart visualizations
- Form-heavy interfaces
- Notification systems
- Loading states for all actions
- Responsive design for tablet use

FEATURES:
- Real-time updates
- Bulk operations
- Advanced filtering
- Export/import tools
- User permission controls
- Activity logging
- Search functionality

Create with React, TypeScript, data visualization library (Recharts), and admin-focused UI patterns.
```

## ✅ v0 사용 팁

### 프롬프트 최적화 방법:
1. **구체적인 요구사항 명시**: 레이아웃, 컴포넌트, 기능을 상세히 기술
2. **기술 스택 지정**: React, TypeScript, Tailwind CSS 명시
3. **디자인 스타일 가이드**: 색상, 타이포그래피, 간격 지정
4. **인터랙션 설명**: 호버 효과, 애니메이션, 상태 변화
5. **접근성 고려**: 키보드 네비게이션, 스크린 리더 지원

### 생성 후 개선 방법:
1. **실제 데이터 연동**: Supabase 클라이언트 통합
2. **상태 관리 추가**: React hooks, Context API
3. **에러 처리**: Loading, Error states 구현
4. **성능 최적화**: 이미지 최적화, 코드 스플리팅
5. **테스트 추가**: Unit tests, Integration tests

이 프롬프트들을 사용하면 v0에서 즉시 사용 가능한 고품질 이커머스 컴포넌트들을 생성할 수 있습니다.