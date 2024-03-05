export default function Restaurant(props) {
    return (
    <div className="restaurant">
        <p>Restaurant name: {props.name}</p>
        <a href="/">Go back</a>
    </div>
    )
}