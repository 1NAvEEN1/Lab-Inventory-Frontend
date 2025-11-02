import { lazy } from "react";
import Loadable from "../components/Loadable/Loadable";
import ProtectedRoute from "./ProtectedRoute";

// utilities routing
const Layout = Loadable(lazy(() => import("../layout/Layout")));
const Test = Loadable(lazy(() => import("../modules/pages/test/Test")));
const UserProfile = Loadable(lazy(() => import("../modules/user/profile/UserProfile")));

// Inventory pages
const Items = Loadable(lazy(() => import("../pages/Inventory/Items")));
const Categories = Loadable(lazy(() => import("../pages/Inventory/Categories")));
const Locations = Loadable(lazy(() => import("../pages/Inventory/Locations")));
const AddItem = Loadable(lazy(() => import("../pages/Inventory/AddItem")));
const AddCategory = Loadable(lazy(() => import("../pages/Inventory/AddCategory")));
const CreateLocation = Loadable(lazy(() => import("../pages/Inventory/CreateLocation")));
const ItemInventory = Loadable(lazy(() => import("../pages/Inventory/ItemInventory")));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "test",
      element: <Test />,
    },
    {
      path: "profile",
      element: <UserProfile />,
    },
    // Inventory routes
    {
      path: "inventory/items",
      element: <Items />,
    },
    {
      path: "inventory/items/add-item",
      element: <AddItem />,
    },
    {
      path: "inventory/items/view-item/:id",
      element: <AddItem />,
    },
    {
      path: "inventory/items/inventory/:itemId",
      element: <ItemInventory />,
    },
    {
      path: "inventory/categories",
      element: <Categories />,
    },
    {
      path: "inventory/categories/add-category",
      element: <AddCategory />,
    },
    {
      path: "inventory/categories/view-category/:id",
      element: <AddCategory />,
    },
    {
      path: "inventory/locations",
      element: <Locations />,
    },
    {
      path: "inventory/locations/add-location",
      element: <CreateLocation />,
    },
    {
      path: "inventory/locations/view-location/:id",
      element: <CreateLocation />,
    },
  ],
};
export default MainRoutes;
