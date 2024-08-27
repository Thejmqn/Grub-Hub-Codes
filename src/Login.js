import './style/Login.css';
import { TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import BackToHome from './BackToHome';

export default function Login() {
    const backend = "http://localhost:8080";
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

        axios.post(`${backend}/login/${username}/${password}`)
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
            } else if (err?.response?.headers?.error) {
                setLogin({...login, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
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

        axios.post(`${backend}/signup/${username}/${password}/${message}`)
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
            } else if (err?.response?.headers?.error) {
                setSignup({...signup, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
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
    <div className="login-container">
        <BackToHome />
        <div className="login">
            <h1>Login</h1>
            <p>Username:</p>
            <TextField 
                id="loginUsername" 
                type="text"
                variant="outlined" 
                value={login.username}
                onChange={v => setLogin({...login, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField 
                id="loginPassword" 
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
                type="text"
                variant="outlined" 
                value={signup.username}
                onChange={v => setSignup({...signup, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField 
                id="signupPassword" 
                variant="outlined"
                type="password"
                value={signup.password}
                onChange={v => setSignup({...signup, password: v.target.value})}
            />
            <p>Confirm Password:</p>
            <TextField 
                id="signupConfirm" 
                type="password"
                variant="outlined" 
                value={signup.confirmPassword}
                onChange={v => setSignup({...signup, confirmPassword: v.target.value})}
            />
            <p>Leaderboard Message (Optional):</p>
            <TextField 
                id="leaderboardMessage" 
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