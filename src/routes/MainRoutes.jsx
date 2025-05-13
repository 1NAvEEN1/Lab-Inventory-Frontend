import { lazy } from "react";
import Loadable from "../components/Loadable/Loadable";

// utilities routing
const Layout = Loadable(lazy(() => import("../layout/Layout")));
const Test = Loadable(lazy(() => import("../modules/pages/test/Test")));
const AddItems = Loadable(lazy(() => import("../pages/AddItems/AddItems")));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: <Layout />,
  children: [
    {
      path: "test",
      element: <Test />,
    },
    {
      path: "add-items",
      element: <AddItems />,
    },
  ],
};
export default MainRoutes;
