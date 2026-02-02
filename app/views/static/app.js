/* MiniSocial Premium Core Engine v12.0
    The "Central Nervous System" for Backend King
*/
window.onerror = function(msg, url, linenumber) {
    alert('Hata yakalandı kanka: ' + msg + '\nSatır: ' + linenumber);
    return true;
};
// --- 1. GLOBAL STATE & CONFIG ---
const API_BASE = ""; 
const state = {
    token: localStorage.getItem('token'),
    currentUser: null
};



// --- 2. INITIALIZATION (SAYFA YÜKLENDİĞİNDE) ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 MiniSocial Engine Started...");
    
    // 1. Auth durumuna göre navbar'ı güncelle
    updateNavbarUI();

    const path = window.location.pathname;
    
    // 2. Sayfa yoluna göre router mantığı
    if (path === '/feed' || path === '/') {
        await loadFeedData();
        await loadSidebarProfile();
    } 
    else if (path === '/profile') {
        // Profil sayfasındaysak hem veriyi yükle hem de sekmeleri (Tabs) hazırla
        await loadFullProfile(); 
        setupProfileTabs(); // Hayati olan yer tam burası!
    } 
    else if (path.startsWith('/post/')) {
        const postId = path.split('/').pop();
        await loadPostDetail(postId);
    }

    // 3. Giriş/Kayıt formlarını dinlemeye başla
    setupFormListeners();
});

// --- 3. UI UPDATERS (GÖRSEL GÜNCELLEMELER) ---
function updateNavbarUI() {
    const authZone = document.getElementById('authZone');
    if (!authZone) return;

    if (state.token) {
        authZone.innerHTML = `
            <a href="/profile" class="nav-item">Profilim</a>
            <button onclick="handleLogout()" class="btn btn-outline" style="margin-left:15px; padding: 8px 16px;">Çıkış Yap</button>
        `;
    }
}

// --- 4. DATA FETCHERS (VERİ ÇEKİCİLER) ---

// Akışı (Feed) Yükle
async function loadFeedData() {
    const list = document.getElementById('postsList');
    if (!list) return;

    try {
        const res = await fetch(`${API_BASE}/posts/`);
        const posts = await res.json();

        if (posts.length === 0) {
            list.innerHTML = `<div class="card"><p style="text-align:center; color:var(--gray-500);">Henüz kimse bir şey paylaşmamış kanka. İlk sen ol!</p></div>`;
            return;
        }


        list.innerHTML = posts.map(post => `
            <article class="card post-item hover-scale fade-in">
                <div class="post-header">
                    <div class="user-info">
                        <div class="avatar"></div>
                        <div>
                            <h4 style="cursor:pointer" onclick="window.location.href='/profile?id=${post.author.id}'">
                                @${post.author.first_name}
                            </h4>
                            <p style="font-size: 0.8rem; color: var(--gray-500);">
                                ${new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span class="badge badge-king">GELİŞTİRİCİ</span>
                </div>
                <div class="post-content" onclick="window.location.href='/post/${post.id}'" style="cursor:pointer">
                    <h3 class="post-title">${post.header || 'Başlıksız Post'}</h3>
                    <p class="post-body">${post.description || 'İçerik bulunamadı...'}</p>
                </div>
                <div class="post-actions">
                    <div class="action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        <span>${post.like_count} Beğeni</span>
                    </div>
                    <div class="action-btn" onclick="window.location.href='/post/${post.id}'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span>Yorumlar</span>
                    </div>
                </div>
            </article>
        `).join('');

    } catch (err) {
        list.innerHTML = `<p style="color:var(--danger)">Veriler çekilirken bir hata oluştu kanka.</p>`;
    }
}

// --- 5. AUTH LOGIC (GİRİŞ/KAYIT) ---
function setupFormListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                window.location.href = '/feed';
            } else {
                alert("Giriş başarısız kanka, e-postayı kontrol et!");
            }
        });
    }

    // setupFormListeners fonksiyonun içine ekle:
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('regFirstName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            try {
                const res = await fetch('/auth/register', { // Endpoint'in neredeyse oraya yönlendir
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        first_name: firstName, 
                        email: email, 
                        password: password 
                    })
                });

                if (res.ok) {
                    alert("Kayıt başarılı kanka! Şimdi giriş yapabilirsin.");
                    window.location.href = '/login'; // Giriş sayfasına fırlat
                } else {
                    const err = await res.json();
                    alert("Hata: " + err.detail);
                }
            } catch (error) {
                console.error("Kayıt hatası:", error);
            }
        });
    }
}

