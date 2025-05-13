import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [view, setView] = useState("home");
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentSong, setCurrentSong] = useState({ song: "", lyricist: "", lyrics: "" });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSongs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://lyric-server-1.onrender.com/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await fetch("https://lyric-server-1.onrender.com/api/songs");
      const data = await res.json();
      setSongs(Array.isArray(data) ? data : data.songs || []);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setSongs([]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const userData = {
      name: form.username.value.trim(),
      email: form.email.value.trim(),
      number: form.number.value.trim(),
      pass: form.password.value.trim(),
      image: selectedImage,
    };

    if (!userData.name || !userData.email || !userData.number || !userData.pass)
      return alert("All fields required");

    try {
      const res = await fetch("https://lyric-server-1.onrender.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (res.status === 201) {
        alert("Registered successfully!");
        form.reset();
        setSelectedImage(null);
        fetchUsers();
        setView("login");
      } else {
        const data = await res.json();
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  const handleLogin = async (e, type) => {
    e.preventDefault();
    const form = e.target;
    const name = form.username.value;
    const pass = form.password.value;

    if (type === "admin") {
      if (name === "admin" && pass === "admin") return setView("adminPage");
      return alert("Invalid Admin Credentials");
    }

    try {
      const res = await fetch("https://lyric-server-1.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pass }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data);
        setView("userPanel");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView("home");
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    const { song, lyricist, lyrics } = currentSong;
    if (!song || !lyricist || !lyrics) return alert("Fill all fields");

    const newSong = {
      song,
      lyricist,
      lyrics,
      user: currentUser.name,
    };

    try {
      if (editIndex !== null) {
        const songToUpdate = songs.filter(s => s.user === currentUser.name)[editIndex];
        const res = await fetch(`https://lyric-server-1.onrender.com/api/songs/${songToUpdate._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSong),
        });
        const updated = await res.json();
        setSongs(songs.map(s => s._id === updated._id ? updated : s));
      } else {
        const res = await fetch("https://lyric-server-1.onrender.com/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSong),
        });
        const savedSong = await res.json();
        setSongs([...songs, savedSong]);
      }

      setCurrentSong({ song: "", lyricist: "", lyrics: "" });
      setEditIndex(null);
      setView("songsPage");
    } catch (err) {
      console.error("Song submit error:", err);
    }
  };

  const handleSongDelete = async (id) => {
    try {
      await fetch(`https://lyric-server-1.onrender.com/api/songs/${id}`, { method: "DELETE" });
      setSongs(songs.filter(song => song._id !== id));
      setView("songsPage");
    } catch (err) {
      console.error("Song delete error:", err);
    }
  };

  const handleUserDelete = async (id) => {
    try {
      await fetch(`https://lyric-server-1.onrender.com/api/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err) {
      console.error("User delete error:", err);
    }
  };

  return (
    <div className="container" style={{ marginTop: "60px" }}>
      <h1 className="title">🎵 DJ Lyric Writer 🎵</h1>

      {view === "home" && (
        <div className="buttons">
          <div className="button-container">
  <button onClick={() => setView("adminLogin")}>Admin Login</button>
  <button onClick={() => setView("login")}>User Login</button>
  <button onClick={() => setView("register")}>Register</button>
</div>

        </div>
      )}

      {view === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <input name="username" placeholder="Username" />
          <input name="email" placeholder="Email" />
          <input name="number" placeholder="Phone Number" />
          <input name="password" type="password" placeholder="Password" />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {selectedImage && <img src={selectedImage} alt="Preview" width={100} />}
          <button type="submit">Register</button>
          <button type="button" onClick={() => setView("home")}>Back</button>
        </form>
      )}

      {view === "login" && (
        <form onSubmit={(e) => handleLogin(e, "user")}>
          <h2>User Login</h2>
          <input name="username" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
          <button onClick={() => setView("home")}>Back</button>
        </form>
      )}

      {view === "adminLogin" && (
        <form onSubmit={(e) => handleLogin(e, "admin")}>
          <h2>Admin Login</h2>
          <input name="username" placeholder="Admin Username" />
          <input name="password" type="password" placeholder="Admin Password" />
          <button type="submit">Login</button>
          <button onClick={() => setView("home")}>Back</button>
        </form>
      )}

      {view === "adminPage" && (
        <div>
          <h3>Registered Users: {users.length}</h3>
          <div className="user-list">
            {Array.isArray(users) && users.map((user) => (
              <div key={user._id} className="user-card">
                <img src={user.image} alt="avatar" width={60} height={60} style={{ borderRadius: "50%" }} />
                <p><strong>{user.name}</strong></p>
                <button onClick={() => { setSelectedUser(user); setView("viewUser"); }}>View</button>
                <button onClick={() => handleUserDelete(user._id)}>Delete</button>
              </div>
            ))}
          </div>
          <button onClick={() => setView("home")}>Logout</button>
        </div>
      )}

      {view === "viewUser" && selectedUser && (
        <div>
          <h2>User Details</h2>
          <img src={selectedUser.image} alt="Full" width={120} style={{ borderRadius: "50%" }} />
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong> {selectedUser.number}</p>
          <p><strong>Songs:</strong> {songs.filter(song => song.user === selectedUser.name).length}</p>
          <button onClick={() => setView("adminPage")}>Back</button>
        </div>
      )}

      {view === "userPanel" && currentUser && (
        <form onSubmit={handleSongSubmit}>
          <h2>{editIndex !== null ? "Edit" : "Add"} Song</h2>
          <input placeholder="Song Name" value={currentSong.song} onChange={(e) => setCurrentSong({ ...currentSong, song: e.target.value })} />
          <input placeholder="Lyricist Name" value={currentSong.lyricist} onChange={(e) => setCurrentSong({ ...currentSong, lyricist: e.target.value })} />
          <textarea placeholder="Lyrics" value={currentSong.lyrics} onChange={(e) => setCurrentSong({ ...currentSong, lyrics: e.target.value })} rows="5" />
          <button type="submit">{editIndex !== null ? "Update" : "Add"} Song</button>
          <button onClick={() => setView("songsPage")}>View Songs</button>
          <button onClick={handleLogout}>Logout</button>
        </form>
      )}

      {view === "songsPage" && currentUser && (
        <div>
          <h2>My Songs</h2>
          {songs.filter(song => song.user === currentUser.name).length === 0 ? (
            <p>No songs added</p>
          ) : (
            songs.filter(song => song.user === currentUser.name).map((song, i) => (
              <div key={song._id} className="song-card">
                <div onClick={() => setCurrentSong(prev => prev._id === song._id ? { song: "", lyricist: "", lyrics: "" } : song)} style={{ cursor: "pointer" }}>
                  <strong>{song.song}</strong> by {song.lyricist}
                </div>
                {currentSong._id === song._id && (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ whiteSpace: "pre-wrap" }}>{song.lyrics}</p>
                    <button onClick={() => { setCurrentSong(song); setEditIndex(i); setView("userPanel"); }}>Edit</button>
                    <button onClick={() => handleSongDelete(song._id)}>Delete</button>
                    <button onClick={() => {
                      const blob = new Blob([
                        `Title: ${song.song}\nBy: ${song.lyricist}\n\n${song.lyrics}`
                      ], { type: "text/plain;charset=utf-8" });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `${song.song}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}>Download</button>
                  </div>
                )}
              </div>
            ))
          )}
          <button onClick={() => setView("userPanel")}>Back</button>
        </div>
      )}
    </div>
  );
}

export default App;
