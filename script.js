const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';

loadTasks();

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('input', updateAddButton);

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        currentFilter = this.dataset.filter;
        showTasks();
    });
});

function updateAddButton() {
    addBtn.disabled = taskInput.value.trim() === '';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 2000; 
}

async function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        return;
    }
    
    taskInput.disabled = true;
    addBtn.disabled = true;
    addBtn.innerHTML = '<div class="spinner"></div>';
    
    try {
        await delay(getRandomDelay());
        
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        tasks.push(newTask);
        taskInput.value = '';
        saveTasks();
        showTasks();
    } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
    } finally {
        taskInput.disabled = false;
        updateAddButton();
        addBtn.innerHTML = 'Добавить';
    }
}

async function toggleTask(id) {
    const taskItem = document.querySelector(`[data-task-id="${id}"]`);
    if (!taskItem) return;

    const deleteBtn = taskItem.querySelector('.delete-btn');
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    
    if (deleteBtn) deleteBtn.disabled = true;
    if (checkbox) {
        checkbox.style.display = 'none';
        const spinner = document.createElement('div');
        spinner.className = 'spinner small';
        checkbox.parentNode.insertBefore(spinner, checkbox);
    }
    
    try {
        await delay(getRandomDelay());
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
        
        saveTasks();
        showTasks();
    } catch (error) {
        console.error('Ошибка при переключении задачи:', error);
    }
}

async function deleteTask(id) {
    const taskItem = document.querySelector(`[data-task-id="${id}"]`);
    if (!taskItem) return;
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    
    if (checkbox) checkbox.disabled = true;
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
        const spinner = document.createElement('div');
        spinner.className = 'spinner small';
        deleteBtn.parentNode.appendChild(spinner);
    }
    
    try {
        await delay(getRandomDelay());
        
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        showTasks();
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
    }
}

function showTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.setAttribute('data-task-id', task.id);
            
            if (task.completed) {
                li.classList.add('completed');
            }
            
            li.innerHTML = `
                <div class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                </div>
                <span class="task-text">${task.text}</span>
                <button class="delete-btn">Удалить</button>
            `;
            
            const checkbox = li.querySelector('input');
            const deleteBtn = li.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTask(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(li);
        });
    }
    
    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    
    totalTasksSpan.textContent = `Всего: ${total}`;
    completedTasksSpan.textContent = `Выполнено: ${completed}`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    updateAddButton();
    showTasks();
}