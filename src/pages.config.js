import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import Landing from './pages/Landing';
import PublicShop from './pages/PublicShop';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Shop": Shop,
    "Landing": Landing,
    "PublicShop": PublicShop,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};