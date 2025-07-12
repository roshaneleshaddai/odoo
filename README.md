
# StackIt - Q&A Platform with Polls

A modern, full-stack Q&A platform built with Next.js, Express.js, and MongoDB. Features include user authentication, question-answer system, real-time polls, rich text editing, and image uploads.

## 🚀 Features

### Core Q&A System
- **User Authentication**: Secure login/register system with JWT tokens
- **Questions & Answers**: Create, edit, and manage questions with rich text
- **Voting System**: Upvote/downvote questions and answers
- **Search & Filter**: Find questions by tags, content, or author
- **Real-time Updates**: Live notifications for new answers and votes

### Polls System
- **Create Polls**: Build polls with multiple options and settings
- **Voting**: Single or multiple vote support with real-time results
- **Expiration**: Set end dates for polls with countdown timers
- **Results**: Visual progress bars and percentage displays
- **Tags & Categories**: Organize polls with tags and search functionality

### Rich Text Editor
- **Quill.js Integration**: Advanced text editing with formatting options
- **Image Upload**: Cloudinary integration for image hosting
- **Emoji Support**: Built-in emoji picker with categorized emojis
- **Real-time Preview**: See formatting changes as you type

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Notifications**: Stay updated with new activity
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Dark Mode Ready**: Optimized for different viewing preferences

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **Quill.js**: Rich text editor
- **Cloudinary**: Image upload and hosting

### Backend
- **Express.js**: Node.js web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Cloudinary**: Image processing and storage

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud)
- **Cloudinary** account (for image uploads)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd odoo
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
MONGO_DB=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start the Development Servers

#### Backend (Terminal 1)
```bash
cd backend
npm start
```
Server will run on `http://localhost:5000`

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Application will run on `http://localhost:3000`

## 📁 Project Structure

```
odoo/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Answer.js
│   │   ├── Notification.js
│   │   ├── Poll.js
│   │   ├── Question.js
│   │   └── User.js
│   ├── routes/
│   │   ├── answers.js
│   │   ├── auth.js
│   │   ├── notifications.js
│   │   ├── polls.js
│   │   ├── questions.js
│   │   └── upload.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── ask/
│   │   ├── login/
│   │   ├── poll/
│   │   ├── polls/
│   │   ├── question/
│   │   ├── register/
│   │   └── globals.css
│   ├── components/
│   │   ├── AnswerCard.jsx
│   │   ├── CreatePoll.jsx
│   │   ├── Layout.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── PollCard.jsx
│   │   ├── QuestionCard.jsx
│   │   └── RichTextEditor.jsx
│   ├── context/
│   │   └── AuthContext.js
│   ├── utils/
│   │   └── api.js
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get single question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `POST /api/questions/:id/answers` - Add answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### Polls
- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create poll
- `GET /api/polls/:id` - Get single poll
- `POST /api/polls/:id/vote` - Vote on poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll

### Uploads
- `POST /api/upload/image` - Upload image to Cloudinary

## 🎯 Usage Guide

### Creating Questions
1. Navigate to the "Ask" page
2. Use the rich text editor to write your question
3. Add relevant tags
4. Submit your question

### Creating Polls
1. Go to the "Polls" section
2. Click "Create Poll"
3. Add your question and options
4. Configure settings (multiple votes, end date, tags)
5. Publish your poll

### Voting on Polls
1. Browse available polls
2. Select your preferred option(s)
3. Click "Vote" to submit
4. View real-time results

### Rich Text Editing
- Use the toolbar for formatting (bold, italic, lists, etc.)
- Click the emoji button to add emojis
- Use the image button to upload images
- All content is automatically saved

## 🔒 Environment Variables

### Backend (.env)
```env
# Database
MONGO_DB=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Deployment

### Backend Deployment
1. Set up your MongoDB database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Update API base URL in `frontend/utils/api.js`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all environment variables are set
- Ensure all dependencies are installed

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure API base URL is correct

**Image uploads not working:**
- Verify Cloudinary credentials
- Check file size limits (5MB max)
- Ensure proper file types (images only)

**Polls not updating:**
- Check database connection
- Verify poll ID in API calls
- Ensure proper authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Coding! 🚀** 
