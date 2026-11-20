// client/src/app/partials/ShellWithRedux.jsx
"use client";

import {
  Suspense,
  useEffect,
  useState,
  lazy,
  memo,
} from "react";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HomeHero from "../../components/home/HomeHero.client";
import useMobile from "../../hooks/useMobile";
import { stripLocalePrefix } from "@/lib/seo/localePaths";
import {
  useBrandsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
} from "@/hooks/queries/useCatalogQueries";
import { useUserProfileQuery } from "@/hooks/queries/useUserProfileQuery";

const HomeSidebarFilters = lazy(() => import("../../components/home/HomeSidebarFilters"));
const CartMobileLink = lazy(() => import("../../components/CartMobile"));
const Modal = lazy(() => import("../../components/Modal"));
const Login = lazy(() =>
  import("../(auth)/login/page").then((mod) => ({ default: mod.default || mod }))
);

const PathAwareShell = memo(function PathAwareShell({ children }) {
  const pathname = usePathname();
  const [isMobile] = useMobile();
  const neutralPath = stripLocalePrefix(pathname);
  const isHome = neutralPath === "/";
  const isDashboard = neutralPath.startsWith("/dashboard");
  const showSidebar = isHome && !isMobile;
  const isCheckout = neutralPath === "/checkout";

  return (
    <>
      {isDashboard ? (
        <main className="min-h-screen bg-white">{children}</main>
      ) : (
        <main className="min-h-[78vh] bg-[#faf6f3] relative">
          {isHome && <HomeHero />}
          <div className="w-full py-1 px-2 sm:px-4 md:pl-0">
            <div className="flex flex-col md:flex-row gap-4">
              {showSidebar && !isCheckout && (
                <div className="w-full md:w-1/4 lg:w-1/5">
                  <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>}>
                    <HomeSidebarFilters />
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

  // These sync their results into Redux (allCategory/allSubCategory/allBrands)
  // for the rest of the app — the homepage sidebar no longer consumes them
  // directly, it fetches only what it needs itself.
  useCategoriesQuery({
    enabled: typeof window !== "undefined",
    initialData: initialNavData?.categories ?? [],
  });

  useSubCategoriesQuery({
    enabled: typeof window !== "undefined",
    initialData: initialNavData?.subCategories ?? [],
  });

  useBrandsQuery({
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
        <PathAwareShell>{children}</PathAwareShell>
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