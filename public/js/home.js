// List of background images
const images = [
    '/images/bg1.jpg',
    '/images/bg2.jpg',
    '/images/bg6.jpg',
    '/images/bg9.jpg',
    '/images/bg8.jpg'
];
 

let currentIndex = 0; // Start with the first image
const heroSection = document.getElementById('hero');

function changeBackground() {
    currentIndex = (currentIndex + 1) % images.length; // Loop back to the first image
    heroSection.style.backgroundImage = `url('${images[currentIndex]}')`;
}

// Change the background every 5 seconds (5000 milliseconds)
setInterval(changeBackground, 5000);