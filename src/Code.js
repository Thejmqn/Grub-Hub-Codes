import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Code(props) {
    const backend = "https://gh-backend.azurewebsites.net"
    const restaurant = props.restaurant;
    const [inputCode, setInputCode] = useState("");
    const [outputCode, setOutputCode] = useState({
        code: null, 
        username: null,
        timeDif: null, 
        cookieUser: null, 
        id: null
    });
    const [codeGetStatus, setCodeGetStatus] = useState({
        positive: false,
        message: ""
    });
    const [codeSubmitStatus, setCodeSubmitStatus] = useState({
        positive: false,
        message: ""
    })

    const updateCode = v => {
        const update = v.target.value;
        const isNum = /^\d+$/.test(update);
        if ((update.length <= 4 && isNum) || update === "")
        setInputCode(v.target.value);
    }

    const submitCode = e => {
        e.preventDefault();
        const username = sessionStorage.getItem("username");
        const type = sessionStorage.getItem("type");
        if (!username) {
            setCodeSubmitStatus({positive: false, message: "Must be signed in to submit a code."});
            return;
        } else if (inputCode.length !== 4 || Number(inputCode) > 9999) {
            setCodeSubmitStatus({positive: false, message: "Invalid code. Codes must be 4 digits."});
            return;
        }

        axios.post(`${backend}/codes/submit/${restaurant.id}/${inputCode}/${username}/${type}`)
        .then(res => {
            setCodeSubmitStatus({positive: true, message: "Successfully submit code."});
            setCodeGetStatus({positive: true, message: ""})
            setOutputCode({code: inputCode, user: "You!", timeDif: 0});
        })
        .catch(err => {
            if (!err.response) {
                setCodeSubmitStatus({
                    positive: false,
                    message: "Problem connecting to database.",
                });
                return;
            }

            if (err.response.status === 400) {
                switch (err.response.headers.type) {
                case "INVALID_USERNAME":
                    setCodeSubmitStatus({
                        positive: false,
                        message: "Invalid username submit.",
                    });
                    break;
                case "INVALID_CODE":
                    setCodeSubmitStatus({
                        positive: false,
                        message: "Invalid code. Codes must be 4 digits."
                    });
                    break;
                case "ILLEGAL_RESUBMISSION":
                    setCodeSubmitStatus({
                        positive: false,
                        message: "Code has already been submit. Please wait until refresh."
                    });
                    break;
                default:
                    setCodeSubmitStatus({
                        positive: false,
                        message: "An error occured while submitting: " + err.response.headers.type
                    });
                    break;
                }
            } else if (err?.response?.headers?.error) {
                setCodeSubmitStatus({
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                });
            } else {
                setCodeSubmitStatus({
                    positive: false,
                    message: "An unknown error occurred.",
                });
            }
        });
    }

    const getCode = e => {
        if (e) {
            e.preventDefault();
        }
        axios.get(`${backend}/codes/get/${restaurant.id}`)
        .then(res => {
            if (!res.data) {
                setCodeGetStatus({
                    positive: false,
                    message: "No valid codes found.",
                });
                return;
            }

            const sendTime = new Date(res.data.dateTime);
            const currentTime = new Date(Date.now());
            const timeZoneOffset = sendTime.getTimezoneOffset()*60*1000;
            const timeDifference = Math.floor((currentTime - sendTime - timeZoneOffset) / 1000);

            if (timeDifference > restaurant.refreshTime) {
                setCodeGetStatus({
                    positive: false,
                    message: `No code has been reported since the last code refresh.`,
                });
                return;
            }
            
            const data = res.data;
            setOutputCode({
                code: data.code, 
                username: data.username, 
                timeDif: timeDifference,
                cookieUser: data.cookieUser,
                id: data.userID
            });
            setCodeGetStatus({
                positive: true,
                message: "Successfully updated code.",
            });
        })
        .catch(err => {
            if (!err.response) {
                setCodeGetStatus({
                    positive: false,
                    message: "Problem connecting to database.",
                });
                return;
            }

            if (err.response.status === 404) {
                if (err.response.headers.type === "NO_CODES_FOUND") {
                    setCodeGetStatus({
                        positive: false,
                        message: "No valid codes found.",
                    });
                }
            } else if (err?.response?.headers?.error) {
                setCodeGetStatus({
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                });
            } else {
                setCodeGetStatus({
                    positive: false,
                    message: "An unknown error occurred.",
                });
            }
        });
    }

    useEffect(() => {
        getCode(null);
    }, []);

    useEffect(() => {
        const refreshTime = 1000;
        const interval = setInterval(() => {
            const time = outputCode.timeDif;
            if (time == null) {
                return;
            }

            if (time < restaurant.refreshTime) {
                setOutputCode({...outputCode, timeDif: time+1});
            } else {
                setOutputCode({code: null, username: null, timeDif: null, id: null, cookieUser: null});
            }
        }, refreshTime);
        return () => clearInterval(interval);
    }, [outputCode]);

    return (
    <div className="code-container">
        <div className="code-get">
            <h2>Last reported code: {outputCode.code ?? "None"}</h2>
            { 
            outputCode.cookieUser 
            ? 
            <p>Code was reported by Anonymous User {outputCode.id} {outputCode.timeDif} seconds ago.</p>
            :
            outputCode.id && <p>Code was reported by user "{outputCode.username}" {outputCode.timeDif} seconds ago.</p>
            }
            <p style={codeGetStatus.positive ? {color: "green"} : {color: "red"}}>{codeGetStatus.message}</p>
            <div className="code-buttons">
                <button className="code-buttons" onClick={getCode}>Update Code</button>
            </div>
        </div>
        <div className="code-submit">
            <h2>Code Submissions:</h2>
            <div className="submission-box">
                <p>Submit a Code:</p>
                <TextField 
                    id="submitCode" 
                    variant="outlined"
                    size="large"
                    type="number"
                    value={inputCode}
                    onChange={v => updateCode(v)}
                />
            </div>
            <p style={codeSubmitStatus.positive ? {color: "green"} : {color: "red"}}>{codeSubmitStatus.message}</p>
            <div className="code-buttons">
                <button onClick={submitCode}>Submit Code</button>
            </div>
        </div>
    </div>
    );
}