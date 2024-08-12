import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './Restaurant';
import Login from './Login';
import Restaurants from './restaurants.json';
import Leaderboard from './Leaderboard';
import Personalize from './Personalize';

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
    <h1>Login:</h1>
    <a href={`/login`}>Login/Signup</a>
    <br />
    <a href={`/personalize`}>Personalize your account</a>
    <h1>Restaurants:</h1>
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
    <h1>Leaderboard:</h1>
    <Leaderboard />
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
