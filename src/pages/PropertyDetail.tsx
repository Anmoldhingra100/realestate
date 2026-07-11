import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  Heart,
  ImageOff,
  Loader2,
  MapPin,
  Maximize2,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';

import { api } from '../lib/api';
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
  user: number | null;
};

type Property = {
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

type InquiryForm = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

type VisitForm = {
  name: string;
  phone: string;
  preferred_date: string;
};


// ==================================================
// PRICE FORMATTER
// ==================================================

function formatPrice(value: number | string) {
  const price = Number(value);

  if (Number.isNaN(price)) {
    return 'Price on request';
  }

  if (price >= 10000000) {
    return `₹${Number((price / 10000000).toFixed(2))} Cr`;
  }

  if (price >= 100000) {
    return `₹${Number((price / 100000).toFixed(2))} L`;
  }

  return `₹${price.toLocaleString('en-IN')}`;
}


// ==================================================
// PRICE PERIOD
// ==================================================

function getPricePeriod(pricePer?: string) {
  if (!pricePer) {
    return '';
  }

  const value = pricePer.toLowerCase().trim();

  if (value === 'month' || value === '/month') {
    return '/month';
  }

  if (value === 'year' || value === '/year') {
    return '/year';
  }

  if (value === 'day' || value === '/day') {
    return '/day';
  }

  if (value === 'sqft' || value === '/sqft') {
    return '';
  }

  return pricePer.startsWith('/')
    ? pricePer
    : `/${pricePer}`;
}


// ==================================================
// API ERROR FORMATTER
// ==================================================

function getApiErrorMessage(
  error: any,
  fallbackMessage: string
) {
  const responseData = error?.response?.data;

  if (
    responseData &&
    typeof responseData === 'object' &&
    !Array.isArray(responseData)
  ) {
    return Object.entries(responseData)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(', ')
          : String(messages);

        return `${field}: ${message}`;
      })
      .join(' | ');
  }

  if (typeof responseData === 'string') {
    return responseData;
  }

  return fallbackMessage;
}


// ==================================================
// TODAY DATE FOR VISIT FORM
// ==================================================

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    now.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// ==================================================
// PROPERTY DETAIL
// ==================================================

