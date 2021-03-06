// creates variables for all the necessary sections and uses
// the data class to access them in the HTML
const listContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListButton = document.querySelector('[data-delete-list-button]');
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById("task-template")
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTasksButton = document.querySelector("[data-clear-complete-tasks-button]")

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

//goes to the list you clicked
listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listId;
        saveAndRender();
    }
})

//checks the list item off and sets to completed
tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'checkbox') {
        const selectedList = lists.find(list => list.id === selectedListId);
        const targetId = e.target.id.split('-')[1];
        const selectedTask = selectedList.tasks.find(task => task.id === targetId);
        selectedTask.complete = e.target.checked;
        const selector = `.a${targetId}`;
        const inputEditElement = document.querySelector(selector, 'input');
        if (e.target.checked) {
            //add class to input that crosses out text
            inputEditElement.classList.add('crossOutText');
        }
        else {
            //removes class that crosses out text on click
            inputEditElement.classList.remove('crossOutText')
        }
        save();
        renderTaskCount(selectedList);
    }
})


clearCompleteTasksButton.addEventListener('click', () => {
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveAndRender()
})

deleteListButton.addEventListener('click', () => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null;
    saveAndRender();
})

function enableEditOrDeleteButtons(taskId) {
    const deleteTaskButton = document.getElementById('delete-' + taskId);
    // const editTaskButton = document.querySelector("[data-edit-task]")
    deleteTaskButton.addEventListener('click', () => {
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks = selectedList.tasks.filter(task => task.id !== taskId)
        saveAndRender();
    })
    // editTaskButton.addEventListener('onkeyup', (value) => {
    //     const selectedList = lists.find(list => list.id === selectedListId);
    //     selectedList.tasks = selectedList.tasks.localStorage(value);
    //     saveAndRender();
    // })
}

newListForm.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value
    if (listName == null || listName === '') {
        return
    }
    const list = createList(listName)
    newListInput.value = null;
    lists.push(list);
    saveAndRender();
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') {
        return
    }
    const task = createTask(taskName)
    newTaskInput.value = null;
    const selectedList = lists.find(list => list.id === selectedListId);
    selectedList.tasks.push(task);
    saveAndRender();
})

function createList(name) {
    return { id: Date.now().toString(), name: name, tasks: [] };
}

function createTask(name) {
    return { id: Date.now().toString(), name: name, complete: false };
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function saveAndRender() {
    save()
    render()
}

function render() {
    clearElement(listContainer);
    renderLists();

    const selectedList = lists.find(list => list.id === selectedListId);

    if (selectedListId == null) {
        listDisplayContainer.style.display = 'none';
    } else {
        listDisplayContainer.style.display = '';
        listTitleElement.innerText = selectedList.name;
        renderTaskCount(selectedList);
        clearElement(tasksContainer);
        renderTasks(selectedList)
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector("[data-checkbox]");
        const deleteButton = taskElement.querySelector('[data-delete-task]');
        checkbox.id = 'checkbox-' + task.id;
        checkbox.checked = task.complete;
        deleteButton.id = 'delete-' + task.id;
        const taskInput = taskElement.querySelector("[data-edit-task]");
        taskInput.id = task.id;
        taskInput.value = task.name;
        taskInput.classList.add(`a${task.id}`);
        tasksContainer.appendChild(taskElement);
        enableEditOrDeleteButtons(task.id);
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    const taskString = incompleteTaskCount === 1 ? 'task' : 'tasks'
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li');
        listElement.dataset.listId = list.id
        listElement.classList.add('list-name');
        listElement.innerText = list.name;
        if (list.id === selectedListId) {
            listElement.classList.add('active-list')
        }
        listContainer.appendChild(listElement)
    })
}

//clears completed tasks
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}
render();
