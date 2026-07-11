import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';

import {
  Favorites,
  Agents,
  About,
  PostProperty,
  Login,
  Register,
} from './pages/Misc';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/buy"
          element={
            <Listings
              title="Properties for Sale"
              filter={(p) =>
                p.status === 'For Sale'
              }
            />
          }
        />

        <Route
          path="/rent"
          element={
            <Listings
              title="Properties for Rent"
              filter={(p) =>
                p.status === 'For Rent'
              }
            />
          }
        />

        <Route
          path="/new-launches"
          element={
            <Listings
              title="New Launches"
              filter={(p) =>
                p.status === 'New Launch'
              }
            />
          }
        />

        <Route
          path="/commercial"
          element={
            <Listings
              title="Commercial Properties"
              filter={(p) =>
                p.type === 'Office'
              }
            />
          }
        />

        <Route
          path="/property/:slug"
          element={<PropertyDetail />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        <Route
          path="/agents"
          element={<Agents />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/post"
          element={<PostProperty />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Route>
    </Routes>
  );
}