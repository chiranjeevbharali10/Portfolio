export const generateBlobPath = (
  centerX: number,
  centerY: number,
  maxRadius: number,
  progress: number,
  time: number
) => {
  if (progress <= 0.001) {
    return `M ${centerX} ${centerY} L ${centerX} ${centerY}`;
  }

  // Use linear progress so GSAP can fully control the acceleration curve
  const easedProgress = progress;
  
  // Base radius grows to cover the screen
  const baseRadius = easedProgress * maxRadius;
  
  // Keep points high (36) so even high irregularity is smooth, not jagged
  const numPoints = 36; 
  const points = [];
  
  // Smooth taper: wobble is 0 at the start (perfect circle), strongest in the 
  // middle, and 0 at the end (perfect circle) so it fills the screen perfectly without gaps.
  const taper = Math.sin(progress * Math.PI); 
  
  // Increased to 22% for "far more irregular" shape
  const wobbleIntensity = maxRadius * 0.22 * taper;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    
    // Higher frequencies for a much more chaotic, irregular cloud
    const wave1 = Math.sin(angle * 4 + time * 5);
    const wave2 = Math.cos(angle * 7 - time * 3.5);
    const wave3 = Math.sin(angle * 11 + time * 2);
    
    const offset = (wave1 * 0.5 + wave2 * 0.35 + wave3 * 0.15);
    
    const r = baseRadius + offset * wobbleIntensity;
    
    points.push({
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r
    });
  }
  
  // Generate smooth closed path using midpoints and quadratic bezier curves
  let d = '';
  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    
    if (i === 0) {
      d = `M ${midX} ${midY}`;
    } else {
      d += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
    }
  }
  
  // Close the loop cleanly
  const pFirst = points[0];
  const pSecond = points[1];
  const midFirst = { x: (pFirst.x + pSecond.x)/2, y: (pFirst.y + pSecond.y)/2 };
  d += ` Q ${pFirst.x} ${pFirst.y} ${midFirst.x} ${midFirst.y} Z`;
  
  return d;
};
