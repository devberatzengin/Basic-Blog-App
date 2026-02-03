import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from api.routers import auth, user, post, comment, like, follow, search

app = FastAPI(title="MiniSocial")

# folder paths
current_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(current_dir, "views", "static")
templates_path = os.path.join(current_dir, "views")

app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=templates_path)

# api routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(post.router)
app.include_router(comment.router)
app.include_router(like.router)
app.include_router(follow.router)
app.include_router(search.router)


@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/feed")
def feed_page(request: Request):
    return templates.TemplateResponse("feed.html", {"request": request})

@app.get("/profile")
def profile_page(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})

@app.get("/post/{post_id}", response_class=HTMLResponse)
def post_detail_page(request: Request, post_id: int):
    return templates.TemplateResponse("post_detail.html", {"request": request, "post_id": post_id})