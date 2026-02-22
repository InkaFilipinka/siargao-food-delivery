# TravelGo — Design System

Quick UI/UX guide for the **Customer App** and **Partner App**.

---

## Brand

| Element | Value |
|---------|-------|
| **Name** | TravelGo |
| **Tagline** | Order. Travel. Go. |
| **Voice** | Friendly, reliable, tropical-vibes |

---

## Color Palette

```css
/* Primary - Teal (trust, travel, tropical water) */
--tg-primary: #0D9488;      /* Main actions, headers */
--tg-primary-hover: #0F766E;
--tg-primary-light: #CCFBF1;

/* Secondary - Coral (energy, Siargao sunsets) */
--tg-secondary: #F97316;    /* Highlights, CTAs */
--tg-secondary-hover: #EA580C;
--tg-secondary-light: #FFEDD5;

/* Neutrals */
--tg-bg: #FAFAF9;           /* Page background */
--tg-surface: #FFFFFF;      /* Cards, modals */
--tg-surface-dark: #1C1917;  /* Dark mode surface */
--tg-text: #1C1917;
--tg-text-muted: #78716C;
--tg-border: #E7E5E4;

/* Status */
--tg-success: #22C55E;
--tg-warning: #F59E0B;
--tg-error: #EF4444;
```

---

## Typography

| Use | Font | Size | Weight |
|-----|------|------|--------|
| **H1** (Screen titles) | System / Inter | 28px | Bold (700) |
| **H2** (Section headers) | System / Inter | 22px | Semibold (600) |
| **Body** | System / Inter | 16px | Regular (400) |
| **Body small** | System / Inter | 14px | Regular |
| **Caption** | System / Inter | 12px | Regular |
| **Button** | System / Inter | 16px | Semibold (600) |

---

## Spacing

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `xxl` | 48px |

---

## Components (Fast Reference)

### Buttons
- **Primary**: Teal background, white text, 12px radius
- **Secondary**: Light teal or outline, teal text
- **Destructive**: Red for delete/cancel

### Cards
- White/dark surface, 16px padding, 12px radius, subtle shadow

### Inputs
- 16px height min (touch-friendly), 12px radius, 1px border

### App Bar
- Fixed top, primary color or white, back + title + optional action

---

## App Screens (Quick Structure)

### Customer App — Key Screens
1. **Home** — Categories, featured venues, search
2. **Restaurant/Menu** — Items, add to cart
3. **Cart** — Review, address, checkout
4. **Track** — Order status, driver location
5. **Account** — Orders, favorites, profile

### Partner App — Key Screens
1. **Home** — Role selector or default (Driver / Restaurant / etc.)
2. **Driver**: Available orders → Accept → My deliveries → Complete
3. **Restaurant**: Incoming orders → Accept → Prep status
4. **Earnings** — Today, all time, payouts
5. **Profile** — Settings, logout

---

## Logo Usage

- **App icon**: Icon only (pin + arrow)
- **Splash / Header**: Wordmark "TravelGo"
- **Min height**: 32px for legibility

---

## Implementation Notes

- Use **React Native** or **Expo** for both apps (shared components)
- Reuse API from web app (`/api/*`)
- Same auth: JWT tokens (customer, restaurant, driver)
- Dark mode: support `prefers-color-scheme`
