import React, { useState, useEffect, useRef } from 'react';

function App() {
  // --- States ---
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineText, setTaglineText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'input', text: 'system --init' },
    { type: 'system', text: 'Initializing LIKHITH_T OS [v2.0.26]...' },
    { type: 'success', text: 'Welcome. Type "help" or click buttons below to inspect node.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [activeToast, setActiveToast] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [scholarBadgeHover, setScholarBadgeHover] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());

  // --- Constants ---
  const taglines = [
    "Full Stack Developer",
    "Siemens Scholar",
    "React Developer",
    "Python Programmer"
  ];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;

  // --- Refs ---
  const canvasRef = useRef(null);
  const terminalBottomRef = useRef(null);
  const terminalInputRef = useRef(null);

  // --- Effects ---

  // Live System Time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setSystemTime(date.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tagline Typing Engine
  useEffect(() => {
    let timer;
    const currentTagline = taglines[taglineIndex];

    if (!isDeleting) {
      if (taglineText.length < currentTagline.length) {
        timer = setTimeout(() => {
          setTaglineText(currentTagline.slice(0, taglineText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      if (taglineText.length > 0) {
        timer = setTimeout(() => {
          setTaglineText(currentTagline.slice(0, taglineText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
      }
    }

    return () => clearTimeout(timer);
  }, [taglineText, isDeleting, taglineIndex]);

  // Section Scroll Spy & IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const scrollTriggerElements = document.querySelectorAll('.scroll-trigger');

    // Section active state scrollspy
    const spyOptions = { rootMargin: '-20% 0px -60% 0px' };
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, spyOptions);

    sections.forEach((sec) => spyObserver.observe(sec));

    // Staggered scroll animations
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    scrollTriggerElements.forEach((el) => animationObserver.observe(el));

    return () => {
      spyObserver.disconnect();
      animationObserver.disconnect();
    };
  }, []);

  // Interactive Particle Canvas Background in Hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    const particlesArray = [];
    const numberOfParticles = 45;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(0, 255, 102, 0.4)' : 'rgba(0, 240, 255, 0.4)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect particles close to each other
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 - distance / 120 * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Scroll to bottom of terminal whenever history updates
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  // --- Handlers ---
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, { type: 'input', text: terminalInput }];

    switch (cmd) {
      case 'help':
        newHistory.push({
          type: 'system',
          text: 'Available subroutines: "about", "skills", "experience", "achievements", "certifications", "contact", "clear"'
        });
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      case 'about':
        newHistory.push({
          type: 'success',
          text: 'Bio: BE Computer Science student at GEC Hassan. Expected grad: May 2027. Siemens Scholar.'
        });
        break;
      case 'skills':
        newHistory.push({
          type: 'success',
          text: 'Languages: Python, JavaScript, C | Web: React.js, Express.js, MERN Fundamentals | Tools: Git, VS Code, Postman, Solid Edge'
        });
        break;
      case 'experience':
        newHistory.push({
          type: 'success',
          text: 'Vault of Codes (Remote React Frontend Intern) | Siemens Technical Academy (Industrial Automation Mechatronics Intern)'
        });
        break;
      case 'achievements':
        newHistory.push({
          type: 'success',
          text: '1. Siemens Scholar (Top 4.3% applicants) | 2. Google Student Ambassador (Gemini AI workshop organizer) | 3. The Coding Lab upcoming intern'
        });
        break;
      case 'certifications':
        newHistory.push({
          type: 'success',
          text: '1. Siemens Data Science Workshop | 2. TCS Youth Employment Program (Job readiness certification)'
        });
        break;
      case 'contact':
        newHistory.push({
          type: 'success',
          text: 'Email: llikilaki@gmail.com | Phone: +91 8310664022 | LinkedIn: linkedin.com/in/likhith-t-0610472b8'
        });
        break;
      default:
        newHistory.push({
          type: 'error',
          text: `Command not found: "${cmd}". Type "help" for a list of available systems.`
        });
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setActiveToast(`[SUCCESS]: ${label} copied to clipboard.`);
    setTimeout(() => setActiveToast(null), 3000);
  };

  const triggerCommand = (commandString) => {
    setTerminalInput(commandString);
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Google Fonts and CSS styles embedded */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Orbitron:wght@400..900&display=swap');

        /* Color Variables */
        :root {
          --bg-black: #030304;
          --bg-card: #08080c;
          --neon-green: #00ff66;
          --neon-cyan: #00f0ff;
          --neon-magenta: #ff0055;
          --text-main: #e2e8f0;
          --text-muted: #8c9fae;
          --border-glow-cyan: rgba(0, 240, 255, 0.25);
          --border-glow-green: rgba(0, 255, 102, 0.25);
        }

        /* Basic Resets */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
        }

        body {
          background-color: var(--bg-black);
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-main);
          overflow-x: hidden;
          line-height: 1.6;
        }

        /* CRT Scanlines Overlay */
        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%,
            rgba(0, 0, 0, 0.15) 50%
          );
          background-size: 100% 4px;
          z-index: 9999;
          pointer-events: none;
        }

        .scanline-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: rgba(0, 240, 255, 0.05);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
          animation: scanlineMove 12s linear infinite;
          z-index: 9998;
          pointer-events: none;
        }

        @keyframes scanlineMove {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }

        /* Container Layout */
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Sticky Glassmorphism Header */
        .nav-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          background: rgba(3, 3, 4, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 240, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 1000;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .nav-brand {
          font-family: 'Orbitron', sans-serif;
          font-weight: 800;
          font-size: 1.4rem;
          color: var(--neon-cyan);
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.6);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .nav-brand span {
          color: var(--neon-green);
          text-shadow: 0 0 8px rgba(0, 255, 102, 0.6);
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          list-style: none;
        }

        .nav-item a {
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          transition: all 0.3s ease;
          padding: 0.5rem 0.75rem;
          border: 1px solid transparent;
          position: relative;
        }

        .nav-item a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 1px;
          background: var(--neon-cyan);
          transition: all 0.3s ease;
          transform: translateX(-50%);
          box-shadow: 0 0 8px var(--neon-cyan);
        }

        .nav-item.active a {
          color: var(--neon-cyan);
          text-shadow: 0 0 6px rgba(0, 240, 255, 0.4);
        }

        .nav-item.active a::after {
          width: 80%;
        }

        .nav-item a:hover {
          color: var(--neon-green);
          text-shadow: 0 0 6px rgba(0, 255, 102, 0.4);
        }

        .system-status {
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--neon-green);
          background: rgba(0, 255, 102, 0.05);
          padding: 0.4rem 0.8rem;
          border: 1px solid rgba(0, 255, 102, 0.2);
          border-radius: 4px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background-color: var(--neon-green);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--neon-green);
          animation: blink 1.5s infinite;
        }

        /* Scroll Animation Setup */
        .scroll-trigger {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scroll-trigger.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Main Content wrapper */
        .main-content {
          padding-top: 70px;
        }

        /* Generic Section Styling */
        section {
          padding: 5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .section-header {
          margin-bottom: 3rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-code {
          color: var(--neon-green);
          font-size: 0.9rem;
          letter-spacing: 2px;
          background: rgba(0, 255, 102, 0.08);
          padding: 0.2rem 0.5rem;
          border: 1px solid rgba(0, 255, 102, 0.2);
        }

        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--neon-cyan);
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-line {
          flex-grow: 1;
          height: 1px;
          background: linear-gradient(to right, var(--neon-cyan), transparent);
          opacity: 0.3;
        }

        /* Card Terminal Framing */
        .term-card {
          background-color: var(--bg-card);
          border: 1px solid rgba(0, 240, 255, 0.15);
          border-radius: 6px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }

        .term-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--neon-cyan), transparent);
          opacity: 0.8;
        }

        .term-card:hover {
          transform: translateY(-5px);
          border-color: var(--neon-cyan);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
        }

        .term-header {
          height: 30px;
          background-color: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          padding: 0 1rem;
          justify-content: space-between;
        }

        .term-dots {
          display: flex;
          gap: 6px;
        }

        .term-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .term-dot.red { background-color: #ff5f56; }
        .term-dot.yellow { background-color: #ffbd2e; }
        .term-dot.green { background-color: #27c93f; }

        .term-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .term-body {
          padding: 1.5rem;
        }

        /* Hero Section */
        .hero-section {
          min-height: calc(100vh - 70px);
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          align-items: center;
          padding-top: 2rem;
          padding-bottom: 2rem;
        }

        .hero-canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .hero-left {
          z-index: 1;
        }

        .hero-tag {
          font-size: 0.85rem;
          color: var(--neon-green);
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 1rem;
          display: inline-block;
          background: rgba(0, 255, 102, 0.06);
          padding: 0.3rem 0.8rem;
          border-left: 2px solid var(--neon-green);
        }

        .hero-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          line-height: 1.1;
          color: var(--text-main);
          margin-bottom: 1.5rem;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }

        .hero-name span {
          color: transparent;
          -webkit-text-stroke: 1px var(--neon-cyan);
          background: linear-gradient(135deg, var(--neon-cyan), #0077ff);
          -webkit-background-clip: text;
          background-clip: text;
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.35);
        }

        .hero-title-type {
          font-size: 1.5rem;
          color: var(--text-muted);
          min-height: 2.2rem;
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
        }

        .hero-title-type span {
          color: var(--neon-green);
          font-weight: bold;
          text-shadow: 0 0 8px rgba(0, 255, 102, 0.4);
        }

        .cursor {
          display: inline-block;
          width: 10px;
          height: 1.4rem;
          background-color: var(--neon-green);
          margin-left: 5px;
          animation: blink 0.8s infinite;
          box-shadow: 0 0 8px var(--neon-green);
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
        }

        .btn {
          font-family: 'JetBrains Mono', monospace;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 0.85rem;
          font-weight: bold;
          letter-spacing: 1.5px;
          padding: 0.9rem 1.8rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background-color: transparent;
          border: 1px solid var(--neon-cyan);
          color: var(--neon-cyan);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.15), inset 0 0 5px rgba(0, 240, 255, 0.1);
        }

        .btn-primary:hover {
          background-color: var(--neon-cyan);
          color: #000;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--text-muted);
        }

        .btn-secondary:hover {
          border-color: var(--neon-green);
          color: var(--neon-green);
          box-shadow: 0 0 15px rgba(0, 255, 102, 0.3);
          transform: translateY(-2px);
        }

        /* Living Interactive Terminal */
        .hero-right {
          z-index: 1;
        }

        .interactive-terminal {
          width: 100%;
          border: 1px solid rgba(0, 255, 102, 0.2);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
        }

        .interactive-terminal:hover {
          border-color: var(--neon-green);
          box-shadow: 0 0 25px rgba(0, 255, 102, 0.15);
        }

        .terminal-display {
          height: 250px;
          overflow-y: auto;
          font-size: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-right: 0.5rem;
        }

        /* Custom Scrollbar for Terminal */
        .terminal-display::-webkit-scrollbar {
          width: 4px;
        }
        .terminal-display::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .terminal-display::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 102, 0.3);
          border-radius: 2px;
        }

        .term-line {
          word-break: break-all;
        }

        .term-line.input::before {
          content: 'LikhithOS:~# ';
          color: var(--neon-cyan);
        }

        .term-line.system {
          color: var(--text-muted);
        }

        .term-line.success {
          color: var(--neon-green);
        }

        .term-line.error {
          color: var(--neon-magenta);
        }

        .terminal-form {
          display: flex;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.8rem;
          align-items: center;
        }

        .term-prompt {
          color: var(--neon-cyan);
          font-size: 0.8rem;
          margin-right: 0.5rem;
          user-select: none;
        }

        .term-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--neon-green);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8rem;
        }

        .term-actions-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .terminal-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.8rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 0.8rem;
        }

        .term-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(0, 240, 255, 0.2);
          color: var(--neon-cyan);
          padding: 0.3rem 0.6rem;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .term-btn:hover {
          background: rgba(0, 240, 255, 0.08);
          border-color: var(--neon-cyan);
          box-shadow: 0 0 8px rgba(0, 240, 255, 0.2);
        }

        /* About Section */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .about-text p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          text-align: justify;
        }

        .education-card {
          border-color: rgba(0, 255, 102, 0.15);
        }

        .education-card::before {
          background: linear-gradient(90deg, var(--neon-green), transparent);
        }

        .edu-item {
          border-left: 2px solid rgba(0, 255, 102, 0.2);
          padding-left: 1.5rem;
          margin-left: 0.5rem;
          position: relative;
        }

        .edu-item::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 8px;
          width: 10px;
          height: 10px;
          background-color: var(--bg-black);
          border: 2px solid var(--neon-green);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--neon-green);
        }

        .edu-degree {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.05rem;
          color: var(--text-main);
          margin-bottom: 0.4rem;
        }

        .edu-college {
          font-size: 0.85rem;
          color: var(--neon-green);
          margin-bottom: 0.2rem;
        }

        .edu-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.8rem;
        }

        /* Siemens Scholar Badge */
        .scholar-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(0, 255, 102, 0.04);
          border: 1px solid rgba(0, 255, 102, 0.2);
          border-radius: 4px;
          padding: 1rem;
          margin-top: 1.5rem;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .scholar-badge:hover {
          border-color: var(--neon-green);
          box-shadow: 0 0 15px rgba(0, 255, 102, 0.15);
        }

        .scholar-icon {
          width: 36px;
          height: 36px;
          background: rgba(0, 255, 102, 0.1);
          border: 1px solid var(--neon-green);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: var(--neon-green);
          box-shadow: 0 0 8px rgba(0, 255, 102, 0.2);
          animation: pulseGreen 2s infinite;
        }

        .scholar-info h4 {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          color: var(--neon-green);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .scholar-info p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .scholar-overlay-info {
          font-size: 0.7rem;
          color: var(--neon-green);
          margin-top: 0.5rem !important;
          border-top: 1px dashed rgba(0, 255, 102, 0.2);
          padding-top: 0.5rem;
          animation: fadeIn 0.3s ease-in-out;
        }

        /* Skills Section */
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .skill-category-card {
          min-height: 250px;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 1rem;
        }

        .skill-tag {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-muted);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: default;
          transition: all 0.3s ease;
          position: relative;
        }

        .skill-tag:hover {
          color: var(--neon-cyan);
          border-color: var(--neon-cyan);
          background: rgba(0, 240, 255, 0.04);
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
        }

        /* Projects Section */
        .projects-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .project-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--neon-cyan);
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .project-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          color: var(--text-main);
          margin-bottom: 0.8rem;
        }

        .project-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.2rem;
          min-height: 90px;
          text-align: justify;
        }

        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .proj-tag {
          font-size: 0.7rem;
          background: rgba(0, 240, 255, 0.05);
          border: 1px solid rgba(0, 240, 255, 0.2);
          color: var(--neon-cyan);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
        }

        .project-links {
          display: flex;
          gap: 1rem;
        }

        .project-links .btn {
          padding: 0.6rem 1.2rem;
          font-size: 0.75rem;
        }

        /* Experience Timeline */
        .timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding-left: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          height: 100%;
          width: 2px;
          background: linear-gradient(to bottom, var(--neon-cyan), var(--neon-green), transparent);
          box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
        }

        .timeline-node {
          position: relative;
          margin-bottom: 3rem;
        }

        .timeline-node::before {
          content: '';
          position: absolute;
          left: -32px;
          top: 15px;
          width: 14px;
          height: 14px;
          background-color: var(--bg-black);
          border: 3px solid var(--neon-cyan);
          border-radius: 50%;
          z-index: 2;
          box-shadow: 0 0 8px var(--neon-cyan);
          transition: all 0.3s ease;
        }

        .timeline-node:hover::before {
          background-color: var(--neon-cyan);
          transform: scale(1.2);
        }

        .timeline-node.green-node::before {
          border-color: var(--neon-green);
          box-shadow: 0 0 8px var(--neon-green);
        }

        .timeline-node.green-node:hover::before {
          background-color: var(--neon-green);
        }

        .time-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: bold;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.3);
          color: var(--neon-cyan);
          padding: 0.2rem 0.6rem;
          border-radius: 3px;
          margin-bottom: 0.6rem;
        }

        .timeline-node.green-node .time-badge {
          background: rgba(0, 255, 102, 0.08);
          border-color: rgba(0, 255, 102, 0.3);
          color: var(--neon-green);
        }

        .exp-role {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.15rem;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }

        .exp-company {
          font-size: 0.85rem;
          color: var(--neon-cyan);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .timeline-node.green-node .exp-company {
          color: var(--neon-green);
        }

        .exp-bullets {
          list-style: none;
        }

        .exp-bullet {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
          padding-left: 1.2rem;
          position: relative;
          text-align: justify;
        }

        .exp-bullet::before {
          content: '>';
          position: absolute;
          left: 0;
          color: var(--neon-cyan);
        }

        .timeline-node.green-node .exp-bullet::before {
          color: var(--neon-green);
        }

        /* Achievements Section */
        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .ach-card {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .ach-icon-container {
          width: 45px;
          height: 45px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 1.2rem;
          color: var(--neon-cyan);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .ach-card:nth-child(2) .ach-icon-container {
          color: var(--neon-green);
          border-color: rgba(0, 255, 102, 0.2);
        }

        .ach-card:nth-child(3) .ach-icon-container {
          color: var(--neon-magenta);
          border-color: rgba(255, 0, 85, 0.2);
        }

        .ach-header-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          color: var(--text-main);
          margin-bottom: 0.8rem;
          text-transform: uppercase;
        }

        .ach-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Certifications */
        .certs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .cert-card {
          border-color: rgba(255, 255, 255, 0.08);
        }

        .cert-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          color: var(--neon-green);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .cert-org {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.8rem;
          border-bottom: 1px dashed rgba(255,255,255,0.05);
          padding-bottom: 0.6rem;
        }

        .cert-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Contact Section */
        .contact-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .contact-card {
          border-color: rgba(0, 240, 255, 0.15);
        }

        .contact-instruction {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 1.8rem;
        }

        .contact-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 0.8rem 1.2rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .contact-row:hover {
          background: rgba(0, 240, 255, 0.02);
          border-color: rgba(0, 240, 255, 0.25);
        }

        .contact-label-wrapper {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .contact-type-label {
          font-size: 0.75rem;
          color: var(--neon-cyan);
          font-weight: bold;
          text-transform: uppercase;
          width: 80px;
        }

        .contact-value {
          font-size: 0.85rem;
          color: var(--text-main);
          word-break: break-all;
        }

        .copy-btn {
          font-family: 'JetBrains Mono', monospace;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.3);
          color: var(--neon-cyan);
          padding: 0.3rem 0.6rem;
          border-radius: 3px;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          background: var(--neon-cyan);
          color: #000;
          box-shadow: 0 0 10px var(--neon-cyan);
        }

        /* Toast Popup notification */
        .toast-popup {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background-color: var(--bg-card);
          border: 1px solid var(--neon-green);
          box-shadow: 0 0 15px rgba(0, 255, 102, 0.25);
          border-radius: 4px;
          padding: 1rem 1.5rem;
          z-index: 10000;
          font-size: 0.8rem;
          color: var(--neon-green);
          display: flex;
          align-items: center;
          gap: 0.8rem;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .toast-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background-color: var(--neon-green);
          width: 100%;
          animation: progressTimer 3s linear forwards;
        }

        /* Footer */
        footer {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          border-top: 1px dashed rgba(255,255,255,0.05);
          margin-top: 3rem;
        }

        footer span {
          color: var(--neon-cyan);
        }

        /* Keyframes */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 8px rgba(0, 255, 102, 0.2); }
          50% { box-shadow: 0 0 16px rgba(0, 255, 102, 0.6); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(120%) translateY(0);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }

        @keyframes progressTimer {
          from { width: 100%; }
          to { width: 0%; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-section {
            grid-template-columns: 1fr;
            min-height: auto;
            gap: 3rem;
            padding-top: 4rem;
          }
          .about-grid {
            grid-template-columns: 1fr;
          }
          .skills-grid {
            grid-template-columns: 1fr;
          }
          .projects-grid {
            grid-template-columns: 1fr;
          }
          .certs-grid {
            grid-template-columns: 1fr;
          }
          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-header {
            padding: 0 1rem;
          }
          .nav-links {
            display: none; /* Can fall back to auto overflow or mobile navigation toggle */
          }
          .hero-name {
            font-size: 2.8rem;
          }
          .system-status {
            font-size: 0.7rem;
          }
          section {
            padding: 3rem 1rem;
          }
        }
      `}</style>

      {/* Screen CRT Effect elements */}
      <div className="scanline"></div>
      <div className="scanline-bar"></div>

      {/* Sticky Header */}
      <header className="nav-header">
        <a href="#hero" className="nav-brand">
          LIKHITH<span>.T</span>
        </a>
        <nav>
          <ul className="nav-links">
            <li className={`nav-item ${activeSection === 'hero' ? 'active' : ''}`}>
              <a href="#hero">Hero</a>
            </li>
            <li className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}>
              <a href="#about">About</a>
            </li>
            <li className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`}>
              <a href="#skills">Skills</a>
            </li>
            <li className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}>
              <a href="#projects">Projects</a>
            </li>
            <li className={`nav-item ${activeSection === 'experience' ? 'active' : ''}`}>
              <a href="#experience">Experience</a>
            </li>
            <li className={`nav-item ${activeSection === 'achievements' ? 'active' : ''}`}>
              <a href="#achievements">Achievements</a>
            </li>
            <li className={`nav-item ${activeSection === 'certifications' ? 'active' : ''}`}>
              <a href="#certifications">Certs</a>
            </li>
            <li className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div className="system-status">
          <div className="status-dot"></div>
          <span>SYS_ON | {systemTime}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* HERO SECTION */}
        <section id="hero" className="hero-section">
          <div className="hero-canvas-container">
            <canvas ref={canvasRef}></canvas>
          </div>

          <div className="hero-left">
            <div className="hero-tag">SYS_STATUS: RUNNING</div>
            <h1 className="hero-name">
              I'm <span>Likhith T</span>
            </h1>
            <h2 className="hero-title-type">
              &gt; <span className="type-container">{taglineText}</span>
              <span className="cursor"></span>
            </h2>
            <div className="hero-cta">
              <a href="#contact" className="btn btn-primary">
                &gt; Initialize Contact
              </a>
              <a href="#projects" className="btn btn-secondary">
                &gt; Inspect Projects
              </a>
            </div>
          </div>

          <div className="hero-right">
            <div className="term-card interactive-terminal">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">interactive_console.sh</div>
              </div>
              <div className="term-body">
                <div className="terminal-display">
                  {terminalHistory.map((line, idx) => (
                    <div key={idx} className={`term-line ${line.type}`}>
                      {line.text}
                    </div>
                  ))}
                  <div ref={terminalBottomRef}></div>
                </div>
                <form onSubmit={handleTerminalSubmit} className="terminal-form">
                  <span className="term-prompt">LikhithOS:~#</span>
                  <input
                    ref={terminalInputRef}
                    type="text"
                    className="term-input"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Type help..."
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </form>
                <div className="terminal-buttons">
                  <div className="term-actions-title">Quick Queries:</div>
                  <button type="button" className="term-btn" onClick={() => triggerCommand('about')}>cat about.txt</button>
                  <button type="button" className="term-btn" onClick={() => triggerCommand('skills')}>cat skills.db</button>
                  <button type="button" className="term-btn" onClick={() => triggerCommand('experience')}>cat experience.log</button>
                  <button type="button" className="term-btn" onClick={() => triggerCommand('achievements')}>cat achievements.dat</button>
                  <button type="button" className="term-btn" onClick={() => triggerCommand('certifications')}>cat certs.bin</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_01</span>
            <h2 className="section-title">About Me</h2>
            <div className="section-line"></div>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p>
                Computer Science Engineering undergraduate with a strong foundation in software development and Data Structures and Algorithms. 
                Passionate about building scalable and user-centric web applications, with a growing focus on full stack development using modern technologies. 
                Skilled in Python, JavaScript, and database management, with a keen interest in solving real-world problems through efficient and innovative solutions.
              </p>
              
              <div 
                className="scholar-badge"
                onMouseEnter={() => setScholarBadgeHover(true)}
                onMouseLeave={() => setScholarBadgeHover(false)}
              >
                <div className="scholar-icon">🛡️</div>
                <div className="scholar-info">
                  <h4>Siemens Scholar Badge</h4>
                  <p>National recognition for engineering excellence</p>
                  {scholarBadgeHover && (
                    <p className="scholar-overlay-info">
                      &gt; Recognized as a Top 300 Scholar from a pool of 7,000+ applicants (Top 4.3%).
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="term-card education-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">education_credentials.env</div>
              </div>
              <div className="term-body">
                <div className="edu-item">
                  <h3 className="edu-degree">Bachelor of Engineering</h3>
                  <div className="edu-college">Computer Science and Engineering</div>
                  <div className="edu-date">Government Engineering College, Hassan</div>
                  <div className="edu-date">&gt; Expected May 2027</div>
                  <div className="edu-date" style={{ color: 'var(--neon-green)' }}>&gt; Siemens Scholar Selection</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_02</span>
            <h2 className="section-title">Technical Matrix</h2>
            <div className="section-line"></div>
          </div>
          <div className="skills-grid">
            
            {/* Languages */}
            <div className="term-card skill-category-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">languages.config</div>
              </div>
              <div className="term-body">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Core programming and scripting languages:
                </p>
                <div className="skills-list">
                  <span className="skill-tag" style={{ '--delay': '50ms' }}>Python (DSA)</span>
                  <span className="skill-tag" style={{ '--delay': '100ms' }}>JavaScript</span>
                  <span className="skill-tag" style={{ '--delay': '150ms' }}>C</span>
                </div>
              </div>
            </div>

            {/* Web Technologies */}
            <div className="term-card skill-category-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">web_ecosystem.json</div>
              </div>
              <div className="term-body">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Full-stack frameworks and markup:
                </p>
                <div className="skills-list">
                  <span className="skill-tag" style={{ '--delay': '50ms' }}>React.js</span>
                  <span className="skill-tag" style={{ '--delay': '100ms' }}>Express.js</span>
                  <span className="skill-tag" style={{ '--delay': '150ms' }}>MERN Stack Fundamentals</span>
                  <span className="skill-tag" style={{ '--delay': '200ms' }}>HTML5</span>
                  <span className="skill-tag" style={{ '--delay': '250ms' }}>CSS3</span>
                </div>
              </div>
            </div>

            {/* Tools & Platforms */}
            <div className="term-card skill-category-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">tools_env.yaml</div>
              </div>
              <div className="term-body">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Environments, databases, and CAD software:
                </p>
                <div className="skills-list">
                  <span className="skill-tag" style={{ '--delay': '50ms' }}>Git</span>
                  <span className="skill-tag" style={{ '--delay': '100ms' }}>VS Code</span>
                  <span className="skill-tag" style={{ '--delay': '150ms' }}>MySQL</span>
                  <span className="skill-tag" style={{ '--delay': '200ms' }}>Postman</span>
                  <span className="skill-tag" style={{ '--delay': '250ms' }}>Solid Edge</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_03</span>
            <h2 className="section-title">Projects Directory</h2>
            <div className="section-line"></div>
          </div>
          <div className="projects-grid">
            
            {/* iOS launcher */}
            <div className="term-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">ios_launcher.git</div>
              </div>
              <div className="term-body">
                <div className="project-meta">
                  <span>REACT / FRONTEND</span>
                  <span>2026</span>
                </div>
                <h3 className="project-title">iOS-Inspired Virtual App Launcher</h3>
                <p className="project-desc">
                  Developed a web-based iOS-style application launcher using React.js, focusing on replicating native mobile UI/UX behavior. 
                  Implemented reusable components, efficient state management, and smooth animations to simulate real-time app interactions. 
                  Designed a responsive interface ensuring seamless performance across multiple devices and screen sizes.
                </p>
                <div className="project-tags">
                  <span className="proj-tag">React.js</span>
                  <span className="proj-tag">CSS Animations</span>
                  <span className="proj-tag">Responsive UI</span>
                  <span className="proj-tag">State Sync</span>
                </div>
                <div className="project-links">
                  <a
                    href="https://github.com/LIKHITHT355/reactcli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    ⌥ GitHub
                  </a>
                </div>
              </div>
            </div>

            {/* AgriConnect */}
            <div className="term-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">agri_connect.git</div>
              </div>
              <div className="term-body">
                <div className="project-meta">
                  <span>REACT + SUPABASE / HACKATHON</span>
                  <span>2026</span>
                </div>
                <h3 className="project-title">AgriConnect – Smart Agriculture Platform</h3>
                <p className="project-desc">
                  Built a full-stack web application during a hackathon aimed at bridging the gap between agricultural demand and supply across regions. 
                  The platform addresses real-world challenges by enabling efficient connectivity between farmers and markets, improving resource distribution and 
                  supporting informed decision-making through a user-friendly interface.
                </p>
                <div className="project-tags">
                  <span className="proj-tag">React.js</span>
                  <span className="proj-tag">Supabase</span>
                  <span className="proj-tag">PostgreSQL</span>
                  <span className="proj-tag">Hackathon</span>
                </div>
                <div className="project-links">
                  <a
                    href="https://69dc6b88f73bbf9e0e02099e--roaring-brigadeiros-1d9fbf.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    ⚡ Live Demo
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_04</span>
            <h2 className="section-title">Timeline Subroutine</h2>
            <div className="section-line"></div>
          </div>
          <div className="timeline">
            
            {/* Vault of Codes */}
            <div className="timeline-node">
              <span className="time-badge">1 MONTH DURATION</span>
              <h3 className="exp-role">Frontend Intern</h3>
              <div className="exp-company">Vault of Codes (Remote)</div>
              <ul className="exp-bullets">
                <li className="exp-bullet">
                  Completed an intensive 1-month internship focused on Front-End Development using React.js.
                </li>
                <li className="exp-bullet">
                  Developed responsive user interfaces and managed component states, enhancing the overall user experience.
                </li>
              </ul>
            </div>

            {/* Siemens STA */}
            <div className="timeline-node green-node">
              <span className="time-badge">INDUSTRIAL MECHATRONICS</span>
              <h3 className="exp-role">Mechatronics Intern</h3>
              <div className="exp-company">Siemens Technical Academy (Industrial Automation & Innovation)</div>
              <ul className="exp-bullets">
                <li className="exp-bullet">
                  <strong>Automation Scripting:</strong> Applied PLC Ladder Diagram programming to develop automated control systems for industrial applications.
                </li>
                <li className="exp-bullet">
                  <strong>System Optimization:</strong> Designed and implemented Pneumatics and Hydraulics systems to optimize manufacturing processes.
                </li>
                <li className="exp-bullet">
                  <strong>Technical Troubleshooting:</strong> Applied systematic troubleshooting techniques to debug complex electrical and mechanical issues.
                </li>
                <li className="exp-bullet">
                  Gained hands-on exposure to industrial systems and automation workflows in a practical learning environment.
                </li>
              </ul>
            </div>

            {/* Professional Training */}
            <div className="timeline-node">
              <span className="time-badge">PROFESSIONAL DEVELOPMENT</span>
              <h3 className="exp-role">Corporate Competency Graduate</h3>
              <div className="exp-company">Growth Center & RIPE Consulting Services</div>
              <ul className="exp-bullets">
                <li className="exp-bullet">
                  <strong>Communication Soft Skills:</strong> Trained in effective business communication and interpersonal dynamics to succeed in modern environments.
                </li>
                <li className="exp-bullet">
                  <strong>Creative Problem Solving:</strong> Certified in brainstorming methodologies and innovative thinking processes to approach engineering and design challenges creatively.
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* ACHIEVEMENTS SECTION */}
        <section id="achievements" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_05</span>
            <h2 className="section-title">Verified Honors</h2>
            <div className="section-line"></div>
          </div>
          <div className="achievements-grid">
            
            {/* Siemens */}
            <div className="term-card ach-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">scholarship.inf</div>
              </div>
              <div className="term-body">
                <div className="ach-icon-container">🏆</div>
                <h3 className="ach-header-title">Siemens Scholarship</h3>
                <p className="ach-desc">
                  Recognized as a Top 300 Scholar nationwide from a competitive pool of over 7,000+ applicants, placing in the top 4.3% of applicants.
                </p>
              </div>
            </div>

            {/* Google */}
            <div className="term-card ach-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">ambassador.bin</div>
              </div>
              <div className="term-body">
                <div className="ach-icon-container">🌐</div>
                <h3 className="ach-header-title">Google Student Ambassador</h3>
                <p className="ach-desc">
                  Selected to promote Gemini AI awareness and organize hands-on technical workshops, training students in advanced AI prompting and development.
                </p>
              </div>
            </div>

            {/* The Coding Lab */}
            <div className="term-card ach-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">upcoming_intern.job</div>
              </div>
              <div className="term-body">
                <div className="ach-icon-container">⚡</div>
                <h3 className="ach-header-title">The Coding Lab Intern</h3>
                <p className="ach-desc">
                  Selected for a highly competitive upcoming software developer internship program. Pre-enrolled and scheduled to commence coding projects soon.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certifications" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_06</span>
            <h2 className="section-title">Certifications</h2>
            <div className="section-line"></div>
          </div>
          <div className="certs-grid">
            
            {/* Data science */}
            <div className="term-card cert-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">ds_training.crt</div>
              </div>
              <div className="term-body">
                <h3 className="cert-title">Data Science Workshop</h3>
                <div className="cert-org">Issued by Siemens Technical Academy</div>
                <p className="cert-desc">
                  Completed foundational training in Data Science, gaining practical experience in data analysis methodologies, visualizations, and real-world application models.
                </p>
              </div>
            </div>

            {/* TCS */}
            <div className="term-card cert-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">tcs_yep.crt</div>
              </div>
              <div className="term-body">
                <h3 className="cert-title">Youth Employment Program</h3>
                <div className="cert-org">Issued by TCS (Tata Consultancy Services)</div>
                <p className="cert-desc">
                  Successfully completed job-readiness training covering advanced quantitative aptitude, logical reasoning, and professional corporate communication skills.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="scroll-trigger">
          <div className="section-header">
            <span className="section-code">SEC_07</span>
            <h2 className="section-title">Contact Node</h2>
            <div className="section-line"></div>
          </div>
          <div className="contact-content">
            <div className="term-card contact-card">
              <div className="term-header">
                <div className="term-dots">
                  <div className="term-dot red"></div>
                  <div className="term-dot yellow"></div>
                  <div className="term-dot green"></div>
                </div>
                <div className="term-title">communication_protocol.ini</div>
              </div>
              <div className="term-body">
                <p className="contact-instruction">
                  Execute copy-on-click connection subroutines or use terminal credentials below:
                </p>
                <div className="contact-items">
                  
                  {/* Email */}
                  <div className="contact-row">
                    <div className="contact-label-wrapper">
                      <span className="contact-type-label">Email</span>
                      <span className="contact-value">llikilaki@gmail.com</span>
                    </div>
                    <button 
                      type="button" 
                      className="copy-btn"
                      onClick={() => copyToClipboard('llikilaki@gmail.com', 'Email')}
                    >
                      Copy
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="contact-row">
                    <div className="contact-label-wrapper">
                      <span className="contact-type-label">Phone</span>
                      <span className="contact-value">+91 8310664022</span>
                    </div>
                    <button 
                      type="button" 
                      className="copy-btn"
                      onClick={() => copyToClipboard('+91 8310664022', 'Phone')}
                    >
                      Copy
                    </button>
                  </div>

                  {/* LinkedIn */}
                  <div className="contact-row">
                    <div className="contact-label-wrapper">
                      <span className="contact-type-label">LinkedIn</span>
                      <span className="contact-value">linkedin.com/in/likhith-t-0610472b8</span>
                    </div>
                    <button 
                      type="button" 
                      className="copy-btn"
                      onClick={() => copyToClipboard('https://linkedin.com/in/likhith-t-0610472b8', 'LinkedIn URL')}
                    >
                      Copy Link
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer>
        <p>Likhith T OS Console &copy; 2026. SECURE PORTFOLIO ENGINE. Crafted with <span>React.js</span> &amp; <span>CSS Variables</span>.</p>
      </footer>

      {/* Copy notification Toast */}
      {activeToast && (
        <div className="toast-popup">
          <span>{activeToast}</span>
          <div className="toast-bar"></div>
        </div>
      )}
    </div>
  );
}

export default App;
