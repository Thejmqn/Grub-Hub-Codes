import BackToHome from "./BackToHome";

export default function Info() {
    return (
    <div className="info-container">
        <BackToHome />
        <h1>Information</h1>
        <div className="how-to-use">
            <h2>How to Use</h2>
            <h3>Signing Up</h3>
            <p>The purpose of signing up is to track the number of reported codes for the leaderboard.</p>
            <ol>
                <li>Navigate to the "Log in here" page.</li>
                <li>Scroll to the "Sign Up" section.</li>
                <li>Enter a username and password.</li>
                <li>Enter a notification method if desired.</li>
                <li>Click sign up and you will be logged in immediately.</li>
            </ol>
            <h3>Logging In</h3>
            <ol>
                <li>Navigate to the "Log in here" page.</li>
                <li>Scroll to the "Login" section.</li>
                <li>Enter your previously set username and password.</li>
                <li>Click log in and you will be logged in immediately.</li>
            </ol>
            <h3>Getting a code</h3>
            <ol>
                <li>On the main page, find the name of the restaurant the code is needed for.</li>
                <li>Click on the restaurant name. If a code was recently submitted, it should appear below the banner.</li>
                <li>If no code was submitted, periodically refresh by clicking the "Update Code" button until a new code is submitted.</li>
                <li>Note that some codes may have expired even if they appear. If so, wait for a new code.</li>
            </ol>
            <h3>Submitting a code</h3>
            <ol>
                <li>On the main page, find the name of the restaurant the code is to be submitted for.</li>
                <li>Click on the restaurant name. Scroll to the bottom and find the "Submit Code" section.</li>
                <li>Enter the four digit code into the submission box and click submit.</li>
                <li>The code should now appear for yourself and all other users.</li>
            </ol>
        </div>
        <div className="motivation">
            <h2>Motivation</h2>
            <p>
                It does not make any sense why you have to enter a code for GrubHub. Isn't the whole
                point of the app to make it so you can order remotely? UVACodes was designed to solve this
                problem with the help of the student body. This was made both to solve this problem and also
                as a fun side-project I worked on over the summer when I had some free time.
            </p>
            <p>
                UVACodes is a "codesharing" website. The idea is that
                students, before ordering a meal, will check the UVA codes website for the most
                up-to-date code. Then, upon entering the code into GrubHub, they will go
                to their desired website and pick up the food. Once there, they will report
                the most recent code and pass on the favor so noone has to arrive early.
                The University of Virginia is well-known for its supportive student body.
                By contributing a code and "passing on" the help, you are contributing to this reputation.
            </p>
        </div>
        <div className="contact-inquires">
            <h2>Contact / Inquires</h2>
            <p>
                For inquires or messages about the website, send a message to <a href="mailto:contactuvacodes.com">contactuvacodes.com</a>.
                Messages could include suggestions, problems, or anything else.
                The GitHub repository may be published soon for future contributions. 
                Send a message if you would like the link beforehand.
            </p>
        </div>
        <div className="disclaimer">
            <h2>Disclaimer</h2>
            <p>
                <strong>NOTICE:</strong> UVACodes.com is not affiliated with the University of Virginia, 
                Chic-Fil-A, GrubHub, or any other listed restaurant. All image rights belong to their
                respective owners.
            </p>
        </div>
        <img src="/favicon.ico" />
        <p>-UVACodes</p>
    </div>
    );
}
