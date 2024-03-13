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

document.addEventListener('DOMContentLoaded', function () {
    var menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(function (item) {
        item.addEventListener('click', function () {
            // Remove 'active' class from all menu links
            document.querySelectorAll('.menu-link').forEach(function (link) {
                link.classList.remove('active');
            });

            // Add 'active' class to clicked menu link
            this.querySelector('.menu-link').classList.add('active');
        });
    });
});
 