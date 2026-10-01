// Base styles first so component styles can override them
import './styles/global.css';
import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout.jsx';
import AccessoriesPage from './pages/AccessoriesPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CigarettesPage from './pages/CigarettesPage.jsx';
import CigarsPage from './pages/CigarsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProductPage from './pages/ProductPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="cigarettes" element={<CigarettesPage />} />
        <Route path="cigars" element={<CigarsPage />} />
        <Route path="accessories" element={<AccessoriesPage />} />
        <Route path=":category" element={<CategoryPage />} />
        <Route path=":category/:brand" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
