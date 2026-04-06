'use client';

export default function CheatSheetPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --teal: #1F4E5A; --teal-light: #5b8f8d; --cream: #F5F3EE;
          --accent: #ccff33; --rule: rgba(91,143,141,0.25);
          --text: #2e3a45; --subtext: #6b7280;
        }
        body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--text); }
        .print-bar { text-align: center; padding: 16px; background: var(--cream); }
        .print-btn { background: #1F4E5A; color: white; border: none; border-radius: 8px; padding: 10px 24px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
        .page { max-width: 760px; margin: 0 auto; padding: 40px 36px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 2.5px solid var(--teal); }
        .header-left h1 { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; color: var(--teal); line-height: 1.1; margin-bottom: 5px; }
        .header-left .subtitle { font-size: 0.82rem; color: var(--teal-light); font-weight: 500; letter-spacing: 0.03em; }
        .header-right { text-align: right; padding-top: 4px; }
        .logo { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: var(--teal); letter-spacing: 0.05em; }
        .event-tag { font-size: 0.7rem; color: var(--subtext); margin-top: 3px; }
        .intro { background: var(--teal); color: white; border-radius: 10px; padding: 13px 20px; margin-bottom: 20px; font-size: 0.85rem; line-height: 1.6; }
        .intro strong { color: var(--accent); font-weight: 600; }
        .steps { display: flex; flex-direction: column; gap: 15px; }
        .step { background: white; border-radius: 10px; border: 1px solid var(--rule); border-left: 4px solid var(--teal-light); padding: 17px 22px; }
        .step-header { display: flex; align-items: flex-start; gap: 11px; margin-bottom: 14px; }
        .step-number { width: 30px; height: 30px; background: var(--teal); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .step-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: var(--teal); margin-bottom: 2px; }
        .step-prompt { font-size: 0.76rem; color: var(--subtext); font-style: italic; line-height: 1.4; }
        .step-subprompt { font-size: 0.73rem; color: var(--teal-light); margin-top: 2px; }
        .goal-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .goal-option { border: 2px solid var(--rule); border-radius: 8px; padding: 14px 10px; text-align: center; }
        .goal-emoji { font-size: 1.5rem; display: block; margin-bottom: 5px; }
        .goal-label { font-size: 0.8rem; font-weight: 600; color: var(--text); display: block; margin-bottom: 3px; }
        .goal-desc { font-size: 0.68rem; color: var(--subtext); line-height: 1.35; }
        .write-line { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .write-label { font-size: 0.75rem; color: var(--subtext); white-space: nowrap; }
        .write-field { flex: 1; border: none; border-bottom: 2px solid rgba(91,143,141,0.4); background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: var(--text); padding: 7px 2px; outline: none; min-height: 32px; }
        .format-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .format-option { border: 2px solid var(--rule); border-radius: 8px; padding: 14px 12px; display: flex; flex-direction: column; gap: 7px; }
        .format-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(91,143,141,0.4); flex-shrink: 0; }
        .format-name { font-size: 0.85rem; font-weight: 600; color: var(--teal); }
        .format-detail { font-size: 0.72rem; color: var(--subtext); line-height: 1.4; }
        .dose-default { font-size: 0.8rem; color: var(--teal-light); font-weight: 500; margin-bottom: 10px; font-style: italic; }
        .dose-default strong { color: var(--teal); font-style: normal; }
        .dose-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
        .dose-box { border: 2px solid var(--rule); border-radius: 8px; padding: 12px 8px; text-align: center; }
        .dose-amount { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: var(--teal); display: block; }
        .dose-label { font-size: 0.67rem; color: var(--subtext); display: block; margin-top: 3px; line-height: 1.35; }
        .dose-rule { background: rgba(91,143,141,0.08); border-radius: 8px; padding: 9px 14px; font-size: 0.79rem; color: var(--teal); font-weight: 600; text-align: center; margin-bottom: 12px; }
        .dose-write { display: flex; align-items: center; gap: 8px; }
        .dose-write-label { font-size: 0.75rem; color: var(--subtext); white-space: nowrap; line-height: 1.4; }
        .expectation-lines { display: flex; flex-direction: column; gap: 16px; }
        .expectation-row { display: flex; align-items: center; gap: 10px; }
        .expectation-label { font-size: 0.73rem; font-weight: 600; color: var(--teal-light); text-transform: uppercase; letter-spacing: 0.05em; width: 130px; flex-shrink: 0; line-height: 1.4; }
        .expectation-field { flex: 1; border: none; border-bottom: 2px solid rgba(91,143,141,0.4); background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: var(--text); padding: 7px 2px; outline: none; min-height: 32px; }
        .reflection { background: var(--teal); border-radius: 10px; padding: 15px 22px; margin-top: 15px; display: flex; align-items: center; gap: 14px; }
        .reflection-label { font-family: 'Playfair Display', serif; font-size: 0.95rem; color: white; white-space: nowrap; flex-shrink: 0; }
        .reflection-field { flex: 1; border: none; border-bottom: 1.5px solid rgba(255,255,255,0.35); background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; color: white; padding: 7px 2px; outline: none; min-height: 32px; }
        .reflection-field::placeholder { color: rgba(255,255,255,0.4); }
        .footer { margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--rule); display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .footer-left { font-size: 0.78rem; color: var(--subtext); line-height: 1.7; }
        .footer-left strong { color: var(--teal); display: block; margin-bottom: 2px; font-size: 0.82rem; }
        .footer-left .footer-bridge { color: var(--text); font-size: 0.76rem; margin-top: 2px; }
        .footer-url { font-size: 0.68rem; color: var(--teal-light); font-weight: 600; text-align: center; margin-top: 3px; }
        @media print { .print-bar { display: none; } body { background: white; } .page { padding: 20px 24px; } }
      `}</style>

      <div className="print-bar">
        <button className="print-btn" onClick={() => window.print()}>Save or Print →</button>
      </div>

      <div className="page">
        <div className="header">
          <div className="header-left">
            <h1>Cannabis,<br />Without the Guesswork</h1>
            <div className="subtitle">Fill this out as we go — it&apos;s yours to keep</div>
          </div>
          <div className="header-right">
            <div className="logo">LIFTD+</div>
            <div className="event-tag">Mama&apos;s Network · April 2026</div>
          </div>
        </div>

        <div className="intro">
          By the end of this session, you&apos;ll have one clear answer to: <strong>what should I actually try, and how do I not overdo it?</strong>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-header">
              <div className="step-number">1</div>
              <div>
                <div className="step-title">What&apos;s your goal?</div>
                <div className="step-prompt">Circle one — pick the one that feels most true right now</div>
                <div className="step-subprompt">You don&apos;t need the perfect answer — just start here</div>
              </div>
            </div>
            <div className="goal-options">
              <div className="goal-option">
                <span className="goal-emoji">😴</span>
                <span className="goal-label">Sleep</span>
                <span className="goal-desc">Fall asleep, stay asleep, wake rested</span>
              </div>
              <div className="goal-option">
                <span className="goal-emoji">😤</span>
                <span className="goal-label">Stress &amp; anxiety</span>
                <span className="goal-desc">Take the edge off, feel less on edge</span>
              </div>
              <div className="goal-option">
                <span className="goal-emoji">🧠</span>
                <span className="goal-label">Turn my brain off</span>
                <span className="goal-desc">Decompress, stop the mental loop, just be</span>
              </div>
            </div>
            <div className="write-line">
              <span className="write-label">Something else:</span>
              <input type="text" className="write-field" placeholder=" " />
            </div>
          </div>

          <div className="step">
            <div className="step-header">
              <div className="step-number">2</div>
              <div>
                <div className="step-title">How do you want to take it?</div>
                <div className="step-prompt">Circle one</div>
              </div>
            </div>
            <div className="format-options">
              <div className="format-option">
                <div className="format-check"></div>
                <div className="format-name">Edible / Gummy</div>
                <div className="format-detail">Lasts longer, easy to dose, no smoke</div>
              </div>
              <div className="format-option">
                <div className="format-check"></div>
                <div className="format-name">Drink</div>
                <div className="format-detail">Lighter, easier to control, more social</div>
              </div>
              <div className="format-option">
                <div className="format-check"></div>
                <div className="format-name">Tincture (drops)</div>
                <div className="format-detail">Faster onset, precise, smoke-free</div>
              </div>
            </div>
          </div>

          <div className="step">
            <div className="step-header">
              <div className="step-number">3</div>
              <div>
                <div className="step-title">How much?</div>
                <div className="step-prompt"><strong style={{color:'var(--teal)'}}>Start lower than you think.</strong> You can always take more — you can&apos;t take less.</div>
              </div>
            </div>
            <div className="dose-default">
              <strong>If you&apos;re unsure, start with 1–2mg.</strong> That&apos;s always the right move.
            </div>
            <div className="dose-grid">
              <div className="dose-box">
                <span className="dose-amount">1–2mg</span>
                <span className="dose-label">Never tried it<br />Microdose</span>
              </div>
              <div className="dose-box">
                <span className="dose-amount">2.5–5mg</span>
                <span className="dose-label">Tried once or twice<br />Beginner</span>
              </div>
              <div className="dose-box">
                <span className="dose-amount">5–10mg</span>
                <span className="dose-label">Know how I respond<br />Comfortable</span>
              </div>
            </div>
            <div className="dose-rule">⏱ Wait at least 90 minutes before taking more — especially with edibles</div>
            <div className="dose-write">
              <span className="dose-write-label">My starting dose<br />(I&apos;m starting here, not guessing):</span>
              <input type="text" className="write-field" placeholder=" " />
            </div>
          </div>

          <div className="step">
            <div className="step-header">
              <div className="step-number">4</div>
              <div>
                <div className="step-title">What should I expect?</div>
                <div className="step-prompt">Set yourself up for a good first experience</div>
              </div>
            </div>
            <div className="expectation-lines">
              <div className="expectation-row">
                <span className="expectation-label">If this is working,<br />I&apos;ll feel</span>
                <input type="text" className="expectation-field" placeholder="e.g. relaxed, sleepy, calm, present" />
              </div>
              <div className="expectation-row">
                <span className="expectation-label">I don&apos;t want to</span>
                <input type="text" className="expectation-field" placeholder="e.g. feel out of control, be too groggy" />
              </div>
              <div className="expectation-row">
                <span className="expectation-label">Best time for me</span>
                <input type="text" className="expectation-field" placeholder="e.g. 30 min before bed, after kids are down" />
              </div>
              <div className="expectation-row">
                <span className="expectation-label">I&apos;ll try this</span>
                <input type="text" className="expectation-field" placeholder="e.g. this weekend, next week" />
              </div>
            </div>
          </div>
        </div>

        <div className="reflection">
          <div className="reflection-label">After filling this out, I feel —</div>
          <input type="text" className="reflection-field" placeholder="write anything that's true" />
        </div>

        <div className="footer">
          <div className="footer-left">
            <strong>Want help figuring this out without guessing?</strong>
            <span className="footer-bridge">Take what you just filled out and turn it into a personalized guide.</span>
            LIFTD+ builds your recommendations based on what matters to you — so you walk in knowing exactly what to ask for.
          </div>
          <div>
            <div style={{border:'none',padding:0}}>
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADoCAIAAABqyz8vAAAEMklEQVR4nO3dwW0cRxBAUVFwNE7JKTgcp6CUHAYvBO9OgGOghWp0f+57R0HijrgffSg0at4+P95/QM3P0w8Av0O4JAmXJOGSJFyShEuScEkSLknCJUm4JAmXJOGSJFyShEuScEn6Y/Uf/PnX3zueY9y/v/758s+fnn/1669+7pOp55l6/lNWf29OXJKES5JwSRIuScIlSbgkCZek5TnueiXnOLVmvOrxfmJhy4JAmXJOGSJFyShEuScEkSLkljc9wnU3O73fPUqXu0dbfNW6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6feN6nO3XxQAAAABJRU5ErkJggg==" alt="QR code" style={{width:68,height:68,borderRadius:6}} />
            </div>
            <div className="footer-url">liftdplus.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
