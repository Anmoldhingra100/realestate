import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Search,
  MapPin,
  Building2,
  Home as HomeIcon,
  TreePine,
  Briefcase,
  ShieldCheck,
  Award,
  Headphones,
  TrendingUp,
  ArrowRight,
  Star,
  Quote,
  Loader2,
} from 'lucide-react';

import { api } from '../lib/api';
import PropertyCard from '../components/PropertyCard';


// ==================================================
// TYPES
// ==================================================

type PropertyImage = {
  id: number;
  url: string;
  order: number;
};


type Agent = {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  bio: string;
  rera_id: string;
  rating: number;
  deals_closed: number;
  user: number;
};


export type Property = {
  id: number;

  images: PropertyImage[];

  agent: Agent | null;

  slug: string;
  title: string;

  type: string;
  status: string;

  description: string;

  price: number;
  price_per: string;

  city: string;
  locality: string;
  address: string;

  lat: number | null;
  lng: number | null;

  beds: number;
  baths: number;

  area: number;
  area_unit: string;

  parking: number;

  year_built: number | null;

  furnishing: string;
  facing: string;

  rera_id: string;

  tags: string[];
  amenities: string[];

  featured: boolean;
  verified: boolean;

  created_at: string;
};


// ==================================================
// CITY IMAGES
// ==================================================

const cityImgs: Record<string, string> = {
  Mumbai:
    'photo-1567157577867-05ccb1388e66',

  Bengaluru:
    'photo-1596176530529-78163a4f7af2',

  Delhi:
    'photo-1587474260584-136574528ed5',

  Pune:
    'photo-1567604130959-7ea7ab2a7e89',

  Gurugram:
    'photo-1582407947304-fd86f028f716',

  Chennai:
    'photo-1582510003544-4d00b7f74220',

  Alibaug:
    'photo-1507525428034-b723cf961d3e',

  Thane:
    'photo-1572213426852-0e4ed8f41ab9',

  Noida:
    'photo-1600585154340-be6161a56a0c',
};


