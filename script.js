const celebrationGifs = [
    'https://media.giphy.com/media/2gtoSIzdrSMFO/giphy.gif', // Dancing kid
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Party parrot
    'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', // Success kid
    'https://media.giphy.com/media/xT0xezQGU5xCDJuCPe/giphy.gif', // Confetti
    'https://media.giphy.com/media/3o6ZtlGkjeschymLNm/giphy.gif', // Snoopy dance
    'https://media.giphy.com/media/YTbZzCkRQCEJa/giphy.gif', // Carlton dance
    'https://media.giphy.com/media/l0MYGs4zBv89RmBK8/giphy.gif', // Mario success
    'https://media.giphy.com/media/l2JI9JdUDjxVbd20g/giphy.gif', // Pikachu celebration
    'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif', // Success baby
    'https://media.giphy.com/media/l0HlSDiA6WUytl9oQ/giphy.gif', // Minions celebration
    'https://media.giphy.com/media/l0HlN5Y28D9MzzcRy/giphy.gif', // Success dog
    'https://media.giphy.com/media/3oz8xRF0v9WMAUVLNK/giphy.gif', // Celebration dance
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Party time
    'https://media.giphy.com/media/l0HlN5gabfeckp2kE/giphy.gif', // Victory dance
    'https://media.giphy.com/media/l0HlGsmOxGDrfDOYo/giphy.gif'  // Success celebration
];

let tasks = [];
let sidebarTasks = [];
let completedTasks = []; // New addition
let draggedTask = null;
let dragSource = null;

// Load saved data on startup
document.addEventListener('DOMContentLoaded', function() {
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        sidebarTasks = JSON.parse(localStorage.getItem('sidebarTasks')) || [];
        completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || []; // New addition
        renderAll();
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
        sidebarTasks = [];
        completedTasks = []; // New addition
    }
});

// Add keyboard shortcut for adding tasks
document.getElementById('sidebarTaskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addSidebarTask();
    }
});

// Core functions
function addSidebarTask() {
    const taskInput = document.getElementById('sidebarTaskInput');
    if (taskInput.value.trim() === '') return;

    const task = {
        id: Date.now(),
        text: taskInput.value.trim(),
        completed: false
    };

    console.log('Adding task:', task);
    sidebarTasks.push(task);
    saveTasks();
    renderAll();
    taskInput.value = '';
}

