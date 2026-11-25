const WORDS = ['Apna', 'Bazaar'];
const LETTER_COLORS = ['#ff2e88', '#2d5bff', '#2be0a8', '#ff7a1a', '#ffe600'];

/** Big wordmark: letters drop in one by one, then wave on hover. */
export default function Hero() {
  let index = 0;
  return (
    <header className="hero">
      <div>
        <span className="hero__kicker">⚡ Fresh stock // Aaj ka deal</span>
        <h1 className="logo">
          <span className="sr-only">Apna Bazaar</span>
          <span aria-hidden="true">
            {WORDS.map((word) => (
              <span className="logo__word" key={word}>
                {word.split('').map((ch) => {
                  const i = index++;
                  return (
                    <span
                      key={i}
                      className="logo__letter"
                      style={
                        {
                          '--i': i,
                          '--r': `${i % 2 === 0 ? -4 : 3}deg`,
                          '--c': LETTER_COLORS[i % LETTER_COLORS.length],
                        } as React.CSSProperties
                      }
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero__sub">
          Everyday bottles and mugs in <span className="hero__highlight">loud</span> colours. Pick
          your goods, tell us your name, done.
        </p>
      </div>
      <div className="spin-badge" aria-hidden="true">
        <svg viewBox="0 0 132 132">
          <defs>
            <path id="badge-circle" d="M66,66 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0" />
          </defs>
          <text fontSize="13" fontWeight="700" letterSpacing="2.5" fill="#111">
            <textPath href="#badge-circle">• EVERYDAY • COLOURFUL • DESI • FRESH •</textPath>
          </text>
        </svg>
        <span className="spin-badge__star">✺</span>
      </div>
    </header>
  );
}
