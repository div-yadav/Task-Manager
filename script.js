
window.addEventListener('load', () => {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    // selecting elements
    const newTodoForm = document.querySelector('#new-todo-form');
    const filter_dropdown = document.querySelector('#filter_dropdown');
    const filter_select = document.querySelector('#filter_select');
    const filterIcon = document.querySelector('#filter-icon');
    const sortSelect = document.querySelector('#sort-select');
    const searchInput = document.querySelector('#search');
    newTodoForm.addEventListener('submit', e => {
        e.preventDefault();
        const selectedCategory = document.querySelector('#Catagory');
        if (selectedCategory.value === 'Catagories') {
            alert("please select a catagory.");
            return;
        }
        const deadlineInput = e.target.elements.deadline;
        const selectedDeadline = new Date(deadlineInput.value).getTime();

        const todo = {
            content: e.target.elements.content.value,
            category: e.target.elements.Catagory.value,
            done: false,
            createdAt: new Date().getTime(),
            deadline: selectedDeadline
        }

        // const deadlineInput = e.target.elements.deadline;
        // const selectedDeadline = new Date(deadlineInput.value).getTime();

        if (!selectedDeadline) {
            alert("Enter the deadline date");
            return;
        }
        // todo.deadline = selectedDeadline;

        console.log(todo.deadline);
        todos.push(todo);

        localStorage.setItem('todos', JSON.stringify(todos));

        // Reset the form
        e.target.reset();

        DisplayTodos()

    });
    const micIcon = document.querySelector('#mic-icon');
    micIcon.addEventListener('click', () => {
        startVoiceSearch();
    });
    searchInput.addEventListener('input', () => {
        DisplayTodos();
    });
    sortSelect.addEventListener('change', () => {
        DisplayTodos();
    });
    filterIcon.addEventListener('click', () => {
        filter_dropdown.classList.toggle('show');
    });
    filter_select.addEventListener('change', () => {
        DisplayTodos();
    })

    DisplayTodos()
})
function startVoiceSearch() {
    const searchInput = document.querySelector('#search');

    // Check if the browser supports the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US'; // Set the language

        recognition.onstart = () => {
            searchInput.value = ''; // Clear the search input
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim(); // Remove leading/trailing whitespace
            const cleanedTranscript = transcript.replace(/\.$/, ''); // Remove dot at the end

            searchInput.value = cleanedTranscript; // Set the cleaned transcript as the input value
            DisplayTodos();
            
        };

        recognition.onend = () => {
            // Enable the microphone icon after speech recognition ends
            micIcon.disabled = false;
        };

        // Start voice recognition
        recognition.start();

        // Disable the microphone icon while recognizing speech
        micIcon.disabled = true;
    } else {
        console.log("Sorry, your browser doesn't support the Web Speech API.");
    }
}


function DisplayTodos() {
    const searchInput = document.querySelector('#search');
    const searchQuery = searchInput.value.toLowerCase();
    const todoList = document.querySelector('#todo-list');
    const filter_select = document.querySelector('#filter_select');
    const selectFilter = filter_select.value;
    const sortSelect = document.querySelector('#sort-select');
    const selectedSort = sortSelect.value;
    const searchResults = document.querySelector('#search-results');

    todoList.innerHTML = "";
    if (selectedSort === 'created-newest') {
        todos.sort((a, b) => b.createdAt - a.createdAt);
    } else if (selectedSort === 'created-oldest') {
        todos.sort((a, b) => a.createdAt - b.createdAt);
    }
    else if (selectedSort === 'alphabetical-asc') {
        todos.sort((a, b) => a.content.localeCompare(b.content));
    } else if (selectedSort === 'alphabetical-desc') {
        todos.sort((a, b) => b.content.localeCompare(a.content));
    }
    const filter_todo = todos.filter(todo => {
        if (selectFilter === 'complete') {
            return todo.done;
        } else if (selectFilter === 'incomplete') {
            return !todo.done;
        } else if (selectFilter === 'important') {
            return todo.category === 'important';
        } else if (selectFilter === 'work') {
            return todo.category === 'work';
        } else if (selectFilter === 'personal') {
            return todo.category === 'personal';
        }
        return true;
    })




    if (searchResults.textContent.trim() !== '') {
        // Add search results to the display if there are any
        const searchResultsItems = Array.from(searchResults.querySelectorAll('.search-result-item'));
        const searchResultsContent = searchResultsItems.map(item => item.textContent);
        allTodos.push(...searchResultsContent.map(content => ({
            content,
            category: 'search-result', // You can set a specific category for search results
            done: false, // You can set the done status as needed
        })));
    }




    filter_todo.forEach(todo => {
        if (todo.content.toLowerCase().includes(searchQuery)) {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');

            const input = document.createElement('input');
            const content = document.createElement('div');
            const actions = document.createElement('div');
            const edit = document.createElement('button');
            const deleteButton = document.createElement('button');
            const complete = document.createElement('button');
            const category = document.createElement('div');

            content.classList.add('todo-content');
            actions.classList.add('actions');
            edit.classList.add('edit');
            deleteButton.classList.add('delete');
            category.classList.add('todo-category');
            const remainingTimeP = document.createElement('p');
            remainingTimeP.classList.add('remaining-time');

            if (todo.deadline) {
                const formattedDeadline = new Date(todo.deadline);
                const formattime = formattedDeadline.toLocaleTimeString(undefined, { timeZone: 'Asia/Kolkata' })
                const formatdate = formattedDeadline.toLocaleDateString(undefined, { timeZone: 'Asia/Kolkata' })
                remainingTimeP.textContent = `Deadline: ${formatdate} ${formattime}`;
            } else {
                remainingTimeP.textContent = 'No Deadline';
            }

            todoItem.appendChild(remainingTimeP);

            content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
            edit.innerHTML = '<i class="fa-solid fa-pen-to-square fa-2xl" style="color: #000000;"></i>';
            category.textContent = `${todo.category}`;
            deleteButton.innerHTML = '<i class="fa-solid fa-trash-can fa-2xl" style="color: #000000;"></i>';
            complete.innerHTML = '<i class="fa-regular fa-circle-check fa-2xl" style="color: #000000;"></i>';

            actions.appendChild(edit);
            actions.appendChild(deleteButton);
            actions.appendChild(complete);

            todoItem.appendChild(content);
            todoItem.appendChild(actions);
            todoItem.appendChild(category);
            todoList.appendChild(todoItem);



            edit.addEventListener('click', (e) => {
                const input = content.querySelector('input');
                input.removeAttribute('readonly');
                input.focus();
                input.addEventListener('blur', (e) => {
                    input.setAttribute('readonly', true);
                    todo.content = e.target.value;
                    localStorage.setItem('todos', JSON.stringify(todos));
                    DisplayTodos()

                })
            })

            deleteButton.addEventListener('click', (e) => {
                todos = todos.filter(t => t != todo);
                localStorage.setItem('todos', JSON.stringify(todos));
                DisplayTodos()
            })
            complete.addEventListener('click', () => {
                todo.done = !todo.done;
                localStorage.setItem('todos', JSON.stringify(todos));
                DisplayTodos();
            });




            if (todo.done) {
                content.querySelector('input').style.textDecoration = 'line-through';
            } else {
                content.querySelector('input').style.textDecoration = 'none';
            }
        }
    });
}