async function createPost() {
    const headerInput = document.getElementById('postHeader');
    const contentInput = document.getElementById('postInput');
    
    const header = headerInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!header || !content) {
        return alert("Kanka hem başlık hem de içerik girmen lazım. Dükkan kuralları! 😅");
    }

    try {
        const res = await fetch('/posts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({
                header: header,
                description: content
            })
        });

        if (res.ok) {
            // Alanları temizle
            headerInput.value = '';
            contentInput.value = '';
            
            showToast("Yeni postun yayında! 🚀");
            
            // Verileri tazele
            await loadFeedData(); 
            await loadSidebarProfile();
        } else {
            alert("Paylaşırken bir aksilik çıktı kanka.");
        }
    } catch (err) {
        console.error("Post hatası:", err);
    }
}
// --- 7. UTILS ---
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

function showToast(message) {
    console.log("Toast:", message);
    // İleride buraya CSS'deki .toast animasyonunu bağlayabilirsin
}


async function loadPostDetail(postId) {
    const titleEl = document.getElementById('detailTitle');
    const bodyEl = document.getElementById('detailBody');
    const authorEl = document.getElementById('detailAuthor');
    const dateEl = document.getElementById('detailDate');
    const commentsList = document.getElementById('commentsList');
    const commentCountDisplay = document.getElementById('commentCountDisplay');
    const likeCountDisplay = document.getElementById('likeCountDisplay');
    const likeIcon = document.getElementById('likeIcon');
    const likePath = likeIcon ? likeIcon.querySelector('path') : null;
    
    // Kendi ID'mizi alıyoruz
    const myId = localStorage.getItem('myId');

    try {
        const postRes = await fetch(`/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        if (!postRes.ok) throw new Error("Post bulunamadı!");
        const post = await postRes.json();
        
        // --- 🛡️ SİLME BUTONU KONTROLÜ ---
        const headerDiv = document.querySelector('.post-header');
        // Eğer post benimse ve buton henüz eklenmemişse ekle
        if (post.author.id == myId && headerDiv) {
            // Varsa eskiyi temizle (tekrar yüklemelerde çiftlemesin)
            const oldBtn = document.getElementById('detailDeleteBtn');
            if (oldBtn) oldBtn.remove();

            const delBtn = document.createElement('button');
            delBtn.id = 'detailDeleteBtn';
            delBtn.className = 'delete-btn';
            delBtn.style.marginLeft = 'auto'; // Sağ tarafa it
            delBtn.style.marginRight = '10px';
            delBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
            `;
            delBtn.onclick = () => handleDeleteFromDetail(post.id);
            
            // Badge'in (Thread yazısı) hemen önüne yerleştir
            const badge = headerDiv.querySelector('.badge');
            headerDiv.insertBefore(delBtn, badge);
        }

        // Vitrini doldur
        if (titleEl) titleEl.innerText = post.title || post.header;
        if (bodyEl) bodyEl.innerText = post.content || post.description;
        
        if (dateEl && post.created_at) {
            dateEl.innerText = timeAgo(post.created_at);
            dateEl.title = new Date(post.created_at).toLocaleString('tr-TR');
        }

        if (authorEl && post.author) {
            authorEl.innerHTML = `
                <span onclick="window.location.href='/profile?id=${post.author.id}'" 
                    style="cursor:pointer; color:var(--accent-bright); text-decoration: underline;">
                    @${post.author.first_name}
                </span>
            `;
        }
        
        if (likeCountDisplay) likeCountDisplay.innerText = `${post.like_count || 0} Beğeni`;

        if (likeIcon && likePath) {
            if (post.is_liked) {
                likeIcon.setAttribute('fill', '#ff4757');
                likeIcon.style.color = '#ff4757';
                likePath.setAttribute('fill', '#ff4757');
            } else {
                likeIcon.setAttribute('fill', 'none');
                likeIcon.style.color = 'currentColor';
                likePath.setAttribute('fill', 'none');
            }
        }

        const commRes = await fetch(`/comments/post/${postId}`);
        const comments = await commRes.json();
        if (commentCountDisplay) commentCountDisplay.innerText = `${comments.length} Yorum`;

        if (commentsList) {
            // 🚨 DÜZELTME 1: Div içine id ekledik (comment-5 gibi) ve comment-item sınıfını koyduk
            commentsList.innerHTML = comments.map(c => `
                <div id="comment-${c.id}" class="card fade-in comment-item" style="margin-bottom: 15px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong>@${c.user ? c.user.first_name : "Gezgin"}</strong>
                        <small>${timeAgo(c.created_at)}</small> 
                    </div>
                    <p>${c.description || c.content}</p>
                </div>
            `).join('') || '<p style="text-align:center;">Henüz yorum yok.</p>';

            // 🚀 PARLATMA MANTIĞI
            if (window.location.hash) {
                const targetId = window.location.hash.substring(1); // 'comment-5' değerini alır
                
                setTimeout(() => {
                    const targetEl = document.getElementById(targetId);
                    if (targetEl) {
                        // 1. Yumuşak geçişle odakla
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // 2. Parlama efektini tetikle
                        targetEl.classList.add('highlight-now');
                        
                        // 3. 3 saniye sonra efekti kaldır (isteğe bağlı)
                        setTimeout(() => targetEl.classList.remove('highlight-now'), 3000);
                    }
                }, 400); // DOM'un render edilmesi için biraz daha güvenli bir süre
            }
        }

    } catch (err) {
        console.error("Yükleme hatası:", err);
    }
}

