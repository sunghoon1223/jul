# JP Caster E-commerce Project - AI Development Standards

## Project Overview

- **Technology Stack**: React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.1 + Supabase
- **Purpose**: Korean industrial caster e-commerce platform
- **Port**: Must always use 8080 (never change to 5173)
- **Architecture**: Domain-driven component organization with strict separation of concerns

## Critical Configuration Rules

### Port Configuration
- **MUST** use port 8080 in vite.config.ts
- **NEVER** change to default Vite port 5173
- **REASON**: Port change causes white screen issues and breaks existing configurations

### Icon Import Requirements
- **MUST** import ALL used icons from lucide-react in single import statement
- **CRITICAL**: Missing icon imports cause JavaScript runtime errors and white screen
- **EXAMPLE**: `import { Menu, X, Search, ShoppingCart, User, LogOut, Phone, Award, MapPin, ChevronDown, Globe, Grid3X3, Settings, Truck, Star, Shield } from "lucide-react"`
- **VERIFICATION**: Check all icon usage in components before deployment

## Project Architecture Standards

### Directory Structure (DO NOT MODIFY)
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── cart/          # Cart functionality
│   ├── common/        # Shared components
│   ├── layout/        # Layout components (Header, Footer)
│   ├── product/       # Product-related components
│   └── ui/            # Radix UI components
├── hooks/             # Custom React hooks
├── pages/             # Route components
├── data/              # JSON data files
├── integrations/      # Supabase integration
├── contexts/          # React context providers
├── types/             # TypeScript definitions
└── utils/             # Utility functions
```

### Component Modification Rules
- **PRESERVE** existing directory structure
- **MAINTAIN** component naming conventions
- **ENSURE** proper TypeScript types
- **VALIDATE** all icon imports before saving

## State Management Patterns

### Cart System
- **CENTRAL**: useCart hook manages all cart state
- **COMPONENTS**: CartDrawer, CartItem work together
- **DEBUGGING**: Console logs are enabled for cart operations
- **SYNCHRONIZATION**: Cart count must sync across Header and CartDrawer

### Authentication System
- **DUAL LAYER**: User authentication + Admin authentication
- **HOOKS**: useAuth for users, useAdmin for admin functions
- **MODALS**: AuthModal for users, AdminLoginModal for admins
- **NAVIGATION**: Automatic redirect after successful login

### Language Support
- **CONTEXT**: LanguageContext provides translation functions
- **COMPONENT**: LanguageSwitcher handles language switching
- **KEYS**: Translation keys must exist in context provider

## Supabase Integration Requirements

### Environment Variables
- **REQUIRED**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- **OPTIONAL**: VITE_GEMINI_API_KEY
- **VALIDATION**: Must verify environment variables are loaded

### Database Operations
- **CLIENT**: Use src/integrations/supabase/client.ts
- **TYPES**: Import from src/integrations/supabase/types.ts
- **ERROR HANDLING**: Implement proper error boundaries

## Testing and Verification Standards

### Playwright Testing
- **REQUIRED**: Use Playwright for all UI verification
- **SCRIPTS**: Create test scripts for critical functionality
- **SCREENSHOTS**: Capture screenshots for visual verification
- **CONSOLE LOGS**: Monitor browser console for errors

### Development Server
- **STARTUP**: npm run dev must work without errors
- **VERIFICATION**: Test on localhost:8080
- **BROWSER TESTING**: Test in multiple browsers (Chrome, Edge)

## Build System Requirements

### Vite Configuration
- **PORT**: 8080 (never change)
- **HOST**: 0.0.0.0 for external access
- **PLUGINS**: React SWC, component tagger for development
- **CHUNK SPLITTING**: Maintain existing vendor chunks

### TypeScript Configuration
- **STRICT**: Maintain strict TypeScript checking
- **PATHS**: Use @ alias for src directory
- **TYPES**: Ensure all components have proper types

## Prohibited Actions

### Architecture Changes
- **NEVER** change port from 8080 to 5173
- **NEVER** modify directory structure
- **NEVER** remove environment variable definitions
- **NEVER** change build configuration without testing

### Component Modifications
- **NEVER** remove icon imports without verification
- **NEVER** modify state management patterns
- **NEVER** break component dependencies
- **NEVER** remove TypeScript types

### Testing Bypasses
- **NEVER** deploy without Playwright verification
- **NEVER** ignore console errors
- **NEVER** skip screenshot verification
- **NEVER** commit broken functionality

## Multi-File Coordination Requirements

### Icon Updates
- **WHEN**: Adding new icons to any component
- **MUST**: Update import statement in that component
- **VERIFY**: Test all icon usage with Playwright

### Cart System Changes
- **WHEN**: Modifying cart functionality
- **MUST**: Update useCart hook, CartDrawer, and Header simultaneously
- **VERIFY**: Test cart count synchronization

### Language Support
- **WHEN**: Adding new translations
- **MUST**: Update LanguageContext and all related components
- **VERIFY**: Test language switching functionality

### Authentication Changes
- **WHEN**: Modifying auth system
- **MUST**: Update useAuth, AuthModal, and Header together
- **VERIFY**: Test login/logout flows

## AI Decision-Making Standards

### Error Handling Priority
1. **FIRST**: Check console logs for JavaScript errors
2. **SECOND**: Verify all imports and dependencies
3. **THIRD**: Test with Playwright before declaring success
4. **FOURTH**: Capture screenshots for visual verification

### Component Modification Priority
1. **FIRST**: Read existing component structure
2. **SECOND**: Preserve all existing functionality
3. **THIRD**: Add new functionality without breaking existing
4. **FOURTH**: Test thoroughly before completion

### Debugging Approach
1. **FIRST**: Use Playwright for automated testing
2. **SECOND**: Check browser console for errors
3. **THIRD**: Verify network requests and responses
4. **FOURTH**: Take screenshots for visual debugging

## Critical Success Criteria

### White Screen Prevention
- **VERIFY**: All icon imports are complete
- **VERIFY**: Port is set to 8080
- **VERIFY**: No JavaScript runtime errors
- **VERIFY**: Playwright tests pass

### Functionality Verification
- **VERIFY**: Cart operations work correctly
- **VERIFY**: Authentication flows work
- **VERIFY**: Language switching works
- **VERIFY**: All navigation works

### Performance Standards
- **VERIFY**: Development server starts within 30 seconds
- **VERIFY**: Page loads within 5 seconds
- **VERIFY**: No memory leaks or performance issues
- **VERIFY**: Build process completes successfully