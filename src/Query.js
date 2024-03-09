import axios from "axios";
import { useState } from "react";

export default function Query() {
    const [queryText, setQueryText] = useState("");

    const click = () => {
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
        <p>{queryText}</p>
    </div>
    );
}