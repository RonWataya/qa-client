
// Document ready function for handling question management
$(document).ready(function () {
    let currentQuestionIndex = 0;
    let questionsCache = [];

    function updateQuestionDisplay() {
        $("#questionsBox").val(questionsCache[currentQuestionIndex]);
        $("#prevQuestion").prop('disabled', currentQuestionIndex === 0);
        $("#nextQuestion").prop('disabled', currentQuestionIndex === questionsCache.length - 1);
    }

    $("#generate-question").click(function () {
        var contexts = [];
        $("#contextList").find("li").each(function () {
            contexts.push($(this).text());
        });

        $.ajax({
            type: "POST",
            url: "http:///ec2-3-88-156-72.compute-1.amazonaws.com:2000/generate-questions", // Update this to your actual backend endpoint
            contentType: "application/json",
            data: JSON.stringify({ contexts: contexts }),
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

//logout
