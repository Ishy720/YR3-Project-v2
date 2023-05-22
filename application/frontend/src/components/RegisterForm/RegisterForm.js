//Imports
import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterForm.css";
import { validateRegistrationDetails } from "../../common/data_validation";
import toast, { Toaster } from "react-hot-toast";

//RegisterForm Component, used to render the login form for the user to register with the application
function RegisterForm() {

  let navigate = useNavigate();

  //variables to hold the user's input of username and password and password recheck
  const formState = {
    username: "",
    password: "",
    passwordReentry: ""
  };

  //function to update the formState's variables dynamically
  function reducer(state, action) {
    switch (action.type) {
      case "update_input":
        return {
          ...state,
          [action.key]: action.value,
        };
      default:
        return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, formState);

  function notifyError(message) {
    toast.error(message);
  }

  function notifySuccess(message) {
    toast.success(message);
    //navigate("/login");
  }

  //function responsible for checking input data is valid, sends to backend
  async function handleSubmit(e) {
    e.preventDefault();

    const response = validateRegistrationDetails(state);

    if (response.length > 0) {
      //prevent the form submission event from automatically firing to server
      //alert(response);
      for (let i = 0; i < response.length; i++) {
        notifyError(response[i]);
      }

      e.preventDefault();
    } else {
      let { username, password } =
        state;

      const userData = {
        username,
        password
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      };

      //send the user's account details to the server and await response
      const response = await fetch("http://localhost:8080/register", options);
      const resMessage = await response.json();

      //notify registration operation success or error
      if (response.status == 200) notifySuccess(resMessage.message);
      if (response.status == 400) notifyError(resMessage.message);
    }
  }

  //return function containing JSX markup to display the UI elements
  return (
    <div id="registerContainer">
      <div id="registerFormContainer">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label> <br />
          <input
            type="text"
            id="username"
            placeholder="jem20gcu"
            value={state.username}
            onChange={(e) =>
              dispatch({
                type: "update_input",
                value: e.target.value,
                key: "username",
              })
            }
            required
          />
          <br />
          <label htmlFor="password">Password:</label> <br />
          <input
            type="password"
            id="password"
            value={state.password}
            onChange={(e) =>
              dispatch({
                type: "update_input",
                value: e.target.value,
                key: "password",
              })
            }
            required
          />
          <br />
          <label htmlFor="passwordReenter">Re-enter password:</label> <br />
          <input
            type="password"
            id="passwordReenter"
            value={state.passwordReentry}
            onChange={(e) =>
              dispatch({
                type: "update_input",
                value: e.target.value,
                key: "passwordReentry",
              })
            }
            required
          />
          <br />
          <button type="submit" id="registerSubmit">
            Submit
          </button>
        </form>

        <h4>
          Already have an account?
          <span
            className="clickLink"
            onClick={() => {
              navigate("/login");
            }}
          >
            Log in
          </span>
        </h4>
      </div>

      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default RegisterForm;
