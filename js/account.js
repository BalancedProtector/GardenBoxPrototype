document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // If no token, redirect to login page
        alert('Please login to access your account');
        window.location.href = 'login.html';
        return;
    }
    try {
        const response = await fetch('https://localhost:3000/account', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        if (response.ok) {
            const userDataContainer = document.getElementById('user-data');
            userDataContainer.innerHTML = `
                <h3>Welcome, ${data.user.name}</h3>
                <p>Email: ${data.user.email}</p>
                <p>Growing Zone: ${data.user.growingZone || 'Not set'}</p>
                <p>Preferences:</p>
                <ul>
                    <li>Fruits: ${data.user.preferences?.fruits?.join(', ') || 'None'}</li>
                    <li>Vegetables: ${data.user.preferences?.vegetables?.join(', ') || 'None'}</li>
                    <li>Herbs: ${data.user.preferences?.herbs?.join(', ') || 'None'}</li>
                </ul>
            `;
        } else {
            alert(data.message);
            window.location.href = 'login.html'; // Redirect to login page
        }
    } catch (error) {
        console.error('Error fetching account data:', error);
        alert('An error occurred while fetching account data. Please try again.');
    }
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html'; // Redirect to login page
    });
});