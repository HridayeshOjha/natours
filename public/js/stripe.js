import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51SHaQqEhGN6DZMWPmNCDnU85kfL6GkUiud8hcxhj5pyGYgzC26aICtUAU96Alwfh4WA1IVFwm6DQ8scNrtWddCZx00xNS2mhN4',
);

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );
    // console.log(session);

    // // 2) Create checkout form + credit card
    window.location.href = session.data.session.url;
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
