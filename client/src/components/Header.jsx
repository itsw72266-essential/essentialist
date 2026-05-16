'use client'
import { memo, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { BsCart4 } from "react-icons/bs";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { HiPhone, HiMail } from 'react-icons/hi';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import { BiTimeFive } from 'react-icons/bi';
import Search from './Search'
import { useGlobalContext } from '@/providers/ReactQueryProvider'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import isAdmin from '../utils/isAdmin'
import {
  DASHBOARD_ADMIN_PATHS,
  DASHBOARD_USER_PATHS,
  AUTH_AND_ACCOUNT_PATHS,
} from '@/config/navigationPrefetch'

const Dropdown = dynamic(() => import('./Dropdown'), {
  loading: () => (
    <div className="h-9 w-44 animate-pulse rounded-md bg-zinc-800" aria-hidden />
  ),
});

const SideBar = dynamic(() => import('./SideBar'), {
  loading: () => (
    <div className="border-t border-purple-800 bg-white p-4">
      <div className="h-40 w-full animate-pulse rounded bg-gray-100" aria-hidden />
    </div>
  ),
});

const DisplayCartItem = dynamic(() => import('./DisplayCartItem'));

const Header = () => {
    const { t, i18n } = useTranslation()
    const locale = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('fr') ? 'fr' : 'en'
    const [isMobile] = useMobile()
    const pathname = usePathname()
    const isSearchPage = pathname === "/search"
    const router = useRouter()
    const user = useSelector((state) => state?.user)
    const [openUserMenu, setOpenUserMenu] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const { totalPrice, totalQty } = useGlobalContext()
    const [openCartSection, setOpenCartSection] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [categoryDropdown, setCategoryDropdown] = useState(null)
    const [offersDropdownOpen, setOffersDropdownOpen] = useState(false)
    const offersDropdownRef = useRef(null)
    const [offersDropdownMobileOpen, setOffersDropdownMobileOpen] = useState(false)
    const offersDropdownMobileRef = useRef(null)
    const headerRef = useRef(null)
    const searchBarRef = useRef(null)
    const [isClient, setIsClient] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');

    const navLinks = useMemo(() => [
        { title: t('header.home'), path: '/' },
        { title: t('header.brands'), path: '/brands' },
        { title: t('header.newHot'), path: '/new-arrival' },
        { title: t('header.blog'), path: '/blog' },
        { title: t('header.contactUs'), path: '/contact' }
    ], [t, i18n.language]);

    const calculateDeliveryDate = useCallback(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (tomorrow.getDay() === 0) {
            tomorrow.setDate(tomorrow.getDate() + 1);
        } else if (tomorrow.getDay() === 6) {
            tomorrow.setDate(tomorrow.getDate() + 2);
        }
        
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        setDeliveryDate(tomorrow.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', options));
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const timeRemaining = endOfDay.getTime() - now.getTime();
        
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setDeliveryTime(`${hours}h ${minutes}m`);
    }, [locale]);

    const handleCloseUserMenu = useCallback(() => setOpenUserMenu(false), []);

    const handleMobileUser = useCallback(() => {
        if (!user?._id) {
            router.push("/login")
            return
        }
        router.push("/user")
    }, [router, user]);

    const handleMobileMenuNavigate = useCallback(() => setMobileMenuOpen(false), []);
    const toggleCartSection = useCallback(() => setOpenCartSection(prev => !prev), []);
    const toggleUserMenu = useCallback(() => setOpenUserMenu(prev => !prev), []);
    const toggleMobileMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);

    useEffect(() => {
        setIsClient(true);
        calculateDeliveryDate();
        const minuteInterval = setInterval(calculateDeliveryDate, 60000);
        return () => clearInterval(minuteInterval);
    }, [calculateDeliveryDate]);

    useEffect(() => { setMobileMenuOpen(false) }, [pathname]);

    useEffect(() => {
        if (!openUserMenu || !user?._id) return undefined;
        const paths = isAdmin(user?.role)
            ? DASHBOARD_ADMIN_PATHS
            : DASHBOARD_USER_PATHS;
        paths.forEach((href) => {
            try {
                router.prefetch(href);
            } catch {
                /* noop */
            }
        });
        return undefined;
    }, [openUserMenu, user?._id, user?.role, router]);

    useEffect(() => {
        if (user?._id) return undefined;
        const t = setTimeout(() => {
            AUTH_AND_ACCOUNT_PATHS.forEach((href) => {
                try {
                    router.prefetch(href);
                } catch {
                    /* noop */
                }
            });
        }, 1600);
        return () => clearTimeout(t);
    }, [user?._id, router]);

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.desktop-dropdown')) setCategoryDropdown(null);
        };
        if (categoryDropdown) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [categoryDropdown]);

    useEffect(() => {
        const handler = (e) => {
            if (offersDropdownRef.current && !offersDropdownRef.current.contains(e.target)) setOffersDropdownOpen(false)
        }
        if (offersDropdownOpen) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [offersDropdownOpen]);

    const headerStyle = {
        transition: 'transform 0.3s ease-in-out',
        position: 'sticky',
        width: '100%',
        zIndex: 40
    };
    
    const showSidebar = !pathname.includes('/dashboard');

    return (
        <header ref={headerRef} className="bg-white shadow" style={headerStyle}>
            <div className="bg-pink-400 text-white px-2 py-1 sm:px-1 flex flex-col lg:flex-row items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-4">
                    <div className="flex items-center">
                        <HiPhone className="mr-1" />
                        <span>+237 655 22 55 69</span>
                    </div>
                    <div className="flex items-center">
                        <HiMail className="mr-1" />
                        <span>esssmakeup@gmail.com</span>
                    </div>
                </div>
                <div className="font-medium text-center w-full lg:w-auto py-1 lg:py-0 flex items-center justify-center">
                    <BiTimeFive className="mr-1 animate-pulse" />
                    <span>
                        {t('header.orderNow')} {deliveryDate} - {deliveryTime} 
                        <span className="inline-flex items-center ml-1 font-bold">{t('header.left')}</span>
                    </span>
                </div>
                <div className="flex items-center justify-center lg:justify-end w-full lg:w-auto gap-2 sm:gap-4 mt-1 lg:mt-0">
                    <LanguageSwitcher compact />
                    <div className="flex items-center cursor-pointer hover:text-purple-200 text-xs sm:text-sm">
                        <FaMapMarkerAlt className="mr-1" />
                        <span className="hidden sm:inline">Bonamoussadi, Carrefour Maçon, Douala, Cameroon</span>
                        <span className="inline sm:hidden">{t('header.store')}</span>
                    </div>
                </div>
            </div>

            <nav className="bg-black text-white px-2 sm:px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-shrink-0">
                        <Link prefetch href="/" className="flex items-center h-full">
                            {/* DESKTOP LOGO OPTIMIZED */}
                            <Image
                                src="/assets/logo.jpg"
                                width={130}
                                height={40}
                                alt="logo"
                                className="hidden lg:block"
                                style={{ maxWidth: "100%", objectFit: "contain", height: "auto" }}
                                priority={true}
                                fetchPriority="high"
                                unoptimized={true}
                            />
                            {/* MOBILE LOGO OPTIMIZED */}
                            <Image
                                src="/assets/logo.jpg"
                                width={120}
                                height={60}
                                alt="logo"
                                className="lg:hidden"
                                style={{ maxWidth: "100%", objectFit: "contain", height: "auto" }}
                                priority={true}
                                fetchPriority="high"
                                unoptimized={true}
                            />
                        </Link> 
                    </div>
                    {!(isSearchPage && isMobile) && (
                        <div ref={searchBarRef} className="flex-1 px-3 block">
                            <Search />
                        </div>
                    )}

                    <div className="flex flex-wrap">
                        <Link prefetch href="/orders" className="text-base sm:text-lg px-2 no-underline hover:underline hover:text-pink-300 hidden lg:flex items-center">
                            {t('header.myOrders')}
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-2">
                        {user?._id ? (
                            <div className="relative">
                                <div onClick={toggleUserMenu} className="flex select-none items-center gap-1 cursor-pointer text-lg font-bold">
                                    <span>{t('header.account')}</span>
                                    {openUserMenu ? <GoTriangleUp size={22} /> : <GoTriangleDown size={22} />}
                                </div>
                                {openUserMenu && (
                                    <div className='absolute right-0 top-9 z-50'>
                                        <div className='bg-white text-black rounded p-3 min-w-40 shadow-lg'>
                                            <UserMenu onSelect={handleCloseUserMenu} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link prefetch href="/login" className='text-lg px-2 hover:text-pink-400 transition-colors'>
                                {t('header.login')}
                            </Link>
                        )}
                        <button onClick={toggleCartSection} className="flex items-center gap-2 bg-pink-400 hover:bg-yellow-400 px-4 py-2 rounded text-white transition-colors duration-200">
                            <div className="animate-bounce"><BsCart4 size={24} /></div>
                            <div className="font-semibold text-sm text-left">
                                {isClient && cartItem[0] ? (
                                    <>
                                        <p>{totalQty} {t('header.items')}</p>
                                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                                    </>
                                ) : <p>{t('header.myCart')}</p>}
                            </div>
                        </button>
                    </div>

                    <div className="lg:hidden flex items-center gap-2">
                        <button className="text-white mx-1 relative" onClick={toggleCartSection}>
                            <BsCart4 size={24} />
                            {isClient && totalQty > 0 && (
                                <span className="absolute -top-2 -right-2 text-xs bg-pink-400 px-2 py-0.5 rounded-full font-bold">{totalQty}</span>
                            )}
                        </button>
                        <button className="text-white mx-1" onClick={handleMobileUser}>
                            <FaRegCircleUser size={24} />
                        </button>
                        <button className="text-white mx-1" onClick={toggleMobileMenu}>
                            {mobileMenuOpen ? <RiCloseLine size={30} /> : <RiMenu3Line size={30} />}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="hidden lg:block bg-black text-white border-t border-purple-800">
                <div className="max-w-screen-2xl mx-auto px-4">
                    <ul className="flex justify-center space-x-20">
                        {navLinks.map(link => (
                            <li key={link.path} className="flex items-center justify-between hover:text-purple-400 cursor-pointer">
                                <Link prefetch href={link.path}>{link.title}</Link>
                            </li>
                        ))}
                        <li className="flex items-center min-h-[2.5rem]"><Dropdown /></li>
                        <li className="relative flex items-center cursor-pointer" ref={offersDropdownRef} onMouseEnter={() => setOffersDropdownOpen(true)} onMouseLeave={() => setOffersDropdownOpen(false)}>
                            <button className="flex items-center gap-1 text-white px-2 py-2 hover:text-pink-400 focus:outline-none" onClick={() => setOffersDropdownOpen((o) => !o)} type="button">
                                {t('header.salesOffers')} 
                                <GoTriangleDown className={`ml-1 transform transition-transform ${offersDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {offersDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50">
                                    <Link prefetch href="/offers" className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-700 transition-colors" onClick={() => setOffersDropdownOpen(false)}>{t('header.offers')}</Link>
                                    <Link prefetch href="/clearance" className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-700 transition-colors" onClick={() => setOffersDropdownOpen(false)}>{t('header.clearance')}</Link>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>

            <div className={`lg:hidden fixed top-0 left-0 w-full h-screen z-50 bg-opacity-80 transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} flex overflow-y-auto bg-black`} style={{ backdropFilter: 'blur(5px)' }}>     
                <div className="bg-black text-black h-full flex flex-col overflow-y-auto" style={{ width: '80%' }}>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <Link prefetch href="/" onClick={() => setMobileMenuOpen(false)}>
                            <Image src="/assets/logo.jpg" width={120} height={60} alt="logo" style={{ maxWidth: "100%", objectFit: "contain", height: "auto" }} priority={true} unoptimized={true} />
                        </Link>
                        <button className="text-black" onClick={() => setMobileMenuOpen(false)}><RiCloseLine size={30} /></button>
                    </div>
                    <div className="block bg-white text-black font-bold">
                        <ul className="flex flex-col">
                            {navLinks.map(link => (
                                <li key={link.path} className="border-b border-gray-700">
                                    <Link prefetch href={link.path} className="block text-black px-4 py-4 hover:text-purple-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>{link.title}</Link>
                                </li>
                            ))}
                            <li ref={offersDropdownMobileRef} className="relative border-b border-gray-700">
                                <button className="w-full flex items-center justify-between px-4 py-4 text-black hover:text-pink-400 focus:outline-none transition-colors" onClick={() => setOffersDropdownMobileOpen((open) => !open)} type="button">
                                    {t('header.salesOffers')}
                                    <GoTriangleDown className={`ml-2 transform transition-transform ${offersDropdownMobileOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {offersDropdownMobileOpen && (
                                    <div className="bg-white rounded shadow-lg text-black mt-1 absolute left-4 w-40 z-50">
                                        <Link prefetch href="/offers" className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-700 transition-colors" onClick={() => { setOffersDropdownMobileOpen(false); setMobileMenuOpen(false); }}>{t('header.offers')}</Link>
                                        <Link prefetch href="/clearance" className="block px-4 py-2 hover:bg-pink-50 hover:text-pink-700 transition-colors" onClick={() => { setOffersDropdownMobileOpen(false); setMobileMenuOpen(false); }}>{t('header.clearance')}</Link>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                    {mobileMenuOpen && showSidebar && (
                        <div className="border-b border-purple-800">
                            <SideBar isMobile={true} onNavigate={handleMobileMenuNavigate} />
                        </div>
                    )}
                </div>
                <div className="flex-1" onClick={() => setMobileMenuOpen(false)} style={{ touchAction: 'none' }} />
            </div>
            {openCartSection && <DisplayCartItem close={() => setOpenCartSection(false)} />}
        </header>
    )
}

export default memo(Header)
