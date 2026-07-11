import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import {
  ChevronDown,
  Globe2,
  Heart,
  Home,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

import { useApp } from '../store/app';

import {
  type AuthUser,
  getCurrentUser,
  getStoredUser,
  isLoggedIn,
  logoutUser,
} from '../lib/api';


export default function Layout() {

  // ==================================================
  // ROUTER
  // ==================================================

  const navigate =
    useNavigate();


  // ==================================================
  // FAVORITES
  // ==================================================

  const favs =
    useApp(
      (state) =>
        state.favorites
    );


  // ==================================================
  // AUTH STATE
  // ==================================================

  const [
    loggedIn,
    setLoggedIn,
  ] =
    useState<boolean>(
      () =>
        isLoggedIn()
    );


  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      () =>
        getStoredUser()
    );


  // ==================================================
  // ACCOUNT MENU
  // ==================================================

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] =
    useState(false);


  const accountMenuRef =
    useRef<HTMLDivElement | null>(
      null
    );


  // ==================================================
  // DISPLAY NAME
  // ==================================================

  const fullName =
    user
      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
      : '';


  const displayName =
    fullName ||
    user?.username ||
    'My Account';


  // ==================================================
  // LOAD / UPDATE AUTH STATE
  // ==================================================

  useEffect(() => {

    async function updateAuthState() {

      const authenticated =
        isLoggedIn();


      setLoggedIn(
        authenticated
      );


      // ------------------------------------------
      // USER IS LOGGED OUT
      // ------------------------------------------

      if (
        !authenticated
      ) {

        setUser(
          null
        );

        setAccountMenuOpen(
          false
        );

        return;
      }


      // ------------------------------------------
      // LOAD CACHED USER FIRST
      // ------------------------------------------

      const storedUser =
        getStoredUser();


      if (
        storedUser
      ) {

        setUser(
          storedUser
        );

      }


      // ------------------------------------------
      // FETCH LATEST USER FROM BACKEND
      // GET /api/auth/me/
      // ------------------------------------------

      try {

        const currentUser =
          await getCurrentUser();


        setUser(
          currentUser
        );

      } catch (
        error
      ) {

        console.error(
          'Failed to load current user:',
          error
        );

      }

    }


    // Run when Layout first loads

    updateAuthState();


    // Run immediately after login/register/logout

    window.addEventListener(
      'auth-changed',
      updateAuthState
    );


    // Run when localStorage changes
    // from another browser tab

    window.addEventListener(
      'storage',
      updateAuthState
    );


    return () => {

      window.removeEventListener(
        'auth-changed',
        updateAuthState
      );


      window.removeEventListener(
        'storage',
        updateAuthState
      );

    };

  }, []);


  // ==================================================
  // CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
  // ==================================================

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node
        )
      ) {

        setAccountMenuOpen(
          false
        );

      }

    }


    document.addEventListener(
      'mousedown',
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

    };

  }, []);


  // ==================================================
  // LOGOUT
  // ==================================================

  function handleLogout() {

    logoutUser();


    setLoggedIn(
      false
    );


    setUser(
      null
    );


    setAccountMenuOpen(
      false
    );


    window.dispatchEvent(
      new Event(
        'auth-changed'
      )
    );


    navigate(
      '/'
    );

  }


  // ==================================================
  // COMPONENT
  // ==================================================

  return (

    <div className="min-h-screen flex flex-col bg-slate-50">


      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">


        {/* TOP BAR */}

        <div className="bg-brand-900 text-brand-50 text-xs">

          <div className="container-x flex items-center justify-between h-9">

            <span className="flex items-center gap-2">

              <Phone className="w-3.5 h-3.5" />

              +91 1800-200-7766 · Mon-Sat 9-7

            </span>


            <span className="hidden md:flex items-center gap-4">

              <Link
                to="/post"
                className="hover:text-white"
              >
                List your property
              </Link>

              <a className="hover:text-white cursor-pointer">
                Home loans
              </a>

              <Link
                to="/agents"
                className="hover:text-white"
              >
                For agents
              </Link>

            </span>

          </div>

        </div>


        {/* MAIN NAVBAR */}

        <div className="container-x h-16 flex items-center gap-6">


          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-2"
          >

            <span className="w-9 h-9 rounded-lg bg-brand-600 grid place-items-center text-white">

              <Home className="w-5 h-5" />

            </span>


            <span className="font-display font-extrabold text-xl">

              Estate

              <span className="text-brand-600">
                Hub
              </span>

            </span>

          </Link>


          {/* DESKTOP NAVIGATION */}

          <nav className="hidden lg:flex items-center gap-1 ml-4">

            {[
              [
                'Buy',
                '/buy',
              ],
              [
                'Rent',
                '/rent',
              ],
              [
                'New Launches',
                '/new-launches',
              ],
              [
                'Commercial',
                '/commercial',
              ],
              [
                'Agents',
                '/agents',
              ],
              [
                'About',
                '/about',
              ],
            ].map(
              ([
                label,
                href,
              ]) => (

                <NavLink
                  key={
                    href
                  }
                  to={
                    href
                  }
                  className={({
                    isActive,
                  }) =>
                    `px-3 py-2 text-sm font-semibold rounded-md ${
                      isActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-700 hover:text-brand-700'
                    }`
                  }
                >
                  {
                    label
                  }
                </NavLink>

              )
            )}

          </nav>


          {/* RIGHT SIDE */}

          <div className="ml-auto flex items-center gap-2">


            {/* SAVED PROPERTIES */}

            <Link
              to="/favorites"
              className="relative px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-700 flex items-center gap-1.5"
            >

              <Heart className="w-4 h-4" />

              <span className="hidden sm:inline">
                Saved
              </span>


              {favs.length > 0 && (

                <span className="absolute -top-0.5 -right-1 bg-gold-500 text-white text-[10px] w-4 h-4 grid place-items-center rounded-full">

                  {
                    favs.length
                  }

                </span>

              )}

            </Link>


            {/* ==================================================
                LOGGED IN USER
            ================================================== */}

            {loggedIn ? (

              <div
                ref={
                  accountMenuRef
                }
                className="relative"
              >


                {/* USER BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className="btn-outline !py-2 !px-3 text-sm flex items-center gap-2"
                >

                  <User className="w-4 h-4" />


                  <span className="hidden sm:inline max-w-[180px] truncate">

                    Hi, {
                      displayName
                    }

                  </span>


                  <span className="sm:hidden">

                    Hi

                  </span>


                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      accountMenuOpen
                        ? 'rotate-180'
                        : ''
                    }`}
                  />

                </button>


                {/* ACCOUNT DROPDOWN */}

                {accountMenuOpen && (

                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">


                    {/* USER DETAILS */}

                    <div className="p-4 border-b border-slate-100">

                      <p className="text-xs text-slate-500">
                        Signed in as
                      </p>


                      <p className="font-semibold text-slate-900 mt-1">

                        {
                          displayName
                        }

                      </p>


                      {user?.email && (

                        <p className="text-xs text-slate-500 mt-1 truncate">

                          {
                            user.email
                          }

                        </p>

                      )}


                      {user?.username && (

                        <p className="text-xs text-slate-400 mt-1">

                          @
                          {
                            user.username
                          }

                        </p>

                      )}

                    </div>


                    {/* SAVED PROPERTIES */}

                    <Link
                      to="/favorites"
                      onClick={() =>
                        setAccountMenuOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >

                      <Heart className="w-4 h-4" />

                      Saved Properties

                    </Link>


                    {/* POST PROPERTY */}

                    <Link
                      to="/post"
                      onClick={() =>
                        setAccountMenuOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >

                      <Home className="w-4 h-4" />

                      Post Property

                    </Link>


                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
                    >

                      <LogOut className="w-4 h-4" />

                      Logout

                    </button>

                  </div>

                )}

              </div>

            ) : (


              /* ==================================================
                  LOGGED OUT USER
              ================================================== */

              <Link
                to="/login"
                className="btn-outline !py-2 !px-3 text-sm"
              >

                <User className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Sign in
                </span>

              </Link>

            )}


            {/* POST PROPERTY */}

            <Link
              to="/post"
              className="btn-primary !py-2 !px-4 text-sm"
            >

              + Post Property

            </Link>

          </div>

        </div>

      </header>


      {/* ==================================================
          PAGE CONTENT
      ================================================== */}

      <main className="flex-1">

        <Outlet />

      </main>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="bg-brand-900 text-brand-50/90 mt-20">

        <div className="container-x py-14 grid md:grid-cols-2 lg:grid-cols-5 gap-10">


          {/* BRAND */}

          <div className="lg:col-span-2">

            <div className="flex items-center gap-2 mb-4">

              <span className="w-9 h-9 rounded-lg bg-brand-600 grid place-items-center text-white">

                <Home className="w-5 h-5" />

              </span>


              <span className="font-display font-extrabold text-xl text-white">

                Estate

                <span className="text-gold-500">
                  Hub
                </span>

              </span>

            </div>


            <p className="text-sm max-w-md">

              India's most-loved real estate platform.
              Verified listings, trusted agents and
              end-to-end support — buy, rent, sell or
              invest with confidence.

            </p>


            <div className="flex gap-2 mt-5">

              {[
                Globe2,
                Globe2,
                Globe2,
                Globe2,
              ].map(
                (
                  Icon,
                  index
                ) => (

                  <a
                    key={
                      index
                    }
                    className="w-9 h-9 rounded-full border border-white/15 grid place-items-center hover:bg-brand-600 cursor-pointer"
                  >

                    <Icon className="w-4 h-4" />

                  </a>

                )
              )}

            </div>

          </div>


          {/* EXPLORE */}

          <div>

            <h4 className="text-white font-semibold mb-3">
              Explore
            </h4>

            <ul className="space-y-2 text-sm">

              <li>
                <Link to="/buy">
                  Buy
                </Link>
              </li>

              <li>
                <Link to="/rent">
                  Rent
                </Link>
              </li>

              <li>
                <Link to="/new-launches">
                  New Launches
                </Link>
              </li>

              <li>
                <Link to="/commercial">
                  Commercial
                </Link>
              </li>

              <li>
                Plots
              </li>

            </ul>

          </div>


          {/* COMPANY */}

          <div>

            <h4 className="text-white font-semibold mb-3">
              Company
            </h4>

            <ul className="space-y-2 text-sm">

              <li>
                <Link to="/about">
                  About
                </Link>
              </li>

              <li>
                Careers
              </li>

              <li>
                Press
              </li>

              <li>
                Blog
              </li>

              <li>
                Contact
              </li>

            </ul>

          </div>


          {/* CONTACT */}

          <div>

            <h4 className="text-white font-semibold mb-3">
              Contact
            </h4>


            <ul className="space-y-2 text-sm">

              <li className="flex gap-2">

                <Phone className="w-4 h-4 text-gold-500 shrink-0" />

                +91 1800-200-7766

              </li>


              <li className="flex gap-2">

                <Mail className="w-4 h-4 text-gold-500 shrink-0" />

                hello@estatehub.in

              </li>


              <li className="flex gap-2">

                <MapPin className="w-4 h-4 text-gold-500 shrink-0" />

                BKC, Mumbai, India

              </li>

            </ul>

          </div>

        </div>


        {/* COPYRIGHT */}

        <div className="border-t border-white/10">

          <div className="container-x py-5 text-xs flex justify-between">

            <span>
              © 2026 EstateHub. All rights reserved.
            </span>

            <span>
              RERA · Privacy · Terms
            </span>

          </div>

        </div>

      </footer>

    </div>

  );
}