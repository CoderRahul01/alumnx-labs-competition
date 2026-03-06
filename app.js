/**
 * Alumnx AI Labs - 2026 Booth Roulette Application
 * Logic for spinning wheel, persistence, and celebrations.
 */

class RouletteApp {
  constructor() {
    // State
    this.participants = [];
    this.winners = [];
    this.currentRound = parseInt(localStorage.getItem("alumnx_round")) || 1;

    this.isSpinning = false;
    this.currentRotation = 0;
    this.sheetUrl = 'https://script.google.com/macros/s/AKfycbxUszPl501TehbHTVez-LkO11K8ROk69-9fkqKt5r-yyU1o-rN7aRzF5zk2bKtJoM20Vg/exec';
 
    this.currentWinner = null;
    this.pixelRatio = window.devicePixelRatio || 1;
        
    // Persistent Storage initialization
    localStorage.removeItem('alumnx_participants'); // Force clear mock data
    localStorage.removeItem('alumnx_winners');      // Force clear mock data
    
    this.loadState();
    this.canvas = document.getElementById("wheel-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    this.colors = [
      "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", 
      "#F3FF33", "#FF8333", "#33FF83", "#8333FF", "#FF3383",
      "#3383FF", "#83FF33", "#FFC300", "#581845", "#900C3F",
      "#C70039", "#FF5733", "#FFBD33", "#75FF33", "#33FFBD",
      "#3375FF", "#BD33FF"
    ];

    this.initEventListeners();
    this.updateUI();
    this.renderWheel();
    this.startSync();
    
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  initEventListeners() {
    document.getElementById("spin-button").addEventListener("click", () => this.spin());
    document.getElementById("add-manual").addEventListener("click", () => this.addManualEntry());
    document.getElementById("settings-toggle").addEventListener("click", () => this.toggleModal("settings-modal", true));
    
    const closeModal = document.querySelector(".close-modal");
    if (closeModal) {
      closeModal.addEventListener("click", () => this.toggleModal("settings-modal", false));
    }

    document.getElementById("reset-data").addEventListener("click", () => this.resetData());
    document.getElementById("fullscreen-toggle").addEventListener("click", () => this.toggleFullscreen());
    
    // Dismiss Winner Modal
    const dismissBtn = document.querySelector(".dismiss-overlay");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        const modal = document.getElementById("winner-modal");
        if (modal) {
          modal.classList.remove("active");
          setTimeout(() => modal.classList.add("hidden"), 600);
        }
        document.body.style.overflow = "auto";
        
        // Auto-increment Round for next draw
        this.nextRound();
      });
    }
  }

  // --- Core Logic ---

  async fetchData() {
    if (this.isSpinning) return;
    try {
      const response = await fetch(this.sheetUrl);
      const csvText = await response.text();
      this.processCSV(csvText);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  }

  processCSV(csvText) {
    if (!csvText || csvText.length < 5) {
        console.warn("Received empty or invalid CSV data");
        return;
    }
    
    // Split rows and filter empty ones
    const rows = csvText.split('\n').filter(r => r.trim());
    if (rows.length <= 1) {
        console.info("Sheet is empty (only header or nothing).");
        return;
    }

    const dataRows = rows.slice(1); // Skip header
    let addedCount = 0;
        
    dataRows.forEach((row, index) => {
        // Robust CSV split that respects quotes (regex for CSV parsing)
        const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!cols || cols.length < 2) {
            // Fallback for simple split if regex fails
            const simpleCols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ""));
            if (simpleCols.length < 2) return;
            this.processRow(simpleCols);
        } else {
            const cleanedCols = cols.map(c => c.trim().replace(/^"|"$/g, ""));
            this.processRow(cleanedCols);
        }
        addedCount++;
    });
        
    if (addedCount > 0) {
        console.log(`Synced ${addedCount} entries from sheet.`);
    }
  }

  processRow(cols) {
    const name = cols[1]; // B: Full Name
    const handle = cols[2]; // C: LinkedIn Handle
    const role = cols[4]; // E: Role
    const program = cols[5]; // F: College/Org
    const postUrl = cols[6]; // G: Post URL
        
    if (name) {
        this.addParticipant(name, handle, role, program, true, postUrl);
    }
  }

  addParticipant(name, handle, role = '', program = '', fromSync = false, postUrl = '') {
    if (!name) return;
        
    if (this.participants.find(p => p.name === name && p.handle === handle)) return;

    const entry = {
      id: Date.now(),
      name: name,
      handle: handle || "anonymous",
      role: role,
      program: program,
      postUrl: postUrl,
      timestamp: new Date().toISOString(),
      pfp: handle
        ? `https://unavatar.io/linkedin/${handle.replace("@", "")}`
        : null,
    };
    this.participants.unshift(entry);
    this.saveState();
    this.updateUI();
    this.renderWheel();
        
    if (fromSync) {
      this.playArrivalEffect();
    }
  }

  showWinner(winner) {
    const modal = document.getElementById("winner-modal");
    const nameEl = document.getElementById("winner-name-modal");
    const handleEl = document.getElementById("winner-handle-modal");
    const avatarEl = document.getElementById("winner-avatar");

    // Clear previous classes
    if (nameEl) nameEl.innerHTML = "";

    // Build Name with Badge if Promoter
    const nameText = document.createElement("span");
    nameText.textContent = winner.name;
    if (nameEl) {
        nameEl.appendChild(nameText);
        if (winner.postUrl) {
            const badge = document.createElement("span");
            badge.className = "promoter-badge";
            badge.style.cssText = "font-size: 1.2rem; padding: 6px 16px; margin-left: 20px; vertical-align: middle;";
            badge.textContent = "PROMOTER";
            nameEl.appendChild(badge);
        }
    }

    if (handleEl) handleEl.textContent = winner.handle || "@participant";
    if (avatarEl && winner.pfp) {
        avatarEl.src = winner.pfp;
    }

    // Delay for suspense
    setTimeout(() => {
        if (modal) {
            modal.classList.remove("hidden");
            // Force reflow
            modal.offsetHeight;
            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }, 800);
  }

  celebrateWinner(winner) {
    this.winners.unshift(winner);
    this.saveState();
    this.updateUI();

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 40, spread: 360, ticks: 100, zIndex: 2000 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    this.showWinner(winner);
  }

  spin() {
    if (this.isSpinning || this.participants.length < 2) {
      if (this.participants.length < 2) alert("Add at least 2 participants!");
      return;
    }

    this.isSpinning = true;
    const extraSpins = 5 + Math.random() * 5;
    const totalRotation = extraSpins * 360 + Math.random() * 360;

    const startTime = performance.now();
    const duration = 5000; // Increased to 5s for dramatic effect

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentStepRotation = totalRotation * ease;

      this.currentRotation = (currentStepRotation % 360);
      this.renderWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.determineWinner();
      }
    };

    requestAnimationFrame(animate);
  }

  determineWinner() {
    const sliceAngle = 360 / this.participants.length;
    const normalizedRotation = (360 - (this.currentRotation % 360)) % 360;
    const winningAngle = (normalizedRotation + 270) % 360;
    const winnerIndex = Math.floor(winningAngle / sliceAngle);
    
    const winner = this.participants[winnerIndex];
    if (winner) {
      this.celebrateWinner({ ...winner, round: this.currentRound });
    }
  }

  renderWheel() {
    const { ctx, canvas, participants } = this;
    const width = canvas.width / this.pixelRatio;
    const height = canvas.height / this.pixelRatio;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (participants.length === 0) {
        this.drawEmptyState(centerX, centerY, radius);
        return;
    }

    const sliceAngle = (2 * Math.PI) / participants.length;
    const rotationRad = (this.currentRotation * Math.PI) / 180;

    participants.forEach((p, i) => {
        const startAngle = i * sliceAngle + rotationRad;
        const endAngle = (i + 1) * sliceAngle + rotationRad;
        
        // Vibrant flat colors for the 'Game Show' look
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = this.colors[i % this.colors.length];
        ctx.fill();

        // Stroke for slice separation
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        
        // Dynamic Font Scaling based on participant count
        const baseFontSize = radius / 12;
        const scaleFactor = Math.max(0.4, 1 - (participants.length / 60));
        const fontSize = Math.max(10, baseFontSize * scaleFactor);
        
        ctx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        
        const displayName = p.name.length > 20 ? p.name.substring(0, 17) + '...' : p.name;
        ctx.fillText(displayName, radius - 40, fontSize / 3);
        ctx.restore();

        const pointerPos = 3 * Math.PI / 2; 
        const relativeAngle = (startAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        if (this.isSpinning && Math.abs(relativeAngle - pointerPos) < 0.15) {
            this.throttleTick();
        }
    });

    this.drawHub(centerX, centerY, radius);
  }

  drawHub(centerX, centerY, radius) {
    const { ctx } = this;
    ctx.save();
    
    // Outer shadow rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, 65, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // The 'SPIN' Circle Button
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, 2 * Math.PI);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center indicator (Top pointer attached to hub)
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - 45);
    ctx.lineTo(centerX + 15, centerY - 45);
    ctx.lineTo(centerX, centerY - 70);
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // "Spin" Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px "Outfit"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Spin', centerX, centerY);
    
    ctx.restore();
  }

  drawEmptyState(centerX, centerY, radius) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '20px "Outfit"';
    ctx.textAlign = 'center';
    ctx.fillText('Waiting for participants...', centerX, centerY);
  }

  throttleTick() {
    const now = Date.now();
    if (now - (this.lastTick || 0) > 50) {
        this.lastTick = now;
        const pointer = document.querySelector('.wheel-pointer');
        if (pointer) {
            pointer.style.transform = 'rotate(-12deg) scale(1.1)';
            setTimeout(() => pointer.style.transform = 'rotate(0deg) scale(1)', 50);
        }
    }
  }

  updateUI() {
    const entriesCountEl = document.getElementById("entries-count");
    if (entriesCountEl) entriesCountEl.textContent = this.participants.length;
    
    const roundEl = document.getElementById("current-round");
    if (roundEl) roundEl.textContent = this.currentRound;

    // LEFT: Attendance List
    const entriesList = document.getElementById("entries-list");
    if (entriesList) {
        entriesList.innerHTML = this.participants.length ? "" : '<div class="placeholder-text">Wait for attendees...</div>';
        // Show more entries in the expanded layout
        this.participants.slice(0, 10).forEach((p) => {
            const div = document.createElement("div");
            div.className = `entry-item ${p.postUrl ? 'promoter' : ''}`;
            const shortName = p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name;
            div.innerHTML = `
                <img class="entry-avatar" src="${p.pfp || 'https://unavatar.io/placeholder'}" alt="${p.name}">
                <div class="entry-details">
                    <span class="entry-name" title="${p.name}">${shortName} ${p.postUrl ? '<span class="promoter-badge">PROMOTER</span>' : ''}</span>
                    <span class="entry-handle">${p.handle}</span>
                </div>
            `;
            entriesList.appendChild(div);
        });
    }

    // RIGHT: Champions List (Grouped by Round)
    const winnersList = document.getElementById("winners-list");
    if (winnersList) {
        winnersList.innerHTML = this.winners.length ? "" : '<div class="placeholder-text">No winners yet.</div>';
        this.winners.slice(0, 10).forEach((w) => {
            const div = document.createElement("div");
            div.className = "entry-item";
            div.style.borderLeft = "4px solid var(--accent-gold)";
            div.innerHTML = `
                <img class="entry-avatar" src="${w.pfp || 'https://unavatar.io/placeholder'}" alt="${w.name}">
                <div class="entry-details">
                    <span class="entry-name">${w.name}</span>
                    <span class="entry-handle">Winner • Round ${w.round}</span>
                </div>
            `;
            winnersList.appendChild(div);
        });
    }
  }

  loadState() {
    const savedParticipants = localStorage.getItem("alumnx_participants");
    const savedWinners = localStorage.getItem("alumnx_winners");
    if (savedParticipants) this.participants = JSON.parse(savedParticipants);
    if (savedWinners) this.winners = JSON.parse(savedWinners);
  }

  saveState() {
    localStorage.setItem("alumnx_participants", JSON.stringify(this.participants));
    localStorage.setItem("alumnx_winners", JSON.stringify(this.winners));
    localStorage.setItem("alumnx_round", this.currentRound);
  }

  nextRound() {
    this.currentRound++;
    this.saveState();
    
    // Animate Round counter
    const roundEl = document.getElementById("current-round");
    if (roundEl) {
        roundEl.classList.remove("pulse-update");
        void roundEl.offsetWidth; // Trigger reflow
        roundEl.classList.add("pulse-update");
        roundEl.textContent = this.currentRound;
    }
    
    // Optional: Refresh entries list or clear current spin state
    this.updateUI();
  }

  startSync() {
    this.fetchData();
    setInterval(() => this.fetchData(), 15000);
  }

  playArrivalEffect() {
    const badge = document.getElementById("entries-count");
    if (!badge) return;
    badge.style.transform = "scale(1.5)";
    badge.style.color = "#00a3ff";
    setTimeout(() => {
      badge.style.transform = "scale(1)";
      badge.style.color = "#fff";
    }, 500);
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const size = Math.min(parent.clientWidth, parent.clientHeight);
    this.canvas.width = size * this.pixelRatio;
    this.canvas.height = size * this.pixelRatio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    this.renderWheel();
  }

  addManualEntry() {
    const nameInput = document.getElementById("manual-name");
    const handleInput = document.getElementById("manual-handle");
    const postInput = document.getElementById("manual-post");
    if (nameInput && nameInput.value) {
      this.addParticipant(nameInput.value, handleInput.value, '', '', false, postInput ? postInput.value : '');
      nameInput.value = "";
      handleInput.value = "";
      if (postInput) postInput.value = "";
    }
  }

  toggleModal(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !show);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  resetData() {
    if (confirm("Clear all winners and attendees?")) {
      localStorage.clear();
      location.reload();
    }
  }
}

const app = new RouletteApp();