// Silme işlemi bittikten sonra Feed'e fırlatan yardımcı fonksiyon
async function handleDeleteFromDetail(postId) {
    if (!confirm("Kanka bu postu kalıcı olarak siliyoruz, emin misin?")) return;

    try {
        const res = await fetch(`/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        if (res.ok) {
            showToast("Post imha edildi! 🚀");
            window.location.href = '/feed'; // Sayfa artık yok, akışa dön
        }
    } catch (err) {
        console.error("Silme hatası:", err);
    }
}
// 2. Yeni Yorum Gönderme (Farklı Maille Giriş Yapsan Bile Token'dan Tanır)
async function sendComment() {
    const input = document.getElementById('commentInput');
    const postId = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Kanka önce bir giriş yap, kim olduğun belli olsun!");
        return;
    }

    if (!input.value.trim()) return alert("Boş yorum mu olur?");

    const commentData = {
        post_id: parseInt(postId),
        description: input.value // Backend'deki CommentCreate description bekliyor
    };

    try {
        const res = await fetch('/comments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ÖNEMLİ: Bearer boşluğu ve Token burada birleşiyor
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(commentData)
        });

        if (res.status === 401) {
            alert("Oturumun düşmüş kanka, tekrar login olman lazım.");
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        if (res.ok) {
            input.value = '';
            showToast("Yorum uçuruldu! 🚀");
            await loadPostDetail(postId); // Listeyi hemen tazele
        }
    } catch (err) {
        console.error("Yorum hatası:", err);
    }
}


async function toggleLike(postId) {
    if (!state.token) return alert("Kanka beğenmek için giriş yapmalısın!");

    try {
        const res = await fetch('/likes/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ post_id: parseInt(postId) })
        });

        if (res.ok) {
            // Beğeni sayısını ekranda anında güncellemek için sayfayı tazele veya listeyi çek
            if (window.location.pathname.startsWith('/post/')) {
                await loadPostDetail(postId);
            } else {
                await loadFeedData();
            }
        }
    } catch (err) {
        console.error("Like hatası:", err);
    }
}


async function handleLikeClick() {
    const postId = window.location.pathname.split('/').pop();
    const likeIcon = document.getElementById('likeIcon');
    
    // ANAHTARI TAM BU ANDA LOCALSTORAGE'DAN ÇEKELİM (EN GÜVENLİSİ)
    const currentToken = localStorage.getItem('token');

    if (!currentToken) {
        alert("Beğenmek için giriş yapmalısın kanka!");
        window.location.href = '/login';
        return;
    }

    try {
        const res = await fetch('/likes/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}` // Taze taze gönderiyoruz
            },
            body: JSON.stringify({ post_id: parseInt(postId) })
        });

        if (res.ok) {
            const data = await res.json();
            
            // Seçiciyi hem SVG hem de içindeki PATH için yapıyoruz
            const likeIcon = document.getElementById('likeIcon');
            const likePath = likeIcon.querySelector('path'); // Kalbin bizzat çizimi

            if (data.message.includes("unliked")) {
                // BEĞENİ GERİ ÇEKİLDİ
                likeIcon.setAttribute('fill', 'none');
                likeIcon.style.color = 'currentColor';
                if(likePath) likePath.setAttribute('fill', 'none'); 
            } else {
                // BEĞENİLDİ
                const heartColor = '#ff4757';
                likeIcon.setAttribute('fill', heartColor);
                likeIcon.style.color = heartColor;
                if(likePath) likePath.setAttribute('fill', heartColor);
            }

            await loadPostDetail(postId);
        }

    } catch (err) {
        console.error("Like hatası:", err);
    }
}



