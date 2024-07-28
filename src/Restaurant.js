import Code from "./Code";

export default function Restaurant(props) {
    const restaurant = props.data;
    return (
    <div className="restaurant">
        <a href="/">Go back to home page</a>
        <h1>Welcome to {restaurant.name}</h1>
        <img 
            src={`/banners/${restaurant.banner}` ?? `/banners/Default.png`} 
            alt={"An banner of " + restaurant.name}
        />
        <br />
        <h2>Code information:</h2>
        <Code id={restaurant.id} restaurant={restaurant}/>
    </div>
    );
}