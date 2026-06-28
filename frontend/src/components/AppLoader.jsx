import { useEffect, useRef, useState } from 'react';

function getCheckmarkPoints(count, width, height) {
  const S = Math.min(width, height) * 0.3; // size of checkmark
  const cx = width / 2;
  const cy = height / 2 - S * 0.1; // Shift up slightly to balance with text
  
  // points for checkmark
  const p1 = { x: cx - S * 0.4, y: cy };
  const p2 = { x: cx - S * 0.1, y: cy + S * 0.3 };
  const p3 = { x: cx + S * 0.5, y: cy - S * 0.4 };
  
  const points = [];
  const n1 = Math.floor(count * 0.3); // 30% points for the short leg
  const n2 = count - n1; // 70% points for the long leg
  
  for(let i=0; i<n1; i++) {
    const t = i / (n1 - 1 || 1);
    points.push({ x: p1.x + (p2.x - p1.x)*t, y: p1.y + (p2.y - p1.y)*t });
  }
  for(let i=0; i<n2; i++) {
    const t = i / (n2 - 1 || 1);
    points.push({ x: p2.x + (p3.x - p2.x)*t, y: p2.y + (p3.y - p2.y)*t });
  }
  return points;
}

export default function AppLoader({ children }) {
  const [phase, setPhase] = useState('canvas'); // canvas | typewriter | tagline | reveal | done
  const canvasRef = useRef(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('typewriter'), 1200),
      setTimeout(() => setPhase('tagline'),    2000),
      setTimeout(() => setPhase('reveal'),     2200),
      setTimeout(() => setPhase('done'),       2900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 'canvas' && phase !== 'typewriter' && phase !== 'tagline') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    
    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const targetPoints = getCheckmarkPoints(55, canvas.width, canvas.height);
      
      particles = targetPoints.map(target => ({
        startX: Math.random() * canvas.width,
        startY: Math.random() * canvas.height,
        targetX: target.x,
        targetY: target.y,
        size: 4,
        color: '#818cf8',
      }));
    };
    
    initCanvas();
    
    const startTime = performance.now();
    
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / 1200, 1);
      
      // easeInOutCubic
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      particles.forEach(p => {
        const x = p.startX + (p.targetX - p.startX) * ease;
        const y = p.startY + (p.targetY - p.startY) * ease;
        
        let scale = 1;
        // Pulse at the end (elapsed between 1200 and 1400)
        if (elapsed > 1200 && elapsed < 1400) {
          const pulseProgress = (elapsed - 1200) / 200;
          scale = 1 + Math.sin(pulseProgress * Math.PI) * 0.5;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      if (phase !== 'reveal' && phase !== 'done') {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    const handleResize = () => {
      initCanvas();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase]);

  const [typewriterText, setTypewriterText] = useState('');
  const hasStartedTyping = useRef(false);

  useEffect(() => {
    if ((phase === 'typewriter' || phase === 'tagline') && !hasStartedTyping.current) {
      hasStartedTyping.current = true;
      const fullText = 'TaskFlow';
      let i = 0;
      const interval = setInterval(() => {
        setTypewriterText(fullText.substring(0, i + 1));
        i++;
        if (i === fullText.length) clearInterval(interval);
      }, 70); 
      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <>
      {phase !== 'done' && (
        <div className={`app-splash ${phase === 'reveal' ? 'splash-explode' : ''}`}>
          <div className="splash-bg-grid" />
          <div className="splash-orb-1" />
          <div className="splash-orb-2" />

          {/* Canvas for Act 1 */}
          <canvas ref={canvasRef} className="splash-canvas" />

          {/* Typewriter for Act 2 */}
          {(phase === 'typewriter' || phase === 'tagline' || phase === 'reveal') && (
            <div className="splash-text-container">
              <div className="splash-typewriter">
                {typewriterText}
                <span className={`splash-cursor ${phase === 'tagline' || phase === 'reveal' ? 'splash-cursor-morph' : ''}`}></span>
              </div>
              <div className={`splash-tagline-text ${(phase === 'tagline' || phase === 'reveal') ? 'visible' : ''}`}>
                Every task. In its place.
              </div>
            </div>
          )}
        </div>
      )}
      <div className={`app-content ${phase === 'done' || phase === 'reveal' ? 'content-visible' : 'content-hidden'}`}>
        {children}
      </div>
    </>
  );
}
