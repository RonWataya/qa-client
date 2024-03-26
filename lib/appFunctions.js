
// Document ready function for handling question management
$(document).ready(function () {
    //Configuration
    const api = atob(encodedUrl);

    //variables
    let currentQuestionIndex = 0;
    let questionsCache = [];

    function updateQuestionDisplay() {
        $("#questionsBox").val(questionsCache[currentQuestionIndex]);
        $("#prevQuestion").prop('disabled', currentQuestionIndex === 0);
        $("#nextQuestion").prop('disabled', currentQuestionIndex === questionsCache.length - 1);
    }

    $("#generate-question").click(function () {

        // Validate number of questions
        var numberOfQuestions = $("#numberOfQuestions").val();
        if (!numberOfQuestions || numberOfQuestions < 1) {
            alert("Please enter a valid number of questions.");
            return; // Stop execution if validation fails
        }
        
        // Validate at least one checkbox is selected
        var isCheckboxSelected = $("input[name='questionType']:checked").length > 0;
        if (!isCheckboxSelected) {
            alert("Please select at least one question type.");
            return; // Stop execution if validation fails
        }

        var contexts = [];
        $("#contextList").find("li").each(function () {
            contexts.push($(this).text());
        });
    
        
        
    
        // Get the selected question types
        let questionTypes = [];
        $("input[name='questionType']:checked").each(function () {
            questionTypes.push($(this).val());
        });
    
        $.ajax({
            type: "POST",
            url: `${api}/generate-questions`,
            contentType: "application/json",
            data: JSON.stringify({ contexts: contexts, numberOfQuestions: numberOfQuestions, questionTypes: questionTypes }),
            success: function (response) {
                questionsCache = response.questions;
                currentQuestionIndex = 0;
                updateQuestionDisplay();
            },
            error: function () {
                alert("Failed to generate questions.");
            }
        });
    });
    ;

    $("#nextQuestion").click(function () {
        if (currentQuestionIndex < questionsCache.length - 1) {
            currentQuestionIndex++;
            updateQuestionDisplay();
        }
    });

    $("#prevQuestion").click(function () {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestionDisplay();
        }
    });
});

// Function for handling the copying to draft feature
document.getElementById('copy-to-draft').addEventListener('click', function (event) {
    event.preventDefault();

    const questionText = document.getElementById('questionsBox').value;
    const answerText = document.getElementById('answersBox').value;
    const contextItems = document.querySelectorAll('.my-context-list li');

    if (!questionText || !answerText) {
        alert('Question and/or answer text cannot be empty.');
        return;
    }

    let contextMap = new Map();
    contextItems.forEach(item => {
        const docId = item.dataset.docId;
        const paragId = item.dataset.paragId;
        if (!contextMap.has(docId)) {
            contextMap.set(docId, []);
        }
        contextMap.get(docId).push(paragId);
    });

    let contextStr = Array.from(contextMap).map(([docId, paragIds]) => `DOC ${docId}:${paragIds.join(',')}`).join('; ');

    const draftTableBody = document.querySelector('.table.table-inner.table-vmiddle tbody');
    const newRow = draftTableBody.insertRow();
    const questionCell = newRow.insertCell(0);
    const answerCell = newRow.insertCell(1);
    const contextCell = newRow.insertCell(2);

    questionCell.textContent = questionText;
    answerCell.textContent = answerText;
    contextCell.textContent = contextStr;
});

// Functions for exporting the table to Excel and printing
function exportTableToExcel() {
    let table = document.getElementById("draftTable");
    let workbook = XLSX.utils.table_to_book(table, { sheet: "Draft" });
    XLSX.writeFile(workbook, "DraftPreview.xlsx");
}

document.getElementById("preview").addEventListener("click", event => {
    event.preventDefault();
    exportTableToExcel();
});

function printTable() {
    window.print();
}

document.getElementById("print").addEventListener("click", event => {
    event.preventDefault();
    printTable();
});

//edit mode
$(document).ready(function () {
    var editModeEnabled = false; // Track whether edit mode is enabled

    $("#edit-mode").click(function () {
        editModeEnabled = !editModeEnabled; // Toggle edit mode state

        if (editModeEnabled) {
            // If edit mode is enabled, remove readonly attribute and change button color
            $("#answersBox").removeAttr("readonly");
            $(this).removeClass("btn-secondary").addClass("btn-primary");
        } else {
            // If edit mode is disabled, add readonly attribute and revert button color
            $("#answersBox").attr("readonly", "readonly");
            $(this).removeClass("btn-primary").addClass("btn-secondary");
        }
    });
});

