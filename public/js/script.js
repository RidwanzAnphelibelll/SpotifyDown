const API_BASE_URL = 'https://api-spotify-rscoders.vercel.app/';

window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(function() {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 1000);
});

const observeElements = () => {
    const featureCards = document.querySelectorAll('.feature-card');
    const stepCards = document.querySelectorAll('.step-card');
    
    if (!('IntersectionObserver' in window)) {
        featureCards.forEach(card => card.classList.add('visible'));
        stepCards.forEach(card => card.classList.add('visible'));
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    featureCards.forEach(card => observer.observe(card));
    stepCards.forEach(card => observer.observe(card));
};

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById('spotify-url');
        input.value = text.trim();
        input.classList.add('paste-effect');
        setTimeout(() => input.classList.remove('paste-effect'), 800);
        updateInputIcon();
        input.focus();
    } catch (err) {
        showError('Failed to read clipboard. Please paste manually.');
    }
}

function isValidSpotifyURL(url) {
    const spotifyPattern = /^https?:\/\/(open\.)?spotify\.com\/(track|playlist|album)\/[a-zA-Z0-9]+(\?.*)?$/;
    return spotifyPattern.test(url);
}

function updateInputIcon() {
    const input = document.getElementById('spotify-url');
    const pasteBtn = document.getElementById('paste-btn');
    const icon = pasteBtn.querySelector('i');
    
    if (input.value.trim()) {
        icon.className = 'fas fa-times';
        pasteBtn.setAttribute('title', 'Clear URL');
        pasteBtn.setAttribute('aria-label', 'Clear URL');
    } else {
        icon.className = 'fas fa-paste';
        pasteBtn.setAttribute('title', 'Paste from clipboard');
        pasteBtn.setAttribute('aria-label', 'Paste URL');
    }
}

function handleIconClick() {
    const input = document.getElementById('spotify-url');
    
    if (input.value.trim()) {
        clearInput();
    } else {
        pasteFromClipboard();
    }
}

function clearInput() {
    const input = document.getElementById('spotify-url');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    const downloadSection = document.querySelector('.download-section');
    const featuresSection = document.querySelector('.features-section');
    const howToSection = document.querySelector('.how-to-section');
    
    input.value = '';
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    downloadSection.style.display = 'block';
    featuresSection.style.display = 'block';
    howToSection.style.display = 'block';
    updateInputIcon();
    input.focus();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDownload() {
    const input = document.getElementById('spotify-url');
    let url = input.value.trim();
    
    if (!url) {
        showError('Please enter a Spotify URL!');
        return;
    }
    
    if (!isValidSpotifyURL(url)) {
        showError('Invalid Spotify URL! Please enter a valid Spotify link.');
        return;
    }
    
    getSpotifyData(url);
}

function getSpotifyData(url) {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    
    loader.classList.add('active');
    errorMessage.classList.remove('active');
    resultContainer.style.display = 'none';
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/download?url=' + encodeURIComponent(url), true);
    
    xhr.onload = function() {
        loader.classList.remove('active');
        
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.status && response.result) {
                    displayResult(response.result);
                } else {
                    showNoResult(response.message);
                }
            } catch (e) {
                showNoResult('Failed to parse response data!');
            }
        } else {
            showNoResult('Please check your Spotify link!');
        }
    };
    
    xhr.onerror = function() {
        loader.classList.remove('active');
        showNoResult('Network error occurred. Please check your connection.');
    };
    
    xhr.send();
}

function displayResult(data) {
    const resultContainer = document.getElementById('result-container');
    const noResultContainer = document.getElementById('no-result-container');
    const downloadSection = document.querySelector('.download-section');
    const featuresSection = document.querySelector('.features-section');
    const howToSection = document.querySelector('.how-to-section');
    
    if (noResultContainer) {
        noResultContainer.style.display = 'none';
    }
    
    downloadSection.style.display = 'none';
    featuresSection.style.display = 'none';
    howToSection.style.display = 'none';
    
    if (data.type === 'track') {
        displayTrackResult(data.data);
    } else if (data.type === 'playlist') {
        displayPlaylistResult(data.data);
    } else if (data.type === 'album') {
        displayAlbumResult(data.data);
    }
    
    resultContainer.style.display = 'block';
}

