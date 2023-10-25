// Глобальные переменные
const todoElement = document.getElementById('todo-list')
const userTodo = document.querySelector('#user-todo');
const form = document.querySelector('form');
let todoList = [];
let userList = [];

// События
document.addEventListener('DOMContentLoaded', initialize);
form.addEventListener('submit', todoSend);

// Вспомогательные
function getUsername(userId) {
    const user = userList.find(user => user.id === userId);
    return user.name;

}

// Функции рендера

function renderUser(user) {
    const option = document.createElement('option');
    option.value = user.id;
    option.innerHTML = user.name;
    userTodo.append(option);
}

function renderTodo(todo) {
    const {id, userId, title, complete} = todo;
    const li = document.createElement('li');
    li.dataset.id = id;
    li.innerHTML = `
                    <span>by <b>${getUsername(userId)}</b></span>
                    `

    const label = document.createElement('label')
    const innerTitle = document.createElement('span')
    innerTitle.innerHTML = title

    const option = document.createElement('input')
    option.type = 'checkbox'
    option.checked = complete
    option.addEventListener('change', todoChange)

    label.prepend(option)
    label.append(innerTitle)

    const close = document.createElement('span')
    close.innerHTML = '&times'
    close.className = 'close'
    close.addEventListener('click', todoDelete)

    li.prepend(label)
    li.append(close)
    todoElement.prepend(li);
}

function unRenderTodo(todoId) {
    todoList = todoList.filter(todo => todo.id !== todoId)
    const todo = todoElement.querySelector(`[data-id="${todoId}"]`)

    todo.querySelector('[type="checkbox"]').removeEventListener('change', todoChange)
    todo.querySelector('.close').removeEventListener('click', todoDelete)

    todo.remove();

}

// Функции событий
function initialize() {
    console.log('Страница загружена')

    Promise.all([getUsers(), getTodos()])
        .then(([users, todos]) => {
            todoList = todos
            userList = users
            //     Отрисовка
            todos.forEach((todo) => renderTodo(todo))
            users.forEach((user) => renderUser(user))
        });
}

function todoSend(event) {
    event.preventDefault();

    newTodo({
        userId: Number(form.user.value),
        title: form.todo.value,
        completed: false
    });
}

function todoChange() {
    const todoId = this.parentElement.parentElement.dataset.id;
    const completed = this.checked;

    toggleCompleteTodo(todoId, completed)
}

function todoDelete() {
    const todoId = this.parentElement.dataset.id;

    deleteTodo(todoId)
}

// Запросы
async function getUsers() {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    return await res.json();
}

async function getTodos() {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    return await res.json();
}

async function newTodo(todo) {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify({todo}),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const newTodo = await res.json();
    renderTodo(newTodo.todo)
}

async function toggleCompleteTodo(todoId, completed) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: 'PATCH',
        body: JSON.stringify({completed: completed}),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    console.log(data)

    if (!res.ok) {
        console.error('')
    }
}

async function deleteTodo(todoId) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.ok) {
        unRenderTodo(todoId)
    }

}

