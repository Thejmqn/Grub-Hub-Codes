import './style/Restaurant.css';
import BackToHome from "./BackToHome";
import Code from "./Code";
import Cookie from "./Cookie";

export default function Restaurant(props) {
    const restaurant = props.data;
    return (
    <div className="restaurant">
        <Cookie />
        <BackToHome />
        <h1 className='restaurant-title'>{restaurant.name}</h1>
        <img className='restaurant-banner'
            src={`/banners/${restaurant.banner}` ?? `/banners/Default.png`} 
            alt={"An banner of " + restaurant.name}
        />
        <br />
        <Code id={restaurant.id} restaurant={restaurant}/>
    </div>
    );
}