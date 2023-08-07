import React, { useState } from 'react'
import loginImg from "../images/loginImg.jpg"
import "../styles/login.css"
import axios from "axios"
import { useNavigate } from 'react-router-dom';

const strengthLabels = ["weak", "medium", "medium", "strong"];

function RegisterPage() {

    const [email, setEmail] = useState("");
    const [emailError, setEErorr] = useState("Use Atlassian account email");
    
    function isValidEmail(email){
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }

    const validateEmail = event => {
        if(!isValidEmail(event.target.value)){
            setEErorr("Email is not in valid form");
        }else{
            setEErorr("Email is valid!");
        }
        setEmail(event.target.value)
    }

    const [password, setPassword] = useState("");
    const [strength, setStrength] = useState("Upper, lower, digit, symbol");
    const [passErr, setPErr] = useState("Password is empty");

    const getStrength = (password) => {
        let strengthIndicator = -1;
        let upper = false;
        let lower = false;
        let digits = false;
        let specChar = false;

        const uppercaseRegExp = /(?=.*?[A-Z])/;
        const lowercaseRegExp = /(?=.*?[a-z])/;
        const digitsRegExp  = /(?=.*?[0-9])/;
        const specialCharRegExp = /(?=.*?[#?!@$%^&*-])/;

        if(!upper && uppercaseRegExp.test(password)){
            upper = true;
            strengthIndicator++;
        }
        if(!lower && lowercaseRegExp.test(password)){
            lower = true;
            strengthIndicator++;
        }
        if(!digits && digitsRegExp.test(password)){
            digits = true;
            strengthIndicator++;
        }
        if(!specChar && specialCharRegExp.test(password)){
            specChar = true;
            strengthIndicator++;
        }
        setStrength(strengthLabels[strengthIndicator]);
    }

    const validatePassword = event => { 
        getStrength(event.target.value);
        if(event.target.value.length == 8 && strength==="strong"){
            setPErr("Password is valid!")
            setPassword(event.target.value)
        }else{
            setPErr("At least 8 characters")
        }
    }

    const navigate = useNavigate();

    const [domain, setDomain] = useState("");

    const register = (event) => {
        event.preventDefault();
        if(emailError === "Email is valid!" && passErr === "Password is valid!" && domain !== ""){
            axios.post('http://localhost:8000/register', {email: email, password: password, domain: domain})
            .then(res => {
                console.log(res);
                navigate('/login');
        })
            .catch(err => console.log(err));
        }
    }

    return (
        <div className="login-card">
            <img src={loginImg}/>
            <h2>Register</h2>
            <form className="login-form" action="" onSubmit={register}>
                <input
                    className={`control ${emailError}`}
                    type="email"
                    placeholder="Email"
                    onChange={validateEmail}
                    htmlFor = "email"
                />

                <div className="text">{emailError && <>{emailError}</>}</div>

                <input
                name="password"
                className="control"
                type="password"
                placeholder="Password"
                maxLength={8}
                onChange={validatePassword}
                htmlFor = "password"
                />

                <div className={`bars ${strength}`}>
                    <div></div>
                </div>
                <div className="text">{strength && <>{strength} password</>}</div>
                <div className="text">{passErr && <>{passErr}</>}</div>

                <input
                name="domain"
                className="control"
                type="text"
                placeholder="Domain"
                onChange={event => setDomain(event.target.value)}
                htmlFor = "domain"
                />

                <button className="login" type="submit">
                REGISTER
                </button>
            </form>
    </div>
    )
}

export default RegisterPage
