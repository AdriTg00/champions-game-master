export default function FloatingBackground() {
  return (
    <div className="floating-background">
      {/* MANDOS DE PLAYSTATION */}
      <div className="floating-item controller controller-1">🎮</div>
      <div className="floating-item controller controller-2">🎮</div>
      <div className="floating-item controller controller-3">🎮</div>

      {/* CAJAS DE JUEGOS MÍTICOS */}
      <div className="floating-item game-box box-1">
        RETRO
        <br />
        GAMES
      </div>
      <div className="floating-item game-box box-2">
        CLASSIC
        <br />
        EDITION
      </div>
      <div className="floating-item game-box box-3">
        ARCADE
        <br />
        HITS
      </div>

      {/* DISCOS / CDs */}
      <div className="floating-item disc disc-1"></div>
      <div className="floating-item disc disc-2"></div>

      {/* CARTUCHOS RETRO */}
      <div className="floating-item cartridge cart-1"></div>
      <div className="floating-item cartridge cart-2"></div>
    </div>
  );
}