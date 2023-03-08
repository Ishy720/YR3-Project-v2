import { useReducer } from 'react'
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css';
import { validateRegistrationDetails } from '../../common/data_validation';
import toast, { Toaster } from 'react-hot-toast';

function RegisterForm() {

    let navigate = useNavigate();

    const formState = { 
        username: "",
        forename: "",
        surname: "",
        password: "",
        passwordReentry: "",
        email: "",
        tncAgreed: false,
        marketingAgreed: false
    };

    function reducer(state, action) {
        switch (action.type) {
            case "update_input":
                return {
                    ...state,
                    [action.key]: action.value
                }
            case "toggleTncAgreed":
                return {
                    ...state,
                    tncAgreed: !state.tncAgreed
                }
            case "toggleMarketingAgreed":
                return {
                    ...state,
                    marketingAgreed: !state.marketingAgreed
                }
            default:
                return state
        }
    };

    const [state, dispatch] = useReducer(reducer, formState);

    function notifyError(message) {
        toast.error(message);
    }

    function notifySuccess(message) {
        toast.success(message);
    }

    //Function responsible for checking input data is valid, sends to backend
    async function handleSubmit(e) {
        e.preventDefault();

        const response = validateRegistrationDetails(state);
        
        if(response.length > 0) {
            //prevent the event from firing to server
            //alert(response);
            for(let i = 0; i < response.length; i++) {
                notifyError(response[i]);
            }

            e.preventDefault();
        }

        else {
            
            let { username, forename, surname, email, password, marketingAgreed } = state;

            const userData = {
                username, 
                forename, 
                surname, 
                email, 
                password, 
                marketingAgreed,
                accountType: "USER"
            };

            const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            }

            const response = await fetch('http://localhost:8080/registerNewUser', options);
            const resMessage = await response.json();
            if(response.status == 200) notifySuccess(resMessage.message);
            if(response.status == 201) notifyError(resMessage.message);
            
        };
        
    };

    return (
        <div id='registerContainer'>

            <div id='registerFormContainer'>

                <h2>Please enter your details:</h2>

                <form onSubmit={handleSubmit}>

                    <label htmlFor='username'>Username:</label> <br />
                    <input type='text' 
                    id='username' 
                    placeholder='jem20gcu'
                    value={state.username} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "username"
                        })
                    }
                    required />
                    <br />

                    <label htmlFor='forename'>Forename:</label> <br />
                    <input type='text' 
                    id='forename' 
                    placeholder='Mohammed' 
                    value={state.forename} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "forename"
                        })
                    }
                    required />
                    <br />

                    <label htmlFor='surname'>Surname:</label> <br />
                    <input type='text' 
                    id='surname' 
                    placeholder='Ali'
                    value={state.surname} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "surname"
                        })
                    } 
                    required />
                    <br />

                    <label htmlFor='email'>Email:</label> <br />
                    <input type='email' 
                    id='email' 
                    placeholder='jem20gcu@uea.ac.uk' 
                    value={state.email} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "email"
                        })
                    }
                    required />
                    <br />

                    <label htmlFor='password'>Password:</label> <br />
                    <input type='password' 
                    id='password'
                    value={state.password} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "password"
                        })
                    } 
                    required /> 
                    <br />

                    <label htmlFor='passwordReenter'>Re-enter password:</label> <br />
                    <input type='password' 
                    id='passwordReenter' 
                    value={state.passwordReentry} 
                    onChange={(e) => 
                        dispatch({
                            type: "update_input",
                            value: e.target.value,
                            key: "passwordReentry"
                        })
                    }
                    required /> 
                    <br />

                    <br />

                    <input 
                    type='checkbox' 
                    id='tncCheck' 
                    value={state.tncAgreed} 
                    onChange={(e) => 
                        dispatch({
                            type: "toggleTncAgreed"
                        })
                    } />
                    <label htmlFor='tncCheck'>By registering, I acknowledge and agree to the terms and conditions of the Ipswich Library.</label><br />

                    <input 
                    type='checkbox' 
                    id='adsCheck' 
                    value={state.marketingAgreed} 
                    onChange={(e) => 
                        dispatch({
                            type: "toggleMarketingAgreed"
                        })
                    } />
                    <label htmlFor='adsCheck'>I would like pereodical updates, newsletters and promotional content sent to my email address.</label><br />
                    
                    <br />
                    <button type='submit' id='registerSubmit'>Submit</button>

                </form>

                <h3>Already have an account? Log in <span className='clickLink' onClick={() => {navigate("/login")}}><u>here</u></span></h3>

            </div>

            <Toaster
            position="bottom-right"
            reverseOrder={false}
            />
        </div>
    );
}

export default RegisterForm;