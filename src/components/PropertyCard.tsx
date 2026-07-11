import { Link } from 'react-router-dom';

import {
  BadgeCheck,
  Bath,
  Bed,
  Camera,
  Heart,
  ImageOff,
  MapPin,
  Maximize2,
} from 'lucide-react';

import { useApp } from '../store/app';


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
// PRICE FORMATTER
// ==================================================

function formatPrice(price: number | string) {
  const amount = Number(price);

  if (Number.isNaN(amount)) {
    return 'Price on request';
  }

  if (amount >= 10000000) {
    const crore = amount / 10000000;

    return `₹${Number(crore.toFixed(2))} Cr`;
  }

  if (amount >= 100000) {
    const lakh = amount / 100000;

    return `₹${Number(lakh.toFixed(2))} L`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
}


// ==================================================
// PRICE PERIOD
// ==================================================

function getPricePeriod(pricePer?: string) {
  if (!pricePer) {
    return '';
  }

  const value = pricePer.toLowerCase().trim();

  if (value === 'month') {
    return '/month';
  }

  if (value === 'year') {
    return '/year';
  }

  if (value === 'day') {
    return '/day';
  }

  if (value === 'sqft') {
    return '';
  }

  return `/${pricePer}`;
}


// ==================================================
// PROPERTY CARD
// ==================================================

export default function PropertyCard({
  p,
}: {
  p: Property;
}) {
  const { isFav, toggleFav } = useApp();

  const fav = isFav(p.id);

  // Sort images according to backend "order"
  const sortedImages = [...(p.images || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  const primaryImage =
    sortedImages.length > 0
      ? sortedImages[0].url
      : '';

  const pricePeriod = getPricePeriod(p.price_per);

  return (
    <Link
      to={`/property/${p.slug}`}
      className="card hover:shadow-xl transition-shadow group block overflow-hidden"
    >

      {/* ==================================================
          PROPERTY IMAGE
      ================================================== */}

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

        {primaryImage ? (
          <img
            src={primaryImage}
            alt={p.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <ImageOff className="w-10 h-10" />

            <span className="text-xs mt-2">
              No image available
            </span>
          </div>
        )}


        {/* ==================================================
            STATUS + VERIFIED
        ================================================== */}

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">

          <span
            className={`chip ${
              p.status === 'For Rent'
                ? 'bg-blue-600'
                : p.status === 'New Launch'
                  ? 'bg-gold-500'
                  : 'bg-brand-600'
            } text-white`}
          >
            {p.status}
          </span>


          {p.verified && (
            <span className="chip bg-white/95 text-brand-700">
              <BadgeCheck className="w-3 h-3" />

              Verified
            </span>
          )}

        </div>


        {/* ==================================================
            FAVORITE BUTTON
        ================================================== */}

        <button
          type="button"
          aria-label={
            fav
              ? 'Remove from saved properties'
              : 'Save property'
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            toggleFav(p.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 grid place-items-center hover:bg-white shadow-sm"
        >
          <Heart
            className={`w-4 h-4 ${
              fav
                ? 'fill-red-500 text-red-500'
                : 'text-slate-700'
            }`}
          />
        </button>


        {/* ==================================================
            IMAGE COUNT
        ================================================== */}

        {sortedImages.length > 0 && (
          <div className="absolute bottom-3 left-3 chip bg-black/55 text-white">

            <Camera className="w-3 h-3" />

            {sortedImages.length}{' '}

            {sortedImages.length === 1
              ? 'Photo'
              : 'Photos'}

          </div>
        )}

      </div>


      {/* ==================================================
          PROPERTY INFORMATION
      ================================================== */}

      <div className="p-4">


        {/* PRICE + TYPE */}

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <div className="flex flex-wrap items-baseline gap-1">

              <span className="text-xl font-extrabold text-slate-900">

                {formatPrice(p.price)}

              </span>


              {pricePeriod && (
                <span className="text-xs font-medium text-slate-500">

                  {pricePeriod}

                </span>
              )}

            </div>


            {/* PRICE PER SQFT */}

            {p.price_per?.toLowerCase() === 'sqft' &&
              p.area > 0 && (
                <div className="text-[11px] text-slate-400 mt-0.5">

                  ₹
                  {Math.round(
                    Number(p.price) / Number(p.area)
                  ).toLocaleString('en-IN')}

                  /sqft

                </div>
              )}

          </div>


          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">

            {p.type}

          </span>

        </div>


        {/* ==================================================
            TITLE
        ================================================== */}

        <h3 className="mt-2 font-semibold text-slate-800 line-clamp-1">

          {p.title}

        </h3>


        {/* ==================================================
            LOCATION
        ================================================== */}

        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">

          <MapPin className="w-3 h-3 shrink-0" />

          <span className="line-clamp-1">

            {p.locality && p.city
              ? `${p.locality}, ${p.city}`
              : p.locality || p.city || p.address}

          </span>

        </p>


        {/* ==================================================
            PROPERTY DETAILS
        ================================================== */}

        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">


          {/* BEDROOMS */}

          {Number(p.beds) > 0 && (
            <span className="flex items-center gap-1">

              <Bed className="w-4 h-4 text-brand-600" />

              {p.beds}{' '}

              {p.beds === 1
                ? 'Bed'
                : 'Beds'}

            </span>
          )}


          {/* BATHROOMS */}

          {Number(p.baths) > 0 && (
            <span className="flex items-center gap-1">

              <Bath className="w-4 h-4 text-brand-600" />

              {p.baths}{' '}

              {p.baths === 1
                ? 'Bath'
                : 'Baths'}

            </span>
          )}


          {/* AREA */}

          {Number(p.area) > 0 && (
            <span className="flex items-center gap-1">

              <Maximize2 className="w-4 h-4 text-brand-600" />

              {Number(p.area).toLocaleString('en-IN')}{' '}

              {p.area_unit || 'sqft'}

            </span>
          )}

        </div>

      </div>

    </Link>
  );
}