function displayTrackResult(track) {
    const resultContainer = document.getElementById('result-container');
    
    const html = `
        <div class="track-result">
            <div class="track-info">
                <div class="track-thumbnail">
                    <img src="${track.thumbnail}" alt="${track.title}" />
                </div>
                <div class="track-details">
                    <h2>${track.title}</h2>
                    <p class="track-meta">
                        <i class="fas fa-user"></i>
                        <span>${track.artist}</span>
                    </p>
                    <p class="track-meta">
                        <i class="fas fa-clock"></i>
                        <span>${track.duration}</span>
                    </p>
                    <p class="track-meta">
                        <i class="fas fa-calendar"></i>
                        <span>${track.release_date}</span>
                    </p>
                </div>
            </div>
            
            <div class="track-download-section">
                <h3><i class="fas fa-download"></i> Download Options</h3>
                <div class="quality-info">
                    <i class="fas fa-music"></i>
                    <span>Download music in high quality 320kbps</span>
                </div>
                <button class="get-download-btn single-track-btn" id="get-track-download" onclick="getSingleTrackDownload('${track.track_url}')">
                    <i class="fas fa-link"></i> Get Download Link
                </button>
                <button class="download-action-btn" id="download-track-btn" style="display: none;">
                    <i class="fas fa-download"></i> Download MP3
                </button>
            </div>
        </div>
        
        <div class="download-another-container">
            <button class="download-another-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Download Another
            </button>
        </div>
    `;
    
    resultContainer.innerHTML = html;
}

function getSingleTrackDownload(trackUrl) {
    const getBtn = document.getElementById('get-track-download');
    const downloadBtn = document.getElementById('download-track-btn');
    
    getBtn.classList.add('loading');
    getBtn.innerHTML = '<i class="fas fa-spinner"></i> Getting Download Link...';
    getBtn.disabled = true;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/get-download?track_url=' + encodeURIComponent(trackUrl), true);
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.status && response.result && response.result.download_url) {
                    getBtn.style.display = 'none';
                    downloadBtn.style.display = 'block';
                    downloadBtn.onclick = function() {
                        downloadFile(response.result.download_url);
                    };
                } else {
                    getBtn.classList.remove('loading');
                    getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
                    setTimeout(() => {
                        getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                        getBtn.disabled = false;
                        getBtn.classList.remove('loading');
                    }, 2000);
                }
            } catch (e) {
                getBtn.classList.remove('loading');
                getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                setTimeout(() => {
                    getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                    getBtn.disabled = false;
                    getBtn.classList.remove('loading');
                }, 2000);
            }
        } else {
            getBtn.classList.remove('loading');
            getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            setTimeout(() => {
                getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                getBtn.disabled = false;
                getBtn.classList.remove('loading');
            }, 2000);
        }
    };
    
    xhr.onerror = function() {
        getBtn.classList.remove('loading');
        getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network Error';
        setTimeout(() => {
            getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
            getBtn.disabled = false;
            getBtn.classList.remove('loading');
        }, 2000);
    };
    
    xhr.send();
}

