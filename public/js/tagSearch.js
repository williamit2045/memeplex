//public/cs/tagSearch.js
async function searchTags() {
    const input = document.getElementById('tagSearchInput');
    const dropdown = document.getElementById('tagDropdown');
    const query = input.value.trim();

    // Hide dropdown if input is empty
    if (!query) {
        dropdown.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(`/tags/search?query=${query}`);
        const tags = await response.json();

        // Clear previous results
        dropdown.innerHTML = '';

        if (tags.length > 0) {
            tags.forEach(tag => {
                const li = document.createElement('li');
                li.textContent = tag.name;
                li.onclick = () => {
                    window.location.href = `/tags/${tag.id}`;
                };
                dropdown.appendChild(li);
            });

            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching tags:', error);
    }
}
