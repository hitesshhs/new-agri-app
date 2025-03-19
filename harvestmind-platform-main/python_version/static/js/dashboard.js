document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const taskList = document.getElementById('task-list');
    const logoutBtn = document.getElementById('logout-btn');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const filterButtons = document.querySelectorAll('.task-filters button');
    
    // Stats elements
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const completionRateEl = document.getElementById('completion-rate');
    const progressBarEl = document.getElementById('progress-bar');
    
    // Current filter
    let currentFilter = 'all';
    
    // Bootstrap modal instance
    let taskModal;
    
    // Initialize
    initializeApp();
    
    function initializeApp() {
        // Initialize Bootstrap components
        initBootstrapComponents();
        
        // Load tasks
        loadTasks();
        
        // Add event listeners
        logoutBtn.addEventListener('click', handleLogout);
        saveTaskBtn.addEventListener('click', handleSaveTask);
        
        // Add filter event listeners
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update current filter
                currentFilter = this.getAttribute('data-filter');
                
                // Reload tasks with filter
                loadTasks();
            });
        });
    }
    
    function initBootstrapComponents() {
        // Initialize the task modal
        const modalElement = document.getElementById('newTaskModal');
        if (modalElement) {
            taskModal = new bootstrap.Modal(modalElement);
        }
    }
    
    function handleLogout() {
        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            // Redirect to home page
            window.location.href = '/';
        })
        .catch(error => console.error('Logout error:', error));
    }
    
    function handleSaveTask() {
        // Get form values
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        
        if (!title) {
            alert('Task title is required');
            return;
        }
        
        // Create task object
        const task = {
            title,
            description,
            due_date: dueDate || null,
            priority,
            completed: false
        };
        
        // Send to API
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create task');
            }
            return response.json();
        })
        .then(() => {
            // Clear form
            document.getElementById('new-task-form').reset();
            
            // Close modal
            taskModal.hide();
            
            // Reload tasks
            loadTasks();
        })
        .catch(error => {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
        });
    }
    
    function loadTasks() {
        // Show loading state
        taskList.innerHTML = `
            <li class="list-group-item text-center text-muted">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Loading tasks...
            </li>
        `;
        
        // Fetch tasks from API
        fetch('/api/tasks', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }
            return response.json();
        })
        .then(tasks => {
            // Filter tasks based on current filter
            let filteredTasks = tasks;
            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            }
            
            // Update stats
            updateStats(tasks);
            
            // Clear list
            taskList.innerHTML = '';
            
            // Check if there are tasks
            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <li class="list-group-item text-center text-muted">
                        No tasks found
                    </li>
                `;
                return;
            }
            
            // Sort tasks by priority and due date
            filteredTasks.sort((a, b) => {
                // First by completion status
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                
                // Then by priority
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then by due date (if available)
                if (a.due_date && b.due_date) {
                    return new Date(a.due_date) - new Date(b.due_date);
                }
                
                // Tasks with due dates come before those without
                if (a.due_date && !b.due_date) return -1;
                if (!a.due_date && b.due_date) return 1;
                
                // Finally by creation date
                return new Date(b.created_at) - new Date(a.created_at);
            });
            
            // Add tasks to list
            filteredTasks.forEach(task => {
                const li = createTaskElement(task);
                taskList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            taskList.innerHTML = `
                <li class="list-group-item text-center text-danger">
                    Failed to load tasks. Please try again.
                </li>
            `;
        });
    }
    
    function updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        completionRateEl.textContent = `${rate}%`;
        progressBarEl.style.width = `${rate}%`;
        
        // Update progress bar color based on completion rate
        if (rate < 30) {
            progressBarEl.className = 'progress-bar bg-danger';
        } else if (rate < 70) {
            progressBarEl.className = 'progress-bar bg-warning';
        } else {
            progressBarEl.className = 'progress-bar bg-success';
        }
    }
    
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `list-group-item ${task.completed ? 'list-group-item-secondary' : ''}`;
        li.dataset.id = task.id;
        
        // Priority badge
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `badge ${getPriorityClass(task.priority)} me-2`;
        priorityBadge.textContent = task.priority;
        
        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input me-2';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));
        
        // Task content wrapper
        const contentDiv = document.createElement('div');
        contentDiv.className = 'd-flex flex-column';
        
        // Task title
        const titleEl = document.createElement('div');
        titleEl.className = `fw-bold ${task.completed ? 'text-decoration-line-through text-muted' : ''}`;
        titleEl.textContent = task.title;
        
        // Task description (if available)
        if (task.description) {
            const descEl = document.createElement('div');
            descEl.className = 'small text-muted';
            descEl.textContent = task.description;
            contentDiv.appendChild(descEl);
        }
        
        // Due date (if available)
        if (task.due_date) {
            const dueEl = document.createElement('div');
            dueEl.className = 'small';
            
            const dueDate = new Date(task.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueDate < today && !task.completed) {
                dueEl.className += ' text-danger';
                dueEl.innerHTML = `<i class="fas fa-calendar-times"></i> Overdue: ${formatDate(task.due_date)}`;
            } else {
                dueEl.className += ' text-info';
                dueEl.innerHTML = `<i class="fas fa-calendar"></i> Due: ${formatDate(task.due_date)}`;
            }
            
            contentDiv.appendChild(dueEl);
        }
        
        contentDiv.prepend(titleEl);
        
        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ms-auto';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary me-1';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => editTask(task));
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        // Assemble task item
        const topRowDiv = document.createElement('div');
        topRowDiv.className = 'd-flex align-items-center w-100';
        
        topRowDiv.appendChild(checkbox);
        topRowDiv.appendChild(priorityBadge);
        topRowDiv.appendChild(contentDiv);
        topRowDiv.appendChild(actionsDiv);
        
        li.appendChild(topRowDiv);
        
        return li;
    }
    
    function getPriorityClass(priority) {
        switch (priority) {
            case 'high':
                return 'bg-danger';
            case 'medium':
                return 'bg-warning text-dark';
            case 'low':
                return 'bg-info text-dark';
            default:
                return 'bg-secondary';
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function toggleTaskCompletion(taskId, completed) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(task => {
            task.completed = completed;
            
            return fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task),
                credentials: 'include'
            });
        })
        .then(() => loadTasks())
        .catch(error => console.error('Error updating task:', error));
    }
    
    function editTask(task) {
        // TODO: Implement task editing functionality
        // For now, just log the task
        console.log('Edit task:', task);
        alert('Task editing will be implemented soon!');
    }
    
    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(() => loadTasks())
        .catch(error => console.error('Error deleting task:', error));
    }
}); 