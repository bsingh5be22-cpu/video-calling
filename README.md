
##  Video Calling Software

###  Overview

**Video Calling Software** is a web-based real-time communication platform that allows users to connect via live video, audio, and text chat. It’s built using **Node.js**, **Express**, **Socket.io**, and **WebRTC** for peer-to-peer media streaming.

---

### 🚀 Features

* 🔹 Real-time video and audio calling
* 🔹 Instant peer-to-peer connections using WebRTC
* 🔹 Live chat with Socket.io
* 🔹 Responsive user interface
* 🔹 Easy to host and deploy

---

### 🛠️ Tech Stack

| Category                    | Technology            |
| --------------------------- | --------------------- |
| **Frontend**                | HTML, CSS, JavaScript |
| **Backend**                 | Node.js, Express.js   |
| **Real-Time Communication** | WebRTC, Socket.io     |
| **Version Control**         | Git, GitHub           |

---

### 📂 Project Structure

```
video_calling_soft/
│
├── app/
│   └── index.html
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   └── socket.io.js
│   └── images/
│       └── [your image files]
│
├── server.js
├── package.json
└── package-lock.json
```

---

### ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/bsingh5be22-cpu/video-calling.git
   cd video-calling
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   node server.js
   ```

   or (for auto-restart during development)

   ```bash
   npx nodemon server.js
   ```

4. **Access in browser**

   ```
   http://localhost:3000 may be 4000 or 4001
   ```

---

### 🧠 How It Works

* The server uses **Express** to serve static files.
* **Socket.io** handles signaling and communication between clients.
* **WebRTC** establishes direct peer-to-peer video and audio streams between users.


---

### 🧑‍💻 Author

**Bikramjeet Singh**
📧 [[bsingh5_be22@thapar.edu](mailto:bsingh5_be22@thapar.edu)]


---

### 🪪 License

This project is open-source and available under the **MIT License**.

---
Thanks for reading bro