export default function PropertyDetail() {
  const { slug } = useParams<{
    slug: string;
  }>();


  // ==================================================
  // PROPERTY STATE
  // ==================================================

  const [property, setProperty] =
    useState<Property | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // ==================================================
  // IMAGE STATE
  // ==================================================

  const [img, setImg] =
    useState(0);


  // ==================================================
  // INQUIRY STATE
  // ==================================================

  const [form, setForm] =
    useState<InquiryForm>({
      name: '',
      phone: '',
      email: '',
      message:
        'I am interested in this property.',
    });

  const [sent, setSent] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [inquiryError, setInquiryError] =
    useState('');


  // ==================================================
  // VISIT STATE
  // ==================================================

  const [showVisitModal, setShowVisitModal] =
    useState(false);

  const [visitForm, setVisitForm] =
    useState<VisitForm>({
      name: '',
      phone: '',
      preferred_date: '',
    });

  const [visitSending, setVisitSending] =
    useState(false);

  const [visitSent, setVisitSent] =
    useState(false);

  const [visitError, setVisitError] =
    useState('');


  // ==================================================
  // SHARE STATE
  // ==================================================

  const [shareMessage, setShareMessage] =
    useState('');


  // ==================================================
  // APP STORE
  // ==================================================

  const {
    isFav,
    toggleFav,
  } = useApp();


  // ==================================================
  // LOAD PROPERTY FROM BACKEND
  // ==================================================

  useEffect(() => {
    async function loadProperty() {
      if (!slug) {
        setError('Invalid property URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        setProperty(null);
        setImg(0);

        const response =
          await api.get<Property>(
            `/properties/${encodeURIComponent(slug)}/`
          );

        setProperty(response.data);

      } catch (err: any) {
        console.error(
          'Failed to load property:',
          err.response?.data || err
        );

        if (err.response?.status === 404) {
          setError('Property not found.');
        } else {
          setError(
            'Unable to load this property. Please try again.'
          );
        }

      } finally {
        setLoading(false);
      }
    }

    loadProperty();

  }, [slug]);


  // ==================================================
  // SORT PROPERTY IMAGES
  // ==================================================

  const images = useMemo(() => {
    if (!property?.images) {
      return [];
    }

    return [...property.images].sort(
      (a, b) =>
        (a.order || 0) -
        (b.order || 0)
    );

  }, [property]);


  // ==================================================
  // RESET INVALID IMAGE INDEX
  // ==================================================

  useEffect(() => {
    if (img >= images.length) {
      setImg(0);
    }
  }, [img, images.length]);


  // ==================================================
  // PREVENT BODY SCROLL WHEN MODAL IS OPEN
  // ==================================================

  useEffect(() => {
    if (showVisitModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showVisitModal]);


  // ==================================================
  // SUBMIT INQUIRY
  // ==================================================

  async function handleInquirySubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!property) {
      return;
    }

    try {
      setSending(true);
      setInquiryError('');

      const response = await api.post(
        '/inquiries/',
        {
          property: property.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }
      );

      console.log(
        'Inquiry created successfully:',
        response.data
      );

      setSent(true);

    } catch (err: any) {
      console.error(
        'Failed to send inquiry:',
        err.response?.data || err
      );

      setInquiryError(
        getApiErrorMessage(
          err,
          'Unable to send inquiry. Please try again.'
        )
      );

    } finally {
      setSending(false);
    }
  }


  // ==================================================
  // OPEN VISIT MODAL
  // ==================================================

  function handleOpenVisitModal() {
    setVisitForm({
      name: form.name,
      phone: form.phone,
      preferred_date: '',
    });

    setVisitError('');
    setVisitSent(false);
    setShowVisitModal(true);
  }


  // ==================================================
  // CLOSE VISIT MODAL
  // ==================================================

  function handleCloseVisitModal() {
    if (visitSending) {
      return;
    }

    setShowVisitModal(false);
    setVisitError('');
  }


  // ==================================================
  // SUBMIT VISIT REQUEST
  // ==================================================

  async function handleVisitSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!property) {
      return;
    }

    const name =
      visitForm.name.trim();

    const phone =
      visitForm.phone.trim();

    const preferredDate =
      visitForm.preferred_date;

    if (!name) {
      setVisitError(
        'Please enter your name.'
      );
      return;
    }

    if (!phone) {
      setVisitError(
        'Please enter your phone number.'
      );
      return;
    }

    if (!preferredDate) {
      setVisitError(
        'Please select your preferred visit date.'
      );
      return;
    }

    if (preferredDate < getTodayDate()) {
      setVisitError(
        'Please select today or a future date.'
      );
      return;
    }

    try {
      setVisitSending(true);
      setVisitError('');

      const response =
        await api.post(
          '/visits/',
          {
            property: property.id,
            name,
            phone,
            preferred_date:
              preferredDate,
          }
        );

      console.log(
        'Visit scheduled successfully:',
        response.data
      );

      setVisitSent(true);

    } catch (err: any) {
      console.error(
        'Failed to schedule visit:',
        err.response?.data || err
      );

      setVisitError(
        getApiErrorMessage(
          err,
          'Unable to schedule the visit. Please try again.'
        )
      );

    } finally {
      setVisitSending(false);
    }
  }


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-center">

          <Loader2 className="w-9 h-9 mx-auto animate-spin text-brand-600" />

          <p className="text-slate-500 mt-3">
            Loading property...
          </p>

        </div>

      </div>
    );
  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error || !property) {
    return (
      <div className="container-x py-20">

        <Link
          to="/buy"
          className="inline-flex items-center gap-1 text-brand-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <div className="card p-8 mt-6 max-w-xl">

          <h1 className="text-2xl font-bold">
            Property unavailable
          </h1>

          <p className="mt-2 text-slate-500">
            {error || 'Property not found.'}
          </p>

        </div>

      </div>
    );
  }


  // ==================================================
  // DERIVED VALUES
  // ==================================================

  const p = property;

  const fav =
    isFav(p.id);

  const pricePeriod =
    getPricePeriod(p.price_per);

  const pricePerSqft =
    Number(p.area) > 0 &&
    Number(p.price) > 0
      ? Math.round(
          Number(p.price) /
          Number(p.area)
        )
      : null;

  const isForSale =
    p.status === 'For Sale';

  const loanAmount =
    Number(p.price) * 0.8;

  const monthlyEmi =
    Math.round(
      loanAmount * 0.00868
    );

  const backLink =
    p.status === 'For Rent'
      ? '/rent'
      : p.type === 'Office'
        ? '/commercial'
        : '/buy';


  // ==================================================
  // SHARE PROPERTY
  // ==================================================

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: p.title,
          text:
            `Check out this property: ${p.title}`,
          url:
            window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      setShareMessage('Link copied!');

      window.setTimeout(
        () => setShareMessage(''),
        2000
      );

    } catch (err) {
      console.error(
        'Unable to share property:',
        err
      );
    }
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="bg-slate-50">


      {/* BACK BUTTON */}

      <div className="container-x pt-6">

        <Link
          to={backLink}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </Link>

      </div>


      {/* MAIN LAYOUT */}

      <div className="container-x mt-4 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8">


        {/* LEFT CONTENT */}

        <div className="min-w-0">


          {/* IMAGE GALLERY */}

          {images.length > 0 ? (

            <div className="grid md:grid-cols-[minmax(0,1fr)_140px] gap-2 h-[420px] md:h-[480px]">

              <div className="relative overflow-hidden rounded-2xl bg-slate-100">

                <img
                  src={images[img]?.url}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-4 left-4 chip bg-black/60 text-white">

                  <Camera className="w-3 h-3" />

                  {images.length}{' '}

                  {images.length === 1
                    ? 'Photo'
                    : 'Photos'}

                </div>

              </div>


              <div className="hidden md:grid grid-rows-4 gap-2 overflow-hidden">

                {images
                  .slice(0, 4)
                  .map(
                    (
                      image,
                      index
                    ) => (

                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setImg(index)
                        }
                        className={`rounded-xl overflow-hidden border-2 ${
                          img === index
                            ? 'border-brand-600'
                            : 'border-transparent'
                        }`}
                      >

                        <img
                          src={image.url}
                          alt={`${p.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />

                      </button>

                    )
                  )}

              </div>

            </div>

          ) : (

            <div className="h-[420px] md:h-[480px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400">

              <ImageOff className="w-14 h-14" />

              <p className="mt-3">
                No property images available
              </p>

            </div>

          )}


          {/* PROPERTY INFORMATION */}

          <div className="card mt-6 p-5 md:p-7">

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

              <div>

                <div className="flex flex-wrap gap-2 mb-2">

                  <span
                    className={`chip ${
                      p.status === 'For Rent'
                        ? 'bg-blue-600'
                        : 'bg-brand-600'
                    } text-white`}
                  >
                    {p.status}
                  </span>

                  {p.verified && (

                    <span className="chip bg-brand-50 text-brand-700">
                      <BadgeCheck className="w-3 h-3" />
                      Verified
                    </span>

                  )}

                  <span className="chip bg-slate-100 text-slate-700">
                    {p.type}
                  </span>

                </div>


                <h1 className="text-2xl md:text-3xl font-extrabold">
                  {p.title}
                </h1>


                <p className="text-slate-500 flex items-start gap-1 mt-2">

                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />

                  <span>
                    {p.address ||
                      `${p.locality}, ${p.city}`}
                  </span>

                </p>

              </div>


              <div className="flex gap-2 shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    toggleFav(p.id)
                  }
                  className="w-10 h-10 rounded-full border bg-white grid place-items-center hover:bg-slate-50"
                  aria-label="Save property"
                >

                  <Heart
                    className={`w-4 h-4 ${
                      fav
                        ? 'fill-red-500 text-red-500'
                        : 'text-slate-700'
                    }`}
                  />

                </button>


                <div className="relative">

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full border bg-white grid place-items-center hover:bg-slate-50"
                    aria-label="Share property"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {shareMessage && (

                    <div className="absolute right-0 top-12 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-3 py-2 z-10">
                      {shareMessage}
                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* PRICE */}

            <div className="mt-5 flex flex-wrap items-baseline gap-3">

              <div className="text-3xl md:text-4xl font-extrabold text-brand-700">

                {formatPrice(p.price)}

                {pricePeriod && (

                  <span className="text-base font-medium text-slate-500 ml-1">
                    {pricePeriod}
                  </span>

                )}

              </div>


              {pricePerSqft &&
                p.price_per
                  ?.toLowerCase() ===
                  'sqft' && (

                <div className="text-slate-500 text-sm">

                  ≈ ₹
                  {pricePerSqft.toLocaleString(
                    'en-IN'
                  )}
                  /sqft

                </div>

              )}

            </div>


            {/* PROPERTY STATS */}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-brand-50 rounded-xl p-4 text-center">

                <Bed className="w-5 h-5 text-brand-600 mx-auto" />

                <div className="font-semibold mt-1">
                  {p.beds}{' '}
                  {p.beds === 1
                    ? 'Bedroom'
                    : 'Bedrooms'}
                </div>

              </div>


              <div className="bg-brand-50 rounded-xl p-4 text-center">

                <Bath className="w-5 h-5 text-brand-600 mx-auto" />

                <div className="font-semibold mt-1">
                  {p.baths}{' '}
                  {p.baths === 1
                    ? 'Bathroom'
                    : 'Bathrooms'}
                </div>

              </div>


              <div className="bg-brand-50 rounded-xl p-4 text-center">

                <Maximize2 className="w-5 h-5 text-brand-600 mx-auto" />

                <div className="font-semibold mt-1">

                  {Number(
                    p.area
                  ).toLocaleString(
                    'en-IN'
                  )}{' '}

                  {p.area_unit || 'sqft'}

                </div>

              </div>


              <div className="bg-brand-50 rounded-xl p-4 text-center">

                <Car className="w-5 h-5 text-brand-600 mx-auto" />

                <div className="font-semibold mt-1">
                  {p.parking} Parking
                </div>

              </div>

            </div>

          </div>


          {/* ABOUT PROPERTY */}

          <div className="card mt-6 p-5 md:p-7">

            <h2 className="text-xl font-bold mb-3">
              About this property
            </h2>

            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {p.description}
            </p>


            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6 text-sm">

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  Type
                </span>
                <b className="text-right">
                  {p.type || '—'}
                </b>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  Year Built
                </span>
                <b className="text-right">
                  {p.year_built || '—'}
                </b>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  Status
                </span>
                <b className="text-right">
                  {p.status || '—'}
                </b>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  Furnishing
                </span>
                <b className="text-right">
                  {p.furnishing || '—'}
                </b>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  Facing
                </span>
                <b className="text-right">
                  {p.facing || '—'}
                </b>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">
                  RERA
                </span>
                <b className="text-right break-all">
                  {p.rera_id || '—'}
                </b>
              </div>

            </div>

          </div>


          {/* AMENITIES */}

          {p.amenities &&
            p.amenities.length > 0 && (

            <div className="card mt-6 p-5 md:p-7">

              <h2 className="text-xl font-bold mb-4">
                Amenities
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">

                {p.amenities.map(
                  (amenity) => (

                    <div
                      key={amenity}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                      {amenity}
                    </div>

                  )
                )}

              </div>

            </div>

          )}


          {/* LOCATION */}

          <div className="card mt-6 p-5 md:p-7">

            <h2 className="text-xl font-bold mb-1">
              Location
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              {p.address ||
                `${p.locality}, ${p.city}`}
            </p>


            {p.lat !== null &&
            p.lng !== null &&
            Number(p.lat) !== 0 &&
            Number(p.lng) !== 0 ? (

              <div className="aspect-[16/9] rounded-xl overflow-hidden border bg-slate-100">

                <iframe
                  title={`Map location of ${p.title}`}
                  className="w-full h-full"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    Number(p.lng) - 0.02
                  },${
                    Number(p.lat) - 0.01
                  },${
                    Number(p.lng) + 0.02
                  },${
                    Number(p.lat) + 0.01
                  }&layer=mapnik&marker=${p.lat},${p.lng}`}
                />

              </div>

            ) : (

              <div className="rounded-xl bg-slate-100 py-14 text-center text-slate-500">

                <MapPin className="w-9 h-9 mx-auto text-slate-300" />

                <p className="mt-2">
                  Map location is not available.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* RIGHT SIDEBAR */}

        <aside className="space-y-5">


          {/* AGENT + INQUIRY */}

          <div className="card p-6 lg:sticky lg:top-24">

            {p.agent ? (

              <div>

                <div className="flex items-center gap-3">

                  {p.agent.avatar ? (

                    <img
                      src={p.agent.avatar}
                      alt={p.agent.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />

                  ) : (

                    <div className="w-14 h-14 rounded-full bg-brand-50 grid place-items-center text-brand-700 font-bold text-xl">

                      {p.agent.name
                        ?.charAt(0)
                        .toUpperCase() ||
                        'A'}

                    </div>

                  )}


                  <div className="min-w-0">

                    <div className="font-semibold">
                      {p.agent.name}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1 mt-1">

                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

                      Verified Agent

                      <span>·</span>

                      <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />

                      {Number(
                        p.agent.rating
                      ).toFixed(1)}

                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {p.agent.deals_closed}{' '}
                      deals closed
                    </div>

                  </div>

                </div>


                {/* INQUIRY FORM */}

                {!sent ? (

                  <form
                    onSubmit={
                      handleInquirySubmit
                    }
                    className="mt-5 space-y-3"
                  >

                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      disabled={sending}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name:
                            event.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                    />


                    <input
                      required
                      type="tel"
                      placeholder="Phone"
                      value={form.phone}
                      disabled={sending}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          phone:
                            event.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                    />


                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={form.email}
                      disabled={sending}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          email:
                            event.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                    />


                    <textarea
                      required
                      rows={3}
                      value={form.message}
                      disabled={sending}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          message:
                            event.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-slate-100"
                    />


                    {inquiryError && (

                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {inquiryError}
                      </div>

                    )}


                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {sending ? (

                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>

                      ) : (

                        'Send Inquiry'

                      )}

                    </button>


                    <div className="grid grid-cols-2 gap-2">

                      <a
                        href={`tel:${p.agent.phone}`}
                        className="btn-outline !py-2 text-xs"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>


                      <button
                        type="button"
                        onClick={
                          handleOpenVisitModal
                        }
                        className="btn-outline !py-2 text-xs"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule visit
                      </button>

                    </div>

                  </form>

                ) : (

                  <div className="mt-5">

                    <div className="p-4 bg-brand-50 text-brand-700 rounded-lg text-sm">

                      <div className="font-semibold">
                        ✓ Inquiry sent successfully!
                      </div>

                      <div className="mt-1">
                        {p.agent.name} will get back to you soon.
                      </div>

                    </div>


                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <a
                        href={`tel:${p.agent.phone}`}
                        className="btn-outline !py-2 text-xs"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </a>


                      <button
                        type="button"
                        onClick={
                          handleOpenVisitModal
                        }
                        className="btn-outline !py-2 text-xs"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule visit
                      </button>

                    </div>

                  </div>

                )}

              </div>

            ) : (

              <div className="text-center py-4">

                <p className="font-semibold">
                  Agent information unavailable
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Contact support for more information about this property.
                </p>

              </div>

            )}

          </div>


          {/* EMI CALCULATOR */}

          {isForSale && (

            <div className="card p-6">

              <h3 className="font-bold mb-3">
                EMI Calculator
              </h3>

              <div className="text-sm text-slate-600">
                Loan amount
              </div>

              <div className="text-2xl font-bold text-brand-700">
                {formatPrice(loanAmount)}
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Estimated Monthly EMI
              </div>

              <div className="text-2xl font-bold">
                {formatPrice(monthlyEmi)}
              </div>

              <div className="text-xs text-slate-400 mt-1">
                Approx. 20 years at 8.5% interest
              </div>

              <button
                type="button"
                className="btn-outline w-full mt-4"
              >
                Check Eligibility
              </button>

            </div>

          )}

        </aside>

      </div>


      {/* ==================================================
          SCHEDULE VISIT MODAL
      ================================================== */}

      {showVisitModal && (

        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseVisitModal();
            }
          }}
        >

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {!visitSent ? (

              <>

                {/* MODAL HEADER */}

                <div className="flex items-start justify-between gap-4 p-6 pb-0">

                  <div>

                    <h2 className="text-xl font-bold text-slate-900">
                      Schedule a Visit
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Select your preferred date to visit this property.
                    </p>

                  </div>


                  <button
                    type="button"
                    disabled={visitSending}
                    onClick={
                      handleCloseVisitModal
                    }
                    className="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                </div>


                {/* PROPERTY SUMMARY */}

                <div className="mx-6 mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">

                  <div className="flex gap-3">

                    {images.length > 0 && (

                      <img
                        src={images[0].url}
                        alt={p.title}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />

                    )}


                    <div className="min-w-0">

                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {p.title}
                      </div>

                      <div className="text-sm text-slate-500 flex items-start gap-1 mt-1">

                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />

                        <span className="line-clamp-2">
                          {p.locality}, {p.city}
                        </span>

                      </div>

                      <div className="text-sm font-bold text-brand-700 mt-1">
                        {formatPrice(p.price)}
                        {pricePeriod}
                      </div>

                    </div>

                  </div>

                </div>


                {/* VISIT FORM */}

                <form
                  onSubmit={
                    handleVisitSubmit
                  }
                  className="p-6 space-y-4"
                >

                  <div>

                    <label className="text-sm font-semibold text-slate-700">
                      Your Name
                    </label>

                    <input
                      required
                      type="text"
                      value={visitForm.name}
                      disabled={visitSending}
                      onChange={(event) =>
                        setVisitForm({
                          ...visitForm,
                          name:
                            event.target.value,
                        })
                      }
                      placeholder="Enter your name"
                      className="w-full border rounded-lg px-3 py-2.5 mt-1 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-600 disabled:bg-slate-100"
                    />

                  </div>


                  <div>

                    <label className="text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>

                    <input
                      required
                      type="tel"
                      value={visitForm.phone}
                      disabled={visitSending}
                      onChange={(event) =>
                        setVisitForm({
                          ...visitForm,
                          phone:
                            event.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                      className="w-full border rounded-lg px-3 py-2.5 mt-1 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-600 disabled:bg-slate-100"
                    />

                  </div>


                  <div>

                    <label className="text-sm font-semibold text-slate-700">
                      Preferred Visit Date
                    </label>

                    <input
                      required
                      type="date"
                      min={getTodayDate()}
                      value={
                        visitForm.preferred_date
                      }
                      disabled={visitSending}
                      onChange={(event) =>
                        setVisitForm({
                          ...visitForm,
                          preferred_date:
                            event.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2.5 mt-1 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-600 disabled:bg-slate-100"
                    />

                  </div>


                  {/* VISIT ERROR */}

                  {visitError && (

                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {visitError}
                    </div>

                  )}


                  {/* BUTTONS */}

                  <div className="grid grid-cols-2 gap-3 pt-2">

                    <button
                      type="button"
                      disabled={visitSending}
                      onClick={
                        handleCloseVisitModal
                      }
                      className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      disabled={visitSending}
                      className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {visitSending ? (

                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Scheduling...
                        </>

                      ) : (

                        <>
                          <Calendar className="w-4 h-4" />
                          Schedule
                        </>

                      )}

                    </button>

                  </div>

                </form>

              </>

            ) : (

              /* VISIT SUCCESS */

              <div className="p-7 text-center">

                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-700 grid place-items-center mx-auto">

                  <CheckCircle2 className="w-8 h-8" />

                </div>


                <h2 className="text-2xl font-bold text-slate-900 mt-5">
                  Visit Scheduled!
                </h2>


                <p className="text-slate-500 mt-2">
                  Your visit request has been submitted successfully.
                </p>


                <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left">

                  <div className="text-sm text-slate-500">
                    Property
                  </div>

                  <div className="font-semibold mt-1">
                    {p.title}
                  </div>


                  <div className="text-sm text-slate-500 mt-4">
                    Preferred Date
                  </div>

                  <div className="font-semibold mt-1">

                    {new Date(
                      `${visitForm.preferred_date}T00:00:00`
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}

                  </div>


                  {p.agent && (

                    <>

                      <div className="text-sm text-slate-500 mt-4">
                        Agent
                      </div>

                      <div className="font-semibold mt-1">
                        {p.agent.name}
                      </div>

                    </>

                  )}

                </div>


                {p.agent && (

                  <p className="text-sm text-slate-500 mt-5">
                    {p.agent.name} will contact you to confirm the visit.
                  </p>

                )}


                <button
                  type="button"
                  onClick={
                    handleCloseVisitModal
                  }
                  className="btn-primary w-full mt-6"
                >
                  Done
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}