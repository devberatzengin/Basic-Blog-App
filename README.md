# MiniSocial 🚀

A lightweight social blogging platform built with FastAPI. Share posts, follow users, like content, and engage with a community.

**Author**: [@devberatzengin](https://github.com/devberatzengin)
**Full Documentation**: In this repo named with documentation.html & documentation.pdf 

## ✨ Features

- **Authentication**: User registration & login with JWT
- **Posts**: Create, read, and delete blog posts
- **Interactions**: Comments, likes, and follows
- **Search**: Find posts and users
- **Security**: Password hashing and protected endpoints

## 🛠️ Tech Stack

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-FBB040?style=for-the-badge&logo=python&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-003B57?style=for-the-badge&logo=python&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

**Key Technologies:**
- **Backend**: FastAPI + Uvicorn
- **Database**: PostgreSQL + SQLAlchemy ORM
- **Migrations**: Alembic
- **Frontend**: HTML/CSS with Jinja2 templates
- **Authentication**: JWT tokens

## 🚀 Quick Start

### Requirements
- Python 3.8+
- PostgreSQL 10+

### Installation

```bash
# 1. Clone & navigate
git clone https://github.com/devberatzengin/Basic-Blog-App.git
cd "Basic Blog App"

# 2. Setup environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Configure database
createdb blog_db

# 4. Create .env file with:
DATABASE_URL=postgresql://username:password@localhost:5432/blog_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 5. Run migrations
cd app
alembic upgrade head

# 6. Start server
uvicorn main:app --reload
```

Visit **http://localhost:8000**

## 📁 Project Structure

```
app/
├── api/
│   └── routers/          # Authentication, posts, users, comments, likes, follows, search
├── core/                 # Config & security utilities
├── database/             # Database setup
├── models/               # SQLAlchemy models (User, Post, Comment, Like, Follow)
├── schemas/              # Pydantic validation schemas
├── services/             # Business logic
├── views/                # HTML templates (login, register, feed, profile, etc)
└── main.py               # Application entry point
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/auth/register` | Create new account | ❌ |
| POST | `/auth/login` | Login & get JWT token | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |

### Posts
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/posts/` | Get all posts (paginated) | ❌ |
| POST | `/posts/` | Create new post | ✅ |
| GET | `/posts/{post_id}` | Get specific post | ❌ |
| DELETE | `/posts/{post_id}` | Delete your post | ✅ |
| GET | `/posts/liked-posts` | Get your liked posts | ✅ |
| GET | `/posts/liked-posts/{user_id}` | Get user's liked posts | ❌ |

### Comments
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/comments/` | Add comment to post | ✅ |
| GET | `/comments/{post_id}` | Get post comments | ❌ |
| DELETE | `/comments/{comment_id}` | Delete your comment | ✅ |

### Likes
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/likes/{post_id}` | Like a post | ✅ |
| DELETE | `/likes/{post_id}` | Unlike a post | ✅ |

### Users
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/users/` | List all users | ❌ |
| GET | `/users/{user_id}` | Get user profile & posts | ❌ |
| PUT | `/users/{user_id}` | Update your profile | ✅ |

### Follow
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| POST | `/follow/{user_id}` | Follow a user | ✅ |
| DELETE | `/follow/{user_id}` | Unfollow a user | ✅ |
| GET | `/follow/followers/{user_id}` | Get user's followers | ❌ |
| GET | `/follow/following/{user_id}` | Get users they follow | ❌ |

### Search
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|----------------|
| GET | `/search/posts?q=keyword` | Search posts by content | ❌ |
| GET | `/search/users?q=username` | Search users by username | ❌ |

**Note:** Endpoints marked with ✅ require a valid JWT token in the `Authorization: Bearer <token>` header

## 📝 Pages

- `/login` - Login page
- `/register` - Register page
- `/feed` - Post feed
- `/profile` - User profile
- `/post/{id}` - Post details

## 🗺️ Roadmap & Upcoming Features

### Planned for Future Releases

- **📸 Image Support** - Upload and attach images to posts
- **🔔 Notifications** - Get notified about likes, comments, and follows
- **💌 Direct Messaging** - Send private messages between users
- **#️⃣ Hashtags** - Tag posts with hashtags for better discoverability
- **⭐ Post Rating** - Rate posts with star ratings
- **📊 Analytics** - View post statistics and engagement metrics
- **🌙 Dark Mode** - Dark theme option for the UI
- **📱 Mobile App** - Native mobile application
- **🔐 Two-Factor Authentication** - Enhanced account security
- **🎨 Themes & Customization** - Customize user profiles and interface

Have an idea? [Open an issue](https://github.com/devberatzengin/Basic-Blog-App/issues) to suggest new features!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## 💡 Need Help?

- **Issues**: Report bugs on [GitHub Issues](https://github.com/devberatzengin/Basic-Blog-App/issues)
- **Documentation**: Check code comments for implementation details
- **Questions**: Open a discussion or issue with your question

---

**Start building now!** Clone the repo and follow the Quick Start guide above.