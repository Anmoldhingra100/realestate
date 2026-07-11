import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Grid3x3,
  List,
  Loader2,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';

import PropertyCard from '../components/PropertyCard';
import { api } from '../lib/api';


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
// API RESPONSE TYPE
// ==================================================

type PropertiesResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
};


// ==================================================
// PRICE FORMATTER
// ==================================================

function formatPrice(
  price: number
) {
  if (price >= 10000000) {
    const crore =
      price / 10000000;

    return `₹${Number(
      crore.toFixed(2)
    )} Cr`;
  }

  if (price >= 100000) {
    const lakh =
      price / 100000;

    return `₹${Number(
      lakh.toFixed(2)
    )} L`;
  }

  return `₹${price.toLocaleString(
    'en-IN'
  )}`;
}


// ==================================================
// COMPONENT PROPS
// ==================================================

type ListingsProps = {
  title: string;

  filter: (
    property: Property
  ) => boolean;
};


// ==================================================
// LISTINGS COMPONENT
// ==================================================

export default function Listings({
  title,
  filter,
}: ListingsProps) {

  // ==================================================
  // BACKEND DATA
  // ==================================================

  const [
    properties,
    setProperties,
  ] =
    useState<Property[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState('');


  // ==================================================
  // FILTER STATE
  // ==================================================

  const [
    city,
    setCity,
  ] =
    useState('All');


  const [
    type,
    setType,
  ] =
    useState('All');


  const [
    bhk,
    setBhk,
  ] =
    useState(0);


  const [
    maxP,
    setMaxP,
  ] =
    useState(
      200000000
    );


  const [
    sort,
    setSort,
  ] =
    useState(
      'relevance'
    );


  // ==================================================
  // VIEW MODE
  // ==================================================

  const [
    viewMode,
    setViewMode,
  ] =
    useState<
      'grid' | 'list'
    >('grid');


  // ==================================================
  // SELECTED AMENITIES
  // ==================================================

  const [
    selectedAmenities,
    setSelectedAmenities,
  ] =
    useState<string[]>(
      []
    );


  // ==================================================
  // LOAD PROPERTIES FROM BACKEND
  // ==================================================

  useEffect(() => {

    async function loadProperties() {

      try {

        setLoading(
          true
        );


        setError(
          ''
        );


        const response =
          await api.get<PropertiesResponse>(
            '/properties/'
          );


        // Supports your current paginated response:
        //
        // {
        //   count: 3,
        //   next: null,
        //   previous: null,
        //   results: [...]
        // }

        if (
          Array.isArray(
            response.data
          )
        ) {

          // Fallback in case pagination
          // is disabled later.

          setProperties(
            response.data as Property[]
          );

        } else {

          setProperties(
            response.data.results ||
              []
          );

        }

      } catch (
        err
      ) {

        console.error(
          'Failed to load properties:',
          err
        );


        setError(
          'Unable to load properties. Please try again.'
        );

      } finally {

        setLoading(
          false
        );

      }

    }


    loadProperties();

  }, []);


  // ==================================================
  // PAGE FILTER
  //
  // /buy
  // → For Sale
  //
  // /rent
  // → For Rent
  //
  // /commercial
  // → Office
  // ==================================================

  const all =
    useMemo(
      () =>
        properties.filter(
          filter
        ),
      [
        properties,
        filter,
      ]
    );


  // ==================================================
  // AVAILABLE CITIES
  //
  // Generated dynamically from backend data
  // ==================================================

  const cities =
    useMemo(
      () =>
        Array.from(
          new Set(
            all
              .map(
                (property) =>
                  property.city
              )
              .filter(
                Boolean
              )
          )
        ).sort(),
      [
        all,
      ]
    );


  // ==================================================
  // AVAILABLE PROPERTY TYPES
  //
  // Generated dynamically from backend data
  // ==================================================

  const types =
    useMemo(
      () =>
        Array.from(
          new Set(
            all
              .map(
                (property) =>
                  property.type
              )
              .filter(
                Boolean
              )
          )
        ).sort(),
      [
        all,
      ]
    );


  // ==================================================
  // AVAILABLE AMENITIES
  //
  // Generated dynamically from backend data
  // ==================================================

  const amenities =
    useMemo(
      () =>
        Array.from(
          new Set(
            all.flatMap(
              (property) =>
                property.amenities ||
                []
            )
          )
        ).sort(),
      [
        all,
      ]
    );


  // ==================================================
  // DYNAMIC MAXIMUM PRICE
  // ==================================================

  const highestPrice =
    useMemo(
      () => {

        if (
          all.length ===
          0
        ) {
          return 200000000;
        }


        return Math.max(
          ...all.map(
            (property) =>
              Number(
                property.price
              ) || 0
          )
        );

      },
      [
        all,
      ]
    );


  // ==================================================
  // RESET MAX PRICE WHEN PAGE DATA CHANGES
  // ==================================================

  useEffect(() => {

    if (
      all.length >
      0
    ) {

      setMaxP(
        highestPrice
      );

    }

  }, [
    highestPrice,
    all.length,
  ]);


  // ==================================================
  // FINAL FILTERED + SORTED ITEMS
  // ==================================================

  const items =
    useMemo(
      () => {

        let result =
          all.filter(
            (
              property
            ) => {

              // ------------------------------
              // CITY
              // ------------------------------

              const matchesCity =
                city ===
                  'All' ||
                property.city ===
                  city;


              // ------------------------------
              // PROPERTY TYPE
              // ------------------------------

              const matchesType =
                type ===
                  'All' ||
                property.type ===
                  type;


              // ------------------------------
              // BEDROOMS
              // ------------------------------

              const matchesBhk =
                bhk ===
                  0 ||
                property.beds >=
                  bhk;


              // ------------------------------
              // PRICE
              // ------------------------------

              const matchesPrice =
                Number(
                  property.price
                ) <=
                maxP;


              // ------------------------------
              // AMENITIES
              //
              // Property must contain all
              // selected amenities.
              // ------------------------------

              const propertyAmenities =
                property.amenities ||
                [];


              const matchesAmenities =
                selectedAmenities.every(
                  (
                    amenity
                  ) =>
                    propertyAmenities.includes(
                      amenity
                    )
                );


              return (
                matchesCity &&
                matchesType &&
                matchesBhk &&
                matchesPrice &&
                matchesAmenities
              );

            }
          );


        // ==================================================
        // SORTING
        // ==================================================

        if (
          sort ===
          'low'
        ) {

          result =
            [
              ...result,
            ].sort(
              (
                a,
                b
              ) =>
                Number(
                  a.price
                ) -
                Number(
                  b.price
                )
            );

        }


        if (
          sort ===
          'high'
        ) {

          result =
            [
              ...result,
            ].sort(
              (
                a,
                b
              ) =>
                Number(
                  b.price
                ) -
                Number(
                  a.price
                )
            );

        }


        if (
          sort ===
          'area'
        ) {

          result =
            [
              ...result,
            ].sort(
              (
                a,
                b
              ) =>
                Number(
                  b.area
                ) -
                Number(
                  a.area
                )
            );

        }


        return result;

      },
      [
        all,
        city,
        type,
        bhk,
        maxP,
        sort,
        selectedAmenities,
      ]
    );


  // ==================================================
  // AMENITY CHECKBOX
  // ==================================================

  function toggleAmenity(
    amenity: string
  ) {

    setSelectedAmenities(
      (
        current
      ) => {

        if (
          current.includes(
            amenity
          )
        ) {

          return current.filter(
            (
              item
            ) =>
              item !==
              amenity
          );

        }


        return [
          ...current,
          amenity,
        ];

      }
    );

  }


  // ==================================================
  // LOADING
  // ==================================================

  if (
    loading
  ) {

    return (

      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-600" />

          <p className="text-slate-500 mt-3">
            Loading properties...
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (
    error
  ) {

    return (

      <div className="container-x py-16">

        <div className="max-w-xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-center">

          <p className="font-semibold text-red-700">
            Unable to load properties
          </p>

          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="btn-primary mt-5"
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  // ==================================================
  // RENDER
  // ==================================================

  return (

    <div>


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="bg-brand-900 text-white">

        <div className="container-x py-10">

          <h1 className="text-3xl md:text-4xl font-extrabold">

            {
              title
            }

          </h1>


          <p className="text-white/80 mt-1">

            {
              items.length
            }{' '}

            {items.length ===
            1
              ? 'property'
              : 'properties'}{' '}

            matching your search

          </p>

        </div>

      </div>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="container-x py-8 grid lg:grid-cols-[280px_1fr] gap-8">


        {/* ==================================================
            FILTER SIDEBAR
        ================================================== */}

        <aside className="card p-5 h-fit lg:sticky lg:top-24">


          {/* FILTER TITLE */}

          <div className="flex items-center gap-2 mb-5 font-semibold">

            <SlidersHorizontal className="w-4 h-4 text-brand-600" />

            Filters

          </div>


          <div className="space-y-5 text-sm">


            {/* CITY */}

            <div>

              <label className="font-semibold">

                City

              </label>


              <select
                value={
                  city
                }
                onChange={(
                  event
                ) =>
                  setCity(
                    event.target
                      .value
                  )
                }
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
              >

                <option value="All">

                  All Cities

                </option>


                {cities.map(
                  (
                    cityName
                  ) => (

                    <option
                      key={
                        cityName
                      }
                      value={
                        cityName
                      }
                    >

                      {
                        cityName
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* PROPERTY TYPE */}

            <div>

              <label className="font-semibold">

                Property Type

              </label>


              <select
                value={
                  type
                }
                onChange={(
                  event
                ) =>
                  setType(
                    event.target
                      .value
                  )
                }
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-white"
              >

                <option value="All">

                  All Types

                </option>


                {types.map(
                  (
                    propertyType
                  ) => (

                    <option
                      key={
                        propertyType
                      }
                      value={
                        propertyType
                      }
                    >

                      {
                        propertyType
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* BEDROOMS */}

            <div>

              <label className="font-semibold">

                Bedrooms

              </label>


              <div className="grid grid-cols-5 gap-1 mt-2">

                {[
                  0,
                  1,
                  2,
                  3,
                  4,
                ].map(
                  (
                    number
                  ) => (

                    <button
                      key={
                        number
                      }
                      type="button"
                      onClick={() =>
                        setBhk(
                          number
                        )
                      }
                      className={`py-2 rounded-lg text-xs font-semibold ${
                        bhk ===
                        number
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >

                      {number ===
                      0
                        ? 'Any'
                        : `${number}+`}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* MAX PRICE */}

            <div>

              <label className="font-semibold flex justify-between gap-2">

                <span>
                  Max Price
                </span>


                <span className="text-brand-700">

                  {
                    formatPrice(
                      maxP
                    )
                  }

                </span>

              </label>


              <input
                type="range"
                min={
                  0
                }
                max={
                  Math.max(
                    highestPrice,
                    1
                  )
                }
                step={
                  Math.max(
                    Math.round(
                      highestPrice /
                        100
                    ),
                    10000
                  )
                }
                value={
                  Math.min(
                    maxP,
                    Math.max(
                      highestPrice,
                      1
                    )
                  )
                }
                onChange={(
                  event
                ) =>
                  setMaxP(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-full mt-2 accent-brand-600"
              />

            </div>


            {/* AMENITIES */}

            {amenities.length >
              0 && (

              <div>

                <label className="font-semibold">

                  Amenities

                </label>


                <div className="space-y-1.5 mt-2 max-h-56 overflow-y-auto">

                  {amenities.map(
                    (
                      amenity
                    ) => (

                      <label
                        key={
                          amenity
                        }
                        className="flex items-center gap-2 text-slate-600 cursor-pointer"
                      >

                        <input
                          type="checkbox"
                          checked={
                            selectedAmenities.includes(
                              amenity
                            )
                          }
                          onChange={() =>
                            toggleAmenity(
                              amenity
                            )
                          }
                        />

                        {
                          amenity
                        }

                      </label>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </aside>


        {/* ==================================================
            PROPERTY RESULTS
        ================================================== */}

        <div>


          {/* SORT + VIEW */}

          <div className="flex items-center justify-between gap-3 mb-4">


            {/* SORT */}

            <select
              value={
                sort
              }
              onChange={(
                event
              ) =>
                setSort(
                  event.target
                    .value
                )
              }
              className="border rounded-lg px-3 py-2 text-sm bg-white"
            >

              <option value="relevance">

                Sort: Relevance

              </option>

              <option value="low">

                Price: Low to High

              </option>

              <option value="high">

                Price: High to Low

              </option>

              <option value="area">

                Area: Largest first

              </option>

            </select>


            {/* VIEW BUTTONS */}

            <div className="flex gap-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    'grid'
                  )
                }
                className={`p-2 rounded-lg ${
                  viewMode ===
                  'grid'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border'
                }`}
                aria-label="Grid view"
              >

                <Grid3x3 className="w-4 h-4" />

              </button>


              <button
                type="button"
                onClick={() =>
                  setViewMode(
                    'list'
                  )
                }
                className={`p-2 rounded-lg ${
                  viewMode ===
                  'list'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border'
                }`}
                aria-label="List view"
              >

                <List className="w-4 h-4" />

              </button>

            </div>

          </div>


          {/* PROPERTY CARDS */}

          {items.length >
          0 ? (

            <div
              className={
                viewMode ===
                'grid'
                  ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'grid grid-cols-1 gap-5'
              }
            >

              {items.map(
                (
                  property
                ) => (

                  <PropertyCard
                    key={
                      property.id
                    }
                    p={
                      property
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="text-center py-20 text-slate-500">

              <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-300" />

              No properties match these filters.

            </div>

          )}

        </div>

      </div>

    </div>

  );
}