let xStartModified = null;
let yStartModified = null;
let xEndModified = null;
let yEndModified = null;
let clickTime;



function animateRect(time, timeMapper, xStart, xEnd, yStart, yEnd) {
  let timeElapsed = (timeRunning - timeMapper) / 1000
  

  const longerSide = xEnd - xStart
  const shorterSide = yEnd - yStart

  const rectCircum = 2 * longerSide + 2 * shorterSide
  const timePerLongerSide = longerSide / rectCircum * time
  const timePerShorterSide = shorterSide / rectCircum * time
  

  colorMode(HSB)
  hueCol = map(timeElapsed, 0, time, 125, 0)
  stroke(hueCol, 100, 100)
  colorMode(RGB)
  strokeWeight(3)

    if (xStartModified < xEnd || xStartModified === null) {
    xStartModified = map(timeElapsed, 0, timePerLongerSide, xStart, xEnd)
  } else {
    xStartModified = xEnd
  }
  
  if (xStartModified > 2000) {
    xStartModified = null;
  }

  line(xStart, yStart, xStartModified, yStart)


  if (yStartModified < yEnd || yStartModified === null) {
    if (xStartModified === xEnd) {
      yStartModified = map(timeElapsed, timePerLongerSide, timePerLongerSide + timePerShorterSide, yStart, yEnd)
    }
  }
  if (yStartModified > yEnd) {
    yStartModified = yEnd
  }
  if (xStartModified === xEnd) {
    line(xEnd, yStart, xEnd, yStartModified)
  }

  if (xEndModified > xStart || xEndModified === null) {

    
    if (yStartModified === yEnd) {
      xEndModified = map(timeElapsed, timePerLongerSide + timePerShorterSide, 2 * timePerLongerSide + timePerShorterSide, xEnd, xStart)
      
    }
  }
  if (xEndModified < xStart && xEndModified != null) {
    xEndModified = xStart
  }
  if (yStartModified === yEnd) { line(xEnd, yEnd, xEndModified, yEnd) }


  
  if (yEndModified > yStart || yEndModified === null) {
    if (xEndModified === xStart) {
      yEndModified = map(timeElapsed, 2 * timePerLongerSide + timePerShorterSide, 2 * timePerLongerSide + 2 * timePerShorterSide, yEnd, yStart)
    }
  }
  if (yEndModified < yStart && !yEndModified === null) { yEndModified = yStart } 
  if (xEndModified === xStart) { line(xStart, yEnd, xStart, yEndModified)}
}