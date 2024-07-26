import Code from "./Code";

export default function Restaurant(props) {
    return (
    <div className="restaurant">
        <a href="/">Go back to home page</a>
        <h1>Welcome to {props.name}</h1>
        <img src={props.img ?? `/banners/Default.png`} alt={"An banner of " + props.name} />
        <br />
        <h2>Code information:</h2>
        <Code id={props.id}/>
    </div>
    );
}