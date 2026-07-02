import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CardsPage from './pages/CardsPage';
import MortgagesPage from './pages/MortgagesPage';
import DepositsPage from './pages/DepositsPage';
import { SelectedCardsProvider } from './hooks/useSelectedCards';
import { SelectedMortgagesProvider } from './hooks/useSelectedMortgages.jsx';
import { SelectedDepositsProvider } from './hooks/useSelectedDeposits.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './hooks/useToast.tsx';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LegalBanner from './components/LegalBanner.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import JsonLd, { organizationSchema, websiteSchema } from './components/JsonLd.jsx';

// Code-split everything that isn't the landing or one of the three browse
// pages — those load up-front so the perceived speed wedge holds. The rest
// (detail pages, compare flows, legal pages, login) come in on demand and
// chop ~250 KB off the initial JS bundle.
const CardDetailPage         = lazy(() => import('./pages/CardDetailPage'));
const ComparePage            = lazy(() => import('./pages/ComparePage'));
const CompareMortgagesPage   = lazy(() => import('./pages/CompareMortgagesPage.jsx'));
const HomeLoanDetailsPage    = lazy(() => import('./pages/HomeLoanDetailsPage.jsx'));
const HowWeMakeMoneyPage     = lazy(() => import('./pages/HowWeMakeMoneyPage'));
const DepositDetailPage      = lazy(() => import('./pages/DepositDetailPage'));
const CompareDepositsPage    = lazy(() => import('./pages/CompareDepositsPage.jsx'));
const FaqPage                = lazy(() => import('./pages/FaqPage'));
const ContactPage            = lazy(() => import('./pages/ContactPage'));
const TermsPage              = lazy(() => import('./pages/TermsPage'));
const PrivacyPage            = lazy(() => import('./pages/PrivacyPage'));
const LoginPage              = lazy(() => import('./pages/LoginPage.jsx'));
const EditorialStandardsPage = lazy(() => import('./pages/EditorialStandardsPage.jsx'));
const PrinciplesPage         = lazy(() => import('./pages/PrinciplesPage.jsx'));

function RouteFallback() {
  // Cheap skeleton — keeps the user oriented while the route chunk loads.
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="skeleton h-8 w-64 mb-4" />
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-5/6" />
    </div>
  );
}

function AppContent() {
  // The login gate is OPT-IN, not the default. Anyone can browse and compare
  // anonymously — that's the "zero sign-up" marketing wedge. The /login route
  // remains available for future admin/internal use.
  return (
    <>
      {/* Global schema.org markup — asserts brand identity to crawlers + LLMs.
          Injected once at the App root so every page benefits. */}
      <JsonLd id="schema-org-organization" schema={organizationSchema} />
      <JsonLd id="schema-org-website"      schema={websiteSchema} />

      <LegalBanner />
      <NavBar />
      <Suspense fallback={<RouteFallback />}>
        <CookieBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/credit-cards" element={<CardsPage />} />
          <Route path="/credit-cards/:id" element={<CardDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/compare-mortgages" element={<CompareMortgagesPage />} />
          <Route path="/how-we-make-money" element={<HowWeMakeMoneyPage />} />
          <Route path="/home-loans" element={<MortgagesPage />} />
          <Route path="/home-loans/:loanId" element={<HomeLoanDetailsPage />} />
          <Route path="/mortgages" element={<MortgagesPage />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/deposits/:id" element={<DepositDetailPage />} />
          <Route path="/compare-deposits" element={<CompareDepositsPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/editorial-standards" element={<EditorialStandardsPage />} />
          <Route path="/principles" element={<PrinciplesPage />} />
        </Routes>
      </Suspense>
      {/* Global non-dismissible "general information only" strapline shown
          above the Footer on every page — satisfies RG 234 expectations that
          general-advice warnings stay visible wherever financial info is shown. */}
      <div
        role="contentinfo"
        aria-label="General information notice"
        className="text-center text-[11px] text-ink-500 bg-ink-100 dark:bg-ink-900 border-t border-hairline-subtle py-2 px-4"
      >
        <strong className="text-ink-700 dark:text-ink-200">General information only.</strong>{' '}
        Not financial product advice. Read each issuer's PDS and TMD before applying.
      </div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SelectedCardsProvider>
          <SelectedMortgagesProvider>
            <SelectedDepositsProvider>
              <AppContent />
            </SelectedDepositsProvider>
          </SelectedMortgagesProvider>
        </SelectedCardsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
