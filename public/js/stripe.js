import axios from 'axios';
import {showAlert} from './alerts';
const stripe = Stripe('pk_test_51ITjJDLMzNTXHjGD1Tmjm4yIUdkYCQ4LigJQAXAUkIGusxyjiNBUMi6oodmmV9w1qX6LMG9wQiQjBy4Gpt3B71uB00qJkI05u6');

export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        
        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch(err) {
        showAlert('error', err);
    }
};