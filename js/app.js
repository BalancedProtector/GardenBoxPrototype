import Papa from 'papaparse'; // Import the PapaParse library

document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    // Attach event listeners to all forms
    forms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            // If the form includes a "growing-zone" field, process the CSV
            if (data['zone']) {
                const zipcode = data['zone'];
                const zone = await findZoneFromCSV(zipcode);

                if (zone) {
                    data['zone'] = zone; // Attach the zone to the user data
                    console.log(`Zipcode: ${zipcode}, Zone: ${zone}`);
                } else {
                    alert('Zipcode not found in the database. Please try again.');
                    return; // Stop further execution if the zipcode is invalid
                }
            }

            // Handle preferences form submission
            if (form.id === 'preference-form') {
                await updatePreferences();
            }

            // Save the user data to localStorage
            localStorage.setItem('userChoices', JSON.stringify(data));

            // Redirect to the next page
            window.location.href = form.action;
        });
    });

    // Function to fetch and parse the CSV file
    async function findZoneFromCSV(zipcode) {
        try {
            const response = await fetch('data/zones.csv'); // Adjust the path to your CSV file
            const csvText = await response.text();

            // Use PapaParse to parse the CSV
            const parsedData = Papa.parse(csvText, {
                header: true, // Treat the first row as headers
                skipEmptyLines: true, // Skip empty lines
            });

            // Find the matching zone for the given zipcode
            const match = parsedData.data.find(entry => entry.zipcode === zipcode);
            return match ? match.zone : null; // Return the zone or null if not found
        } catch (error) {
            console.error('Error loading or parsing the CSV file:', error);
            return null;
        }
    }

    // Function to update preferences
    async function updatePreferences() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be signed in to submit preferences.');
            window.location.href = 'login.html'; // Redirect to login page
            return;
        }

        // Collect selected preferences from checkboxes
        const fruits = Array.from(document.querySelectorAll('input[name="fruits"]:checked')).map(input => input.value);
        const vegetables = Array.from(document.querySelectorAll('input[name="vegetables"]:checked')).map(input => input.value);
        const herbs = Array.from(document.querySelectorAll('input[name="herbs"]:checked')).map(input => input.value);
        const flowers = Array.from(document.querySelectorAll('input[name="flowers"]:checked')).map(input => input.value);

        const preferences = { fruits, vegetables, herbs, flowers };

        try {
            const response = await fetch('http://localhost:8888/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ preferences }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = 'gardener-test.html'; // Redirect to the next test
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert('An error occurred. Please try again.');
        }
    }
});