// ============================================
//  MI LISTA DE TAREAS - JavaScript
// ============================================

// ---------- ESTADO DE LA APLICACIÓN ----------
let tasks = [];
let currentFilter = 'todas';

// ---------- ELEMENTOS DEL DOM ----------
const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const categorySelect = document.getElementById('category');
const deadlineInput = document.getElementById('deadline');
const taskListContainer = document.getElementById('taskList');
const filterSelect = document.getElementById('filterCategory');
const charCount = document.getElementById('charCount');

// Elementos para mensajes de error
const titleError = document.getElementById('titleError');
const descriptionError = document.getElementById('descriptionError');
const categoryError = document.getElementById('categoryError');
const deadlineError = document.getElementById('deadlineError');

// ---------- FUNCIONES DE VALIDACIÓN ----------
function validateTitle() {
    const value = titleInput.value.trim();
    if (!value) {
        titleError.textContent = 'El título es obligatorio';
        titleInput.parentElement.classList.add('error');
        return false;
    } else if (value.length < 3) {
        titleError.textContent = 'El título debe tener al menos 3 caracteres';
        titleInput.parentElement.classList.add('error');
        return false;
    } else if (value.length > 50) {
        titleError.textContent = 'El título no puede exceder 50 caracteres';
        titleInput.parentElement.classList.add('error');
        return false;
    } else {
        titleError.textContent = '';
        titleInput.parentElement.classList.remove('error');
        return true;
    }
}

function validateDescription() {
    const value = descriptionInput.value.trim();
    if (value.length > 200) {
        descriptionError.textContent = 'La descripción no puede exceder 200 caracteres';
        descriptionInput.parentElement.classList.add('error');
        return false;
    } else {
        descriptionError.textContent = '';
        descriptionInput.parentElement.classList.remove('error');
        return true;
    }
}

function validateCategory() {
    const value = categorySelect.value;
    if (!value) {
        categoryError.textContent = 'Debes seleccionar una categoría';
        categorySelect.parentElement.classList.add('error');
        return false;
    } else {
        categoryError.textContent = '';
        categorySelect.parentElement.classList.remove('error');
        return true;
    }
}

function validateDeadline() {
    const value = deadlineInput.value;
    if (!value) {
        deadlineError.textContent = 'La fecha límite es obligatoria';
        deadlineInput.parentElement.classList.add('error');
        return false;
    }
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        deadlineError.textContent = 'La fecha límite no puede ser una fecha pasada';
        deadlineInput.parentElement.classList.add('error');
        return false;
    } else {
        deadlineError.textContent = '';
        deadlineInput.parentElement.classList.remove('error');
        return true;
    }
}

// ---------- VALIDACIÓN COMPLETA DEL FORMULARIO ----------
function validateForm() {
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isCategoryValid = validateCategory();
    const isDeadlineValid = validateDeadline();
    
    return isTitleValid && isDescriptionValid && isCategoryValid && isDeadlineValid;
}

// ---------- FUNCIONES DE PERSISTENCIA (localStorage) ----------
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error al guardar tareas:', error);
    }
}

function loadTasks() {
    try {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            tasks = JSON.parse(stored);
        } else {
            // Datos de ejemplo para demostración
            tasks = [
                {
                    id: Date.now() + 1,
                    title: 'Completar proyecto',
                    description: 'Terminar la mini-aplicación web',
                    category: 'trabajo',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    completed: false
                }
            ];
        }
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        tasks = [];
    }
}

// ---------- GENERACIÓN DE ID ÚNICO ----------
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ---------- FUNCIONES DE RENDERIZADO ----------
function getCategoryIcon(category) {
    const icons = {
        personal: '👤',
        trabajo: '💼',
        estudios: '📚',
        hogar: '🏠',
        salud: '💪',
        otros: '📌'
    };
    return icons[category] || '📌';
}

function getCategoryColor(category) {
    const colors = {
        personal: '#6c757d',
        trabajo: '#007bff',
        estudios: '#28a745',
        hogar: '#ffc107',
        salud: '#dc3545',
        otros: '#17a2b8'
    };
    return colors[category] || '#667eea';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function isOverdue(deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(deadline) < today;
}

function renderTasks() {
    const filteredTasks = currentFilter === 'todas' 
        ? tasks 
        : tasks.filter(task => task.category === currentFilter);
    
    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = '<p class="empty-message">📭 No hay tareas en esta categoría</p>';
        return;
    }
    
    // Ordenar: primero no completadas, luego por fecha
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });
    
    taskListContainer.innerHTML = '';
    
    sortedTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        const categoryColor = getCategoryColor(task.category);
        taskElement.style.borderLeftColor = categoryColor;
        
        const overdue = !task.completed && isOverdue(task.deadline);
        
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.completed ? '✅ ' : ''} ${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-category" style="background: ${categoryColor}">
                        ${getCategoryIcon(task.category)} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    <span class="task-deadline ${overdue ? 'overdue' : ''}">
                        📅 ${formatDate(task.deadline)} ${overdue ? '⚠️ Vencida' : ''}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-complete ${task.completed ? 'completed-btn' : ''}" data-action="toggle">
                    ${task.completed ? '↩️ Reabrir' : '✅ Completar'}
                </button>
                <button class="btn-delete" data-action="delete">🗑️ Eliminar</button>
            </div>
        `;
        
        taskListContainer.appendChild(taskElement);
    });
}

// ---------- FUNCIONES DE MANIPULACIÓN DE TAREAS ----------
function addTask(title, description, category, deadline) {
    const newTask = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        category,
        deadline,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

// ---------- MANEJO DE EVENTOS ----------
// 1. Evento: submit - Agregar tarea
taskForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevenir envío
    
    if (validateForm()) {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const category = categorySelect.value;
        const deadline = deadlineInput.value;
        
        addTask(title, description, category, deadline);
        taskForm.reset();
        // Resetear caracteres contados
        charCount.textContent = '0 / 200 caracteres';
        // Remover clases de error
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        // Resetear mensajes de error
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });
        
        // Mostrar feedback
        const btn = document.getElementById('addTaskBtn');
        const originalText = btn.textContent;
        btn.textContent = '✅ ¡Tarea agregada!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }
});

// 2. Evento: input - Validación en tiempo real
titleInput.addEventListener('input', validateTitle);
descriptionInput.addEventListener('input', function() {
    const length = this.value.length;
    charCount.textContent = `${length} / 200 caracteres`;
    if (length > 200) {
        charCount.style.color = '#dc3545';
    } else {
        charCount.style.color = '#888';
    }
    validateDescription();
});
categorySelect.addEventListener('change', validateCategory);
deadlineInput.addEventListener('change', validateDeadline);

// 3. Evento: change - Filtrar tareas
filterSelect.addEventListener('change', function() {
    currentFilter = this.value;
    renderTasks();
});

// 4. Evento: click (delegación) - Completar/Eliminar tarea
taskListContainer.addEventListener('click', function(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    const taskItem = target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = parseInt(taskItem.dataset.id);
    
    if (target.dataset.action === 'toggle') {
        toggleTaskStatus(taskId);
    } else if (target.dataset.action === 'delete') {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            deleteTask(taskId);
        }
    }
});

// ---------- INICIALIZACIÓN ----------
function init() {
    loadTasks();
    renderTasks();
    
    // Establecer fecha mínima para el input date
    const today = new Date().toISOString().split('T')[0];
    deadlineInput.setAttribute('min', today);
    
    console.log('✅ Aplicación inicializada correctamente');
    console.log(`📊 ${tasks.length} tareas cargadas`);
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);