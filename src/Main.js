import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './Restaurant';
import Login from './Login';
import Restaurants from './restaurants.json';

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
    <p>Login:</p>
    <a href={`/login`}>Login/Signup</a>
    <p>Restaurants:</p>
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
