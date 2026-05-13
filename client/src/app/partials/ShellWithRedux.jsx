// client/src/app/partials/ShellWithRedux.jsx
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  lazy,
  memo,
} from "react";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useMobile from "../../hooks/useMobile";
import {
  useBrandsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
} from "@/hooks/queries/useCatalogQueries";
import { useUserProfileQuery } from "@/hooks/queries/useUserProfileQuery";

const SideBar = lazy(() => import("../../components/SideBar"));
const CartMobileLink = lazy(() => import("../../components/CartMobile"));
const Modal = lazy(() => import("../../components/Modal"));
const Login = lazy(() =>
  import("../(auth)/login/page").then((mod) => ({ default: mod.default || mod }))
);

const PathAwareShell = memo(function PathAwareShell({
  children,
  navData,
  loadingStates,
}) {
  const pathname = usePathname();
  const [isMobile] = useMobile();
  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const showSidebar = isHome && !isMobile;
  const isCheckout = pathname === "/checkout";

  const categories = navData?.categories ?? [];
  const subCategories = navData?.subCategories ?? [];
  const brands = navData?.brands ?? [];

  const loadingCategoryOverride = loadingStates?.categories ?? false;
  const loadingBrandOverride = loadingStates?.brands ?? false;

  return (
    <>
      {isDashboard ? (
        <main className="min-h-screen bg-white">{children}</main>
      ) : (
        <main className="min-h-[78vh] bg-[#faf6f3] relative">
          <div className="container mx-auto py-1">
            <div className="flex flex-col md:flex-row gap-4">
              {showSidebar && !isCheckout && (
                <div className="w-full md:w-1/4 lg:w-1/5 bg-white/70 rounded-xl shadow-sm">
                  <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>}>
                    <SideBar
                      categoryData={categories}
                      subCategoryData={subCategories}
                      brandData={brands}
                      loadingCategory={loadingCategoryOverride}
                      loadingBrand={loadingBrandOverride}
                    />
                  </Suspense>
                </div>
              )}
              <div
                className={`w-full ${
                  showSidebar && !isCheckout ? "md:w-3/4 lg:w-4/5" : "w-full"
                } bg-white/80 rounded-xl shadow p-3`}
              >
                {children}
              </div>
            </div>
          </div>
        </main>
      )}
      {pathname !== "/checkout" && !isDashboard && (
        <Suspense fallback={null}>
          <CartMobileLink />
        </Suspense>
      )}
    </>
  );
});

function ShellWithRedux({ children, initialNavData }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  const [showLoginModal, setShowLoginModal] = useState(false);

  const categoriesQuery = useCategoriesQuery({
    enabled: typeof window !== "undefined",
    initialData: initialNavData?.categories ?? [],
  });

  const subCategoriesQuery = useSubCategoriesQuery({
    enabled: typeof window !== "undefined",
    initialData: initialNavData?.subCategories ?? [],
  });

  const brandsQuery = useBrandsQuery({
    enabled: typeof window !== "undefined",
  });

  useUserProfileQuery({
    enabled: typeof window !== "undefined",
  });

  useEffect(() => {
    const handler = () => setShowLoginModal(true);
    window.addEventListener("show-login", handler);
    return () => window.removeEventListener("show-login", handler);
  }, []);

  const navData = useMemo(
    () => ({
      categories: categoriesQuery.data ?? initialNavData?.categories ?? [],
      subCategories:
        subCategoriesQuery.data ?? initialNavData?.subCategories ?? [],
      brands: brandsQuery.data ?? [],
    }),
    [
      brandsQuery.data,
      categoriesQuery.data,
      initialNavData?.categories,
      initialNavData?.subCategories,
      subCategoriesQuery.data,
    ]
  );

  const loadingStates = useMemo(
    () => ({
      categories: categoriesQuery.isFetching || subCategoriesQuery.isFetching,
      brands: brandsQuery.isFetching,
    }),
    [brandsQuery.isFetching, categoriesQuery.isFetching, subCategoriesQuery.isFetching]
  );

  return (
    <>
      {!isDashboard && <Header />}

      <Suspense
        fallback={
          <div className="min-h-[78vh] bg-[#faf6f3] flex items-center justify-center">
            <div className="animate-pulse w-20 h-20 rounded-full bg-gray-200"></div>
          </div>
        }
      >
        <PathAwareShell navData={navData} loadingStates={loadingStates}>
          {children}
        </PathAwareShell>
      </Suspense>

      {showLoginModal && (
        <Suspense fallback={null}>
          <Modal open={showLoginModal} onClose={() => setShowLoginModal(false)}>
            <Login onSuccess={() => setShowLoginModal(false)} />
          </Modal>
        </Suspense>
      )}

      {!isDashboard && <Footer />}
      <Toaster />
    </>
  );
}

export default ShellWithRedux;