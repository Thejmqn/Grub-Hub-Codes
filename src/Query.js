import axios from "axios";
import { useState } from "react";

export default function Query() {
    const [queryText, setQueryText] = useState({positive: false, text: ""});

    const click = () => {
        if (!sessionStorage.getItem("username")) {
            setQueryText({positive: false, text: "Must be signed in to report a code."});
            return;
        }
        axios.get("http://localhost:8080/codes/1")
        .then(res => {
            setQueryText(res.data[0].code);
        })
        .catch(err => {
            console.log(err);
            setQueryText("Could not retrieve data: " + err);
        });
    }

    return (
    <div className="query">
        <button onClick={click}>Query</button>
        <p style={{color: queryText.positive ? "green" : "red"}}>{queryText.text}</p>
        <p>{sessionStorage.getItem("username") ?? "Not signed in."}</p>
    </div>
    );
}