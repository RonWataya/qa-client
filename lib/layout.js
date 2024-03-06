document.addEventListener('DOMContentLoaded', function() {
    // Login check
    (function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'index.html'; // Redirect if not "logged in"
        }
    })();

   
    

    // Optional: Additional event listeners, like closing suggestions, can be added here
    var closeSuggestionsButton = document.getElementById('closeSuggestions');
    if (closeSuggestionsButton) {
        closeSuggestionsButton.addEventListener('click', function() {
            document.getElementById('suggestions').style.display = 'none';
        });
    }
});
 