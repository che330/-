// 待办事项应用核心逻辑
// 使用 localStorage 做数据持久化，刷新页面不丢失

let todos = JSON.parse(localStorage.getItem('todos') || '[]');
let currentFilter = 'all';

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const statsText = document.getElementById('stats-text');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

// 初始化渲染
render();

// 添加任务
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
});

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    todoInput.value = '';
    saveAndRender();
}

// 切换完成状态
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveAndRender();
    }
}

// 删除任务
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveAndRender();
}

// 筛选切换
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// 清除已完成
clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
    saveAndRender();
});

// 保存到 localStorage 并重新渲染
function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    render();
}

// 渲染列表
function render() {
    let filtered = todos;
    if (currentFilter === 'active') {
        filtered = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = todos.filter(t => t.completed);
    }

    todoList.innerHTML = '';

    if (filtered.length === 0) {
        todoList.innerHTML = '<div class="empty-state">暂无任务，添加一个吧 ✨</div>';
    } else {
        filtered.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (todo.completed ? ' completed' : '');
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-btn">×</button>
            `;

            li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(li);
        });
    }

    // 更新统计
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    statsText.textContent = `共 ${total} 项任务，${completed} 项已完成`;
}

// 防止 XSS，转义 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
