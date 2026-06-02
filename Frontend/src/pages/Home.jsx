export default function Home({ onStart }) {
  return (
    <div className="home scanlines">
      <div className="home-card">
        <h1>Choose Your Game 🎮</h1>
        <p>Elige entre videojuegos hasta generar tu ranking personalizado con estilo.</p>
        <button onClick={onStart}>Comenzar</button>
      </div>
    </div>
  );
}
