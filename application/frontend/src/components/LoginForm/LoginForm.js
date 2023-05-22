//Imports
import "./LoginForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../../context";
import toast, { Toaster } from "react-hot-toast";

//LoginForm Component, used to render the login form for the user to log into the application with
function LoginForm() {

  //import required states/functions from context file
  const { setUser, setAuth, setAccountType } = useGlobalContext();
  let navigate = useNavigate();

  //variables to hold the user's input of username and password
  const initialUserData = {
    username: "",
    password: "",
  };

  //state to hold the initialUserData
  const [userData, setUserData] = useState(initialUserData);

  //event handler to update the userData variables dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((values) => ({ ...values, [name]: value }));
  };


  //event handler to handle the form submission for the user to log into the application
  async function handleSubmit(e) {
    e.preventDefault();
    const { username, password } = userData;

    const loginData = {
      username: username,
      password: password,
    };

    //submit the user's login data to the server to attempt to login
    axios.defaults.withCredentials = true;
    axios
      .post("http://localhost:8080/login", loginData)
      .then((res) => {

        //set session storage variables about the user and their JWT authentication token
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
        
        //set context variables in context file so the rest of the application and files can use the user's data
        setAuth(Boolean(sessionStorage.getItem("authenticated")));
        setAccountType(sessionStorage.getItem("accountType"));
        console.log(sessionStorage.getItem("accountType"));

        //navigate the user to the search page if they are a normal user
        if (sessionStorage.getItem("accountType") === "USER") {
          navigate("/searchPage");
        }

        //navigate the user to the manager page if they are a manager
        if (sessionStorage.getItem("accountType") === "MANAGER") {
          navigate("/manager");
        }
    }).catch(() => {
      toast.error("Incorrect details!");;
    });
  }

  //return function containing JSX markup to display the UI elements
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
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default LoginForm;