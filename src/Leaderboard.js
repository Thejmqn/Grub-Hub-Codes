import { useEffect, useState } from "react";
import axios from "axios";

const AWAITING = 0;
const RECEIVED = 1;
const FAILURE = 2;

export default function Leaderboard() {
    const backend = "https://gh-backend.azurewebsites.net"
    const [leaderboard, setLeaderboard] = useState({status: AWAITING, data: {}});

    const getLeaderboard = () => {
        axios.get(`${backend}/leaderboard`)
        .then(res => {
            setLeaderboard({status: RECEIVED, data: res.data});
        })
        .catch(err => {
            setLeaderboard({status: FAILURE, data: {}});
        });
    }

    useEffect(() => {
        getLeaderboard();
    }, []);

    return (
        <div className="leaderboard">
        {leaderboard.status === AWAITING ? <p>Leaderboard loading</p> :
        leaderboard.status === FAILURE ? <p>Failed to get leaderboard</p> :
        <div className="leadeboardList">
            <h2>Recent Leaders:</h2>
            <MapLeaderboard mapType={leaderboard.data.recent} jsonName={"recentSubmissions"} />
            <h2>All-time Leaders:</h2>
            <MapLeaderboard mapType={leaderboard.data.total} jsonName={"totalSubmissions"} />
        </div>
        }
        </div>
    );
}

function MapLeaderboard({mapType, jsonName}) {
    return (
    <ol className={mapType}>
        {mapType.map(user => {
            return (
            <li key={user.id}>
                {user.cookieUser ? 
                `Anonymous User ${user.id} (Submissions: ${user[jsonName]}). Log in to set message.` :
                `${user.username} (Submissions: ${user[jsonName]}). Message: "${user.message}"`
                }
            </li>
            );
        })}
    </ol>
    );
}