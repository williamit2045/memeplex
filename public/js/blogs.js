//public/js/blogs.js
document.addEventListener('DOMContentLoaded', () => {
    const sortByDropdown = document.getElementById('sortBy');
    const searchTopicInput = document.getElementById('searchTopic');
    const contentCards = document.getElementById('content-cards');

    // Show or hide the search input based on the selected sort option
    sortByDropdown.addEventListener('change', (e) => {
        if (e.target.value === 'topic') {
            searchTopicInput.classList.remove('hidden');
        } else {
            searchTopicInput.classList.add('hidden');
        }
    });
    // Event listener for sorting functionality
    sortByDropdown.addEventListener('change', async (e) => {
        const sortBy = e.target.value;
        // Fetch sorted blogs from the server
        const response = await fetch(`/blogs/sort?sortBy=${sortBy}`);
        const sortedBlogs = await response.json();
        // Clear existing cards
        contentCards.innerHTML = '';
        // Render new sorted blogs
        sortedBlogs.forEach(blog => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <h2><a href="/view/${blog.id}">${blog.title}</a></h2>
                <p>${blog.body}</p>
                <p class="date">Posted ${new Date(blog.created_at).toLocaleDateString()}</p>
                <p>Tags: ${blog.tag_count}</p>
            `;
            contentCards.appendChild(card);
        });
    });
});
