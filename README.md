# Atelier Nova - Hair Salon Website

Static, responsive landing page for a women's hair salon with Polish, English, and Ukrainian language support. Built with HTML, CSS, and vanilla JavaScript, with no frameworks or build tools.

## What's Included

- **Header & Navigation**: Sticky top bar with separate pill navigation buttons, social links, Booksy button, and a collapsible mobile menu.
- **Hero Section**: Main headline, booking/contact actions, opening hours card, and subtle desktop mouse parallax.
- **About Section**: Two-column layout with photo and salon description.
- **Services Carousel**: 8 service cards with drag/touch swipe support, arrow navigation, and pagination dots (3 cards on desktop, 2 on tablet, 1 on mobile).
- **Gallery**: Asymmetric responsive photo grid.
- **Contact & Map**: Contact card with address, phone, email, Booksy link, and an embedded Google Maps view.
- **Multilingual Support (PL / EN / UA)**: Client-side translations switched from the footer, supporting `?lang=pl|en|ua` URL parameters and `localStorage` persistence.

## Tech Stack

- HTML5
- CSS3 (custom properties, Flexbox, Grid, `prefers-reduced-motion` support)
- Vanilla JavaScript (ES6+, `IntersectionObserver`)
- Google Fonts (Inter, Cormorant Garamond)

## Project Structure

```text
HairSalon/
├── index.html   - Page markup and default Polish content
├── styles.css   - Theme variables, layout, animations, and responsive breakpoints
├── script.js    - Mobile menu, scroll reveal, services carousel, and translations
└── README.md    - Project documentation
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/your-username/hair-salon.git
cd hair-salon
```

Open `index.html` directly in your browser, or run a local static server, for example:

```bash
npx serve .
```

## Customization

All brand details, contact information, and links are sample placeholders:

- **Brand, text, and translations**: Edit `index.html` and the `translations` object in `script.js`.
- **Contact info, links, and map**: Replace the address, `tel:`, `mailto:`, Booksy/social URLs, and the Google Maps `iframe` in `index.html`.
- **Color palette**: Update the CSS variables in `:root` at the top of `styles.css`.
- **Images**: Replace the external Unsplash/Pexels URLs in `index.html` and `styles.css` with your own assets.

## License

MIT License
