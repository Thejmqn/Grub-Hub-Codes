import { useEffect, useState } from "react";
import axios from "axios";

const AWAITING = 0;
const RECEIVED = 1;
const FAILURE = 2;

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState({status: AWAITING, data: {}});

    const getLeaderboard = () => {
        axios.get("http://localhost:8080/leaderboard")
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
        {leaderboard.status == AWAITING ? <p>Leaderboard loading</p> :
        leaderboard.status == FAILURE ? <p>Failed to get leaderboard</p> :
        <div className="leadeboardList">
            <h2>Recent Leaders:</h2>
            <ol className="recent">
                {leaderboard.data.recent.map(user => {
                    return (
                    <li key={user.id}>
                        User: {user.username} (Recent Submissions: {user.recentSubmissions}). Message: "{user.message}"
                    </li>
                    );
                })}
            </ol>
            <h2>All-time Leaders:</h2>
            <ol className="total">
            {leaderboard.data.total.map(user => {
                    return (
                    <li key={user.id}>
                        User: {user.username} (Total Submissions: {user.totalSubmissions}). Message: "{user.message}"
                    </li>
                    );
                })}
            </ol>
        </div>
        }
        </div>
    );
}