import './style/Login.css';
import {useState} from "react";
import axios from "axios";
import {TextField} from "@mui/material";
import BackToHome from './BackToHome';

export default function Personalize() {
    const backend = "https://gh-backend.azurewebsites.net";
    const [message, setMessage] = useState({
        username: '',
        password: '',
        newMessage: '',
        response: {
           positive: true,
           message: "",
        },
    });
    const [password, setPassword] = useState({
        username: '',
        oldPassword: '',
        newPassword: '',
        response: {
            positive: true,
            message: "",
        },
    });

    const changeMessage = () => {
        const m = message;
        axios.post(`${backend}/change/message/${m.username}/${m.password}/${m.newMessage}`)
        .then(res => {
            setMessage({...message, response: {
                positive: true,
                message: "Successfully changed message.",
            }});
        })
        .catch(err => {
            if (!err.response) {
                setMessage({...message, response: {
                    positive: false,
                    message: "Problem connecting to database.",
                }});
                return;
            }

            if (err.response.status === 400) {
                switch (err.response.headers.type) {
                case "INVALID_LOGIN":
                    setMessage({...message, response: {
                        positive: false,
                        message: "Incorrect username or password.",
                    }});
                    break;
                default:
                    setMessage({...message, response: {
                        positive: false,
                        message: "Invalid login deteced.",
                    }});
                    break;
                }
            } else if (err?.response?.headers?.error) {
                setMessage({...message, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
            } else {
                setMessage({...message, response: {
                    positive: false,
                    message: "An unknown error occurred.",
                }});
            }
        });
    }

    const changePassword = () => {
        const p = password;
        if (p.oldPassword === p.newPassword) {
            setPassword({...password, response: {
                positive: false,
                message: "Old password cannot be same as new password.",
            }});
            return;
        }

        axios.post(`${backend}/change/password/${p.username}/${p.oldPassword}/${p.newPassword}`)
        .then(res => {
            setPassword({...password, response: {
                positive: true,
                message: "Successfully changed password.",
            }});
        })
        .catch(err => {
            if (!err.response) {
                setPassword({...password, response: {
                    positive: false,
                    message: "Problem connecting to database.",
                }});
                return;
            }
            
            if (err.response.status === 400) {
                switch (err.response.headers.type) {
                case "INVALID_LOGIN":
                    setPassword({...password, response: {
                        positive: false,
                        message: "Incorrect username or password.",
                    }});
                    break;
                case "PASSWORDS_SAME":
                    setPassword({...password, response: {
                        positive: false,
                        message: "Old password cannot be same as new password.",
                    }});
                    break;
                default:
                    setPassword({...password, response: {
                        positive: false,
                        message: "Invalid login deteced.",
                    }});
                    break;
                }
            } else if (err?.response?.headers?.error) {
                setPassword({...password, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
            } else {
                setPassword({...password, response: {
                    positive: false,
                    message: "An unknown error occurred.",
                }});
            }
        });
    }

    return (
        <div className="login-container">
            <BackToHome />
            <h1>Personalize Account</h1>
            <h2>Change Message:</h2>
            <p>Username:</p>
            <TextField
                id="messageUsername"
                variant="outlined"
                value={message.username}
                onChange={v => setMessage({...message, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField
                id="messagePasword"
                variant="outlined"
                type="password"
                value={message.password}
                onChange={v => setMessage({...message, password: v.target.value})}
            />
            <p>New Message:</p>
            <TextField
                id="messageMessage"
                variant="outlined"
                value={message.newMessage}
                onChange={v => setMessage({...message, newMessage: v.target.value})}
            />
            <p style={message.response.positive ? {color: "green"} : {color: "red"}}>{message.response.message}</p>
            <button onClick={changeMessage}>Submit</button>
            <h2>Change Password:</h2>
            <p>Username:</p>
            <TextField
                id="passwordUsername"
                variant="outlined"
                value={password.username}
                onChange={v => setPassword({...password, username: v.target.value})}
            />
            <p>Old Password:</p>
            <TextField
                id="passwordOld"
                variant="outlined"
                type="password"
                value={password.oldPassword}
                onChange={v => setPassword({...password, oldPassword: v.target.value})}
            />
            <p>New Password:</p>
            <TextField
                id="passwordNew"
                variant="outlined"
                type="password"
                value={password.newPassword}
                onChange={v => setPassword({...password, newPassword: v.target.value})}
            />
            <p style={password.response.positive ? {color: "green"} : {color: "red"}}>{password.response.message}</p>
            <button onClick={changePassword}>Submit</button>
        </div>
    );
}