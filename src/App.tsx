import { Navigate, Route, Routes } from 'react-router-dom'
import { CATALOG_ROOT_SLUGS } from '@/data/taxonomy'
import { RootLayout } from '@/layouts/RootLayout'
import { CheckoutLayout } from '@/layouts/CheckoutLayout'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProductPage } from '@/pages/ProductPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { SearchPage } from '@/pages/SearchPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { GuestOrderPage } from '@/pages/GuestOrderPage'
import { AccountIndexPage } from '@/pages/account/AccountIndexPage'
import { LoginPage } from '@/pages/account/LoginPage'
import { RegisterPage } from '@/pages/account/RegisterPage'
import { ForgotPasswordPage } from '@/pages/account/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/account/ResetPasswordPage'
import { OverviewPage } from '@/pages/account/OverviewPage'
import { OrdersPage } from '@/pages/account/OrdersPage'
import { OrderDetailPage } from '@/pages/account/OrderDetailPage'
import { InvoicesPage, ReturnsPage } from '@/pages/account/LaterPages'
import { AddressesPage } from '@/pages/account/AddressesPage'
import { AccountFavoritesPage } from '@/pages/account/AccountFavoritesPage'
import { ProfilePage } from '@/pages/account/ProfilePage'
import { SecurityPage } from '@/pages/account/SecurityPage'
import { PrivacyPage } from '@/pages/account/PrivacyPage'
import { AccountLayout } from '@/components/account/AccountLayout'
import { RedirectIfAuthed, RequireAuth } from '@/components/account/RequireAuth'
import { QuotePage } from '@/pages/QuotePage'
import {
  AboutPage,
  CustomerServicePage,
  FaqPage,
  MontagePage,
  ProjectsPage,
} from '@/pages/content/ServicePages'
import { ContactPage } from '@/pages/ContactPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage'
import { WithdrawPage } from '@/pages/WithdrawPage'
import { WithdrawalFormPage } from '@/pages/WithdrawalFormPage'
import {
  LegalBusinessTermsPage,
  LegalCookiesPage,
  LegalDeliveryPage,
  LegalDisclaimerPage,
  LegalPaymentPage,
  LegalPrivacyPage,
  LegalReturnsPage,
  LegalTermsPage,
  LegalWarrantyPage,
} from '@/pages/legal/LegalPages'
import { AdminLayout } from '@/admin/AdminLayout'
import { RequireStaff } from '@/admin/RequireStaff'
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage'
import { AdminDashboardPage } from '@/admin/pages/AdminDashboardPage'
import { AdminProductsPage } from '@/admin/pages/AdminProductsPage'
import { AdminProductEditorPage } from '@/admin/pages/AdminProductEditorPage'
import { AdminQualityPage } from '@/admin/pages/AdminQualityPage'
import { AdviesHubPage } from '@/pages/advies/AdviesHubPage'
import { AdviesArticlePage } from '@/pages/advies/AdviesArticlePage'
import {
  AdminAuditPage,
  AdminBrandsPage,
  AdminCategoriesPage,
  AdminContentPage,
  AdminCouponsPage,
  AdminCustomerDetailPage,
  AdminCustomersPage,
  AdminImportsPage,
  AdminIndexRedirect,
  AdminMediaPage,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminQuotesPage,
  AdminReturnsPage,
  AdminSeoPage,
  AdminSettingsPage,
  AdminSuppliersPage,
  AdminUsersPage,
} from '@/admin/pages/AdminResources'
import { AdminEmailPreviewPage } from '@/admin/pages/AdminEmailPreviewPage'
import { ScrollManager } from '@/components/navigation/ScrollManager'

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
      <Route path="scotdejewish/login" element={<AdminLoginPage />} />
      <Route element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route path="scotdejewish" element={<AdminIndexRedirect />} />
          <Route path="scotdejewish/dashboard" element={<AdminDashboardPage />} />
          <Route path="scotdejewish/orders" element={<AdminOrdersPage />} />
          <Route path="scotdejewish/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="scotdejewish/products" element={<AdminProductsPage />} />
          <Route path="scotdejewish/quality" element={<AdminQualityPage />} />
          <Route path="scotdejewish/products/new" element={<AdminProductEditorPage />} />
          <Route path="scotdejewish/products/:id" element={<AdminProductEditorPage />} />
          <Route path="scotdejewish/categories" element={<AdminCategoriesPage />} />
          <Route path="scotdejewish/brands" element={<AdminBrandsPage />} />
          <Route path="scotdejewish/suppliers" element={<AdminSuppliersPage />} />
          <Route path="scotdejewish/customers" element={<AdminCustomersPage />} />
          <Route path="scotdejewish/customers/:id" element={<AdminCustomerDetailPage />} />
          <Route path="scotdejewish/returns" element={<AdminReturnsPage />} />
          <Route path="scotdejewish/quotes" element={<AdminQuotesPage />} />
          <Route path="scotdejewish/coupons" element={<AdminCouponsPage />} />
          <Route path="scotdejewish/content" element={<AdminContentPage />} />
          <Route path="scotdejewish/media" element={<AdminMediaPage />} />
          <Route path="scotdejewish/imports" element={<AdminImportsPage />} />
          <Route path="scotdejewish/seo" element={<AdminSeoPage />} />
          <Route path="scotdejewish/settings" element={<AdminSettingsPage />} />
          <Route path="scotdejewish/email-preview" element={<AdminEmailPreviewPage />} />
          <Route path="scotdejewish/users" element={<AdminUsersPage />} />
          <Route path="scotdejewish/audit-log" element={<AdminAuditPage />} />
        </Route>
      </Route>
      <Route element={<CheckoutLayout />}>
        <Route path="afrekenen" element={<CheckoutPage />} />
      </Route>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="zoeken" element={<SearchPage />} />
        <Route path="assortiment" element={<CategoryPage />} />
        <Route path="favorieten" element={<FavoritesPage />} />
        <Route path="bestelling-volgen" element={<GuestOrderPage />} />
        <Route path="winkelwagen" element={<CartPage />} />
        <Route path="bestelling/bevestiging" element={<OrderConfirmationPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<LegalPrivacyPage />} />
        <Route path="cookies" element={<LegalCookiesPage />} />
        <Route path="algemene-voorwaarden" element={<LegalTermsPage />} />
        <Route path="bezorgen" element={<LegalDeliveryPage />} />
        <Route path="retourneren" element={<LegalReturnsPage />} />
        <Route path="garantie-en-klachten" element={<LegalWarrantyPage />} />
        <Route path="betalen" element={<LegalPaymentPage />} />
        <Route path="herroepen" element={<WithdrawPage />} />
        <Route path="herroepingsformulier" element={<WithdrawalFormPage />} />
        <Route path="disclaimer" element={<LegalDisclaimerPage />} />
        <Route path="zakelijk/voorwaarden" element={<LegalBusinessTermsPage />} />
        <Route path="zakelijk/offerte" element={<QuotePage />} />
        <Route path="offerte" element={<Navigate to="/zakelijk/offerte" replace />} />
        <Route path="over-ons" element={<AboutPage />} />
        <Route path="klantenservice" element={<CustomerServicePage />} />
        <Route path="veelgestelde-vragen" element={<FaqPage />} />
        <Route path="montage" element={<MontagePage />} />
        <Route path="projecten" element={<ProjectsPage />} />
        <Route path="advies" element={<AdviesHubPage />} />
        <Route path="advies/:slug" element={<AdviesArticlePage />} />
        {CATALOG_ROOT_SLUGS.map((slug) => (
          <Route key={slug} path={slug} element={<CategoryPage />} />
        ))}
        {CATALOG_ROOT_SLUGS.map((slug) => (
          <Route
            key={`${slug}-leaf`}
            path={`${slug}/:subSlug/:leafSlug`}
            element={<CategoryPage />}
          />
        ))}
        {CATALOG_ROOT_SLUGS.map((slug) => (
          <Route key={`${slug}-sub`} path={`${slug}/:subSlug`} element={<CategoryPage />} />
        ))}
        <Route path="account" element={<AccountIndexPage />} />
        <Route element={<RedirectIfAuthed />}>
          <Route path="account/inloggen" element={<LoginPage />} />
          <Route path="account/registreren" element={<RegisterPage />} />
          <Route path="account/wachtwoord-vergeten" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="account/wachtwoord-resetten" element={<ResetPasswordPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AccountLayout />}>
            <Route path="account/overzicht" element={<OverviewPage />} />
            <Route path="account/bestellingen" element={<OrdersPage />} />
            <Route path="account/bestellingen/:orderNumber" element={<OrderDetailPage />} />
            <Route path="account/facturen" element={<InvoicesPage />} />
            <Route path="account/retouren" element={<ReturnsPage />} />
            <Route path="account/adressen" element={<AddressesPage />} />
            <Route path="account/favorieten" element={<AccountFavoritesPage />} />
            <Route path="account/gegevens" element={<ProfilePage />} />
            <Route path="account/beveiliging" element={<SecurityPage />} />
            <Route path="account/privacy" element={<PrivacyPage />} />
          </Route>
        </Route>
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  )
}