async function loadSidebarProfile() {
    const nameEl = document.getElementById('sidebarName');
    const postCountEl = document.getElementById('sidebarPostCount');
    const followerCountEl = document.getElementById('sidebarFollowerCount');

    if (!state.token) return;

    try {
        const res = await fetch('/users/me', {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (res.ok) {
            const user = await res.json();
            if (nameEl) nameEl.innerText = `@${user.first_name}`;
            if (postCountEl) postCountEl.innerText = user.post_count;
            if (followerCountEl) followerCountEl.innerText = user.follower_count;
        }
    } catch (err) {
        console.error("Sidebar yüklenemedi:", err);
    }
}
function setupFollowButton(user, userIdFromUrl) {
    const textGroup = document.querySelector('.profile-text-group');
    const myId = localStorage.getItem('myId'); // Kendi ID'mizi hafızadan çekiyoruz

    // Varsa eski butonu temizle (sayfa geçişlerinde üst üste binmesin)
    const oldBtn = document.getElementById('followBtn');
    if (oldBtn) oldBtn.remove();

    // ŞART: URL'de bir ID olacak VE bu ID benimkine eşit olmayacak
    if (userIdFromUrl && userIdFromUrl != myId) {
        const btn = document.createElement('button');
        btn.id = 'followBtn';
        btn.className = 'btn btn-primary';
        btn.style.marginTop = '10px';
        btn.innerText = user.is_following ? 'Takibi Bırak' : 'Takip Et';
        btn.onclick = () => handleFollow(user.id);
        
        textGroup.appendChild(btn);
    }
}
async function loadFullProfile() {
    // 1. URL'den ID parametresini çekiyoruz (id=5 gibi)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');


    
    // 2. EĞER ID VARSA o kullanıcıyı, YOKSA kendimizi (/me) çağırıyoruz
    const endpoint = userId ? `/users/${userId}` : '/users/me';

    console.log("🔍 Profil yükleniyor, gidilen adres:", endpoint);

    try {
        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        if (res.ok) {
            const user = await res.json();
            
            const followerCountEl = document.getElementById('profileFollowerCount');
            if (followerCountEl) followerCountEl.innerText = user.follower_count;


            const urlParams = new URLSearchParams(window.location.search);
            const userIdFromUrl = urlParams.get('id');
            setupFollowButton(user, userIdFromUrl);

            if (!userId) {
                state.currentUserId = user.id; 
                localStorage.setItem('myId', user.id); // Tarayıcı hafızasına da atalım garanti olsun
            }

            // 3. Ekrana Basma İşlemi
            const nameEl = document.getElementById('profileName');
            const handleEl = document.getElementById('profileHandle');
            const joinDateEl = document.getElementById('profileJoinDate');

            if (nameEl) nameEl.innerText = user.first_name;
            if (handleEl) handleEl.innerText = `${user.email}`;
            
            // Tarih formatlama
            if (joinDateEl && user.created_at) {
                const date = new Date(user.created_at);
                joinDateEl.innerText = `${date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} tarihinde katıldı`;
            }

            
            await loadUserPosts(user.id);
            setupFollowButton(user, userId); // userId: URL'den gelen
            await loadSocialLists(user.id);

        } else {
            console.error("Profil verisi alınamadı, durum:", res.status);
        }
    } catch (err) {
        console.error("Profil yükleme hatası:", err);
    }
}

async function loadUserPosts(userId) {
    const list = document.getElementById('userPosts');
    const myId = localStorage.getItem('myId'); // Giriş yapan kullanıcının ID'si

    try {
        const res = await fetch(`/posts/`); 
        const allPosts = await res.json();
        
        const myPosts = allPosts.filter(p => p.author.id === userId);

        if (myPosts.length === 0) {
            list.innerHTML = `<p style="text-align:center; padding:20px; color:var(--gray-500);">Henüz bir şey paylaşılmamış kanka.</p>`;
            return;
        }

        list.innerHTML = myPosts.map(post => {
            // 🛡️ SADECE SAHİBİNE SİLME BUTONU
            // userId zaten bu profilin sahibi, myId ise biziz. Eğer eşitse buton çıksın.
            const deleteBtn = (post.author.id == myId) 
                ? `<button onclick="event.stopPropagation(); handleDeletePost(${post.id})" class="delete-btn" style="position: absolute; right: 15px; top: 15px; z-index: 10;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                   </button>` 
                : '';

            return `
                <div class="card hover-scale fade-in" 
                    onclick="window.location.href='/post/${post.id}'" 
                    style="margin-bottom:15px; cursor:pointer; position: relative;">
                    
                    ${deleteBtn}

                    <h3 style="color: var(--accent-bright); margin-bottom: 8px; padding-right: 30px;">
                        ${post.title || post.header}
                    </h3>
                    
                    <p style="color: var(--gray-300); font-size: 0.95rem; line-height: 1.5;">
                        ${post.content || post.description}
                    </p>
                    
                    <div style="margin-top:15px; display: flex; align-items: center; gap: 15px; font-size:0.85rem; color:var(--gray-500);">
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            <span>${post.like_count} Beğeni</span>
                        </div>
                        <span>•</span>
                        <span>${timeAgo(post.created_at)}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Postlar yüklenemedi:", err);
    }
}


async function loadLikedPosts(targetUserId) {
    const list = document.getElementById('userPosts');
    
    // 1. URL'yi belirliyoruz. Eğer ID varsa o kullanıcının, yoksa düz '/liked-posts' (benimkiler)
    const url = targetUserId ? `/posts/liked-posts/${targetUserId}` : `/posts/liked-posts`;

    console.log("📡 Beğeniler çekiliyor:", url);

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });
        
        const likedPosts = await res.json();

        // 2. Boş kontrolü
        if (likedPosts.length === 0) {
            list.innerHTML = `<p style="text-align:center; padding:20px; color:var(--gray-500);">Bu kullanıcı henüz hiçbir şeyi kalplememiş kanka. 💔</p>`;
            return;
        }

        // 3. Listeleme
        list.innerHTML = likedPosts.map(post => `
            <div class="card hover-scale fade-in" onclick="window.location.href='/post/${post.id}'" style="margin-bottom:15px; cursor:pointer;">
                <h3 style="color: var(--accent-bright); margin-bottom: 8px;">${post.title || post.header}</h3>
                <p style="color: var(--gray-300);">${post.content || post.description}</p>
                <div style="margin-top:12px; font-size:0.85rem; color:var(--gray-500); display: flex; justify-content: space-between;">
                    <span>👤 ${post.author.first_name}</span>
                    <span>❤️ ${post.like_count || 0} Beğeni</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Beğeniler yüklenemedi:", err);
        list.innerHTML = `<p style="color:var(--danger); text-align:center;">Beğeniler yüklenirken dükkanda bir sorun çıktı!</p>`;
    }
}

function setupProfileTabs() {
    // HTML'deki butonları yakalıyoruz
    const tabs = document.querySelectorAll('.feed-tabs .tab-btn');
    
    // URL'deki ?id=5 gibi parametreyi alıyoruz
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('id');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            console.log("🎯 Sekme tıklandı:", tab.innerText);
            
            // 1. GÖRSEL GÜNCELLEME: Sekme butonlarını yakıp söndür
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.color = 'var(--gray-500)';
                t.style.borderBottom = 'none';
            });

            tab.classList.add('active');
            tab.style.color = 'var(--white)';
            tab.style.borderBottom = '2px solid var(--accent)';

            // 2. VERİ YÜKLEME MANTIĞI
            const contentArea = document.getElementById('userPosts');
            contentArea.innerHTML = '<div class="card skeleton" style="height: 150px; opacity: 0.3;"></div>'; // Yükleniyor efekti

            if (tab.innerText.includes('Beğeniler')) {
                // EĞER başkasının profilindeysek o ID'yi, yoksa kendi beğenilerimizi (null) gönder
                await loadLikedPosts(userIdFromUrl); 
            } else {
                // Gönderiler sekmesi için ana profil yükleme fonksiyonunu çağır
                // Bu fonksiyon zaten URL'deki ID'ye göre doğru postları getiriyor
                await loadFullProfile(); 
            }
        });
    });
}

