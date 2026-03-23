/* ============================================
   Draggable Nodes + Real-time SVG Connections
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('connections-svg');
  const canvas = document.getElementById('canvas');
  const nodes = document.querySelectorAll('[data-node]');

  // ─── Connection definitions ──────────────────────
  const connections = [
    ["node-3d",   "right", "node-img2", "left"],
    ["node-img1", "right", "node-img2", "left"],
    ["node-img3", "right", "node-img2", "left"],
    ["node-img2", "right", "node-video", "left"],
    ["node-text", "right", "node-video", "left"]
  ];

  // ─── Port position calculator ────────────────────
  function getPortPosition(nodeId, side) {
    const node = document.getElementById(nodeId);
    if (!node) return { x: 0, y: 0 };

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    if (side === 'left') {
      return {
        x: nodeRect.left - canvasRect.left,
        y: nodeRect.top  - canvasRect.top + nodeRect.height / 2
      };
    } else {
      return {
        x: nodeRect.right - canvasRect.left,
        y: nodeRect.top   - canvasRect.top + nodeRect.height / 2
      };
    }
  }

  // ─── Bezier curve path generator ─────────────────
  function createCurvePath(from, to) {
    const dx = Math.abs(to.x - from.x);
    const controlOffset = Math.max(dx * 0.4, 50);
    return `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${to.x - controlOffset} ${to.y}, ${to.x} ${to.y}`;
  }

  // ─── Draw / redraw all connections ───────────────
  function drawConnections() {
    svg.querySelectorAll('.connection-line').forEach(p => p.remove());

    connections.forEach(([fromId, fromSide, toId, toSide], i) => {
      const from = getPortPosition(fromId, fromSide);
      const to   = getPortPosition(toId,   toSide);
      if (!from.x && !from.y) return;
      if (!to.x   && !to.y)   return;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', createCurvePath(from, to));
      path.classList.add('connection-line');
      path.classList.add('connection-line-animated');
      svg.appendChild(path);
    });
  }

  // ─── Drag-and-drop system ────────────────────────
  let activeNode  = null;
  let startX      = 0;
  let startY      = 0;
  let origLeft    = 0;
  let origTop     = 0;

  function initNodePositions() {
    const canvasRect = canvas.getBoundingClientRect();

    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      const left = rect.left - canvasRect.left;
      const top  = rect.top  - canvasRect.top;

      node.style.left  = left + 'px';
      node.style.top   = top  + 'px';
      node.style.right = 'auto';
    });
  }

  function onPointerDown(e) {
    const node = e.target.closest('[data-node]');
    if (!node) return;

    activeNode = node;
    activeNode.style.zIndex = 10;
    activeNode.style.cursor = 'grabbing';
    activeNode.classList.add('dragging');

    startX  = e.clientX;
    startY  = e.clientY;
    origLeft = parseFloat(node.style.left) || 0;
    origTop  = parseFloat(node.style.top)  || 0;

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!activeNode) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = origLeft + dx;
    let newTop  = origTop  + dy;

    // ─── Clamp to canvas bounds ────────────────────
    const canvasPadding = 0; // allow edge-to-edge
    const canvasW = canvas.clientWidth;
    const canvasH = canvas.clientHeight;
    const nodeW   = activeNode.offsetWidth;
    const nodeH   = activeNode.offsetHeight;

    const minLeft = canvasPadding;
    const maxLeft = canvasW - nodeW - canvasPadding;
    const minTop  = canvasPadding;
    const maxTop  = canvasH - nodeH - canvasPadding;

    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop  = Math.max(minTop,  Math.min(newTop,  maxTop));

    activeNode.style.left = newLeft + 'px';
    activeNode.style.top  = newTop  + 'px';

    drawConnections();
  }

  function onPointerUp() {
    if (!activeNode) return;

    activeNode.style.zIndex = activeNode.id === 'node-text' ? 3 : 2;
    activeNode.style.cursor = 'grab';
    activeNode.classList.remove('dragging');
    activeNode = null;
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup',   onPointerUp);

  // ─── Initialise ──────────────────────────────────
  setTimeout(() => {
    initNodePositions();
    drawConnections();
  }, 300);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initNodePositions();
      drawConnections();
    }, 150);
  });

  // ─── Hero text entrance animation ────────────────
  const heroTitle    = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');

  if (heroTitle) {
    heroTitle.style.opacity    = '0';
    heroTitle.style.transform  = 'translateY(20px)';
    heroTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    setTimeout(() => {
      heroTitle.style.opacity   = '1';
      heroTitle.style.transform = 'translateY(0)';
    }, 100);
  }

  if (heroSubtitle) {
    heroSubtitle.style.opacity    = '0';
    heroSubtitle.style.transform  = 'translateY(16px)';
    heroSubtitle.style.transition = 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s';
    setTimeout(() => {
      heroSubtitle.style.opacity   = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 100);
  }

  // ─── Footer Interactive Gradient ─────────────────
  const footer = document.querySelector('.footer');
  if (footer) {
    footer.addEventListener('mousemove', (e) => {
      const rect = footer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      footer.style.setProperty('--mouse-x', `${x}%`);
      footer.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  // ─── Campaigns Hover Flipbook ──────────────────
  const flipbooks = document.querySelectorAll('.campaign-flipbook');
  flipbooks.forEach(fb => {
    const images = fb.querySelectorAll('img');
    if(images.length === 0) return;
    let interval;
    let currentIndex = 0;
    
    fb.addEventListener('mouseenter', () => {
      interval = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
      }, 300); // flip every 300ms
    });
    
    fb.addEventListener('mouseleave', () => {
      clearInterval(interval);
      images[currentIndex].classList.remove('active');
      currentIndex = 0;
      images[currentIndex].classList.add('active');
    });
  });


  // ─── Portfolio 3D Hover Effect ──────────────────
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  portfolioItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX; 
      const deltaY = (y - centerY) / centerY;
      
      item.style.transform = `translate(${deltaX * 8}px, ${deltaY * 8}px) scale(1.02)`;
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0px, 0px) scale(1)';
      item.style.transition = 'transform 0.3s ease-out';
    });
    
    item.addEventListener('mouseenter', () => {
      item.style.transition = 'transform 0.05s linear';
    });
  });

});

// ─── Auto Scroll-To-Top ─────────────────────────
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// ─── Robust 3D Mobile Orientation Tilt ─────────
function initMobileTilt() {
  const card = document.querySelector('.mobile-hero-card img');
  if (!card) return;

  let permissionGranted = false;

  const handleOrientation = (e) => {
    if (!e.beta || !e.gamma) return;
    
    // Smooth normalization
    // beta: -180 to 180 (pitch), gamma: -90 to 90 (roll)
    // Most users hold phone at roughly 45-70 degrees beta
    const baseBeta = 60;
    const rotateX = Math.max(-20, Math.min(20, (e.beta - baseBeta) / 1.5));
    const rotateY = Math.max(-20, Math.min(20, e.gamma / 1.5));

    card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const startSensors = () => {
    if (permissionGranted) return;
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS / Safari
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            permissionGranted = true;
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(err => console.warn("Motion permission denied or blocked."));
    } else {
      // Android / Chrome (Non-permission browsers)
      permissionGranted = true;
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  // Listen on any interaction to trigger the permission prompt
  window.addEventListener('click', startSensors, { once: true });
  window.addEventListener('touchstart', startSensors, { once: true });
}

document.addEventListener('DOMContentLoaded', initMobileTilt);
