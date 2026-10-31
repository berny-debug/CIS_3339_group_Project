# Data Platform Frontend

This project uses [VueJS 3](https://vuejs.org/) with [Vite](https://vitejs.dev/) and [TailwindCSS](https://tailwindcss.com/).
For form validation [Vuelidate](https://vuelidate-next.netlify.app/) is used.

State management is done via [Pinia](https://pinia.vuejs.org/).

## Project setup

    npm install

### Before startup
You need to either have a local backend running and or use a cloud deployed backend.

Setup a .env file with following variables, e.g.:

    VITE_ROOT_API=http://localhost:3000

VITE_ROOT_API is the URL for the backend API, either on localhost or in the cloud.
### Compiles and hot-reloads for development

    npm run dev

## Production Build and Deployment

### Configure the Backend API

The frontend uses the `VITE_ROOT_API` environment variable to connect to the backend API.

1. Copy `.env.example` to `.env` inside the `frontend` directory.
2. For local development, set `VITE_ROOT_API=http://localhost:3000`.
3. For production, replace this value with the deployed backend API URL.
4. Set the production value before running the build. Vite embeds this value in the generated frontend files.

Do not commit `.env` files containing private configuration. The `.env.example` file provides a safe configuration template. Note that Vite variables beginning with `VITE_` are public in the browser and must not contain secrets.

### Build the Frontend

From the `frontend` directory, run:

```bash
npm install
npm run build
```

The build creates a `dist` directory containing the production-ready frontend files.

### Preview the Production Build

```bash
npx vite preview
```

Open the local URL displayed in the terminal (usually `http://localhost:4173`). This is for local testing, not production hosting.

### Deploy the Frontend

Deploy the contents of `frontend/dist` to a static web host. Configure the host to serve `index.html` for frontend routes that do not match an existing static file (SPA fallback).

For example, refreshing `/login` or opening `/clientdetails/123` directly must return `index.html` so Vue Router can handle the route. The fallback should not replace real static assests. or backend API responses.

The exact rewrite or fallback rule depends on the hosting provider and must be configured on that provider.

### Deployment Verification

1. Confirm `npm run build` succeeds.
2. Confirm the frontend loads in the production preview.
3. Open `/login` directly and refresh the page to check routing.
4. Verify that `VITE_ROOT_API` points to a reachable backend and that the backend allows requests from the frontend origin (CORS).
5. After deployment, repeat the direct-route refresh test on the deployed website.