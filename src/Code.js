import { TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function Code(props) {
    const restaurant = props.restaurant;
    const [inputCode, setInputCode] = useState("");
    const [outputCode, setOutputCode] = useState("");
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
        if (!sessionStorage.getItem("username")) {
            setCodeStatus({positive: false, message: "Must be signed in to submit a code."});
            return;
        } else if (Number(inputCode) < 1000 || Number(inputCode) > 9999) {
            setCodeStatus({positive: false, message: "Invalid code. Codes must be 4 digits."});
            return;
        }

        axios.post(`http://localhost:8080/codes/submit/${restaurant.id}/${inputCode}/${sessionStorage.getItem("username")}`)
        .then(res => {
            console.log(res);
            setCodeStatus({positive: true, message: "Successfully submit code."});
            setOutputCode(inputCode);
        })
        .catch(err => {
            if (err.response.status === 404) {
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
                default:
                    setCodeStatus({
                        positive: false,
                        message: "An error occured while reading:" + err.response.headers.type
                    });
                    break;
                }
            } else {
                setCodeStatus({
                    positive: false,
                    message: "An unknown error occurred.",
                });
            }
        });
    }

    const getCode = e => {
        e.preventDefault();
        axios.get(`http://localhost:8080/codes/get/${restaurant.id}`)
        .then(res => {
            const sendTime = new Date(res.data.dateTime);
            const currentTime = new Date(Date.now());
            const timeZoneOffset = sendTime.getTimezoneOffset()*60*1000;
            const timeDifference = Math.floor((currentTime - sendTime - timeZoneOffset) / 1000);

            if (timeDifference > restaurant.refreshTime) {
                setCodeStatus({
                    positive: false,
                    message: `No code has been reported since the last code refresh.`,
                });
                return;
            }
            setOutputCode(res.data.code);
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
            } else {
                setCodeStatus({
                    positive: false,
                    message: "An unknown error occurred.",
                });
            }
        });
    }

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
            <h2>Last reported code: {outputCode ?? "Press to get code."}</h2>
            <button onClick={getCode}>Update Code</button>
            <p style={codeStatus.positive ? {color: "green"} : {color: "red"}}>{codeStatus.message}</p>
        </div>
        <button onClick={submitCode}>Submit</button>
    </div>
    );
}