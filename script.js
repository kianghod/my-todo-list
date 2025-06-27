// Todo App JavaScript
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.pendingDeleteId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderTasks();
        this.updateEmptyState();
    }

    initializeElements() {
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.addTaskModal = document.getElementById('addTaskModal');
        this.addTaskForm = document.getElementById('addTaskForm');
        this.taskInput = document.getElementById('taskInput');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.closeAddModal = document.getElementById('closeAddModal');
        this.cancelAdd = document.getElementById('cancelAdd');
        
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editDueDateInput = document.getElementById('editDueDateInput');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        
        // Confirmation modal elements
        this.confirmModal = document.getElementById('confirmModal');
        this.confirmTitle = document.getElementById('confirmTitle');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmCancel = document.getElementById('confirmCancel');
        this.confirmDelete = document.getElementById('confirmDelete');
    }

    bindEvents() {
        // Add task button and modal
        this.addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
        this.closeAddModal.addEventListener('click', () => this.closeAddTaskModal());
        this.cancelAdd.addEventListener('click', () => this.closeAddTaskModal());
        this.addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Edit modal events
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.editForm.addEventListener('submit', (e) => this.handleEditTask(e));
        
        // Confirmation modal events
        this.confirmCancel.addEventListener('click', () => this.closeConfirmModal());
        this.confirmDelete.addEventListener('click', () => this.handleConfirmDelete());
        
        // Close modals when clicking outside
        this.addTaskModal.addEventListener('click', (e) => {
            if (e.target === this.addTaskModal) {
                this.closeAddTaskModal();
            }
        });
        
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });
        
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) {
                this.closeConfirmModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddTaskModal();
                this.closeEditModal();
                this.closeConfirmModal();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    openAddTaskModal() {
        this.addTaskModal.classList.add('show');
        this.taskInput.focus();
    }

    closeAddTaskModal() {
        this.addTaskModal.classList.remove('show');
        this.taskInput.value = '';
        this.dueDateInput.value = '';
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const dueDate = this.dueDateInput.value;
        
        if (!taskText) return;
        
        const task = {
            id: this.generateId(),
            text: taskText,
            completed: false,
            dueDate: dueDate || null,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateEmptyState();
        
        this.closeAddTaskModal();
    }

    handleEditTask(e) {
        e.preventDefault();
        
        const taskText = this.editTaskInput.value.trim();
        const dueDate = this.editDueDateInput.value;
        
        if (!taskText) return;
        
        const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].text = taskText;
            this.tasks[taskIndex].dueDate = dueDate || null;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();
            
            this.saveTasks();
            this.renderTasks();
        }
        
        this.closeEditModal();
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        this.pendingDeleteId = taskId;
        const task = this.tasks.find(task => task.id === taskId);
        
        if (task) {
            this.confirmTitle.textContent = 'Delete Task';
            this.confirmMessage.textContent = `Are you sure you want to delete "${task.text}"? This action cannot be undone.`;
            this.openConfirmModal();
        }
    }

    openConfirmModal() {
        this.confirmModal.classList.add('show');
    }

    closeConfirmModal() {
        this.confirmModal.classList.remove('show');
        this.pendingDeleteId = null;
    }

    handleConfirmDelete() {
        if (this.pendingDeleteId) {
            this.tasks = this.tasks.filter(task => task.id !== this.pendingDeleteId);
            this.saveTasks();
            this.renderTasks();
            this.updateEmptyState();
            this.closeConfirmModal();
        }
    }

    openEditModal(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.editTaskInput.value = task.text;
            this.editDueDateInput.value = task.dueDate || '';
            this.editModal.classList.add('show');
            this.editTaskInput.focus();
        }
    }

    closeEditModal() {
        this.editModal.classList.remove('show');
        this.editingTaskId = null;
        this.editTaskInput.value = '';
        this.editDueDateInput.value = '';
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        const isOverdue = date < today && !isToday;
        
        let displayDate;
        if (isToday) {
            displayDate = 'Today';
        } else if (isTomorrow) {
            displayDate = 'Tomorrow';
        } else {
            displayDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
        
        return {
            text: displayDate,
            isOverdue: isOverdue
        };
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;
        
        const dateInfo = this.formatDate(task.dueDate);
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="todoApp.toggleTaskComplete('${task.id}')"></div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                ${task.dueDate ? `
                    <div class="task-due-date ${dateInfo.isOverdue ? 'overdue' : ''}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dateInfo.text}
                    </div>
                ` : ''}
            </div>
            <div class="task-actions">
                <button class="action-btn edit" onclick="todoApp.openEditModal('${task.id}')" title="Edit task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="todoApp.deleteTask('${task.id}')" title="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        return taskElement;
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        this.taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.emptyState.classList.add('show');
            return;
        }
        
        this.emptyState.classList.remove('show');
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    updateEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
    
    // Add some sample tasks if no tasks exist
    if (todoApp.tasks.length === 0) {
        const sampleTasks = [
            {
                id: todoApp.generateId(),
                text: 'Welcome to your new todo app!',
                completed: false,
                dueDate: null,
                createdAt: new Date().toISOString()
            },
            {
                id: todoApp.generateId(),
                text: 'Click the checkbox to mark as complete',
                completed: true,
                dueDate: null,
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            },
            {
                id: todoApp.generateId(),
                text: 'Try adding a task with a due date',
                completed: false,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];
        
        todoApp.tasks = sampleTasks;
        todoApp.saveTasks();
        todoApp.renderTasks();
        todoApp.updateEmptyState();
    }
}); 