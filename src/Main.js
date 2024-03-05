import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Restaurant from './Restaurant';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/chic-fil-a",
    element: <Restaurant name={"Chic-Fil-A"} />
  },
  {
    path: "/west-range",
    element: <Restaurant name={"West Range Café"} />
  },
  {
    path: "/rising-roll",
    element: <Restaurant name={"Rising Roll"} />
  },
]);

function Home() {
  return (
  <div className="Home">
    <p>Restaurants:</p>
    <ul>
      <li><a href={`/chic-fil-a`}>Chic-Fil-A</a></li>
      <li><a href={`/west-range`}>West Range Café</a></li>
      <li><a href={`/rising-roll`}>Rising Roll</a></li>
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
