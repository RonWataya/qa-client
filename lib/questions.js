

//documents
document.addEventListener('DOMContentLoaded', function () {
    const documentSelect = document.getElementById('documentSelect');
    const searchInput = document.getElementById('searchPhrase');
    const paragraphList = document.querySelector('.my-paragraph-list');
    const contextList = document.getElementById('contextList');
    const addToContextBtn = document.getElementById('addToContextBtn');

    var modal = document.getElementById("modal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close-button")[0];

    // Function to open the modal with a specific message
    function openModal(message) {
        document.getElementById('modal-text').innerText = message;
        modal.style.display = "block";
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = "none";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        closeModal();
    }

    // When the user clicks anywhere outside of the modal content, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            closeModal();
        }
    }


    function loadDocuments() {
        fetch('http://ec2-3-88-156-72.compute-1.amazonaws.com:2000/getDocuments')
            .then(response => response.json())
            .then(documents => {
                documents.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.DOC_ID;
                    option.textContent = doc.TITLE;
                    documentSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading documents:', error));
    }

    function loadParagraphs(docId) {
        fetch(`http://ec2-3-88-156-72.compute-1.amazonaws.com:2000/getParagraphs?docId=${docId}`)
            .then(response => response.json())
            .then(paragraphs => displayParagraphs(paragraphs))
            .catch(error => console.error('Error:', error));
    }

    function displayParagraphs(paragraphs) {
        paragraphList.innerHTML = ''; // Clear current list

        paragraphs.forEach(paragraph => {
            const li = document.createElement('li');
            li.className = 'paragraph-item';
            const div = document.createElement('div');
            div.className = 'my-contact-cont';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.setAttribute('data-doc-id', paragraph.DOC_ID);
            input.setAttribute('data-parag-id', paragraph.PARAG_ID);
            const span = document.createElement('span');
            span.textContent = `Parag ${paragraph.PARAG_ID}: ${paragraph.PARAG_TEXT.substring(0, 10000)}`;

            div.appendChild(input);
            div.appendChild(span);
            li.appendChild(div);
            paragraphList.appendChild(li);
        });
        // Call the function to grey out paragraphs already in context
        updateParagraphListWithExistingContext();
    }

    function filterParagraphs(searchTerm) {
        const paragraphs = document.querySelectorAll('.paragraph-item');
        paragraphs.forEach(paragraph => {
            const text = paragraph.innerText.toLowerCase();
            paragraph.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    documentSelect.addEventListener('change', function () {
        loadParagraphs(this.value);
    });

    searchInput.addEventListener('input', function () {
        filterParagraphs(this.value.toLowerCase());
    });

    addToContextBtn.addEventListener('click', function () {
        const selectedParagraphs = document.querySelectorAll('.my-paragraph-list input[type="checkbox"]:checked:not([data-in-context])');
        selectedParagraphs.forEach(checkbox => {
            const docId = checkbox.getAttribute('data-doc-id');
            const paragId = checkbox.getAttribute('data-parag-id');
            const uniqueId = `${docId}-${paragId}`;

            // Retrieve the paragraph text. Assuming the text is the sibling span's content.
            const paragTextSpan = checkbox.nextElementSibling; // The span that holds the paragraph text.
            const paragText = paragTextSpan.textContent;

            // Check if the uniqueId already exists in the context list
            if (!document.querySelector(`#contextList [data-unique-id="${uniqueId}"]`)) {
                let docEntry = document.createElement('li');
                docEntry.setAttribute('data-unique-id', uniqueId); // Set a unique identifier attribute
                docEntry.dataset.docId = docId; // Store the docId as dataset
                docEntry.dataset.paragId = paragId; // Store the paragId as dataset

                // Format to match the loadContext display: "Doc ID: Paragraph ID Paragraph text"
                docEntry.textContent = `Doc ${docId}: ${paragId} -- ${paragText}`;

                const removeCheckbox = document.createElement('input');
                removeCheckbox.type = 'checkbox';
                removeCheckbox.classList.add('mr-10');
                removeCheckbox.dataset.docId = docId;
                removeCheckbox.dataset.paragId = paragId;
                docEntry.appendChild(removeCheckbox);

                contextList.appendChild(docEntry);

                checkbox.closest('li').style.backgroundColor = '#D3D3D3';
                checkbox.setAttribute('data-in-context', 'true');
            }
        });
    });
    ;


    contextList.addEventListener('change', function (e) {
        if (e.target.type === 'checkbox' && e.target.checked) {
            const docId = e.target.dataset.docId;
            const paragId = e.target.dataset.paragId;
            let docEntry = Array.from(contextList.children).find(entry => entry.dataset.docId === docId && entry.textContent.includes(paragId));
            if (docEntry) {
                docEntry.remove();

                const correspondingCheckbox = document.querySelector(`.my-paragraph-list input[data-doc-id="${docId}"][data-parag-id="${paragId}"]`);
                if (correspondingCheckbox) {
                    correspondingCheckbox.closest('li').style.backgroundColor = '';
                    correspondingCheckbox.removeAttribute('data-in-context');
                    correspondingCheckbox.checked = false;
                }
                updateButtonStates();
            }
        }
    });

    //trigger changes
    

    paragraphList.addEventListener('change', function (e) {
        if (e.target.type === 'checkbox' && !e.target.checked && e.target.getAttribute('data-in-context') === 'true') {
            const docId = e.target.getAttribute('data-doc-id');
            const paragId = e.target.getAttribute('data-parag-id');

            // Remove corresponding entry from contextList
            let correspondingCheckboxInContext = contextList.querySelector(`input[data-doc-id="${docId}"][data-parag-id="${paragId}"]`);
            if (correspondingCheckboxInContext) {
                correspondingCheckboxInContext.closest('li').remove();
            }

            e.target.closest('li').style.backgroundColor = '';
            e.target.removeAttribute('data-in-context');
        }
    });

    //Update paragraphs already loaded
    function updateParagraphListWithExistingContext() {
        const contextItems = document.querySelectorAll('.my-context-list li');
        contextItems.forEach(contextItem => {
            const docId = contextItem.dataset.docId;
            const paragId = contextItem.dataset.paragId;
            const paragraphCheckbox = document.querySelector(`.my-paragraph-list input[data-doc-id="${docId}"][data-parag-id="${paragId}"]`);
            if (paragraphCheckbox) {
                paragraphCheckbox.closest('li').style.backgroundColor = '#D3D3D3'; // Grey out the paragraph
                paragraphCheckbox.setAttribute('data-in-context', 'true'); // Mark as in context
            }
        });
    }

    //Fetching paragraphs into combined string
    document.getElementById('generate-answer').addEventListener('click', function () {
        const contextItems = document.querySelectorAll('.my-context-list li'); // Select all list items in the context list
        let combinedText = '';

        contextItems.forEach(item => {
            // Extracting text from each item. Assuming the format "Doc ID: Paragraph ID - Paragraph text"
            const itemText = item.textContent.split('--').pop().trim(); // This will get the text after the last '-' which should be the paragraph text
            combinedText += itemText + ' '; // Append each paragraph text to the combinedText string
        });

        // Set the combinedText as the value of the newanswerBox textarea
        document.getElementById('newanswerBox').value = combinedText.trim();
    });

   
   
    
    document.getElementById('create').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default form action

        const questionText = document.getElementById('questionBox').value;
        const answerText = document.getElementById('newanswerBox').value;
        const contextItems = document.querySelectorAll('.my-context-list li');

        // Validate question text and answer text are not empty
        if (!questionText) {
            alert('Question text cannot be empty.');
            return; // Stop execution
        }

        if (!answerText) {
            alert('Answer text cannot be empty.');
            return; // Stop execution
        }

        const contextData = Array.from(contextItems).map(item => {
            const docId = item.dataset.docId; // Assuming this is always set
            const paragId = item.dataset.paragId; // Assuming this is always set

            if (!docId || !paragId) {
                console.error('Error: Missing docId or paragId in context item.', item);
                throw new Error('Missing docId or paragId in context item.');
            }

            return {
                docId: parseInt(docId, 10),
                paragId: parseInt(paragId, 10)
            };
        });

        // Check if contextData is empty
        if (contextData.length === 0) {
            alert('Context data cannot be empty.');
            return; // Stop execution
        }
        const data = {
            questionText,
            answerText,
            contextData // This is the array of docId and paragId
        };

        console.log('Sending data:', data); // Debugging line

        fetch('http://ec2-3-88-156-72.compute-1.amazonaws.com:2000/create-question-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Response data:', data); // Debugging line
                if (data.success) {
                    openModal('New question and answer saved successfully.');
                } else {
                    openModal('Failed to save the question and answer. Reason: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                openModal('An error occurred while saving the question and answer.');
            });
    });

    loadDocuments();
});



//check button states of create QA and Update answer


document.addEventListener('DOMContentLoaded', function () {
    function updateButtonStates() {
        const contextList = document.getElementById('contextList');
        const buttons = document.querySelectorAll('.button-inactive');

        if (contextList.children.length > 0) {
            // Enable buttons
            buttons.forEach(button => {
                button.classList.remove('button-inactive');
                button.style.pointerEvents = "auto";
                button.style.opacity = "1";
            });
        } else {
            // Disable buttons
            buttons.forEach(button => {
                button.classList.add('button-inactive');
                button.style.pointerEvents = "none";
                button.style.opacity = "0.5";
            });
        }
    }
    // Observer configuration: watch for child list changes
    const config = { childList: true };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Call updateButtonStates on any mutation
        updateButtonStates();
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    const targetNode = document.getElementById('contextList');
    observer.observe(targetNode, config);

    // Perform an initial check to set the correct state of the buttons
    updateButtonStates();
});

$(document).ready(function () {
    $("#generate-question").click(function () {
        var contexts = [];
        $("#contextList").find("li").each(function () {
            contexts.push($(this).text()); // Assuming your contexts are in <li> tags
        });

        // Replace this URL with your actual endpoint for generating questions
        var apiUrl = "http://localhost:3000/generate-questions";
        $.ajax({
            type: "POST",
            url: apiUrl,
            data: JSON.stringify({ contexts: contexts }),
            contentType: "application/json",
            success: function (response) {
                // Assuming response is an array of questions
                var questions = response.questions;
                displayQuestions(questions);
            },
            error: function (xhr, status, error) {
                console.error("Error generating questions: ", error);
            }
        });
    });

    var currentQuestionIndex = 0;
    var questionsCache = [];

    function displayQuestions(questions) {
        if (questions.length === 0) {
            alert("No questions were generated.");
            return;
        }
        questionsCache = questions;
        currentQuestionIndex = 0;
        $("#questionsBox").val(questions[0]); // Display the first question

        // For example, a 'Next' button handler
        $("#nextQuestion").click(function () {
            if (currentQuestionIndex < questionsCache.length - 1) {
                currentQuestionIndex++;
                $("#questionsBox").val(questionsCache[currentQuestionIndex]);
            } else {
                alert("This is the last question.");
            }
        });

        // Implementing 'Previous' button
        $("#prevQuestion").click(function () {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                $("#questionsBox").val(questionsCache[currentQuestionIndex]);
            } else {
                alert("This is the first question.");
            }
        });

        // Similarly, you can implement a 'Previous' button
    }
});
// Make sure to call updateButtonStates() whenever the contents of #contextList change.







