import './style/Main.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './Restaurant';
import Login from './Login';
import Restaurants from './restaurants.json';
import Leaderboard from './Leaderboard';
import Personalize from './Personalize';
import SignInInfo from './SignInInfo';
import Info from './Info';

const restaurantRouterArray = () => {
  const restaurantArray = [
    {
      path: "/",
      element: <Home />,
      errorElement: <Error />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/personalize",
      element: <Personalize />,
    },
    {
      path: "/info",
      element: <Info />,
    }
  ];
  Restaurants.forEach(restaurant => {
    restaurantArray.push(
      {
        path: `/restaurants/${restaurant.path}`,
        element: <Restaurant data={restaurant} />
      }
    );
  });
  return restaurantArray;
}

const router = createBrowserRouter(restaurantRouterArray());

function Home() {
  return (
  <div className="Home">
    <h1>Welcome to UVA Codes</h1>
    <div className='container'>
    <div className='info-section'>
        <h2>Information:</h2>
        <a href='/info'>How to Use UVA Codes</a>
      </div>
      <div className='restaurant-section'>
        <h2>Restaurants:</h2>
        <ul>
          {Restaurants.map((restaurant) => {
            return (
            <li key={restaurant.id}>
              <a href={`/restaurants/${restaurant.path}`}>
                {restaurant.name}
              </a>
            </li>
            );
          })}
        </ul>
      </div>
      <div className='login-section'>
        <h2>Login:</h2>
        <SignInInfo />
        <a href={`/personalize`}>Personalize your account</a>
      </div>
      <div className='leaderboard-section'>
        <h2>Leaderboard:</h2>
        <Leaderboard />
      </div>
    </div>
  </div>
  );
}

function Error() {
  return (
  <div className="Error">
    <p>Invalid restraunt. Wow.</p>
  </div>
  );
}

function Main() {
  return (
  <div className="App">
    <RouterProvider router={router} />
  </div>
  );
}

export default Main;
