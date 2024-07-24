import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './Restaurant';
import Login from './Login';

const router = createBrowserRouter([
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
    path: "/restaurants/chic-fil-a",
    element: <Restaurant name={"Chic-Fil-A"} id={1}/>,
  },
  {
    path: "/restaurants/west-range",
    element: <Restaurant name={"West Range Café"} id={2}/>,
  },
  {
    path: "/restaurants/rising-roll",
    element: <Restaurant name={"Rising Roll"} id={3}/>,
  },
]);

function Home() {
  return (
  <div className="Home">
    <p>Login:</p>
    <a href={`/login`}>Login/Signup</a>
    <p>Restaurants:</p>
    <ul>
      <li><a href={`/restaurants/chic-fil-a`}>Chic-Fil-A</a></li>
      <li><a href={`/restaurants/west-range`}>West Range Café</a></li>
      <li><a href={`/restaurants/rising-roll`}>Rising Roll</a></li>
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
