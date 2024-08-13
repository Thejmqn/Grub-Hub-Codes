import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Code(props) {
    const restaurant = props.restaurant;
    const [inputCode, setInputCode] = useState("");
    const [outputCode, setOutputCode] = useState({code: null, user: null, timeDif: null});
    const [codeStatus, setCodeStatus] = useState({
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
            setCodeStatus({positive: false, message: "Must be signed in to submit a code."});
            return;
        } else if (Number(inputCode) < 1000 || Number(inputCode) > 9999) {
            setCodeStatus({positive: false, message: "Invalid code. Codes must be 4 digits."});
            return;
        }

        axios.post(`https://gh-backend.azurewebsites.net/codes/submit/${restaurant.id}/${inputCode}/${username}/${type}`)
        .then(res => {
            setCodeStatus({positive: true, message: "Successfully submit code."});
            setOutputCode({code: inputCode, user: "You!", timeDif: 0});
        })
        .catch(err => {
            if (err.response.status === 400) {
                switch (err.response.headers.type) {
                case "INVALID_USERNAME":
                    setCodeStatus({
                        positive: false,
                        message: "Invalid username submit.",
                    });
                    break;
                case "INVALID_CODE":
                    setCodeStatus({
                        positive: false,
                        message: "Invalid code. Codes must be 4 digits."
                    });
                    break;
                case "ILLEGAL_RESUBMISSION":
                    setCodeStatus({
                        positive: false,
                        message: "Code has already been submit. Please wait until refresh."
                    });
                    break;
                default:
                    setCodeStatus({
                        positive: false,
                        message: "An error occured while submitting: " + err.response.headers.type
                    });
                    break;
                }
            } else if (err?.response?.headers?.error) {
                setCodeStatus({...codeStatus, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
            } else {
                setCodeStatus({
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
        axios.get(`https://gh-backend.azurewebsites.net/codes/get/${restaurant.id}`)
        .then(res => {
            console.log(res)
            if (!res.data) {
                setCodeStatus({
                    positive: false,
                    message: "No valid codes found.",
                });
                return;
            }

            const sendTime = new Date(res.data.dateTime);
            const currentTime = new Date(Date.now());
            const timeZoneOffset = sendTime.getTimezoneOffset()*60*1000;
            const timeDifference = Math.floor((currentTime - sendTime - timeZoneOffset) / 1000);
            console.log(timeDifference + " " + restaurant.refreshTime)

            if (timeDifference > restaurant.refreshTime) {
                setCodeStatus({
                    positive: false,
                    message: `No code has been reported since the last code refresh.`,
                });
                return;
            }
            
            const data = res.data;
            setOutputCode({code: data.code, user: data.userID, timeDif: timeDifference});
            setCodeStatus({
                positive: true,
                message: "Updated code.",
            });
        })
        .catch(err => {
            if (err.response.status === 404) {
                if (err.response.headers.type === "NO_CODES_FOUND") {
                    setCodeStatus({
                        positive: false,
                        message: "No valid codes found.",
                    });
                }
            } else if (err?.response?.headers?.error) {
                setCodeStatus({...codeStatus, response: {
                    positive: false,
                    message: "500 Internal Server Error: " + err.response.headers.error,
                }});
            } else {
                setCodeStatus({
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
                setOutputCode({code: null, user: null, timeDif: null});
            }
        }, refreshTime);
        return () => clearInterval(interval);
    }, [outputCode]);

    return (
    <div className="code">
        <TextField 
            id="submitCode" 
            label="Submit a Code" 
            variant="outlined"
            type="number"
            value={inputCode}
            onChange={v => updateCode(v)}
        />
        <div className="inputCode">
            <h2>Last reported code: {outputCode.code ?? "No recent codes reported."}</h2>
            {outputCode.user && <p>Code was reported by user "{outputCode.user}" {outputCode.timeDif} seconds ago.</p>}
            <button onClick={getCode}>Update Code</button>
            <p style={codeStatus.positive ? {color: "green"} : {color: "red"}}>{codeStatus.message}</p>
        </div>
        <button onClick={submitCode}>Submit</button>
    </div>
    );
}