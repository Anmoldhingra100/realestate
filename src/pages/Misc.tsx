import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { PROPERTIES } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import { useApp } from '../store/app';

import {
  Award,
  Mail,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';

import {
  api,
  loginUser,
  registerUser,
  getCurrentUser,
} from '../lib/api';


// ==================================================
// FAVORITES
// ==================================================

export function Favorites() {
  const favs = useApp((s) => s.favorites);

  const items = PROPERTIES.filter((p) =>
    favs.includes(p.id)
  );

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold mb-6">
        Saved Properties
      </h1>

      {items.length === 0 ? (
        <p className="text-slate-500">
          No saved properties yet. Tap the ♥ on any listing to save it.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// ==================================================
// AGENT TYPE
// ==================================================

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


// ==================================================
// AGENTS
// ==================================================

export function Agents() {
  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true);
        setError('');

        const response =
          await api.get('/agents/');

        // Supports both:
        // [...]
        //
        // and:
        // {
        //   count: 2,
        //   results: [...]
        // }

        if (
          Array.isArray(
            response.data
          )
        ) {
          setAgents(
            response.data
          );
        } else {
          setAgents(
            response.data.results ||
              []
          );
        }
      } catch (err) {
        console.error(
          'Failed to load agents:',
          err
        );

        setError(
          'Unable to load agents. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);


  return (
    <div className="container-x py-10">

      <h1 className="text-3xl font-extrabold">
        Top Agents
      </h1>

      <p className="text-slate-500 mt-1">
        Connect with our trusted RERA-registered real estate professionals
      </p>


      {/* Loading */}

      {loading && (
        <div className="mt-8 text-center py-12">
          <p className="text-slate-500">
            Loading agents...
          </p>
        </div>
      )}


      {/* Error */}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}


      {/* No Agents */}

      {!loading &&
        !error &&
        agents.length === 0 && (
          <div className="card p-8 mt-8 text-center">
            <p className="text-slate-500">
              No agents are currently available.
            </p>
          </div>
        )}


      {/* Agent Cards */}

      {!loading &&
        !error &&
        agents.length > 0 && (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

            {agents.map(
              (agent) => (

                <div
                  key={agent.id}
                  className="card p-6 flex flex-col"
                >

                  {/* Avatar */}

                  <img
                    src={
                      agent.avatar
                    }
                    alt={
                      agent.name
                    }
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />


                  {/* Name */}

                  <div className="mt-4 text-center">

                    <div className="font-bold text-lg">
                      {
                        agent.name
                      }
                    </div>


                    {/* Rating */}

                    <div className="flex flex-wrap items-center justify-center gap-1 mt-1">

                      <Star className="w-4 h-4 fill-gold-500 text-gold-500" />

                      <span className="text-sm font-semibold">
                        {Number(
                          agent.rating
                        ).toFixed(1)}
                      </span>

                      <span className="text-sm text-slate-500">
                        ·{' '}
                        {
                          agent.deals_closed
                        }{' '}
                        deals closed
                      </span>

                    </div>

                  </div>


                  {/* Verified Badge */}

                  <div className="flex justify-center mt-3">

                    <span className="chip bg-brand-50 text-brand-700">

                      <Award className="w-3 h-3" />

                      Verified Agent

                    </span>

                  </div>


                  {/* RERA */}

                  {agent.rera_id && (

                    <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-500">

                      <ShieldCheck className="w-4 h-4 text-emerald-600" />

                      RERA:{' '}
                      {
                        agent.rera_id
                      }

                    </div>

                  )}


                  {/* Bio */}

                  {agent.bio && (

                    <p className="text-sm text-slate-600 mt-4 text-center line-clamp-3">
                      {agent.bio}
                    </p>

                  )}


                  {/* Contact Information */}

                  <div className="mt-5 space-y-2 text-sm">

                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-brand-700"
                    >
                      <Phone className="w-4 h-4 shrink-0" />

                      {
                        agent.phone
                      }
                    </a>


                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-brand-700 break-all"
                    >
                      <Mail className="w-4 h-4 shrink-0" />

                      {
                        agent.email
                      }
                    </a>

                  </div>


                  {/* Contact Button */}

                  <a
                    href={`tel:${agent.phone}`}
                    className="btn-primary w-full mt-6"
                  >
                    <Phone className="w-4 h-4" />

                    Contact Agent
                  </a>

                </div>

              )
            )}

          </div>

        )}

    </div>
  );
}


// ==================================================
// ABOUT
// ==================================================

export function About() {
  return (
    <div>

      <div className="bg-brand-900 text-white py-20">

        <div className="container-x">

          <h1 className="text-4xl md:text-5xl font-extrabold max-w-2xl">
            Building India's most trusted real estate experience.
          </h1>

          <p className="mt-4 text-white/80 max-w-2xl">
            Since 2018, EstateHub has helped over 2 lakh families
            find homes they love — and 1,200+ agents grow their
            business.
          </p>

        </div>

      </div>


      <div className="container-x py-16 grid md:grid-cols-3 gap-6">

        {[
          [
            '50K+',
            'Active Listings',
          ],
          [
            '25+',
            'Cities',
          ],
          [
            '98%',
            'Customer Satisfaction',
          ],
        ].map(
          ([
            number,
            label,
          ]) => (

            <div
              key={label}
              className="card p-8 text-center"
            >

              <div className="text-4xl font-extrabold text-brand-600">
                {number}
              </div>

              <div className="text-slate-500 mt-1">
                {label}
              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}


// ==================================================
// POST PROPERTY
// ==================================================

export function PostProperty() {
  const [form, setForm] = useState({
    title: '',
    type: 'Apartment',
    status: 'For Sale',
    description: '',
    price: '',
    price_per: 'sqft',
    city: '',
    locality: '',
    address: '',
    lat: '',
    lng: '',
    beds: '1',
    baths: '1',
    area: '',
    area_unit: 'sqft',
    parking: '0',
    year_built: '',
    furnishing: 'Unfurnished',
    facing: '',
    rera_id: '',
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [tags, setTags] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const amenityOptions = [
    'Swimming Pool',
    'Gym',
    'Club House',
    'Power Backup',
    '24x7 Security',
    'Lift',
    'Garden',
    'Covered Parking',
    'Kids Play Area',
    'Jogging Track',
    'Visitor Parking',
    'High Speed Internet',
    'Central AC',
  ];

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleAmenity(amenity: string) {
    setAmenities((previous) => {
      if (previous.includes(amenity)) {
        return previous.filter((item) => item !== amenity);
      }

      return [...previous, amenity];
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        status: form.status,
        description: form.description.trim(),

        price: Number(form.price),
        price_per: form.price_per,

        city: form.city.trim(),
        locality: form.locality.trim(),
        address: form.address.trim(),

        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,

        beds: Number(form.beds),
        baths: Number(form.baths),

        area: Number(form.area),
        area_unit: form.area_unit,

        parking: Number(form.parking),

        year_built: form.year_built
          ? Number(form.year_built)
          : null,

        furnishing: form.furnishing,
        facing: form.facing.trim(),

        rera_id: form.rera_id.trim(),

        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),

        amenities,
      };

      console.log('Submitting property:', payload);

      const response = await api.post(
        '/properties/',
        payload
      );

      console.log(
        'Property created:',
        response.data
      );

      setSuccess(
        'Your property has been posted successfully.'
      );

      setForm({
        title: '',
        type: 'Apartment',
        status: 'For Sale',
        description: '',
        price: '',
        price_per: 'sqft',
        city: '',
        locality: '',
        address: '',
        lat: '',
        lng: '',
        beds: '1',
        baths: '1',
        area: '',
        area_unit: 'sqft',
        parking: '0',
        year_built: '',
        furnishing: 'Unfurnished',
        facing: '',
        rera_id: '',
      });

      setAmenities([]);
      setTags('');
    } catch (err: any) {
      console.error(
        'Property submission error:',
        err.response?.data || err
      );

      if (err.response?.status === 401) {
        setError(
          'Please sign in before posting a property.'
        );
      } else if (err.response?.data) {
        const data = err.response.data;

        if (typeof data === 'string') {
          setError(data);
        } else {
          const messages = Object.entries(data)
            .map(([field, message]) => {
              const text = Array.isArray(message)
                ? message.join(', ')
                : String(message);

              return `${field}: ${text}`;
            })
            .join(' | ');

          setError(
            messages ||
              'Unable to post property.'
          );
        }
      } else {
        setError(
          'Unable to connect to the server.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-12 max-w-5xl">
      {/* HEADER */}

      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Post Your Property
        </h1>

        <p className="text-slate-500 mt-2">
          Add your property details and reach
          potential buyers and tenants.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          ✓ {success}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="font-semibold">
            Unable to post property
          </div>

          <div className="text-sm mt-1">
            {error}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card p-5 md:p-8 mt-8 space-y-8"
      >
        {/* BASIC INFORMATION */}

        <section>
          <h2 className="text-xl font-bold">
            Basic Information
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Tell us what type of property you
            are listing.
          </p>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Listing Title *
              </label>

              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. Luxury 3 BHK Apartment in Sector 62"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Property Type *
              </label>

              <select
                required
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                <option value="Apartment">
                  Apartment
                </option>

                <option value="Villa">
                  Villa
                </option>

                <option value="House">
                  Independent House
                </option>

                <option value="Plot">
                  Plot
                </option>

                <option value="Office">
                  Office
                </option>

                <option value="Shop">
                  Shop
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Listing Type *
              </label>

              <select
                required
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                <option value="For Sale">
                  For Sale
                </option>

                <option value="For Rent">
                  For Rent
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Description *
              </label>

              <textarea
                required
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="Describe the property, location, nearby facilities and important features..."
              />
            </div>
          </div>
        </section>

        {/* PRICE */}

        <section className="border-t pt-7">
          <h2 className="text-xl font-bold">
            Price
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="text-sm font-semibold">
                Price (₹) *
              </label>

              <input
                required
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder={
                  form.status === 'For Rent'
                    ? 'e.g. 50000'
                    : 'e.g. 8500000'
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Price Type *
              </label>

              <select
                name="price_per"
                value={form.price_per}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                {form.status === 'For Rent' ? (
                  <>
                    <option value="month">
                      Per Month
                    </option>

                    <option value="year">
                      Per Year
                    </option>
                  </>
                ) : (
                  <option value="sqft">
                    Total Property Price
                  </option>
                )}
              </select>
            </div>
          </div>
        </section>

        {/* LOCATION */}

        <section className="border-t pt-7">
          <h2 className="text-xl font-bold">
            Location
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="text-sm font-semibold">
                City *
              </label>

              <input
                required
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. Noida"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Locality *
              </label>

              <input
                required
                name="locality"
                value={form.locality}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. Sector 62"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Full Address *
              </label>

              <input
                required
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="Complete property address"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. 28.6289"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. 77.3649"
              />
            </div>
          </div>
        </section>

        {/* PROPERTY DETAILS */}

        <section className="border-t pt-7">
          <h2 className="text-xl font-bold">
            Property Details
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            <div>
              <label className="text-sm font-semibold">
                Bedrooms
              </label>

              <input
                type="number"
                min="0"
                name="beds"
                value={form.beds}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Bathrooms
              </label>

              <input
                type="number"
                min="0"
                name="baths"
                value={form.baths}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Area *
              </label>

              <input
                required
                type="number"
                min="1"
                name="area"
                value={form.area}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="1650"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Area Unit
              </label>

              <select
                name="area_unit"
                value={form.area_unit}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                <option value="sqft">
                  Sq. Ft.
                </option>

                <option value="sqm">
                  Sq. Meter
                </option>

                <option value="sqyd">
                  Sq. Yard
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Parking
              </label>

              <input
                type="number"
                min="0"
                name="parking"
                value={form.parking}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Year Built
              </label>

              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                name="year_built"
                value={form.year_built}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="2026"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Furnishing
              </label>

              <select
                name="furnishing"
                value={form.furnishing}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                <option value="Unfurnished">
                  Unfurnished
                </option>

                <option value="Semi Furnished">
                  Semi Furnished
                </option>

                <option value="Fully Furnished">
                  Fully Furnished
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Facing
              </label>

              <select
                name="facing"
                value={form.facing}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1 bg-white"
              >
                <option value="">
                  Select
                </option>

                <option value="North">
                  North
                </option>

                <option value="South">
                  South
                </option>

                <option value="East">
                  East
                </option>

                <option value="West">
                  West
                </option>

                <option value="North East">
                  North East
                </option>

                <option value="North West">
                  North West
                </option>

                <option value="South East">
                  South East
                </option>

                <option value="South West">
                  South West
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* AMENITIES */}

        <section className="border-t pt-7">
          <h2 className="text-xl font-bold">
            Amenities
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Select all amenities available at the
            property.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
                  amenities.includes(amenity)
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={amenities.includes(
                    amenity
                  )}
                  onChange={() =>
                    toggleAmenity(amenity)
                  }
                  className="accent-brand-600"
                />

                <span className="text-sm font-medium">
                  {amenity}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ADDITIONAL INFORMATION */}

        <section className="border-t pt-7">
          <h2 className="text-xl font-bold">
            Additional Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="text-sm font-semibold">
                RERA ID
              </label>

              <input
                name="rera_id"
                value={form.rera_id}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="e.g. UPRERA2026001234"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Tags
              </label>

              <input
                value={tags}
                onChange={(event) =>
                  setTags(event.target.value)
                }
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
                placeholder="Luxury, 3BHK, Ready to Move"
              />

              <p className="text-xs text-slate-400 mt-1">
                Separate tags with commas.
              </p>
            </div>
          </div>
        </section>

        {/* SUBMIT */}

        <div className="border-t pt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-500">
            Make sure all property information is
            correct before publishing.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Publishing...'
              : 'Publish Property'}
          </button>
        </div>
      </form>
    </div>
  );
}


// ==================================================
// LOGIN
// ==================================================

export function Login() {
  const navigate =
    useNavigate();

  const [
    username,
    setUsername,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');


      // ------------------------------------------
      // STEP 1: LOGIN
      // POST /api/auth/token/
      // ------------------------------------------

      await loginUser(
        username,
        password
      );


      // ------------------------------------------
      // STEP 2: GET CURRENT USER
      // GET /api/auth/me/
      //
      // This also saves the user object
      // into localStorage.
      // ------------------------------------------

      await getCurrentUser();


      // ------------------------------------------
      // STEP 3: NOTIFY LAYOUT
      // ------------------------------------------

      window.dispatchEvent(
        new Event(
          'auth-changed'
        )
      );


      // ------------------------------------------
      // STEP 4: REDIRECT HOME
      // ------------------------------------------

      navigate('/');

    } catch (err: any) {

      console.error(
        'Login failed:',
        err
      );


      setError(
        err.response?.data?.detail ||
          'Invalid username or password.'
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="container-x py-16 max-w-md">

      <div className="card p-8">

        <h1 className="text-2xl font-extrabold">
          Welcome back
        </h1>

        <p className="text-slate-500 mt-1 text-sm">
          Sign in to manage saved properties and inquiries.
        </p>


        {error && (

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-4"
        >

          {/* Username */}

          <div>

            <label className="text-sm font-semibold">
              Username
            </label>

            <input
              type="text"
              value={
                username
              }
              onChange={(
                event
              ) =>
                setUsername(
                  event.target
                    .value
                )
              }
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

          </div>


          {/* Password */}

          <div>

            <label className="text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target
                    .value
                )
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

          </div>


          <button
            type="submit"
            disabled={
              loading
            }
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>

        </form>


        <div className="text-center text-sm text-slate-500 mt-5">

          New here?{' '}

          <Link
            to="/register"
            className="text-brand-700 font-semibold hover:underline"
          >
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
}


// ==================================================
// REGISTER TYPES
// ==================================================

type RegisterForm = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
};


type FieldErrors =
  Record<
    string,
    string[]
  >;


// ==================================================
// REGISTER
// ==================================================

export function Register() {
  const navigate =
    useNavigate();


  const [
    form,
    setForm,
  ] =
    useState<RegisterForm>({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
    });


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<FieldErrors>(
      {}
    );


  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const {
      name,
      value,
    } = event.target;


    setForm(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );


    // Remove the current field error
    // when the user starts editing.

    setFieldErrors(
      (current) => ({
        ...current,

        [name]:
          [],
      })
    );
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    setError('');

    setFieldErrors(
      {}
    );


    // ------------------------------------------
    // FRONTEND PASSWORD CHECK
    // ------------------------------------------

    if (
      form.password !==
      form.password_confirm
    ) {
      setFieldErrors({
        password_confirm: [
          'Passwords do not match.',
        ],
      });

      return;
    }


    try {
      setLoading(true);


      // ------------------------------------------
      // STEP 1: REGISTER USER
      // POST /api/auth/register/
      // ------------------------------------------

      await registerUser(
        form
      );


      // ------------------------------------------
      // STEP 2: AUTOMATIC LOGIN
      // POST /api/auth/token/
      // ------------------------------------------

      await loginUser(
        form.username,
        form.password
      );


      // ------------------------------------------
      // STEP 3: GET NEW USER DETAILS
      // GET /api/auth/me/
      //
      // This saves:
      // first_name
      // last_name
      // username
      // email
      //
      // into localStorage.
      // ------------------------------------------

      await getCurrentUser();


      // ------------------------------------------
      // STEP 4: NOTIFY LAYOUT
      // ------------------------------------------

      window.dispatchEvent(
        new Event(
          'auth-changed'
        )
      );


      // ------------------------------------------
      // STEP 5: REDIRECT HOME
      // ------------------------------------------

      navigate('/');

    } catch (err: any) {

      console.error(
        'Registration failed:',
        err
      );


      const responseData =
        err.response?.data;


      if (
        responseData &&
        typeof responseData ===
          'object'
      ) {

        const normalizedErrors:
          FieldErrors =
          {};


        Object.entries(
          responseData
        ).forEach(
          ([
            key,
            value,
          ]) => {

            if (
              Array.isArray(
                value
              )
            ) {

              normalizedErrors[
                key
              ] =
                value.map(
                  String
                );

            } else {

              normalizedErrors[
                key
              ] = [
                String(
                  value
                ),
              ];

            }

          }
        );


        setFieldErrors(
          normalizedErrors
        );

      } else {

        setError(
          'Registration failed. Please try again.'
        );

      }

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="container-x py-16 max-w-lg">

      <div className="card p-8">

        <h1 className="text-2xl font-extrabold">
          Create your account
        </h1>

        <p className="text-slate-500 mt-1 text-sm">
          Register to save properties, contact agents
          and manage inquiries.
        </p>


        {/* General Error */}

        {error && (

          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-4"
        >

          {/* First Name + Last Name */}

          <div className="grid sm:grid-cols-2 gap-4">


            {/* First Name */}

            <div>

              <label className="text-sm font-semibold">
                First name
              </label>

              <input
                type="text"
                name="first_name"
                value={
                  form.first_name
                }
                onChange={
                  handleChange
                }
                required
                autoComplete="given-name"
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              />

              {fieldErrors.first_name?.map(
                (
                  message,
                  index
                ) => (

                  <p
                    key={
                      index
                    }
                    className="text-xs text-red-600 mt-1"
                  >
                    {
                      message
                    }
                  </p>

                )
              )}

            </div>


            {/* Last Name */}

            <div>

              <label className="text-sm font-semibold">
                Last name
              </label>

              <input
                type="text"
                name="last_name"
                value={
                  form.last_name
                }
                onChange={
                  handleChange
                }
                required
                autoComplete="family-name"
                className="w-full border rounded-lg px-3 py-2.5 mt-1"
              />

              {fieldErrors.last_name?.map(
                (
                  message,
                  index
                ) => (

                  <p
                    key={
                      index
                    }
                    className="text-xs text-red-600 mt-1"
                  >
                    {
                      message
                    }
                  </p>

                )
              )}

            </div>

          </div>


          {/* Username */}

          <div>

            <label className="text-sm font-semibold">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={
                form.username
              }
              onChange={
                handleChange
              }
              required
              autoComplete="username"
              placeholder="Choose a username"
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

            {fieldErrors.username?.map(
              (
                message,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-xs text-red-600 mt-1"
                >
                  {
                    message
                  }
                </p>

              )
            )}

          </div>


          {/* Email */}

          <div>

            <label className="text-sm font-semibold">
              Email address
            </label>

            <input
              type="email"
              name="email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

            {fieldErrors.email?.map(
              (
                message,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-xs text-red-600 mt-1"
                >
                  {
                    message
                  }
                </p>

              )
            )}

          </div>


          {/* Password */}

          <div>

            <label className="text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              required
              minLength={
                8
              }
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

            {fieldErrors.password?.map(
              (
                message,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-xs text-red-600 mt-1"
                >
                  {
                    message
                  }
                </p>

              )
            )}

          </div>


          {/* Confirm Password */}

          <div>

            <label className="text-sm font-semibold">
              Confirm password
            </label>

            <input
              type="password"
              name="password_confirm"
              value={
                form.password_confirm
              }
              onChange={
                handleChange
              }
              required
              minLength={
                8
              }
              autoComplete="new-password"
              placeholder="Enter password again"
              className="w-full border rounded-lg px-3 py-2.5 mt-1"
            />

            {fieldErrors.password_confirm?.map(
              (
                message,
                index
              ) => (

                <p
                  key={
                    index
                  }
                  className="text-xs text-red-600 mt-1"
                >
                  {
                    message
                  }
                </p>

              )
            )}

          </div>


          {/* Non-field Errors */}

          {fieldErrors.non_field_errors?.map(
            (
              message,
              index
            ) => (

              <div
                key={
                  index
                }
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {
                  message
                }
              </div>

            )
          )}


          {/* Submit */}

          <button
            type="submit"
            disabled={
              loading
            }
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Creating account...'
              : 'Create account'}
          </button>

        </form>


        <div className="text-center text-sm text-slate-500 mt-5">

          Already have an account?{' '}

          <Link
            to="/login"
            className="text-brand-700 font-semibold hover:underline"
          >
            Sign in
          </Link>

        </div>

      </div>

    </div>
  );
}