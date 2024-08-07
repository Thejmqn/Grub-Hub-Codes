import { TextField } from "@mui/material";
import { useState } from "react";
import { sha256 } from "js-sha256";
import axios from "axios";

export default function Login() {
    const [login, setLogin] = useState({
        username: "",
        password: "",
        response: {
            positive: true,
            message: "",
        },
    });
    const [signup, setSignup] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        response: {
            positive: true,
            message: "",
        },
    });

    const submitLogin = (username, password) => {
        let isError = false;
        let errorMessage = "An unknown error occurred.";
        if (username.length < 3) {
            isError = true;
            errorMessage = "Usernames must be at least 3 characters.";
        } else if (password.length < 3) {
            isError = true;
            errorMessage = "Password must be at least 3 characters."
        }
        if (isError) {
            setLogin({...login, response: {
                positive: false,
                message: errorMessage,
            }});
            return;
        }

        const passwordHash = sha256(password);
        axios.post(`https://gh-backend.azurewebsites.net/${username}/${passwordHash}`)
        .then(res => {
            setLogin({...login, response: {
                positive: true,
                message: "Successfully logged in.",
            }});
            sessionLogin(username);
        })
        .catch(err => {
            if (err.response.status === 400) {
                if (err.response.headers.type === "INVALID_LOGIN") {
                    setLogin({...login, response: {
                        positive: false,
                        message: "Invalid username or password.",
                    }});
                }
            } else {
                setLogin({...login, response: {
                    positive: false,
                    message: "An unknown error occurred.",
                }});
            }
        })
    }

    const submitSignup = (username, password, confirmPassword) => {
        let isError = false;
        let errorMessage = "An unknown error occurred.";
        if (password !== confirmPassword) {
            isError = true;
            errorMessage = "Passwords do not match."
        } else if (username.length > 32) {
            isError = true;
            errorMessage = "Username must be 32 characters or less.";
        } else if (username.length < 3) {
            isError = true;
            errorMessage = "Usernames must be at least 3 characters.";
        } else if (password.length < 3) {
            isError = true;
            errorMessage = "Password must be at least 3 characters."
        }
        if (isError) {
            setSignup({...signup, response: {
                positive: false,
                message: errorMessage,
            }});
            return;
        }

        const passwordHash = sha256(password);
        axios.post(`https://gh-backend.azurewebsites.net/${username}/${passwordHash}`)
        .then(res => {
            setSignup({...signup, response: {
                positive: true,
                message: "Successfully created account.",
            }});
            sessionLogin(username);
        })
        .catch(err => {
            if (err.response.status === 400) {
                if (err.response.headers.type === "USERNAME_EXISTS") {
                    setSignup({...signup, response: {
                        positive: false,
                        message: "Username already exists.",
                    }});
                }
            } else {
                setSignup({...signup, response: {
                    positive: false,
                    message: "An unknown error occurred.",
                }});
            }
        });
    }

    const handleLogin = e => {
        e.preventDefault();
        submitLogin(login.username, login.password)
        console.log("asdasdsd")
    }

    const handleSignup = e => {
        e.preventDefault();
        submitSignup(signup.username, signup.password, signup.confirmPassword);
        console.log("asdasdsd")
    }

    const sessionLogin = (username) => {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("type", "login");
    }

    return (
    <div className="loginPage">
        <a href="/">Return Home</a>
        <div className="login">
            <h1>Login</h1>
            <p>Username:</p>
            <TextField 
                id="loginUsername" 
                label="Username" 
                variant="outlined" 
                value={login.username}
                onChange={v => setLogin({...login, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField 
                id="loginPassword" 
                label="Password" 
                type="password"
                variant="outlined" 
                value={login.password}
                onChange={v => setLogin({...login, password: v.target.value})}
            />
            <p style={login.response.positive ? {color: "green"} : {color: "red"}}>{login.response.message}</p>
            <button onClick={handleLogin}>Submit</button>
            <p>{sessionStorage.getItem("username") ?? "Not signed in."}</p>
        </div>
        <div className="signup">
            <h1>Signup</h1>
            <p>Username:</p>
            <TextField 
                id="signupUsername" 
                label="Username" 
                variant="outlined" 
                value={signup.username}
                onChange={v => setSignup({...signup, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField 
                id="signupPassword" 
                label="Password" 
                variant="outlined"
                type="password"
                value={signup.password}
                onChange={v => setSignup({...signup, password: v.target.value})}
            />
            <p>Confirm Password:</p>
            <TextField 
                id="signupConfirm" 
                label="Confirm Password" 
                type="password"
                variant="outlined" 
                value={signup.confirmPassword}
                onChange={v => setSignup({...signup, confirmPassword: v.target.value})}
            />
            <p style={signup.response.positive ? {color: "green"} : {color: "red"}}>{signup.response.message}</p>
            <button onClick={handleSignup}>Submit</button>
        </div>
    </div>
    );
}