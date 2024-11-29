document.addEventListener('DOMContentLoaded', () => {
    // Initialize windows
    const windows = document.querySelectorAll('.window');
    let activeWindow = null;
    let zIndex = 1000;

    // Start Menu
    const startButton = document.querySelector('.start-button');
    const startMenu = document.querySelector('.start-menu');
    let startMenuOpen = false;

    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenuOpen = !startMenuOpen;
        startMenu.classList.toggle('active');
        startButton.classList.toggle('active');
    });

    // Close start menu when clicking outside
    document.addEventListener('click', (e) => {
        if (startMenuOpen && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenuOpen = false;
            startMenu.classList.remove('active');
            startButton.classList.remove('active');
        }
    });

    // Start menu items
    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.querySelector('span').textContent.toLowerCase().replace(/\s+/g, '-') + '-window';
            const window = document.getElementById(windowId);
            if (window) {
                showWindow(window);
                startMenu.classList.remove('active');
                startButton.classList.remove('active');
                startMenuOpen = false;
            }
        });
    });

    // Desktop icon click handlers
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const windowId = `${icon.dataset.window}-window`;
            const window = document.getElementById(windowId);
            if (window) {
                showWindow(window);
            }
        });
    });

    // Project folder click handlers
    document.querySelectorAll('.folder-item').forEach(folder => {
        folder.addEventListener('click', () => {
            const projectId = `${folder.dataset.project}-window`;
            const window = document.getElementById(projectId);
            if (window) {
                showWindow(window);
            }
        });
    });

    // Window management
    windows.forEach(window => {
        // Initial random position
        positionWindowRandomly(window);

        // Make window draggable
        const header = window.querySelector('.window-header');
        makeDraggable(window, header);

        // Window controls
        const controls = window.querySelector('.window-controls');
        if (controls) {
            const minimize = controls.querySelector('.minimize');
            const maximize = controls.querySelector('.maximize');
            const close = controls.querySelector('.close');

            minimize?.addEventListener('click', () => minimizeWindow(window));
            maximize?.addEventListener('click', () => maximizeWindow(window));
            close?.addEventListener('click', () => hideWindow(window));
        }

        // Bring to front on click
        window.addEventListener('mousedown', () => {
            if (activeWindow !== window) {
                window.style.zIndex = ++zIndex;
                activeWindow = window;
            }
        });
    });

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Functions
    function positionWindowRandomly(window) {
        const maxX = window.parentElement.clientWidth - 400;
        const maxY = window.parentElement.clientHeight - 300;
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
        window.style.left = `${Math.max(0, randomX)}px`;
        window.style.top = `${Math.max(0, randomY)}px`;
    }

    function showWindow(window) {
        window.style.display = 'block';
        window.classList.remove('minimized');
        window.style.zIndex = ++zIndex;
        activeWindow = window;
        updateTaskbar();
    }

    function hideWindow(window) {
        window.style.display = 'none';
        updateTaskbar();
    }

    function minimizeWindow(window) {
        window.classList.add('minimized');
        updateTaskbar();
    }

    function maximizeWindow(window) {
        window.classList.toggle('maximized');
        if (!window.classList.contains('maximized')) {
            positionWindowRandomly(window);
        }
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        handle.addEventListener('mousedown', dragMouseDown);

        function dragMouseDown(e) {
            if (element.classList.contains('maximized')) return;
            
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            // Prevent dragging outside viewport
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight - 40; // Account for taskbar
            
            element.style.top = `${Math.min(Math.max(0, newTop), maxY)}px`;
            element.style.left = `${Math.min(Math.max(0, newLeft), maxX)}px`;
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }
    }

    function updateTaskbar() {
        const taskbarItems = document.querySelector('.taskbar-items');
        taskbarItems.innerHTML = '';

        windows.forEach(window => {
            if (window.style.display !== 'none') {
                const button = document.createElement('button');
                button.className = 'xp-button';
                button.textContent = window.querySelector('.window-title').textContent;
                if (!window.classList.contains('minimized')) {
                    button.classList.add('active');
                }
                button.addEventListener('click', () => {
                    if (window.classList.contains('minimized')) {
                        showWindow(window);
                    } else {
                        minimizeWindow(window);
                    }
                });
                taskbarItems.appendChild(button);
            }
        });
    }

    function updateClock() {
        const clock = document.querySelector('.clock');
        const now = new Date();
        clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
});
