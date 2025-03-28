document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
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
});