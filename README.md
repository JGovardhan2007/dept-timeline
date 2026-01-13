# Department Activity Timeline 🎓

A modern, interactive timeline application designed to showcase the achievements, events, and milestones of the **Department of Information Technology** at **Vidya Jyothi Institute Of Technology**.

Built with React, Vite, and Firebase, this application provides a dynamic way to track and display departmental history.

![Department Timeline Banner](public/logo.jpg)

## ✨ Features

- **Interactive Timeline**: A beautiful, responsive vertical timeline displaying events chronologically.
- **Rich Media Support**: Upload multiple images per entry or attach PDFs. Includes a built-in image carousel and error handling.
- **Dynamic Filtering**: Filter events by **Year**, **Category** (Student, Faculty, Event, Collab), or search by text.
- **Admin Dashboard**: Secure (client-side) admin interface to Create, Edit, and Delete timeline entries.
- **Firebase Integration**: Real-time data persistence using Firebase Firestore and robust image handling.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Firebase project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/JGovardhan2007/dept-timeline.git
    cd dept-timeline
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    - Create a `.env.local` file in the root directory.
    - Copy the contents from `.env.example` (if available) or add your Firebase keys:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📸 How to Use

### Viewing the Timeline
- Scroll through the timeline to see events.
- Click on an event card to view **details** and **full-size attachments**.
- Use the filter bar at the top to narrow down results by year or category.

### Adding Entries (Admin)
1.  Click the "Admin Login" button in the navigation bar.
2.  Enter the admin credentials (configured in code).
3.  Click "New Entry" to open the form.
4.  Add a title, description, date, and category.
5.  **Images**: You can paste multiple direct image URLs (e.g., from Imgur) or Google Drive links. The app automatically converts Drive links for display.

## 🤝 Contributing

Contributions are welcome! If you have suggestions or bug fixes, please open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed for the Dept of IT, VJIT.*
