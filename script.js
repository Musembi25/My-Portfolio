// Database initialization
let db;

function initDB() {
    const request = indexedDB.open('DrummingPortfolioDB', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        
        // Create object store for gallery images
        if (!db.objectStoreNames.contains('gallery')) {
            db.createObjectStore('gallery', { keyPath: 'id', autoIncrement: true });
        }
        
        // Create object store for videos
        if (!db.objectStoreNames.contains('videos')) {
            db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
        }
        
        // Create object store for contact messages
        if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadGallery();
        loadVideos();
    };
}

// Load gallery images
function loadGallery() {
    const transaction = db.transaction(['gallery'], 'readonly');
    const store = transaction.objectStore('gallery');
    const request = store.getAll();

    request.onsuccess = function() {
        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.innerHTML = '';

        request.result.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.title}">
            `;
            galleryGrid.appendChild(galleryItem);
        });
    };
}

// Load videos
function loadVideos() {
    const transaction = db.transaction(['videos'], 'readonly');
    const store = transaction.objectStore('videos');
    const request = store.getAll();

    request.onsuccess = function() {
        const videoGrid = document.getElementById('videoGrid');
        videoGrid.innerHTML = '';

        request.result.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <iframe src="${video.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;
            videoGrid.appendChild(videoItem);
        });
    };
}

// Handle contact form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const transaction = db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.add({
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString()
    });

    request.onsuccess = function() {
        alert('Thank you for your message! We will get back to you soon.');
        document.getElementById('contactForm').reset();
    };

    request.onerror = function() {
        alert('Sorry, there was an error sending your message. Please try again later.');
    };
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animate progress bars when they come into view
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = `${progress}%`;
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

// Initialize everything when the page loads
window.addEventListener('load', function() {
    initDB();
    setTimeout(addSampleData, 1000);
    animateProgressBars();
    
    // Add event listener to the "Book a Session" button
    const bookButton = document.querySelector('.cta-button');
    if (bookButton) {
        bookButton.addEventListener('click', function(e) {
            e.preventDefault();
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// Add some sample data to the database
function addSampleData() {
    const transaction = db.transaction(['gallery', 'videos'], 'readwrite');
    const galleryStore = transaction.objectStore('gallery');
    const videoStore = transaction.objectStore('videos');

    // Sample gallery images
    const galleryImages = [
        { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', title: 'Drum Set' },
        { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', title: 'Live Performance' },
        { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', title: 'Studio Session' }
    ];

    // Sample videos
    const videos = [
        { url: 'https://www.youtube.com/embed/your-video-id-1', title: 'Live Performance' },
        { url: 'https://www.youtube.com/embed/your-video-id-2', title: 'Drum Solo' }
    ];

    galleryImages.forEach(image => {
        galleryStore.add(image);
    });

    videos.forEach(video => {
        videoStore.add(video);
    });
} 
