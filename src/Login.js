import { TextField } from "@mui/material";
import { useState } from "react";
import { sha256 } from "js-sha256";
import axios from "axios";

export default function Login() {
    const backend = "https://gh-backend.azurewebsites.net";
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
        message: "",
        response: {
            positive: true,
            message: "",
        },
    });

    const submitLogin = (username, password, message) => {
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
        axios.post(`${backend}/login/${username}/${passwordHash}`)
        .then(res => {
            setLogin({...login, response: {
                positive: true,
                message: "Successfully logged in.",
            }});
            sessionLogin(res.data.username);
        })
        .catch(err => {
            if (!err.response) {
                setLogin({...login, response: {
                    positive: false,
                    message: "Problem connecting to database.",
                }});
                return;
            }
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

    const submitSignup = (username, password, confirmPassword, message) => {
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
        axios.post(`${backend}/signup/${username}/${passwordHash}/${message}`)
        .then(res => {
            setSignup({...signup, response: {
                positive: true,
                message: "Successfully created account.",
            }});
            sessionLogin(username);
        })
        .catch(err => {
            if (!err.response) {
                setSignup({...signup, response: {
                    positive: false,
                    message: "Problem connecting to database.",
                }});
                return;
            }
            if (err.response.status === 400) {
                switch (err.response.headers.type) {
                case "USERNAME_EXISTS":
                    setSignup({...signup, response: {
                        positive: false,
                        message: "Username already exists.",
                    }});
                break;
                case "VARIABLE_TOO_LONG":
                    setSignup({...signup, response: {
                        positive: false,
                        message: "Variable name is too long.",
                    }});
                break;
                default:
                    setSignup({...signup, response: {
                        positive: false,
                        message: "Invalid request sent.",
                    }});
                break;
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
    }

    const handleSignup = e => {
        e.preventDefault();
        submitSignup(signup.username, signup.password, signup.confirmPassword, signup.message);
    }

    const sessionLogin = (username) => {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("type", "login");
    }

    return (
    <div className="loginPage">
        <a href="/">Go back to home page</a>
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
            <p>Leaderboard Message (Optional):</p>
            <TextField 
                id="leaderboardMessage" 
                label="Message" 
                variant="outlined" 
                value={signup.message}
                onChange={v => setSignup({...signup, message: v.target.value})}
            />
            <p style={signup.response.positive ? {color: "green"} : {color: "red"}}>{signup.response.message}</p>
            <button onClick={handleSignup}>Submit</button>
        </div>
    </div>
    );
}