async function handleFollow(userId) {
    const followBtn = document.getElementById('followBtn');
    const isCurrentlyFollowing = followBtn.innerText.includes('Bırak');

    // Senin router yapına göre URL ve Metot seçiyoruz
    const url = isCurrentlyFollowing ? `/follow/${userId}` : `/follow/`;
    const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
    
    // POST ise body (FollowCreate) gönderiyoruz
    const body = isCurrentlyFollowing ? null : JSON.stringify({ following_id: userId });

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: body
        });

        if (res.ok) {
            // Görsel güncelleme
            const isNowFollowing = !isCurrentlyFollowing;
            followBtn.innerText = isNowFollowing ? 'Takibi Bırak' : 'Takip Et';
            followBtn.className = isNowFollowing ? 'btn btn-outline' : 'btn btn-primary';
            
            // Sayıyı güncelle
            const followerCountEl = document.getElementById('profileFollowerCount');
            if (followerCountEl) {
                let current = parseInt(followerCountEl.innerText);
                followerCountEl.innerText = isNowFollowing ? current + 1 : current - 1;
            }
        }
    } catch (err) {
        console.error("Takip işlemi patladı kanka:", err);
    }
}

function timeAgo(dateParam) {
    if (!dateParam) return null;

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    
    return date.toLocaleDateString('tr-TR'); // Çok eskiyse direkt tarihi bas
}


