document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const token = document.getElementById('token').value;
    const api = atob(encodedUrl);

    fetch(`${api}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect to home if login is successful
            window.location.href = 'answers.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch((error) => {
        alert('Check Network: ');
        console.error('Error:', error);
    });
});
