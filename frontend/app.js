// Configuration
const CONFIG = {
    backendUrl: 'http://192.168.64.26:3000',
    apiEndpoints: {
        health: '/health',
        status: '/status',
        deploy: '/deploy'
    }
};

// State management
let currentPage = 'home';
let startTime = Date.now();

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend application initialized');
    navigateTo('home');
    checkBackendHealth();
    updateUptime();
    
    // Update uptime every second
    setInterval(updateUptime, 1000);
});

// Navigation functions
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Show selected page
    const targetPage = document.getElementById(page + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = page;
        updateNavigation();
        
        // Load page-specific content
        switch(page) {
            case 'home':
                checkBackendHealth();
                break;
            case 'status':
                refreshStatus();
                break;
            case 'deploy':
                // Deploy page is static for now
                break;
        }
    }
}

function updateNavigation() {
    // Update active navigation state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-blue-700');
        link.classList.add('text-white');
    });
    
    // Add active state to current page button
    const activeButton = document.querySelector(`[onclick="navigateTo('${currentPage}')"]`);
    if (activeButton) {
        activeButton.classList.add('bg-blue-700');
    }
}

// Backend health check
async function checkBackendHealth() {
    const statusElement = document.getElementById('backend-status');
    const healthElement = document.getElementById('backend-health');
    
    try {
        const startTime = performance.now();
        const response = await fetch(CONFIG.backendUrl + '/');
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        if (response.ok) {
            const text = await response.text();
            updateStatus(statusElement, 'Online', 'text-green-600');
            updateStatus(healthElement, 'Healthy', 'text-green-600');
            updateResponseTime(responseTime);
            updateLastCheck();
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Backend health check failed:', error);
        updateStatus(statusElement, 'Offline', 'text-red-600');
        updateStatus(healthElement, 'Unhealthy', 'text-red-600');
        updateResponseTime('-');
        updateLastCheck();
    }
}

// Status management
function updateStatus(element, text, className) {
    if (element) {
        element.textContent = text;
        element.className = `font-medium ${className}`;
    }
}

function updateResponseTime(time) {
    const element = document.getElementById('backend-response-time');
    if (element) {
        element.textContent = time === '-' ? '-' : `${time}ms`;
    }
}

function updateLastCheck() {
    const element = document.getElementById('backend-last-check');
    if (element) {
        element.textContent = new Date().toLocaleTimeString();
    }
}

function updateUptime() {
    const element = document.getElementById('frontend-uptime');
    if (element) {
        const uptime = Date.now() - startTime;
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        let uptimeText = '';
        if (hours > 0) {
            uptimeText = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            uptimeText = `${minutes}m ${seconds % 60}s`;
        } else {
            uptimeText = `${seconds}s`;
        }
        
        element.textContent = uptimeText;
    }
}

// Deployment functions
async function deployApplication() {
    const resultElement = document.getElementById('deploy-result');
    
    try {
        resultElement.innerHTML = `
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-blue-700">
                            Deployment initiated. This is a demo - in a real scenario, this would trigger Kubernetes deployment.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Simulate deployment process
        setTimeout(() => {
            resultElement.innerHTML = `
                <div class="bg-green-50 border-l-4 border-green-400 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-green-700">
                                <strong>Deployment successful!</strong> Application has been deployed to Kubernetes.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }, 2000);
        
    } catch (error) {
        console.error('Deployment failed:', error);
        resultElement.innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-red-700">
                            <strong>Deployment failed!</strong> Please check your configuration and try again.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}

function checkDeployment() {
    const resultElement = document.getElementById('deploy-result');
    
    resultElement.innerHTML = `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">
                        <strong>Checking deployment status...</strong> This would query Kubernetes API in a real scenario.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Simulate status check
    setTimeout(() => {
        resultElement.innerHTML = `
            <div class="bg-green-50 border-l-4 border-green-400 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-green-700">
                            <strong>Status: Running</strong> All pods are healthy and the application is serving traffic.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }, 1500);
}

// Status refresh
function refreshStatus() {
    checkBackendHealth();
    
    // Add a visual indicator that status is being refreshed
    const statusElements = document.querySelectorAll('#status-page .text-gray-900');
    statusElements.forEach(el => {
        if (el.textContent !== '1.0.0') { // Don't change version
            el.textContent = 'Refreshing...';
        }
    });
    
    setTimeout(() => {
        // Status will be updated by checkBackendHealth
    }, 1000);
}

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 