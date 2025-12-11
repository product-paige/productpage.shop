import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Shop": Shop,
    "Landing": Landing,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};