import { useEffect, useState } from "react";
function App() {
  

  const [apods, setApods] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [showRegister, setShowRegister] = useState(false);
const [name, setName] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
const [favorites, setFavorites] = useState([]);
const fetchFavorites = async () => {
  try {
    console.log("TOKEN:", token);

    const res = await fetch("https://nebulax.onrender.com/api/register", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    console.log("FAVORITES RESPONSE:", data);

    setFavorites(data);
  } catch (err) {
    console.error(err);
  }
};

 const saveFavorite = async (item) => {
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    const res = await fetch("https://nebulax.onrender.com/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        apod_date: item.date,
        title: item.title,
        image_url: item.url,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // 🔥 INSTANT FRONTEND UPDATE
      setFavorites((prev) => [data.favorite, ...prev]);
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
  }
};


  const [showLogin, setShowLogin] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [token, setToken] = useState(localStorage.getItem("token"));

 

const handleLogin = async () => {
  try {
    const res = await fetch("https://nebulax.onrender.com/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setShowLogin(false);
      alert("Login successful");
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
};

  useEffect(() => {
  fetch("https://nebulax.onrender.com/api/apod")
    .then((res) => res.json())
    .then((data) => setApods(data))
    .catch((err) => console.error(err));
}, []);

const handleHeroClick = () => {
  window.open(
    "https://eyes.nasa.gov/apps/orrery/#/home",
    "_blank"
  );
};

useEffect(() => {
  const fetchISS = () => {
    fetch("https://nebulax.onrender.com/api/iss")
      .then((res) => res.json())
      .then((data) => setIss(data.iss_position))
      .catch((err) => console.error(err));
  };

  fetchISS(); // initial fetch

  const interval = setInterval(fetchISS, 5000);

 

 

  
  

  return () => clearInterval(interval);
}, []);
 const todayApod = apods.length > 0 ? apods[0] : null;

 const [iss, setIss] = useState(null);
  return (
    <>
    {/* GLOBAL BACKGROUND VIDEO */}
<video
  autoPlay
  loop
  muted
  playsInline
  className="fixed top-0 left-0 w-full h-full object-cover -z-20"
>
  <source src="/videos/theworld.mp4" type="video/mp4" />
</video>

{/* Global Dark Overlay */}
<div className="fixed inset-0 bg-black/70 -z-10"></div>
    
  <div className="text-white scroll-smooth min-h-screen relative z-10">
    
 

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 z-[100] bg-black/40 backdrop-blur-lg border-b border-white/10">
      <h1 className="text-xl font-semibold tracking-widest "> NebulaX</h1>
        <div className="flex gap-6">
       <button
  onClick={() => {
    if (!token) {
      alert("Please login first");
      return;
    }

    if (favorites.length === 0) {
      alert("You don't currently have any favorite pictures added.");
      return;
    }

    const section = document.getElementById("favorites-section");
    section?.scrollIntoView({ behavior: "smooth" });
  }}
  className="hover:text-gray-400 transition"
>
  ⭐
</button>
        <button
  onClick={() => {
    if (token) {
      localStorage.removeItem("token");
      setToken(null);
    } else {
      setShowLogin(true);
    }
  }}
  className="hover:text-gray-400 transition"
>
  {token ? "Logout" : "Login"}
</button>
        </div>
      </header>

{/*CONTENT WRAPPER */}
 <div className="max-w-6xl mx-auto"></div>
     
     {/* HERO SECTION */}
<section className="min-h-screen flex items-center justify-center relative overflow-hidden">

 
  {/* Content container */}
  <div className="relative z-10 w-full max-w-5xl px-6 text-center flex flex-col items-center">
    
   <h2
  onClick={handleHeroClick}
 className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight cursor-pointer transition-all duration-1000 hover:scale-105 
}`}
>
  ENTER THE COSMOS
</h2>

    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
      Explore real-time space intelligence, immersive visuals,
      and AI-powered cosmic insights.
    </p>

   
  </div>

</section>

      {/* EARTH SECTION (placeholder) */}
     <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
      <div className="flex flex-col items-center gap-8">

  <h2 className="text-4xl font-bold tracking-wide">
  From Orbit to Your Location
</h2>

  <a
   href="https://www.google.com/maps/@0,0,2z"
    target="_blank"
    rel="noopener noreferrer"
    className="group"
  >
     <img
    src="/images/earth.png"
    alt="Earth"
    className="w-72 md:w-96 animate-spin-slow drop-shadow-[0_0_40px_rgba(0,150,255,0.6)] transition-transform duration-700 group-hover:scale-105"
  />
  </a>

  <p className="text-gray-400 max-w-xl text-center">
    Click the Earth to explore our planet in real-time with Google Earth.
  </p>

</div>
      </section>

     {/* GALLERY SECTION */}
<section className="min-h-screen flex flex-col items-center justify-center border-t border-gray-800 px-6 py-20">

  <h2 className="text-4xl font-bold mb-10">Astronomy Picture of the Day</h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">

  {apods.length > 0 ? (
    apods.map((item) =>
      item.media_type === "image" ? (
        <div
  key={item.date}
  className="glow-card p-4 rounded-xl relative"
>
  {/* ⭐ Save Button */}
 <button
  onClick={() => {
    console.log("STAR CLICKED");
    saveFavorite(item);
  }}
  className="absolute top-3 right-3 text-xl hover:scale-110 transition"
>
  ⭐
</button>

  <img
    src={item.url}
    alt={item.title}
    className="rounded-lg mb-4 h-60 w-full object-cover cursor-pointer"
    onClick={() => setSelectedImage(item.hdurl || item.url)}
  />

  <h3 className="text-lg font-semibold mb-2">
    {item.title}
  </h3>

  <p className="text-gray-400 text-sm line-clamp-3">
    {item.explanation}
  </p>
</div>
      ) : null
    )
  ) : (
    <p>Loading...</p>
  )}

</div>

</section>
{/* AI SUMMARY SECTION */}
<section className="min-h-screen flex flex-col items-center justify-center border-t border-gray-800 px-6 py-20">

  <h2 className="text-4xl font-bold mb-8">
    🧠 Cosmic Insight
  </h2>

  {todayApod ? (
    <div className="max-w-3xl glow-card p-8 rounded-xl">
      <h3 className="text-2xl font-semibold mb-4">
        {todayApod.title}
      </h3>

    <p className="text-gray-300 leading-relaxed mb-6">
  {todayApod.summary}
</p>

      <p className="text-sm text-gray-500">
  AI-compressed cosmic briefing.
</p>
    </div>
  ) : (
    <p>Generating insight...</p>
  )}

</section>

    {/* ISS LIVE TRACKER */}
<section className="min-h-screen flex flex-col items-center justify-center border-t border-gray-800 px-6 py-20">
 

  {/* Content Wrapper */}
  <div className="relative z-10 w-full flex flex-col items-center">

    <h2 className="text-4xl font-bold mb-8">
      🛰 ISS Live Tracker
    </h2>

    {iss ? (
      <div className="glow-card p-8 rounded-xl text-center max-w-xl">

        <p className="text-lg mb-4">
          Latitude: <span className="font-semibold">{iss.latitude}</span>
        </p>

        <p className="text-lg mb-6">
          Longitude: <span className="font-semibold">{iss.longitude}</span>
        </p>

        <div className="mt-12">
          <a
            href="https://www.youtube.com/watch?v=aB1yRz0HhdY"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border border-white rounded-full hover:bg-white hover:text-black transition"
          >
            Watch ISS Live Stream
          </a>
        </div>
<br></br>
        <div className="mt-6">
          <a
            href={`https://www.google.com/maps/@${iss.latitude},${iss.longitude},4z`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition"
          >
            View on Map
          </a>
        </div>

      </div>
    ) : (
      <p>Tracking ISS...</p>
    )}

  </div>
</section>
{selectedImage && (
  <div
    className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200]"
    onClick={() => setSelectedImage(null)}
  >
    <div onClick={(e) => e.stopPropagation()} className="relative">
      
      <button
        onClick={() => setSelectedImage(null)}
        className="absolute -top-4 -right-4 bg-black text-white w-10 h-10 rounded-full hover:bg-gray-800 transition"
      >
        ✕
      </button>

      <img
        src={selectedImage}
        alt="Full View"
        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
      />
    </div>
  </div>
)}
{showLogin && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[300]">
    <div className="bg-gray-900 p-8 rounded-xl w-80">
      <h2 className="text-xl mb-6 text-center">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-2 rounded bg-black border border-gray-700"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 p-2 rounded bg-black border border-gray-700"
      />

      <button
        onClick={handleLogin}
        className="w-full bg-white text-black py-2 rounded hover:bg-gray-300"
      >
        Login
      </button>

      <button
        onClick={() => setShowLogin(false)}
        className="w-full mt-4 text-gray-400"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{showFavorites && (
  <section
  id="favorites-section"
  className="min-h-screen flex flex-col items-center border-t border-gray-800 px-6 py-20"
>
    <h2 className="text-4xl font-bold mb-10 text-center">
      My Favorites
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {favorites.map((fav) => (
        <div key={fav.id} className="glow-card p-4 rounded-xl">
          <img
            src={fav.image_url}
            alt={fav.title}
            className="rounded-lg mb-4 h-60 w-full object-cover"
          />
          <h3 className="text-lg font-semibold">
            {fav.title}
          </h3>
        </div>
      ))}
    </div>
  </section>
)}
    </div>
    </>
  );
}

export default App;