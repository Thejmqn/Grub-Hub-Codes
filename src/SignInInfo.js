export default function SignInInfo() {
    const username = sessionStorage.getItem("username");
    const loggedIn = sessionStorage.getItem("type") === "username";

    return (
    <div className="signInInfo">
        {loggedIn ? 
        <p>Signed in as {username}</p> 
        : 
        <p>Not signed in. <a href="/login">Log in here.</a></p>}
    </div>
    );
}