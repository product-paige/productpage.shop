import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Brands from './pages/Brands';
import Analytics from './pages/Analytics';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Shop": Shop,
    "Landing": Landing,
    "Settings": Settings,
    "Brands": Brands,
    "Analytics": Analytics,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};