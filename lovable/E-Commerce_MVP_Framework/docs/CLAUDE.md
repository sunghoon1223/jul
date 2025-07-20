# CLAUDE.md - JP Caster Project Memory

## Project Overview
JP Caster e-commerce platform built with React + TypeScript + Supabase. This serves as a comprehensive memory file for Claude Code sessions.

## Current Status
- ✅ Supabase backend integration completed
- ✅ Authentication system implemented (USE_MOCK_AUTH = false)
- ✅ Cart service with full CRUD operations
- ✅ Order management with inventory tracking
- ✅ Product catalog with categories
- ✅ Windows/WSL compatibility issues resolved
- ✅ Core documentation created (MASTER_BUILD_GUIDE, BUILD_EXPERIENCES, AI_EXECUTION_GUIDE)

## Key Technical Achievements

### 1. Supabase Integration Success
- Transitioned from mock authentication to real Supabase auth
- Implemented comprehensive RLS policies
- Created cart service supporting both authenticated and anonymous users
- Order management with proper inventory tracking

### 2. Critical Files and Configurations
- `/src/hooks/useAuth.ts` - Authentication with `USE_MOCK_AUTH = false`
- `/src/services/cartService.ts` - Complete cart service implementation
- `/src/services/orderService.ts` - Order management with inventory
- `/.npmrc` - Fixed Windows compatibility (removed Linux paths)
- `/vite.config.ts` - Optimized build configuration

### 3. Database Schema
```sql
-- Key tables: categories, products, cart_items, orders, order_items
-- RLS policies implemented for security
-- Foreign key relationships established
```

### 4. Success Patterns
- Service-oriented architecture with clear interfaces
- Proper error handling and user feedback
- Responsive design with mobile-first approach
- TypeScript for type safety
- Context + Custom Hooks for state management

## Common Issues Resolved

### Windows/WSL Compatibility
- **Issue**: `.npmrc` contained Linux paths causing `npm: command not found`
- **Solution**: Removed `prefix=/home/plusn/.npm-global` from `.npmrc`

### Cart Service Issues
- **Issue**: Missing `product_id` field in cart items
- **Solution**: Added `product_id: product.id` to cart item creation

### Supabase Raw SQL
- **Issue**: Attempted to use non-existent `supabase.raw()` method
- **Solution**: Used standard Supabase update queries with proper error handling

## Development Environment
- Node.js with npm
- Vite dev server on port 5173
- Supabase for backend services
- Local development with hot reload

## Key Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Code linting
npm run preview      # Preview production build
```

## RAG Memory Contents
This project serves as a template for future e-commerce platforms. The foundation is solid and can be adapted by:
1. Changing UI/branding (colors, layout, components)
2. Modifying database schema for specific business needs
3. Updating business logic for different requirements
4. Maintaining the same architectural patterns

## Next Steps
- Complete any remaining project functionality
- Test all features thoroughly
- Deploy to production environment
- Finalize complete documentation set

## Architecture Overview
- React 18.3.1 + TypeScript 5.5.3
- Vite 5.4.1 for build tooling
- Tailwind CSS 3.4.11 + shadcn/ui components
- Supabase for backend (PostgreSQL + Auth + Storage)
- React Router DOM for navigation
- Context API for state management

## Performance Optimizations
- Manual chunks for vendor libraries
- Lazy loading for routes
- Image optimization with fallbacks
- Proper error boundaries

This memory file captures all essential information for continuing work on the JP Caster project across different Claude Code sessions.