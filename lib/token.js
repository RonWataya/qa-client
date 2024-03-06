document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const token = document.getElementById('token').value;

    fetch('http://ec2-3-88-156-72.compute-1.amazonaws.com:2000/login', {
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
            window.location.href = 'section-one.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
