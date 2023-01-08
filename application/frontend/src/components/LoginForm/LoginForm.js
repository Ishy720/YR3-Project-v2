import "./LoginForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../../context";

function LoginForm(props) {
  const { setAuth } = useGlobalContext();

  let navigate = useNavigate();

  const initialUserData = {
    username: "",
    password: "",
  };

  const [userData, setUserData] = useState(initialUserData);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((values) => ({ ...values, [name]: value }));
  };

  axios.defaults.withCredentials = true;

  async function handleSubmit(e) {
    e.preventDefault();
    //alert(userData.username + userData.password);
    const { username, password } = userData;

    const loginData = {
      username: username,
      password: password,
    };

    axios
      .post("http://localhost:8080/login", loginData)
      .then((res) => {
        sessionStorage.setItem("authenticated", true);
        //note to self set more things here after this logic is fixed
      })
      .then(() => {
        console.log("submit");
        setAuth(Boolean(sessionStorage.getItem("authenticated")));
        navigate("/discover");
      });
  }

  function getSessionDetails() {
    axios
      .get("http://localhost:8080/session")
      .then((res) => console.log(res.data));
  }

  function logout() {
    axios
      .get("http://localhost:8080/logout")
      .then((res) => sessionStorage.setItem("authenticated", false));
    //delete details from local storage
  }

  return (
    <div id="loginContainer">
      <div id="loginFormContainer">
        <h2>Log in below:</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label> <br />
          <input
            type="text"
            id="username"
            placeholder="jem20gcu"
            name="username"
            value={userData.username || ""}
            onChange={handleInputChange}
            required
          />
          <br />
          <label htmlFor="password">Password:</label> <br />
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password || ""}
            onChange={handleInputChange}
            required
          />
          <br />
          <br />
          <button type="submit" id="loginSubmit">
            Submit
          </button>
        </form>

        <h3>
          Don't have an account? Sign up{" "}
          <span
            className="clickLink"
            onClick={() => {
              navigate("/register");
            }}
          >
            <u>here</u>
          </span>
        </h3>
      </div>

      <button onClick={getSessionDetails}>Print session info</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default LoginForm;
