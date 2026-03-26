// Shared Supabase client — imported by every page
const SUPABASE_URL    = 'https://jjlilpfuofhlhjnvekzz.supabase.co';
const SUPABASE_ANON   = 'sb_publishable_xM6pZshfIhju8rbWBSfvrw_wDXXqOJr';
const STORAGE_BUCKET  = 'icon-packs';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ── Auth helpers ───────────────────────────────────────────────────────────

async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

function authorName(user) {
  return user?.user_metadata?.username || user?.email?.split('@')[0] || '';
}

// ── Nav auth state ─────────────────────────────────────────────────────────
// Call this on every page after DOM loads.
// Replaces the element with id="nav-auth" based on session state.

async function initNavAuth() {
  const el = document.getElementById('nav-auth');
  if (!el) return;

  const session = await getSession();
  if (session) {
    const name = authorName(session.user);
    el.innerHTML = `
      <a href="publish.html" class="nav-cta">Publish Design</a>
      <div class="nav-avatar" id="nav-avatar-btn" title="${name}">
        ${name.charAt(0).toUpperCase()}
      </div>
      <div class="nav-dropdown" id="nav-dropdown">
        <div class="nav-dropdown-name">${name}</div>
        <div class="nav-dropdown-email">${session.user.email}</div>
        <hr style="border:none;border-top:0.5px solid rgba(0,0,0,0.08);margin:8px 0">
        <button class="nav-dropdown-item" id="nav-logout">Sign Out</button>
      </div>
    `;
    document.getElementById('nav-avatar-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('nav-dropdown')?.classList.toggle('open');
    });
    document.addEventListener('click', () => {
      document.getElementById('nav-dropdown')?.classList.remove('open');
    });
    document.getElementById('nav-logout')?.addEventListener('click', async () => {
      await sb.auth.signOut();
      window.location.reload();
    });
  } else {
    el.innerHTML = `
      <a href="auth.html" class="nav-link-subtle">Log In</a>
      <a href="auth.html?tab=signup" class="nav-cta">Sign Up</a>
    `;
  }
}

// ── Marketplace fetcher ────────────────────────────────────────────────────

async function fetchAllPacks() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/icon_packs?select=*&order=name`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function iconPublicURL(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}
