import {useState} from "react";
import axios from "axios";
import {TextField} from "@mui/material";
import { sha256 } from "js-sha256";

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
        const passwordHash = sha256(m.password);
        axios.post(`${backend}/change/message/${m.username}/${passwordHash}/${m.newMessage}`)
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
        const oldHash = sha256(p.oldPassword);
        const newHash = sha256(p.newPassword);
        if (oldHash === newHash) {
            setPassword({...password, response: {
                positive: false,
                message: "Old password cannot be same as new password.",
            }});
            return;
        }

        axios.post(`${backend}/change/password/${p.username}/${oldHash}/${newHash}`)
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
            } else {
                setPassword({...password, response: {
                    positive: false,
                    message: "An unknown error occurred.",
                }});
            }
        });
    }

    return (
        <div className="personalize">
            <a href="/">Go back to home page</a>
            <h1>Personalize Account</h1>
            <h2>Change Message:</h2>
            <p>Username:</p>
            <TextField
                id="messageUsername"
                label="Username"
                variant="outlined"
                value={message.username}
                onChange={v => setMessage({...message, username: v.target.value})}
            />
            <p>Password:</p>
            <TextField
                id="messagePasword"
                label="Password"
                variant="outlined"
                type="password"
                value={message.password}
                onChange={v => setMessage({...message, password: v.target.value})}
            />
            <p>New Message:</p>
            <TextField
                id="messageMessage"
                label="New Message"
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
                label="Username"
                variant="outlined"
                value={password.username}
                onChange={v => setPassword({...password, username: v.target.value})}
            />
            <p>Old Password:</p>
            <TextField
                id="passwordOld"
                label="Old Password"
                variant="outlined"
                type="password"
                value={password.oldPassword}
                onChange={v => setPassword({...password, oldPassword: v.target.value})}
            />
            <p>New Password:</p>
            <TextField
                id="passwordNew"
                label="New Password"
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