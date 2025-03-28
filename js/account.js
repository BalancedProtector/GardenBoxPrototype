document.addEventListener('DOMContentLoaded', () => {
    const userDataContainer = document.getElementById('user-data');

    //retrieve from localStorage
    const userData = JSON.parse(localStorage.getItem('userChoices'));
    if (userData) {
        //create a list to display data?
        const userDataList = document.createElement('ul');
        for (const [key, value] of Object.entries(userData)) {
            const listItem = document.createElement('li');
            listItem.textContent = `${key}: ${value}`;
            UserDataList.appendChild(listItem);
        }
        //append the list to the container
        userDataContainer.appendChild(userDataList);
    } else {
        //Display a message if no data is found
        userDataContainer.textContent = 'No Data Found';
    }
});