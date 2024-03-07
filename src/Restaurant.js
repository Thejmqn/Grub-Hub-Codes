import Query from "./Query";

export default function Restaurant(props) {
    return (
    <div className="restaurant">
        <Query />
        <p>Restaurant name: {props.name}</p>
        <a href="/">Go back</a>
    </div>
    );
}