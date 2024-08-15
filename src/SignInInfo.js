export default function SignInInfo() {
    const username = sessionStorage.getItem("username");
    const loggedIn = sessionStorage.getItem("type") === "login";

    return (
    <div className="signInInfo">
        {loggedIn ? 
        <p className="logInInfo">Signed in as <strong>{username}</strong></p> 
        : 
        <p>Not signed in. <a href="/login">Log in here.</a></p>}
    </div>
    );
}