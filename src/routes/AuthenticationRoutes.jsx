import { lazy } from 'react';
import Loadable from '../components/Loadable/Loadable';

// import Loadable from 'ui-component/Loadable';
 const UserLogin = Loadable(lazy(() => import('../modules/user/auth/UserLogin')));


// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/login',
  element: <UserLogin />,
};

export default AuthenticationRoutes;
