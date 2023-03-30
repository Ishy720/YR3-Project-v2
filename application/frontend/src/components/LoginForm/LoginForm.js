import "./LoginForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../../context";

function LoginForm() {
  const { setUser, setAuth, setAccountType } = useGlobalContext();

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
    const { username, password } = userData;

    const loginData = {
      username: username,
      password: password,
    };

    axios
      .post("http://localhost:8080/login", loginData)
      .then((res) => {
        console.log(res.data);
        sessionStorage.setItem("authenticated", true);
        sessionStorage.setItem("accountType", res.data.user.accountType);
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            user: res.data.user.username,
            id: res.data.user.id,
            accountType: res.data.user.accountType,
          })
        );
        sessionStorage.setItem("token", res.data.token);
        setUser({
          user: res.data.user.username,
          id: res.data.user.id,
          accountType: res.data.user.accountType,
        });
      })
      .then(() => {
        setAuth(Boolean(sessionStorage.getItem("authenticated")));
        setAccountType(sessionStorage.getItem("accountType"));
        console.log(sessionStorage.getItem("accountType"));
        if (sessionStorage.getItem("accountType") === "USER") {
          navigate("/discover");
        }
        if (sessionStorage.getItem("accountType") === "MANAGER") {
          navigate("/manager");
        }
        if (sessionStorage.getItem("accountType") === "ADMIN") {
          navigate("/admin");
        }
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
        <h2>Login </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label> <br />
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
          <label htmlFor="password">Password</label> <br />
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

        <h4>
          Don't have an account? 
          <span
            className="clickLink"
            onClick={() => {
              navigate("/register");
            }}
          >
            Sign up
          </span>
        </h4>
      </div>
    </div>
  );
}

export default LoginForm;
{
  /* <button onClick={getSessionDetails}>Print session info</button>
<button onClick={logout}>Logout</button> */
}
