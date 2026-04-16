export default function Home({ onStart }) {
  return (
    <div className="home scanlines">
      <h1>Choose Your Game 🎮</h1>
      <p>Elige entre videojuegos hasta generar tu ranking.</p>
      <button onClick={onStart}>Comenzar</button>
    </div>
  );
}
