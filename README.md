# MCCHST Portal

This is the official web portal for the Muslim Community College of Health Sciences and Technology, Funtua. The portal provides online services for students, staff, and administrators, including admissions, registration, invoicing, and more.

## Features

- Student registration and profile management
- Admission notification and downloads
- Course registration and downloads
- Invoice generation and payment
- Admin dashboard for user and finance management
- Responsive design for desktop and mobile
- PDF generation and downloads for various forms

## Project Structure

```
.
├── public/                 # Static files and index.html
├── src/
│   ├── components/         # React components (student-portal, admin, home, etc.)
│   ├── pages/              # Page-level components (e.g., admin/finance)
│   ├── utils/              # Utility functions (e.g., fetch-file.js)
│   ├── index.js            # App entry point
│   └── index.css           # Global styles
├── build/                  # Production build output
├── package.json            # Project dependencies and scripts
├── firebase.json           # Firebase configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-org/mcchst-portal.git
   cd mcchst-portal
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

### Running the App

Start the development server:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

To build the app for production:

```sh
npm run build
```

The build output will be in the `build/` directory.

## Deployment

This project is configured for deployment on Firebase Hosting. See [firebase.json](firebase.json) for details.

## Technologies Used

- React
- Material UI (MUI)
- MDB React UI Kit
- pdf-lib, file-saver (for PDF generation)
- Axios, superagent (for HTTP requests)
- SweetAlert2 (for notifications)
- Firebase Hosting

## Folder Highlights

- [`src/components/student-portal`](src/components/student-portal): Student dashboard, registration, invoices, etc.
- [`src/components/admin`](src/components/admin): Admin dashboard, user management, finance, etc.
- [`src/components/home`](src/components/home): Public-facing home page components.
- [`src/utils`](src/utils): Utility functions (e.g., [`fetchFile`](src/utils/fetch-file.js)).

## License

This project is proprietary and intended for use by MCCHST and its authorized partners.

---

For any issues or contributions, please contact the project maintainers.