function setupFollowButton(user, userIdFromUrl) {
    const textGroup = document.querySelector('.profile-text-group');
    const myId = localStorage.getItem('myId');

    const oldBtn = document.getElementById('followBtn');
    if (oldBtn) oldBtn.remove();

    if (userIdFromUrl && userIdFromUrl != myId) {
        const btn = document.createElement('button');
        btn.id = 'followBtn';
        // Backend'den gelen is_following verisine göre tasarım yapıyoruz
        btn.className = user.is_following ? 'btn btn-outline' : 'btn btn-primary';
        btn.style.marginTop = '10px';
        btn.innerText = user.is_following ? 'Takibi Bırak' : 'Takip Et';
        
        btn.onclick = () => handleFollow(user.id);
        textGroup.appendChild(btn);
    }
}
async function loadSocialLists(userId) {
    const followingDiv = document.getElementById('followingList');
    const followerDiv = document.getElementById('followerList');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('id');
    const myId = localStorage.getItem('myId');
    
    // 💡 DINAMIK ISIMLENDIRME MANTIĞI
    const isMe = !userIdFromUrl || userIdFromUrl == myId;
    const followingLabel = isMe ? "Takip Ettiklerim" : "Takip Ettikleri";
    const followerLabel = isMe ? "Takipçilerim" : "Takipçileri";

    if (!followingDiv || !followerDiv) return;

    try {
        const [followingRes, followersRes] = await Promise.all([
            fetch(`/follow/${userId}/following`, { headers: { 'Authorization': `Bearer ${state.token}` } }),
            fetch(`/follow/${userId}/followers`, { headers: { 'Authorization': `Bearer ${state.token}` } })
        ]);

        const following = await followingRes.json();
        const followers = await followersRes.json();

        // 1. Takip Edilenler Kısmı
        // Başlığı güncelliyoruz (Takip Ettiklerim vs Takip Ettikleri)
        const followingTitle = followingDiv.previousElementSibling;
        if (followingTitle) followingTitle.innerHTML = `${followingLabel} (<span id="followingCount">${following.length}</span>)`;
        
        followingDiv.innerHTML = following.length > 0 
            ? following.map(u => renderSocialItem(u)).join('') 
            : (isMe ? '<p style="font-size:0.8rem; color:var(--gray-500);">Kimseyi takip etmiyorsun.</p>' 
                    : '<p style="font-size:0.8rem; color:var(--accent);">Listeyi görmek için takip etmelisin.</p>');

        // 2. Takipçiler Kısmı
        // Başlığı güncelliyoruz (Takipçilerim vs Takipçileri)
        const followerTitle = followerDiv.previousElementSibling;
        if (followerTitle) followerTitle.innerHTML = `${followerLabel} (<span id="followerCount">${followers.length}</span>)`;

        followerDiv.innerHTML = followers.length > 0 
            ? followers.map(u => renderSocialItem(u)).join('') 
            : (isMe ? '<p style="font-size:0.8rem; color:var(--gray-500);">Henüz takipçin yok.</p>' 
                    : '<p style="font-size:0.8rem; color:var(--accent);">Takipçileri görmek için takip etmelisin.</p>');

    } catch (err) {
        console.error("Sosyal listeler yüklenemedi:", err);
    }
}
// Liste elemanını render eden minik yardımcı
function renderSocialItem(user) {
    return `
        <div onclick="window.location.href='/profile?id=${user.id}'" 
             style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px; border-radius: 8px; transition: 0.3s;" 
             class="hover-bg">
            <div style="width: 30px; height: 30px; background: var(--gray-700); border-radius: 10px;"></div>
            <span style="font-size: 0.9rem; color: var(--gray-200);">@${user.first_name}</span>
        </div>
    `;
}

