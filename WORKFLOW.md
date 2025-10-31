# Medical App Workflow

## User-Friendly Workflow Overview

This section explains the typical steps a user will follow in the medical-app. 

1. **Login**
  - Open the app and enter your username and password.
  - If your credentials are correct, you will be logged in successfully.

2. **Dashboard**
  - After logging in, you will see the dashboard.
  - The dashboard gives you an overview of important information and quick access to main features.

3. **User Management**
  - You can view, add, edit, or deactivate users from the User Management section.
  - Use the search bar or filters to find specific users.

4. **Patient Management**
  - Access patient details, add new patients, or update existing patient information.
  - View patients in a grid or list format.

5. **Triage Management**
  - Review patient triage status and details.
  - Assign or update triage levels as needed.

6. **Chatbot Questionnaire**
  - Interact with the chatbot to answer medical questions or assist with patient triage.

7. **Settings**
  - Change your password or update personal information in the Settings section.

8. **Logout**
  - When finished, log out to keep your account secure.

---

**Note:** The app is designed to be simple and user-friendly. If you need help, look for help icons or contact support.

This workflow outlines the recommended development, build, and deployment steps for your React + Vite medical-app project.

## 1. Install Dependencies

```shell
npm install
```

## 2. Development

Start the development server:

```shell
npm run dev
```

- Access the app at `http://localhost:5173` (default Vite port).
- Edit files in `src/` for live reload.

## 3. Linting

Check code quality using ESLint:

```shell
npm run lint
```

## 4. Build

Create a production build:

```shell
npm run build
```

- Output is in the `dist/` folder.

## 5. Preview Production Build

Test the production build locally:

```shell
npm run preview
```

## 6. Folder Structure

- `src/` – Source code
  - `components/` – Reusable UI components
  - `pages/` – Page-level components
  - `services/` – API and HTTP logic
  - `store/` – Redux store and slices
  - `utils/` – Utility functions/constants
  - `data/` – Mock data and static resources
- `public/` – Static assets
- `dist/` – Production build output

## 7. Version Control

- Use Git for source control.
- Commit changes with clear messages.
- Push to remote repository regularly.

## 8. Deployment

- Deploy the contents of the `dist/` folder to your preferred static hosting (e.g., Vercel, Netlify, GitHub Pages).

## 9. Environment Variables

- Store sensitive keys in `.env` files (not committed to Git).
- Access variables via `import.meta.env` in Vite.

## 10. Testing (Optional)

- Add unit/integration tests for critical components and services.
- Use tools like Jest or React Testing Library.

---
