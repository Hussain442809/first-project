import { useEffect, useState } from 'react'
import './App.css'

const SESSION_KEY = 'library-session'

function readSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

async function apiRequest(path, token, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(path, { ...options, headers })
  const text = await response.text()
  let data = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`The server returned an unexpected response (${response.status}).`)
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`)
  }

  return data
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)

    try {
      if (mode === 'register') {
        await apiRequest('/auth/register', null, {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        })
        setForm((current) => ({ ...current, password: '' }))
        setMode('login')
        setMessage('Account created successfully. Please sign in.')
      } else {
        const data = await apiRequest('/auth/login', null, {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        })

        const session = { token: data.token, user: data.user }
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        onAuthenticated(session)
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-row">
          <span className="brand-mark">R</span>
          <div>
            <p className="brand-name">Rufuf Library</p>
            <p className="brand-caption">Your next story starts here</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} autoComplete="name" required />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : undefined} />
          </label>
          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  )
}

function BookCard({ book, loan, onBorrow, borrowing }) {
  const borrowed = Boolean(loan)
  const initial = typeof book.title === 'string' && book.title.trim() ? book.title.trim()[0].toUpperCase() : 'B'

  return (
    <article className="book-card">
      <div className="book-cover" aria-hidden="true">{initial}</div>
      <div className="book-details">
        <h3>{book.title || 'Untitled book'}</h3>
        <p>{book.author || 'Unknown author'}</p>
        {book.published_year && <span className="year-badge">{book.published_year}</span>}
        <button
          className="borrow-button"
          type="button"
          disabled={borrowed || borrowing || book.id === undefined}
          onClick={() => onBorrow(book)}
        >
          {borrowed ? 'Borrowed' : borrowing ? 'Borrowing...' : 'Borrow'}
        </button>
      </div>
    </article>
  )
}

function Library({ session, notify }) {
  const [books, setBooks] = useState([])
  const [loans, setLoans] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [borrowingId, setBorrowingId] = useState(null)
  const [error, setError] = useState('')

  async function loadLoans() {
    try {
      const data = await apiRequest('/loans', session.token)
      setLoans(Array.isArray(data) ? data : [])
    } catch (requestError) {
      notify(requestError.message, 'error')
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      try {
        const [bookData, loanData] = await Promise.all([
          apiRequest('/books', session.token),
          apiRequest('/loans', session.token),
        ])
        if (ignore) return
        setBooks(Array.isArray(bookData) ? bookData : [])
        setLoans(Array.isArray(loanData) ? loanData : [])
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialData()
    return () => {
      ignore = true
    }
  }, [session.token])

  async function borrowBook(book) {
    setBorrowingId(book.id)
    try {
      await apiRequest('/loans', session.token, {
        method: 'POST',
        body: JSON.stringify({ book_id: book.id }),
      })
      await loadLoans()
      notify(`Borrowed "${book.title}".`)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setBorrowingId(null)
    }
  }

  const query = search.trim().toLowerCase()
  const visibleBooks = books.filter((book) =>
    [book.title, book.author, book.published_year]
      .filter((value) => value !== null && value !== undefined)
      .join(' ')
      .toLowerCase()
      .includes(query),
  )

  return (
    <section className="library-page">
      <header className="library-hero">
        <div>
          <p className="eyebrow">WELCOME TO YOUR LIBRARY</p>
          <h1>Find your next story.</h1>
        </div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search title or author" />
        </label>
      </header>

      {error && <p className="page-error">{error}</p>}
      {loading ? (
        <p className="state-message">Loading books...</p>
      ) : visibleBooks.length === 0 ? (
        <p className="state-message">No books match your search.</p>
      ) : (
        <div className="books-grid">
          {visibleBooks.map((book) => {
            const activeLoan = loans.find((loan) =>
              String(loan.book_id) === String(book.id) && !loan.returned_at,
            )
            return (
              <BookCard
                key={book.id}
                book={book}
                loan={activeLoan}
                borrowing={borrowingId === book.id}
                onBorrow={borrowBook}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

function Loans({ session, notify }) {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [returningId, setReturningId] = useState(null)

  async function loadLoans() {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/loans', session.token)
      setLoans(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialLoans() {
      try {
        const data = await apiRequest('/loans', session.token)
        if (!ignore) setLoans(Array.isArray(data) ? data : [])
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialLoans()
    return () => {
      ignore = true
    }
  }, [session.token])

  async function returnLoan(loan) {
    setReturningId(loan.id)
    try {
      await apiRequest(`/loans/${loan.id}/return`, session.token, { method: 'PUT' })
      await loadLoans()
      notify(`Loan ${loan.id} was returned.`)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setReturningId(null)
    }
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>My Loans</h1>
      </div>
      {error && <p className="page-error">{error}</p>}
      {loading ? (
        <p className="state-message">Loading loans...</p>
      ) : loans.length === 0 ? (
        <p className="state-message">You have no loans yet.</p>
      ) : (
        <div className="loans-list">
          {loans.map((loan) => (
            <article className="loan-row" key={loan.id}>
              <div>
                <span className="loan-id">Loan #{loan.id}</span>
                <h3>Book #{loan.book_id}</h3>
                <p>{loan.returned_at ? `Returned ${new Date(loan.returned_at).toLocaleString()}` : 'Currently borrowed'}</p>
              </div>
              {!loan.returned_at && (
                <button className="secondary-button" type="button" disabled={returningId === loan.id} onClick={() => returnLoan(loan)}>
                  {returningId === loan.id ? 'Returning...' : 'Return'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Admin({ session, notify }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    apiRequest('/users', session.token)
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [session.token])

  async function deleteUser(user) {
    if (String(user.id) === String(session.user?.id)) return
    if (!window.confirm(`Delete the account for ${user.name || user.email}?`)) return

    setDeletingId(user.id)
    try {
      await apiRequest(`/users/${user.id}`, session.token, { method: 'DELETE' })
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== user.id))
      notify(`Deleted ${user.name || user.email}.`)
    } catch (requestError) {
      notify(requestError.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="content-page">
      <div className="page-heading">
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Users</h1>
      </div>
      {error && <p className="page-error">{error}</p>}
      {loading ? (
        <p className="state-message">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="state-message">No users found.</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className={`role role-${user.role || 'user'}`}>{user.role || 'user'}</span></td>
                  <td>
                    {String(user.id) === String(session.user?.id) ? (
                      <span className="self-account">Your account</span>
                    ) : (
                      <button
                        className="delete-user-button"
                        type="button"
                        disabled={deletingId === user.id}
                        onClick={() => deleteUser(user)}
                      >
                        {deletingId === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function App() {
  const [session, setSession] = useState(readSession)
  const [view, setView] = useState('library')
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState('success')

  function notify(message, type = 'success') {
    setToast(message)
    setToastType(type)
  }

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setView('library')
  }

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />
  }

  const isAdmin = session.user?.role === 'admin'

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => setView('library')}>
          <span className="brand-mark">R</span>
          <span>Rufuf</span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          <button type="button" className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}>Library</button>
          <button type="button" className={view === 'loans' ? 'active' : ''} onClick={() => setView('loans')}>My Loans</button>
          {isAdmin && <button type="button" className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Users</button>}
        </nav>
        <div className="account-actions">
          <div className="account-copy">
            <strong>{session.user?.name || session.user?.email}</strong>
            <span>{isAdmin ? 'Administrator' : 'Member'}</span>
          </div>
          <button className="logout-button" type="button" onClick={logout}>Sign out</button>
        </div>
      </header>

      {view === 'library' && <Library session={session} notify={notify} />}
      {view === 'loans' && <Loans session={session} notify={notify} />}
      {view === 'admin' && isAdmin && <Admin session={session} notify={notify} />}

      {toast && <div className={`toast toast-${toastType}`} role="status">{toast}</div>}
    </div>
  )
}

export default App