async function handleDeletePost(postId) {
    if (!confirm("Kanka emin misin? Bu post geri gelmez, bak ona göre!")) return;

    try {
        const res = await fetch(`/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        if (res.ok) {
            showToast("Post başarıyla silindi. 🔥");
            // Akışı yenile (Feed'deysen feed'i, profildeysen profili)
            if (window.location.pathname === '/profile') {
                await loadFullProfile();
            } else {
                await loadFeedData();
            }
            await loadSidebarProfile(); // Sayıyı da güncelleyelim
        } else {
            const err = await res.json();
            alert("Silerken bir sorun çıktı: " + err.detail);
        }
    } catch (error) {
        console.error("Silme hatası:", error);
    }
}



// --- ARAMA MOTORU MERKEZİ ---
const searchInput = document.getElementById('navbarSearch');
const searchResults = document.getElementById('searchResults');

if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        try {
            // Backend'deki yeni /search/ endpoint'ine gidiyoruz
            const res = await fetch(`/search/?q=${query}`, {
                headers: { 'Authorization': `Bearer ${state.token}` }
            });
            
            const data = await res.json();
            renderSearchResults(data);

        } catch (err) {
            console.error("Arama patladı kanka:", err);
        }
    });

    // Sayfada başka yere tıklayınca dropdown kapansın
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}


// app.js içindeki renderSearchResults fonksiyonunun son hali:

function renderSearchResults(data) {
    let html = '';
    
    if (data.users && data.users.length > 0) {
        html += `<div class="search-category">KULLANICILAR</div>`;
        data.users.forEach(u => {
            html += `
                <div class="search-item" onclick="window.location.href='/profile?id=${u.id}'">
                    <div class="mini-avatar">${u.first_name[0]}</div>
                    <div class="info"><span class="name">${u.first_name}</span></div>
                </div>`;
        });
    }

    if (data.posts && data.posts.length > 0) {
        html += `<div class="search-category">POSTLAR</div>`;
        data.posts.forEach(p => {
            html += `
                <div class="search-item" onclick="window.location.href='/post/${p.id}'">
                    <div class="icon-box">📄</div>
                    <div class="info"><span class="name">${p.header || 'Başlıksız'}</span></div>
                </div>`;
        });
    }

    if (data.comments && data.comments.length > 0) {
        html += `<div class="search-category">YORUMLAR</div>`;
        data.comments.forEach(c => {
            // Artık c.post_id şemadan geldiği için çalışacak!
            html += `
                <div class="search-item" onclick="window.location.href='/post/${c.post_id}#comment-${c.id}'">
                    <div class="icon-box">💬</div>
                    <div class="info">
                        <span class="name">@${c.user ? c.user.first_name : 'Gezgin'}</span>
                        <span class="subtext">"${c.description.substring(0, 35)}..."</span>
                    </div>
                </div>`;
        });
    }

    if (html === '') {
        html = '<p style="padding:15px; color:var(--gray-500); font-size:0.8rem;">Bulamadık kanka...</p>';
    }

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
}



function scrollToComment(commentId) {
    const targetId = commentId || (window.location.hash ? window.location.hash.substring(9) : null);
    
    if (targetId) {
        // DOM'un render edilmesi için kısa bir delay şart
        setTimeout(() => {
            const targetEl = document.getElementById(`comment-${targetId}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.classList.add('highlight-comment');
                
                // 3 saniye sonra vurguyu kaldır
                setTimeout(() => targetEl.classList.remove('highlight-comment'), 3000);
            }
        }, 300);
    }
}