function getCityImage(
  city: string
) {
  const imageId =
    cityImgs[city] ||
    'photo-1560518883-ce09059eeffa';

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=600&q=80`;
}


// ==================================================
// API RESPONSE HELPER
// ==================================================

function getPropertyResults(
  data: any
): Property[] {

  // Django pagination:
  // {
  //   count: 3,
  //   next: null,
  //   previous: null,
  //   results: [...]
  // }

  if (
    data &&
    Array.isArray(data.results)
  ) {
    return data.results;
  }

  // Non-paginated response:
  // [...]
  if (Array.isArray(data)) {
    return data;
  }

  return [];
}


// ==================================================
// HOME PAGE
// ==================================================

export default function Home() {

  const nav =
    useNavigate();


  // ==================================================
  // SEARCH STATE
  // ==================================================

  const [
    tab,
    setTab,
  ] = useState<
    'Buy' |
    'Rent' |
    'New Launch'
  >('Buy');


  const [
    q,
    setQ,
  ] = useState('');


  const [
    propertyType,
    setPropertyType,
  ] = useState('All Types');


  // ==================================================
  // BACKEND PROPERTY STATE
  // ==================================================

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  // ==================================================
  // LOAD PROPERTIES FROM BACKEND
  // ==================================================

  useEffect(() => {

    let cancelled = false;


    async function loadProperties() {

      try {

        setLoading(true);

        setError('');


        const response =
          await api.get(
            '/properties/'
          );


        const results =
          getPropertyResults(
            response.data
          );


        if (!cancelled) {

          setProperties(
            results
          );

        }

      } catch (err: any) {

        console.error(
          'Failed to load home properties:',
          err.response?.data ||
          err
        );


        if (!cancelled) {

          setError(
            'Unable to load properties right now.'
          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }


    loadProperties();


    return () => {

      cancelled = true;

    };

  }, []);


  // ==================================================
  // FEATURED PROPERTIES
  // ==================================================

  const featured =
    useMemo(
      () => {

        return properties
          .filter(
            (property) =>
              property.featured === true
          )
          .slice(0, 6);

      },
      [properties]
    );


  // ==================================================
  // NEW LAUNCH PROPERTIES
  // ==================================================

  const newLaunches =
    useMemo(
      () => {

        return properties
          .filter(
            (property) =>
              property.status ===
              'New Launch'
          )
          .slice(0, 6);

      },
      [properties]
    );


  // ==================================================
  // CITIES FROM BACKEND PROPERTY DATA
  // ==================================================

  const cities =
    useMemo(
      () => {

        const uniqueCities =
          Array.from(
            new Set(
              properties
                .map(
                  (property) =>
                    property.city
                      ?.trim()
                )
                .filter(Boolean)
            )
          );


        // If backend currently has fewer cities,
        // add common cities for the homepage section.

        const fallbackCities = [
          'Mumbai',
          'Bengaluru',
          'Delhi',
          'Pune',
          'Gurugram',
          'Chennai',
          'Noida',
          'Thane',
        ];


        return Array.from(
          new Set([
            ...uniqueCities,
            ...fallbackCities,
          ])
        ).slice(0, 8);

      },
      [properties]
    );


  // ==================================================
  // PROPERTY COUNT PER CITY
  // ==================================================

  function getCityPropertyCount(
    city: string
  ) {

    return properties.filter(
      (property) =>
        property.city
          ?.toLowerCase() ===
        city.toLowerCase()
    ).length;

  }


  // ==================================================
  // SEARCH
  // ==================================================

  function handleSearch() {

    let path = '/buy';


    if (tab === 'Rent') {

      path = '/rent';

    } else if (
      tab === 'New Launch'
    ) {

      path =
        '/new-launches';

    }


    const params =
      new URLSearchParams();


    if (q.trim()) {

      params.set(
        'q',
        q.trim()
      );

    }


    if (
      propertyType !==
      'All Types'
    ) {

      params.set(
        'type',
        propertyType
      );

    }


    const queryString =
      params.toString();


    nav(
      queryString
        ? `${path}?${queryString}`
        : path
    );

  }


  // ==================================================
  // ENTER KEY SEARCH
  // ==================================================

  function handleSearchKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>
  ) {

    if (
      event.key === 'Enter'
    ) {

      handleSearch();

    }

  }


  // ==================================================
  // TRENDING SEARCH
  // ==================================================

  function handleTrendingSearch(
    value: string
  ) {

    setQ(value);


    let path = '/buy';


    if (tab === 'Rent') {

      path = '/rent';

    } else if (
      tab === 'New Launch'
    ) {

      path =
        '/new-launches';

    }


    nav(
      `${path}?q=${encodeURIComponent(
        value
      )}`
    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div>


      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative isolate overflow-hidden">

        <div className="absolute inset-0 -z-10">

          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1900&q=80"
            alt="Luxury property"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/70 to-brand-900/40" />

        </div>


        <div className="container-x py-24 lg:py-36 text-white">

          <div className="max-w-3xl">

            <span className="chip bg-gold-500/20 text-gold-500 border border-gold-500/30">

              ★ Trusted by 2L+ happy homeowners

            </span>


            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight">

              Find a home you'll{' '}

              <span className="text-gold-500">
                truly love
              </span>

              .

            </h1>


            <p className="mt-4 text-lg text-white/85 max-w-2xl">

              Verified listings,
              transparent pricing, and
              trusted RERA-registered
              agents across India.

            </p>

          </div>


          {/* SEARCH BOX */}

          <div className="mt-10 max-w-4xl bg-white rounded-2xl shadow-2xl p-2 text-slate-800">

            <div className="flex gap-1 px-2 pt-2 overflow-x-auto">

              {(
                [
                  'Buy',
                  'Rent',
                  'New Launch',
                ] as const
              ).map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setTab(item)
                    }
                    className={`px-5 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap ${
                      tab === item
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-brand-700'
                    }`}
                  >

                    {item}

                  </button>

                )
              )}

            </div>


            <div className="grid md:grid-cols-[1fr_auto_auto] gap-2 p-2 bg-brand-50 rounded-xl">

              <div className="flex items-center gap-3 bg-white rounded-lg px-4">

                <MapPin className="w-5 h-5 text-brand-600 shrink-0" />

                <input
                  value={q}
                  onChange={(event) =>
                    setQ(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  placeholder="Search city, locality, project or builder"
                  className="flex-1 min-w-0 py-3 outline-none text-sm"
                />

              </div>


              <select
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(
                    event.target.value
                  )
                }
                className="bg-white rounded-lg px-3 py-3 text-sm font-medium"
              >

                <option>
                  All Types
                </option>

                <option>
                  Apartment
                </option>

                <option>
                  Villa
                </option>

                <option>
                  Penthouse
                </option>

                <option>
                  House
                </option>

                <option>
                  Plot
                </option>

                <option>
                  Office
                </option>

              </select>


              <button
                type="button"
                onClick={
                  handleSearch
                }
                className="btn-primary !rounded-lg !py-3 !px-7"
              >

                <Search className="w-4 h-4" />

                Search

              </button>

            </div>


            {/* TRENDING */}

            <div className="flex flex-wrap gap-2 p-3 text-xs text-slate-500">

              <span className="font-semibold text-slate-700">
                Trending:
              </span>


              {[
                'Bandra West',
                'Whitefield',
                'Koregaon Park',
                'Gurugram Cyber City',
                'Noida Sector 150',
              ].map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      handleTrendingSearch(
                        item
                      )
                    }
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700"
                  >

                    {item}

                  </button>

                )
              )}

            </div>

          </div>


          {/* STATS */}

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">

            {[
              [
                '50K+',
                'Properties',
              ],
              [
                '2L+',
                'Happy Customers',
              ],
              [
                '25+',
                'Cities',
              ],
              [
                '1,200+',
                'RERA Agents',
              ],
            ].map(
              ([
                number,
                label,
              ]) => (

                <div key={label}>

                  <div className="text-3xl font-extrabold text-gold-500">
                    {number}
                  </div>

                  <div className="text-sm text-white/80">
                    {label}
                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          CATEGORIES
      ================================================== */}

      <section className="container-x -mt-12 relative z-10">

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

          {[
            [
              HomeIcon,
              'Apartments',
              '/buy?type=Apartment',
            ],
            [
              Building2,
              'Villas',
              '/buy?type=Villa',
            ],
            [
              TreePine,
              'Plots',
              '/buy?type=Plot',
            ],
            [
              Briefcase,
              'Commercial',
              '/commercial',
            ],
            [
              HomeIcon,
              'Rent',
              '/rent',
            ],
            [
              Building2,
              'New Launches',
              '/new-launches',
            ],
          ].map(
            ([
              Icon,
              label,
              href,
            ]: any) => (

              <Link
                key={label}
                to={href}
                className="card p-5 text-center hover:border-brand-600 hover:shadow-md"
              >

                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-3">

                  <Icon className="w-6 h-6" />

                </div>

                <div className="text-sm font-semibold">
                  {label}
                </div>

              </Link>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          FEATURED PROPERTIES FROM BACKEND
      ================================================== */}

      <section className="container-x mt-20">

        <div className="flex items-end justify-between mb-8">

          <div>

            <h2 className="text-3xl font-extrabold">
              Featured Properties
            </h2>

            <p className="text-slate-500 mt-1">
              Hand-picked premium homes
              from our verified portfolio
            </p>

          </div>


          <Link
            to="/buy"
            className="hidden md:inline-flex text-brand-700 font-semibold items-center gap-1"
          >

            View all

            <ArrowRight className="w-4 h-4" />

          </Link>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="py-16 flex flex-col items-center justify-center text-slate-500">

            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />

            <p className="mt-3">
              Loading featured properties...
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading &&
          error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

            {error}

          </div>

        )}


        {/* FEATURED PROPERTY CARDS */}

        {!loading &&
          !error &&
          featured.length > 0 && (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {featured.map(
              (property) => (

                <PropertyCard
                  key={property.id}
                  p={property}
                />

              )
            )}

          </div>

        )}


        {/* NO FEATURED PROPERTIES */}

        {!loading &&
          !error &&
          featured.length === 0 && (

          <div className="card p-10 text-center">

            <Building2 className="w-10 h-10 mx-auto text-slate-300" />

            <p className="mt-3 text-slate-500">
              No featured properties
              are currently available.
            </p>

          </div>

        )}

      </section>


      {/* ==================================================
          CITIES
      ================================================== */}

      <section className="container-x mt-20">

        <div className="text-center max-w-2xl mx-auto mb-10">

          <h2 className="text-3xl font-extrabold">
            Explore Top Cities
          </h2>

          <p className="text-slate-500 mt-2">
            Discover properties in
            India's most loved cities
          </p>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          {cities.map(
            (city) => {

              const count =
                getCityPropertyCount(
                  city
                );


              return (

                <Link
                  key={city}
                  to={`/buy?city=${encodeURIComponent(
                    city
                  )}`}
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden group"
                >

                  <img
                    src={
                      getCityImage(
                        city
                      )
                    }
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={city}
                  />


                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />


                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">

                    <div className="font-display font-bold text-xl">
                      {city}
                    </div>


                    <div className="text-xs text-white/80">

                      {count > 0
                        ? `${count} ${
                            count === 1
                              ? 'listing'
                              : 'listings'
                          }`
                        : 'Explore properties'}

                    </div>

                  </div>

                </Link>

              );

            }
          )}

        </div>

      </section>


      {/* ==================================================
          WHY US
      ================================================== */}

      <section className="bg-white border-y border-slate-200 mt-20 py-20">

        <div className="container-x">

          <div className="text-center max-w-2xl mx-auto mb-12">

            <h2 className="text-3xl font-extrabold">
              Why thousands trust EstateHub
            </h2>

            <p className="text-slate-500 mt-2">
              A complete real estate
              experience, from first
              search to final handover
            </p>

          </div>


          <div className="grid md:grid-cols-4 gap-6">

            {[
              [
                ShieldCheck,
                '100% Verified',
                'Every listing is checked by our in-house team — RERA, title and physical verification.',
              ],
              [
                Award,
                'Top Rated Agents',
                'Work with hand-picked, top performing agents in every locality.',
              ],
              [
                TrendingUp,
                'Market Insights',
                'Locality price trends, builder ratings and ROI analytics at your fingertips.',
              ],
              [
                Headphones,
                '24/7 Support',
                'Concierge support from search to keys-in-hand, including legal & home loans.',
              ],
            ].map(
              ([
                Icon,
                title,
                description,
              ]: any) => (

                <div
                  key={title}
                  className="p-6 rounded-2xl bg-slate-50 hover:bg-brand-50 transition"
                >

                  <div className="w-12 h-12 rounded-xl bg-brand-600 text-white grid place-items-center mb-4">

                    <Icon className="w-6 h-6" />

                  </div>


                  <div className="font-semibold text-lg">
                    {title}
                  </div>


                  <p className="text-sm text-slate-600 mt-1">
                    {description}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ==================================================
          NEW LAUNCHES FROM BACKEND
      ================================================== */}

      <section className="container-x mt-20">

        <div className="flex items-end justify-between mb-8">

          <div>

            <h2 className="text-3xl font-extrabold">
              New Launches
            </h2>

            <p className="text-slate-500 mt-1">
              Pre-launch pricing and
              early access from India's
              top builders
            </p>

          </div>


          <Link
            to="/new-launches"
            className="hidden md:inline-flex text-brand-700 font-semibold items-center gap-1"
          >

            View all

            <ArrowRight className="w-4 h-4" />

          </Link>

        </div>


        {loading && (

          <div className="py-16 flex flex-col items-center justify-center text-slate-500">

            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />

            <p className="mt-3">
              Loading new launches...
            </p>

          </div>

        )}


        {!loading &&
          error && (

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

            {error}

          </div>

        )}


        {!loading &&
          !error &&
          newLaunches.length > 0 && (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {newLaunches.map(
              (property) => (

                <PropertyCard
                  key={property.id}
                  p={property}
                />

              )
            )}

          </div>

        )}


        {!loading &&
          !error &&
          newLaunches.length === 0 && (

          <div className="card p-10 text-center">

            <Building2 className="w-10 h-10 mx-auto text-slate-300" />

            <p className="mt-3 text-slate-500">
              No new launches are
              currently available.
            </p>

          </div>

        )}

      </section>


      {/* ==================================================
          TESTIMONIALS
      ================================================== */}

      <section className="container-x mt-20">

        <div className="text-center max-w-2xl mx-auto mb-12">

          <h2 className="text-3xl font-extrabold">
            What our customers say
          </h2>

        </div>


        <div className="grid md:grid-cols-3 gap-6">

          {[
            {
              n: 'Anita & Rohan',
              t:
                'Found our dream home in just 3 weekends. The agent was incredibly patient and transparent.',
            },
            {
              n: 'Karan Singh',
              t:
                'Smoothest rental experience ever. Every visit was on time and paperwork was effortless.',
            },
            {
              n: 'Meera Patel',
              t:
                'Loved the price trends and locality insights — helped us negotiate ₹8L off the asking price.',
            },
          ].map(
            (
              review,
              index
            ) => (

              <div
                key={index}
                className="card p-6"
              >

                <Quote className="w-7 h-7 text-gold-500" />


                <p className="mt-3 text-slate-700">
                  {review.t}
                </p>


                <div className="flex items-center justify-between mt-5">

                  <div className="font-semibold">
                    {review.n}
                  </div>


                  <div className="flex gap-0.5">

                    {[
                      ...Array(5),
                    ].map(
                      (
                        _,
                        starIndex
                      ) => (

                        <Star
                          key={
                            starIndex
                          }
                          className="w-4 h-4 fill-gold-500 text-gold-500"
                        />

                      )
                    )}

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* ==================================================
          CTA
      ================================================== */}

      <section className="container-x mt-20">

        <div className="rounded-3xl bg-gradient-to-r from-brand-700 to-brand-900 p-10 md:p-16 text-white relative overflow-hidden">

          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl" />


          <div className="grid md:grid-cols-2 gap-10 items-center relative">

            <div>

              <h2 className="text-3xl md:text-4xl font-extrabold">
                Ready to list your property?
              </h2>


              <p className="mt-3 text-white/85 max-w-md">
                Reach verified buyers
                and renters. Free
                listings, premium
                upgrades, and dedicated
                support.
              </p>


              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/post"
                  className="btn-gold"
                >
                  + Post Property — Free
                </Link>


                <Link
                  to="/agents"
                  className="btn-outline !bg-transparent !text-white !border-white/30 hover:!bg-white/10"
                >
                  Talk to an expert
                </Link>

              </div>

            </div>


            <div className="grid grid-cols-3 gap-4 text-center">

              {[
                [
                  'Free',
                  'Listing',
                ],
                [
                  '48 hrs',
                  'Avg. response',
                ],
                [
                  '1.2M',
                  'Monthly visits',
                ],
              ].map(
                ([
                  number,
                  label,
                ]) => (

                  <div
                    key={label}
                    className="rounded-xl bg-white/10 backdrop-blur p-5"
                  >

                    <div className="text-2xl font-extrabold text-gold-500">
                      {number}
                    </div>

                    <div className="text-xs">
                      {label}
                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}