function displayPlaylistResult(playlist) {
    const resultContainer = document.getElementById('result-container');
    
    let tracksHtml = '';
    playlist.tracks.forEach((track, index) => {
        tracksHtml += `
            <div class="track-item" id="track-${index}">
                <div class="track-item-header">
                    <div class="track-item-thumbnail">
                        <span class="track-number">${index + 1}</span>
                        <img src="${track.thumbnail}" alt="${track.title}" />
                    </div>
                    <div class="track-item-info">
                        <h4>${track.title}</h4>
                        <p class="track-item-meta">
                            <i class="fas fa-user"></i>
                            <span>${track.artist}</span>
                        </p>
                        <p class="track-item-meta">
                            <i class="fas fa-clock"></i>
                            <span>${track.duration}</span>
                        </p>
                        <p class="track-item-meta">
                            <i class="fas fa-calendar"></i>
                            <span>${track.release_date}</span>
                        </p>
                    </div>
                    <div class="track-item-actions">
                        <button class="get-download-btn" onclick="getTrackDownload('${track.track_url}', ${index})">
                            <i class="fas fa-link"></i> Get Download Link
                        </button>
                        <button class="download-track-btn" id="download-btn-${index}">
                            <i class="fas fa-download"></i> Download MP3
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const html = `
        <div class="playlist-result">
            <div class="playlist-header">
                <div class="playlist-thumbnail">
                    <img src="${playlist.thumbnail}" alt="${playlist.name}" />
                </div>
                <div class="playlist-info">
                    <h2>${playlist.name}</h2>
                    <p>${playlist.description}</p>
                    <p><strong>${playlist.total_tracks}</strong> tracks</p>
                </div>
            </div>
            
            <div class="tracks-list">
                <h3><i class="fas fa-list"></i> Tracks (${playlist.total_tracks})</h3>
                ${tracksHtml}
            </div>
        </div>
        
        <div class="download-another-container">
            <button class="download-another-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Download Another
            </button>
        </div>
    `;
    
    resultContainer.innerHTML = html;
}

function displayAlbumResult(album) {
    const resultContainer = document.getElementById('result-container');
    
    let tracksHtml = '';
    album.tracks.forEach((track, index) => {
        tracksHtml += `
            <div class="track-item" id="track-${index}">
                <div class="track-item-header">
                    <div class="track-item-thumbnail">
                        <span class="track-number">${index + 1}</span>
                        <img src="${track.thumbnail}" alt="${track.title}" />
                    </div>
                    <div class="track-item-info">
                        <h4>${track.title}</h4>
                        <p class="track-item-meta">
                            <i class="fas fa-user"></i>
                            <span>${track.artist}</span>
                        </p>
                        <p class="track-item-meta">
                            <i class="fas fa-clock"></i>
                            <span>${track.duration}</span>
                        </p>
                        <p class="track-item-meta">
                            <i class="fas fa-calendar"></i>
                            <span>${track.release_date}</span>
                        </p>
                    </div>
                    <div class="track-item-actions">
                        <button class="get-download-btn" onclick="getTrackDownload('${track.track_url}', ${index})">
                            <i class="fas fa-link"></i> Get Download Link
                        </button>
                        <button class="download-track-btn" id="download-btn-${index}">
                            <i class="fas fa-download"></i> Download MP3
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const html = `
        <div class="album-result">
            <div class="album-header">
                <div class="album-thumbnail">
                    <img src="${album.thumbnail}" alt="${album.name}" />
                </div>
                <div class="album-info">
                    <h2>${album.name}</h2>
                    <p><strong>Artist:</strong> ${album.artist}</p>
                    <p><strong>Release Date:</strong> ${album.release_date}</p>
                    <p><strong>${album.total_tracks}</strong> tracks</p>
                </div>
            </div>
            
            <div class="tracks-list">
                <h3><i class="fas fa-compact-disc"></i> Tracks (${album.total_tracks})</h3>
                ${tracksHtml}
            </div>
        </div>
        
        <div class="download-another-container">
            <button class="download-another-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Download Another
            </button>
        </div>
    `;
    
    resultContainer.innerHTML = html;
}

function getTrackDownload(trackUrl, index) {
    const getBtn = document.querySelector(`#track-${index} .get-download-btn`);
    const downloadBtn = document.getElementById(`download-btn-${index}`);
    
    getBtn.classList.add('loading');
    getBtn.innerHTML = '<i class="fas fa-spinner"></i> Getting Download Link...';
    getBtn.disabled = true;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE_URL + 'api/get-download?track_url=' + encodeURIComponent(trackUrl), true);
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.status && response.result && response.result.download_url) {
                    getBtn.style.display = 'none';
                    downloadBtn.classList.add('show');
                    downloadBtn.onclick = function() {
                        downloadFile(response.result.download_url);
                    };
                } else {
                    getBtn.classList.remove('loading');
                    getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
                    setTimeout(() => {
                        getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                        getBtn.disabled = false;
                        getBtn.classList.remove('loading');
                    }, 2000);
                }
            } catch (e) {
                getBtn.classList.remove('loading');
                getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                setTimeout(() => {
                    getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                    getBtn.disabled = false;
                    getBtn.classList.remove('loading');
                }, 2000);
            }
        } else {
            getBtn.classList.remove('loading');
            getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
            setTimeout(() => {
                getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
                getBtn.disabled = false;
                getBtn.classList.remove('loading');
            }, 2000);
        }
    };
    
    xhr.onerror = function() {
        getBtn.classList.remove('loading');
        getBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network Error';
        setTimeout(() => {
            getBtn.innerHTML = '<i class="fas fa-link"></i> Get Download Link';
            getBtn.disabled = false;
            getBtn.classList.remove('loading');
        }, 2000);
    };
    
    xhr.send();
}

function showNoResult(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.style.display = 'none';
    
    let noResultContainer = document.getElementById('no-result-container');
    
    if (!noResultContainer) {
        noResultContainer = document.createElement('div');
        noResultContainer.id = 'no-result-container';
        noResultContainer.className = 'no-result-container';
        
        const mainContainer = document.querySelector('.container');
        const downloadSection = document.querySelector('.download-section');
        mainContainer.insertBefore(noResultContainer, downloadSection.nextSibling);
    }
    
    noResultContainer.innerHTML = `
        <div class="no-result-content">
            <div class="no-result-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No Result Found</h3>
            <p>${message}</p>
            <button class="try-again-btn" onclick="clearInput()">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
    
    noResultContainer.style.display = 'block';
}

function downloadFile(downloadUrl) {
    window.location.href = downloadUrl;
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('year').textContent = new Date().getFullYear();
    
    const downloadBtn = document.getElementById('download-btn');
    const input = document.getElementById('spotify-url');
    const pasteBtn = document.getElementById('paste-btn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    
    downloadBtn.addEventListener('click', handleDownload);
    pasteBtn.addEventListener('click', handleIconClick);
    
    input.addEventListener('input', updateInputIcon);
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });
    
    hamburgerMenu.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });
    
    document.addEventListener('click', function(event) {
        if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('show');
        }
    });
    
    window.addEventListener('scroll', handleScroll);
    
    observeElements();
});
