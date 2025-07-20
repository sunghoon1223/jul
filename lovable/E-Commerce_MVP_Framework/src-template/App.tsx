import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatbotButton } from '@/components/chatbot/ChatbotButton';
import Index from '@/pages/Index';

// Direct imports for critical pages to fix production routing issues
import { ProductListPage } from '@/pages/ProductListPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';

// Lazy load other pages
const AboutPage = React.lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const SupportPage = React.lazy(() => import('@/pages/SupportPage').then(m => ({ default: m.SupportPage })));
const QualityPage = React.lazy(() => import('@/pages/QualityPage').then(m => ({ default: m.QualityPage })));
const DealersPage = React.lazy(() => import('@/pages/DealersPage').then(m => ({ default: m.DealersPage })));
const AdminPage = React.lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AuthPage = React.lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })));
const CheckoutSuccessPage = React.lazy(() => import('@/pages/CheckoutSuccessPage').then(m => ({ default: m.CheckoutSuccessPage })));
const AccountPage = React.lazy(() => import('@/pages/AccountPage').then(m => ({ default: m.AccountPage })));
const FAQPage = React.lazy(() => import('@/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const NoticePage = React.lazy(() => import('@/pages/NoticePage'));
const NoticeDetailPage = React.lazy(() => import('@/pages/NoticeDetailPage'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/categories/:categorySlug" element={<ProductListPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/about" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AboutPage />
                </Suspense>
              } />
                <Route path="/company" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AboutPage />
                </Suspense>
              } />
              <Route path="/support" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SupportPage />
                </Suspense>
              } />
              <Route path="/quality" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <QualityPage />
                </Suspense>
              } />
              <Route path="/dealers" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DealersPage />
                </Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPage />
                </Suspense>
              } />
              <Route path="/auth" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AuthPage />
                </Suspense>
              } />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/success" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CheckoutSuccessPage />
                </Suspense>
              } />
              <Route path="/account" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AccountPage />
                </Suspense>
              } />
              <Route path="/faq" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <FAQPage />
                </Suspense>
              } />
              <Route path="/notices" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NoticePage />
                </Suspense>
              } />
              <Route path="/notices/:id" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NoticeDetailPage />
                </Suspense>
              } />
              <Route path="*" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <NotFound />
                </Suspense>
              } />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
          <ChatbotButton />
        </div>
      </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;