import axios from 'axios';
import {showAlert} from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name: name, 
                email: email, 
                password: password, 
                passwordConfirm: passwordConfirm
            }
        });
        console.log(res);
        if (res.data.status === 'success') {
            showAlert('success', 'Signed up successfuly');
            window.setTimeout(() => {
                location.assign('/me')
            }, 1500);
        }
    } catch(err) {
        console.log(err.response);
        document.getElementById('signup-btn').textContent = 'Register';
        const errorMessage = err.response.data.message.toLowerCase();
        if (errorMessage.startsWith('user validation failed') || errorMessage.startsWith('invalid input data')) {
            showAlert('error', 'Passwords are not the same. Please try again.');
        } else {
            showAlert('error', 'Error During Registration');
        }
    }
};