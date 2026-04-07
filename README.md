# 💬 QuickChat

QuickChat is a real-time chat application that allows users to communicate instantly with a clean and responsive interface. It is built using modern web technologies and demonstrates full-stack development skills.

---

## 🚀 Features

- 🔐 User Authentication (Register & Login)
- 💬 Real-time Messaging
- 🟢 Online/Offline Status (optional if implemented)
- 📱 Responsive UI
- ⚡ Fast and smooth performance

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- HTML, CSS, JavaScript

**Backend:**
- Node.js
- Express.js

**Database:**
- MongoDB

---

chat/
├── package.json             
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── index.js             
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js
│   │   ├── messages.js
│   │   └── upload.js
│   ├── middleware/auth.js
│   ├── socket/socketHandler.js
│   └── uploads/
└── client/                  
    ├── package.json
    ├── vite.config.js       
    ├── index.html            
    └── src/
        ├── main.jsx         
        ├── App.jsx
        ├── styles/globals.css
        ├── utils/api.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        ├── hooks/
        │   ├── useRooms.js
        │   └── useMessages.js
        └── components/
            ├── Auth/AuthPage.jsx
            └── Chat/
                ├── Sidebar.jsx
                ├── ChatWindow.jsx
                ├── MessageBubble.jsx
                ├── MessageInput.jsx
                ├── NewRoomModal.jsx
                └── RoomInfo.jsx
## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Teja-1123/QuickChat.git
cd QuickChat

### 2️⃣ Setup Backend
cd server
npm install
npm run dev
### 3️⃣ Setup Frontend
cd client
npm install
npm start

###🌐 Environment Variables

Create a .env file in the server folder and add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


###🌐 Output

### Login 
 <img width="1914" height="925" alt="image" src="https://github.com/user-attachments/assets/0bfe084d-37dd-42b7-9c25-61202c2ef70a" />

### Register
<img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/31ac2c11-526c-40f5-b271-a00664fbfdc0" />

###Home page
<img width="1912" height="844" alt="image" src="https://github.com/user-attachments/assets/f71c7f95-4921-4122-8704-1d399360ea97" />
### creating  group
<img width="1917" height="869" alt="image" src="https://github.com/user-attachments/assets/5e79a0e3-3504-4c22-b8a3-c2a78636aa4f" />
<img width="1919" height="875" alt="image" src="https://github.com/user-attachments/assets/adc690a0-96e8-4470-945b-7f73c219e9ed" />
<img width="1919" height="850" alt="image" src="https://github.com/user-attachments/assets/906083d2-cc6c-4f31-b1c0-abdc71af5de0" />
### Real-time communication, WebSockets
<img width="1913" height="862" alt="image" src="https://github.com/user-attachments/assets/5016ff46-118a-4179-b824-28b1034f4208" />
### direct chat
<img width="1917" height="925" alt="image" src="https://github.com/user-attachments/assets/9631fc3d-336b-4392-a217-cd949a694de4" />

### file sharing
<img width="1918" height="906" alt="image" src="https://github.com/user-attachments/assets/cd3094b2-b042-48d0-8254-0cba55781e37" />











