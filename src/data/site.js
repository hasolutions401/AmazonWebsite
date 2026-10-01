// Store-wide details. Update here and every page picks it up.
export const SITE = {
  name: 'Amazon Bazar',
  url: 'https://amazonbazarct.com',
  tagline: 'Premium Smoke Shop',
  phone: '(860) 848-2345',
  phoneHref: 'tel:+18608482345',
  phoneIntl: '+1-860-848-2345',
  // Number that receives texted pickup orders. Must be able to receive SMS
  // (a mobile or text-enabled business line). Set to null to hide "Text order".
  textNumber: '+18608482345',
  address: {
    street: '1030 Norwich-New London Turnpike',
    city: 'Uncasville',
    region: 'CT',
    zip: '06382',
  },
  geo: { lat: 41.453564, lng: -72.106907 },
  hours: { label: 'Open daily · 9 AM – 10 PM', opens: '09:00', closes: '22:00' },
  rating: { value: '5.0', count: '200+' },
  mapsUrl:
    'https://www.google.com/maps/place/Amazon+Bazar+%E2%80%93+Tobacco,+Vapes+%26+ATM/@41.453564,-72.1094873,774m/data=!3m2!1e3!4b1!4m6!3m5!1s0x89e6733841d6f09b:0xb75a2c68444517a5!8m2!3d41.453564!4d-72.106907!16s%2Fg%2F11vy8j8bkw',
  reviewsUrl:
    'https://www.google.com/maps/place/Amazon+Bazar+%E2%80%93+Tobacco,+Vapes+%26+ATM/@41.4535742,-72.1065995,17z/data=!4m8!3m7!1s0x89e6733841d6f09b:0xb75a2c68444517a5!8m2!3d41.453564!4d-72.106907!9m1!1b1!16s%2Fg%2F11vy8j8bkw',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Amazon+Bazar,+1030+Norwich-New+London+Turnpike,+Uncasville,+CT+06382&output=embed',
  logo: '/images/logo.webp',
  ogImage: '/images/heroes/home.webp',
};

export const fullAddress = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.zip}`;

export const NICOTINE_WARNING = 'WARNING: This product contains nicotine. Nicotine is an addictive chemical.';