function showCelebration() {
    const randomGif = celebrationGifs[Math.floor(Math.random() * celebrationGifs.length)];
    
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    
    const gif = document.createElement('img');
    gif.className = 'celebration-gif';
    gif.src = randomGif;
    
    overlay.appendChild(gif);
    document.body.appendChild(overlay);
    
    // Remove the overlay after animation
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

function toggleTask(taskId, isSidebar = false) {
    let taskList = isSidebar ? sidebarTasks : tasks;
    let task = taskList.find(t => t.id === taskId);
    
    if (task && !task.completed) {
        showCelebration();
        // Move task to completed list
        const completedTask = {...task, completed: true, source: isSidebar ? 'sidebar' : 'matrix'};
        completedTasks.push(completedTask);
        
        // Remove from original list
        if (isSidebar) {
            sidebarTasks = sidebarTasks.filter(t => t.id !== taskId);
        } else {
            tasks = tasks.filter(t => t.id !== taskId);
        }
    }
    
    saveTasks();
    renderAll();
}

function clearCompletedTasks() {
    completedTasks = [];
    saveTasks();
    renderAll();
}

function renderCompletedTasks() {
    const completedEl = document.getElementById('completed-tasks');
    completedEl.innerHTML = '';

    completedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item completed';
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" checked disabled>
                <span>${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="delete-btn" onclick="deleteCompletedTask(${task.id})">×</button>
            </div>
        `;
        completedEl.appendChild(li);
    });
}

function deleteCompletedTask(taskId) {
    completedTasks = completedTasks.filter(task => task.id !== taskId);
    saveTasks();
    renderAll();
}

function deleteTask(taskId, isSidebar = false) {
    if (isSidebar) {
        sidebarTasks = sidebarTasks.filter(task => task.id !== taskId);
    } else {
        tasks = tasks.filter(task => task.id !== taskId);
    }
    saveTasks();
    renderAll();
}

function moveToInbox(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        tasks = tasks.filter(t => t.id !== taskId);
        sidebarTasks.push({
            id: task.id,
            text: task.text,
            completed: task.completed
        });
        saveTasks();
        renderAll();
    }
}

// Drag and Drop handlers
function handleDragStart(e, taskId, source) {
    draggedTask = taskId;
    dragSource = source;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.task-list');
    if (dropZone) {
        dropZone.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.task-list');
    if (dropZone) {
        const rect = dropZone.getBoundingClientRect();
        const isLeaving = 
            e.clientX < rect.left ||
            e.clientX >= rect.right ||
            e.clientY < rect.top ||
            e.clientY >= rect.bottom;
        
        if (isLeaving) {
            dropZone.classList.remove('drag-over');
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.task-list');
    if (!dropZone) return;

    dropZone.classList.remove('drag-over');
    const targetId = dropZone.id;

    if (dragSource === 'sidebar' && targetId !== 'sidebar-tasks') {
        const task = sidebarTasks.find(t => t.id === draggedTask);
        if (task) {
            sidebarTasks = sidebarTasks.filter(t => t.id !== draggedTask);
            tasks.push({
                ...task,
                quadrant: targetId
            });
        }
    } else if (dragSource === 'matrix' && targetId === 'sidebar-tasks') {
        const task = tasks.find(t => t.id === draggedTask);
        if (task) {
            tasks = tasks.filter(t => t.id !== draggedTask);
            sidebarTasks.push({
                id: task.id,
                text: task.text,
                completed: task.completed
            });
        }
    } else if (dragSource === 'matrix' && targetId !== 'sidebar-tasks') {
        tasks = tasks.map(task => 
            task.id === draggedTask 
                ? {...task, quadrant: targetId}
                : task
        );
    }

    saveTasks();
    renderAll();
}

// Render functions
function renderSidebar() {
    const sidebarEl = document.getElementById('sidebar-tasks');
    sidebarEl.innerHTML = '';

    sidebarTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.ondragstart = (e) => handleDragStart(e, task.id, 'sidebar');
        li.ondragend = handleDragEnd;
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id}, true)">
                <span>${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id}, true)">×</button>
        `;
        sidebarEl.appendChild(li);
    });
}

function renderMatrix() {
    const quadrants = [
        'urgent-important',
        'not-urgent-important',
        'urgent-not-important',
        'not-urgent-not-important'
    ];

    quadrants.forEach(quadrant => {
        const quadrantEl = document.getElementById(quadrant);
        quadrantEl.innerHTML = '';

        const quadrantTasks = tasks.filter(task => task.quadrant === quadrant);

        quadrantTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.draggable = true;
            li.ondragstart = (e) => handleDragStart(e, task.id, 'matrix');
            li.ondragend = handleDragEnd;
            
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            taskContent.innerHTML = `
                <input type="checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})">
                <span>${task.text}</span>
            `;

            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            taskActions.innerHTML = `
                <button class="back-btn" onclick="moveToInbox(${task.id})" title="Move to Inbox">
                    ↩
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
            `;

            li.appendChild(taskContent);
            li.appendChild(taskActions);
            quadrantEl.appendChild(li);
        });
    });
}

function renderAll() {
    renderSidebar();
    renderMatrix();
}

function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('sidebarTasks', JSON.stringify(sidebarTasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks)); // New addition
        console.log('Tasks saved successfully');
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

function renderAll() {
    renderSidebar();
    renderMatrix();
    renderCompletedTasks(); // New addition
}

// Keep existing debug function
function debugTasks() {
    console.log('Current tasks:', tasks);
    console.log('Current sidebar tasks:', sidebarTasks);
    console.log('Current completed tasks:', completedTasks); // New addition
}

// Debug function
function debugTasks() {
    console.log('Current tasks:', tasks);
    console.log('Current sidebar tasks:', sidebarTasks);
}